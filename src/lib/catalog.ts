/** Public (cached) reads. Admin mutations call updateTag(LAPTOPS_TAG). */
import { cacheLife, cacheTag } from "next/cache";
import { USE_KEYS, type Use } from "@/config/brand";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "./db";
import { filtersToOrderBy, filtersToWhere, type Filters } from "./filters";

export const LAPTOPS_TAG = "laptops";

const firstImage = { orderBy: { position: "asc" }, take: 1, select: { url: true, alt: true } } as const;

const cardSelect = {
  id: true,
  slug: true,
  brand: true,
  model: true,
  cpu: true,
  ramGb: true,
  storageGb: true,
  storageType: true,
  screenIn: true,
  gpu: true,
  priceGtq: true,
  grade: true,
  batteryHealth: true,
  stock: true,
  isDemo: true,
  artVariant: true,
  uses: true,
  images: firstImage,
} satisfies Prisma.LaptopSelect;

export type LaptopCard = Prisma.LaptopGetPayload<{ select: typeof cardSelect }>;

function cached() {
  cacheLife("max");
  cacheTag(LAPTOPS_TAG);
}

export async function getCatalog(filters: Filters): Promise<LaptopCard[]> {
  "use cache";
  cached();
  return db.laptop.findMany({ where: filtersToWhere(filters), orderBy: filtersToOrderBy(filters.sort), select: cardSelect });
}

export type Facets = { brands: string[]; ram: number[]; storage: number[]; minPrice: number; maxPrice: number };

export async function getFacets(): Promise<Facets> {
  "use cache";
  cached();
  const rows = await db.laptop.findMany({
    where: { hidden: false },
    select: { brand: true, ramGb: true, storageGb: true, priceGtq: true },
  });
  const uniq = <T,>(xs: T[]) => [...new Set(xs)];
  const prices = rows.map((r) => r.priceGtq);
  return {
    brands: uniq(rows.map((r) => r.brand)).sort((a, b) => a.localeCompare(b, "es")),
    ram: uniq(rows.map((r) => r.ramGb)).sort((a, b) => a - b),
    storage: uniq(rows.map((r) => r.storageGb)).sort((a, b) => a - b),
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0,
  };
}

export async function getLaptopBySlug(slug: string) {
  "use cache";
  cached();
  return db.laptop.findFirst({
    where: { slug, hidden: false },
    include: { images: { orderBy: { position: "asc" } } },
  });
}

export async function getVisibleSlugs(): Promise<string[]> {
  "use cache";
  cached();
  const rows = await db.laptop.findMany({ where: { hidden: false }, select: { slug: true } });
  return rows.map((r) => r.slug);
}

/** Close in price or sharing the main use; nearest price first. */
export async function getRelated(id: string, priceGtq: number, uses: string): Promise<LaptopCard[]> {
  "use cache";
  cached();
  const mainUse = uses.split(",").find(Boolean);
  // shortcut: scores in JS over a small candidate set; move to SQL if inventory grows past a few thousand.
  const candidates = await db.laptop.findMany({
    where: {
      hidden: false,
      id: { not: id },
      OR: [
        { priceGtq: { gte: Math.round(priceGtq * 0.6), lte: Math.round(priceGtq * 1.5) } },
        ...(mainUse ? [{ uses: { contains: `,${mainUse},` } }] : []),
      ],
    },
    select: cardSelect,
    take: 24,
  });
  return candidates
    .map((c) => ({ c, score: Math.abs(c.priceGtq - priceGtq) - (mainUse && c.uses.includes(`,${mainUse},`) ? 1500 : 0) + (c.stock > 0 ? 0 : 5000) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map((x) => x.c);
}

export async function getRecent(take = 4): Promise<LaptopCard[]> {
  "use cache";
  cached();
  return db.laptop.findMany({
    where: { hidden: false, stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    select: cardSelect,
    take,
  });
}

/** The hero laptop: the best-kept one in stock (grade, then battery). */
export async function getFeatured(): Promise<LaptopCard | null> {
  "use cache";
  cached();
  return db.laptop.findFirst({
    where: { hidden: false, stock: { gt: 0 } },
    orderBy: [{ grade: "asc" }, { batteryHealth: "desc" }],
    select: cardSelect,
  });
}

export async function getUseSummary(): Promise<{ use: Use; count: number; from: number | null }[]> {
  "use cache";
  cached();
  const rows = await db.laptop.findMany({ where: { hidden: false, stock: { gt: 0 } }, select: { uses: true, priceGtq: true } });
  return USE_KEYS.map((use) => {
    const match = rows.filter((r) => r.uses.includes(`,${use},`));
    return { use, count: match.length, from: match.length ? Math.min(...match.map((m) => m.priceGtq)) : null };
  });
}
