import React from 'react';

const WIDTH = 1000;
const HEIGHT = 120;
const PADDING = { top: 10, right: 10, bottom: 18, left: 44 };
const MAX_POINTS = 300;

function parseTimeToMinutes(time) {
  if (!time) return null;
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  const total = h * 60 + m;
  const morningStart = 9 * 60 + 30;
  const morningEnd = 11 * 60 + 30;
  const afternoonStart = 13 * 60;
  const afternoonEnd = 15 * 60;
  if (total <= morningStart) return 0;
  if (total <= morningEnd) return total - morningStart;
  if (total < afternoonStart) return 120;
  if (total <= afternoonEnd) return 120 + (total - afternoonStart);
  return 240;
}

function getTrendData(code) {
  if (typeof window === 'undefined' || !code) {
    return { date: '', points: [] };
  }
  try {
    const raw = localStorage.getItem(`fundTrendData:${code}`);
    if (!raw) return { date: '', points: [] };
    const data = JSON.parse(raw);
    if (!data || !Array.isArray(data.points)) return { date: '', points: [] };
    return {
      date: data.date || '',
      points: data.points.slice(-MAX_POINTS)
    };
  } catch {
    return { date: '', points: [] };
  }
}

function buildPath(points, width, height) {
  if (!points.length) return { linePath: '', areaPath: '', zeroY: null, coords: [] };

  const values = points.map((p) => p.pct).filter(Number.isFinite);
  if (!values.length) return { linePath: '', areaPath: '', zeroY: null, coords: [] };

  const rawMin = Math.min(...values, 0);
  const rawMax = Math.max(...values, 0);
  let min = rawMin;
  let max = rawMax;
  let range = max - min;
  if (range < 0.2) range = 0.2;
  const padding = range * 0.08;
  min -= padding;
  max += padding;

  const plotWidth = width - PADDING.left - PADDING.right;
  const plotHeight = height - PADDING.top - PADDING.bottom;

  const coords = points
    .map((p) => {
      const minutes = parseTimeToMinutes(p.time);
      if (minutes === null || !Number.isFinite(p.pct)) return null;
      const x = PADDING.left + (minutes / 240) * plotWidth;
      const y = PADDING.top + ((max - p.pct) / (max - min)) * plotHeight;
      return { x, y };
    })
    .filter(Boolean);

  if (!coords.length) return { linePath: '', areaPath: '', zeroY: null, coords: [] };

  const linePath = coords
    .map((c, idx) => `${idx === 0 ? 'M' : 'L'} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
    .join(' ');

  const bottom = PADDING.top + plotHeight;
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(2)} ${bottom} L ${coords[0].x.toFixed(2)} ${bottom} Z`;

  const zeroY = PADDING.top + ((max - 0) / (max - min)) * plotHeight;

  return {
    linePath,
    areaPath,
    zeroY,
    coords,
    min: rawMin,
    max: rawMax,
    minPadded: min,
    maxPadded: max,
    plotHeight
  };
}

export default function FundChart({ fundCode, latestTime, latestPct }) {
  const { date, points } = getTrendData(fundCode);
  const latestPoint = points[points.length - 1];
  const pctValue = Number.isFinite(latestPoint?.pct) ? latestPoint.pct : (Number.isFinite(latestPct) ? latestPct : null);
  const displayDate = date || (latestTime ? latestTime.split(' ')[0] : '');
  const isUp = typeof pctValue === 'number' ? pctValue >= 0 : true;
  const stroke = isUp ? 'var(--danger)' : 'var(--success)';
  const gradientId = `fund-chart-fill-${fundCode}`;

  const { linePath, areaPath, zeroY, coords, min, max, minPadded, maxPadded, plotHeight } = buildPath(points, WIDTH, HEIGHT);
  const showAxis = Number.isFinite(min) && Number.isFinite(max) && Number.isFinite(minPadded) && Number.isFinite(maxPadded) && Number.isFinite(plotHeight) && typeof zeroY === 'number';
  const formatPct = (value) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  const axisFontSize = 12;
  const valueToY = (value) => PADDING.top + ((maxPadded - value) / (maxPadded - minPadded)) * plotHeight;

  return (
    <div className="fund-chart-container" role="img" aria-label="基金估值分时曲线">
      <div className="fund-chart-header">
        <span className="muted">日期 {displayDate || '--'}</span>
        <span>
          估算涨幅{' '}
          {typeof pctValue === 'number' ? (
            <strong className={pctValue >= 0 ? 'up' : 'down'}>
              {pctValue >= 0 ? '+' : ''}{pctValue.toFixed(2)}%
            </strong>
          ) : (
            <strong className="muted">--</strong>
          )}
        </span>
      </div>
      {points.length === 0 ? (
        <div className="fund-chart-empty muted">暂无当日数据</div>
      ) : (
        <svg
          className="fund-chart-canvas"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.24" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          {typeof zeroY === 'number' && (
            <line
              x1={PADDING.left}
              y1={zeroY}
              x2={WIDTH - PADDING.right}
              y2={zeroY}
              stroke="rgba(255,255,255,0.25)"
              strokeDasharray="4 6"
              strokeWidth="1"
            />
          )}
          {areaPath && (
            <path d={areaPath} fill={`url(#${gradientId})`} stroke="none" />
          )}
          {linePath && (
            <path d={linePath} fill="none" stroke={stroke} strokeWidth="2" />
          )}
          {showAxis && (
            <>
              <line
                x1={PADDING.left - 4}
                y1={valueToY(max)}
                x2={PADDING.left}
                y2={valueToY(max)}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
              />
              <text
                x={6}
                y={valueToY(max) + 3}
                textAnchor="start"
                fontSize={axisFontSize}
                fill="var(--muted)"
              >
                {formatPct(max)}
              </text>

              <line
                x1={PADDING.left - 4}
                y1={zeroY}
                x2={PADDING.left}
                y2={zeroY}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
              />
              <text
                x={6}
                y={zeroY + 3}
                textAnchor="start"
                fontSize={axisFontSize}
                fill="var(--muted)"
              >
                {formatPct(0)}
              </text>

              <line
                x1={PADDING.left - 4}
                y1={valueToY(min)}
                x2={PADDING.left}
                y2={valueToY(min)}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
              />
              <text
                x={6}
                y={valueToY(min) + 3}
                textAnchor="start"
                fontSize={axisFontSize}
                fill="var(--muted)"
              >
                {formatPct(min)}
              </text>
            </>
          )}
          {coords.length > 0 && typeof latestPoint?.pct === 'number' && (
            <circle
              cx={coords[coords.length - 1].x}
              cy={coords[coords.length - 1].y}
              r="3"
              fill={stroke}
              stroke="rgba(15,23,42,0.9)"
              strokeWidth="2"
            />
          )}
        </svg>
      )}
      <div className="fund-chart-axis">
        <span>09:30</span>
        <span>11:30/13:00</span>
        <span>15:00</span>
      </div>
    </div>
  );
}
