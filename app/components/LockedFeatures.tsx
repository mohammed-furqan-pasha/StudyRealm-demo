'use client';

const features = [
  {
    title: 'Teacher Dashboard',
    subtitle: 'Class Overview',
    emoji: '🗺️',
    desc: "See every student's progress at a glance — green, yellow, or red — updated live after every quiz.",
    bg: 'from-teal-400/20 to-blue-400/20',
    border: 'border-teal-200',
  },
  {
    title: 'Progress Over Time',
    subtitle: 'Weekly Trends',
    emoji: '📈',
    desc: 'See how your class is improving week by week, and catch problems early — before the exam.',
    bg: 'from-amber-400/20 to-orange-400/20',
    border: 'border-amber-200',
  },
  {
    title: 'Question-Level Detail',
    subtitle: 'Where Students Get Stuck',
    emoji: '🎯',
    desc: 'See exactly which question or topic a student is struggling with — not just an overall grade.',
    bg: 'from-purple-400/20 to-pink-400/20',
    border: 'border-purple-200',
  },
  {
    title: 'Parent Dashboard',
    subtitle: 'Daily Updates',
    emoji: '👨‍👩‍👧',
    desc: 'Parents see stars earned, chapters completed, and how their child is doing — every day, in plain language.',
    bg: 'from-green-400/20 to-teal-400/20',
    border: 'border-green-200',
  },
  {
    title: 'Friendly Competition',
    subtitle: 'Class Leaderboard',
    emoji: '🏆',
    desc: "Students can see how they're doing compared to classmates — a fun way to stay motivated to practice.",
    bg: 'from-yellow-400/20 to-amber-400/20',
    border: 'border-yellow-200',
  },
  {
    title: 'Attendance & Class Diary',
    subtitle: 'Daily Teacher Tools',
    emoji: '📝',
    desc: 'Quickly mark daily attendance and share notes with parents — all in one place.',
    bg: 'from-blue-400/20 to-indigo-400/20',
    border: 'border-blue-200',
  },
];

export default function LockedFeatures() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="min-h-screen flex flex-col justify-center py-6 md:py-10 px-4 md:px-6 bg-white">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-6 md:mb-8">
          <p className="text-teal-600 font-semibold text-xs md:text-sm uppercase tracking-widest mb-2 md:mb-3">Full Platform</p>
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            There is a lot more inside
          </h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            These need a real class to show properly. Book a free 30-minute demo and we'll show you live.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {features.map(f => (
            <button
              key={f.title}
              onClick={scrollToContact}
              className={`text-left rounded-2xl border ${f.border} p-3 md:p-4 transition-all hover:-translate-y-1 hover:shadow-md group relative overflow-hidden`}
            >
              {/* Gradient bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.bg} opacity-50`} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-1 md:mb-2">
                  <span className="text-lg md:text-2xl">{f.emoji}</span>
                  <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                    <span className="text-slate-400 text-xs">🔒</span>
                    <span className="text-slate-500 text-xs font-medium">Demo only</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-sm md:text-base">{f.title}</h3>
                <p className="text-slate-500 text-[10px] md:text-xs mb-1 md:mb-2 font-medium">{f.subtitle}</p>
                <p className="text-slate-600 text-[10px] md:text-xs leading-relaxed line-clamp-2">{f.desc}</p>

                {/* Blurred preview placeholder */}
                <div className="mt-2 md:mt-3 rounded-xl overflow-hidden bg-white/50 border border-white/80 h-12 md:h-14 flex items-center justify-center" style={{ filter: 'blur(0px)' }}>
                  <div className="flex gap-1.5 transform scale-90">
                    {f.title === 'Teacher Dashboard' && (
                      <>
                        {['bg-teal-400','bg-teal-300','bg-amber-400','bg-teal-500','bg-coral-400','bg-teal-400'].map((c,i) => (
                          <div key={i} className={`${c} rounded w-7 h-8`} style={{ opacity: [0.9, 0.7, 1.0, 0.6, 0.8, 0.95][i] }} />
                        ))}
                      </>
                    )}
                    {f.title === 'Progress Over Time' && (
                      <svg viewBox="0 0 120 50" className="w-28 h-14 opacity-40">
                        <polyline points="0,45 20,30 40,35 60,20 80,25 100,10 120,15" fill="none" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    )}
                    {f.title === 'Question-Level Detail' && (
                      <div className="flex items-end gap-1.5">
                        {[60,80,45,90,70].map((h,i) => (
                          <div key={i} className="w-5 bg-teal-400 rounded-t" style={{ height: h*0.5, opacity: 0.6 }} />
                        ))}
                      </div>
                    )}
                    {f.title === 'Parent Dashboard' && (
                      <div className="flex flex-col gap-1.5 w-28">
                        {['bg-teal-200','bg-amber-200','bg-teal-300'].map((c,i) => (
                          <div key={i} className={`${c} h-3 rounded-full`} style={{ width: `${[70,50,85][i]}%`, opacity: 0.7 }} />
                        ))}
                      </div>
                    )}
                    {f.title === 'Friendly Competition' && (
                      <div className="flex items-end gap-2">
                        <div className="w-6 h-10 bg-slate-300 rounded-t" />
                        <div className="w-6 h-14 bg-amber-400 rounded-t" />
                        <div className="w-6 h-8 bg-teal-300 rounded-t" />
                      </div>
                    )}
                    {f.title === 'Attendance & Class Diary' && (
                      <div className="flex gap-4 items-center">
                        <div className="flex flex-wrap gap-1 w-8">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`w-3 h-3 rounded-sm ${i === 3 ? 'bg-slate-300' : 'bg-blue-400'}`} />
                          ))}
                        </div>
                        <div className="flex flex-col gap-1.5 w-16">
                          <div className="h-2 bg-blue-300 rounded-full w-full" />
                          <div className="h-2 bg-indigo-300 rounded-full w-3/4" />
                          <div className="h-2 bg-blue-300 rounded-full w-4/5" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-teal-600 text-[10px] font-semibold mt-2 group-hover:underline">
                  Live student data required → Book a demo
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
