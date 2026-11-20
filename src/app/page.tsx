import Image from "next/image";
import Link from "next/link";
import { ViewTransition, type CSSProperties } from "react";
import { GRADE_KEYS, grades, policies, PROPOSED_POLICY, uses, type Grade } from "@/config/brand";
import { HeroTitle } from "@/components/hero-title";
import { LaptopArt } from "@/components/laptop-art";
import { artName, LaptopCard, specLine } from "@/components/laptop-card";
import { getFeatured, getRecent, getUseSummary, type LaptopCard as Card } from "@/lib/catalog";
import { batteryLevel, batteryWord, formatGtq } from "@/lib/format";

export default async function Home() {
  const [featured, useSummary, recent] = await Promise.all([getFeatured(), getUseSummary(), getRecent(4)]);
  const useRows = useSummary.filter((u) => u.count > 0);

  return (
    <>
      <section className="container-page pt-16 text-center sm:pt-24 lg:pt-28">
        <HeroTitle />
        <p className="fade-up mx-auto mt-2 max-w-[30ch] text-lead text-ink-2">Laptops reacondicionadas, con su estado real a la vista.</p>
        <div className="fade-up mt-9 flex flex-wrap justify-center gap-3" style={{ "--d": "700ms" } as CSSProperties}>
          <Link href="/laptops" className="btn btn-primary">Ver laptops</Link>
          <Link href="/politicas#grados" className="btn btn-secondary">Cómo calificamos</Link>
        </div>
      </section>
      <section aria-label="Laptop destacada" className="container-page py-20 sm:py-28">
        <div className="zoom-in mx-auto max-w-3xl">
          {featured ? <Inspection laptop={featured} /> : <div className="panel p-6 text-ink-2">Todavía no hay laptops publicadas.</div>}
        </div>
      </section>

      <section aria-labelledby="pasos" className="container-page py-20 sm:py-28">
        <h2 id="pasos" className="text-section reveal text-center">Así de simple.</h2>
        <ol className="mx-auto mt-14 grid max-w-3xl gap-16 sm:gap-24">
          {[
            ["Elegí para qué.", "Estudio, oficina, diseño o juegos."],
            ["Mirá su estado.", "Grado, batería y qué incluye. Sin sorpresas."],
            ["Pedila tranquilo.", "Garantía, devoluciones y envío, claros desde el inicio."],
          ].map(([t, d], i) => (
            <li key={t} className="step grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-6 sm:gap-x-10">
              <span className="wide num text-hero text-accent" aria-hidden="true">{i + 1}</span>
              <div>
                <h3 className="wide text-section">{t}</h3>
                <p className="mt-2 text-lead text-ink-2">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {useRows.length > 0 && (
        <section aria-labelledby="usos" className="container-page py-16 sm:py-24">
          <h2 id="usos" className="text-section reveal">¿Para qué la querés?</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {useRows.map(({ use, count, from }) => (
              <li key={use} className="reveal">
                <Link href={`/laptops?uso=${use}`} className="card h-full gap-3 p-5">
                  <span className="text-title">{uses[use].label}</span>
                  <span className="text-sm text-ink-2">{uses[use].hint}</span>
                  <span className="mt-auto text-sm">
                    <span className="num font-semibold">{count === 1 ? "1 disponible" : `${count} disponibles`}</span>
                    {from !== null && <span className="block text-ink-2">desde <span className="num">{formatGtq(from)}</span></span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {recent.length > 0 && (
        <section aria-labelledby="recientes" className="container-page py-16 sm:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="recientes" className="text-section">Recién llegadas</h2>
            <Link href="/laptops" className="link">Ver todas las laptops</Link>
          </div>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((l) => (
              <li key={l.id} className="reveal"><LaptopCard laptop={l} /></li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="estado" className="bg-surface rule-top">
        <div className="container-page grid gap-10 py-20 sm:py-28 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <div>
            <h2 id="estado" className="text-section reveal">Sabés qué te llega.</h2>
            <p className="reveal mt-4 max-w-prose text-lead text-ink-2">Un grado por fuera. La batería medida por dentro.</p>
            <p className="mt-4"><Link href="/politicas#grados" className="link">Leer la escala completa</Link></p>
          </div>
          <ul className="grid gap-4">
            {GRADE_KEYS.map((g) => (
              <li key={g} className="reveal flex items-center gap-5 border-b border-rule pb-4">
                <span className="grade-box grade size-14 shrink-0 text-3xl" aria-hidden="true">{g}</span>
                <div>
                  <h3 className="text-title">Grado {g}, {grades[g].label.toLowerCase()}</h3>
                  <p className="text-ink-2">{grades[g].summary}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="politicas" className="container-page py-20 sm:py-28">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="politicas" className="text-section">Garantía, devoluciones y envíos</h2>
          <span className="tag tag-pending">{PROPOSED_POLICY}</span>
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {[policies.warranty, policies.returns, policies.shipping].map((p) => (
            <li key={p.title} className="reveal panel grid content-start gap-2 p-5">
              <h3 className="text-title">{p.title}</h3>
              <p className="text-ink-2">{p.short}.</p>
            </li>
          ))}
        </ul>
        <p className="mt-6"><Link href="/politicas" className="link">Leer las condiciones propuestas</Link></p>
      </section>
    </>
  );
}

/** The signature: one laptop's inspection card, set big. */
function Inspection({ laptop: l }: { laptop: Card }) {
  const name = `${l.brand} ${l.model}`;
  const photo = l.images[0];
  const level = batteryLevel(l.batteryHealth);
  return (
    <Link href={`/laptops/${l.slug}`} className="card min-w-0">
      <div className="card-art">
        <ViewTransition name={artName(l.slug)} share="morph" default="none">
          <div className="absolute inset-0">
            {photo ? (
              <Image src={photo.url} alt="" fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            ) : (
              <LaptopArt variant={l.artVariant} label={name} decorative className="h-full w-full p-6 sm:p-10" />
            )}
          </div>
        </ViewTransition>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {l.isDemo && <span className="tag tag-pending bg-surface">Dato demo</span>}
          {!photo && <span className="tag bg-surface">Ilustración</span>}
        </div>
      </div>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-4 p-5 sm:p-6">
        <span className="grade-box grade size-20 text-5xl sm:size-24 sm:text-6xl" aria-hidden="true">{l.grade}</span>
        <div className="min-w-0">
          <p className="text-title">{name}</p>
          <p className="mt-1 text-sm text-ink-2">{grades[l.grade as Grade]?.label}, {specLine(l)}</p>
        </div>
        <div className="col-span-2 grid gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-ink-2">Batería, {batteryWord[level].toLowerCase()}</span>
            <span className="num font-semibold">{l.batteryHealth}%</span>
          </div>
          <div className="battery battery-anim" data-level={level} aria-hidden="true">
            <span style={{ "--pct": l.batteryHealth / 100 } as CSSProperties} />
          </div>
        </div>
        <p className="price col-span-2 text-4xl sm:text-5xl">{formatGtq(l.priceGtq)}</p>
      </div>
    </Link>
  );
}
