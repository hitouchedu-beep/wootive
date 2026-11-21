import React from 'react';

interface MathTextProps {
  text: string;
  className?: string;
}

function renderMathTokens(expr: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < expr.length) {
    // Handle \frac{num}{den}
    if (expr.startsWith('\\frac{', i)) {
      const numStart = i + 6;
      const numEnd = expr.indexOf('}', numStart);
      if (numEnd !== -1 && expr[numEnd + 1] === '{') {
        const denStart = numEnd + 2;
        const denEnd = expr.indexOf('}', denStart);
        if (denEnd !== -1) {
          const num = expr.slice(numStart, numEnd);
          const den = expr.slice(denStart, denEnd);
          nodes.push(
            <span
              key={`${keyPrefix}-frac-${i}`}
              className="inline-flex flex-col items-center justify-center align-middle mx-0.5 leading-[1.05] text-[0.86em]"
            >
              <span className="px-1 pb-[2px] border-b border-current text-center">
                {renderMathTokens(num, `${keyPrefix}-num-${i}`)}
              </span>
              <span className="px-1 pt-[2px] text-center">
                {renderMathTokens(den, `${keyPrefix}-den-${i}`)}
              </span>
            </span>,
          );
          i = denEnd + 1;
          continue;
        }
      }
    }

    // Handle \text{...}
    if (expr.startsWith('\\text{', i)) {
      const start = i + 6;
      const end = expr.indexOf('}', start);
      if (end !== -1) {
        const inner = expr.slice(start, end);
        nodes.push(
          <span key={`${keyPrefix}-text-${i}`} className="font-sans not-italic">
            {inner}
          </span>,
        );
        i = end + 1;
        continue;
      }
    }

    // Handle \neq, \times, \div, \cdot, \square
    if (expr.startsWith('\\neq', i)) {
      nodes.push(
        <span key={`${keyPrefix}-neq-${i}`} className="mx-1 font-normal">
          ≠
        </span>,
      );
      i += 4;
      continue;
    }
    if (expr.startsWith('\\times', i)) {
      nodes.push(
        <span key={`${keyPrefix}-times-${i}`} className="mx-0.5 font-normal">
          ×
        </span>,
      );
      i += 6;
      continue;
    }
    if (expr.startsWith('\\div', i)) {
      nodes.push(
        <span key={`${keyPrefix}-div-${i}`} className="mx-0.5 font-normal">
          ÷
        </span>,
      );
      i += 4;
      continue;
    }
    if (expr.startsWith('\\cdot', i)) {
      nodes.push(
        <span key={`${keyPrefix}-cdot-${i}`} className="mx-0.5 font-normal">
          ·
        </span>,
      );
      i += 5;
      continue;
    }
    if (expr.startsWith('\\square', i)) {
      nodes.push(
        <span
          key={`${keyPrefix}-sq-${i}`}
          className="inline-block w-[1.1em] h-[1.1em] align-middle border-[1.5px] border-current rounded-[2px] mx-0.5"
          aria-label="빈칸"
        />,
      );
      i += 7;
      continue;
    }

    // Handle ^2 or ^{...}
    if (expr[i] === '^') {
      if (expr[i + 1] === '{') {
        const end = expr.indexOf('}', i + 2);
        if (end !== -1) {
          const sup = expr.slice(i + 2, end);
          nodes.push(
            <sup key={`${keyPrefix}-sup-${i}`} className="text-[0.72em] ml-[1px]">
              {sup}
            </sup>,
          );
          i = end + 1;
          continue;
        }
      } else if (i + 1 < expr.length) {
        const sup = expr[i + 1];
        nodes.push(
          <sup key={`${keyPrefix}-sup-${i}`} className="text-[0.72em] ml-[1px]">
            {sup}
          </sup>,
        );
        i += 2;
        continue;
      }
    }

    const ch = expr[i];

    // Italicize single Latin variable letters (x, y, a, b, k, p, q)
    if (/[a-zA-Z]/.test(ch)) {
      nodes.push(
        <span
          key={`${keyPrefix}-var-${i}`}
          className="math-serif italic font-semibold px-[0.5px]"
        >
          {ch}
        </span>,
      );
      i += 1;
      continue;
    }

    // Operators with gentle spacing
    if (ch === '=' || ch === '<' || ch === '>') {
      nodes.push(
        <span key={`${keyPrefix}-op-${i}`} className="mx-1 font-normal">
          {ch}
        </span>,
      );
      i += 1;
      continue;
    }

    if (ch === '+') {
      nodes.push(
        <span key={`${keyPrefix}-plus-${i}`} className="mx-1 font-normal">
          +
        </span>,
      );
      i += 1;
      continue;
    }

    if (ch === '-') {
      // Distinguish unary minus (start, after =, (, ,, space) vs binary minus
      const prev = i > 0 ? expr[i - 1] : '';
      const isUnary =
        i === 0 || prev === '=' || prev === '(' || prev === ',' || prev === ' ' || prev === '<' || prev === '>';
      nodes.push(
        <span
          key={`${keyPrefix}-minus-${i}`}
          className={isUnary ? 'mr-[1px] font-normal' : 'mx-1 font-normal'}
        >
          −
        </span>,
      );
      i += 1;
      continue;
    }

    if (ch === ' ') {
      i += 1;
      continue;
    }

    // Numbers, parentheses, commas, etc.
    nodes.push(
      <span key={`${keyPrefix}-ch-${i}`} className="tabular-nums">
        {ch}
      </span>,
    );
    i += 1;
  }

  return nodes;
}

export const MathText: React.FC<MathTextProps> = ({text, className = ''}) => {
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <span className={className}>
      {parts.map((part, idx) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
          const inner = part.slice(1, -1);
          return (
            <span
              key={`math-${idx}`}
              className="inline-flex items-center whitespace-nowrap align-baseline"
            >
              {renderMathTokens(inner, `m-${idx}`)}
            </span>
          );
        }
        return <React.Fragment key={`txt-${idx}`}>{part}</React.Fragment>;
      })}
    </span>
  );
};
