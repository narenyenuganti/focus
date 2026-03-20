import { cookies } from "next/headers";
import Link from "next/link";
import { logoutTracker } from "@/app/actions/auth";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";

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

  return (
    <main className="shell">
      <section className="card">
        <p className="eyebrow">Tracker unlocked</p>
        <h1>Dashboard is next</h1>
        <p className="lede">
          Password protection and repo-backed persistence are wired. The next
          commit replaces this placeholder with the full Peazehub-inspired
          dashboard.
        </p>
        <form action={logoutTracker} className="stack">
          <button type="submit" className="secondary-button">
            Log out
          </button>
        </form>
      </section>
    </main>
  );
}
