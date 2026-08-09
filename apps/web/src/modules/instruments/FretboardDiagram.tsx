import { midiToPitchClass, noteToMidi } from "@/modules/chords/notes";
import type { MelodyTrace } from "@/modules/melody/trace";
import { TraceBadge } from "@/modules/melody/TraceBadge";
import { cn } from "@/lib/utils";

interface FretboardDiagramProps {
  /** Low-to-high open string notes, e.g. ["E2","A2","D3","G3","B3","E4"]. */
  tuning: string[];
  frets?: number;
  /** Fretless (violin): positions drawn as faint guides instead of frets. */
  fretless?: boolean;
  highlight?: Set<number>;
  rootPc?: number;
  trace?: MelodyTrace;
  onPlay?: (midi: number) => void;
  className?: string;
}

const MARKERS = [3, 5, 7, 9, 12];

/**
 * A scale map the way guitarists draw them: strings horizontal (lowest at
 * the bottom), nut at the left, frets 0..N. A dot on every string/fret
 * whose note is in the scale; root in cinnabar. When a melody trace is
 * passed, its notes get numbered markers fading along the sequence.
 */
export function FretboardDiagram({
  tuning,
  frets = 12,
  fretless = false,
  highlight,
  rootPc,
  trace,
  onPlay,
  className,
}: FretboardDiagramProps) {
  const open = tuning.map(noteToMidi);
  const S = open.length;
  const LEFT = 34;
  const FW = 44; // fret width
  const GAP = 26; // string gap
  const TOP = 16;
  const W = LEFT + FW * (frets + 1) + 10;
  const H = TOP + GAP * (S - 1) + 34;

  const fx = (fret: number) => LEFT + FW * fret + FW / 2; // centre of fret cell
  const fy = (stringIdx: number) => TOP + GAP * (S - 1 - stringIdx); // low string at bottom
  const pcOf = (m: number) => ((m % 12) + 12) % 12;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn("select-none", className)} role="img" aria-label="fretboard scale diagram">
      {/* nut */}
      <rect x={LEFT + FW - 2} y={fy(S - 1) - 8} width={4} height={GAP * (S - 1) + 16} rx={1.5} className="fill-foreground" />
      {/* frets / position guides */}
      {Array.from({ length: frets }, (_, i) => i + 2).map((f) => (
        <line
          key={f}
          x1={LEFT + FW * f}
          y1={fy(S - 1) - 6}
          x2={LEFT + FW * f}
          y2={fy(0) + 6}
          strokeDasharray={fretless ? "3 4" : undefined}
          className={fretless ? "stroke-border" : "stroke-foreground/35"}
          strokeWidth={1.2}
        />
      ))}
      {/* marker dots */}
      {MARKERS.filter((m) => m <= frets).map((m) => (
        <circle key={m} cx={fx(m)} cy={H - 22} r={m === 12 ? 3.5 : 2.5} className="fill-border" />
      ))}
      {MARKERS.filter((m) => m <= frets).map((m) => (
        <text key={`t${m}`} x={fx(m)} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-[9px]">
          {m}
        </text>
      ))}
      {/* strings */}
      {open.map((_, s) => (
        <line
          key={s}
          x1={LEFT + FW - 2}
          y1={fy(s)}
          x2={W - 8}
          y2={fy(s)}
          className="stroke-foreground/60"
          strokeWidth={0.8 + (S - 1 - s) * 0.35}
        />
      ))}
      {/* open string labels */}
      {open.map((_, s) => (
        <text key={`o${s}`} x={LEFT - 8} y={fy(s) + 3.5} textAnchor="end" className="fill-muted-foreground text-[10px]">
          {tuning[s].replace(/\d+$/, "")}
        </text>
      ))}
      {/* scale dots */}
      {open.flatMap((om, s) =>
        Array.from({ length: frets + 1 }, (_, f) => {
          const midi = om + f;
          if (!(highlight?.has(pcOf(midi)) ?? true)) return null;
          const root = rootPc !== undefined && pcOf(midi) === rootPc;
          const indices = trace?.order.get(midi);
          return (
            <g key={`${s}-${f}`} onClick={() => onPlay?.(midi)} className={onPlay ? "cursor-pointer" : ""}>
              <title>{midiToPitchClass(midi)} · string {s + 1}, {f === 0 ? "open" : `fret ${f}`}</title>
              <circle
                cx={fx(f)}
                cy={fy(s)}
                r={f === 0 ? 6 : 7.5}
                className={cn(
                  f === 0 ? "stroke-[1.5]" : "",
                  root
                    ? f === 0
                      ? "fill-primary/20 stroke-primary"
                      : "fill-primary"
                    : f === 0
                      ? "fill-card stroke-foreground/70"
                      : "fill-accent stroke-accent-foreground/30",
                )}
              />
              {f > 0 && (
                <text
                  x={fx(f)}
                  y={fy(s) + 3}
                  textAnchor="middle"
                  className={cn("text-[8px] font-medium", root ? "fill-primary-foreground" : "fill-accent-foreground")}
                >
                  {midiToPitchClass(midi)}
                </text>
              )}
              {indices && trace && (
                <TraceBadge x={fx(f) + 9} y={fy(s) - 9} indices={indices} trace={trace} />
              )}
            </g>
          );
        }),
      )}
    </svg>
  );
}
