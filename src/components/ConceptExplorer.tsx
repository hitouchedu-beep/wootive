import React, {useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {CoordinateGraph} from './CoordinateGraph';
import {MathText} from './MathText';

interface ConceptExplorerProps {
  onStartQuiz: (mode: 'all' | 'direct' | 'inverse') => void;
}

const SLIDER_VALUES = [-6, -4, -3, -2, -1, 1, 2, 3, 4, 6];

export const ConceptExplorer: React.FC<ConceptExplorerProps> = ({onStartQuiz}) => {
  const [kind, setKind] = useState<'direct' | 'inverse'>('direct');
  const [sliderIdx, setSliderIdx] = useState<number>(6); // default a = 2
  const a = SLIDER_VALUES[sliderIdx];

  const equationText =
    kind === 'direct'
      ? a === 1
        ? '$y = x$'
        : a === -1
          ? '$y = -x$'
          : `$y = ${a}x$`
      : a < 0
        ? `$y = -\\frac{${Math.abs(a)}}{x}$`
        : `$y = \\frac{${a}}{x}$`;

  const sampleXs = kind === 'direct' ? [-2, -1, 1, 2] : [-3, -2, -1, 1, 2, 3];
  const sampleYs = sampleXs.map((x) => {
    const val = kind === 'direct' ? a * x : a / x;
    if (Number.isInteger(val)) return `${val}`;
    return val.toFixed(1).replace(/\.0$/, '');
  });

  const highlightPoint =
    kind === 'direct'
      ? {x: 1, y: a}
      : Math.abs(a) <= 4
        ? {x: 1, y: a}
        : {x: 2, y: a / 2};

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <p className="text-sm font-medium text-blue-700 mb-1">
              중학교 1학년 핵심 개념
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              정비례와 반비례 그래프 비교하기
            </h2>
          </div>

          <div
            className="inline-flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto"
            role="tablist"
            aria-label="개념 선택"
          >
            <button
              type="button"
              role="tab"
              aria-selected={kind === 'direct'}
              onClick={() => setKind('direct')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                kind === 'direct'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              정비례
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={kind === 'inverse'}
              onClick={() => setKind('inverse')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                kind === 'inverse'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              반비례
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-start">
          {/* Left: Interactive Coordinate Plane */}
          <div className="lg:col-span-5 flex flex-col items-center bg-slate-50/80 rounded-xl border border-slate-200/80 p-5">
            <div className="mb-3 text-lg font-bold text-slate-900">
              <MathText text={`현재 관계식: ${equationText}`} />
            </div>
            <CoordinateGraph
              spec={{
                kind,
                a,
                point: highlightPoint,
                range: 6,
              }}
              size={280}
            />
            <p className="mt-3 text-xs text-slate-500 text-center">
              {kind === 'direct'
                ? '원점 (0, 0)을 지나는 직선입니다.'
                : '원점을 지나지 않으며 좌표축과 만나지 않는 한 쌍의 곡선입니다.'}
            </p>
          </div>

          {/* Right: Controls, Table & Properties */}
          <div className="lg:col-span-7 space-y-6">
            {/* Slider Control */}
            <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <label
                  htmlFor="param-a-slider"
                  className="text-base font-semibold text-slate-900"
                >
                  <MathText text="비례상수 $a$ 값 바꾸기" />
                </label>
                <span className="font-mono-num text-lg font-bold text-blue-700">
                  a = {a}
                </span>
              </div>
              <input
                id="param-a-slider"
                type="range"
                min={0}
                max={SLIDER_VALUES.length - 1}
                step={1}
                value={sliderIdx}
                onChange={(e) => setSliderIdx(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-blue-200 rounded-lg"
              />
              <div className="flex justify-between text-xs font-mono-num text-slate-500 mt-2">
                {SLIDER_VALUES.map((val, idx) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setSliderIdx(idx)}
                    className={`px-1 py-0.5 rounded cursor-pointer transition-colors ${
                      idx === sliderIdx
                        ? 'text-blue-700 font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Value Table */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">
                <MathText text="$x$와 $y$의 대응표" />
              </h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-center border-collapse">
                  <tbody>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="py-2.5 px-3 text-sm font-semibold text-slate-700 border-r border-slate-200 w-16">
                        <MathText text="$x$" />
                      </th>
                      {sampleXs.map((xv) => (
                        <td
                          key={`tx-${xv}`}
                          className="py-2.5 px-3 font-mono-num text-base text-slate-800 border-r last:border-r-0 border-slate-200"
                        >
                          {xv}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-white">
                      <th className="py-2.5 px-3 text-sm font-semibold text-blue-700 border-r border-slate-200">
                        <MathText text="$y$" />
                      </th>
                      {sampleYs.map((yv, idx) => (
                        <td
                          key={`ty-${idx}`}
                          className="py-2.5 px-3 font-mono-num text-base font-semibold text-blue-700 border-r last:border-r-0 border-slate-200"
                        >
                          {yv}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Dynamic Properties Explanation */}
            <div className="space-y-3 text-base text-slate-700 leading-relaxed">
              <div className="p-4 rounded-xl border border-slate-200 bg-white">
                <p className="font-semibold text-slate-900 mb-1">
                  지금 그래프의 성질 (<MathText text={`$a = ${a} ${a > 0 ? '> 0' : '< 0'}$`} />)
                </p>
                <ul className="space-y-1.5 text-[15px] text-slate-700">
                  <li>
                    • 지나는 사분면:{' '}
                    <strong className="text-blue-700">
                      {a > 0 ? '제1사분면, 제3사분면' : '제2사분면, 제4사분면'}
                    </strong>
                  </li>
                  <li>
                    • 증감 변화:{' '}
                    {kind === 'direct' ? (
                      a > 0 ? (
                        <MathText text="$x$의 값이 증가하면 $y$의 값도 증가합니다. (오른쪽 위로 향하는 직선)" />
                      ) : (
                        <MathText text="$x$의 값이 증가하면 $y$의 값은 감소합니다. (오른쪽 아래로 향하는 직선)" />
                      )
                    ) : a > 0 ? (
                      <MathText text="각 사분면에서 $x$의 값이 증가하면 $y$의 값은 감소합니다." />
                    ) : (
                      <MathText text="각 사분면에서 $x$의 값이 증가하면 $y$의 값도 증가합니다." />
                    )}
                  </li>
                  <li>
                    • 핵심 계산법:{' '}
                    {kind === 'direct' ? (
                      <MathText text={`$\\frac{y}{x} = ${a}$로 항상 일정합니다.`} />
                    ) : (
                      <MathText text={`$x \\times y = ${a}$로 항상 일정합니다.`} />
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-side summary comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-blue-700">핵심 요약 01</p>
            <h3 className="text-xl font-bold text-slate-900">
              정비례 (<MathText text="$y = ax$, $a \neq 0$" />)
            </h3>
            <ul className="space-y-2 text-[15px] text-slate-700 leading-relaxed">
              <li>
                • <MathText text="$x$가 $2$배, $3$배가 될 때 $y$도 $2$배, $3$배가 되는 관계" />
              </li>
              <li>• 그래프는 항상 원점 (0, 0)을 지나는 직선</li>
              <li>
                • <MathText text="$|a|$가 클수록 $y$축에 가까워짐" />
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onStartQuiz('direct')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            정비례 10문제 풀기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-blue-700">핵심 요약 02</p>
            <h3 className="text-xl font-bold text-slate-900">
              반비례 (<MathText text="$y = \frac{a}{x}$, $a \neq 0$" />)
            </h3>
            <ul className="space-y-2 text-[15px] text-slate-700 leading-relaxed">
              <li>
                • <MathText text="$x$가 $2$배, $3$배가 될 때 $y$는 $\frac{1}{2}$배, $\frac{1}{3}$배가 되는 관계" />
              </li>
              <li>• 원점을 지나지 않고 좌표축과 만나지 않는 한 쌍의 곡선</li>
              <li>
                • <MathText text="$|a|$가 클수록 원점에서 멀어짐" />
              </li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => onStartQuiz('inverse')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
          >
            반비례 10문제 풀기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
