type ActivityHeatmapProps = {
  entries: Array<{
    date: string;
    minutes: number;
    level: number;
  }>;
};

export function ActivityHeatmap({ entries }: ActivityHeatmapProps) {
  return (
    <section className="heatmap-panel">
      <div className="section-copy">
        <p className="eyebrow">Visual Progress</p>
        <h2>Watch your progress grow</h2>
        <p className="lede">
          Your focus history is stored in the repo and rendered here as a
          GitHub-style intensity map.
        </p>
      </div>
      <div className="heatmap-grid" aria-label="Focus activity heatmap">
        {entries.length === 0 ? (
          <div className="heatmap-empty">No sessions logged yet.</div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.date}
              className={`heatmap-cell level-${entry.level}`}
              title={`${entry.date}: ${entry.minutes} focus minutes`}
            />
          ))
        )}
      </div>
    </section>
  );
}
