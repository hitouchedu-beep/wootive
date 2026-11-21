/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {useState} from 'react';
import {ArrowRight, BookOpen, CheckCircle2, HelpCircle, RotateCcw} from 'lucide-react';
import {ConceptExplorer} from './components/ConceptExplorer';
import {CoordinateGraph} from './components/CoordinateGraph';
import {MathText} from './components/MathText';
import {QuizResults} from './components/QuizResults';
import {QuizSession} from './components/QuizSession';
import {
  generateQuizSet,
  type QuizQuestion,
  type TopicFilter,
} from './data/mathQuizEngine';

type AppView = 'home' | 'quiz' | 'results' | 'concepts';

const QUIZ_LENGTH = 10;

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [topicFilter, setTopicFilter] = useState<TopicFilter>('all');
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    generateQuizSet('all', QUIZ_LENGTH),
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Array<number | null>>(() =>
    Array(QUIZ_LENGTH).fill(null),
  );

  const startNewQuiz = (overrideFilter?: TopicFilter) => {
    const activeFilter = overrideFilter ?? topicFilter;
    if (overrideFilter) {
      setTopicFilter(overrideFilter);
    }
    const nextQuestions = generateQuizSet(activeFilter, QUIZ_LENGTH);
    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setAnswers(Array(nextQuestions.length).fill(null));
    setView('quiz');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const handleSelectAnswer = (choiceIndex: number) => {
    setAnswers((prev) => {
      if (prev[currentIndex] !== null) return prev;
      const next = [...prev];
      next[currentIndex] = choiceIndex;
      return next;
    });
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({top: 0, behavior: 'smooth'});
    } else {
      setView('results');
      window.scrollTo({top: 0, behavior: 'smooth'});
    }
  };

  const openConcepts = () => {
    setView('concepts');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  const openHome = () => {
    setView('home');
    window.scrollTo({top: 0, behavior: 'smooth'});
  };

  return (
    <div className="min-h-screen flex flex-col bg-math-grid text-slate-900">
      {/* 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={openHome}
            className="text-lg sm:text-xl font-extrabold tracking-tight text-blue-700 hover:text-blue-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            수학 생각연습
          </button>

          {/* Zone 2: Clean Text Nav Links */}
          <nav
            className="flex items-center gap-5 sm:gap-7 text-sm sm:text-base font-semibold"
            aria-label="주요 메뉴"
          >
            <button
              type="button"
              onClick={openHome}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'home' || view === 'quiz' || view === 'results'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              퀴즈 연습
            </button>
            <button
              type="button"
              onClick={openConcepts}
              className={`py-1 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                view === 'concepts'
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              개념 정리
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="shrink-0">
            {view === 'quiz' || view === 'results' ? (
              <button
                type="button"
                onClick={() => startNewQuiz()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                다시 풀기
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startNewQuiz()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                연습 시작
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 ${
          view === 'quiz' ? 'flex flex-col justify-center' : ''
        }`}
      >
        {view === 'home' && (
          <div className="space-y-10">
            {/* Hero Split Section */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
                {/* Left Column: Intro, Topic Selection & Primary CTA */}
                <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-blue-700">
                      중학교 1학년 수학 · 좌표평면과 그래프
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug text-balance">
                      정비례와 반비례,
                      <br />
                      10문제로 원리를 탄탄하게
                    </h1>
                    <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
                      관계식 판별부터 그래프 해석, 실생활 활용까지 중1 교과 과정에 맞춘
                      객관식 10문제를 무작위로 풀어 보세요. 틀린 문제는 바로 개념을 설명해
                      줍니다.
                    </p>
                  </div>

                  {/* Topic Filter Segmented Control */}
                  <div className="space-y-2.5">
                    <span className="block text-sm font-semibold text-slate-700">
                      출제 범위 선택
                    </span>
                    <div
                      className="flex flex-wrap sm:inline-flex sm:flex-nowrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl"
                      role="group"
                      aria-label="출제 범위 선택"
                    >
                      {(
                        [
                          {id: 'all', label: '전체 (정비례 + 반비례)'},
                          {id: 'direct', label: '정비례만'},
                          {id: 'inverse', label: '반비례만'},
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setTopicFilter(tab.id)}
                          className={`min-h-[46px] px-4 py-2.5 text-sm sm:text-base font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            topicFilter === tab.id
                              ? 'bg-white text-blue-700 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Primary CTA + Secondary Link */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3.5 pt-1">
                    <button
                      type="button"
                      onClick={() => startNewQuiz()}
                      className="w-full sm:w-auto min-h-[58px] inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-blue-600 text-white text-lg font-bold hover:bg-blue-700 active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      10문제 퀴즈 시작하기
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={openConcepts}
                      className="w-full sm:w-auto min-h-[56px] inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-base font-semibold hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      개념 먼저 보기
                    </button>
                  </div>

                  {/* Unboxed Metadata Highlights */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 pt-1">
                    <span>무작위 10문제 출제</span>
                    <span aria-hidden="true">·</span>
                    <span>오답 시 관련 개념 설명</span>
                    <span aria-hidden="true">·</span>
                    <span>최종 정답률 제공</span>
                  </div>
                </div>

                {/* Right Column: Visual Equation & Graph Preview */}
                <div className="lg:col-span-5 bg-blue-50/50 rounded-xl border border-blue-100 p-5 flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>한눈에 보는 대표 그래프</span>
                    <span className="text-blue-700">
                      <MathText text="$y = 2x$ · $y = \frac{6}{x}$" />
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center">
                      <CoordinateGraph
                        spec={{kind: 'direct', a: 2, point: {x: 2, y: 4}, range: 5}}
                        size={165}
                      />
                      <div className="mt-2.5 text-center">
                        <div className="text-sm font-bold text-slate-900">정비례</div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          <MathText text="$y = ax$ (직선)" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center">
                      <CoordinateGraph
                        spec={{kind: 'inverse', a: 6, point: {x: 2, y: 3}, range: 5}}
                        size={165}
                      />
                      <div className="mt-2.5 text-center">
                        <div className="text-sm font-bold text-slate-900">반비례</div>
                        <div className="text-xs text-slate-600 mt-0.5">
                          <MathText text="$y = \frac{a}{x}$ (쌍곡선)" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed text-center">
                    정비례는 원점을 지나는 직선, 반비례는 좌표축과 만나지 않는 한 쌍의
                    곡선입니다.
                  </p>
                </div>
              </div>
            </section>

            {/* 3-Step Learning Flow */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-base">
                  <HelpCircle className="w-5 h-5" />
                  <span>01. 무작위 10문제 풀이</span>
                </div>
                <p className="text-[15px] text-slate-600 leading-relaxed">
                  관계식 찾기, 함숫값 계산, 표와 그래프 해석, 실생활 문장제까지 매번 새로운
                  문제가 출제됩니다.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-base">
                  <BookOpen className="w-5 h-5" />
                  <span>02. 즉각적인 오답 개념 설명</span>
                </div>
                <p className="text-[15px] text-slate-600 leading-relaxed">
                  보기를 고르면 바로 정답 여부를 알려 주며, 오답일 때는 왜 틀렸는지 핵심
                  개념을 친절하게 짚어 줍니다.
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>03. 정답률 확인 및 다시 풀기</span>
                </div>
                <p className="text-[15px] text-slate-600 leading-relaxed">
                  10문제를 마치면 전체 정답률과 단원별 성취도를 확인하고, 다시 풀기로
                  실력을 다질 수 있습니다.
                </p>
              </div>
            </section>
          </div>
        )}

        {view === 'quiz' && (
          <QuizSession
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            onSelectAnswer={handleSelectAnswer}
            onNext={handleNextQuestion}
          />
        )}

        {view === 'results' && (
          <QuizResults
            questions={questions}
            answers={answers}
            onRetry={() => startNewQuiz()}
            onOpenConcepts={openConcepts}
          />
        )}

        {view === 'concepts' && (
          <ConceptExplorer onStartQuiz={(mode) => startNewQuiz(mode)} />
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-slate-500">
          <span>수학 생각연습 · 중학교 1학년 정비례와 반비례</span>
          <span>로그인이나 개인정보 저장 없이 브라우저에서 바로 학습합니다.</span>
        </div>
      </footer>
    </div>
  );
}
