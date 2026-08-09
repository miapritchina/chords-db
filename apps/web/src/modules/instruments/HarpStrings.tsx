import { midiToNote, midiToPitchClass, noteToMidi } from "@/modules/chords/notes";
import type { MelodyTrace } from "@/modules/melody/trace";
import { traceOpacity } from "@/modules/melody/trace";
import { pitchClassName } from "@/modules/scales/scales";
import { cn } from "@/lib/utils";

interface HarpStringsProps {
  /** Lowest string, e.g. "C3" for a 26-string harpsicle. */
  low?: string;
  strings?: number;
  highlight?: Set<number>;
  rootPc?: number;
  trace?: MelodyTrace;
  onPlay?: (midi: number) => void;
  className?: string;
}

const DIATONIC = [0, 2, 4, 5, 7, 9, 11]; // C major letters

/**
 * A lap harp (harpsicle) drawn the way harpists see it: vertical strings,
 * long bass strings on the left shortening toward the treble, with the
 * universal colour code — C strings red, F strings blue. Strings are
 * diatonic (C major); scale notes that need a lever flip or retune are
 * listed underneath instead of pretending they're open strings.
 */
export function HarpStrings({
  low = "C3",
  strings = 26,
  highlight,
  rootPc,
  trace,
  onPlay,
  className,
}: HarpStringsProps) {
  // Build the diatonic string set upward from `low`.
  const lowMidi = noteToMidi(low);
  const notes: number[] = [];
  let octave = Math.floor(lowMidi / 12);
  let idx = Math.max(0, DIATONIC.indexOf(((lowMidi % 12) + 12) % 12));
  while (notes.length < strings) {
    notes.push(octave * 12 + DIATONIC[idx]);
    idx += 1;
    if (idx === DIATONIC.length) {
      idx = 0;
      octave += 1;
    }
  }

  const SW = 20;
  const W = strings * SW + 24;
  const MAXH = 190;
  const MINH = 70;
  const TOP = 14;
  const H = TOP + MAXH + 46;
  const pcOf = (m: number) => ((m % 12) + 12) % 12;

  // Scale pitch classes that don't exist as open strings (need levers/retune).
  const missing = highlight
    ? [...highlight].filter((pc) => !DIATONIC.includes(pc)).map(pitchClassName)
    : [];

  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full select-none" role="img" aria-label="harp strings">
        {/* soundboard slope */}
        <path
          d={`M 10 ${TOP + MAXH + 8} L ${W - 10} ${TOP + MAXH + 8} L ${W - 10} ${TOP + MINH + 14} `}
          className="fill-none stroke-border"
          strokeWidth={1.5}
        />
        {notes.map((m, i) => {
          const pc = pcOf(m);
          const len = MAXH - (i * (MAXH - MINH)) / (strings - 1);
          const x = 18 + i * SW;
          const y0 = TOP + MAXH - len;
          const inScale = highlight?.has(pc) ?? true;
          const root = rootPc !== undefined && pc === rootPc;
          const ti = trace?.order.get(m);
          const colour =
            pc === 0 ? "stroke-primary" : pc === 5 ? "stroke-[oklch(0.55_0.13_255)]" : "stroke-foreground/65";
          return (
            <g key={m} onClick={() => onPlay?.(m)} className={onPlay ? "cursor-pointer" : ""}>
              <title>{midiToNote(m)}</title>
              <line
                x1={x}
                y1={y0}
                x2={x}
                y2={TOP + MAXH + 8}
                className={colour}
                strokeWidth={2.4 - (i / strings) * 1.4}
                opacity={inScale ? 1 : 0.22}
              />
              {inScale && (
                <>
                  <circle
                    cx={x}
                    cy={TOP + MAXH + 20}
                    r={7}
                    className={root ? "fill-primary" : "fill-muted"}
                  />
                  <text
                    x={x}
                    y={TOP + MAXH + 23}
                    textAnchor="middle"
                    className={cn("text-[8px] font-medium", root ? "fill-primary-foreground" : "fill-foreground")}
                  >
                    {midiToPitchClass(m)}
                  </text>
                </>
              )}
              {/* octave label under each C */}
              {pc === 0 && (
                <text x={x} y={TOP + MAXH + 38} textAnchor="middle" className="fill-muted-foreground text-[8px]">
                  {midiToNote(m)}
                </text>
              )}
              {ti !== undefined && trace && (
                <g opacity={traceOpacity(ti, trace.size)}>
                  <circle cx={x} cy={y0 + 12} r={7} className="fill-foreground" />
                  <text x={x} y={y0 + 15} textAnchor="middle" className="fill-background text-[8px] font-bold">
                    {ti + 1}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <p className="mt-1 text-xs text-muted-foreground">
        {strings} strings from {low} · C strings red, F strings blue
        {missing.length > 0 && (
          <span className="text-primary"> · needs lever/retune: {missing.join(", ")}</span>
        )}
      </p>
    </div>
  );
}
