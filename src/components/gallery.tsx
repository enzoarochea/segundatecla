"use client";
import Image from "next/image";
import { useState, ViewTransition } from "react";
import { ART_NOTE, ART_VIEWS, LaptopArt } from "./laptop-art";
import { artName } from "./laptop-card";

type Photo = { url: string; alt: string };

/** Product gallery: the uploaded photos, or three drawn views when there are none. */
export function Gallery({ slug, name, variant, photos }: { slug: string; name: string; variant: string; photos: Photo[] }) {
  const [i, setI] = useState(0);
  const items = photos.length > 0 ? photos.map((p, n) => ({ key: p.url, label: `Foto ${n + 1}` })) : ART_VIEWS.map((v) => ({ key: v.view, label: `Vista ${v.label}` }));
  const current = Math.min(i, items.length - 1);

  const slide = (n: number, thumb = false) =>
    photos.length > 0 ? (
      <Image
        src={photos[n].url}
        alt={thumb ? "" : photos[n].alt || `${name}, foto ${n + 1}`}
        fill
        sizes={thumb ? "5rem" : "(min-width: 1024px) 50vw, 100vw"}
        priority={!thumb && n === 0}
        className="object-cover"
      />
    ) : (
      <LaptopArt variant={variant} label={name} view={ART_VIEWS[n].view} decorative={thumb} className={thumb ? "h-full w-full p-1" : "h-full w-full p-6 sm:p-10"} />
    );

  return (
    <div>
      <div className="card-art rounded-card">
        <ViewTransition name={artName(slug)} share="morph" default="none">
          <div className="absolute inset-0">{slide(current)}</div>
        </ViewTransition>
      </div>
      {photos.length === 0 && <p className="mt-2 text-sm text-ink-2">{ART_NOTE}.{process.env.NEXT_PUBLIC_STATIC !== "1" && " Las fotos reales se agregan desde la administración."}</p>}
      {items.length > 1 && (
        <ul className="mt-3 flex gap-2" aria-label="Elegir imagen">
          {items.map((it, n) => (
            <li key={it.key}>
              <button type="button" className="thumb block h-15 w-20" aria-current={n === current ? "true" : undefined} onClick={() => setI(n)}>
                <span className="sr-only">{it.label}</span>
                <span className="relative block size-full" aria-hidden="true">{slide(n, true)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
