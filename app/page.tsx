import { cookies } from "next/headers";
import Link from "next/link";
import { isSessionTokenValid, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { TrackerShell } from "@/components/tracker-shell";
import { getTrackerSnapshot } from "@/lib/server/dashboard";

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
  const snapshot = await getTrackerSnapshot();

  return <TrackerShell snapshot={snapshot} />;
}
