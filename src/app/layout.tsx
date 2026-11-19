import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type CSSProperties } from "react";
import { brand, PENDING, PROPOSED_POLICY } from "@/config/brand";
import { bodyFont, displayFont } from "@/config/fonts";
import { Links, NavLinks } from "@/components/nav-links";
import { Wordmark } from "@/components/wordmark";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
  title: { default: `${brand.name}: ${brand.tagline}`, template: `%s · ${brand.name}` },
  description: brand.description,
  openGraph: { siteName: brand.name, locale: "es_GT", type: "website" },
};

// brand.ts colours -> the CSS variables globals.css maps into Tailwind tokens.
const c = brand.colors;
const brandVars = {
  "--brand-paper": c.paper,
  "--brand-surface": c.surface,
  "--brand-sunken": c.sunken,
  "--brand-ink": c.ink,
  "--brand-ink-soft": c.inkSoft,
  "--brand-line": c.line,
  "--brand-accent": c.accent,
  "--brand-accent-strong": c.accentStrong,
  "--brand-accent-wash": c.accentWash,
  "--brand-signal": c.signal,
  "--brand-signal-hover": c.signalHover,
  "--brand-alert": c.alert,
  "--brand-focus": c.focus,
} as CSSProperties;

const contactRows = [
  ["WhatsApp", brand.contact.whatsapp],
  ["Correo", brand.contact.email],
  ["Dirección", brand.contact.address],
  ["Horario", brand.contact.hours],
] as const;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={brand.locale} className={`${displayFont.variable} ${bodyFont.variable}`} style={brandVars}>
      <body>
        <a href="#contenido" className="skip">
          Saltar al contenido
        </a>
        <header className="site-header">
          <nav aria-label="Principal" className="container-page flex min-h-16 items-center justify-between gap-4">
            <Link href="/" className="rounded-control">
              <Wordmark />
            </Link>
            <Suspense fallback={<Links />}>
              <NavLinks />
            </Suspense>
          </nav>
        </header>

        <main id="contenido" className="flex-1">
          {children}
        </main>

        <footer className="rule-top mt-24 bg-surface">
          <div className="container-page grid gap-10 py-14">
            <Wordmark size="lg" />
            <div className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.3fr)]">
              <div>
                <h2 className="mb-3 text-base font-semibold">Tienda</h2>
                <ul className="grid gap-2 text-ink-2">
                  <li><Link className="link" href="/laptops">Todas las laptops</Link></li>
                  <li><Link className="link" href="/politicas#grados">Cómo calificamos el estado</Link></li>
                  <li><Link className="link" href="/politicas">Garantía, devoluciones y envíos</Link></li>
                </ul>
              </div>
              <div>
                <h2 className="mb-3 text-base font-semibold">Contacto</h2>
                <dl className="grid gap-2 text-ink-2">
                  {contactRows.map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <dt>{label}:</dt>
                      <dd className={value ? "text-ink" : "pending"}>{value ?? PENDING}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="grid content-start gap-3 text-sm text-ink-2">
                <p>
                  <span className="tag tag-pending">Dato demo</span> Los equipos, precios y fotos de esta tienda son de demostración.
                </p>
                <p>Garantía, devoluciones y envíos: {PROPOSED_POLICY.toLowerCase()}.</p>
                {process.env.NEXT_PUBLIC_STATIC !== "1" && (
                  <p>
                    <Link className="link" href="/admin">Administración</Link>
                  </p>
                )}
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
