'use client';
import { useState, useEffect } from 'react';
import { SurveyRole, SurveyAnswer } from '../types';
import { surveyQuestions } from '../data/surveyQuestions';
import { playAudio, visibleRatio, watchSectionVisibility, stopAudioFor } from '../lib/tts';
import GuideBot from './GuideBot';
import { useRef, useCallback } from 'react';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbydtyFaM1VYGakvHhV7Fa1gpbh0WX5PRgh_fFQSdWmigxh1yv2JkOBbuPcHvjJyUW00/exec';

interface Props {
  role: SurveyRole;
  name: string;
  mobile: string;
}

export default function SurveySection({ role, name, mobile }: Props) {
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
         answers: answers
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
    return answers.some(a => a.questionId === q.id && a.value.trim() !== '');
  };

  if (isSubmitted) {
    return (
       <section id="survey" className="h-[100dvh] overflow-hidden px-4 bg-slate-50 flex flex-col justify-center items-center">
          <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-teal-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Thank you!</h3>
            <p className="text-slate-600">Your feedback helps us make StudyRealm better.</p>
          </div>
       </section>
    );
  }

  return (
     <section id="survey" ref={containerRef} className="h-[100dvh] overflow-hidden px-4 bg-slate-50 flex flex-col justify-center items-center relative py-4">
        <div className="w-full max-w-2xl bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 flex flex-col max-h-[95dvh]">
          
          {/* Audio Controls */}
          <div className="flex justify-between items-center mb-4 md:mb-6 border-b border-slate-100 pb-3 md:pb-4 shrink-0">
             <div className="text-sm font-semibold text-teal-600 uppercase tracking-widest">Feedback Survey</div>
             <div className="flex gap-2">
                <button onClick={replay} className="px-3 py-1.5 bg-slate-100 text-slate-700 font-medium text-xs rounded-full hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-teal-500">
                   🔊 Replay
                </button>
                <button onClick={toggleMute} className="px-3 py-1.5 bg-slate-100 text-slate-700 font-medium text-xs rounded-full hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-teal-500">
                   {botEnabled ? '🔊 Mute' : '🔇 Unmute'}
                </button>
             </div>
          </div>

          {/* Progress */}
          {currentIndex >= 0 && currentIndex < totalQuestions && (
             <div className="mb-4 md:mb-6 shrink-0">
                <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                   <span aria-live="polite">Question {currentIndex + 1} of {totalQuestions}</span>
                   <span>{Math.round(((currentIndex) / totalQuestions) * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-teal-500 transition-all duration-300 ease-out"
                     style={{ width: `${((currentIndex) / totalQuestions) * 100}%` }}
                   ></div>
                </div>
             </div>
          )}

          {/* Content */}
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 @media (prefers-reduced-motion: reduce) { animate-none } overflow-y-auto shrink min-h-0">
            {currentIndex === -1 ? (
              <div className="text-center py-4 md:py-8">
                 <p className="text-lg md:text-xl text-slate-800 font-medium leading-relaxed mb-6 md:mb-8">{surveySet.intro}</p>
                 <button 
                   onClick={handleNext}
                   className="px-8 py-3 bg-teal-600 text-white font-bold rounded-full hover:bg-teal-700 transition shadow-lg focus:outline-none focus:ring-4 focus:ring-teal-500/30"
                 >
                   Start Survey
                 </button>
              </div>
            ) : currentIndex < totalQuestions ? (
              <div className="pb-2">
                 {(() => {
                   const q = surveySet.questions[currentIndex];
                   const val = answers.find(a => a.questionId === q.id)?.value || '';

                   if (q.type === 'mcq') {
                     return (
                       <fieldset className="border-none p-0 m-0">
                         <legend className="text-lg md:text-xl text-slate-800 font-bold mb-4 md:mb-6 w-full">{q.prompt}</legend>
                         <div className="flex flex-col gap-2 md:gap-3">
                           {q.options.map(opt => (
                             <label 
                               key={opt}
                               className={`flex items-center gap-3 p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all focus-within:ring-4 focus-within:ring-teal-500/20 ${val === opt ? 'border-teal-500 bg-teal-50/50' : 'border-slate-200 hover:border-teal-300 hover:bg-slate-50'}`}
                             >
                               <input 
                                 type="radio" 
                                 name={q.id} 
                                 value={opt}
                                 checked={val === opt}
                                 onChange={(e) => handleMCQChange(q.id, q.prompt, e.target.value)}
                                 className="w-4 h-4 md:w-5 md:h-5 text-teal-600 border-slate-300 focus:ring-teal-500 cursor-pointer shrink-0"
                               />
                               <span className="text-slate-800 font-medium text-sm md:text-base">{opt}</span>
                             </label>
                           ))}
                         </div>
                       </fieldset>
                     );
                   }

                   if (q.type === 'text') {
                     return (
                       <div className="flex flex-col">
                         <label htmlFor={q.id} className="text-lg md:text-xl text-slate-800 font-bold mb-4 block">
                           {q.prompt}
                         </label>
                         <textarea
                           id={q.id}
                           rows={4}
                           placeholder={q.placeholder}
                           value={val}
                           onChange={(e) => handleTextChange(q.id, q.prompt, e.target.value)}
                           className="w-full border-2 border-slate-200 rounded-xl p-3 md:p-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/20 transition resize-none text-sm md:text-base"
                         />
                       </div>
                     );
                   }
                   return null;
                 })()}
                 
                 <div className="mt-6 md:mt-8 flex justify-end shrink-0">
                   <button 
                     onClick={handleNext}
                     disabled={!hasAnsweredCurrent()}
                     aria-disabled={!hasAnsweredCurrent()}
                     className="px-6 md:px-8 py-2.5 md:py-3 bg-teal-600 text-white font-bold rounded-full hover:bg-teal-700 transition shadow-lg focus:outline-none focus:ring-4 focus:ring-teal-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                   >
                     Next
                   </button>
                 </div>
              </div>
            ) : (
              <div className="text-center py-4 md:py-8">
                 <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 md:mb-4">All done!</h3>
                 <p className="text-slate-600 mb-6 md:mb-8 font-medium">Ready to submit your answers?</p>
                 <button 
                   onClick={submitSurvey}
                   disabled={isSubmitting}
                   aria-disabled={isSubmitting}
                   className="px-6 md:px-8 py-2.5 md:py-3 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 transition shadow-lg focus:outline-none focus:ring-4 focus:ring-slate-500/30 disabled:opacity-70 flex items-center justify-center mx-auto"
                 >
                   {isSubmitting ? 'Submitting...' : 'Submit Answers'}
                 </button>
              </div>
            )}
          </div>

        </div>
        {botEnabled && isIntersecting && !isSubmitted && (
          <GuideBot isReading={speaking} onTap={replay} />
        )}
     </section>
  );
}
