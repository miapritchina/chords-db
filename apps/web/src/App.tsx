import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { CalendarCheck, Compass, ListMusic, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExplorePage } from "@/pages/ExplorePage";
import { ProgressionsPage } from "@/pages/ProgressionsPage";
import { PracticePage } from "@/pages/PracticePage";
import { TrainersPage } from "@/pages/TrainersPage";

const NAV = [
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/progressions", label: "Progressions", icon: ListMusic },
  { to: "/practice", label: "Practice", icon: CalendarCheck },
  { to: "/trainers", label: "Trainers", icon: Radio },
];

export default function App() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground/15 py-6">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            The Music Room
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            chords · progressions · practice — across ten instruments
          </p>
        </div>
        <nav className="flex gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/explore" replace />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/progressions" element={<ProgressionsPage />} />
          <Route path="/practice" element={<PracticePage />} />
          <Route path="/trainers" element={<TrainersPage />} />
        </Routes>
      </main>

      <footer className="border-t border-foreground/10 py-4 text-xs text-muted-foreground">
        chord data: tombatossals/chords-db · storage:{" "}
        {import.meta.env.VITE_SUPABASE_URL ? "supabase" : "this browser"}
      </footer>
    </div>
  );
}
