/**
 * Drawn laptop placeholder: never a photo of the real device. Four silhouettes
 * (one per artVariant) and three views for the product gallery. Colours are
 * tokens only. Real photos uploaded in the admin replace it.
 */
export type ArtView = "front" | "side" | "closed";
export const ART_VIEWS: { view: ArtView; label: string }[] = [
  { view: "front", label: "de frente" },
  { view: "side", label: "de perfil" },
  { view: "closed", label: "cerrada" },
];
export const ART_NOTE = "Ilustración, no es foto del equipo";

type Look = {
  lid: { x: number; w: number; h: number; r: number };
  bezel: number;
  body: string; // fill class of the shell
  edge: string; // stroke class
  screen: string;
  ui: string;
  deck: number; // base thickness
  accent?: boolean; // gamer vents and stripes
};

const LOOKS: Record<string, Look> = {
  clasica: { lid: { x: 74, w: 252, h: 166, r: 10 }, bezel: 14, body: "fill-ink-2", edge: "stroke-ink", screen: "fill-accent-wash", ui: "fill-surface", deck: 14 },
  ultrabook: { lid: { x: 66, w: 268, h: 168, r: 12 }, bezel: 7, body: "fill-rule", edge: "stroke-ink-2", screen: "fill-accent-wash", ui: "fill-surface", deck: 9 },
  convertible: { lid: { x: 70, w: 260, h: 172, r: 16 }, bezel: 9, body: "fill-sunken", edge: "stroke-ink-2", screen: "fill-surface", ui: "fill-accent-wash", deck: 11 },
  gamer: { lid: { x: 52, w: 296, h: 178, r: 8 }, bezel: 10, body: "fill-ink", edge: "stroke-ink", screen: "fill-ink-2", ui: "fill-ink", deck: 20, accent: true },
};

type Props = { variant: string; label: string; view?: ArtView; decorative?: boolean; className?: string };

export function LaptopArt({ variant, label, view = "front", decorative, className }: Props) {
  const k = LOOKS[variant] ?? LOOKS.clasica;
  const a11y = decorative
    ? { "aria-hidden": true as const }
    : { role: "img" as const, "aria-label": `Ilustración de una ${label} ${ART_VIEWS.find((v) => v.view === view)?.label ?? ""}, no es foto del equipo` };
  return (
    <svg viewBox="0 0 400 300" className={className ?? "h-full w-full"} {...a11y}>
      <ellipse cx="200" cy="262" rx="170" ry="10" className="fill-ink" opacity="0.07" />
      {view === "front" && <Front k={k} label={label} />}
      {view === "side" && <Side k={k} />}
      {view === "closed" && <Closed k={k} label={label} />}
    </svg>
  );
}

function Front({ k, label }: { k: Look; label: string }) {
  const { x, w, h, r } = k.lid;
  const top = 236 - h - 6;
  const b = k.bezel;
  const sx = x + b, sy = top + b, sw = w - 2 * b, sh = h - 2 * b - 4;
  const brand = label.split(" ")[0];
  return (
    <g>
      {/* lid */}
      <rect x={x} y={top} width={w} height={h} rx={r} className={`${k.body} ${k.edge}`} strokeWidth="1.5" />
      <rect x={x + 3} y={top + 3} width={w - 6} height={h - 6} rx={r - 2} className="fill-ink" />
      <circle cx="200" cy={top + b / 2 + 1.5} r="2" className="fill-ink-2" />
      {/* screen: a calm desktop with one window */}
      <rect x={sx} y={sy} width={sw} height={sh} rx="3" className={k.screen} />
      <rect x={sx + sw * 0.12} y={sy + sh * 0.16} width={sw * 0.56} height={sh * 0.62} rx="5" className={k.ui} opacity="0.92" />
      <rect x={sx + sw * 0.12} y={sy + sh * 0.16} width={sw * 0.56} height="11" rx="5" className="fill-accent" opacity="0.85" />
      <rect x={sx + sw * 0.17} y={sy + sh * 0.36} width={sw * 0.3} height="6" rx="3" className={k.accent ? "fill-ink-2" : "fill-rule"} />
      <rect x={sx + sw * 0.17} y={sy + sh * 0.36 + 13} width={sw * 0.4} height="6" rx="3" className={k.accent ? "fill-ink-2" : "fill-rule"} />
      <rect x={sx + sw * 0.17} y={sy + sh * 0.36 + 26} width={sw * 0.22} height="6" rx="3" className={k.accent ? "fill-ink-2" : "fill-rule"} />
      <rect x={sx + sw * 0.74} y={sy + sh * 0.16} width={sw * 0.16} height={sh * 0.26} rx="4" className="fill-signal" opacity="0.9" />
      <rect x={sx + sw * 0.74} y={sy + sh * 0.48} width={sw * 0.16} height={sh * 0.3} rx="4" className={k.ui} opacity="0.7" />
      <text x="200" y={top + h - 7} textAnchor="middle" className="fill-ink-2" fontSize="8" fontFamily="var(--font-body)" opacity="0.9">
        {brand}
      </text>
      {/* deck, seen from the front edge */}
      <path
        d={`M${x - 22} ${236} H${x + w + 22} l14 ${k.deck - 4} q2 4 -3 4 H${x - 25} q-5 0 -3 -4 Z`}
        className={`${k.body} ${k.edge}`}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <rect x="176" y="236" width="48" height="4" rx="2" className="fill-ink" opacity="0.25" />
      {k.accent && (
        <g className="fill-accent">
          <rect x={x - 8} y={236 + k.deck - 7} width="40" height="3" rx="1.5" />
          <rect x={x + w - 32} y={236 + k.deck - 7} width="40" height="3" rx="1.5" />
        </g>
      )}
    </g>
  );
}

function Side({ k }: { k: Look }) {
  const len = 290;
  const x = 55;
  const y = 248 - k.deck;
  const lidLen = k.lid.h + 4;
  const lidThick = Math.max(6, k.deck * 0.45);
  return (
    <g>
      {/* lid tilted back from the hinge */}
      <g transform={`rotate(-14 ${x + 6} ${y})`}>
        <rect x={x} y={y - lidLen} width={lidThick} height={lidLen} rx={lidThick / 2} className={`${k.body} ${k.edge}`} strokeWidth="1.5" />
      </g>
      {/* base, slightly wedged */}
      <path
        d={`M${x} ${y + 2} q0 -3 4 -3 H${x + len - 6} q5 0 5 4 v${k.deck - 6} q0 4 -5 4 H${x + 4} q-4 0 -4 -4 Z`}
        className={`${k.body} ${k.edge}`}
        strokeWidth="1.5"
      />
      {/* ports */}
      <g className="fill-ink" opacity="0.75">
        <rect x={x + 40} y={y + k.deck / 2 - 2} width="16" height="4" rx="1.5" />
        <rect x={x + 64} y={y + k.deck / 2 - 2} width="9" height="4" rx="1.5" />
        <rect x={x + 82} y={y + k.deck / 2 - 2.5} width="22" height="5" rx="1.5" />
        <circle cx={x + 118} cy={y + k.deck / 2} r="2.5" />
      </g>
      {k.accent && <rect x={x + len - 70} y={y + 3} width="54" height={k.deck - 8} rx="2" className="fill-accent" opacity="0.8" />}
      <rect x={x + 20} y={y + k.deck - 1} width="18" height="3" rx="1.5" className="fill-ink" opacity="0.5" />
      <rect x={x + len - 40} y={y + k.deck - 1} width="18" height="3" rx="1.5" className="fill-ink" opacity="0.5" />
    </g>
  );
}

function Closed({ k, label }: { k: Look; label: string }) {
  const brand = label.split(" ")[0];
  return (
    <g>
      <rect x="62" y="44" width="276" height="196" rx={k.lid.r + 4} className={`${k.body} ${k.edge}`} strokeWidth="1.5" />
      <rect x="62" y="44" width="276" height="14" rx="6" className="fill-ink" opacity="0.12" />
      {k.accent && (
        <g className="stroke-accent" strokeWidth="3" strokeLinecap="round">
          <path d="M92 214 L132 174" />
          <path d="M308 214 L268 174" />
        </g>
      )}
      <text x="200" y="148" textAnchor="middle" className="fill-ink-2" fontSize="18" fontWeight="700" fontFamily="var(--font-display)" opacity="0.7">
        {brand}
      </text>
    </g>
  );
}
