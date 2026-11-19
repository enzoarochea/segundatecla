/**
 * Photo storage behind one interface. Today: files in ./uploads served by
 * src/app/uploads/[file]/route.ts. To move to S3/R2/Cloudinary, write another
 * ImageStorage and change `storage` below; nothing else imports the filesystem.
 */
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export interface ImageStorage {
  /** Validates and stores the image, returns its public URL. */
  save(file: File): Promise<string>;
  remove(url: string): Promise<void>;
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;
type Ext = keyof typeof IMAGE_TYPES;

/** Detect the real type from the file's first bytes; the browser's MIME type is not trusted. */
export function sniffImage(bytes: Uint8Array): Ext | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if ([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((b, i) => bytes[i] === b)) return "png";
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

export class ImageError extends Error {}

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const URL_PREFIX = "/uploads/";
/** Only names this module generates: uuid + known extension. Blocks path traversal. */
export const SAFE_NAME = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

export const localStorage: ImageStorage = {
  async save(file) {
    if (file.size === 0) throw new ImageError("El archivo está vacío.");
    if (file.size > MAX_IMAGE_BYTES) throw new ImageError("Cada foto puede pesar hasta 5 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const ext = sniffImage(bytes);
    if (!ext) throw new ImageError("Solo se aceptan fotos JPG, PNG o WebP.");
    const name = `${randomUUID()}.${ext}`;
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, name), bytes);
    return URL_PREFIX + name;
  },
  async remove(url) {
    const name = url.startsWith(URL_PREFIX) ? url.slice(URL_PREFIX.length) : "";
    if (!SAFE_NAME.test(name)) return;
    await unlink(path.join(UPLOAD_DIR, name)).catch(() => {});
  },
};

/** Used by the /uploads route handler. */
export async function readLocalImage(name: string) {
  if (!SAFE_NAME.test(name)) return null;
  try {
    const data = await readFile(path.join(UPLOAD_DIR, name));
    return { data, type: IMAGE_TYPES[name.split(".").pop() as Ext] };
  } catch {
    return null;
  }
}

export const storage: ImageStorage = localStorage;
