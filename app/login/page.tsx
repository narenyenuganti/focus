import { unlockTracker } from "@/app/actions/auth";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const showError = resolvedSearchParams.error === "invalid-password";

  return (
    <main className="shell">
      <section className="card">
        <p className="eyebrow">Local-first personal dashboard</p>
        <h1>Unlock your tracker</h1>
        <p className="lede">
          Focus sessions, sleep, workouts, and health metrics live in this repo.
        </p>
        <form action={unlockTracker} className="unlock-form">
          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="Enter your tracker password"
              autoComplete="current-password"
              required
            />
          </label>
          {showError ? <p className="error-message">Incorrect password.</p> : null}
          <button type="submit" className="primary-button">
            Unlock
          </button>
        </form>
      </section>
    </main>
  );
}
