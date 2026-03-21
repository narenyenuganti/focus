import type { InsightsSummary } from "@/lib/server/insights";

type InsightsPanelProps = {
  summary: InsightsSummary;
};

function formatStreak(days: number) {
  if (days === 0) {
    return "No streak yet";
  }

  return `${days} day streak`;
}

export function InsightsPanel({ summary }: InsightsPanelProps) {
  return (
    <section className="panel-shell">
      <div className="section-copy">
        <p className="eyebrow">Personal insights</p>
        <h2>Where the habits compound</h2>
        <p className="lede">
          A compact readout of the patterns your local tracker has already captured.
        </p>
      </div>

      <div className="panel-metrics">
        <article>
          <span>Focus streak</span>
          <strong>{formatStreak(summary.focusStreakDays)}</strong>
        </article>
        <article>
          <span>Focus minutes</span>
          <strong>{summary.focusMinutes}m</strong>
        </article>
        <article>
          <span>Workout minutes</span>
          <strong>{summary.workoutMinutes}m</strong>
        </article>
      </div>

      <div className="panel-list" aria-label="Goal progress">
        {summary.goalProgress.map((goal) => (
          <article key={goal.id}>
            <strong>{goal.label}</strong>
            <span>
              {goal.percent}% of {goal.target} target
            </span>
          </article>
        ))}
      </div>

      <div className="panel-list" aria-label="Unlocked milestones">
        {summary.milestones.length === 0 ? (
          <article>
            <strong>No milestones yet</strong>
            <span>Keep going to unlock the first badge.</span>
          </article>
        ) : (
          summary.milestones.map((badge) => (
            <article key={badge.id}>
              <strong>{badge.label}</strong>
              <span>{badge.detail}</span>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
