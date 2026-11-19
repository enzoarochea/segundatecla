/** Server-side validation of admin input. Every admin action parses through here. */
import { z } from "zod";
import { GRADE_KEYS, USE_KEYS } from "@/config/brand";
import type { Laptop } from "@/generated/prisma/client";
import { parseUses } from "./format";

export const ART_VARIANTS = ["clasica", "ultrabook", "convertible", "gamer"] as const;
export const STORAGE_TYPES = ["SSD", "NVMe", "HDD", "eMMC"] as const;

const text = (max: number) => z.string().trim().max(max, `Máximo ${max} caracteres.`);
const required = (max: number) => text(max).min(1, "Este campo es obligatorio.");
const int = (min: number, max: number, msg: string) =>
  z.coerce.number({ error: msg }).int(msg).min(min, msg).max(max, msg);

export const laptopSchema = z.object({
  brand: required(40),
  model: required(80),
  cpu: required(80),
  ramGb: int(1, 256, "RAM entre 1 y 256 GB."),
  storageGb: int(16, 8192, "Almacenamiento entre 16 y 8192 GB."),
  storageType: z.enum(STORAGE_TYPES, { error: "Tipo de almacenamiento no válido." }),
  screenIn: z.coerce.number({ error: "Pantalla no válida." }).min(10, "Pantalla entre 10 y 18 pulgadas.").max(18, "Pantalla entre 10 y 18 pulgadas."),
  gpu: text(80).transform((s) => s || null),
  os: required(60),
  year: z
    .string()
    .trim()
    .transform((s, ctx) => {
      if (!s) return null;
      const n = Number(s);
      if (!Number.isInteger(n) || n < 2000 || n > new Date().getFullYear() + 1) {
        ctx.addIssue({ code: "custom", message: "Año no válido." });
        return z.NEVER;
      }
      return n;
    }),
  priceGtq: int(1, 1_000_000, "Precio entre Q1 y Q1,000,000, sin decimales."),
  grade: z.enum(GRADE_KEYS as [string, ...string[]], { error: "Elegí un grado." }),
  batteryHealth: int(0, 100, "Salud de batería entre 0 y 100%."),
  uses: z.array(z.enum(USE_KEYS as [string, ...string[]])).min(1, "Elegí al menos un uso.").max(USE_KEYS.length),
  includes: text(1000),
  cosmeticNotes: text(500),
  description: text(2000),
  stock: int(0, 999, "Stock entre 0 y 999."),
  hidden: z.boolean(),
  artVariant: z.enum(ART_VARIANTS),
});
export type LaptopInput = z.infer<typeof laptopSchema>;

/** FormData -> plain object the schema understands (checkbox lists, booleans). */
export function laptopFormToObject(fd: FormData) {
  const s = (k: string) => {
    const v = fd.get(k);
    return typeof v === "string" ? v : "";
  };
  return {
    brand: s("brand"),
    model: s("model"),
    cpu: s("cpu"),
    ramGb: s("ramGb"),
    storageGb: s("storageGb"),
    storageType: s("storageType"),
    screenIn: s("screenIn"),
    gpu: s("gpu"),
    os: s("os"),
    year: s("year"),
    priceGtq: s("priceGtq"),
    grade: s("grade"),
    batteryHealth: s("batteryHealth"),
    uses: fd.getAll("uses").filter((v): v is string => typeof v === "string"),
    includes: s("includes"),
    cosmeticNotes: s("cosmeticNotes"),
    description: s("description"),
    stock: s("stock"),
    hidden: fd.get("hidden") === "on",
    artVariant: s("artVariant") || "clasica",
  };
}

export type LaptopFormValues = ReturnType<typeof laptopFormToObject>;

export const emptyLaptopForm: LaptopFormValues = {
  brand: "", model: "", cpu: "", ramGb: "", storageGb: "", storageType: "SSD", screenIn: "", gpu: "", os: "Windows 11",
  year: "", priceGtq: "", grade: "", batteryHealth: "", uses: [], includes: "Cargador original", cosmeticNotes: "",
  description: "", stock: "1", hidden: false, artVariant: "clasica",
};

export function laptopToFormValues(l: Laptop): LaptopFormValues {
  return {
    brand: l.brand, model: l.model, cpu: l.cpu, ramGb: String(l.ramGb), storageGb: String(l.storageGb),
    storageType: l.storageType, screenIn: String(l.screenIn), gpu: l.gpu ?? "", os: l.os, year: l.year ? String(l.year) : "",
    priceGtq: String(l.priceGtq), grade: l.grade, batteryHealth: String(l.batteryHealth), uses: parseUses(l.uses),
    includes: l.includes, cosmeticNotes: l.cosmeticNotes, description: l.description, stock: String(l.stock),
    hidden: l.hidden, artVariant: l.artVariant,
  };
}

/** Inline edits in the admin table. */
export const quickEditSchema = z.object({
  id: z.string().min(1).max(40),
  priceGtq: int(1, 1_000_000, "Precio entre Q1 y Q1,000,000."),
  stock: int(0, 999, "Stock entre 0 y 999."),
});

export const idSchema = z.string().min(1).max(40);

export const loginSchema = z.object({
  email: z.string().trim().max(200),
  password: z.string().min(1).max(200),
});

export const altSchema = text(160);
export const MAX_PHOTOS = 8;

/** { field: "first message" } for the form. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
