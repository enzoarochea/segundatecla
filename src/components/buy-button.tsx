"use client";
import { useEffect, useState, useTransition } from "react";
import { startPurchase, type PurchaseItem } from "@/lib/purchase";

/** "Lo quiero": idle, pending, sold out, and the coming-soon notice. */
export function BuyButton({ item, soldOut }: { item: PurchaseItem; soldOut: boolean }) {
  const [pending, start] = useTransition();
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(t);
  }, [notice]);

  if (soldOut) {
    return (
      <button type="button" className="btn btn-secondary w-full sm:w-auto" disabled>
        Agotada
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary w-full sm:w-auto sm:min-w-56"
        aria-busy={pending}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await startPurchase(item);
            if (r.status === "redirect") window.location.assign(r.url);
            else setNotice(r.message);
          })
        }
      >
        {pending && <span className="spinner" aria-hidden="true" />}
        {pending ? "Un momento" : "Lo quiero"}
      </button>
      <div role="status" aria-live="polite">
        {notice && (
          <div className="toast">
            <span>{notice}. Mientras tanto, guardá el enlace de esta laptop.</span>
            <button type="button" className="rounded-control px-1 text-paper underline" onClick={() => setNotice(null)}>
              Cerrar
            </button>
          </div>
        )}
      </div>
    </>
  );
}
