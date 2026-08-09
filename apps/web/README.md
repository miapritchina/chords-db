# The Music Room

A personal music-exploration studio built on top of the chords-db database:
chord exploration, progression sketching, and practice tracking/planning
across ten instruments.

## Run it

```sh
pnpm install          # from the repo root
pnpm --filter @practice/web dev          # app on http://localhost:5173
pnpm --filter @practice/web storybook    # component workbench on :6006
pnpm --filter @practice/web test         # vitest
```

## What's here

- **Explore** — browse every voicing in chords-db (guitar, ukulele, and a
  **baritone ukulele database derived from guitar voicings** — DGBE is the top
  four guitar strings, so every guitar shape with muted low strings is
  playable). Click *hear* to play a voicing through the Web Audio synth,
  *add* to sketch a progression, then name and save it.
- **Progressions** — saved sketches; click any chord to hear it, *play* for
  the whole sequence.
- **Practice** — session tracker (streak, weekly minutes, per-instrument
  totals, 14-day chart) and a Monday-first weekly planner with per-day blocks.
- **Trainers** — a live Web MIDI monitor (plug in a keyboard, see held notes).
  Sight reading, pitch, and rhythm trainers are the next modules.

## Architecture

Everything is deliberately modular so it can be reorganized freely:

```
src/modules/
  chords/        types, note math, db loading + baritone derivation, ChordDiagram (SVG)
  instruments/   your instrument registry — edit INSTRUMENTS freely
  audio/         tiny Web Audio synth (swap for a sampler later)
  midi/          useMidi hook (Web MIDI input)
  storage/       StorageAdapter interface + local & Supabase adapters
  progressions/  progression types
  practice/      session/plan types, stats (tested)
src/pages/       thin route components that compose the modules
src/components/ui  shadcn/ui components (components.json is set up; `npx shadcn add <x>` works)
```

Modules never import from pages; pages compose modules. Pure logic
(note math, stats, derivation, storage) is dependency-free and covered by
vitest.

## Storage

Data (sessions, plans, progressions) goes through `modules/storage`.
By default it's browser localStorage — zero setup. To sync across devices,
create a free Supabase project, run the SQL in `src/modules/storage/supabase.ts`,
and add to `apps/web/.env.local`:

```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

The footer shows which adapter is active.
