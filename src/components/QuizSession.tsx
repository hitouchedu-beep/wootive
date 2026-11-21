import React, {useEffect} from 'react';
import {ArrowRight, BookOpen, CheckCircle2, XCircle} from 'lucide-react';
import type {QuizQuestion} from '../data/mathQuizEngine';
import {CoordinateGraph} from './CoordinateGraph';
import {MathText} from './MathText';

const CHOICE_NUMBERS = ['①', '②', '③', '④'] as const;

interface QuizSessionProps {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Array<number | null>;
  onSelectAnswer: (choiceIndex: number) => void;
  onNext: () => void;
}

export const QuizSession: React.FC<QuizSessionProps> = ({
  questions,
  currentIndex,
  answers,
  onSelectAnswer,
  onNext,
}) => {
  const question = questions[currentIndex];
  const selectedIndex = answers[currentIndex];
  const isAnswered = selectedIndex !== null;
  const isCorrect = isAnswered && selectedIndex === question.correctIndex;
  const isLast = currentIndex === questions.length - 1;
  const completedCount = answers.filter((a) => a !== null).length;
  const progressPercent = Math.round((completedCount / questions.length) * 100);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAnswered) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          onSelectAnswer(Number(e.key) - 1);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, onSelectAnswer, onNext]);

  return (
    <div className="max-w-3xl w-full mx-auto space-y-6">
      {/* Visual Question Number & Progress Tracker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-3.5 shadow-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-lg sm:text-xl font-extrabold text-blue-700 font-mono-num">
              문제 {currentIndex + 1}
              <span className="text-slate-400 font-semibold"> / {questions.length}</span>
            </span>
            <span aria-hidden="true" className="text-slate-300">
              ·
            </span>
            <span className="text-sm sm:text-base font-semibold text-slate-700">
              {question.topicLabel} · {question.subLabel}
            </span>
          </div>

          <span className="text-sm sm:text-base font-bold text-blue-700 font-mono-num shrink-0">
            {progressPercent}%
          </span>
        </div>

        {/* 10-Step Visual Numbered Progress Bar */}
        <div
          className="grid grid-cols-10 gap-1.5 sm:gap-2"
          aria-label={`총 ${questions.length}문제 중 ${currentIndex + 1}번 문제`}
        >
          {questions.map((q, idx) => {
            const ans = answers[idx];
            const isCurrent = idx === currentIndex;
            const answeredRight = ans !== null && ans === q.correctIndex;
            const answeredWrong = ans !== null && ans !== q.correctIndex;

            let stepClass = 'bg-slate-100 text-slate-400 border-slate-200';
            if (isCurrent && ans === null) {
              stepClass =
                'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200 font-bold';
            } else if (answeredRight) {
              stepClass = isCurrent
                ? 'bg-green-600 text-white border-green-600 ring-2 ring-green-200 font-bold'
                : 'bg-green-500 text-white border-green-500 font-semibold';
            } else if (answeredWrong) {
              stepClass = isCurrent
                ? 'bg-red-600 text-white border-red-600 ring-2 ring-red-200 font-bold'
                : 'bg-red-500 text-white border-red-500 font-semibold';
            }

            return (
              <div
                key={q.id}
                className={`h-7 sm:h-8 rounded-lg border flex items-center justify-center text-xs sm:text-sm font-mono-num transition-colors ${stepClass}`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>

        {/* Continuous Progress Bar */}
        <div
          className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={questions.length}
        >
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
            style={{width: `${Math.max(4, progressPercent)}%`}}
          />
        </div>
      </div>

      {/* Centered, High-Focus Main Question Card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-7">
        {/* Large Centered Problem Prompt */}
        <div className="py-2 sm:py-4 text-center space-y-3">
          <div className="text-sm font-bold text-blue-700 font-mono-num">
            Q{currentIndex + 1}. {question.topicLabel}
          </div>
          <h2 className="text-2xl sm:text-[28px] md:text-[30px] font-bold text-slate-900 leading-[1.48] text-balance max-w-2xl mx-auto">
            <MathText text={question.prompt} />
          </h2>
        </div>

        {/* Optional Coordinate Graph */}
        {question.graph && (
          <div className="py-1 flex justify-center">
            <CoordinateGraph spec={question.graph} size={280} />
          </div>
        )}

        {/* Optional Data Table */}
        {question.table && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 max-w-md mx-auto">
            <table className="w-full text-center border-collapse">
              <tbody>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3.5 px-4 text-base font-semibold text-slate-700 border-r border-slate-200 w-20">
                    <MathText text="$x$" />
                  </th>
                  {question.table.columns.map((col, i) => (
                    <td
                      key={`col-x-${i}`}
                      className="py-3.5 px-4 font-mono-num text-lg sm:text-xl font-medium text-slate-800 border-r last:border-r-0 border-slate-200"
                    >
                      {col.x}
                    </td>
                  ))}
                </tr>
                <tr className="bg-white">
                  <th className="py-3.5 px-4 text-base font-semibold text-blue-700 border-r border-slate-200">
                    <MathText text="$y$" />
                  </th>
                  {question.table.columns.map((col, i) => (
                    <td
                      key={`col-y-${i}`}
                      className={`py-3.5 px-4 font-mono-num text-lg sm:text-xl border-r last:border-r-0 border-slate-200 ${
                        col.missing === 'y'
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-900 font-medium'
                      }`}
                    >
                      {col.y}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 4 Large, Mobile-Friendly Choice Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {question.options.map((opt, idx) => {
            const isSelected = selectedIndex === idx;
            const isRightOption = idx === question.correctIndex;

            let buttonStyle =
              'bg-white border-slate-200 text-slate-900 hover:border-blue-500 hover:bg-blue-50/60';
            let indexStyle = 'text-blue-700';

            if (isAnswered) {
              if (isRightOption) {
                buttonStyle =
                  'bg-green-50 border-green-600 text-green-950 ring-2 ring-green-500/25';
                indexStyle = 'text-green-700';
              } else if (isSelected && !isRightOption) {
                buttonStyle =
                  'bg-red-50 border-red-600 text-red-950 ring-2 ring-red-500/25';
                indexStyle = 'text-red-700';
              } else {
                buttonStyle = 'bg-slate-50/70 border-slate-200 text-slate-400';
                indexStyle = 'text-slate-400';
              }
            }

            return (
              <button
                key={`opt-${idx}`}
                type="button"
                disabled={isAnswered}
                onClick={() => onSelectAnswer(idx)}
                className={`group flex items-center justify-between gap-3 w-full min-h-[70px] sm:min-h-[78px] px-5 py-4.5 sm:px-6 sm:py-5 rounded-xl border-2 text-left text-lg sm:text-xl font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${buttonStyle} ${
                  isAnswered ? 'cursor-default' : 'cursor-pointer active:scale-[0.98]'
                }`}
              >
                <span className="flex items-center gap-3.5 leading-snug">
                  <span className={`text-xl sm:text-2xl font-bold shrink-0 ${indexStyle}`}>
                    {CHOICE_NUMBERS[idx]}
                  </span>
                  <MathText text={opt} />
                </span>

                {isAnswered && isRightOption && (
                  <CheckCircle2
                    className="w-7 h-7 text-green-600 shrink-0"
                    aria-label="정답"
                  />
                )}
                {isAnswered && isSelected && !isRightOption && (
                  <XCircle
                    className="w-7 h-7 text-red-600 shrink-0"
                    aria-label="선택한 오답"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Green / Red Result Feedback & Concept Explanation */}
        {isAnswered && (
          <div
            className={`rounded-xl border-2 p-5 sm:p-6 space-y-4 transition-opacity duration-200 ${
              isCorrect
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-2.5">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-7 h-7 text-green-600 shrink-0" />
                  <span className="text-lg sm:text-xl font-extrabold text-green-800">
                    정답입니다!
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-7 h-7 text-red-600 shrink-0" />
                  <span className="text-lg sm:text-xl font-extrabold text-red-800">
                    오답입니다 · 정답은 {CHOICE_NUMBERS[question.correctIndex]}번입니다
                  </span>
                </>
              )}
            </div>

            {isCorrect ? (
              <p className="text-base sm:text-[17px] text-green-900 leading-relaxed font-medium">
                <MathText text={question.correctSummary} />
              </p>
            ) : (
              <div className="bg-white rounded-xl border border-red-200 p-4 sm:p-5 space-y-2">
                <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-blue-700">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                  <span>
                    관련 개념: <MathText text={question.conceptTitle} />
                  </span>
                </div>
                <p className="text-base sm:text-[17px] text-slate-800 leading-relaxed">
                  <MathText text={question.explanation} />
                </p>
              </div>
            )}

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={onNext}
                className="w-full sm:w-auto min-h-[56px] inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                {isLast ? '최종 결과 보기' : '다음 문제'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
