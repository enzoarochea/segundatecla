import Link from "next/link";
import { logoutAction } from "@/app/admin/actions";
import { SubmitButton } from "./controls";

/** Top of every signed-in admin page. */
export function AdminBar({ email }: { email: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
      <nav aria-label="Administración" className="flex flex-wrap gap-x-5 gap-y-2">
        <Link className="link" href="/admin">Inventario</Link>
        <Link className="link" href="/admin/laptops/nueva">Agregar laptop</Link>
        <Link className="link" href="/laptops">Ver la tienda</Link>
      </nav>
      <form action={logoutAction} className="flex items-center gap-3">
        <span className="hint break-all">{email}</span>
        <SubmitButton className="btn btn-secondary btn-sm" pendingText="Saliendo">Salir</SubmitButton>
      </form>
    </div>
  );
}
