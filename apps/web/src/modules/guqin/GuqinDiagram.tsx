import { useMemo } from "react";
import { midiToNote } from "@/modules/chords/notes";
import type { MelodyTrace } from "@/modules/melody/trace";
import { TraceBadge } from "@/modules/melody/TraceBadge";
import { allPositions, huiX } from "./guqin";
import { cn } from "@/lib/utils";

interface GuqinDiagramProps {
  /** Pitch classes of the current scale. */
  highlight?: Set<number>;
  rootPc?: number;
  trace?: MelodyTrace;
  onPlay?: (midi: number) => void;
  className?: string;
}

/**
 * Top view of a guqin, the way modern string/hui tablature draws it:
 * seven strings as horizontal lines (string 1, the lowest, at the top —
 * farthest from the player), the 13 hui at their true harmonic-node
 * positions, yueshan 岳山 at the right. Dots mark where notes of the
 * current scale live: on the string at a hui (stopped/harmonic node) or
 * at the yueshan for open strings. Everything is clickable.
 */
export function GuqinDiagram({ highlight, rootPc, trace, onPlay, className }: GuqinDiagramProps) {
  const W = 720;
  const H = 220;
  const LEFT = 46; // dragon gums side
  const RIGHT = W - 58; // yueshan
  const TOP = 42;
  const GAP = (H - TOP - 24) / 6;

  const pcOf = (m: number) => ((m % 12) + 12) % 12;
  const positions = useMemo(() => allPositions(20), []);
  const visible = positions.filter((p) => highlight?.has(pcOf(p.midi)) ?? true);

  const sx = (frac: number) => LEFT + frac * (RIGHT - LEFT);
  const sy = (string: number) => TOP + (string - 1) * GAP;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("select-none", className)}
      role="img"
      aria-label="guqin string and hui diagram"
    >
      {/* body */}
      <rect x={LEFT - 34} y={TOP - 26} width={RIGHT - LEFT + 80} height={H - TOP + 6} rx={16} className="fill-muted/40" />
      {/* yueshan (bridge) */}
      <rect x={RIGHT + 6} y={TOP - 14} width={7} height={H - TOP - 12} rx={2} className="fill-foreground/70" />
      <text x={RIGHT + 26} y={H / 2} textAnchor="middle" writingMode="vertical-rl" className="fill-muted-foreground text-[10px]">
        岳山
      </text>

      {/* hui markers along the far edge */}
      {Array.from({ length: 13 }, (_, i) => i + 1).map((hui) => (
        <g key={hui}>
          <circle
            cx={sx(huiX(hui))}
            cy={TOP - 16}
            r={hui === 7 ? 5 : 3.5}
            className="fill-card stroke-foreground/50"
            strokeWidth={1}
          />
          <text x={sx(huiX(hui))} y={TOP - 26} textAnchor="middle" className="fill-muted-foreground text-[9px]">
            {hui}
          </text>
        </g>
      ))}

      {/* strings, 1 (lowest) at top */}
      {Array.from({ length: 7 }, (_, i) => i + 1).map((s) => (
        <g key={s}>
          <line
            x1={LEFT}
            y1={sy(s)}
            x2={RIGHT + 6}
            y2={sy(s)}
            className="stroke-foreground/60"
            strokeWidth={2.6 - (s - 1) * 0.3}
          />
          <text x={LEFT - 12} y={sy(s) + 3} textAnchor="end" className="fill-muted-foreground text-[10px]">
            {s}
          </text>
        </g>
      ))}

      {/* playable positions in the current scale */}
      {visible.map((p) => {
        const root = rootPc !== undefined && pcOf(p.midi) === rootPc;
        const x = p.hui === null ? RIGHT - 4 : sx(huiX(p.hui));
        const y = sy(p.string);
        return (
          <g
            key={`${p.string}-${p.hui ?? "open"}`}
            onClick={() => onPlay?.(p.midi)}
            className={onPlay ? "cursor-pointer" : ""}
          >
            <title>
              {midiToNote(p.midi)}
              {p.hui === null ? " · open string" : ` · string ${p.string}, hui ${p.hui}`}
              {p.cents !== 0 ? ` (${p.cents > 0 ? "+" : ""}${p.cents}c)` : ""}
            </title>
            {p.hui === null ? (
              <circle cx={x} cy={y} r={6} className={cn("stroke-2", root ? "fill-primary/25 stroke-primary" : "fill-card stroke-foreground")} />
            ) : (
              <circle cx={x} cy={y} r={5.5} className={root ? "fill-primary" : "fill-jade"} />
            )}
            {(() => {
              const indices = trace?.order.get(p.midi);
              if (!indices || !trace) return null;
              return <TraceBadge x={x} y={y - 11} indices={indices} trace={trace} />;
            })()}
          </g>
        );
      })}

      <text x={LEFT} y={H - 4} className="fill-muted-foreground text-[9px]">
        ○ open string · ● stopped at hui (just intonation within 20¢) · strings C2 D2 F2 G2 A2 C3 D3
      </text>
    </svg>
  );
}
