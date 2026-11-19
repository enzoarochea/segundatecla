"use client";
/**
 * Catalog filters. A plain GET form, so it works without JavaScript; with it,
 * every change updates the URL right away (router.replace in a transition).
 * On phones the filters live in a native popover sheet.
 */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition, type ReactNode } from "react";
import { grades, GRADE_KEYS, uses, USE_KEYS } from "@/config/brand";
import type { Facets } from "@/lib/catalog";
import { activeCount, filtersToSearch, parseFilters, SORTS, type Filters, type RawParams } from "@/lib/filters";
import { formatGtq, formatStorage } from "@/lib/format";

type ListKey = "brands" | "ram" | "storage" | "grades" | "uses";
const NAMES: Record<ListKey, string> = { brands: "marca", ram: "ram", storage: "almacenamiento", grades: "grado", uses: "uso" };

/** Round-trip through the URL format so client and server agree on the shape. */
function normalize(f: Filters): Filters {
  const p = new URLSearchParams(filtersToSearch(f));
  const raw: RawParams = {};
  for (const k of new Set(p.keys())) raw[k] = p.getAll(k);
  return parseFilters(raw);
}

const href = (f: Filters) => `/laptops${filtersToSearch(normalize(f))}`;
const noop = () => () => {};

export function CatalogShell({ filters, facets, count, children }: { filters: Filters; facets: Facets; count: number; children: ReactNode }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const search = filtersToSearch(filters);

  // Local copy so a click shows at once; reset whenever the URL changes underneath.
  const [f, setF] = useState(filters);
  const [price, setPrice] = useState({ min: filters.min?.toString() ?? "", max: filters.max?.toString() ?? "" });
  const [seen, setSeen] = useState(search);
  if (seen !== search) {
    setSeen(search);
    setF(filters);
    setPrice({ min: filters.min?.toString() ?? "", max: filters.max?.toString() ?? "" });
  }
  const latest = useRef(f);
  useEffect(() => {
    latest.current = f;
  });

  function go(next: Filters) {
    const n = normalize(next);
    setF(n);
    latest.current = n;
    start(() => router.replace(href(n), { scroll: false }));
  }

  function toggle(key: ListKey, value: string | number) {
    const list = f[key] as (string | number)[];
    go({ ...f, [key]: list.includes(value) ? list.filter((x) => x !== value) : [...list, value] });
  }

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function onPrice(which: "min" | "max", value: string) {
    setPrice((p) => ({ ...p, [which]: value }));
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const v = parseFilters({ min: value }).min;
      go({ ...latest.current, [which]: v });
    }, 600);
  }

  const sheet = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = sheet.current;
    const onToggle = (e: Event) => {
      if ((e as ToggleEvent).newState === "open") closeBtn.current?.focus();
    };
    el?.addEventListener("toggle", onToggle);
    return () => el?.removeEventListener("toggle", onToggle);
  }, []);

  const n = activeCount(f);
  const cleared = { ...parseFilters({}), sort: f.sort };

  const chips: { label: string; next: Filters }[] = [
    ...f.brands.map((v) => ({ label: v, next: { ...f, brands: f.brands.filter((x) => x !== v) } })),
    ...f.ram.map((v) => ({ label: `${v} GB RAM`, next: { ...f, ram: f.ram.filter((x) => x !== v) } })),
    ...f.storage.map((v) => ({ label: `${formatStorage(v)} de almacenamiento`, next: { ...f, storage: f.storage.filter((x) => x !== v) } })),
    ...(f.min !== undefined ? [{ label: `Desde ${formatGtq(f.min)}`, next: { ...f, min: undefined } }] : []),
    ...(f.max !== undefined ? [{ label: `Hasta ${formatGtq(f.max)}`, next: { ...f, max: undefined } }] : []),
    ...f.grades.map((v) => ({ label: `Grado ${v}`, next: { ...f, grades: f.grades.filter((x) => x !== v) } })),
    ...f.uses.map((v) => ({ label: uses[v].label, next: { ...f, uses: f.uses.filter((x) => x !== v) } })),
  ];

  const group = (key: ListKey, legend: string, options: { value: string | number; label: string }[]) =>
    options.length > 0 && (
      <fieldset className="grid gap-3">
        <legend className="mb-3 font-semibold">{legend}</legend>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <label key={o.value} className="pill">
              <input
                type="checkbox"
                name={NAMES[key]}
                value={o.value}
                checked={(f[key] as (string | number)[]).includes(o.value)}
                onChange={() => toggle(key, o.value)}
              />
              <span className="tick" aria-hidden="true">
                <svg viewBox="0 0 12 12" width="10" height="10">
                  <path d="M2.5 6.3 5 8.6l4.5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
    );

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[17.5rem_minmax(0,1fr)] lg:gap-10">
      <form
        id="filtros-form"
        action={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/laptops`}
        method="get"
        className="lg:sticky lg:top-24 lg:self-start"
        onSubmit={(e) => {
          e.preventDefault();
          clearTimeout(timer.current);
          const data = new FormData(e.currentTarget);
          const raw: RawParams = {};
          for (const k of new Set(data.keys())) raw[k] = data.getAll(k).map(String);
          go(parseFilters(raw));
          sheet.current?.hidePopover?.();
        }}
      >
        <div id="filtros" ref={sheet} popover="auto" className="filters" aria-labelledby="filtros-titulo">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-rule bg-surface px-5 py-3 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:pb-5">
            <h2 id="filtros-titulo" className="text-title">Filtros</h2>
            <button ref={closeBtn} type="button" popoverTarget="filtros" popoverTargetAction="hide" className="btn btn-secondary btn-sm lg:hidden">
              Cerrar
            </button>
          </div>

          <div className="grid gap-7 px-5 py-6 lg:p-0">
            {group("brands", "Marca", facets.brands.map((b) => ({ value: b, label: b })))}
            {group("ram", "Memoria RAM", facets.ram.map((r) => ({ value: r, label: `${r} GB` })))}
            {group("storage", "Almacenamiento", facets.storage.map((s) => ({ value: s, label: formatStorage(s) })))}

            <fieldset>
              <legend className="mb-3 font-semibold">Precio en quetzales</legend>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="f-min" className="label font-normal">Desde</label>
                  <input id="f-min" name="min" type="number" inputMode="numeric" min={0} step={100} className="input num" placeholder={String(facets.minPrice)} value={price.min} onChange={(e) => onPrice("min", e.target.value)} />
                </div>
                <div>
                  <label htmlFor="f-max" className="label font-normal">Hasta</label>
                  <input id="f-max" name="max" type="number" inputMode="numeric" min={0} step={100} className="input num" placeholder={String(facets.maxPrice)} value={price.max} onChange={(e) => onPrice("max", e.target.value)} />
                </div>
              </div>
            </fieldset>

            {group("grades", "Estado cosmético", GRADE_KEYS.map((g) => ({ value: g, label: `${g}, ${grades[g].label.toLowerCase()}` })))}
            {group("uses", "Para qué la vas a usar", USE_KEYS.map((u) => ({ value: u, label: uses[u].label })))}
            <p className="text-sm text-ink-2">
              <Link href="/politicas#grados" className="link">Cómo calificamos el estado</Link>
            </p>
          </div>

          <div className="sticky bottom-0 flex gap-3 border-t border-rule bg-surface px-5 py-4 lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:pt-6">
            <button type="submit" className={`btn btn-primary flex-1 ${hydrated ? "lg:hidden" : ""}`}>
              Ver resultados
            </button>
            {n > 0 && (
              <button type="button" className="btn btn-secondary" onClick={() => go(cleared)}>
                Quitar filtros
              </button>
            )}
          </div>
        </div>
      </form>

      <section aria-labelledby="resultados-titulo" className="min-w-0">
        <h2 id="resultados-titulo" className="visually-hidden">Resultados</h2>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button type="button" popoverTarget="filtros" className="btn btn-secondary lg:hidden">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                <path d="M2 4h12M4.5 8h7M7 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
              </svg>
              Filtros{n > 0 && <span className="num"> ({n})</span>}
            </button>
            <p aria-live="polite" className="num text-ink-2">
              {count === 1 ? "1 laptop" : `${count} laptops`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="f-orden" className="text-sm text-ink-2">Ordenar</label>
            <select id="f-orden" name="orden" form="filtros-form" className="input w-auto min-w-48" value={f.sort} onChange={(e) => go({ ...f, sort: e.target.value as Filters["sort"] })}>
              {Object.entries(SORTS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {chips.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Filtros activos">
            {chips.map((c) => (
              <li key={c.label}>
                <Link href={href(c.next)} replace scroll={false} className="chip" aria-label={`Quitar filtro: ${c.label}`} onClick={() => setF(normalize(c.next))}>
                  {c.label}
                  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
                    <path d="m5 5 6 6m0-6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="results mt-6" data-pending={pending} aria-busy={pending}>
          {children}
        </div>
      </section>
    </div>
  );
}
