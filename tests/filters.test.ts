import { describe, expect, it } from "vitest";
import { activeCount, filtersToSearch, filtersToWhere, parseFilters } from "@/lib/filters";

describe("catalog filters in the URL", () => {
  it("reads every filter from the query string", () => {
    const f = parseFilters({
      marca: ["Lenovo", "Dell"],
      ram: "16,8",
      almacenamiento: "512",
      min: "2000",
      max: "6000",
      grado: "a",
      uso: ["estudio", "gaming"],
      orden: "precio-asc",
    });
    expect(f).toEqual({
      brands: ["Lenovo", "Dell"],
      ram: [8, 16],
      storage: [512],
      min: 2000,
      max: 6000,
      grades: ["A"],
      uses: ["estudio", "gaming"],
      sort: "precio-asc",
    });
    expect(activeCount(f)).toBe(10);
  });

  it("drops junk and swaps an inverted price range", () => {
    const f = parseFilters({ ram: "abc,-4,99999", grado: "Z", uso: "hackeo", orden: "random", min: "9000", max: "1000" });
    expect(f.ram).toEqual([]);
    expect(f.grades).toEqual([]);
    expect(f.uses).toEqual([]);
    expect(f.sort).toBe("recientes");
    expect([f.min, f.max]).toEqual([1000, 9000]);
  });

  it("round-trips through the canonical query string", () => {
    const f = parseFilters({ ram: "16", grado: "B", uso: "oficina", max: "4000", orden: "bateria" });
    const search = filtersToSearch(f);
    expect(search).toBe("?ram=16&max=4000&grado=B&uso=oficina&orden=bateria");
    expect(parseFilters(Object.fromEntries(new URLSearchParams(search)))).toEqual(f);
    expect(filtersToSearch(parseFilters({}))).toBe("");
  });

  it("always hides unpublished laptops in the query", () => {
    const where = filtersToWhere(parseFilters({ uso: "diseno" }));
    expect(where.AND).toContainEqual({ hidden: false });
    expect(where.AND).toContainEqual({ OR: [{ uses: { contains: ",diseno," } }] });
  });
});
