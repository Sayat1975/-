import { useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, RotateCcw, X, XCircle } from 'lucide-react';
import {
  getZoneById,
  Lang,
  LANG_LABELS,
  QUIZ_QUESTIONS,
  SCHOOL_ZONES,
  UI_COPY,
  ZoneId,
} from '../data/schoolData';

interface SchoolRulesModalProps {
  open: boolean;
  lang: Lang;
  zoneId: ZoneId;
  onChangeLang: (lang: Lang) => void;
  onNavigateToZone: (zoneId: ZoneId) => void;
  onClose: () => void;
}

type ModalTab = 'current' | 'all' | 'quiz';

export function SchoolRulesModal({
  open,
  lang,
  zoneId,
  onChangeLang,
  onNavigateToZone,
  onClose,
}: SchoolRulesModalProps) {
  const [tab, setTab] = useState<ModalTab>('current');
  const [answers, setAnswers] = useState<Record<string, number>>({});

  if (!open) return null;

  const currentZone = getZoneById(zoneId);
  const langs: Lang[] = ['kk', 'ru', 'en'];

  const correctCount = QUIZ_QUESTIONS.reduce((acc, q) => {
    return acc + (answers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);
  const answeredCount = Object.keys(answers).length;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70"
      role="dialog"
      aria-modal="true"
      aria-label={UI_COPY.rulesModalTitle[lang]}
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[86vh] flex flex-col rounded-2xl border border-slate-700/80 bg-slate-900 text-slate-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-slate-800">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <BookOpen className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span>{UI_COPY.facadeTitle[lang]}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{currentZone.name[lang]}</span>
            </div>
            <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-white tracking-tight">
              {UI_COPY.rulesModalTitle[lang]}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Inline Trilingual Switcher */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-800 border border-slate-700/80">
              {langs.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeLang(code)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    lang === code
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {LANG_LABELS[code]}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={UI_COPY.close[lang]}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-slate-800 bg-slate-900">
          {(
            [
              { id: 'current', label: UI_COPY.tabCurrentZone[lang] },
              { id: 'all', label: UI_COPY.tabAllRules[lang] },
              { id: 'quiz', label: UI_COPY.tabQuiz[lang] },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                tab === item.id
                  ? 'bg-slate-100 text-slate-950'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 rules-scroll">
          {tab === 'current' && (
            <div>
              <div className="mb-5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="font-mono-num text-sky-400 font-semibold">{currentZone.code}</span>
                  <span aria-hidden="true">/</span>
                  <span>{currentZone.subtitle[lang]}</span>
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold text-white">
                  {currentZone.name[lang]}
                </h3>
              </div>

              <ol className="divide-y divide-slate-800">
                {currentZone.rules.map((rule, idx) => (
                  <li key={rule.id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                    <span className="font-mono-num text-sm font-semibold text-sky-400 pt-0.5 shrink-0">
                      0{idx + 1}.
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-base font-semibold text-white">
                        {rule.title[lang]}
                      </h4>
                      <p className="mt-1 text-sm text-slate-300 leading-relaxed">
                        {rule.description[lang]}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {tab === 'all' && (
            <div className="space-y-7">
              {SCHOOL_ZONES.map((zone) => (
                <section
                  key={zone.id}
                  className="pb-6 border-b border-slate-800 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono-num font-semibold text-sky-400">
                          {zone.code}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{zone.subtitle[lang]}</span>
                      </div>
                      <h3 className="mt-0.5 font-display text-base font-semibold text-white">
                        {zone.name[lang]}
                      </h3>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onNavigateToZone(zone.id);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>{UI_COPY.goToZone[lang]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mt-3">
                    {zone.rules.map((rule, idx) => (
                      <li key={rule.id} className="flex items-start gap-2.5">
                        <span className="font-mono-num text-xs font-semibold text-slate-400 pt-1 shrink-0">
                          0{idx + 1}.
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-100">
                            {rule.title[lang]}
                          </div>
                          <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">
                            {rule.description[lang]}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          )}

          {tab === 'quiz' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div className="text-sm text-slate-300">
                  {UI_COPY.quizScore[lang]}:{' '}
                  <span className="font-mono-num font-semibold text-white">
                    {correctCount} / {QUIZ_QUESTIONS.length}
                  </span>
                </div>
                {answeredCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setAnswers({})}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{UI_COPY.quizReset[lang]}</span>
                  </button>
                )}
              </div>

              {QUIZ_QUESTIONS.map((q, qIdx) => {
                const chosen = answers[q.id];
                const isAnswered = chosen !== undefined;
                const isCorrect = chosen === q.correctIndex;
                const zInfo = getZoneById(q.zoneId);

                return (
                  <div
                    key={q.id}
                    className="pb-6 border-b border-slate-800 last:border-b-0 last:pb-0"
                  >
                    <div className="text-xs text-slate-400 mb-1">
                      <span className="font-mono-num text-sky-400 font-semibold">
                        0{qIdx + 1}.
                      </span>{' '}
                      <span aria-hidden="true">·</span> {zInfo.name[lang]}
                    </div>
                    <h4 className="text-sm sm:text-base font-semibold text-white">
                      {q.question[lang]}
                    </h4>

                    <div className="mt-3 space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const selected = chosen === oIdx;
                        const correctOpt = oIdx === q.correctIndex;

                        let btnClasses =
                          'border-slate-700/80 bg-slate-800/60 text-slate-200 hover:bg-slate-800';
                        if (isAnswered) {
                          if (correctOpt) {
                            btnClasses =
                              'border-emerald-500/70 bg-emerald-950/60 text-emerald-100';
                          } else if (selected) {
                            btnClasses =
                              'border-rose-500/70 bg-rose-950/60 text-rose-100';
                          } else {
                            btnClasses =
                              'border-slate-800 bg-slate-900/50 text-slate-400';
                          }
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() =>
                              setAnswers((prev) => ({ ...prev, [q.id]: oIdx }))
                            }
                            className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-colors flex items-center justify-between gap-3 cursor-pointer ${btnClasses}`}
                          >
                            <span>{opt[lang]}</span>
                            {isAnswered && correctOpt && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            )}
                            {isAnswered && selected && !correctOpt && (
                              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <p
                        className={`mt-2.5 text-xs leading-relaxed ${
                          isCorrect ? 'text-emerald-300' : 'text-amber-300'
                        }`}
                      >
                        <strong className="font-semibold">
                          {isCorrect
                            ? UI_COPY.quizCorrect[lang]
                            : UI_COPY.quizIncorrect[lang]}
                          :
                        </strong>{' '}
                        {q.explanation[lang]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
