"use client";

type ChartPoint = {
  label: string;
  value: number;
  meta?: string;
};

export function ScoreLineChart({
  points,
  height = 220,
}: {
  points: ChartPoint[];
  height?: number;
}) {
  if (!points.length) {
    return (
      <div
        className="card"
        style={{ padding: "1rem", textAlign: "center", color: "var(--muted)", minHeight: height }}
      >
        No session data yet.
      </div>
    );
  }

  const width = 760;
  const padding = { top: 18, right: 16, bottom: 30, left: 36 };
  const values = points.map((point) => point.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 9);
  const span = Math.max(max - min, 1);
  const xStep = points.length > 1 ? (width - padding.left - padding.right) / (points.length - 1) : 0;

  const toX = (index: number) => padding.left + index * xStep;
  const toY = (value: number) => padding.top + ((max - value) / span) * (height - padding.top - padding.bottom);
  const polyline = points.map((point, index) => `${toX(index)},${toY(point.value)}`).join(" ");
  const area = [
    `${padding.left},${height - padding.bottom}`,
    ...points.map((point, index) => `${toX(index)},${toY(point.value)}`),
    `${toX(points.length - 1)},${height - padding.bottom}`,
  ].join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label="Score timeline">
      <defs>
        <linearGradient id="scoreAreaGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {[0, 1, 2, 3, 4].map((tick) => {
        const value = min + (span * tick) / 4;
        const y = toY(value);
        return (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="var(--line)" strokeDasharray="4 6" />
            <text x={6} y={y + 4} fontSize="11" fill="var(--muted)">
              {value.toFixed(1)}
            </text>
          </g>
        );
      })}

      <polyline fill="url(#scoreAreaGradient)" stroke="none" points={area} />
      <polyline fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={polyline} />

      {points.map((point, index) => {
        const x = toX(index);
        const y = toY(point.value);
        return (
          <g key={`${point.label}-${index}`}>
            <circle cx={x} cy={y} r="4.5" fill="var(--accent)" />
            <circle cx={x} cy={y} r="9" fill="transparent">
              <title>{`${point.label}: ${point.value.toFixed(1)}${point.meta ? ` • ${point.meta}` : ""}`}</title>
            </circle>
            {(index === 0 || index === points.length - 1 || index % Math.max(1, Math.ceil(points.length / 5)) === 0) && (
              <text x={x} y={height - 10} textAnchor="middle" fontSize="11" fill="var(--muted)">
                {point.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
