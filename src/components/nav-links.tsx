"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV = [
  { href: "/laptops", label: "Laptops" },
  { href: "/politicas#grados", label: "Cómo calificamos" },
  { href: "/politicas", label: "Garantía y envíos" },
] as const;

/** Header links; marks the current section with aria-current. */
export function NavLinks() {
  const path = usePathname();
  return <Links current={path} />;
}

export function Links({ current }: { current?: string }) {
  return (
    <ul className="flex items-center gap-x-3 sm:gap-x-5">
      {NAV.map((item, i) => {
        const base = item.href.split("#")[0];
        // The two /politicas links share a page; only the plain one gets the marker.
        const active = !item.href.includes("#") && current?.startsWith(base);
        return (
          <li key={item.href} className={i === 1 ? "hidden md:block" : undefined}>
            <Link href={item.href} className="nav-link text-[0.9375rem]" aria-current={active ? "page" : undefined}>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
