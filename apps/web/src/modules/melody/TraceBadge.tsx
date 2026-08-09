import { traceLabel, traceOpacity, type MelodyTrace } from "./trace";

interface TraceBadgeProps {
  x: number;
  y: number;
  indices: number[];
  trace: MelodyTrace;
}

/** Numbered step marker used inside every instrument SVG. */
export function TraceBadge({ x, y, indices, trace }: TraceBadgeProps) {
  const label = traceLabel(indices);
  const w = Math.max(13, 5 + label.length * 4.6);
  return (
    <g opacity={traceOpacity(indices[0], trace.size)} pointerEvents="none">
      <rect x={x - w / 2} y={y - 6.5} width={w} height={13} rx={6.5} className="fill-foreground" />
      <text x={x} y={y + 3} textAnchor="middle" className="fill-background text-[8px] font-bold">
        {label}
      </text>
    </g>
  );
}

interface TracePathProps {
  trace: MelodyTrace;
  /** Marker coordinates for a midi note, or null if it isn't on this diagram. */
  pointFor: (midi: number) => { x: number; y: number } | null;
}

/** The connecting hand-travel line between consecutive steps. */
export function TracePath({ trace, pointFor }: TracePathProps) {
  const segments: { x1: number; y1: number; x2: number; y2: number; i: number }[] = [];
  for (let i = 1; i < trace.path.length; i++) {
    const a = pointFor(trace.path[i - 1]);
    const b = pointFor(trace.path[i]);
    if (a && b && (a.x !== b.x || a.y !== b.y)) {
      segments.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, i });
    }
  }
  return (
    <g pointerEvents="none">
      {segments.map((s) => (
        <line
          key={s.i}
          x1={s.x1}
          y1={s.y1}
          x2={s.x2}
          y2={s.y2}
          className="stroke-foreground"
          strokeWidth={1.3}
          strokeDasharray="3 3"
          opacity={0.55 * traceOpacity(s.i, trace.size)}
        />
      ))}
    </g>
  );
}
