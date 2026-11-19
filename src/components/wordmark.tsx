import Image from "next/image";
import { brand } from "@/config/brand";
import mark from "@/assets/logo-mark.png";

/** Logo mark (IOS) plus the store name. Name comes from config/brand.ts. */
export function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <span className="inline-flex items-center gap-2">
      <Image src={mark} alt="" className={`w-auto ${lg ? "h-12" : "h-8"}`} priority={!lg} />
      <span className={`wide font-bold uppercase text-accent-strong ${lg ? "text-2xl sm:text-3xl" : "sr-only sm:not-sr-only sm:text-base"}`}>
        {brand.wordmark}
      </span>
    </span>
  );
}
