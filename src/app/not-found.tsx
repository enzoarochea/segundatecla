import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid justify-items-start gap-4 py-16 sm:py-24">
      <h1 className="text-section">No encontramos esa página.</h1>
      <p className="max-w-prose text-ink-2">Puede que la laptop ya no esté publicada o que el enlace tenga un error.</p>
      <Link href="/laptops" className="btn btn-primary">Ver laptops disponibles</Link>
    </div>
  );
}
