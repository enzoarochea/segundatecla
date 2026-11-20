import Image from "next/image";
import { brand } from "@/config/brand";
import mark from "@/assets/logo-mark.png";
import { BrandSpark } from "@/components/brand-spark";

/** Logo mark (IOS) plus the store name. `spark` traces the mark in lightning over the static image. */
export function Wordmark({ size = "md", spark = false }: { size?: "md" | "lg"; spark?: boolean }) {
  const lg = size === "lg";
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-flex">
        <Image src={mark} alt="" className={`w-auto ${lg ? "h-12" : "h-8"}`} priority={!lg} />
        {spark && (
          // Box three times the mark's size with scale 1/3: the outline sits on the image and the halo has room.
          <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[300%] w-[300%] -translate-x-1/2 -translate-y-1/2">
            <BrandSpark />
          </span>
        )}
      </span>
      <span className={`wide font-bold uppercase text-accent-strong ${lg ? "text-2xl sm:text-3xl" : "sr-only sm:not-sr-only sm:text-base"}`}>
        {brand.wordmark}
      </span>
    </span>
  );
}
