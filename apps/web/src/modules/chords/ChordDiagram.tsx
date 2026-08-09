import type { ChordPosition } from "./types";
import { cn } from "@/lib/utils";

interface ChordDiagramProps {
  position: ChordPosition;
  strings: number;
  /** Low-to-high tuning note names, e.g. ["D3","G3","B3","E4"]. */
  tuning?: string[];
  showFingers?: boolean;
  className?: string;
}

/**
 * Fretboard diagram rendered as pure SVG. Strings run vertically
 * (low string on the left), frets horizontally — the convention used by
 * Ultimate Guitar chord boxes.
 */
export function ChordDiagram({
  position,
  strings,
  tuning,
  showFingers = true,
  className,
}: ChordDiagramProps) {
  const numFrets = Math.max(4, ...position.frets.filter((f) => f > 0));
  const SW = 24; // string spacing
  const FH = 28; // fret spacing
  const TOP = 34; // room for open/mute markers
  const LEFT = position.baseFret > 1 ? 34 : 18;
  const width = LEFT + SW * (strings - 1) + 18;
  const height = TOP + FH * numFrets + (tuning ? 22 : 12);

  const sx = (s: number) => LEFT + s * SW;
  const fy = (f: number) => TOP + FH * (f - 0.5); // dot centre inside fret f

  // A barre spans the outermost strings fretted at exactly the barre fret.
  const barres = position.barres.map((barre) => {
    const at = position.frets
      .map((f, i) => (f === barre ? i : -1))
      .filter((i) => i >= 0);
    return { fret: barre, from: Math.min(...at), to: Math.max(...at) };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("select-none", className)}
      role="img"
      aria-label="chord diagram"
    >
      {/* nut or base fret label */}
      {position.baseFret === 1 ? (
        <rect x={sx(0) - 1.5} y={TOP - 4} width={SW * (strings - 1) + 3} height={4} rx={1} className="fill-foreground" />
      ) : (
        <text x={LEFT - 12} y={fy(1) + 4} textAnchor="end" className="fill-muted-foreground text-[11px] font-medium">
          {position.baseFret}fr
        </text>
      )}

      {/* frets */}
      {Array.from({ length: numFrets + 1 }, (_, i) => (
        <line
          key={`f${i}`}
          x1={sx(0)}
          y1={TOP + FH * i}
          x2={sx(strings - 1)}
          y2={TOP + FH * i}
          className="stroke-border"
          strokeWidth={1}
        />
      ))}

      {/* strings */}
      {Array.from({ length: strings }, (_, i) => (
        <line
          key={`s${i}`}
          x1={sx(i)}
          y1={TOP}
          x2={sx(i)}
          y2={TOP + FH * numFrets}
          className="stroke-foreground/60"
          strokeWidth={1 + (strings - 1 - i) * 0.22}
        />
      ))}

      {/* open / muted markers */}
      {position.frets.map((f, i) =>
        f === 0 ? (
          <circle key={`o${i}`} cx={sx(i)} cy={TOP - 14} r={4.5} className="fill-none stroke-foreground" strokeWidth={1.4} />
        ) : f === -1 ? (
          <g key={`m${i}`} className="stroke-muted-foreground" strokeWidth={1.4} strokeLinecap="round">
            <line x1={sx(i) - 4} y1={TOP - 18} x2={sx(i) + 4} y2={TOP - 10} />
            <line x1={sx(i) - 4} y1={TOP - 10} x2={sx(i) + 4} y2={TOP - 18} />
          </g>
        ) : null,
      )}

      {/* barres */}
      {barres.map((b) => (
        <rect
          key={`b${b.fret}`}
          x={sx(b.from) - 8}
          y={fy(b.fret) - 8}
          width={sx(b.to) - sx(b.from) + 16}
          height={16}
          rx={8}
          className="fill-primary/85"
        />
      ))}

      {/* finger dots */}
      {position.frets.map((f, i) => {
        if (f <= 0) return null;
        const inBarre = barres.some((b) => b.fret === f && i > b.from && i < b.to);
        if (inBarre) return null;
        return (
          <g key={`d${i}`}>
            <circle cx={sx(i)} cy={fy(f)} r={8.5} className="fill-primary" />
            {showFingers && position.fingers[i] > 0 && (
              <text
                x={sx(i)}
                y={fy(f) + 3.5}
                textAnchor="middle"
                className="fill-primary-foreground text-[10px] font-semibold"
              >
                {position.fingers[i]}
              </text>
            )}
          </g>
        );
      })}

      {/* tuning labels */}
      {tuning?.map((note, i) => (
        <text
          key={`t${i}`}
          x={sx(i)}
          y={TOP + FH * numFrets + 16}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          {note.replace(/\d+$/, "")}
        </text>
      ))}
    </svg>
  );
}
