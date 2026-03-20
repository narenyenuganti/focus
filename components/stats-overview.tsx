type StatsOverviewProps = {
  cards: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
};

export function StatsOverview({ cards }: StatsOverviewProps) {
  return (
    <section className="stats-grid">
      {cards.map((card) => (
        <article key={card.label} className="stat-card">
          <p>{card.label}</p>
          <strong>{card.value}</strong>
          <span>{card.detail}</span>
        </article>
      ))}
    </section>
  );
}
