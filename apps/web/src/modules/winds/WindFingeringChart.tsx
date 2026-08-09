import { midiToNote } from "@/modules/chords/notes";
import type { MelodyTrace } from "@/modules/melody/trace";
import { traceOpacity } from "@/modules/melody/trace";
import type { Fingering, HoleState, WindChart } from "./fingerings";
import { cn } from "@/lib/utils";

interface WindFingeringChartProps {
  chart: WindChart;
  /** Pitch classes of the current scale — other notes are dimmed. */
  highlight?: Set<number>;
  rootPc?: number;
  trace?: MelodyTrace;
  onPlay?: (midi: number) => void;
  className?: string;
}

/**
 * One column per note: the instrument's holes from mouthpiece down,
 * ● covered · ◐ half · ○ open. Thumb holes sit offset to the left.
 * Overblown notes carry a ² badge (same fingering, second register).
 */
export function WindFingeringChart({
  chart,
  highlight,
  rootPc,
  trace,
  onPlay,
  className,
}: WindFingeringChartProps) {
  const pcOf = (m: number) => ((m % 12) + 12) % 12;

  return (
    <div className={cn("overflow-x-auto", className)}>
      <div className="flex items-end gap-1 pb-1">
        {/* hole labels gutter (column charts only) */}
        {!chart.pendant && (
          <div className="mr-1 flex shrink-0 flex-col items-end gap-1.5 pb-7">
            {chart.holeLabels.map((label, i) => (
              <span
                key={i}
                className="flex h-4 items-center text-[10px] text-muted-foreground"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {chart.fingerings.map((f) => {
          const inScale = highlight?.has(pcOf(f.midi)) ?? true;
          const isRoot = rootPc !== undefined && pcOf(f.midi) === rootPc;
          return (
            <button
              key={`${f.midi}${f.overblow ? "o" : ""}`}
              onClick={() => onPlay?.(f.midi)}
              disabled={!onPlay}
              title={`${midiToNote(f.midi)}${f.overblow ? " (overblown)" : ""}`}
              className={cn(
                "flex shrink-0 flex-col items-center gap-1.5 rounded-lg border px-1.5 pb-1.5 pt-2 transition-colors",
                isRoot
                  ? "border-primary bg-primary/10"
                  : inScale
                    ? "bg-card hover:bg-accent"
                    : "opacity-30 hover:opacity-60",
              )}
            >
              {chart.pendant ? (
                <PendantGlyph fingering={f} />
              ) : (
                chart.holeLabels.map((_, i) => {
                  const state = f.holes[i];
                  const thumb = chart.thumbs.includes(i);
                  return (
                    <span
                      key={i}
                      className={cn(
                        "relative block h-4 w-4 rounded-full border-[1.5px]",
                        thumb ? "-translate-x-1 border-dashed" : "",
                        state === 1
                          ? "border-foreground bg-foreground"
                          : "border-foreground bg-transparent",
                      )}
                    >
                      {state === 0.5 && (
                        <span className="absolute inset-0 overflow-hidden rounded-full">
                          <span className="absolute inset-y-0 left-0 w-1/2 bg-foreground" />
                        </span>
                      )}
                    </span>
                  );
                })
              )}
              <span
                className={cn(
                  "mt-0.5 font-display text-xs",
                  isRoot ? "font-semibold text-primary" : "text-foreground",
                )}
              >
                {midiToNote(f.midi)}
                {f.overblow && <sup className="text-[9px] text-jade">²</sup>}
              </span>
              {(() => {
                const ti = trace?.order.get(f.midi);
                if (ti === undefined || !trace) return <span className="h-4" />;
                return (
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background"
                    style={{ opacity: traceOpacity(ti, trace.size) }}
                  >
                    {ti + 1}
                  </span>
                );
              })()}
            </button>
          );
        })}
      </div>
      {chart.note && (
        <p className="mt-1 text-xs text-muted-foreground">
          {chart.title} — {chart.note}
        </p>
      )}
    </div>
  );
}

/**
 * A pendant ocarina charted the traditional way: the round body outline
 * with the four finger holes inside (left column = left hand, lower holes
 * nearest the mouthpiece at the bottom) and the two back thumb holes drawn
 * dashed, outside and below the outline. Hole sizes differ because the
 * English system tunes each hole's pitch contribution by its size.
 * Order in `holes`: [LT, RT, L1, L2, R1, R2].
 */
function PendantGlyph({ fingering }: { fingering: Fingering }) {
  const spec: { idx: number; cx: number; cy: number; r: number; thumb?: boolean }[] = [
    { idx: 2, cx: 21, cy: 18, r: 7 }, // L1
    { idx: 4, cx: 43, cy: 18, r: 6 }, // R1
    { idx: 3, cx: 21, cy: 37, r: 5.5 }, // L2
    { idx: 5, cx: 43, cy: 37, r: 5 }, // R2
    { idx: 0, cx: 21, cy: 64, r: 5, thumb: true }, // LT (back)
    { idx: 1, cx: 43, cy: 64, r: 4.5, thumb: true }, // RT (back)
  ];
  return (
    <svg viewBox="0 0 64 74" className="h-[74px] w-[64px]">
      {/* body, mouthpiece nub at the bottom */}
      <circle cx={32} cy={27} r={25} className="fill-card stroke-foreground/50" strokeWidth={1.5} />
      <rect x={26} y={49} width={12} height={7} rx={3} className="fill-card stroke-foreground/50" strokeWidth={1.2} />
      {spec.map(({ idx, cx, cy, r, thumb }) => {
        const state: HoleState = fingering.holes[idx];
        return (
          <g key={idx}>
            <circle
              cx={cx}
              cy={cy}
              r={r}
              strokeDasharray={thumb ? "2.5 2" : undefined}
              className={cn(
                "stroke-foreground",
                state === 1 ? "fill-foreground" : "fill-transparent",
              )}
              strokeWidth={1.4}
            />
            {state === 0.5 && (
              <path d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r} Z`} className="fill-foreground" />
            )}
          </g>
        );
      })}
    </svg>
  );
}
