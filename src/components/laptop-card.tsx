import Image from "next/image";
import Link from "next/link";
import { ViewTransition, type CSSProperties } from "react";
import { grades, type Grade } from "@/config/brand";
import type { LaptopCard as Card } from "@/lib/catalog";
import { batteryLevel, formatGtq, formatStorage } from "@/lib/format";
import { LaptopArt } from "./laptop-art";

export const specLine = (l: Pick<Card, "ramGb" | "storageGb" | "storageType" | "screenIn">) =>
  `${l.ramGb} GB RAM, ${formatStorage(l.storageGb)} ${l.storageType}, ${l.screenIn} pulgadas`;

export const artName = (slug: string) => `laptop-art-${slug}`;

/** Catalog card. The picture morphs into the product page gallery. */
export function LaptopCard({ laptop: l, headingLevel = 3 }: { laptop: Card; headingLevel?: 2 | 3 }) {
  const name = `${l.brand} ${l.model}`;
  const photo = l.images[0];
  const soldOut = l.stock < 1;
  const grade = grades[l.grade as Grade];
  const level = batteryLevel(l.batteryHealth);
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <Link href={`/laptops/${l.slug}`} className="card h-full" data-soldout={soldOut}>
      <div className="card-art">
        <ViewTransition name={artName(l.slug)} share="morph" default="none">
          <div className="absolute inset-0">
            {photo ? (
              <Image src={photo.url} alt={photo.alt || name} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover" />
            ) : (
              <LaptopArt variant={l.artVariant} label={name} decorative className="h-full w-full p-4" />
            )}
          </div>
        </ViewTransition>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {soldOut && <span className="tag tag-alert">Agotada</span>}
          {l.isDemo && <span className="tag tag-pending bg-surface">Dato demo</span>}
          {!photo && <span className="tag bg-surface">Ilustración</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <H className="text-title leading-tight">{name}</H>
            <p className="mt-1 text-sm text-ink-2">{l.cpu}</p>
          </div>
          <span className="grade-box grade size-11 shrink-0 text-2xl" aria-label={`Grado ${l.grade}, ${grade?.label.toLowerCase() ?? ""}`}>
            {l.grade}
          </span>
        </div>
        <p className="text-sm text-ink-2">{specLine(l)}</p>
        <div className="grid gap-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-ink-2">Batería</span>
            <span className="num font-semibold">{l.batteryHealth}%</span>
          </div>
          <div className="battery" data-level={level} aria-hidden="true">
            <span style={{ "--pct": l.batteryHealth / 100 } as CSSProperties} />
          </div>
        </div>
        <p className="price mt-auto text-2xl">{formatGtq(l.priceGtq)}</p>
      </div>
    </Link>
  );
}
