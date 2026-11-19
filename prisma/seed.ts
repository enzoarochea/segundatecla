/**
 * Demo inventory + admin user.
 * - Only rows with isDemo = true are replaced; real laptops are never touched.
 * - Prices are approximate refurbished market prices in GTQ, NOT verified.
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { hashPassword } from "../src/lib/password";
import { slugify } from "../src/lib/format";

try {
  process.loadEnvFile();
} catch {}

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set (copy .env.example to .env)");
const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });

type Demo = {
  brand: string;
  model: string;
  cpu: string;
  ramGb: number;
  storageGb: number;
  screenIn: number;
  gpu?: string;
  os: string;
  year: number;
  priceGtq: number;
  grade: "A" | "B" | "C";
  batteryHealth: number;
  uses: string[];
  includes: string[];
  cosmeticNotes: string;
  description: string;
  stock?: number;
  hidden?: boolean;
  artVariant: "ultrabook" | "clasica" | "convertible" | "gamer";
};

const charger = "Cargador original";
const demos: Demo[] = [
  {
    brand: "Lenovo", model: "ThinkPad T480", cpu: "Intel Core i5-8350U", ramGb: 16, storageGb: 256,
    screenIn: 14, os: "Windows 11 Pro", year: 2018, priceGtq: 3250, grade: "B", batteryHealth: 82,
    uses: ["estudio", "oficina"], includes: [charger, "Funda de neopreno"],
    cosmeticNotes: "Roce leve en la esquina de la tapa.",
    description: "Teclado cómodo para escribir horas, puertos de sobra (USB-A, USB-C, HDMI) y RAM ampliable.",
    artVariant: "clasica",
  },
  {
    brand: "Dell", model: "Latitude 7490", cpu: "Intel Core i7-8650U", ramGb: 16, storageGb: 512,
    screenIn: 14, os: "Windows 11 Pro", year: 2018, priceGtq: 3890, grade: "A", batteryHealth: 88,
    uses: ["oficina", "estudio"], includes: [charger],
    cosmeticNotes: "Sin marcas visibles.",
    description: "Liviana para su tamaño, pantalla Full HD mate que no refleja y buena autonomía.",
    artVariant: "clasica",
  },
  {
    brand: "HP", model: "EliteBook 840 G6", cpu: "Intel Core i5-8365U", ramGb: 8, storageGb: 256,
    screenIn: 14, os: "Windows 11 Pro", year: 2019, priceGtq: 3150, grade: "B", batteryHealth: 79,
    uses: ["estudio"], includes: [charger],
    cosmeticNotes: "Rayones finos en la base, no se ven con la laptop abierta.",
    description: "Carcasa de aluminio, lector de huella y cámara con tapa de privacidad.",
    artVariant: "clasica",
  },
  {
    brand: "Apple", model: "MacBook Air 13 (M1, 2020)", cpu: "Apple M1 (8 núcleos)", ramGb: 8, storageGb: 256,
    screenIn: 13.3, os: "macOS Sonoma", year: 2020, priceGtq: 5900, grade: "A", batteryHealth: 91,
    uses: ["estudio", "diseno"], includes: ["Cargador USB-C original", "Cable USB-C"],
    cosmeticNotes: "Sin marcas visibles.",
    description: "Sin ventilador, silenciosa y con batería para un día de clases. Ideal para Canva y edición ligera.",
    artVariant: "ultrabook",
  },
  {
    brand: "Apple", model: "MacBook Pro 14 (M1 Pro, 2021)", cpu: "Apple M1 Pro (10 núcleos)", ramGb: 16, storageGb: 512,
    screenIn: 14.2, os: "macOS Sonoma", year: 2021, priceGtq: 10900, grade: "A", batteryHealth: 89,
    uses: ["diseno", "programacion"], includes: ["Cargador MagSafe original", "Cable USB-C a MagSafe 3"],
    cosmeticNotes: "Marca mínima junto al puerto HDMI.",
    description: "Pantalla Liquid Retina XDR, puertos HDMI y SD. Aguanta edición de foto y video en serio.",
    artVariant: "ultrabook",
  },
  {
    brand: "Lenovo", model: "ThinkPad X1 Carbon Gen 7", cpu: "Intel Core i7-8665U", ramGb: 16, storageGb: 512,
    screenIn: 14, os: "Windows 11 Pro", year: 2019, priceGtq: 5450, grade: "B", batteryHealth: 76,
    uses: ["oficina", "programacion"], includes: [charger],
    cosmeticNotes: "Brillo leve en dos teclas por uso.",
    description: "Pesa poco más de 1 kg. Para quien la carga todo el día entre la U y el trabajo.",
    artVariant: "ultrabook",
  },
  {
    brand: "Dell", model: "XPS 13 9370", cpu: "Intel Core i7-8550U", ramGb: 16, storageGb: 512,
    screenIn: 13.3, os: "Windows 11 Home", year: 2018, priceGtq: 4600, grade: "C", batteryHealth: 71,
    uses: ["estudio", "oficina"], includes: [charger],
    cosmeticNotes: "Rayones visibles en la tapa y un golpe pequeño en la esquina trasera.",
    description: "Pantalla casi sin bordes en un cuerpo compacto. El precio refleja su estado cosmético.",
    artVariant: "ultrabook",
  },
  {
    brand: "HP", model: "ProBook 450 G7", cpu: "Intel Core i5-10210U", ramGb: 8, storageGb: 256,
    screenIn: 15.6, os: "Windows 11 Pro", year: 2020, priceGtq: 3350, grade: "A", batteryHealth: 90,
    uses: ["estudio", "oficina"], includes: [charger, "Mouse inalámbrico"],
    cosmeticNotes: "Sin marcas visibles.",
    description: "Pantalla grande con teclado numérico, útil para contabilidad y hojas de cálculo.",
    artVariant: "clasica",
  },
  {
    brand: "Lenovo", model: "ThinkPad X390 Yoga", cpu: "Intel Core i5-8365U", ramGb: 8, storageGb: 256,
    screenIn: 13.3, os: "Windows 11 Pro", year: 2019, priceGtq: 3700, grade: "B", batteryHealth: 80,
    uses: ["estudio"], includes: [charger, "Lápiz óptico integrado"],
    cosmeticNotes: "Roces leves en las bisagras.",
    description: "Pantalla táctil que gira 360° y lápiz guardado en el cuerpo. Para tomar apuntes a mano.",
    artVariant: "convertible",
  },
  {
    brand: "HP", model: "Spectre x360 13 (2019)", cpu: "Intel Core i7-8565U", ramGb: 16, storageGb: 512,
    screenIn: 13.3, os: "Windows 11 Home", year: 2019, priceGtq: 5200, grade: "B", batteryHealth: 77,
    uses: ["diseno", "estudio"], includes: [charger, "Lápiz HP Pen"],
    cosmeticNotes: "Marca leve en el borde frontal.",
    description: "Convertible táctil con buena pantalla para bocetos y presentaciones.",
    artVariant: "convertible",
  },
  {
    brand: "Dell", model: "Precision 5530", cpu: "Intel Core i7-8850H", ramGb: 32, storageGb: 1024,
    screenIn: 15.6, gpu: "NVIDIA Quadro P1000 4 GB", os: "Windows 11 Pro", year: 2018, priceGtq: 7800,
    grade: "B", batteryHealth: 74,
    uses: ["diseno", "programacion"], includes: ["Cargador original 130 W"],
    cosmeticNotes: "Desgaste leve en el reposamuñecas.",
    description: "Estación de trabajo móvil: 32 GB de RAM y gráfica profesional para CAD, 3D y renders.",
    artVariant: "clasica",
  },
  {
    brand: "ASUS", model: "TUF Gaming F15 FX506LH", cpu: "Intel Core i5-10300H", ramGb: 16, storageGb: 512,
    screenIn: 15.6, gpu: "NVIDIA GeForce GTX 1650 4 GB", os: "Windows 11 Home", year: 2020, priceGtq: 6200,
    grade: "A", batteryHealth: 86,
    uses: ["gaming", "diseno"], includes: ["Cargador original 150 W"],
    cosmeticNotes: "Sin marcas visibles.",
    description: "Pantalla de 144 Hz y teclado retroiluminado. Corre juegos populares en calidad media.",
    artVariant: "gamer",
  },
  {
    brand: "Lenovo", model: "Legion 5 15ARH05", cpu: "AMD Ryzen 7 4800H", ramGb: 16, storageGb: 512,
    screenIn: 15.6, gpu: "NVIDIA GeForce GTX 1660 Ti 6 GB", os: "Windows 11 Home", year: 2020, priceGtq: 7400,
    grade: "B", batteryHealth: 81,
    uses: ["gaming", "programacion"], includes: ["Cargador original 230 W"],
    cosmeticNotes: "Rayones leves en la tapa.",
    description: "8 núcleos para compilar, editar o jugar. Buena ventilación para sesiones largas.",
    artVariant: "gamer",
  },
  {
    brand: "Acer", model: "Aspire 5 A515-54", cpu: "Intel Core i5-10210U", ramGb: 8, storageGb: 512,
    screenIn: 15.6, os: "Windows 11 Home", year: 2020, priceGtq: 2850, grade: "C", batteryHealth: 73,
    uses: ["estudio"], includes: [charger],
    cosmeticNotes: "Rayones notorios en la tapa; dos teclas con brillo.",
    description: "La opción más accesible para clases en línea, Office y navegar.",
    stock: 0,
    artVariant: "clasica",
  },
  {
    brand: "Microsoft", model: "Surface Laptop 3 13.5", cpu: "Intel Core i5-1035G7", ramGb: 8, storageGb: 256,
    screenIn: 13.5, os: "Windows 11 Home", year: 2019, priceGtq: 4300, grade: "A", batteryHealth: 87,
    uses: ["estudio", "oficina"], includes: ["Cargador Surface Connect original"],
    cosmeticNotes: "Sin marcas visibles.",
    description: "Pantalla táctil 3:2, más alta que las normales: se ve más documento a la vez.",
    hidden: true,
    artVariant: "ultrabook",
  },
];

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("ADMIN_EMAIL / ADMIN_PASSWORD not set: admin user not created.");
    return;
  }
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  const passwordHash = await hashPassword(password);
  await db.adminUser.upsert({ where: { email }, update: { passwordHash }, create: { email, passwordHash } });
  // A new password invalidates every open session.
  await db.session.deleteMany({});
  console.log(`Admin user ready: ${email}`);
}

async function main() {
  await seedAdmin();
  await db.laptop.deleteMany({ where: { isDemo: true } });
  const now = Date.now();
  for (const [i, d] of demos.entries()) {
    await db.laptop.create({
      data: {
        ...d,
        slug: slugify(`${d.brand} ${d.model}`),
        gpu: d.gpu ?? null,
        uses: `,${d.uses.join(",")},`,
        includes: d.includes.join("\n"),
        stock: d.stock ?? 1,
        hidden: d.hidden ?? false,
        isDemo: true,
        // Spread creation dates so "recién llegadas" has an order.
        createdAt: new Date(now - i * 36e5 * 20),
      },
    });
  }
  console.log(`Demo laptops: ${demos.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
