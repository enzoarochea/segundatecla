import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AdminBar } from "@/components/admin/admin-bar";
import { ConfirmForm } from "@/components/admin/controls";
import { LaptopForm } from "@/components/admin/laptop-form";
import { PhotoManager } from "@/components/admin/photos";
import { deleteLaptopAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { idSchema, laptopToFormValues } from "@/lib/validation";

export const metadata: Metadata = { title: "Editar laptop" };

type Props = PageProps<"/admin/laptops/[id]">;

export default function EditLaptopPage({ params, searchParams }: Props) {
  return (
    <Suspense fallback={<div className="skeleton h-96 w-full" />}>
      <EditLaptop params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditLaptop({ params, searchParams }: Props) {
  const admin = await requireAdmin();
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const laptop = await db.laptop.findUnique({
    where: { id: id.data },
    include: { images: { orderBy: { position: "asc" }, select: { id: true, url: true, alt: true } } },
  });
  if (!laptop) notFound();
  const created = (await searchParams).creada === "1";
  const name = `${laptop.brand} ${laptop.model}`;

  return (
    <>
      <AdminBar email={admin.email} />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-section">{name}</h1>
          <p className="mt-1 text-ink-2">
            {laptop.hidden ? (
              "Oculta: no aparece en la tienda."
            ) : (
              <Link className="link" href={`/laptops/${laptop.slug}`}>Ver en la tienda</Link>
            )}
          </p>
        </div>
        <ConfirmForm action={deleteLaptopAction} fields={{ id: laptop.id }}
          question={`¿Eliminar ${name}? Se borran también sus fotos. No se puede deshacer.`}
          className="btn btn-danger">
          Eliminar laptop
        </ConfirmForm>
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-start">
        <LaptopForm id={laptop.id} initial={laptopToFormValues(laptop)} notice={created ? "Laptop creada. Ahora podés subir sus fotos." : undefined} />
        <PhotoManager laptopId={laptop.id} photos={laptop.images} />
      </div>
    </>
  );
}
