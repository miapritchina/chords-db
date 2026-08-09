import { kalimbaTines } from "./kalimba";
import { midiToNote, midiToPitchClass } from "@/modules/chords/notes";
import { cn } from "@/lib/utils";

interface KalimbaTinesProps {
  /** Pitch classes to highlight (the scale). */
  highlight?: Set<number>;
  rootPc?: number;
  onPlay?: (midi: number) => void;
  className?: string;
}

/**
 * A 17-key kalimba in C, drawn as it sits in your hands: longest tine in
 * the middle, notes ascending outward left/right. Tines are clickable.
 */
export function KalimbaTines({ highlight, rootPc, onPlay, className }: KalimbaTinesProps) {
  const tines = [...kalimbaTines()].sort((a, b) => a.slot - b.slot);
  const TW = 22;
  const GAP = 4;
  const MAXH = 150;
  const width = tines.length * (TW + GAP);
  const height = MAXH + 44;

  const pcOf = (m: number) => ((m % 12) + 12) % 12;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("select-none", className)}
      role="img"
      aria-label="kalimba tines"
    >
      {/* soundboard hint */}
      <rect x={0} y={26} width={width} height={height - 26} rx={14} className="fill-muted/50" />
      <line x1={6} y1={30} x2={width - 6} y2={30} className="stroke-border" strokeWidth={2} />

      {tines.map((t) => {
        const h = MAXH - t.distance * 12;
        const x = t.slot * (TW + GAP) + GAP / 2;
        const lit = highlight?.has(pcOf(t.midi)) ?? false;
        const root = rootPc !== undefined && pcOf(t.midi) === rootPc;
        return (
          <g
            key={t.midi}
            onClick={() => onPlay?.(t.midi)}
            className={onPlay ? "cursor-pointer" : ""}
          >
            <rect
              x={x}
              y={30}
              width={TW}
              height={h}
              rx={TW / 2}
              className={cn(
                "stroke-border transition-colors",
                root ? "fill-primary" : lit ? "fill-accent" : "fill-card hover:fill-muted",
              )}
              strokeWidth={1}
            />
            <text
              x={x + TW / 2}
              y={30 + h - 10}
              textAnchor="middle"
              className={cn(
                "text-[9px] font-medium",
                root
                  ? "fill-primary-foreground"
                  : lit
                    ? "fill-accent-foreground"
                    : "fill-muted-foreground",
              )}
            >
              {midiToPitchClass(t.midi)}
            </text>
            <text
              x={x + TW / 2}
              y={22}
              textAnchor="middle"
              className="fill-muted-foreground text-[7px]"
            >
              {midiToNote(t.midi)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
