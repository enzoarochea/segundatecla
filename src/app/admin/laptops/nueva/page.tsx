import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminBar } from "@/components/admin/admin-bar";
import { LaptopForm } from "@/components/admin/laptop-form";
import { requireAdmin } from "@/lib/auth";
import { emptyLaptopForm } from "@/lib/validation";

export const metadata: Metadata = { title: "Agregar laptop" };

export default function NewLaptopPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96 w-full" />}>
      <NewLaptop />
    </Suspense>
  );
}

async function NewLaptop() {
  const admin = await requireAdmin();
  return (
    <>
      <AdminBar email={admin.email} />
      <h1 className="mb-2 text-section">Agregar laptop</h1>
      <p className="mb-8 text-ink-2">Las fotos se suben después de crearla.</p>
      <LaptopForm initial={emptyLaptopForm} />
    </>
  );
}
