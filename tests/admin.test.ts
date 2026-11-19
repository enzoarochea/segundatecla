import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  deleteLaptopAction,
  loginAction,
  logoutAction,
  quickEditAction,
  saveLaptopAction,
  toggleHiddenAction,
  uploadPhotosAction,
} from "@/app/admin/actions";
import { resetRateLimit, SESSION_COOKIE } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { makeLaptop, resetDb } from "./helpers";
import { jar, Redirect } from "./setup";

const EMAIL = "admin@prueba.test";
const PASSWORD = "una-clave-de-prueba-larga";
let hash: string;

const form = (fields: Record<string, string | string[] | File>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) for (const x of Array.isArray(v) ? v : [v]) fd.append(k, x);
  return fd;
};

const validLaptop = {
  brand: "Dell", model: "Latitude 5490", cpu: "Intel Core i5-8250U", ramGb: "8", storageGb: "256",
  storageType: "SSD", screenIn: "14", gpu: "", os: "Windows 11", year: "2018", priceGtq: "2900",
  grade: "B", batteryHealth: "81", uses: ["estudio", "oficina"], includes: "Cargador original",
  cosmeticNotes: "", description: "", stock: "2", artVariant: "clasica",
};

/** Runs an action and returns where it redirected, or null if it did not. */
async function redirectOf(p: Promise<unknown>) {
  try {
    await p;
    return null;
  } catch (e) {
    if (e instanceof Redirect) return e.url;
    throw e;
  }
}

async function signIn() {
  const url = await redirectOf(loginAction({}, form({ email: EMAIL, password: PASSWORD })));
  expect(url).toBe("/admin");
  expect(jar.get(SESSION_COOKIE)).toBeTruthy();
}

beforeAll(async () => {
  hash = await hashPassword(PASSWORD);
});

beforeEach(async () => {
  await resetDb();
  resetRateLimit();
  await db.adminUser.create({ data: { email: EMAIL, passwordHash: hash } });
});

describe("admin permissions", () => {
  it("sends every mutation to the login page without a session, and changes nothing", async () => {
    const l = await makeLaptop({ priceGtq: 3000 });
    const fd = form({ id: l.id, priceGtq: "1", stock: "0" });
    expect(await redirectOf(saveLaptopAction({ n: 0 }, form(validLaptop)))).toBe("/admin/login");
    expect(await redirectOf(quickEditAction({ n: 0 }, fd))).toBe("/admin/login");
    expect(await redirectOf(toggleHiddenAction(fd))).toBe("/admin/login");
    expect(await redirectOf(deleteLaptopAction(fd))).toBe("/admin/login");
    expect(await redirectOf(uploadPhotosAction({ n: 0 }, fd))).toBe("/admin/login");
    expect(await db.laptop.findUnique({ where: { id: l.id } })).toMatchObject({ priceGtq: 3000, hidden: false });
    expect(await db.laptop.count()).toBe(1);
  });

  it("rejects a forged session cookie", async () => {
    jar.set(SESSION_COOKIE, "token-inventado");
    expect(await redirectOf(saveLaptopAction({ n: 0 }, form(validLaptop)))).toBe("/admin/login");
  });

  it("rejects a wrong password with a generic message and locks after 5 tries", async () => {
    const wrong = form({ email: EMAIL, password: "no-es-esta" });
    const first = await loginAction({}, wrong);
    expect(first.error).toBe("Correo o contraseña incorrectos.");
    expect((await loginAction({}, form({ email: "otro@prueba.test", password: "x" }))).error).toBe(first.error);
    for (let i = 0; i < 4; i++) await loginAction({}, wrong);
    const locked = await loginAction({}, form({ email: EMAIL, password: PASSWORD }));
    expect(locked.error).toMatch(/Demasiados intentos/);
    expect(jar.has(SESSION_COOKIE)).toBe(false);
  });

  it("stores only a hash of the session token, and logout ends the session", async () => {
    await signIn();
    const token = jar.get(SESSION_COOKIE)!;
    const [session] = await db.session.findMany();
    expect(session.id).not.toBe(token);
    expect(await redirectOf(logoutAction())).toBe("/admin/login");
    expect(await db.session.count()).toBe(0);
    jar.set(SESSION_COOKIE, token); // replaying the old cookie no longer works
    expect(await redirectOf(saveLaptopAction({ n: 0 }, form(validLaptop)))).toBe("/admin/login");
  });
});

describe("admin inventory CRUD", () => {
  beforeEach(signIn);

  it("validates on the server and keeps what was typed", async () => {
    const state = await saveLaptopAction({ n: 0 }, form({ ...validLaptop, priceGtq: "-5", uses: [], brand: "" }));
    expect(state.errors).toMatchObject({
      priceGtq: expect.stringMatching(/Precio/),
      uses: "Elegí al menos un uso.",
      brand: "Este campo es obligatorio.",
    });
    expect(state.values?.model).toBe("Latitude 5490");
    expect(await db.laptop.count()).toBe(0);
  });

  it("creates, edits, hides, changes price and stock, then deletes", async () => {
    const url = await redirectOf(saveLaptopAction({ n: 0 }, form(validLaptop)));
    const created = await db.laptop.findFirstOrThrow();
    expect(url).toBe(`/admin/laptops/${created.id}?creada=1`);
    expect(created).toMatchObject({ slug: "dell-latitude-5490-8gb", uses: ",estudio,oficina,", isDemo: false, hidden: false });

    // A second laptop with the same name gets its own slug.
    await redirectOf(saveLaptopAction({ n: 0 }, form(validLaptop)));
    expect((await db.laptop.findMany({ select: { slug: true } })).map((l) => l.slug).sort()).toEqual([
      "dell-latitude-5490-8gb",
      "dell-latitude-5490-8gb-2",
    ]);

    const edited = await saveLaptopAction({ n: 0 }, form({ ...validLaptop, id: created.id, ramGb: "16", gpu: "Intel UHD 620" }));
    expect(edited).toMatchObject({ ok: true, message: "Cambios guardados." });
    expect(await db.laptop.findUniqueOrThrow({ where: { id: created.id } })).toMatchObject({ ramGb: 16, gpu: "Intel UHD 620" });

    const quick = await quickEditAction({ n: 0 }, form({ id: created.id, priceGtq: "2750", stock: "0" }));
    expect(quick.error).toBeUndefined();
    expect(await db.laptop.findUniqueOrThrow({ where: { id: created.id } })).toMatchObject({ priceGtq: 2750, stock: 0 });
    const bad = await quickEditAction({ n: 0 }, form({ id: created.id, priceGtq: "12.5", stock: "1" }));
    expect(bad.error).toBe(true);

    await toggleHiddenAction(form({ id: created.id }));
    expect((await db.laptop.findUniqueOrThrow({ where: { id: created.id } })).hidden).toBe(true);

    expect(await redirectOf(deleteLaptopAction(form({ id: created.id })))).toBe("/admin");
    expect(await db.laptop.findUnique({ where: { id: created.id } })).toBeNull();
  });

  it("refuses files that are not real images, whatever their extension", async () => {
    const l = await makeLaptop();
    const fake = new File(["<script>alert(1)</script>"], "foto.jpg", { type: "image/jpeg" });
    const state = await uploadPhotosAction({ n: 0 }, form({ id: l.id, alt: "", photos: fake }));
    expect(state).toMatchObject({ error: true, message: "Solo se aceptan fotos JPG, PNG o WebP." });
    expect(await db.laptopImage.count()).toBe(0);
  });
});
