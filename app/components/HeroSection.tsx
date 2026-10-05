'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function HeroSection() {
  const pillsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('opacity-100', 'translate-y-0'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Slide 1: Hero */}
      <section className="min-h-svh md:min-h-[100dvh] w-full snap-start overflow-hidden md:overflow-x-clip md:overflow-y-visible bg-white flex flex-col">
        {/* Nav */}
        <nav className="flex-none flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white/90 backdrop-blur-sm z-40">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="StudyRealm Logo" width={32} height={32} className="w-8 h-8 object-contain rounded-lg" />
            <span className="font-bold text-slate-800 text-lg tracking-wide">STUDY<span className="text-teal-500">REALM</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-800 font-semibold">
            <a href="#features" className="hover:text-teal-600 transition">Features</a>
            <a href="https://studyrealm.app" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 transition">Main Website</a>
            <a href="#contact" className="hover:text-teal-600 transition">Contact</a>
          </div>
          <span className="text-xs bg-teal-50 border border-teal-200 text-teal-700 px-3 py-1.5 rounded-full font-bold">MSME · Govt. of India</span>
        </nav>

        {/* Hero Content (Flex centered) */}
        <div className="flex-1 w-full flex flex-col justify-center items-center max-w-7xl mx-auto px-6 md:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 w-full flex-1">
            {/* Left: Text Content */}
            <div className="flex-1 flex flex-col items-center justify-center md:justify-center md:self-center md:items-start text-center md:text-left w-full pb-24 md:pb-0">
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
                Karnataka’s Premier LKG-10 Platform
              </div>

              <h1 className="text-[28px] md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] mb-6 tracking-tight">
                Every student learns.<br />
                <span className="text-teal-600">
                  Every teacher sees it.
                </span>
              </h1>

              <p className="text-base md:text-xl text-slate-600 max-w-lg mb-8 leading-relaxed font-medium">
                Fun lessons kids love, simple progress updates for teachers and parents,
                and lessons that follow India&apos;s latest school guidelines. No app to download.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-8 md:mb-8 w-full sm:w-auto">
                <button
                  onClick={scrollToDemo}
                  className="px-8 py-4 rounded-xl text-white font-bold text-base transition-all bg-teal-500 hover:bg-teal-600 shadow-md hover:shadow-lg active:scale-95 w-full sm:w-auto"
                >
                  Experience One Chapter →
                </button>
                <a
                  href="#contact"
                  className="px-8 py-4 rounded-xl text-slate-700 font-bold text-base border-2 border-slate-200 hover:border-teal-300 hover:text-teal-600 transition w-full sm:w-auto text-center flex items-center justify-center"
                >
                  Book a 30-Min Demo
                </a>
              </div>

              {/* Stats - Sleek Trust Bar */}
              <div ref={pillsRef} className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center md:justify-start gap-y-4 gap-x-2 md:gap-x-8 w-full scale-90 md:scale-100 origin-left pb-2 md:pb-0">
                {[
                  { n: '400+', label: 'Learning Moments' },
                  { n: 'LKG - Class 10', label: 'All Grades' },
                  { n: '3 Boards', label: 'CBSE · ICSE · State' },
                  { n: 'NCF 2023', label: 'Auto-Mapped' },
                ].map((s, i, arr) => (
                  <div key={s.n} className="flex items-center justify-center md:justify-start gap-4 md:gap-6">
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                      <div className="text-base md:text-xl font-bold text-slate-900 leading-tight">{s.n}</div>
                      <div className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{s.label}</div>
                    </div>
                    {i < arr.length - 1 && <div className="hidden md:block w-px h-8 bg-slate-200"></div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: UI Composite Mockup */}
            <div className="hidden md:flex flex-1 w-full relative h-[350px] md:h-[450px] items-center justify-center mt-4 md:mt-0 md:self-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-teal-100/60 to-blue-50/60 rounded-full blur-3xl opacity-80 scale-90"></div>
              
              <div className="absolute w-[85%] md:w-[90%] left-0 top-[5%] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform -rotate-3 hover:-rotate-1 transition-transform duration-500 z-10">
                <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                  <div className="ml-4 h-3 w-1/3 bg-slate-200 rounded-full"></div>
                </div>
                <div className="bg-slate-900 h-48 md:h-56 relative overflow-hidden">
                   <Image src="/img/teacher-dashboard.png" alt="Teacher Dashboard" fill sizes="(max-width: 768px) 90vw, 50vw" className="object-cover object-top opacity-95" />
                </div>
              </div>

              <div className="absolute w-[80%] right-0 bottom-[5%] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden transform rotate-3 hover:rotate-1 transition-transform duration-500 z-20">
                <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-4 gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                </div>
                <div className="bg-slate-900 h-40 md:h-48 relative overflow-hidden">
                   <Image src="/img/student-app-brain.png" alt="Student App" fill sizes="(max-width: 768px) 90vw, 50vw" className="object-cover object-top opacity-95" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slide 2: The Full Loop (Now includes CTA) */}
      <section id="features" className="min-h-svh md:min-h-[100dvh] w-full snap-start overflow-visible md:overflow-x-clip bg-slate-50 border-t border-slate-100 flex flex-col justify-center items-center pt-24 pb-28 md:py-4">
        <div className="w-full max-w-7xl px-4 md:px-6 flex flex-col md:h-full justify-center md:max-h-full">
          <div className="text-center mb-4 md:mb-8 shrink-0">
            <p className="text-slate-500 font-bold text-[10px] md:text-sm uppercase tracking-widest mb-1 md:mb-2">The Full Loop</p>
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
              Everyone stays informed
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 shrink overflow-visible md:min-h-0 md:overflow-y-auto w-full">
            {/* Student Card */}
            <div className="rounded-2xl md:rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col relative shrink-0 md:min-h-[280px] overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 md:h-1.5 bg-teal-500"></div>
              <div className="p-4 md:p-6 flex flex-col md:h-full">
                <div className="flex items-center gap-3 mb-2 md:mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-base md:text-lg text-slate-900 shrink-0">Student</h3>
                </div>
                <ul className="space-y-1.5 md:space-y-3 md:flex-1 overflow-visible md:overflow-hidden">
                  <li className="flex items-start gap-2 text-[11px] md:text-sm text-slate-600 font-medium leading-tight md:leading-snug">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Learns through interactive 3D stories</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] md:text-sm text-slate-600 font-medium leading-tight md:leading-snug">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Everything is read aloud</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] md:text-sm text-slate-600 font-medium leading-tight md:leading-snug">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Practices without penalties</span>
                  </li>
                </ul>
                <div className="mt-auto pt-3 hidden md:flex items-center justify-center shrink-0">
                  <div className="bg-slate-50 rounded-xl p-1.5 border border-slate-100 w-full flex items-center justify-center h-[72px] overflow-hidden relative">
                    <Image src="/img/student-app-brain.png" alt="Student App" fill sizes="(max-width: 768px) 90vw, 33vw" className="object-cover object-top rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher Card */}
            <div className="rounded-2xl md:rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col relative shrink-0 md:min-h-[280px] overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 md:h-1.5 bg-blue-500"></div>
              <div className="p-4 md:p-6 flex flex-col md:h-full">
                <div className="flex items-center gap-3 mb-2 md:mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-base md:text-lg text-slate-900 shrink-0">Teacher</h3>
                </div>
                <ul className="space-y-1.5 md:space-y-3 md:flex-1 overflow-visible md:overflow-hidden">
                  <li className="flex items-start gap-2 text-[11px] md:text-sm text-slate-600 font-medium leading-tight md:leading-snug">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Auto-mapped to NCF 2023 curriculum</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] md:text-sm text-slate-600 font-medium leading-tight md:leading-snug">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>See instantly who needs help</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] md:text-sm text-slate-600 font-medium leading-tight md:leading-snug">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Runs friendly class quizzes</span>
                  </li>
                </ul>
                <div className="mt-auto pt-3 hidden md:flex items-center justify-center shrink-0">
                  <div className="bg-slate-50 rounded-xl p-1.5 border border-slate-100 w-full flex items-center justify-center h-[72px] overflow-hidden relative">
                    <Image src="/img/teacher-dashboard.png" alt="Teacher Dashboard" fill sizes="(max-width: 768px) 90vw, 33vw" className="object-cover object-top rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Card */}
            <div className="rounded-2xl md:rounded-3xl border border-slate-200 bg-white shadow-sm flex flex-col relative shrink-0 md:min-h-[280px] overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 md:h-1.5 bg-purple-500"></div>
              <div className="p-4 md:p-6 flex flex-col md:h-full">
                <div className="flex items-center gap-3 mb-2 md:mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-base md:text-lg text-slate-900 shrink-0">Parent</h3>
                </div>
                <ul className="space-y-1.5 md:space-y-3 md:flex-1 overflow-visible md:overflow-hidden">
                  <li className="flex items-start gap-2 text-[11px] md:text-sm text-slate-600 font-medium leading-tight md:leading-snug">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Simple daily updates on real progress</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] md:text-sm text-slate-600 font-medium leading-tight md:leading-snug">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>No guessing if homework got done</span>
                  </li>
                  <li className="flex items-start gap-2 text-[11px] md:text-sm text-slate-600 font-medium leading-tight md:leading-snug">
                    <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Fewer surprises and less back-and-forth</span>
                  </li>
                </ul>
                <div className="mt-auto pt-3 hidden md:flex items-center justify-center shrink-0">
                  <div className="bg-slate-50 rounded-xl p-1.5 border border-slate-100 w-full flex items-center justify-center h-[72px] overflow-hidden relative">
                    <Image src="/img/parent-dashboard.png" alt="Parent Dashboard" fill sizes="(max-width: 768px) 90vw, 33vw" className="object-cover object-top rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Direct CTA attached to Full Loop */}
          <div className="mt-6 md:mt-8 shrink-0 flex flex-col items-center">
            <p className="text-slate-500 mb-3 font-bold tracking-wide uppercase text-[10px] md:text-xs">See what a real chapter feels like</p>
            <button
              onClick={scrollToDemo}
              className="px-6 md:px-10 py-3 md:py-4 rounded-full text-white bg-teal-600 font-bold text-sm md:text-lg transition-all hover:bg-teal-700 hover:shadow-xl hover:shadow-teal-600/30 active:scale-95"
            >
              Experience One Chapter →
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
