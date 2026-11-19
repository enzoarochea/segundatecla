/** Brand fonts, self-hosted at build time by next/font. Change the faces here. */
import { Archivo, Onest } from "next/font/google";

/** Display: Archivo with its width axis, set wide for grades and prices. */
export const displayFont = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--ff-display",
  display: "swap",
});

/** Body and labels. */
export const bodyFont = Onest({
  subsets: ["latin"],
  variable: "--ff-body",
  display: "swap",
});
