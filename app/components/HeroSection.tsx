'use client';
import { useEffect, useRef } from 'react';

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
    <section className="min-h-screen flex flex-col relative overflow-hidden bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white/90 backdrop-blur-sm z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-bold text-slate-800 text-lg tracking-wide">STUDY<span className="text-teal-500">REALM</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
          <a href="#features" className="hover:text-teal-600 transition">Features</a>
          <a href="#demo" className="hover:text-teal-600 transition">Live Demo</a>
          <a href="#contact" className="hover:text-teal-600 transition">Contact</a>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-medium">MSME · Govt. of India</span>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
          Karnataka&apos;s K-10 EdTech Platform · CBSE · ICSE · State Board
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
          Every student learns.<br />
          <span className="bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
            Every teacher sees it.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
          Interactive micro-lessons, real-time mastery tracking, NCF 2023 auto-compliance — 
          all in a browser. No app install. No homework friction.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <button
            onClick={scrollToDemo}
            className="px-8 py-4 rounded-2xl text-white font-bold text-base transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #14B8A6, #3B82F6)' }}
          >
            Experience One Chapter →
          </button>
          <a
            href="#contact"
            className="px-8 py-4 rounded-2xl text-slate-700 font-bold text-base border border-slate-200 hover:border-teal-300 hover:text-teal-600 transition"
          >
            Book a 30-Min Demo
          </a>
        </div>

        {/* Stats */}
        <div ref={pillsRef} className="flex flex-wrap justify-center gap-4">
          {[
            { n: '400+', label: 'Learning Moments' },
            { n: 'Class 1–10', label: 'All Grades' },
            { n: '3 Boards', label: 'CBSE · ICSE · State' },
            { n: 'NCF 2023', label: 'Auto-Mapped' },
          ].map(s => (
            <div key={s.n} className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-center">
              <div className="text-xl font-bold text-slate-800">{s.n}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 Pillars */}
      <div id="features" className="bg-slate-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3">Why StudyRealm</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Built for Indian classrooms
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📋',
                color: 'bg-blue-50 border-blue-100',
                iconBg: 'bg-blue-100 text-blue-600',
                title: 'Automated NCF 2023 Tagging',
                desc: 'Every question and interaction is auto-tagged with NCF 2023 competencies at the database level. Generate compliance reports in one click — zero teacher effort.',
              },
              {
                icon: '🗺️',
                color: 'bg-amber-50 border-amber-100',
                iconBg: 'bg-amber-100 text-amber-600',
                title: 'Live Mastery Heatmaps',
                desc: 'See which students are thriving (teal), need revision (amber), or need urgent help (coral) — in real time. No waiting for exam results.',
              },
              {
                icon: '🌐',
                color: 'bg-teal-50 border-teal-100',
                iconBg: 'bg-teal-100 text-teal-600',
                title: '100% Browser-Native',
                desc: 'No app installation. Works on any smartphone with a basic internet connection. TTS reads every lesson aloud so Class 1–5 students learn independently.',
              },
            ].map(p => (
              <div key={p.title} className={`rounded-2xl border p-6 ${p.color}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${p.iconBg}`}>
                  {p.icon}
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{p.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Everyone in the loop */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3">The Full Loop</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900" style={{ fontFamily: 'Playfair Display, serif' }}>
              Everyone stays informed
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                role: 'Student',
                emoji: '🎮',
                color: 'from-teal-400 to-blue-500',
                points: [
                  'Learns through interactive moments, 3D models, and live equation sliders',
                  'Earns stars, unlocks themes — learning feels like a game',
                  'Zero to Hero: resets any chapter, no penalty, unlimited attempts',
                  'TTS bot reads every word aloud — perfect for pre-readers',
                ]
              },
              {
                role: 'Teacher',
                emoji: '📊',
                color: 'from-amber-400 to-orange-500',
                points: [
                  'Uploads daily quizzes and runs live leaderboards',
                  'Sees class-wide mastery heatmap updated in real time',
                  'Identifies weakest students per chapter instantly',
                  'NCF compliance report generated automatically',
                ]
              },
              {
                role: 'Parent',
                emoji: '👨‍👩‍👧',
                color: 'from-purple-400 to-pink-500',
                points: [
                  'Daily progress card: stars earned, chapters attempted, quiz scores',
                  'Mastery score per chapter — not just pass/fail',
                  'No more "I did my homework" guesswork',
                  'Reduces friction at home, fewer complaints to school',
                ]
              },
            ].map(r => (
              <div key={r.role} className="rounded-2xl border border-slate-100 overflow-hidden">
                <div className={`bg-gradient-to-r ${r.color} px-6 py-4 flex items-center gap-3`}>
                  <span className="text-2xl">{r.emoji}</span>
                  <span className="text-white font-bold text-lg">{r.role}</span>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {r.points.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="text-teal-500 mt-0.5 flex-shrink-0">✓</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA to demo */}
      <div className="py-8 px-6 bg-slate-50 border-t border-slate-100 text-center">
        <p className="text-slate-600 mb-4 font-medium">See what a real chapter feels like</p>
        <button
          onClick={scrollToDemo}
          className="px-8 py-4 rounded-2xl text-white font-bold text-base transition-all hover:shadow-lg hover:-translate-y-0.5"
          style={{ background: 'linear-gradient(135deg, #14B8A6, #3B82F6)' }}
        >
          Experience One Chapter →
        </button>
      </div>
    </section>
  );
}
