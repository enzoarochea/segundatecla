import { beforeEach, describe, expect, it } from "vitest";
import { getCatalog, getLaptopBySlug, getRelated } from "@/lib/catalog";
import { db } from "@/lib/db";
import { parseFilters } from "@/lib/filters";
import { makeLaptop, resetDb } from "./helpers";

beforeEach(resetDb);

describe("catalog listing", () => {
  it("applies URL filters and never lists hidden laptops", async () => {
    await makeLaptop({ model: "A16", ramGb: 16, grade: "A", priceGtq: 4000 });
    await makeLaptop({ model: "B8", ramGb: 8, grade: "B", priceGtq: 2500 });
    await makeLaptop({ model: "Oculta16", ramGb: 16, grade: "A", hidden: true });

    const all = await getCatalog(parseFilters({}));
    expect(all.map((l) => l.model).sort()).toEqual(["A16", "B8"]);

    const ram16 = await getCatalog(parseFilters({ ram: "16", grado: "A" }));
    expect(ram16.map((l) => l.model)).toEqual(["A16"]);

    const cheap = await getCatalog(parseFilters({ max: "3000", orden: "precio-asc" }));
    expect(cheap.map((l) => l.model)).toEqual(["B8"]);
  });
});

describe("product page data", () => {
  it("returns the laptop with its photos in order, cover first", async () => {
    const l = await makeLaptop({ model: "Con fotos" });
    await db.laptopImage.createMany({
      data: [
        { laptopId: l.id, url: "/uploads/b.jpg", alt: "segunda", position: 1 },
        { laptopId: l.id, url: "/uploads/a.jpg", alt: "portada", position: 0 },
      ],
    });
    const page = await getLaptopBySlug(l.slug);
    expect(page?.model).toBe("Con fotos");
    expect(page?.images.map((i) => i.alt)).toEqual(["portada", "segunda"]);
  });

  it("gives 404 data for a hidden laptop", async () => {
    const l = await makeLaptop({ hidden: true });
    expect(await getLaptopBySlug(l.slug)).toBeNull();
  });

  it("suggests related laptops, never itself or hidden ones, in stock first", async () => {
    const me = await makeLaptop({ model: "Yo", priceGtq: 3000 });
    await makeLaptop({ model: "Cerca", priceGtq: 3100 });
    await makeLaptop({ model: "Agotada", priceGtq: 3000, stock: 0 });
    await makeLaptop({ model: "Oculta", priceGtq: 3000, hidden: true });
    const related = await getRelated(me.id, me.priceGtq, me.uses);
    expect(related.map((r) => r.model)).toEqual(["Cerca", "Agotada"]);
  });
});
