import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type CSSProperties } from "react";
import { battery, brand, grades, policies, PROPOSED_POLICY, uses, type Grade } from "@/config/brand";
import { BuyButton } from "@/components/buy-button";
import { Gallery } from "@/components/gallery";
import { LaptopCard } from "@/components/laptop-card";
import { getLaptopBySlug, getRelated, getVisibleSlugs } from "@/lib/catalog";
import { batteryLevel, batteryWord, formatGtq, formatStorage, parseLines, parseUses } from "@/lib/format";

type Props = PageProps<"/laptops/[slug]">;

export async function generateStaticParams() {
  const slugs = await getVisibleSlugs();
  // Cache Components needs at least one param; "_" renders the not-found page.
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = await getLaptopBySlug((await params).slug);
  if (!l) return { title: "Laptop no encontrada" };
  const name = `${l.brand} ${l.model}`;
  return {
    title: name,
    description: `${name} reacondicionada, grado ${l.grade}, batería al ${l.batteryHealth}%, ${l.ramGb} GB de RAM. ${formatGtq(l.priceGtq)}.`,
    alternates: { canonical: `/laptops/${l.slug}` },
  };
}

export default function LaptopPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="container-page py-10"><div className="skeleton aspect-[4/3] w-full lg:w-1/2" /></div>}>
      <Product params={params} />
    </Suspense>
  );
}

async function Product({ params }: { params: Props["params"] }) {
  const l = await getLaptopBySlug((await params).slug);
  if (!l) notFound();

  const name = `${l.brand} ${l.model}`;
  const grade = grades[l.grade as Grade];
  const level = batteryLevel(l.batteryHealth);
  const soldOut = l.stock < 1;
  const includes = parseLines(l.includes);
  const useList = parseUses(l.uses);
  const related = await getRelated(l.id, l.priceGtq, l.uses);

  const specs: [string, string][] = [
    ["Procesador", l.cpu],
    ["Memoria RAM", `${l.ramGb} GB`],
    ["Almacenamiento", `${formatStorage(l.storageGb)} ${l.storageType}`],
    ["Pantalla", `${l.screenIn} pulgadas`],
    ["Gráficos", l.gpu || "Integrados"],
    ["Sistema", l.os],
    ...(l.year ? ([["Año", String(l.year)]] as [string, string][]) : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    brand: { "@type": "Brand", name: l.brand },
    description: l.description || undefined,
    image: l.images.map((i) => i.url),
    offers: {
      "@type": "Offer",
      price: l.priceGtq,
      priceCurrency: brand.currency,
      itemCondition: "https://schema.org/RefurbishedCondition",
      availability: soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
  };

  return (
    <article className="container-page py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Ruta" className="text-sm text-ink-2">
        <ol className="flex flex-wrap gap-2">
          <li><Link href="/laptops" className="link">Laptops</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink">{name}</li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
        <Gallery slug={l.slug} name={name} variant={l.artVariant} photos={l.images.map((i) => ({ url: i.url, alt: i.alt }))} />

        <div className="grid content-start gap-6">
          <div>
            <div className="flex flex-wrap gap-2">
              {l.isDemo && <span className="tag tag-pending">Dato demo, no es un equipo real</span>}
              {soldOut ? <span className="tag tag-alert">Agotada</span> : <span className="tag tag-accent">{l.stock === 1 ? "Queda 1" : `Quedan ${l.stock}`}</span>}
            </div>
            <h1 className="wide mt-3 text-section">{name}</h1>
            <p className="mt-1 text-ink-2">{l.cpu}, {l.ramGb} GB de RAM, {formatStorage(l.storageGb)} {l.storageType}</p>
          </div>

          <div className="grid gap-3">
            <p className="price text-display">{formatGtq(l.priceGtq)}</p>
            <BuyButton item={{ slug: l.slug, name, priceGtq: l.priceGtq }} soldOut={soldOut} />
          </div>

          <section aria-labelledby="estado" className="panel grid gap-3 p-5">
            <div className="flex items-center gap-4">
              <span className="grade-box grade size-16 text-4xl" aria-hidden="true">{l.grade}</span>
              <div>
                <h2 id="estado" className="text-title">Grado {l.grade}, {grade.label.toLowerCase()}</h2>
                <p className="text-ink-2">{grade.summary}</p>
              </div>
            </div>
            <p>{grade.detail}</p>
            {l.cosmeticNotes && <p><span className="font-semibold">En esta laptop:</span> {l.cosmeticNotes}</p>}
            <p className="text-sm"><Link href="/politicas#grados" className="link">Cómo calificamos el estado</Link></p>
          </section>

          <section aria-labelledby="bateria" className="panel grid gap-3 p-5">
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="bateria" className="text-title">Batería</h2>
              <p><span className="num text-2xl font-semibold">{l.batteryHealth}%</span> <span className="text-ink-2">{batteryWord[level].toLowerCase()}</span></p>
            </div>
            <div className="battery battery-anim" data-level={level} role="meter" aria-valuenow={l.batteryHealth} aria-valuemin={0} aria-valuemax={100} aria-label="Salud de la batería">
              <span style={{ "--pct": l.batteryHealth / 100 } as CSSProperties} />
            </div>
            <p className="text-sm text-ink-2">{battery.explain}</p>
          </section>

          <section aria-labelledby="garantia" className="grid gap-2">
            <h2 id="garantia" className="text-title">{policies.warranty.title}</h2>
            <p>{policies.warranty.short}. {policies.returns.short}.</p>
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <span className="tag tag-pending">{PROPOSED_POLICY}</span>
              <Link href="/politicas#garantia" className="link">Leer las condiciones</Link>
            </p>
          </section>
        </div>
      </div>

      <div className="rule-top mt-12 grid gap-10 pt-10 lg:grid-cols-2 lg:gap-14">
        <section aria-labelledby="specs">
          <h2 id="specs" className="text-title">Especificaciones</h2>
          <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6">
            {specs.map(([k, v]) => (
              <div key={k} className="col-span-2 grid grid-cols-subgrid border-b border-rule py-3">
                <dt className="text-ink-2">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="grid content-start gap-10">
          <section aria-labelledby="incluye">
            <h2 id="incluye" className="text-title">Qué incluye</h2>
            {includes.length ? (
              <ul className="mt-4 grid gap-2">
                {includes.map((x) => (
                  <li key={x} className="flex gap-3">
                    <svg viewBox="0 0 16 16" width="16" height="16" className="mt-1 shrink-0 stroke-accent" aria-hidden="true">
                      <path d="M3 8.4 6.4 11.5 13 4.5" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {x}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4"><span className="pending">Por confirmar</span></p>
            )}
          </section>

          {useList.length > 0 && (
            <section aria-labelledby="usos">
              <h2 id="usos" className="text-title">Te sirve para</h2>
              <ul className="mt-4 grid gap-3">
                {useList.map((u) => (
                  <li key={u}>
                    <Link href={`/laptops?uso=${u}`} className="link font-semibold">{uses[u].label}</Link>
                    <p className="text-sm text-ink-2">{uses[u].hint}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {l.description && (
            <section aria-labelledby="descripcion">
              <h2 id="descripcion" className="text-title">Sobre esta laptop</h2>
              <p className="mt-4 max-w-prose">{l.description}</p>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="relacionadas" className="rule-top mt-12 pt-10">
          <h2 id="relacionadas" className="text-section">También te puede servir</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.id} className="reveal"><LaptopCard laptop={r} /></li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
