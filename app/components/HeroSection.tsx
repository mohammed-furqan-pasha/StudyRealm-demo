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
          <a href="https://studyrealm.app" target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 transition">Main Website</a>
          <a href="#contact" className="hover:text-teal-600 transition">Contact</a>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full font-medium">MSME · Govt. of India</span>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-4 py-2 rounded-full mb-8">
          <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></span>
          Karnataka&apos;s LKG-10 EdTech Platform · CBSE · ICSE · State Board
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
          Every student learns.<br />
          <span className="bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
            Every teacher sees it.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
          Fun lessons kids love, simple progress updates for teachers and parents,
          and lessons that follow India's latest school guidelines — all inside a
          website. No app to download.
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
            { n: 'LKG - Class 10', label: 'All Grades' },
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
                title: 'Follows the Latest Curriculum',
                desc: "Every lesson is built to match NCF 2023, India's newest school guidelines — so teachers don't have to check this themselves.",
              },
              {
                icon: '🗺️',
                color: 'bg-amber-50 border-amber-100',
                iconBg: 'bg-amber-100 text-amber-600',
                title: 'See Who Needs Help, Instantly',
                desc: 'Teachers can see which students are doing well and which ones need extra help — shown in simple colors, updated as students practice.',
              },
              {
                icon: '🌐',
                color: 'bg-teal-50 border-teal-100',
                iconBg: 'bg-teal-100 text-teal-600',
                title: 'Works on Any Phone',
                desc: "No app to install. Works on any smartphone with basic internet. Lessons are read aloud, so even young children who can't read yet can learn on their own.",
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
                  'Learns through stories, pictures, and games',
                  'Earns stars and rewards — learning feels like play',
                  'Can try a chapter again as many times as needed, with no penalty',
                  "Everything is read aloud, so reading isn't a barrier",
                ]
              },
              {
                role: 'Teacher',
                emoji: '📊',
                color: 'from-amber-400 to-orange-500',
                points: [
                  'Puts up quizzes and runs friendly class competitions',
                  'Sees which students are doing well and who needs help',
                  'Knows who needs extra attention before the exam, not after',
                  'Gets curriculum reports automatically — no extra paperwork',
                ]
              },
              {
                role: 'Parent',
                emoji: '👨‍👩‍👧',
                color: 'from-purple-400 to-pink-500',
                points: [
                  'Gets a simple daily update on what their child learned',
                  'Sees real progress, not just pass or fail',
                  'No more guessing whether homework actually got done',
                  'Fewer surprises, less back-and-forth with the school',
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
