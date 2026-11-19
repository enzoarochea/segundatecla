import { beforeEach, describe, expect, it } from "vitest";
import { getCatalog } from "@/lib/catalog";
import { applyFilters, parseFilters } from "@/lib/filters";
import { makeLaptop, resetDb } from "./helpers";

beforeEach(resetDb);

describe("static catalog filters", () => {
  it("match the database query for the same URL", async () => {
    await makeLaptop({ model: "A16", ramGb: 16, grade: "A", priceGtq: 4000, batteryHealth: 90 });
    await makeLaptop({ model: "B8", ramGb: 8, grade: "B", priceGtq: 2500, batteryHealth: 95 });
    await makeLaptop({ model: "C8", ramGb: 8, grade: "C", priceGtq: 1800, batteryHealth: 70 });
    await makeLaptop({ model: "Oculta", hidden: true });
    const all = await getCatalog(parseFilters({}));
    for (const q of [{}, { ram: "8" }, { grado: "A,B", orden: "precio-asc" }, { max: "3000", orden: "bateria" }, { min: "2000", max: "5000", orden: "precio-desc" }]) {
      const f = parseFilters(q);
      expect(applyFilters(all, f).map((l) => l.model)).toEqual((await getCatalog(f)).map((l) => l.model));
    }
  });
});
