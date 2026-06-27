import React from "react";

export type RadarSeries = {
  label: string;
  value: number;
  target?: number;
};

export type RadarChartProps = {
  series: RadarSeries[];
  size?: number;
  maxValue?: number;
  title?: string;
  variant?: "radar" | "bar";
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleRad: number
): { x: number; y: number } {
  return {
    x: cx + r * Math.sin(angleRad),
    y: cy - r * Math.cos(angleRad),
  };
}

function pointsToPolygon(points: { x: number; y: number }[]): string {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

// ─── Accessible data table (sr-only) ────────────────────────────────────────

function AccessibleDataTable({ series }: { series: RadarSeries[] }) {
  return (
    <table
      className="sr-only"
      style={{
        position: "absolute",
        width: "1px",
        height: "1px",
        padding: 0,
        margin: "-1px",
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      <thead>
        <tr>
          <th scope="col">Label</th>
          <th scope="col">Value</th>
          <th scope="col">Target</th>
        </tr>
      </thead>
      <tbody>
        {series.map((s) => (
          <tr key={s.label}>
            <td>{s.label}</td>
            <td>{s.value}</td>
            <td>{s.target !== undefined ? s.target : "—"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Radar variant ───────────────────────────────────────────────────────────

function RadarVariant({
  series,
  size,
  maxValue,
  title,
}: {
  series: RadarSeries[];
  size: number;
  maxValue: number;
  title?: string;
}) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const n = series.length;
  const rings = [0.25, 0.5, 0.75, 1.0];

  if (n === 0) {
    return (
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        role="img"
        aria-label={title ?? "Radar chart — no data"}
      />
    );
  }

  const angleStep = (2 * Math.PI) / n;

  const valuePoints = series.map((s, i) => {
    const r = (s.value / maxValue) * radius;
    return polarToCartesian(cx, cy, r, i * angleStep);
  });

  const hasTargets = series.some((s) => s.target !== undefined);
  const targetPoints = hasTargets
    ? series.map((s, i) => {
        const r = ((s.target ?? s.value) / maxValue) * radius;
        return polarToCartesian(cx, cy, r, i * angleStep);
      })
    : null;

  const axisEndpoints = series.map((_, i) =>
    polarToCartesian(cx, cy, radius, i * angleStep)
  );

  const LABEL_OFFSET = 22;
  const labelPositions = series.map((_, i) =>
    polarToCartesian(cx, cy, radius + LABEL_OFFSET, i * angleStep)
  );

  const svgTitle = title ?? `Radar chart: ${series.map((s) => `${s.label} ${s.value}`).join(", ")}`;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={svgTitle}
    >
      <title>{svgTitle}</title>

      {/* Grid rings */}
      {rings.map((fraction) => {
        const ringPts = series.map((_, i) =>
          polarToCartesian(cx, cy, radius * fraction, i * angleStep)
        );
        return (
          <polygon
            key={fraction}
            points={pointsToPolygon(ringPts)}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        );
      })}

      {/* Axis lines */}
      {axisEndpoints.map((ep, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={ep.x.toFixed(2)}
          y2={ep.y.toFixed(2)}
          stroke="#e5e7eb"
          strokeWidth="1"
        />
      ))}

      {/* Target polygon */}
      {targetPoints && (
        <polygon
          points={pointsToPolygon(targetPoints)}
          fill="rgba(99,102,241,0.15)"
          stroke="#6366f1"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      )}

      {/* Value polygon */}
      <polygon
        points={pointsToPolygon(valuePoints)}
        fill="rgba(59,130,246,0.25)"
        stroke="#3b82f6"
        strokeWidth="2"
      />

      {/* Value dots */}
      {valuePoints.map((p, i) => (
        <circle
          key={i}
          cx={p.x.toFixed(2)}
          cy={p.y.toFixed(2)}
          r="4"
          fill="#3b82f6"
          aria-label={`${series[i].label}: ${series[i].value}`}
        />
      ))}

      {/* Axis labels */}
      {labelPositions.map((lp, i) => (
        <text
          key={i}
          x={lp.x.toFixed(2)}
          y={lp.y.toFixed(2)}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fill="#374151"
        >
          {series[i].label}
        </text>
      ))}
    </svg>
  );
}

// ─── Bar variant ─────────────────────────────────────────────────────────────

function BarVariant({
  series,
  size,
  maxValue,
  title,
}: {
  series: RadarSeries[];
  size: number;
  maxValue: number;
  title?: string;
}) {
  const rowHeight = 32;
  const labelWidth = 120;
  const barAreaWidth = size - labelWidth - 16;
  const height = series.length * rowHeight + 20;

  const svgTitle = title ?? `Comparative bar chart: ${series.map((s) => `${s.label} ${s.value}`).join(", ")}`;

  return (
    <svg
      viewBox={`0 0 ${size} ${height}`}
      width={size}
      height={height}
      role="img"
      aria-label={svgTitle}
    >
      <title>{svgTitle}</title>

      {series.map((s, i) => {
        const y = i * rowHeight + 10;
        const valueWidth = (s.value / maxValue) * barAreaWidth;
        const targetWidth =
          s.target !== undefined
            ? (s.target / maxValue) * barAreaWidth
            : null;

        const valueLabel =
          s.target !== undefined
            ? `${s.label}: ${s.value} / target ${s.target}`
            : `${s.label}: ${s.value}`;

        return (
          <g key={s.label}>
            {/* Row label */}
            <text
              x={labelWidth - 8}
              y={y + 10}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize="11"
              fill="#374151"
            >
              {s.label}
            </text>

            {/* Target bar (outline) */}
            {targetWidth !== null && (
              <rect
                x={labelWidth}
                y={y}
                width={targetWidth.toFixed(2)}
                height="18"
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="4 3"
                aria-label={`${s.label} target: ${s.target}`}
              />
            )}

            {/* Value bar (filled) */}
            <rect
              x={labelWidth}
              y={y + 3}
              width={valueWidth.toFixed(2)}
              height="12"
              fill="#3b82f6"
              rx="2"
              aria-label={valueLabel}
            />
          </g>
        );
      })}
    </svg>
  );
}

// ─── Public component ────────────────────────────────────────────────────────

export function RadarChart({
  series,
  size = 300,
  maxValue = 100,
  title,
  variant = "radar",
}: RadarChartProps) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {variant === "radar" ? (
        <RadarVariant
          series={series}
          size={size}
          maxValue={maxValue}
          title={title}
        />
      ) : (
        <BarVariant
          series={series}
          size={size}
          maxValue={maxValue}
          title={title}
        />
      )}
      <AccessibleDataTable series={series} />
    </div>
  );
}
