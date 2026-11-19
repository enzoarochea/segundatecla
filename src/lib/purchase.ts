/**
 * THE one place a purchase starts. Every "Lo quiero" button calls this.
 * Today there is no cart or payment, so it only reports "coming soon".
 * To go live: make this call a checkout server action or redirect to a
 * payment provider and return { status: "redirect", url }.
 */
export type PurchaseItem = { slug: string; name: string; priceGtq: number };

export type PurchaseResult =
  | { status: "coming-soon"; message: string }
  | { status: "redirect"; url: string };

export const COMING_SOON = "Compra disponible pronto";

export async function startPurchase(item: PurchaseItem): Promise<PurchaseResult> {
  void item;
  return { status: "coming-soon", message: COMING_SOON };
}
