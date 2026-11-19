import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, ViewTransition } from "react";
import { CatalogShell } from "@/components/catalog-shell";
import { LaptopCard } from "@/components/laptop-card";
import { StaticCatalog } from "@/components/static-catalog";
import { getCatalog, getFacets } from "@/lib/catalog";
import { filtersToSearch, parseFilters } from "@/lib/filters";

export const metadata: Metadata = {
  title: "Laptops",
  description: "Todas las laptops reacondicionadas disponibles, con filtros por marca, memoria, almacenamiento, precio, estado y uso.",
  alternates: { canonical: "/laptops" },
};

export default function LaptopsPage({ searchParams }: PageProps<"/laptops">) {
  return (
    <div className="container-page py-10 sm:py-14">
      <h1 className="text-section">Laptops</h1>
      <p className="mt-2 max-w-prose text-ink-2">Cada una con su grado, su batería medida y lo que incluye.</p>
      <Suspense fallback={<CatalogSkeleton />}>
        {process.env.NEXT_PUBLIC_STATIC === "1" ? <StaticList /> : <Catalog searchParams={searchParams} />}
      </Suspense>
    </div>
  );
}

async function Catalog({ searchParams }: { searchParams: PageProps<"/laptops">["searchParams"] }) {
  const filters = parseFilters(await searchParams);
  const search = filtersToSearch(filters);
  const [laptops, facets] = await Promise.all([getCatalog(filters), getFacets()]);
  return (
    <CatalogShell filters={filters} facets={facets} count={laptops.length}>
      <ViewTransition key={search} name="results" share="auto" enter="auto" default="none">
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
      </ViewTransition>
    </CatalogShell>
  );
}

async function StaticList() {
  const [all, facets] = await Promise.all([getCatalog(parseFilters({})), getFacets()]);
  return <StaticCatalog all={all} facets={facets} />;
}

function CatalogSkeleton() {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-10" aria-hidden="true">
      <div className="skeleton hidden h-96 lg:block" />
      <div>
        <div className="skeleton h-11 w-40" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton aspect-[4/5]" />
          ))}
        </div>
      </div>
    </div>
  );
}
