import type { Metadata } from "next";
import Link from "next/link";
import { battery, GRADE_KEYS, grades, policies, PROPOSED_POLICY } from "@/config/brand";

export const metadata: Metadata = {
  title: "Cómo calificamos, garantía y envíos",
  description: "La escala de estado cosmético, cómo medimos la batería y las condiciones propuestas de garantía, devoluciones y envíos.",
  alternates: { canonical: "/politicas" },
};

const Proposed = () => <span className="tag tag-pending">{PROPOSED_POLICY}</span>;

export default function PoliciesPage() {
  return (
    <div className="container-page grid gap-14 py-10 sm:py-14">
      <div>
        <h1 className="text-section">Cómo calificamos, garantía y envíos</h1>
        <p className="mt-3 max-w-prose text-ink-2">
          Todo lo de esta página es una propuesta que la tienda todavía tiene que confirmar. No es un contrato.
        </p>
      </div>

      <section id="grados" aria-labelledby="grados-t" className="grid gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="grados-t" className="text-title">Estado cosmético</h2>
          <Proposed />
        </div>
        <ul className="grid gap-4 md:grid-cols-3">
          {GRADE_KEYS.map((g) => (
            <li key={g} className="panel grid content-start gap-3 p-5">
              <span className="grade-box grade size-14 text-3xl" aria-hidden="true">{g}</span>
              <h3 className="text-title">Grado {g}, {grades[g].label.toLowerCase()}</h3>
              <p className="font-medium">{grades[g].summary}</p>
              <p className="text-ink-2">{grades[g].detail}</p>
            </li>
          ))}
        </ul>
        <p className="max-w-prose text-ink-2">El grado habla solo del aspecto. Todas se revisan por dentro antes de publicarse, sin importar el grado.</p>
      </section>

      <section id="bateria" aria-labelledby="bateria-t" className="grid max-w-prose gap-3">
        <h2 id="bateria-t" className="text-title">Salud de la batería</h2>
        <p>{battery.explain}</p>
        <ul className="grid gap-1 text-ink-2">
          <li><span className="num font-semibold text-ink">{battery.good}% o más</span>: muy buena.</li>
          <li><span className="num font-semibold text-ink">{battery.fair}% a {battery.good - 1}%</span>: buena.</li>
          <li><span className="num font-semibold text-ink">Menos de {battery.fair}%</span>: regular, conviene usarla conectada.</li>
        </ul>
      </section>

      <div className="rule-top grid gap-10 pt-10 md:grid-cols-3">
        {([
          ["garantia", policies.warranty],
          ["devoluciones", policies.returns],
          ["envios", policies.shipping],
        ] as const).map(([id, p]) => (
          <section key={id} id={id} aria-labelledby={`${id}-t`} className="grid content-start gap-3">
            <h2 id={`${id}-t`} className="text-title">{p.title}</h2>
            <Proposed />
            <p className="font-medium">{p.short}.</p>
            <ul className="grid list-disc gap-2 pl-5 text-ink-2">
              {p.points.map((x) => <li key={x}>{x}</li>)}
            </ul>
          </section>
        ))}
      </div>

      <p><Link href="/laptops" className="btn btn-primary">Ver laptops</Link></p>
    </div>
  );
}
