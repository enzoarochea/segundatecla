/**
 * Catalog filters <-> URL search params. Pure functions, unit tested.
 * Params: marca, ram, almacenamiento, min, max, grado, uso, orden.
 * Repeated keys (?ram=8&ram=16) and comma lists (?ram=8,16) both work.
 */
import { GRADE_KEYS, USE_KEYS, type Grade, type Use } from "@/config/brand";
import type { Prisma } from "@/generated/prisma/client";

export const SORTS = {
  recientes: "Recién llegadas",
  "precio-asc": "Precio: menor a mayor",
  "precio-desc": "Precio: mayor a menor",
  bateria: "Mejor batería",
} as const;
export type Sort = keyof typeof SORTS;

export type Filters = {
  brands: string[];
  ram: number[];
  storage: number[];
  min?: number;
  max?: number;
  grades: Grade[];
  uses: Use[];
  sort: Sort;
};

export type RawParams = Record<string, string | string[] | undefined>;

const MAX_VALUES = 12;
const MAX_PRICE = 1_000_000;

function list(v: string | string[] | undefined): string[] {
  const arr = Array.isArray(v) ? v : v ? [v] : [];
  return [...new Set(arr.flatMap((s) => s.split(",")).map((s) => s.trim()).filter(Boolean))].slice(0, MAX_VALUES);
}

function ints(v: string | string[] | undefined): number[] {
  return list(v)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0 && n <= 8192)
    .sort((a, b) => a - b);
}

function price(v: string | string[] | undefined): number | undefined {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return undefined;
  const n = Math.round(Number(s.replace(/[^\d.]/g, "")));
  return Number.isFinite(n) && n > 0 && n <= MAX_PRICE ? n : undefined;
}

export function parseFilters(params: RawParams): Filters {
  let min = price(params.min);
  let max = price(params.max);
  if (min !== undefined && max !== undefined && min > max) [min, max] = [max, min];
  const sort = Array.isArray(params.orden) ? params.orden[0] : params.orden;
  return {
    brands: list(params.marca).filter((b) => b.length <= 40),
    ram: ints(params.ram),
    storage: ints(params.almacenamiento),
    min,
    max,
    grades: list(params.grado).map((g) => g.toUpperCase()).filter((g): g is Grade => (GRADE_KEYS as string[]).includes(g)),
    uses: list(params.uso).filter((u): u is Use => (USE_KEYS as string[]).includes(u)),
    sort: sort && sort in SORTS ? (sort as Sort) : "recientes",
  };
}

export function filtersToWhere(f: Filters): Prisma.LaptopWhereInput {
  const and: Prisma.LaptopWhereInput[] = [{ hidden: false }];
  if (f.brands.length) and.push({ brand: { in: f.brands } });
  if (f.ram.length) and.push({ ramGb: { in: f.ram } });
  if (f.storage.length) and.push({ storageGb: { in: f.storage } });
  if (f.min !== undefined || f.max !== undefined) and.push({ priceGtq: { gte: f.min, lte: f.max } });
  if (f.grades.length) and.push({ grade: { in: f.grades } });
  // Any of the selected uses.
  if (f.uses.length) and.push({ OR: f.uses.map((u) => ({ uses: { contains: `,${u},` } })) });
  return { AND: and };
}

export function filtersToOrderBy(sort: Sort): Prisma.LaptopOrderByWithRelationInput[] {
  switch (sort) {
    case "precio-asc":
      return [{ priceGtq: "asc" }];
    case "precio-desc":
      return [{ priceGtq: "desc" }];
    case "bateria":
      return [{ batteryHealth: "desc" }, { priceGtq: "asc" }];
    default:
      return [{ createdAt: "desc" }];
  }
}

/** Canonical query string (stable order) used for links, chips and cache keys. */
export function filtersToSearch(f: Filters): string {
  const p = new URLSearchParams();
  f.brands.forEach((v) => p.append("marca", v));
  f.ram.forEach((v) => p.append("ram", String(v)));
  f.storage.forEach((v) => p.append("almacenamiento", String(v)));
  if (f.min !== undefined) p.set("min", String(f.min));
  if (f.max !== undefined) p.set("max", String(f.max));
  f.grades.forEach((v) => p.append("grado", v));
  f.uses.forEach((v) => p.append("uso", v));
  if (f.sort !== "recientes") p.set("orden", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const activeCount = (f: Filters) =>
  f.brands.length + f.ram.length + f.storage.length + f.grades.length + f.uses.length +
  (f.min !== undefined ? 1 : 0) + (f.max !== undefined ? 1 : 0);

type Filterable = { brand: string; ramGb: number; storageGb: number; priceGtq: number; grade: string; uses: string; batteryHealth: number };

/** In-memory twin of filtersToWhere + filtersToOrderBy, for the static (GitHub Pages) build. Input must already be newest first. */
export function applyFilters<T extends Filterable>(items: T[], f: Filters): T[] {
  const out = items.filter(
    (l) =>
      (!f.brands.length || f.brands.includes(l.brand)) &&
      (!f.ram.length || f.ram.includes(l.ramGb)) &&
      (!f.storage.length || f.storage.includes(l.storageGb)) &&
      (f.min === undefined || l.priceGtq >= f.min) &&
      (f.max === undefined || l.priceGtq <= f.max) &&
      (!f.grades.length || (f.grades as string[]).includes(l.grade)) &&
      (!f.uses.length || f.uses.some((u) => l.uses.includes(`,${u},`))),
  );
  if (f.sort === "precio-asc") out.sort((a, b) => a.priceGtq - b.priceGtq);
  else if (f.sort === "precio-desc") out.sort((a, b) => b.priceGtq - a.priceGtq);
  else if (f.sort === "bateria") out.sort((a, b) => b.batteryHealth - a.batteryHealth || a.priceGtq - b.priceGtq);
  return out;
}
