import { readLocalImage } from "@/lib/storage";

// Serves admin-uploaded photos from ./uploads. Names are validated in readLocalImage (uuid + ext only).
export async function GET(_req: Request, { params }: RouteContext<"/uploads/[file]">) {
  const img = await readLocalImage((await params).file);
  if (!img) return new Response("No encontrado", { status: 404 });
  return new Response(new Uint8Array(img.data), {
    headers: {
      "Content-Type": img.type,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
