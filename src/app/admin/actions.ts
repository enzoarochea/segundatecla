"use server";
/**
 * Every admin mutation. Each one checks the session first (requireAdmin) and
 * parses its input with zod before touching the database.
 */
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { login, logout, requireAdmin } from "@/lib/auth";
import { LAPTOPS_TAG } from "@/lib/catalog";
import { db } from "@/lib/db";
import { serializeUses, slugify } from "@/lib/format";
import { ImageError, storage } from "@/lib/storage";
import {
  altSchema,
  fieldErrors,
  idSchema,
  laptopFormToObject,
  laptopSchema,
  loginSchema,
  MAX_PHOTOS,
  quickEditSchema,
  type LaptopFormValues,
} from "@/lib/validation";

export type LoginState = { error?: string; email?: string };
export type LaptopFormState = { errors?: Record<string, string>; message?: string; ok?: boolean; values?: LaptopFormValues; n: number };
export type QuickState = { message?: string; error?: boolean; n: number; values?: { priceGtq: string; stock: string } };
export type PhotoState = { message?: string; error?: boolean; n: number };

const str = (fd: FormData, k: string) => {
  const v = fd.get(k);
  return typeof v === "string" ? v : "";
};

// ---- Session ----------------------------------------------------------------
export async function loginAction(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({ email: str(fd, "email"), password: str(fd, "password") });
  if (!parsed.success) return { error: "Escribí tu correo y tu contraseña.", email: str(fd, "email").slice(0, 200) };
  // shortcut: one rate-limit bucket per email, since a local server has no trustworthy client IP
  // (X-Forwarded-For can be forged). Pass the real IP here if this ever runs behind a known proxy.
  const r = await login(parsed.data.email, parsed.data.password, "local");
  if (!r.ok) return { error: r.error, email: parsed.data.email };
  redirect("/admin");
}

export async function logoutAction() {
  await logout();
  redirect("/admin/login");
}

// ---- Laptops ------------------------------------------------------------------
async function uniqueSlug(base: string) {
  const root = slugify(base) || "laptop";
  for (let i = 1; ; i++) {
    const slug = i === 1 ? root : `${root}-${i}`;
    if (!(await db.laptop.findUnique({ where: { slug }, select: { id: true } }))) return slug;
  }
}

/** Create (no id) or update (id) from the full form. */
export async function saveLaptopAction(prev: LaptopFormState, fd: FormData): Promise<LaptopFormState> {
  await requireAdmin();
  const n = prev.n + 1;
  const values = laptopFormToObject(fd);
  const parsed = laptopSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), message: "Revisá los campos marcados.", values, n };
  const data = { ...parsed.data, uses: serializeUses(parsed.data.uses) };

  const rawId = str(fd, "id");
  if (rawId) {
    const id = idSchema.safeParse(rawId);
    const updated = id.success ? await db.laptop.update({ where: { id: id.data }, data }).catch(() => null) : null;
    if (!updated) return { message: "Esta laptop ya no existe.", values, n };
    updateTag(LAPTOPS_TAG);
    return { message: "Cambios guardados.", ok: true, values, n };
  }

  const slug = await uniqueSlug(`${data.brand} ${data.model} ${data.ramGb}gb`);
  const created = await db.laptop.create({ data: { ...data, slug } });
  updateTag(LAPTOPS_TAG);
  redirect(`/admin/laptops/${created.id}?creada=1`);
}

export async function quickEditAction(prev: QuickState, fd: FormData): Promise<QuickState> {
  await requireAdmin();
  const n = prev.n + 1;
  const values = { priceGtq: str(fd, "priceGtq"), stock: str(fd, "stock") };
  const parsed = quickEditSchema.safeParse({ id: str(fd, "id"), ...values });
  if (!parsed.success) return { message: parsed.error.issues[0].message, error: true, values, n };
  const { id, ...data } = parsed.data;
  const ok = await db.laptop.update({ where: { id }, data }).catch(() => null);
  if (!ok) return { message: "Esta laptop ya no existe.", error: true, values, n };
  updateTag(LAPTOPS_TAG);
  return { message: "Guardado.", n };
}

export async function toggleHiddenAction(fd: FormData) {
  await requireAdmin();
  const id = idSchema.parse(str(fd, "id"));
  const l = await db.laptop.findUnique({ where: { id }, select: { hidden: true } });
  if (!l) return;
  await db.laptop.update({ where: { id }, data: { hidden: !l.hidden } });
  updateTag(LAPTOPS_TAG);
}

export async function deleteLaptopAction(fd: FormData) {
  await requireAdmin();
  const id = idSchema.parse(str(fd, "id"));
  const images = await db.laptopImage.findMany({ where: { laptopId: id }, select: { url: true } });
  await db.laptop.deleteMany({ where: { id } }); // images cascade
  await Promise.all(images.map((i) => storage.remove(i.url)));
  updateTag(LAPTOPS_TAG);
  redirect("/admin");
}

// ---- Photos -------------------------------------------------------------------
export async function uploadPhotosAction(prev: PhotoState, fd: FormData): Promise<PhotoState> {
  await requireAdmin();
  const n = prev.n + 1;
  const id = idSchema.safeParse(str(fd, "id"));
  const alt = altSchema.safeParse(str(fd, "alt"));
  if (!id.success) return { message: "Laptop no válida.", error: true, n };
  if (!alt.success) return { message: alt.error.issues[0].message, error: true, n };

  const files = fd.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return { message: "Elegí al menos una foto.", error: true, n };

  const laptop = await db.laptop.findUnique({ where: { id: id.data }, select: { _count: { select: { images: true } } } });
  if (!laptop) return { message: "Esta laptop ya no existe.", error: true, n };
  if (laptop._count.images + files.length > MAX_PHOTOS) {
    return { message: `Cada laptop puede tener hasta ${MAX_PHOTOS} fotos.`, error: true, n };
  }

  const last = await db.laptopImage.aggregate({ where: { laptopId: id.data }, _max: { position: true } });
  let position = (last._max.position ?? -1) + 1;
  let saved = 0;
  try {
    for (const file of files) {
      const url = await storage.save(file);
      await db.laptopImage.create({ data: { laptopId: id.data, url, alt: alt.data, position: position++ } });
      saved++;
    }
  } catch (e) {
    if (!(e instanceof ImageError)) throw e;
    if (saved) updateTag(LAPTOPS_TAG);
    return { message: saved ? `Se subieron ${saved}. ${e.message}` : e.message, error: true, n };
  }
  updateTag(LAPTOPS_TAG);
  return { message: saved === 1 ? "Foto subida." : `${saved} fotos subidas.`, n };
}

export async function updateAltAction(prev: PhotoState, fd: FormData): Promise<PhotoState> {
  await requireAdmin();
  const n = prev.n + 1;
  const id = idSchema.safeParse(str(fd, "imageId"));
  const alt = altSchema.safeParse(str(fd, "alt"));
  if (!id.success || !alt.success) return { message: alt.error?.issues[0].message ?? "Foto no válida.", error: true, n };
  const ok = await db.laptopImage.update({ where: { id: id.data }, data: { alt: alt.data } }).catch(() => null);
  if (!ok) return { message: "Esta foto ya no existe.", error: true, n };
  updateTag(LAPTOPS_TAG);
  return { message: "Descripción guardada.", n };
}

export async function makeCoverAction(fd: FormData) {
  await requireAdmin();
  const id = idSchema.parse(str(fd, "imageId"));
  const img = await db.laptopImage.findUnique({ where: { id }, select: { laptopId: true } });
  if (!img) return;
  const first = await db.laptopImage.aggregate({ where: { laptopId: img.laptopId }, _min: { position: true } });
  await db.laptopImage.update({ where: { id }, data: { position: (first._min.position ?? 0) - 1 } });
  updateTag(LAPTOPS_TAG);
}

export async function removePhotoAction(fd: FormData) {
  await requireAdmin();
  const id = idSchema.parse(str(fd, "imageId"));
  const img = await db.laptopImage.findUnique({ where: { id }, select: { url: true } });
  if (!img) return;
  await db.laptopImage.delete({ where: { id } });
  await storage.remove(img.url);
  updateTag(LAPTOPS_TAG);
}
