"use client";
/** Small admin form pieces: pending-aware submit, confirm-before-submit, inline price/stock edit. */
import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { quickEditAction, type QuickState } from "@/app/admin/actions";

export function SubmitButton({ children, pendingText = "Guardando", className = "btn btn-primary" }: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} aria-busy={pending} disabled={pending}>
      {pending && <span className="spinner" aria-hidden="true" />}
      {pending ? pendingText : children}
    </button>
  );
}

/** A one-button form that asks before it runs (delete, remove photo). */
export function ConfirmForm({ action, fields, question, children, pendingText = "Eliminando", className = "btn btn-danger btn-sm" }: {
  action: (fd: FormData) => Promise<void>;
  fields: Record<string, string>;
  question: string;
  children: ReactNode;
  pendingText?: string;
  className?: string;
}) {
  return (
    <form action={action} onSubmit={(e) => { if (!window.confirm(question)) e.preventDefault(); }}>
      {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      <SubmitButton className={className} pendingText={pendingText}>{children}</SubmitButton>
    </form>
  );
}

export function QuickEdit({ id, priceGtq, stock, name }: { id: string; priceGtq: number; stock: number; name: string }) {
  const [state, action] = useActionState<QuickState, FormData>(quickEditAction, { n: 0 });
  const msgId = `quick-${id}`;
  return (
    <form action={action} className="flex flex-wrap items-end gap-3" aria-label={`Precio y stock de ${name}`}>
      <input type="hidden" name="id" value={id} />
      <div key={`p${state.n}`}>
        <label className="label" htmlFor={`price-${id}`}>Precio (Q)</label>
        <input id={`price-${id}`} name="priceGtq" className="input num w-32" inputMode="numeric" required
          defaultValue={state.values?.priceGtq ?? priceGtq} aria-describedby={msgId}
          aria-invalid={state.error || undefined} />
      </div>
      <div key={`s${state.n}`}>
        <label className="label" htmlFor={`stock-${id}`}>Stock</label>
        <input id={`stock-${id}`} name="stock" className="input num w-20" inputMode="numeric" required
          defaultValue={state.values?.stock ?? stock} aria-describedby={msgId}
          aria-invalid={state.error || undefined} />
      </div>
      <SubmitButton className="btn btn-secondary btn-sm">Guardar</SubmitButton>
      <p id={msgId} role="status" className={state.error ? "error mt-0 w-full" : "hint w-full"}>{state.message}</p>
    </form>
  );
}
