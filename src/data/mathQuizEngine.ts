import type {GraphSpec} from '../components/CoordinateGraph';

export type QuizTopic = 'direct' | 'inverse';
export type TopicFilter = 'all' | 'direct' | 'inverse';

export interface TableSpec {
  columns: Array<{x: string; y: string; missing?: 'x' | 'y'}>;
}

export interface QuizQuestion {
  id: string;
  archetype: string;
  topic: QuizTopic;
  topicLabel: string;
  subLabel: string;
  prompt: string;
  graph?: GraphSpec;
  table?: TableSpec;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  conceptTitle: string;
  explanation: string;
  correctSummary: string;
}

// --- Rational / Fraction Helpers ---

interface Frac {
  num: number;
  den: number;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x === 0 ? 1 : x;
}

function makeFrac(num: number, den = 1): Frac {
  if (den === 0) throw new Error('Denominator cannot be zero');
  if (num === 0) return {num: 0, den: 1};
  const sign = den < 0 ? -1 : 1;
  const g = gcd(num, den);
  return {
    num: (sign * num) / g,
    den: Math.abs(den) / g,
  };
}

function fracValue(f: Frac): number {
  return f.num / f.den;
}

function fracEqual(a: Frac, b: Frac): boolean {
  return a.num * b.den === b.num * a.den;
}

function formatFrac(f: Frac): string {
  if (f.den === 1) return `${f.num}`;
  const sign = f.num < 0 ? '-' : '';
  return `${sign}\\frac{${Math.abs(f.num)}}{${f.den}}`;
}

function formatDirectEq(a: Frac): string {
  if (a.den === 1) {
    if (a.num === 1) return '$y = x$';
    if (a.num === -1) return '$y = -x$';
    return `$y = ${a.num}x$`;
  }
  return `$y = ${formatFrac(a)}x$`;
}

function formatInverseEq(a: number): string {
  if (a < 0) return `$y = -\\frac{${Math.abs(a)}}{x}$`;
  return `$y = \\frac{${a}}{x}$`;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function packOptions(
  correct: string,
  distractors: string[],
): {options: [string, string, string, string]; correctIndex: 0 | 1 | 2 | 3} {
  const uniqueDistractors: string[] = [];
  for (const d of distractors) {
    if (d !== correct && !uniqueDistractors.includes(d)) {
      uniqueDistractors.push(d);
    }
    if (uniqueDistractors.length === 3) break;
  }
  if (uniqueDistractors.length < 3) {
    throw new Error(`Not enough unique distractors for: ${correct}`);
  }
  const combined = shuffle([correct, ...uniqueDistractors]);
  const correctIndex = combined.indexOf(correct) as 0 | 1 | 2 | 3;
  return {
    options: [combined[0], combined[1], combined[2], combined[3]],
    correctIndex,
  };
}

function buildIntDistractors(correct: number, candidates: number[]): number[] {
  const res: number[] = [];
  for (const c of candidates) {
    if (Number.isInteger(c) && c !== correct && !res.includes(c)) {
      res.push(c);
    }
  }
  const offsets = [1, -1, 2, -2, 3, -3, 4, -4, 6, -6];
  for (const off of offsets) {
    if (res.length >= 3) break;
    const candidate = correct + off;
    if (candidate !== correct && candidate !== 0 && !res.includes(candidate)) {
      res.push(candidate);
    }
  }
  return res.slice(0, 3);
}

// ============================================================================
// Direct Proportion (정비례) Archetypes
// ============================================================================

function genDirectIdentifyEq(idx: number): QuizQuestion {
  const askNotDirect = Math.random() < 0.45;
  const directPool = [
    '$y = 3x$',
    '$y = -4x$',
    '$y = 5x$',
    '$y = -2x$',
    '$y = \\frac{1}{2}x$',
    '$y = -\\frac{2}{3}x$',
    '$y = \\frac{x}{4}$',
    '$y = -\\frac{x}{3}$',
  ];
  const nonDirectPool = [
    '$y = \\frac{6}{x}$',
    '$y = -\\frac{8}{x}$',
    '$xy = 12$',
    '$y = x + 3$',
    '$y = 2x - 5$',
    '$y = -x + 4$',
    '$y = x^2$',
  ];

  if (!askNotDirect) {
    const correct = pickRandom(directPool);
    const distractors = shuffle(nonDirectPool).slice(0, 3);
    const {options, correctIndex} = packOptions(correct, distractors);
    return {
      id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      archetype: 'direct_identify_eq',
      topic: 'direct',
      topicLabel: '정비례',
      subLabel: '관계식 판별',
      prompt: '다음 중 $y$가 $x$에 정비례하는 식은?',
      options,
      correctIndex,
      conceptTitle: '정비례 관계식의 형태',
      explanation:
        '$y$가 $x$에 정비례하면 관계식은 $y = ax$ ($a \\neq 0$) 꼴로 나타납니다. $y = \\frac{x}{4}$처럼 분모가 상수이고 분자에 $x$가 있는 식도 $y = \\frac{1}{4}x$이므로 정비례입니다.',
      correctSummary: `${correct}은 $y = ax$ ($a \\neq 0$) 꼴이므로 정비례합니다.`,
    };
  }

  const correct = pickRandom(nonDirectPool);
  const distractors = shuffle(directPool).slice(0, 3);
  const {options, correctIndex} = packOptions(correct, distractors);
  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'direct_identify_eq',
    topic: 'direct',
    topicLabel: '정비례',
    subLabel: '관계식 판별',
    prompt: '다음 중 $y$가 $x$에 정비례하지 않는 식은?',
    options,
    correctIndex,
    conceptTitle: '정비례 vs 반비례 · 일차식 구분하기',
    explanation:
      '정비례는 반드시 $y = ax$ ($a \\neq 0$) 꼴이어야 합니다. 분모에 $x$가 있는 $y = \\frac{a}{x}$, 곱이 일정한 $xy = a$, 상수항이 더해진 $y = x + b$ ($b \\neq 0$) 등은 정비례가 아닙니다.',
    correctSummary: `${correct}은 $y = ax$ 꼴이 아니므로 정비례하지 않습니다.`,
  };
}

function genDirectFindY(idx: number): QuizQuestion {
  const slopes: Frac[] = [
    makeFrac(2, 1),
    makeFrac(3, 1),
    makeFrac(4, 1),
    makeFrac(-2, 1),
    makeFrac(-3, 1),
    makeFrac(-4, 1),
    makeFrac(1, 2),
    makeFrac(-1, 2),
    makeFrac(2, 3),
    makeFrac(-3, 2),
  ];
  const a = pickRandom(slopes);
  const mults = [-4, -3, -2, -1, 1, 2, 3, 4, 5].map((k) => k * a.den);
  const x1 = pickRandom(mults);
  const x2 = pickRandom(mults.filter((m) => m !== x1 && m !== -x1));
  const y1 = (a.num * x1) / a.den;
  const y2 = (a.num * x2) / a.den;

  const candidates = [
    -y2,
    y1 + (x2 - x1),
    Math.round((x1 * y1) / x2) || y2 + a.num,
    a.num + x2,
    y2 * 2,
  ];
  const distNums = buildIntDistractors(y2, candidates);
  const {options, correctIndex} = packOptions(
    `$${y2}$`,
    distNums.map((n) => `$${n}$`),
  );

  const aStr = formatFrac(a);
  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'direct_find_y',
    topic: 'direct',
    topicLabel: '정비례',
    subLabel: '함숫값 구하기',
    prompt: `$y$가 $x$에 정비례하고, $x = ${x1}$일 때 $y = ${y1}$이다. $x = ${x2}$일 때 $y$의 값은?`,
    options,
    correctIndex,
    conceptTitle: '비례상수 $a$를 구해 식 세우기',
    explanation: `$y = ax$에 $x = ${x1}$, $y = ${y1}$을 대입하면 $a = \\frac{${y1}}{${x1}} = ${aStr}$입니다. 따라서 ${formatDirectEq(a)}에 $x = ${x2}$를 대입하면 $y = ${y2}$입니다.`,
    correctSummary: `$a = ${aStr}$이므로 $x = ${x2}$일 때 $y = ${y2}$입니다.`,
  };
}

function genDirectFindEqFromPoint(idx: number): QuizQuestion {
  const configs: Array<{a: Frac; px: number; py: number}> = [
    {a: makeFrac(2, 1), px: 2, py: 4},
    {a: makeFrac(3, 1), px: 2, py: 6},
    {a: makeFrac(-2, 1), px: 2, py: -4},
    {a: makeFrac(-3, 1), px: -2, py: 6},
    {a: makeFrac(1, 2), px: 4, py: 2},
    {a: makeFrac(-1, 2), px: -4, py: 2},
    {a: makeFrac(2, 3), px: 3, py: 2},
    {a: makeFrac(-3, 2), px: 2, py: -3},
  ];
  const cfg = pickRandom(configs);
  const correct = formatDirectEq(cfg.a);

  const negA = formatDirectEq(makeFrac(-cfg.a.num, cfg.a.den));
  const invSlope =
    Math.abs(cfg.a.num) === Math.abs(cfg.a.den)
      ? formatDirectEq(makeFrac(cfg.a.num * 2, cfg.a.den))
      : formatDirectEq(makeFrac(cfg.a.den, cfg.a.num));
  const invProp1 = formatInverseEq(cfg.px * cfg.py);
  const invProp2 = formatInverseEq(-cfg.px * cfg.py);

  const {options, correctIndex} = packOptions(correct, [
    negA,
    invSlope,
    invProp1,
    invProp2,
  ]);

  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'direct_find_eq_from_point',
    topic: 'direct',
    topicLabel: '정비례',
    subLabel: '그래프로 식 찾기',
    prompt: `아래 그래프는 점 $(${cfg.px}, ${cfg.py})$를 지나는 직선이다. 이 그래프가 나타내는 $x$와 $y$ 사이의 관계식은?`,
    graph: {
      kind: 'direct',
      a: fracValue(cfg.a),
      point: {x: cfg.px, y: cfg.py},
      range: 6,
    },
    options,
    correctIndex,
    conceptTitle: '원점을 지나는 직선과 관계식',
    explanation: `원점 $(0, 0)$을 지나는 직선은 정비례 관계 $y = ax$의 그래프입니다. 점 $(${cfg.px}, ${cfg.py})$를 대입하면 $a = \\frac{${cfg.py}}{${cfg.px}} = ${formatFrac(cfg.a)}$이므로 관계식은 ${correct}입니다.`,
    correctSummary: `원점을 지나는 직선이므로 ${correct}입니다.`,
  };
}

function genDirectQuadrantProperty(idx: number): QuizQuestion {
  const slopes: Frac[] = [
    makeFrac(3, 1),
    makeFrac(-3, 1),
    makeFrac(4, 1),
    makeFrac(-2, 1),
    makeFrac(2, 3),
    makeFrac(-1, 2),
    makeFrac(5, 2),
    makeFrac(-4, 3),
  ];
  const a = pickRandom(slopes);
  const isPos = fracValue(a) > 0;
  const eq = formatDirectEq(a);

  if (Math.random() < 0.5) {
    const correct = isPos ? '제1사분면, 제3사분면' : '제2사분면, 제4사분면';
    const distractors = [
      isPos ? '제2사분면, 제4사분면' : '제1사분면, 제3사분면',
      '제1사분면, 제2사분면',
      '제3사분면, 제4사분면',
    ];
    const {options, correctIndex} = packOptions(correct, distractors);
    return {
      id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      archetype: 'direct_quadrant_property',
      topic: 'direct',
      topicLabel: '정비례',
      subLabel: '그래프의 성질',
      prompt: `정비례 관계 ${eq}의 그래프가 지나는 사분면을 모두 고르면?`,
      options,
      correctIndex,
      conceptTitle: '정비례 그래프가 지나는 사분면',
      explanation: `정비례 관계 $y = ax$에서 $a > 0$이면 제1사분면과 제3사분면을 지나고, $a < 0$이면 제2사분면과 제4사분면을 지납니다. 여기서 $a = ${formatFrac(a)}$이므로 ${correct}을 지납니다.`,
      correctSummary: `$a ${isPos ? '> 0' : '< 0'}$이므로 ${correct}을 지납니다.`,
    };
  }

  const correct = isPos
    ? '$x$의 값이 증가하면 $y$의 값도 증가한다.'
    : '$x$의 값이 증가하면 $y$의 값은 감소한다.';
  const distractors = [
    isPos
      ? '$x$의 값이 증가하면 $y$의 값은 감소한다.'
      : '$x$의 값이 증가하면 $y$의 값도 증가한다.',
    isPos ? '제2사분면과 제4사분면을 지난다.' : '제1사분면과 제3사분면을 지난다.',
    '원점을 지나지 않는 한 쌍의 곡선이다.',
  ];
  const {options, correctIndex} = packOptions(correct, distractors);
  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'direct_quadrant_property',
    topic: 'direct',
    topicLabel: '정비례',
    subLabel: '그래프의 성질',
    prompt: `정비례 관계 ${eq}의 그래프에 대한 설명으로 옳은 것은?`,
    options,
    correctIndex,
    conceptTitle: '정비례 그래프의 증가와 감소',
    explanation: `정비례 관계 $y = ax$의 그래프는 원점을 지나는 직선이며, $a > 0$이면 오른쪽 위로 향해 $x$가 증가할 때 $y$도 증가하고, $a < 0$이면 오른쪽 아래로 향해 $x$가 증가할 때 $y$는 감소합니다.`,
    correctSummary: `${eq}에서 $a ${isPos ? '> 0' : '< 0'}$이므로 ${correct}`,
  };
}

function genDirectPointOnGraph(idx: number): QuizQuestion {
  const slopes: Frac[] = [
    makeFrac(2, 1),
    makeFrac(3, 1),
    makeFrac(-2, 1),
    makeFrac(-4, 1),
    makeFrac(1, 2),
    makeFrac(-1, 3),
  ];
  const a = pickRandom(slopes);
  const pChoices = [-3, -2, -1, 1, 2, 3].map((k) => k * a.den);
  const px = pickRandom(pChoices);
  const py = (a.num * px) / a.den;

  const isOnGraph = (x: number, y: number) => y * a.den === a.num * x;
  const rawDistractors: Array<[number, number]> = [
    [px, -py],
    [py, px],
    [px, py + 2],
    [-px, py],
    [px + 1, py + 1],
    [px, a.num + px],
  ];
  const validDistractors: string[] = [];
  for (const [dx, dy] of rawDistractors) {
    if (!isOnGraph(dx, dy)) {
      const label = `$(${dx}, ${dy})$`;
      if (!validDistractors.includes(label)) {
        validDistractors.push(label);
      }
    }
  }

  const correct = `$(${px}, ${py})$`;
  const {options, correctIndex} = packOptions(correct, validDistractors);
  const eq = formatDirectEq(a);

  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'direct_point_on_graph',
    topic: 'direct',
    topicLabel: '정비례',
    subLabel: '그래프 위의 점',
    prompt: `정비례 관계 ${eq}의 그래프가 지나는 점은?`,
    options,
    correctIndex,
    conceptTitle: '그래프가 지나는 점 판별하기',
    explanation: `점 $(p, q)$가 그래프 위에 있으려면 관계식 ${eq}에 $x = p$, $y = q$를 대입했을 때 참이 되어야 합니다. $x = ${px}$를 대입하면 $y = ${py}$이므로 점 ${correct}를 지납니다.`,
    correctSummary: `$x = ${px}$일 때 $y = ${py}$이므로 ${correct}를 지납니다.`,
  };
}

function genDirectTableFill(idx: number): QuizQuestion {
  const a = pickRandom([-4, -3, -2, 2, 3, 4, 5]);
  const xVals = pickRandom([
    [1, 2, 3, 4],
    [2, 4, 6, 8],
    [-2, -1, 1, 2],
  ]);
  const missingPos = pickRandom([1, 2, 3]);
  const missingY = a * xVals[missingPos];

  const columns = xVals.map((xv, i) => ({
    x: `${xv}`,
    y: i === missingPos ? '?' : `${a * xv}`,
    missing: i === missingPos ? ('y' as const) : undefined,
  }));

  const distNums = buildIntDistractors(missingY, [
    -missingY,
    missingY + a,
    missingY - a,
    a * (xVals[missingPos] + 1),
  ]);
  const {options, correctIndex} = packOptions(
    `$${missingY}$`,
    distNums.map((n) => `$${n}$`),
  );

  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'direct_table_fill',
    topic: 'direct',
    topicLabel: '정비례',
    subLabel: '표 해석하기',
    prompt: '다음 표는 $y$가 $x$에 정비례할 때 $x$와 $y$의 값을 나타낸 것이다. 표의 ?에 알맞은 수는?',
    table: {columns},
    options,
    correctIndex,
    conceptTitle: '정비례 관계의 표 성질',
    explanation: `$y$가 $x$에 정비례하면 $\\frac{y}{x} = a$로 항상 일정합니다. 첫 번째 열에서 $a = \\frac{${a * xVals[0]}}{${xVals[0]}} = ${a}$이므로, $x = ${xVals[missingPos]}$일 때 $y = ${a} \\times (${xVals[missingPos]}) = ${missingY}$입니다.`,
    correctSummary: `비례상수가 $${a}$이므로 ?에 알맞은 수는 $${missingY}$입니다.`,
  };
}

function genDirectWordProblem(idx: number): QuizQuestion {
  const variant = pickRandom(['water', 'distance', 'notebook']);

  if (variant === 'water') {
    const rate = pickRandom([3, 4, 5, 6]);
    const time = pickRandom([7, 8, 9, 12]);
    const ans = rate * time;
    const dist = buildIntDistractors(ans, [
      rate + time,
      ans + rate,
      ans - rate,
      Math.round(time * 2),
    ]);
    const {options, correctIndex} = packOptions(
      `$${ans}$ L`,
      dist.map((n) => `$${n}$ L`),
    );
    return {
      id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      archetype: 'direct_word_problem',
      topic: 'direct',
      topicLabel: '정비례',
      subLabel: '실생활 활용',
      prompt: `빈 물통에 $1$분마다 $${rate}$ L씩 일정하게 물을 채울 때, $x$분 동안 채운 물의 양을 $y$ L라고 하자. $${time}$분 동안 채운 물의 양은?`,
      options,
      correctIndex,
      conceptTitle: '실생활에서의 정비례 관계',
      explanation: `시간이 $2$배, $3$배가 되면 물의 양도 $2$배, $3$배가 되므로 정비례 관계 $y = ${rate}x$입니다. $x = ${time}$을 대입하면 $y = ${rate} \\times ${time} = ${ans}$ L입니다.`,
      correctSummary: `관계식 $y = ${rate}x$에 $x = ${time}$을 대입하면 $${ans}$ L입니다.`,
    };
  }

  if (variant === 'distance') {
    const speed = pickRandom([4, 5, 6, 8]);
    const hours = pickRandom([3, 4, 5, 6]);
    const distKm = speed * hours;
    const correct = `$y = ${speed}x$`;
    const distractors = [
      `$y = \\frac{${speed}}{x}$`,
      `$y = x + ${speed}$`,
      `$y = \\frac{${distKm}}{x}$`,
    ];
    const {options, correctIndex} = packOptions(correct, distractors);
    return {
      id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      archetype: 'direct_word_problem',
      topic: 'direct',
      topicLabel: '정비례',
      subLabel: '실생활 활용',
      prompt: `시속 $${speed}$ km의 일정한 속력으로 $x$시간 동안 걸은 거리를 $y$ km라고 할 때, $x$와 $y$ 사이의 관계식은? (참고: $1$시간 걸으면 $${speed}$ km, $${hours}$시간 걸으면 $${distKm}$ km 이동한다.)`,
      options,
      correctIndex,
      conceptTitle: '거리 = 속력 × 시간과 정비례',
      explanation: `속력이 시속 $${speed}$ km로 일정할 때, (거리) = (속력) × (시간)이므로 $y = ${speed}x$인 정비례 관계가 됩니다.`,
      correctSummary: `(거리) = (속력) × (시간)이므로 ${correct}입니다.`,
    };
  }

  const price = pickRandom([600, 700, 800, 900]);
  const count = pickRandom([4, 5, 6, 7]);
  const total = price * count;
  const dist = buildIntDistractors(total, [
    price + count,
    price * (count + 1),
    price * (count - 1),
    total + 500,
  ]);
  const {options, correctIndex} = packOptions(
    `${total.toLocaleString('ko-KR')}원`,
    dist.map((n) => `${n.toLocaleString('ko-KR')}원`),
  );
  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'direct_word_problem',
    topic: 'direct',
    topicLabel: '정비례',
    subLabel: '실생활 활용',
    prompt: `한 권에 ${price}원인 공책 $x$권의 가격을 $y$원이라고 할 때, 공책 $${count}$권의 가격은 얼마인가?`,
    options,
    correctIndex,
    conceptTitle: '일정한 단가와 정비례',
    explanation: `공책의 수가 $2$배, $3$배가 되면 가격도 $2$배, $3$배가 되므로 정비례 관계 $y = ${price}x$입니다. $x = ${count}$를 대입하면 $y = ${price} \\times ${count} = ${total}$원입니다.`,
    correctSummary: `$y = ${price}x$에서 $x = ${count}$이면 ${total.toLocaleString('ko-KR')}원입니다.`,
  };
}

// ============================================================================
// Inverse Proportion (반비례) Archetypes
// ============================================================================

function genInverseIdentifyEq(idx: number): QuizQuestion {
  const askNotInverse = Math.random() < 0.45;
  const inversePool = [
    '$y = \\frac{6}{x}$',
    '$y = -\\frac{8}{x}$',
    '$y = \\frac{12}{x}$',
    '$y = -\\frac{5}{x}$',
    '$xy = 10$',
    '$xy = -9$',
  ];
  const nonInversePool = [
    '$y = \\frac{x}{4}$',
    '$y = -\\frac{x}{3}$',
    '$y = 5x$',
    '$y = -2x$',
    '$y = x + 6$',
    '$y = 12 - x$',
    '$y = \\frac{1}{2}x$',
  ];

  if (!askNotInverse) {
    const correct = pickRandom(inversePool);
    const distractors = shuffle(nonInversePool).slice(0, 3);
    const {options, correctIndex} = packOptions(correct, distractors);
    return {
      id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      archetype: 'inverse_identify_eq',
      topic: 'inverse',
      topicLabel: '반비례',
      subLabel: '관계식 판별',
      prompt: '다음 중 $y$가 $x$에 반비례하는 식은?',
      options,
      correctIndex,
      conceptTitle: '반비례 관계식의 형태',
      explanation:
        '$y$가 $x$에 반비례하면 $y = \\frac{a}{x}$ 또는 $xy = a$ ($a \\neq 0$) 꼴로 나타납니다. 특히 $y = \\frac{x}{4}$처럼 분모가 수이고 분자에 $x$가 있는 식은 $y = \\frac{1}{4}x$이므로 정비례임에 주의하세요!',
      correctSummary: `${correct}은 $y = \\frac{a}{x}$ ($xy = a$) 꼴이므로 반비례합니다.`,
    };
  }

  const correct = pickRandom(nonInversePool);
  const distractors = shuffle(inversePool).slice(0, 3);
  const {options, correctIndex} = packOptions(correct, distractors);
  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'inverse_identify_eq',
    topic: 'inverse',
    topicLabel: '반비례',
    subLabel: '관계식 판별',
    prompt: '다음 중 $y$가 $x$에 반비례하지 않는 식은?',
    options,
    correctIndex,
    conceptTitle: '분모에 $x$가 있는지 확인하기',
    explanation:
      '반비례는 분모에 $x$가 있는 $y = \\frac{a}{x}$ ($xy = a$, $a \\neq 0$) 꼴입니다. $y = \\frac{x}{4}$나 $y = 5x$는 정비례이고, $y = x + 6$이나 $y = 12 - x$는 합 또는 차가 일정할 뿐 반비례가 아닙니다.',
    correctSummary: `${correct}은 $y = \\frac{a}{x}$ 꼴이 아니므로 반비례하지 않습니다.`,
  };
}

function genInverseFindY(idx: number): QuizQuestion {
  const configs: Array<{a: number; divisors: number[]}> = [
    {a: 12, divisors: [-6, -4, -3, -2, 2, 3, 4, 6]},
    {a: -12, divisors: [-6, -4, -3, -2, 2, 3, 4, 6]},
    {a: 18, divisors: [-9, -6, -3, -2, 2, 3, 6, 9]},
    {a: -18, divisors: [-9, -6, -3, -2, 2, 3, 6, 9]},
    {a: 24, divisors: [-8, -6, -4, -3, 3, 4, 6, 8]},
    {a: -24, divisors: [-8, -6, -4, -3, 3, 4, 6, 8]},
    {a: 20, divisors: [-10, -5, -4, -2, 2, 4, 5, 10]},
  ];
  const cfg = pickRandom(configs);
  const x1 = pickRandom(cfg.divisors);
  const x2 = pickRandom(cfg.divisors.filter((d) => d !== x1 && d !== -x1));
  const y1 = cfg.a / x1;
  const y2 = cfg.a / x2;

  const candidates = [
    -y2,
    cfg.a,
    x1 + y1 - x2,
    y2 + 2,
    Math.round((y1 * x2) / x1) || y2 - 2,
  ];
  const distNums = buildIntDistractors(y2, candidates);
  const {options, correctIndex} = packOptions(
    `$${y2}$`,
    distNums.map((n) => `$${n}$`),
  );

  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'inverse_find_y',
    topic: 'inverse',
    topicLabel: '반비례',
    subLabel: '함숫값 구하기',
    prompt: `$y$가 $x$에 반비례하고, $x = ${x1}$일 때 $y = ${y1}$이다. $x = ${x2}$일 때 $y$의 값은?`,
    options,
    correctIndex,
    conceptTitle: '반비례에서 곱 $x \\times y = a$ 활용하기',
    explanation: `반비례 관계 $y = \\frac{a}{x}$에서는 $x \\times y = a$가 항상 일정합니다. 먼저 $a = ${x1} \\times (${y1}) = ${cfg.a}$이므로 ${formatInverseEq(cfg.a)}에 $x = ${x2}$를 대입하면 $y = ${y2}$입니다.`,
    correctSummary: `$a = ${cfg.a}$이므로 $x = ${x2}$일 때 $y = ${y2}$입니다.`,
  };
}

function genInverseFindEqFromPoint(idx: number): QuizQuestion {
  const configs: Array<{a: number; px: number; py: number}> = [
    {a: 6, px: 2, py: 3},
    {a: 8, px: 4, py: 2},
    {a: 12, px: 3, py: 4},
    {a: -6, px: -2, py: 3},
    {a: -8, px: 2, py: -4},
    {a: -12, px: -4, py: 3},
    {a: 10, px: -2, py: -5},
  ];
  const cfg = pickRandom(configs);
  const correct = formatInverseEq(cfg.a);

  const negA = formatInverseEq(-cfg.a);
  const directSlope = makeFrac(cfg.py, cfg.px);
  const directConfuse1 = formatDirectEq(directSlope);
  const directConfuse2 = formatDirectEq(makeFrac(cfg.a, 1));
  const halfA = formatInverseEq(cfg.a > 0 ? cfg.a + 2 : cfg.a - 2);

  const {options, correctIndex} = packOptions(correct, [
    negA,
    directConfuse1,
    directConfuse2,
    halfA,
  ]);

  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'inverse_find_eq_from_point',
    topic: 'inverse',
    topicLabel: '반비례',
    subLabel: '그래프로 식 찾기',
    prompt: `아래 그래프는 점 $(${cfg.px}, ${cfg.py})$를 지나는 한 쌍의 매끄러운 곡선이다. 이 그래프가 나타내는 $x$와 $y$ 사이의 관계식은?`,
    graph: {
      kind: 'inverse',
      a: cfg.a,
      point: {x: cfg.px, y: cfg.py},
      range: 6,
    },
    options,
    correctIndex,
    conceptTitle: '쌍곡선 그래프와 반비례 식',
    explanation: `원점을 지나지 않는 한 쌍의 매끄러운 곡선은 반비례 관계 $y = \\frac{a}{x}$의 그래프입니다. 점 $(${cfg.px}, ${cfg.py})$를 지나므로 $a = x \\times y = ${cfg.px} \\times (${cfg.py}) = ${cfg.a}$입니다.`,
    correctSummary: `$a = ${cfg.px} \\times (${cfg.py}) = ${cfg.a}$이므로 ${correct}입니다.`,
  };
}

function genInverseQuadrantProperty(idx: number): QuizQuestion {
  const a = pickRandom([-12, -8, -6, -4, 4, 6, 8, 12]);
  const isPos = a > 0;
  const eq = formatInverseEq(a);

  if (Math.random() < 0.5) {
    const correct = isPos ? '제1사분면, 제3사분면' : '제2사분면, 제4사분면';
    const distractors = [
      isPos ? '제2사분면, 제4사분면' : '제1사분면, 제3사분면',
      '제1사분면, 제2사분면',
      '제3사분면, 제4사분면',
    ];
    const {options, correctIndex} = packOptions(correct, distractors);
    return {
      id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      archetype: 'inverse_quadrant_property',
      topic: 'inverse',
      topicLabel: '반비례',
      subLabel: '그래프의 성질',
      prompt: `반비례 관계 ${eq}의 그래프가 지나는 사분면을 모두 고르면?`,
      options,
      correctIndex,
      conceptTitle: '반비례 그래프가 지나는 사분면',
      explanation: `반비례 관계 $y = \\frac{a}{x}$에서 $a > 0$이면 $x$와 $y$의 부호가 같으므로 제1·3사분면을 지나고, $a < 0$이면 부호가 다르므로 제2·4사분면을 지납니다.`,
      correctSummary: `$a = ${a} ${isPos ? '> 0' : '< 0'}$이므로 ${correct}을 지납니다.`,
    };
  }

  const correct = isPos
    ? '각 사분면에서 $x$의 값이 증가하면 $y$의 값은 감소한다.'
    : '각 사분면에서 $x$의 값이 증가하면 $y$의 값도 증가한다.';
  const distractors = [
    isPos
      ? '각 사분면에서 $x$의 값이 증가하면 $y$의 값도 증가한다.'
      : '각 사분면에서 $x$의 값이 증가하면 $y$의 값은 감소한다.',
    '원점 $(0, 0)$을 지나는 직선이다.',
    '좌표축($x$축, $y$축)과 한 점에서 만난다.',
  ];
  const {options, correctIndex} = packOptions(correct, distractors);
  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'inverse_quadrant_property',
    topic: 'inverse',
    topicLabel: '반비례',
    subLabel: '그래프의 성질',
    prompt: `반비례 관계 ${eq}의 그래프에 대한 설명으로 옳은 것은?`,
    options,
    correctIndex,
    conceptTitle: '반비례 그래프의 특징',
    explanation: `반비례 그래프는 원점을 지나지 않고 좌표축에 점점 가까워지지만 만나지 않는 한 쌍의 곡선입니다. $a > 0$이면 각 사분면에서 $x$가 증가할 때 $y$는 감소하고, $a < 0$이면 $x$가 증가할 때 $y$도 증가합니다.`,
    correctSummary: `${eq}에서 $a ${isPos ? '> 0' : '< 0'}$이므로 ${correct}`,
  };
}

function genInversePointOnGraph(idx: number): QuizQuestion {
  const configs: Array<{a: number; pairs: Array<[number, number]>}> = [
    {
      a: 12,
      pairs: [
        [2, 6],
        [3, 4],
        [-2, -6],
        [-3, -4],
      ],
    },
    {
      a: -12,
      pairs: [
        [2, -6],
        [-3, 4],
        [4, -3],
        [-6, 2],
      ],
    },
    {
      a: 18,
      pairs: [
        [2, 9],
        [3, 6],
        [-3, -6],
        [-2, -9],
      ],
    },
    {
      a: -24,
      pairs: [
        [3, -8],
        [-4, 6],
        [6, -4],
        [-8, 3],
      ],
    },
  ];
  const cfg = pickRandom(configs);
  const [px, py] = pickRandom(cfg.pairs);

  const isOnGraph = (x: number, y: number) => x !== 0 && x * y === cfg.a;
  const rawDistractors: Array<[number, number]> = [
    [px, -py],
    [px, cfg.a - px],
    [-px, py],
    [px + 1, py],
    [0, cfg.a],
  ];
  const validDistractors: string[] = [];
  for (const [dx, dy] of rawDistractors) {
    if (!isOnGraph(dx, dy)) {
      const label = `$(${dx}, ${dy})$`;
      if (!validDistractors.includes(label)) {
        validDistractors.push(label);
      }
    }
  }

  const correct = `$(${px}, ${py})$`;
  const {options, correctIndex} = packOptions(correct, validDistractors);
  const eq = formatInverseEq(cfg.a);

  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'inverse_point_on_graph',
    topic: 'inverse',
    topicLabel: '반비례',
    subLabel: '그래프 위의 점',
    prompt: `반비례 관계 ${eq}의 그래프 위에 있는 점은?`,
    options,
    correctIndex,
    conceptTitle: '반비례 그래프 위의 점 판별하기',
    explanation: `점 $(p, q)$가 반비례 그래프 $y = \\frac{${cfg.a}}{x}$ 위에 있으려면 두 수의 곱 $p \\times q$가 $${cfg.a}$와 같아야 합니다. $${px} \\times (${py}) = ${cfg.a}$이므로 ${correct}가 그래프 위에 있습니다.`,
    correctSummary: `$${px} \\times (${py}) = ${cfg.a}$이므로 ${correct}가 그래프 위에 있습니다.`,
  };
}

function genInverseTableFill(idx: number): QuizQuestion {
  const configs = [
    {a: 12, xs: [1, 2, 3, 4]},
    {a: 24, xs: [2, 3, 4, 6]},
    {a: -12, xs: [1, 2, 3, 4]},
    {a: -18, xs: [2, 3, 6, 9]},
    {a: 18, xs: [1, 2, 3, 6]},
  ];
  const cfg = pickRandom(configs);
  const missingPos = pickRandom([1, 2, 3]);
  const missingY = cfg.a / cfg.xs[missingPos];

  const columns = cfg.xs.map((xv, i) => ({
    x: `${xv}`,
    y: i === missingPos ? '?' : `${cfg.a / xv}`,
    missing: i === missingPos ? ('y' as const) : undefined,
  }));

  const distNums = buildIntDistractors(missingY, [
    -missingY,
    cfg.a,
    missingY + 2,
    (cfg.a / cfg.xs[0]) - cfg.xs[missingPos],
  ]);
  const {options, correctIndex} = packOptions(
    `$${missingY}$`,
    distNums.map((n) => `$${n}$`),
  );

  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'inverse_table_fill',
    topic: 'inverse',
    topicLabel: '반비례',
    subLabel: '표 해석하기',
    prompt: '다음 표는 $y$가 $x$에 반비례할 때 $x$와 $y$의 값을 나타낸 것이다. 표의 ?에 알맞은 수는?',
    table: {columns},
    options,
    correctIndex,
    conceptTitle: '반비례 관계의 표 성질',
    explanation: `$y$가 $x$에 반비례하면 모든 열에서 곱 $x \\times y$의 값이 일정합니다. 첫 번째 열에서 $a = ${cfg.xs[0]} \\times (${cfg.a / cfg.xs[0]}) = ${cfg.a}$이므로, $x = ${cfg.xs[missingPos]}$일 때 $y = \\frac{${cfg.a}}{${cfg.xs[missingPos]}} = ${missingY}$입니다.`,
    correctSummary: `곱 $x \\times y = ${cfg.a}$가 일정하므로 ?는 $${missingY}$입니다.`,
  };
}

function genInverseWordProblem(idx: number): QuizQuestion {
  const variant = pickRandom(['rectangle', 'speed', 'share']);

  if (variant === 'rectangle') {
    const configs = [
      {area: 24, x: 4},
      {area: 36, x: 9},
      {area: 30, x: 5},
      {area: 40, x: 8},
    ];
    const cfg = pickRandom(configs);
    const ans = cfg.area / cfg.x;
    const dist = buildIntDistractors(ans, [
      cfg.area - cfg.x,
      cfg.area * cfg.x,
      ans + 2,
      ans - 1,
    ]);
    const {options, correctIndex} = packOptions(
      `$${ans}$ cm`,
      dist.map((n) => `$${n}$ cm`),
    );
    return {
      id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      archetype: 'inverse_word_problem',
      topic: 'inverse',
      topicLabel: '반비례',
      subLabel: '실생활 활용',
      prompt: `넓이가 $${cfg.area}$ cm$^2$인 직사각형의 가로 길이를 $x$ cm, 세로 길이를 $y$ cm라고 하자. 가로 길이가 $${cfg.x}$ cm일 때 세로 길이는?`,
      options,
      correctIndex,
      conceptTitle: '넓이가 일정한 직사각형과 반비례',
      explanation: `(직사각형의 넓이) = (가로) × (세로)이므로 $xy = ${cfg.area}$, 즉 $y = \\frac{${cfg.area}}{x}$인 반비례 관계입니다. $x = ${cfg.x}$를 대입하면 $y = \\frac{${cfg.area}}{${cfg.x}} = ${ans}$ cm입니다.`,
      correctSummary: `$xy = ${cfg.area}$이므로 가로가 $${cfg.x}$ cm일 때 세로는 $${ans}$ cm입니다.`,
    };
  }

  if (variant === 'speed') {
    const distance = pickRandom([12, 18, 24, 30]);
    const correct = `$y = \\frac{${distance}}{x}$`;
    const distractors = [
      `$y = ${distance}x$`,
      `$y = \\frac{x}{${distance}}$`,
      `$y = ${distance} - x$`,
    ];
    const {options, correctIndex} = packOptions(correct, distractors);
    return {
      id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      archetype: 'inverse_word_problem',
      topic: 'inverse',
      topicLabel: '반비례',
      subLabel: '실생활 활용',
      prompt: `거리가 $${distance}$ km인 등산로를 시속 $x$ km의 일정한 속력으로 걸어갈 때, 걸리는 시간을 $y$시간이라고 하자. $x$와 $y$ 사이의 관계식은?`,
      options,
      correctIndex,
      conceptTitle: '거리가 일정할 때 속력과 시간은 반비례',
      explanation: `(시간) = $\\frac{(\\text{거리})}{(\\text{속력})}$이므로 거리가 $${distance}$ km로 일정할 때 $y = \\frac{${distance}}{x}$인 반비례 관계입니다. 속력이 $2$배가 되면 걸리는 시간은 $\\frac{1}{2}$배가 됩니다.`,
      correctSummary: `(시간) = (거리) ÷ (속력)이므로 ${correct}입니다.`,
    };
  }

  const configs = [
    {total: 600, people: 4},
    {total: 800, people: 5},
    {total: 900, people: 6},
    {total: 1000, people: 4},
  ];
  const cfg = pickRandom(configs);
  const ans = cfg.total / cfg.people;
  const dist = buildIntDistractors(ans, [
    cfg.total - cfg.people * 100,
    ans + 50,
    ans - 50,
    cfg.total / 2,
  ]);
  const {options, correctIndex} = packOptions(
    `$${ans}$ mL`,
    dist.map((n) => `$${n}$ mL`),
  );
  return {
    id: `q-${idx}-${Math.random().toString(36).slice(2, 7)}`,
    archetype: 'inverse_word_problem',
    topic: 'inverse',
    topicLabel: '반비례',
    subLabel: '실생활 활용',
    prompt: `주스 $${cfg.total}$ mL를 $x$명의 학생에게 남김없이 똑같이 나누어 줄 때, 한 사람이 마시는 양을 $y$ mL라고 하자. $${cfg.people}$명에게 나누어 주면 한 사람이 마시는 양은?`,
    options,
    correctIndex,
    conceptTitle: '전체의 양이 일정한 나눔과 반비례',
    explanation: `(학생 수) × (한 사람이 마시는 양) = $${cfg.total}$ mL로 일정하므로 $xy = ${cfg.total}$, 즉 $y = \\frac{${cfg.total}}{x}$인 반비례 관계입니다. $x = ${cfg.people}$을 대입하면 $y = ${ans}$ mL입니다.`,
    correctSummary: `$${cfg.total} \\div ${cfg.people} = ${ans}$ mL입니다.`,
  };
}

// ============================================================================
// Validation & Balanced Quiz Generation
// ============================================================================

export function validateQuestion(q: QuizQuestion): boolean {
  if (q.options.length !== 4) return false;
  if (q.correctIndex < 0 || q.correctIndex > 3) return false;
  const uniqueOpts = new Set(q.options);
  if (uniqueOpts.size !== 4) return false;
  if (!q.prompt.trim() || !q.explanation.trim() || !q.conceptTitle.trim()) return false;

  if (q.graph) {
    if (q.graph.a === 0) return false;
    if (q.graph.point) {
      const {x, y} = q.graph.point;
      if (q.graph.kind === 'direct') {
        if (Math.abs(y - q.graph.a * x) > 1e-6) return false;
      } else {
        if (x === 0 || Math.abs(x * y - q.graph.a) > 1e-6) return false;
      }
    }
  }

  if (q.table) {
    if (q.table.columns.length < 3) return false;
    const known = q.table.columns.filter((c) => !c.missing);
    if (known.length < 2) return false;
    const pairs = known.map((c) => ({x: Number(c.x), y: Number(c.y)}));
    if (q.topic === 'direct') {
      const ratio = pairs[0].y / pairs[0].x;
      if (!Number.isFinite(ratio) || ratio === 0) return false;
      for (const p of pairs) {
        if (Math.abs(p.y / p.x - ratio) > 1e-6) return false;
      }
    } else {
      const prod = pairs[0].x * pairs[0].y;
      if (!Number.isFinite(prod) || prod === 0) return false;
      for (const p of pairs) {
        if (Math.abs(p.x * p.y - prod) > 1e-6) return false;
      }
    }
  }

  return true;
}

const DIRECT_GENERATORS = [
  genDirectIdentifyEq,
  genDirectFindY,
  genDirectFindEqFromPoint,
  genDirectQuadrantProperty,
  genDirectPointOnGraph,
  genDirectTableFill,
  genDirectWordProblem,
];

const INVERSE_GENERATORS = [
  genInverseIdentifyEq,
  genInverseFindY,
  genInverseFindEqFromPoint,
  genInverseQuadrantProperty,
  genInversePointOnGraph,
  genInverseTableFill,
  genInverseWordProblem,
];

function generateFromPool(
  generators: Array<(idx: number) => QuizQuestion>,
  targetCount: number,
  startIdx: number,
): QuizQuestion[] {
  const results: QuizQuestion[] = [];
  const seenPrompts = new Set<string>();
  const shuffledOrder = shuffle(generators);
  let cursor = 0;
  let attempts = 0;

  while (results.length < targetCount && attempts < 100) {
    attempts++;
    const gen = shuffledOrder[cursor % shuffledOrder.length];
    cursor++;
    try {
      const q = gen(startIdx + results.length + 1);
      if (validateQuestion(q) && !seenPrompts.has(q.prompt)) {
        seenPrompts.add(q.prompt);
        results.push(q);
      }
    } catch {
      // Retry with another randomized parameter set
    }
  }

  return results;
}

export function generateQuizSet(
  filter: TopicFilter = 'all',
  count = 10,
): QuizQuestion[] {
  let questions: QuizQuestion[] = [];

  if (filter === 'direct') {
    questions = generateFromPool(DIRECT_GENERATORS, count, 0);
  } else if (filter === 'inverse') {
    questions = generateFromPool(INVERSE_GENERATORS, count, 0);
  } else {
    const half = Math.floor(count / 2);
    const directPart = generateFromPool(DIRECT_GENERATORS, half, 0);
    const inversePart = generateFromPool(INVERSE_GENERATORS, count - half, half);
    questions = shuffle([...directPart, ...inversePart]);
  }

  return questions;
}
