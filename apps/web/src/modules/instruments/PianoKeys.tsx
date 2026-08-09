import { midiToPitchClass } from "@/modules/chords/notes";
import { cn } from "@/lib/utils";

interface PianoKeysProps {
  low: number;
  high: number;
  /** Pitch classes to highlight (the scale). */
  highlight?: Set<number>;
  rootPc?: number;
  onPlay?: (midi: number) => void;
  className?: string;
}

const BLACK = new Set([1, 3, 6, 8, 10]);

/** An SVG piano keyboard with scale highlighting; keys are clickable. */
export function PianoKeys({ low, high, highlight, rootPc, onPlay, className }: PianoKeysProps) {
  const whites: number[] = [];
  for (let m = low; m <= high; m++) {
    if (!BLACK.has(((m % 12) + 12) % 12)) whites.push(m);
  }
  const WW = 26; // white key width
  const WH = 96;
  const BW = 16;
  const BH = 58;
  const width = whites.length * WW;
  const whiteX = new Map(whites.map((m, i) => [m, i * WW]));

  const pcOf = (m: number) => ((m % 12) + 12) % 12;
  const isLit = (m: number) => highlight?.has(pcOf(m)) ?? false;
  const isRoot = (m: number) => rootPc !== undefined && pcOf(m) === rootPc;

  return (
    <svg
      viewBox={`0 0 ${width} ${WH + 20}`}
      className={cn("select-none", className)}
      role="img"
      aria-label="piano keyboard"
    >
      {whites.map((m) => (
        <g key={m} onClick={() => onPlay?.(m)} className={onPlay ? "cursor-pointer" : ""}>
          <rect
            x={whiteX.get(m)}
            y={0}
            width={WW - 1}
            height={WH}
            rx={3}
            className={cn(
              "stroke-border",
              isRoot(m)
                ? "fill-primary"
                : isLit(m)
                  ? "fill-accent"
                  : "fill-card hover:fill-muted",
            )}
            strokeWidth={1}
          />
          {isLit(m) && (
            <text
              x={whiteX.get(m)! + (WW - 1) / 2}
              y={WH - 8}
              textAnchor="middle"
              className={cn(
                "text-[9px] font-medium",
                isRoot(m) ? "fill-primary-foreground" : "fill-accent-foreground",
              )}
            >
              {midiToPitchClass(m)}
            </text>
          )}
        </g>
      ))}
      {/* black keys on top */}
      {Array.from({ length: high - low + 1 }, (_, i) => low + i)
        .filter((m) => BLACK.has(pcOf(m)) && whiteX.has(m - 1))
        .map((m) => (
          <g key={m} onClick={() => onPlay?.(m)} className={onPlay ? "cursor-pointer" : ""}>
            <rect
              x={whiteX.get(m - 1)! + WW - BW / 2 - 1}
              y={0}
              width={BW}
              height={BH}
              rx={2}
              className={cn(
                isRoot(m)
                  ? "fill-primary stroke-primary"
                  : isLit(m)
                    ? "fill-accent-foreground stroke-accent-foreground"
                    : "fill-foreground stroke-foreground",
              )}
            />
            {isLit(m) && !isRoot(m) && (
              <circle
                cx={whiteX.get(m - 1)! + WW - 1}
                cy={BH - 10}
                r={3}
                className="fill-accent"
              />
            )}
          </g>
        ))}
    </svg>
  );
}
