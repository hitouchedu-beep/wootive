import React from 'react';

export interface GraphSpec {
  kind: 'direct' | 'inverse';
  a: number;
  point?: {x: number; y: number};
  range?: number;
}

interface CoordinateGraphProps {
  spec: GraphSpec;
  size?: number;
  caption?: string;
}

export const CoordinateGraph: React.FC<CoordinateGraphProps> = ({
  spec,
  size = 260,
  caption,
}) => {
  const {kind, a, point} = spec;
  const maxCoord =
    spec.range ??
    Math.max(
      6,
      point ? Math.ceil(Math.max(Math.abs(point.x), Math.abs(point.y)) + 1) : 6,
    );

  const svgSize = 280;
  const pad = 26;
  const plotSpan = svgSize - pad * 2;
  const mid = svgSize / 2;
  const step = plotSpan / (maxCoord * 2);

  const toSvgX = (x: number) => mid + x * step;
  const toSvgY = (y: number) => mid - y * step;

  // Compute grid ticks (clean integer steps)
  const tickStep = maxCoord <= 7 ? 1 : 2;
  const ticks: number[] = [];
  for (let v = -maxCoord; v <= maxCoord; v += tickStep) {
    if (v !== 0) ticks.push(v);
  }

  // Build curve / line paths
  const renderCurve = () => {
    if (kind === 'direct') {
      // Clip y = a*x inside [-maxCoord, maxCoord] x [-maxCoord, maxCoord]
      const candidates: Array<{x: number; y: number}> = [];
      const addIfValid = (x: number, y: number) => {
        if (
          x >= -maxCoord - 1e-6 &&
          x <= maxCoord + 1e-6 &&
          y >= -maxCoord - 1e-6 &&
          y <= maxCoord + 1e-6
        ) {
          candidates.push({x, y});
        }
      };
      addIfValid(-maxCoord, a * -maxCoord);
      addIfValid(maxCoord, a * maxCoord);
      if (Math.abs(a) > 1e-9) {
        addIfValid(-maxCoord / a, -maxCoord);
        addIfValid(maxCoord / a, maxCoord);
      }
      // Deduplicate and sort by x
      candidates.sort((p1, p2) => p1.x - p2.x);
      if (candidates.length < 2) return null;
      const pStart = candidates[0];
      const pEnd = candidates[candidates.length - 1];
      return (
        <line
          x1={toSvgX(pStart.x)}
          y1={toSvgY(pStart.y)}
          x2={toSvgX(pEnd.x)}
          y2={toSvgY(pEnd.y)}
          stroke="#2563EB"
          strokeWidth={2.75}
          strokeLinecap="round"
        />
      );
    }

    // Inverse proportion: two hyperbola branches
    const buildBranch = (xMin: number, xMax: number) => {
      const pts: string[] = [];
      const samples = 140;
      for (let i = 0; i <= samples; i++) {
        const x = xMin + ((xMax - xMin) * i) / samples;
        if (Math.abs(x) < 0.08) continue;
        const y = a / x;
        if (y >= -maxCoord && y <= maxCoord) {
          pts.push(`${pts.length === 0 ? 'M' : 'L'} ${toSvgX(x).toFixed(2)} ${toSvgY(y).toFixed(2)}`);
        }
      }
      return pts.join(' ');
    };

    const leftPath = buildBranch(-maxCoord, -0.08);
    const rightPath = buildBranch(0.08, maxCoord);

    return (
      <>
        {leftPath && (
          <path
            d={leftPath}
            fill="none"
            stroke="#2563EB"
            strokeWidth={2.75}
            strokeLinecap="round"
          />
        )}
        {rightPath && (
          <path
            d={rightPath}
            fill="none"
            stroke="#2563EB"
            strokeWidth={2.75}
            strokeLinecap="round"
          />
        )}
      </>
    );
  };

  // Label offset for highlighted point so it stays away from axes
  const getPointLabelPos = (px: number, py: number) => {
    const sx = toSvgX(px);
    const sy = toSvgY(py);
    const dx = px >= 0 ? 9 : -9;
    const dy = py >= 0 ? -10 : 16;
    const anchor: 'start' | 'end' = px >= 0 ? 'start' : 'end';
    // Prevent clipping outside SVG edges
    const clampedX = Math.max(pad + 26, Math.min(svgSize - pad - 26, sx + dx));
    const clampedY = Math.max(pad + 12, Math.min(svgSize - pad - 6, sy + dy));
    return {x: clampedX, y: clampedY, anchor};
  };

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        style={{width: '100%', maxWidth: `${size}px`}}
        className="h-auto bg-white rounded-xl border border-slate-200 select-none"
        role="img"
        aria-label={
          caption ??
          (kind === 'direct'
            ? `원점을 지나는 정비례 직선 그래프`
            : `원점을 지나지 않는 반비례 곡선 그래프`)
        }
      >
        {/* Grid lines */}
        {Array.from({length: maxCoord * 2 + 1}, (_, idx) => -maxCoord + idx).map((v) => (
          <React.Fragment key={`grid-${v}`}>
            <line
              x1={toSvgX(v)}
              y1={pad}
              x2={toSvgX(v)}
              y2={svgSize - pad}
              stroke={v === 0 ? 'transparent' : '#EFF6FF'}
              strokeWidth={1}
            />
            <line
              x1={pad}
              y1={toSvgY(v)}
              x2={svgSize - pad}
              y2={toSvgY(v)}
              stroke={v === 0 ? 'transparent' : '#EFF6FF'}
              strokeWidth={1}
            />
          </React.Fragment>
        ))}

        {/* Axes */}
        <line
          x1={pad - 6}
          y1={mid}
          x2={svgSize - pad + 8}
          y2={mid}
          stroke="#475569"
          strokeWidth={1.5}
        />
        <polygon
          points={`${svgSize - pad + 11},${mid} ${svgSize - pad + 4},${mid - 3.5} ${svgSize - pad + 4},${mid + 3.5}`}
          fill="#475569"
        />
        <line
          x1={mid}
          y1={svgSize - pad + 6}
          x2={mid}
          y2={pad - 8}
          stroke="#475569"
          strokeWidth={1.5}
        />
        <polygon
          points={`${mid},${pad - 11} ${mid - 3.5},${pad - 4} ${mid + 3.5},${pad - 4}`}
          fill="#475569"
        />

        {/* Axis labels */}
        <text
          x={svgSize - pad + 12}
          y={mid + 14}
          fontSize="13"
          fontStyle="italic"
          fontFamily="Georgia, serif"
          fontWeight="600"
          fill="#334155"
        >
          x
        </text>
        <text
          x={mid + 8}
          y={pad - 4}
          fontSize="13"
          fontStyle="italic"
          fontFamily="Georgia, serif"
          fontWeight="600"
          fill="#334155"
        >
          y
        </text>
        <text
          x={mid - 13}
          y={mid + 14}
          fontSize="11"
          fontStyle="italic"
          fontFamily="Georgia, serif"
          fill="#64748B"
        >
          O
        </text>

        {/* Tick marks (every 2 units or matching point) */}
        {ticks
          .filter((v) => v % 2 === 0 || (point && (v === point.x || v === point.y)))
          .map((v) => (
            <React.Fragment key={`tick-${v}`}>
              <line
                x1={toSvgX(v)}
                y1={mid - 2.5}
                x2={toSvgX(v)}
                y2={mid + 2.5}
                stroke="#64748B"
                strokeWidth={1}
              />
              {v % 2 === 0 && (
                <text
                  x={toSvgX(v)}
                  y={mid + 13}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, monospace"
                  fill="#64748B"
                >
                  {v}
                </text>
              )}
              <line
                x1={mid - 2.5}
                y1={toSvgY(v)}
                x2={mid + 2.5}
                y2={toSvgY(v)}
                stroke="#64748B"
                strokeWidth={1}
              />
              {v % 2 === 0 && (
                <text
                  x={mid - 7}
                  y={toSvgY(v) + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fontFamily="IBM Plex Mono, monospace"
                  fill="#64748B"
                >
                  {v}
                </text>
              )}
            </React.Fragment>
          ))}

        {/* Function curve */}
        {renderCurve()}

        {/* Highlighted point and dashed projection guides */}
        {point && (
          <>
            <line
              x1={toSvgX(point.x)}
              y1={toSvgY(point.y)}
              x2={toSvgX(point.x)}
              y2={mid}
              stroke="#93C5FD"
              strokeWidth={1.5}
              strokeDasharray="3.5 3.5"
            />
            <line
              x1={toSvgX(point.x)}
              y1={toSvgY(point.y)}
              x2={mid}
              y2={toSvgY(point.y)}
              stroke="#93C5FD"
              strokeWidth={1.5}
              strokeDasharray="3.5 3.5"
            />
            <circle
              cx={toSvgX(point.x)}
              cy={toSvgY(point.y)}
              r={5}
              fill="#1D4ED8"
              stroke="#FFFFFF"
              strokeWidth={2}
            />
            {(() => {
              const pos = getPointLabelPos(point.x, point.y);
              return (
                <text
                  x={pos.x}
                  y={pos.y}
                  textAnchor={pos.anchor}
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="IBM Plex Mono, monospace"
                  fill="#1E3A8A"
                >
                  ({point.x}, {point.y})
                </text>
              );
            })()}
          </>
        )}
      </svg>
      {caption && (
        <span className="mt-2 text-xs text-slate-500">{caption}</span>
      )}
    </div>
  );
};
