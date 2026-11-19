import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminBar } from "@/components/admin/admin-bar";
import { ConfirmForm, QuickEdit, SubmitButton } from "@/components/admin/controls";
import { specLine } from "@/components/laptop-card";
import { deleteLaptopAction, toggleHiddenAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatGtq } from "@/lib/format";

export const metadata: Metadata = { title: "Inventario" };

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96 w-full" />}>
      <Inventory />
    </Suspense>
  );
}

async function Inventory() {
  const admin = await requireAdmin();
  const laptops = await db.laptop.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { images: true } } },
  });
  const visible = laptops.filter((l) => !l.hidden).length;

  return (
    <>
      <AdminBar email={admin.email} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-section">Inventario</h1>
          <p className="mt-1 text-ink-2">
            {laptops.length} laptops, {visible} publicadas.
          </p>
        </div>
        <Link href="/admin/laptops/nueva" className="btn btn-primary">Agregar laptop</Link>
      </div>

      {laptops.length === 0 ? (
        <p className="panel p-6 text-ink-2">Todavía no hay laptops. Agregá la primera.</p>
      ) : (
        <ul className="grid gap-4">
          {laptops.map((l) => {
            const name = `${l.brand} ${l.model}`;
            return (
              <li key={l.id} className="panel grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
                <div className="min-w-0">
                  <h2 className="text-title">
                    <Link className="link" href={`/admin/laptops/${l.id}`}>{name}</Link>
                  </h2>
                  <p className="hint mt-1">
                    {specLine(l)}, grado {l.grade}, {formatGtq(l.priceGtq)}, {l._count.images} fotos
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {l.hidden ? <span className="tag tag-alert">Oculta</span> : <span className="tag tag-accent">Publicada</span>}
                    {l.stock === 0 && <span className="tag">Agotada</span>}
                    {l.isDemo && <span className="tag tag-pending">Dato demo</span>}
                  </div>
                </div>
                <QuickEdit id={l.id} name={name} priceGtq={l.priceGtq} stock={l.stock} />
                <div className="flex flex-wrap gap-2">
                  <Link href={`/admin/laptops/${l.id}`} className="btn btn-secondary btn-sm">Editar</Link>
                  <form action={toggleHiddenAction}>
                    <input type="hidden" name="id" value={l.id} />
                    <SubmitButton className="btn btn-secondary btn-sm" pendingText="Cambiando">
                      {l.hidden ? "Publicar" : "Ocultar"}
                    </SubmitButton>
                  </form>
                  <ConfirmForm action={deleteLaptopAction} fields={{ id: l.id }}
                    question={`¿Eliminar ${name}? Se borran también sus fotos. No se puede deshacer.`}>
                    Eliminar
                  </ConfirmForm>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
