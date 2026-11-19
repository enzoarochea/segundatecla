"use client";
/** GitHub Pages build only: no server to read ?filters, so the full list ships and is filtered here. */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CatalogShell } from "./catalog-shell";
import { LaptopCard } from "./laptop-card";
import type { Facets, LaptopCard as Card } from "@/lib/catalog";
import { applyFilters, parseFilters, type RawParams } from "@/lib/filters";

export function StaticCatalog({ all, facets }: { all: Card[]; facets: Facets }) {
  const sp = useSearchParams();
  const raw: RawParams = {};
  for (const k of new Set(sp.keys())) raw[k] = sp.getAll(k);
  const filters = parseFilters(raw);
  const laptops = applyFilters(all, filters);
  return (
    <CatalogShell filters={filters} facets={facets} count={laptops.length}>
      {laptops.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {laptops.map((l) => (
            <li key={l.id}>
              <LaptopCard laptop={l} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel grid justify-items-start gap-3 p-6">
          <p className="text-title">No hay laptops con esos filtros.</p>
          <p className="text-ink-2">Probá quitando alguno o ampliando el rango de precio.</p>
          <Link href="/laptops" className="btn btn-secondary">Quitar filtros</Link>
        </div>
      )}
    </CatalogShell>
  );
}
