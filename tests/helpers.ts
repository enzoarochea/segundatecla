import { db } from "@/lib/db";
import { slugify } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";

export async function resetDb() {
  await db.laptopImage.deleteMany();
  await db.laptop.deleteMany();
  await db.session.deleteMany();
  await db.adminUser.deleteMany();
}

let n = 0;
/** A valid laptop row; override what the test cares about. */
export function makeLaptop(over: Partial<Prisma.LaptopCreateInput> = {}) {
  n++;
  const brand = over.brand ?? "Lenovo";
  const model = over.model ?? `Prueba ${n}`;
  return db.laptop.create({
    data: {
      slug: slugify(`${brand} ${model}`),
      brand,
      model,
      cpu: "Intel Core i5-8350U",
      ramGb: 8,
      storageGb: 256,
      screenIn: 14,
      os: "Windows 11",
      priceGtq: 3000,
      grade: "B",
      batteryHealth: 80,
      uses: ",estudio,",
      includes: "Cargador original",
      ...over,
    },
  });
}
