import { cookies } from "next/headers";
import Link from "next/link";
import { logoutTracker } from "@/app/actions/auth";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { FocusTimer } from "@/components/focus-timer";
import { StatsOverview } from "@/components/stats-overview";
import { getFocusSummary } from "@/lib/server/focus";

export default async function HomePage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!isSessionTokenValid(sessionToken)) {
    return (
      <main className="shell">
        <section className="card">
          <p className="eyebrow">Local-first personal dashboard</p>
          <h1>Unlock your tracker</h1>
          <p className="lede">
            Focus sessions, sleep, workouts, and health metrics live in this repo.
          </p>
          <div className="stack">
            <Link className="primary-button" href="/login">
              Go to Login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const focusSummary = await getFocusSummary();
  const cards = [
    {
      label: "day streak",
      value: `${focusSummary.currentStreakDays}`,
      detail: "consecutive focused days",
    },
    {
      label: "sessions",
      value: `${focusSummary.totalSessions}`,
      detail: `${focusSummary.todaySessions} completed today`,
    },
    {
      label: "focused",
      value: `${focusSummary.totalMinutes}m`,
      detail: `${focusSummary.weeklyMinutes} minutes in the last 7 days`,
    },
    {
      label: "best session",
      value: `${focusSummary.longestSessionMinutes}m`,
      detail: "longest uninterrupted block",
    },
  ];

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Peazehub-inspired workspace</p>
          <h1>A smarter way to track your day</h1>
          <p className="lede">
            Focus first, then layer in sleep, workouts, health, and reflection.
          </p>
        </div>
        <form action={logoutTracker}>
          <button type="submit" className="secondary-button">
            Log out
          </button>
        </form>
      </header>

      <section className="hero-grid">
        <FocusTimer
          todayMinutes={focusSummary.todayMinutes}
          todaySessions={focusSummary.todaySessions}
        />
        <StatsOverview cards={cards} />
      </section>

      <ActivityHeatmap entries={focusSummary.heatmap} />
    </main>
  );
}
