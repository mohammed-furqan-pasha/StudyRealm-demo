'use client';

import { Calendar, Mail, TrendingUp, Building2, Phone } from 'lucide-react';
import Image from 'next/image';

const CALENDLY_LINK = "https://calendly.com/studyrealmtechnologies";
const WHATSAPP_NUMBER = "919019588700";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'd like to know more about StudyRealm")}`;
const EMAIL_ADDRESS = "hello@studyrealm.app";

const isPlaceholder = (val: string) => val.includes("XXXXXXXXXX") || val.includes("your-calendly-link") || val.includes("your@email.com");

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

export default function ContactSection() {
  return (
    <section id="contact" className="min-h-[100dvh] md:h-[100dvh] overflow-y-auto md:overflow-hidden flex flex-col justify-between pt-8 pb-0 md:py-6 px-5 md:px-6 bg-slate-900 text-white snap-start">
      <div className="max-w-5xl mx-auto w-full flex flex-col h-full md:max-h-[95dvh] justify-between">
        
        {/* Top: Header */}
        <div className="text-center shrink-0">
          <div className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[10px] font-bold px-3 py-1.5 rounded-full mb-3 uppercase tracking-widest shadow-[0_0_15px_rgba(20,184,166,0.1)]">
            ✦ Innovation Partnership Program
          </div>
          <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
            Join our Term-1 Pilot
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-xs leading-relaxed hidden sm:block">
            An exclusive Term-1 Pilot for forward-thinking Karnataka schools.
            No commitment required — start with a free demo.
          </p>
        </div>

        {/* Middle-Top: 3 Action Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 shrink-0 md:shrink md:min-h-0 md:overflow-y-auto mt-5 md:mt-0">
          {/* Calendly - PRIMARY CTA */}
          <a
            href={isPlaceholder(CALENDLY_LINK) ? undefined : CALENDLY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`col-span-2 md:col-span-1 group flex flex-col justify-between h-full rounded-2xl bg-[#1e293b]/80 backdrop-blur-md border border-white/10 p-4 md:p-5 text-center transition-all shadow-2xl shadow-black/40 relative overflow-hidden shrink-0 ${isPlaceholder(CALENDLY_LINK) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:shadow-teal-900/30 hover:border-teal-500/50'}`}
          >
            {/* Subtle highlight gradient */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"></div>
            
            <div>
              <Calendar className="w-8 h-8 text-teal-400 mb-2 mx-auto opacity-90 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-bold text-white text-base md:text-lg mb-1">Book a Demo</h3>
              <p className="text-slate-400 text-[11px] mb-4">A 30-minute session for your class.</p>
            </div>
            <span className={`inline-block text-white text-[11px] md:text-xs font-bold px-4 py-2.5 rounded-full transition w-full shadow-lg ${isPlaceholder(CALENDLY_LINK) ? 'bg-slate-700' : 'bg-teal-600 hover:bg-teal-500'}`}>
              {isPlaceholder(CALENDLY_LINK) ? 'Coming soon' : 'Open Calendar →'}
            </span>
          </a>

          {/* WhatsApp - SECONDARY CTA */}
          <a
            href={isPlaceholder(WHATSAPP_LINK) ? undefined : WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col justify-between h-full rounded-2xl bg-[#1e293b]/60 backdrop-blur-md border border-white/5 p-3 md:p-5 text-center transition-all shadow-xl shadow-black/30 shrink-0 ${isPlaceholder(WHATSAPP_LINK) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:bg-[#1e293b]/80 hover:border-white/20'}`}
          >
            <div>
              <WhatsAppIcon className="w-6 h-6 md:w-8 md:h-8 text-slate-300 mb-1.5 md:mb-2 mx-auto opacity-80 group-hover:text-white transition-colors" />
              <h3 className="font-bold text-slate-100 text-[13px] md:text-lg mb-1.5 md:mb-1">WhatsApp</h3>
              <p className="hidden md:block text-slate-400 text-[11px] mb-4">Quick questions? We reply in 1 hour.<br/><span className="text-slate-300 font-semibold">{isPlaceholder(WHATSAPP_NUMBER) ? '+91 XXXXX XXXXX' : '+91 90195 88700'}</span></p>
            </div>
            <div>
              <span className={`inline-flex items-center justify-center text-slate-200 text-xs font-bold px-2 py-2 md:px-4 md:py-2.5 rounded-full transition w-full border border-white/10 ${isPlaceholder(WHATSAPP_LINK) ? 'bg-slate-800' : 'bg-white/5 hover:bg-white/10'}`}>
                {isPlaceholder(WHATSAPP_LINK) ? 'Coming soon' : 'Chat Now →'}
              </span>
            </div>
          </a>

          {/* Email - SECONDARY CTA */}
          <a
            href={isPlaceholder(EMAIL_ADDRESS) ? undefined : `mailto:${EMAIL_ADDRESS}`}
            className={`group flex flex-col justify-between h-full rounded-2xl bg-[#1e293b]/60 backdrop-blur-md border border-white/5 p-3 md:p-5 text-center transition-all shadow-xl shadow-black/30 shrink-0 ${isPlaceholder(EMAIL_ADDRESS) ? 'opacity-50 cursor-not-allowed' : 'hover:-translate-y-1 hover:bg-[#1e293b]/80 hover:border-white/20'}`}
          >
            <div>
              <Mail className="w-6 h-6 md:w-8 md:h-8 text-slate-300 mb-1.5 md:mb-2 mx-auto opacity-80 group-hover:text-white transition-colors" />
              <h3 className="font-bold text-slate-100 text-[13px] md:text-lg mb-1.5 md:mb-1">Email Us</h3>
              <p className="hidden md:block text-slate-400 text-[11px] mb-4">For proposals and partnerships.</p>
            </div>
            <span className={`inline-flex items-center justify-center text-slate-200 text-xs font-bold px-2 py-2 md:px-4 md:py-2.5 rounded-full transition w-full border border-white/10 truncate ${isPlaceholder(EMAIL_ADDRESS) ? 'bg-slate-800' : 'bg-white/5 hover:bg-white/10'}`}>
              {isPlaceholder(EMAIL_ADDRESS) ? 'Coming soon' : 'Email →'}
            </span>
          </a>
        </div>

        {/* Middle-Bottom: 3 Value Proposition Columns */}
        <div className="shrink-0 mt-6 md:mt-0">
          <div className="text-center mb-4 md:mb-6">
            <h3 className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">Why Schools Say Yes</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 md:gap-10">
            {[
              { icon: <TrendingUp className="w-5 h-5 md:w-8 md:h-8 text-teal-400/80 mb-1.5 md:mb-3 shrink-0" />, title: "Boost Board Results", desc: "Mastery-first learning builds retention." },
              { icon: <Building2 className="w-5 h-5 md:w-8 md:h-8 text-teal-400/80 mb-1.5 md:mb-3 shrink-0" />, title: "Drive Admissions", desc: "A premium tech-stack attracts parents." },
              { icon: <Phone className="w-5 h-5 md:w-8 md:h-8 text-teal-400/80 mb-1.5 md:mb-3 shrink-0" />, title: "Fewer Complaints", desc: "Daily visibility removes guesswork." },
            ].map(r => (
              <div key={r.title} className="flex flex-col items-center md:items-start text-center md:text-left py-1.5 md:py-0 gap-0">
                {r.icon}
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-slate-200 font-bold text-xs md:text-base md:mb-1.5 leading-tight">{r.title}</span>
                  <span className="hidden md:block text-slate-400 text-sm leading-relaxed">{r.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Footer */}
        <div className="pt-6 md:pt-4 mt-6 md:mt-0 pb-28 md:pb-0 flex flex-col md:grid md:grid-cols-3 gap-3 md:gap-4 text-[9px] md:text-[11px] text-slate-500 shrink-0 border-t border-white/10">
          {/* Column 1: Company Info */}
          <div className="order-3 md:order-1 flex flex-col gap-1 md:items-start items-center">
            <div className="flex items-center gap-1.5 opacity-80">
              <Image src="/logo.png" alt="StudyRealm Logo" width={16} height={16} className="h-4 w-auto object-contain" />
              <span className="font-semibold text-slate-500">StudyRealm Technologies</span>
            </div>
            <span className="text-center md:text-left opacity-70">MSME Udyam Registered • Bangalore, Karnataka</span>
          </div>

          {/* Column 2: Platform Links */}
          <div className="order-1 md:order-2 flex flex-row md:flex-col gap-4 md:gap-1.5 justify-center md:justify-start items-center md:items-start opacity-70 text-slate-400 md:text-slate-500 text-sm md:text-[11px]">
            <h4 className="hidden md:block font-bold text-[9px] uppercase tracking-wider mb-0.5">Platform</h4>
            <a href="https://studyrealm.app" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">Main Website</a>
            <a href="https://studyrealm.app/support" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">Support & Help</a>
          </div>

          {/* Column 3: Legal & Trust */}
          <div className="order-2 md:order-3 flex flex-row md:flex-col gap-4 md:gap-1.5 justify-center md:justify-start items-center md:items-start opacity-70 text-slate-400 md:text-slate-500 text-sm md:text-[11px]">
            <h4 className="hidden md:block font-bold text-[9px] uppercase tracking-wider mb-0.5">Legal & Trust</h4>
            <a href="https://studyrealm.app/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">Privacy Policy</a>
            <a href="https://studyrealm.app/terms" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </section>
  );
}
