'use client';

import { useState } from 'react';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Users, 
  Trophy, 
  Lock, 
  type LucideIcon
} from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  desc: string;
  imgSrc?: string;
}

const features: Feature[] = [
  {
    id: 'teacher-dashboard',
    title: 'Teacher Dashboard',
    subtitle: 'Class Overview',
    icon: LayoutDashboard,
    desc: "See every student's progress at a glance — green, yellow, or red — updated live after every quiz.",
    imgSrc: '/img/teacher-dashboard.png',
  },
  {
    id: 'progress-time',
    title: 'Progress Over Time',
    subtitle: 'Weekly Trends',
    icon: TrendingUp,
    desc: 'See how your class is improving week by week, and catch problems early — before the exam.',
    imgSrc: '/img/teacher-analytics.png',
  },

  {
    id: 'parent-dashboard',
    title: 'Parent Dashboard',
    subtitle: 'Daily Updates',
    icon: Users,
    desc: 'Parents see stars earned, chapters completed, and how their child is doing — every day, in plain language.',
    imgSrc: '/img/parent-dashboard.png',
  },
  {
    id: 'friendly-competition',
    title: 'Friendly Competition',
    subtitle: 'Class Leaderboard',
    icon: Trophy,
    desc: "Students can see how they're doing compared to classmates — a fun way to stay motivated to practice.",
  },

];

export default function LockedFeatures() {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section className="min-h-svh lg:min-h-[100dvh] lg:h-auto overflow-visible lg:overflow-visible flex flex-col justify-center items-center px-4 md:px-6 bg-slate-50 border-t border-slate-100 w-full pt-20 pb-28 lg:pt-8 lg:pb-8">
      <div className="max-w-6xl mx-auto w-full flex flex-col lg:h-auto justify-center lg:max-h-none">
        {/* Header */}
        <div className="text-center mb-4 lg:mb-5 shrink-0">
          <p className="text-teal-600 font-semibold text-xs md:text-sm uppercase tracking-widest mb-1 md:mb-2">
            Full Platform
          </p>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 md:mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Powerful Tools for Teachers and Management
          </h2>
          <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
            These features need live classroom data. Tell us about your school and we&apos;ll show them to you in a free demo.
          </p>
        </div>

        {/* Desktop: Interactive Feature Panel */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-8 lg:items-stretch items-start shrink min-h-0">
          {/* Left: List of features */}
          <div className="col-span-5 flex flex-col gap-2 shrink overflow-hidden h-full">
            {features.map((f, idx) => (
              <button 
                key={f.id}
                onClick={() => setActiveFeature(idx)}
                className={`text-left p-3 lg:py-2 lg:px-3 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                  activeFeature === idx 
                    ? 'bg-white border-teal-500 shadow-md ring-1 ring-teal-500' 
                    : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'
                }`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${activeFeature === idx ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-500'}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm md:text-base">
                    {f.title} <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </h3>
                  <p className="text-xs font-medium text-slate-500">{f.subtitle}</p>
                  {activeFeature === idx && (
                    <p className="text-xs text-slate-600 leading-relaxed mt-1 animate-in fade-in slide-in-from-top-1 hidden xl:block">
                      {f.desc}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Right: Large Mockup Panel */}
          <div className="col-span-7 h-full flex flex-col justify-center lg:self-stretch">
            <div key={activeFeature} className="w-full lg:h-full rounded-2xl overflow-hidden border border-slate-200 shadow-xl relative bg-slate-100 group flex flex-col justify-center items-center">
              {features[activeFeature].imgSrc && (
                <Image 
                  src={features[activeFeature].imgSrc}
                  alt={features[activeFeature].title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              )}

              {/* Frosted overlay */}
              <div className="absolute inset-0 backdrop-blur-md bg-white/30 flex flex-col items-center justify-center transition-all duration-500 group-hover:backdrop-blur-sm group-hover:bg-white/10">
                <div className="bg-white/95 shadow-lg shadow-slate-400/20 rounded-3xl p-6 flex flex-col items-center max-w-sm text-center transform transition-all group-hover:scale-105 mx-4">
                  <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-teal-600" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{features[activeFeature].title}</h4>
                  <p className="text-sm text-slate-500">{features[activeFeature].desc}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Static List Layout */}
        <div className="lg:hidden flex flex-col gap-2 shrink overflow-visible w-full">
          {features.map((f, idx) => {
            return (
              <div 
                key={f.id} 
                className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden shrink-0 ${idx >= 4 ? 'hidden lg:block' : ''}`}
              >
                <div className="w-full text-left px-4 py-3 lg:px-4 flex flex-col">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg shrink-0 bg-teal-50 text-teal-600">
                      <f.icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="font-bold text-slate-900 text-sm md:text-base flex items-center gap-1.5">
                        {f.title} <Lock className="w-3 h-3 text-slate-400" />
                      </h3>
                      <p className="hidden lg:block text-xs md:text-sm text-slate-600 mt-0.5 leading-snug">{f.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="hidden">
                  <div className="px-3 md:px-4 pb-3 md:pb-4 animate-in slide-in-from-top-2">
                    <p className="text-xs md:text-sm text-slate-600 mb-3">{f.desc}</p>
                    
                    {/* Mobile Mockup */}
                    <div className="w-full aspect-video rounded-lg overflow-hidden relative border border-slate-200 bg-white group">
                      {f.imgSrc && (
                        <Image 
                          src={f.imgSrc}
                          alt={f.title}
                          fill
                          sizes="(max-width: 768px) 90vw, 100vw"
                          className="object-cover object-top"
                        />
                      )}
                      
                      {/* Frosted overlay mobile */}
                      <div className="absolute inset-0 backdrop-blur-md bg-white/30 flex flex-col items-center justify-center">
                        <div className="bg-white/95 shadow-lg rounded-xl p-3 md:p-4 text-center mx-4 flex flex-col items-center max-w-[250px]">
                          <Lock className="w-4 h-4 md:w-5 md:h-5 text-teal-600 mb-1.5" />
                          <span className="text-xs md:text-sm font-bold text-slate-800 mb-1">Locked Feature</span>
                          <span className="text-[10px] md:text-xs text-slate-500">Live data required</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Unified CTA */}
        <div className="mt-5 lg:mt-8 flex justify-center shrink-0 static lg:relative lg:z-10">
          <button 
            onClick={() => document.getElementById('survey')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full lg:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm md:text-base px-8 py-3 rounded-full shadow-lg hover:shadow-teal-600/20 transition-all transform hover:-translate-y-1"
          >
            Take the Quick Survey →
          </button>
        </div>
      </div>
    </section>
  );
}

