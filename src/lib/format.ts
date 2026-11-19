import { battery, USE_KEYS, type Use } from "@/config/brand";

const gtq = new Intl.NumberFormat("es-GT", { style: "currency", currency: "GTQ", maximumFractionDigits: 0 });

/** Q3,450 */
export const formatGtq = (n: number) => gtq.format(n);

export const formatStorage = (gb: number) => (gb >= 1024 ? `${gb / 1024} TB` : `${gb} GB`);

export function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** ",estudio,oficina," -> ["estudio","oficina"], unknown keys dropped */
export const parseUses = (stored: string): Use[] =>
  stored.split(",").filter((u): u is Use => (USE_KEYS as string[]).includes(u));

export const serializeUses = (list: readonly string[]) => `,${list.join(",")},`;

export const parseLines = (s: string) =>
  s
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export function batteryLevel(pct: number): "good" | "fair" | "low" {
  if (pct >= battery.good) return "good";
  if (pct >= battery.fair) return "fair";
  return "low";
}

export const batteryWord = { good: "Muy buena", fair: "Buena", low: "Regular" } as const;
