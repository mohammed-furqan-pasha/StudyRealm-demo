'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Check } from 'lucide-react';
import { SurveyRole, SurveyAnswer } from '../types';
import { surveyQuestions } from '../data/surveyQuestions';
import { playAudio, visibleRatio, watchSectionVisibility, stopAudioFor } from '../lib/tts';
import GuideBot from './GuideBot';
import SceneShell from './SceneShell';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbydtyFaM1VYGakvHhV7Fa1gpbh0WX5PRgh_fFQSdWmigxh1yv2JkOBbuPcHvjJyUW00/exec';

const SURVEY_GLASS_CARD_STYLE: React.CSSProperties = {
  borderRadius: '28px',
  background: 'linear-gradient(180deg, rgba(10,40,58,0.88), rgba(6,22,38,0.92))',
  border: '1px solid rgba(94,234,212,0.35)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18), 0 8px 32px rgba(0,0,0,0.35)',
  fontFamily: 'var(--font-outfit), sans-serif',
};

interface Props {
  role: SurveyRole;
  name: string;
  mobile: string;
  onContinue?: () => void;
}

export default function SurveySection({ role, name, mobile, onContinue }: Props) {
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 = intro, 0 = q1
  const [answers, setAnswers] = useState<SurveyAnswer[]>([]);
  const [botEnabled, setBotEnabled] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  
  const botEnabledRef = useRef(botEnabled);
  const isIntersectingRef = useRef(isIntersecting);
  const isSubmittedRef = useRef(isSubmitted);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
      isIntersectingRef.current = visible;
      setIsIntersecting(visible);
    }, { threshold: [0, 0.5, 1] });
    
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => watchSectionVisibility(
    () => containerRef.current,
    0.4,
    () => { stopAudioFor('survey'); setSpeaking(false); }
  ), []);

  const canSpeakNow = useCallback(() => botEnabledRef.current &&
   !isSubmittedRef.current && visibleRatio(containerRef.current) >= 0.5, []);

  const canPlay = botEnabled && isIntersecting && !isSubmitted;

  const [prevCanPlay, setPrevCanPlay] = useState(canPlay);
  if (canPlay !== prevCanPlay) {
    setPrevCanPlay(canPlay);
    if (!canPlay) {
      stopAudioFor('survey');
      setSpeaking(false);
    }
  }
  
  const surveySet = surveyQuestions[role] || surveyQuestions['Other'];
  const totalQuestions = surveySet.questions.length;

  // Auto-play intro
  useEffect(() => {
    if (currentIndex === -1 && canPlay) {
      playAudio(surveySet.intro_audio, true, 'en-IN', () => setSpeaking(true), () => setSpeaking(false), canSpeakNow, 'survey');
    }
  }, [currentIndex, canPlay, surveySet.intro_audio, canSpeakNow]);

  // Auto-play question
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < totalQuestions && canPlay) {
      playAudio(surveySet.questions[currentIndex].audio, true, 'en-IN', () => setSpeaking(true), () => setSpeaking(false), canSpeakNow, 'survey');
    }
  }, [currentIndex, canPlay, surveySet.questions, totalQuestions, canSpeakNow]);

  const handleNext = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const submitSurvey = async () => {
    setIsSubmitting(true);
    
    try {
       const payload = {
         formType: 'survey',
         name: name,
         role: role,
         mobile: mobile,
         timestamp: new Date().toISOString(),
         answers: answers.filter(a => a.value.trim() !== '')
       };
       
       // Fire and forget fetch request, do not await it
       fetch(GOOGLE_SCRIPT_URL, {
         method: 'POST',
         mode: 'no-cors',
         headers: {
           'Content-Type': 'text/plain'
         },
         body: JSON.stringify(payload)
       })
         .catch(err => console.error("Survey fetch error:", err));
    } catch (err) {
       console.error("Survey submission preparation error:", err);
    }
    
    // Show thank you state immediately
    isSubmittedRef.current = true;
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const toggleMute = () => {
    if (botEnabled) stopAudioFor('survey');
    const nextVal = !botEnabled;
    botEnabledRef.current = nextVal;
    setBotEnabled(nextVal);
  };

  const replay = () => {
    if (!canPlay) return;
    if (currentIndex === -1) {
      playAudio(surveySet.intro_audio, true, 'en-IN', () => setSpeaking(true), () => setSpeaking(false), canSpeakNow, 'survey');
    } else if (currentIndex >= 0 && currentIndex < totalQuestions) {
      playAudio(surveySet.questions[currentIndex].audio, true, 'en-IN', () => setSpeaking(true), () => setSpeaking(false), canSpeakNow, 'survey');
    }
  };

  const handleMCQChange = (qId: string, qText: string, val: string) => {
    setAnswers(prev => {
      const existing = prev.filter(a => a.questionId !== qId);
      return [...existing, { questionId: qId, questionText: qText, value: val }];
    });
  };

  const handleTextChange = (qId: string, qText: string, val: string) => {
    setAnswers(prev => {
      const existing = prev.filter(a => a.questionId !== qId);
      return [...existing, { questionId: qId, questionText: qText, value: val }];
    });
  };

  const hasAnsweredCurrent = () => {
    if (currentIndex < 0 || currentIndex >= totalQuestions) return true;
    const q = surveySet.questions[currentIndex];
    if (q.type === 'text' && q.optional) return true;
    return answers.some(a => a.questionId === q.id && a.value.trim() !== '');
  };

  if (isSubmitted) {
    return (
      <SceneShell scene="survey">
        <style>{`
          @media (min-width: 768px) {
            .survey-glass-card {
              max-height: calc(100dvh - 192px);
              display: flex;
              flex-direction: column;
            }
            .survey-middle-scroll {
              flex: 1 1 0%;
              min-height: 0;
              overflow-y: auto;
              scrollbar-width: thin;
              scrollbar-color: rgba(255, 255, 255, 0.28) transparent;
            }
            .survey-middle-scroll::-webkit-scrollbar {
              width: 6px;
            }
            .survey-middle-scroll::-webkit-scrollbar-track {
              background: transparent;
            }
            .survey-middle-scroll::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.28);
              border-radius: 9999px;
            }
          }
          @media (min-width: 768px) and (max-height: 899.98px) {
            .survey-glass-card {
              padding: 20px 24px !important;
            }
            .survey-header-row {
              margin-bottom: 12px !important;
              padding-bottom: 8px !important;
            }
            .survey-progress-row {
              margin-bottom: 12px !important;
            }
            .survey-question-prompt {
              font-size: clamp(17px, 1.5vw, 22px) !important;
              line-height: 1.3 !important;
              margin-bottom: 10px !important;
            }
            .survey-options-group {
              gap: 8px !important;
            }
            .survey-option-item {
              padding: 10px 14px !important;
            }
            .survey-footer-row {
              margin-top: 12px !important;
              padding-top: 0px !important;
            }
          }
        `}</style>
        {/* Static Veil for Content Contrast */}
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: 'rgba(3,8,18,0.40)' }}
          aria-hidden="true"
        />
        <section
          id="survey"
          className="relative z-10 w-full h-full flex flex-col items-center flex-1 min-h-0 overflow-y-auto pageflow-scroll px-4 pt-6 md:pt-[72px] pb-6 md:pb-0 text-center"
        >
          <div
            style={SURVEY_GLASS_CARD_STYLE}
            className="survey-glass-card w-full max-w-md p-6 sm:p-8 text-center flex flex-col items-center my-auto shrink-0 shadow-2xl md:max-h-[calc(100dvh-192px)]"
          >
            <div className="survey-middle-scroll md:flex-1 md:min-h-0 md:overflow-y-auto flex flex-col items-center justify-center [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.28)_transparent]">
              <h3 className="text-2xl font-bold text-white mb-2">Thank you!</h3>
              <p className="text-slate-300 mb-6 leading-relaxed text-sm sm:text-base">
                Your feedback helps us make StudyRealm better.
              </p>
            </div>
            <div className="survey-footer-row shrink-0 w-full flex justify-center pt-2">
              <button
                type="button"
                onClick={onContinue}
                className="min-h-[48px] px-8 py-3 bg-teal-500 hover:bg-teal-400 active:scale-95 text-white font-bold rounded-full transition shadow-lg shadow-teal-500/25 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-900 flex items-center justify-center cursor-pointer select-none"
              >
                Continue ▸
              </button>
            </div>
          </div>
        </section>
      </SceneShell>
    );
  }

  return (
    <SceneShell scene="survey">
      <style>{`
        @media (min-width: 768px) {
          .survey-glass-card {
            max-height: calc(100dvh - 192px);
            display: flex;
            flex-direction: column;
          }
          .survey-middle-scroll {
            flex: 1 1 0%;
            min-height: 0;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.28) transparent;
          }
          .survey-middle-scroll::-webkit-scrollbar {
            width: 6px;
          }
          .survey-middle-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .survey-middle-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.28);
            border-radius: 9999px;
          }
        }
        @media (min-width: 768px) and (max-height: 899.98px) {
          .survey-glass-card {
            padding: 20px 24px !important;
          }
          .survey-header-row {
            margin-bottom: 12px !important;
            padding-bottom: 8px !important;
          }
          .survey-progress-row {
            margin-bottom: 12px !important;
          }
          .survey-question-prompt {
            font-size: clamp(17px, 1.5vw, 22px) !important;
            line-height: 1.3 !important;
            margin-bottom: 10px !important;
          }
          .survey-options-group {
            gap: 8px !important;
          }
          .survey-option-item {
            padding: 10px 14px !important;
          }
          .survey-footer-row {
            margin-top: 12px !important;
            padding-top: 0px !important;
          }
        }
      `}</style>

      {/* Static Veil for Content Contrast */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: 'rgba(3,8,18,0.40)' }}
        aria-hidden="true"
      />
      <section
        id="survey"
        ref={containerRef}
        className="relative z-10 w-full h-full flex flex-col items-center flex-1 min-h-0 overflow-y-auto pageflow-scroll px-4 pt-6 md:pt-[72px] pb-6 md:pb-0 text-left"
      >
        <div className="w-full max-w-2xl my-auto shrink-0 flex flex-col items-center">
          <div
            style={SURVEY_GLASS_CARD_STYLE}
            className="survey-glass-card w-full max-w-2xl p-6 md:p-8 flex flex-col my-auto shrink-0 shadow-2xl md:max-h-[calc(100dvh-192px)]"
          >
          {/* Audio Controls */}
          <div className="survey-header-row flex justify-between items-center mb-4 md:mb-6 border-b border-white/10 pb-3 md:pb-4 shrink-0">
            <div className="uppercase text-[12px] tracking-[0.2em] text-white/80 font-medium select-none">
              Feedback Survey
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={replay}
                style={{
                  background: 'rgba(8, 24, 40, 0.85)',
                  border: '1px solid rgba(94, 234, 212, 0.28)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                }}
                className="px-3 py-1.5 text-slate-200 font-medium text-xs rounded-full hover:bg-[rgba(12,32,54,0.95)] hover:border-teal-400/50 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer select-none"
              >
                🔊 Replay
              </button>
              <button
                type="button"
                onClick={toggleMute}
                style={{
                  background: 'rgba(8, 24, 40, 0.85)',
                  border: '1px solid rgba(94, 234, 212, 0.28)',
                  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                }}
                className="px-3 py-1.5 text-slate-200 font-medium text-xs rounded-full hover:bg-[rgba(12,32,54,0.95)] hover:border-teal-400/50 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer select-none"
              >
                {botEnabled ? '🔊 Mute' : '🔇 Unmute'}
              </button>
            </div>
          </div>

          {/* Progress */}
          {currentIndex >= 0 && currentIndex < totalQuestions && (
            <div className="survey-progress-row mb-4 md:mb-6 shrink-0">
              <div className="flex justify-between text-xs font-medium text-slate-400 mb-1.5">
                <span aria-live="polite">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span>{Math.round((currentIndex / totalQuestions) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full w-full bg-teal-400 rounded-full origin-left transition-transform duration-300 ease-out"
                  style={{
                    transform: `scaleX(${currentIndex / totalQuestions})`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div key={currentIndex} className="transition-opacity duration-200 md:flex-1 md:min-h-0 md:flex md:flex-col">
            {currentIndex === -1 ? (
              <>
                <div className="survey-middle-scroll md:flex-1 md:min-h-0 md:overflow-y-auto text-center py-4 md:py-8">
                  <p className="text-lg md:text-xl text-white font-medium leading-relaxed mb-6 md:mb-8">
                    {surveySet.intro}
                  </p>
                </div>
                <div className="survey-footer-row mt-4 md:mt-6 flex justify-center shrink-0 pt-2">
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-8 py-3 bg-teal-500 hover:bg-teal-400 active:scale-95 text-white font-bold rounded-full transition shadow-lg shadow-teal-500/25 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer select-none"
                  >
                    Start Survey
                  </button>
                </div>
              </>
            ) : currentIndex < totalQuestions ? (
              <>
                <div className="survey-middle-scroll md:flex-1 md:min-h-0 md:overflow-y-auto pb-1 pr-1 md:pr-1.5">
                  {(() => {
                    const q = surveySet.questions[currentIndex];
                    const val = answers.find((a) => a.questionId === q.id)?.value || '';

                    if (q.type === 'mcq') {
                      return (
                        <fieldset className="border-none p-0 m-0">
                          <legend className="survey-question-prompt text-lg md:text-xl text-white font-bold mb-3 md:mb-4 w-full leading-snug">
                            {q.prompt}
                          </legend>
                          <div className="survey-options-group flex flex-col gap-[10px]">
                            {q.options.map((opt, optIdx) => {
                              const isSelected = val === opt;
                              const optionId = `${q.id}-opt-${optIdx}`;
                              return (
                                <label
                                  key={opt}
                                  htmlFor={optionId}
                                  className={`survey-option-item flex items-center gap-3 p-[12px_16px] rounded-xl border transition-all cursor-pointer select-none focus-within:ring-2 focus-within:ring-teal-400 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 ${
                                    isSelected
                                      ? 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/20'
                                      : 'bg-white/5 border-white/15 text-slate-200 hover:bg-white/10 hover:border-white/25'
                                  }`}
                                >
                                  <input
                                    id={optionId}
                                    type="radio"
                                    name={q.id}
                                    value={opt}
                                    checked={isSelected}
                                    onChange={(e) =>
                                      handleMCQChange(q.id, q.prompt, e.target.value)
                                    }
                                    className="sr-only"
                                  />
                                  <div
                                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                      isSelected
                                        ? 'bg-white text-teal-600'
                                        : 'border border-white/30 bg-white/5'
                                    }`}
                                    aria-hidden="true"
                                  >
                                    {isSelected && (
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    )}
                                  </div>
                                  <span
                                    style={{ fontSize: 'clamp(15px, 1.05vw, 18px)' }}
                                    className={`leading-snug ${
                                      isSelected ? 'font-bold text-white' : 'font-medium'
                                    }`}
                                  >
                                    {opt}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>
                      );
                    }

                    if (q.type === 'text') {
                      return (
                        <div className="flex flex-col">
                          <label
                            htmlFor={q.id}
                            className="survey-question-prompt text-lg md:text-xl text-white font-bold mb-3 md:mb-4 block leading-snug"
                          >
                            {q.prompt}
                          </label>
                          <textarea
                            id={q.id}
                            name={q.id}
                            rows={4}
                            placeholder={q.placeholder}
                            value={val}
                            onChange={(e) => handleTextChange(q.id, q.prompt, e.target.value)}
                            className="w-full bg-white/5 border border-white/15 rounded-xl p-3 md:p-4 text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50 transition resize-none text-sm md:text-base leading-relaxed"
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                <div className="survey-footer-row mt-4 md:mt-6 flex justify-end shrink-0 pt-2">
                  {(() => {
                    const q = surveySet.questions[currentIndex];
                    const val = answers.find((a) => a.questionId === q.id)?.value || '';
                    const isSkip = q.type === 'text' && q.optional && val.trim() === '';

                    return (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!hasAnsweredCurrent()}
                        aria-disabled={!hasAnsweredCurrent()}
                        className={`font-bold rounded-full px-6 md:px-8 py-2.5 md:py-3 transition focus:outline-none focus:ring-2 focus:ring-teal-400 select-none cursor-pointer ${
                          isSkip
                            ? 'bg-transparent border border-white/20 text-slate-200 hover:bg-white/10 hover:border-white/30 hover:text-white'
                            : 'bg-teal-500 hover:bg-teal-400 active:scale-95 text-white shadow-lg shadow-teal-500/25 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100'
                        }`}
                      >
                        {isSkip ? 'Skip' : 'Next'}
                      </button>
                    );
                  })()}
                </div>
              </>
            ) : (
              <>
                <div className="survey-middle-scroll md:flex-1 md:min-h-0 md:overflow-y-auto text-center py-4 md:py-8">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
                    All done!
                  </h3>
                  <p className="text-slate-300 mb-6 md:mb-8 font-medium">
                    Ready to submit your answers?
                  </p>
                </div>
                <div className="survey-footer-row mt-4 md:mt-6 flex justify-center shrink-0 pt-2">
                  <button
                    type="button"
                    onClick={submitSurvey}
                    disabled={isSubmitting}
                    aria-disabled={isSubmitting}
                    className="px-6 md:px-8 py-2.5 md:py-3 bg-teal-500 hover:bg-teal-400 active:scale-95 text-white font-bold rounded-full transition shadow-lg shadow-teal-500/25 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center mx-auto select-none cursor-pointer"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Answers'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

        {botEnabled && isIntersecting && !isSubmitted && (
          <GuideBot isReading={speaking} onTap={replay} />
        )}
      </section>
    </SceneShell>
  );
}
