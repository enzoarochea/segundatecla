import type { MetadataRoute } from "next";
import { getVisibleSlugs } from "@/lib/catalog";

const site = process.env.SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getVisibleSlugs();
  return [
    { url: `${site}/` },
    { url: `${site}/laptops` },
    { url: `${site}/politicas` },
    ...slugs.map((s) => ({ url: `${site}/laptops/${s}` })),
  ];
}
