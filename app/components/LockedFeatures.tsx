'use client';

const features = [
  {
    title: 'Teacher Dashboard',
    subtitle: 'Mastery Heatmap',
    emoji: '🗺️',
    desc: 'See every student\'s mastery in teal, amber, and coral — updated live after each quiz.',
    bg: 'from-teal-400/20 to-blue-400/20',
    border: 'border-teal-200',
  },
  {
    title: 'Analytics',
    subtitle: 'Trend Graphs',
    emoji: '📈',
    desc: 'Track class performance over weeks and identify exactly when a concept wasn\'t understood.',
    bg: 'from-amber-400/20 to-orange-400/20',
    border: 'border-amber-200',
  },
  {
    title: 'Practice Mastery',
    subtitle: 'Per-Question Scoring',
    emoji: '🎯',
    desc: 'Mastery score calculated question by question — not just chapter averages.',
    bg: 'from-purple-400/20 to-pink-400/20',
    border: 'border-purple-200',
  },
  {
    title: 'Parent Dashboard',
    subtitle: 'Daily Progress',
    emoji: '👨‍👩‍👧',
    desc: 'Parents see stars earned, chapters completed, and quiz performance every day.',
    bg: 'from-green-400/20 to-teal-400/20',
    border: 'border-green-200',
  },
  {
    title: 'Ranked Leaderboards',
    subtitle: 'Live Competition',
    emoji: '🏆',
    desc: 'Three live leaderboards: quiz score, total stars, and overall mastery percentage.',
    bg: 'from-yellow-400/20 to-amber-400/20',
    border: 'border-yellow-200',
  },
];

export default function LockedFeatures() {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-teal-600 font-semibold text-sm uppercase tracking-widest mb-3">Full Platform</p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            There is a lot more inside
          </h2>
          <p className="text-slate-500 text-sm max-w-lg mx-auto">
            These features need live student data to demonstrate. Book a 30-minute session with your class.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(f => (
            <button
              key={f.title}
              onClick={scrollToContact}
              className={`text-left rounded-2xl border ${f.border} p-5 transition-all hover:-translate-y-1 hover:shadow-md group relative overflow-hidden`}
            >
              {/* Gradient bg */}
              <div className={`absolute inset-0 bg-gradient-to-br ${f.bg} opacity-50`} />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{f.emoji}</span>
                  <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-2.5 py-1 flex items-center gap-1.5">
                    <span className="text-slate-400 text-xs">🔒</span>
                    <span className="text-slate-500 text-xs font-medium">Demo only</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-base">{f.title}</h3>
                <p className="text-slate-500 text-xs mb-3 font-medium">{f.subtitle}</p>
                <p className="text-slate-600 text-xs leading-relaxed">{f.desc}</p>

                {/* Blurred preview placeholder */}
                <div className="mt-4 rounded-xl overflow-hidden bg-white/50 border border-white/80 h-20 flex items-center justify-center" style={{ filter: 'blur(0px)' }}>
                  <div className="flex gap-1.5">
                    {f.title === 'Teacher Dashboard' && (
                      <>
                        {['bg-teal-400','bg-teal-300','bg-amber-400','bg-teal-500','bg-coral-400','bg-teal-400'].map((c,i) => (
                          <div key={i} className={`${c} rounded w-7 h-8`} style={{ opacity: [0.9, 0.7, 1.0, 0.6, 0.8, 0.95][i] }} />
                        ))}
                      </>
                    )}
                    {f.title === 'Analytics' && (
                      <svg viewBox="0 0 120 50" className="w-28 h-14 opacity-40">
                        <polyline points="0,45 20,30 40,35 60,20 80,25 100,10 120,15" fill="none" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                    )}
                    {f.title === 'Practice Mastery' && (
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
                    {f.title === 'Ranked Leaderboards' && (
                      <div className="flex items-end gap-2">
                        <div className="w-6 h-10 bg-slate-300 rounded-t" />
                        <div className="w-6 h-14 bg-amber-400 rounded-t" />
                        <div className="w-6 h-8 bg-teal-300 rounded-t" />
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-teal-600 text-xs font-semibold mt-3 group-hover:underline">
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
