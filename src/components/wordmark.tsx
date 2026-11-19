import { brand } from "@/config/brand";

/** Text wordmark plus a small keycap. Name and keycap come from config/brand.ts. */
export function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  const lg = size === "lg";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={`wide grid place-items-center rounded-[7px] border border-ink bg-surface font-bold text-ink shadow-[0_2px_0_var(--color-ink)] ${lg ? "size-10 text-xl" : "size-7 text-sm"}`}
      >
        {brand.keycap}
      </span>
      <span className={`wide font-bold text-ink ${lg ? "text-3xl sm:text-4xl" : "text-lg"}`}>
        {brand.wordmark}
      </span>
    </span>
  );
}
