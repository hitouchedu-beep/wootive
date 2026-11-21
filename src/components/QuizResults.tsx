import React, {useState} from 'react';
import {BookOpen, CheckCircle2, RotateCcw, XCircle} from 'lucide-react';
import type {QuizQuestion} from '../data/mathQuizEngine';
import {MathText} from './MathText';

const CHOICE_NUMBERS = ['①', '②', '③', '④'] as const;

interface QuizResultsProps {
  questions: QuizQuestion[];
  answers: Array<number | null>;
  onRetry: () => void;
  onOpenConcepts: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({
  questions,
  answers,
  onRetry,
  onOpenConcepts,
}) => {
  const [showFilter, setShowFilter] = useState<'wrong' | 'all'>('wrong');

  const totalCount = questions.length;
  const correctCount = questions.reduce(
    (acc, q, i) => (answers[i] === q.correctIndex ? acc + 1 : acc),
    0,
  );
  const accuracy = Math.round((correctCount / totalCount) * 100);

  const directItems = questions.filter((q) => q.topic === 'direct');
  const directCorrect = questions.reduce(
    (acc, q, i) =>
      q.topic === 'direct' && answers[i] === q.correctIndex ? acc + 1 : acc,
    0,
  );

  const inverseItems = questions.filter((q) => q.topic === 'inverse');
  const inverseCorrect = questions.reduce(
    (acc, q, i) =>
      q.topic === 'inverse' && answers[i] === q.correctIndex ? acc + 1 : acc,
    0,
  );

  const wrongItems = questions
    .map((q, idx) => ({q, idx, userAns: answers[idx]}))
    .filter((item) => item.userAns !== item.q.correctIndex);

  const displayedItems =
    showFilter === 'wrong' && wrongItems.length > 0
      ? wrongItems
      : questions.map((q, idx) => ({q, idx, userAns: answers[idx]}));

  const getEncouragement = () => {
    if (accuracy === 100) {
      return {
        title: '완벽합니다! 정비례와 반비례를 정확히 이해했어요.',
        desc: '10문제를 모두 맞혔습니다. 새로운 문제 세트로 실력을 다져 보세요.',
      };
    }
    if (accuracy >= 80) {
      return {
        title: '아주 잘했어요! 핵심 원리가 탄탄하네요.',
        desc: '틀린 문제의 개념 설명만 한 번 더 확인하면 완벽해집니다.',
      };
    }
    if (accuracy >= 50) {
      return {
        title: '좋은 출발이에요! 조금만 더 연습해 볼까요?',
        desc: '틀린 문제의 개념 설명을 읽고 다시 풀면 금방 익숙해집니다.',
      };
    }
    return {
      title: '괜찮아요! 개념을 확인하고 다시 도전해 보세요.',
      desc: '정비례(y = ax)와 반비례(y = a/x)의 차이를 살펴본 뒤 다시 풀어 봅시다.',
    };
  };

  const message = getEncouragement();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Main Score Summary Card */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs text-center space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-blue-700">10문제 연습 완료</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {message.title}
          </h2>
          <p className="text-base text-slate-600">{message.desc}</p>
        </div>

        {/* Big Accuracy Display */}
        <div className="py-6 px-4 rounded-2xl bg-blue-50/70 border border-blue-100 max-w-md mx-auto">
          <div className="text-sm font-semibold text-slate-600 mb-1">나의 정답률</div>
          <div className="text-5xl sm:text-6xl font-extrabold text-blue-700 font-mono-num tracking-tight">
            {accuracy}%
          </div>
          <div className="mt-2 text-lg font-semibold text-slate-800 font-mono-num">
            {totalCount}문제 중 {correctCount}문제 정답
          </div>
        </div>

        {/* Topic Breakdown */}
        {(directItems.length > 0 || inverseItems.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
            {directItems.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="text-sm font-medium text-slate-600">정비례 정답률</div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900 font-mono-num">
                    {Math.round((directCorrect / directItems.length) * 100)}%
                  </span>
                  <span className="text-sm text-slate-500 font-mono-num">
                    {directCorrect} / {directItems.length}
                  </span>
                </div>
              </div>
            )}
            {inverseItems.length > 0 && (
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
                <div className="text-sm font-medium text-slate-600">반비례 정답률</div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900 font-mono-num">
                    {Math.round((inverseCorrect / inverseItems.length) * 100)}%
                  </span>
                  <span className="text-sm text-slate-500 font-mono-num">
                    {inverseCorrect} / {inverseItems.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="w-full sm:w-auto min-h-[58px] inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <RotateCcw className="w-5 h-5" />
            다시 풀기
          </button>
          <button
            type="button"
            onClick={onOpenConcepts}
            className="w-full sm:w-auto min-h-[56px] inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-base font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-5 h-5 text-blue-600" />
            개념 정리 살펴보기
          </button>
        </div>
      </section>

      {/* Question-by-Question Review */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-xl font-bold text-slate-900">
            풀이 다시 보기
          </h3>

          {wrongItems.length > 0 && (
            <div className="inline-flex items-center p-1 bg-slate-200/70 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setShowFilter('wrong')}
                className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  showFilter === 'wrong'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                틀린 문제만 ({wrongItems.length})
              </button>
              <button
                type="button"
                onClick={() => setShowFilter('all')}
                className={`px-3.5 py-1.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  showFilter === 'all'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                전체 문제 ({totalCount})
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {displayedItems.map(({q, idx, userAns}) => {
            const right = userAns === q.correctIndex;
            return (
              <div
                key={q.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <span className="font-bold text-slate-900 font-mono-num">
                      문제 {idx + 1}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{q.topicLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>{q.subLabel}</span>
                  </div>

                  {right ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700 whitespace-nowrap">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      정답
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-700 whitespace-nowrap">
                      <XCircle className="w-4 h-4 text-red-600" />
                      오답
                    </span>
                  )}
                </div>

                <p className="text-lg font-semibold text-slate-900 leading-relaxed">
                  <MathText text={q.prompt} />
                </p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base">
                  <span className="text-slate-700">
                    정답:{' '}
                    <strong className="text-green-700">
                      {CHOICE_NUMBERS[q.correctIndex]}{' '}
                      <MathText text={q.options[q.correctIndex]} />
                    </strong>
                  </span>
                  {!right && userAns !== null && (
                    <span className="text-slate-600">
                      내가 고른 답:{' '}
                      <strong className="text-red-700">
                        {CHOICE_NUMBERS[userAns]}{' '}
                        <MathText text={q.options[userAns]} />
                      </strong>
                    </span>
                  )}
                </div>

                {!right && (
                  <div className="rounded-xl bg-blue-50/60 border border-blue-100 p-4 text-[15px] text-slate-800 leading-relaxed">
                    <span className="font-bold text-blue-800 mr-1.5">
                      개념 설명:
                    </span>
                    <MathText text={q.explanation} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
