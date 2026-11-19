/**
 * Brand config: the one file to edit to rename the store, recolour it,
 * or update contact details and policies. Fonts live in ./fonts.ts.
 * Everything here is a PROVISIONAL proposal (see .agents/web/brief.md).
 */

export const PENDING = "Por confirmar";
export const PROPOSED_POLICY = "Política propuesta, por confirmar";

export const brand = {
  name: "IP Outlet Store",
  /** Wordmark text shown next to the logo mark (src/assets/logo-mark.png) */
  wordmark: "IP Outlet Store",
  tagline: "Laptops reacondicionadas, revisadas una por una.",
  description:
    "Laptops reacondicionadas en Guatemala con su estado real a la vista: grado cosmético, salud de batería y qué incluye cada una. Precios en quetzales.",
  locale: "es-GT",
  currency: "GTQ",

  /**
   * Palette in OKLCH. Injected as CSS variables in the root layout,
   * so changing a value here recolours the whole site.
   */
  colors: {
    paper: "oklch(97.5% 0 0)",
    surface: "oklch(100% 0 0)",
    sunken: "oklch(94% 0 0)",
    ink: "oklch(22% 0 0)",
    inkSoft: "oklch(45% 0 0)",
    line: "oklch(88% 0 0)",
    accent: "oklch(54% 0.16 48)",
    accentStrong: "oklch(45% 0.13 45)",
    accentWash: "oklch(95% 0.03 60)",
    signal: "oklch(70% 0.18 52)",
    signalHover: "oklch(65% 0.18 50)",
    alert: "oklch(52% 0.19 27)",
    focus: "oklch(54% 0.16 48)",
  },

  /** Contact details: all pending until the owner confirms them */
  contact: {
    whatsapp: null as string | null,
    email: null as string | null,
    address: null as string | null,
    hours: null as string | null,
  },
} as const;

/** Cosmetic grades. Proposed scale, shown with PROPOSED_POLICY. */
export const grades = {
  A: {
    label: "Como nueva",
    summary: "Sin marcas visibles a un brazo de distancia.",
    detail:
      "Puede tener rayones finos que solo se ven con luz de lado. Pantalla y teclado sin defectos.",
  },
  B: {
    label: "Buen estado",
    summary: "Marcas leves de uso en la tapa o la base.",
    detail:
      "Rayones o roces pequeños en la carcasa. Pantalla sin manchas ni píxeles muertos. Teclado completo.",
  },
  C: {
    label: "Uso visible",
    summary: "Marcas notorias, funciona completa.",
    detail:
      "Rayones, golpes leves o desgaste en teclas. Todo funciona; el precio lo refleja.",
  },
} as const;
export type Grade = keyof typeof grades;
export const GRADE_KEYS = Object.keys(grades) as Grade[];

/** Uses ("¿para qué la querés?"). Keys are stored in the database. */
export const uses = {
  estudio: { label: "Estudio", hint: "Clases, tareas, Office y videollamadas" },
  oficina: { label: "Oficina", hint: "Correo, hojas de cálculo, trabajo remoto" },
  diseno: { label: "Diseño y foto", hint: "Photoshop, Illustrator, Canva, Lightroom" },
  programacion: { label: "Programación", hint: "Editores, máquinas virtuales, varias apps abiertas" },
  gaming: { label: "Juegos", hint: "Tarjeta gráfica dedicada" },
} as const;
export type Use = keyof typeof uses;
export const USE_KEYS = Object.keys(uses) as Use[];

/** Battery health reading thresholds (percent of original capacity) */
export const battery = {
  good: 85,
  fair: 75,
  explain:
    "Es la capacidad que le queda a la batería comparada con cuando era nueva. Se mide con el reporte del sistema antes de publicar cada equipo.",
};

/** Proposed policies. Every block is displayed with PROPOSED_POLICY. */
export const policies = {
  warranty: {
    title: "Garantía",
    short: "3 meses de garantía de funcionamiento",
    points: [
      "Cubre fallas de funcionamiento de pantalla, teclado, puertos, almacenamiento y placa durante 3 meses desde la entrega.",
      "La batería se cubre si baja de 60% de salud en el primer mes.",
      "No cubre golpes, líquidos ni daños por mal uso después de la entrega.",
      "Si no se puede reparar, se cambia por una equivalente o se devuelve el dinero.",
    ],
  },
  returns: {
    title: "Devoluciones",
    short: "7 días para devolverla si no es lo que esperabas",
    points: [
      "Tenés 7 días desde la entrega para devolverla, con todo lo que incluía.",
      "Tiene que volver en el mismo estado en que la recibiste.",
      "El reembolso se hace por el mismo medio de pago.",
    ],
  },
  shipping: {
    title: "Envíos",
    short: "Envío a todo el país o entrega en persona",
    points: [
      "Ciudad de Guatemala: entrega en persona o por mensajería.",
      "Resto del país: envío por paquetería con número de guía.",
      "El costo y el tiempo de envío se confirman antes de pagar.",
    ],
  },
} as const;
