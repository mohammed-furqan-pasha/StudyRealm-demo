'use client';

const CALENDLY_LINK = "https://calendly.com/studyrealmtechnologies";
const WHATSAPP_NUMBER = "919019588700";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi, I'd like to know more about StudyRealm")}`;
const EMAIL_ADDRESS = "hello@studyrealm.app";

const isPlaceholder = (val: string) => val.includes("XXXXXXXXXX") || val.includes("your-calendly-link") || val.includes("your@email.com");

export default function ContactSection() {
  return (
    <section id="contact" className="py-20 px-6 bg-slate-900 text-white">
      <div className="max-w-4xl mx-auto">
        {/* Innovation Partnership badge */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest">
            ✦ Innovation Partnership Program
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Join our Term-1 Pilot
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
            We are selecting a limited number of forward-thinking schools in Karnataka for our pilot phase.
            No commitment required — start with a 30-minute demo with your class.
          </p>
        </div>

        {/* 3 contact options */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {/* Calendly */}
          <a
            href={isPlaceholder(CALENDLY_LINK) ? undefined : CALENDLY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`group rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-all ${isPlaceholder(CALENDLY_LINK) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl hover:border-teal-500/40'}`}
          >
            <div className="text-3xl mb-3">📅</div>
            <h3 className="font-bold text-white text-base mb-1">Book a Demo</h3>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">30 minutes, your school, your class. We come to you.</p>
            <span className={`inline-block text-white text-xs font-bold px-4 py-2 rounded-full transition ${isPlaceholder(CALENDLY_LINK) ? 'bg-slate-600' : 'bg-teal-500 group-hover:bg-teal-400'}`}>
              {isPlaceholder(CALENDLY_LINK) ? 'Coming soon' : 'Open Calendar →'}
            </span>
          </a>

          {/* WhatsApp */}
          <a
            href={isPlaceholder(WHATSAPP_LINK) ? undefined : WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className={`group rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-all ${isPlaceholder(WHATSAPP_LINK) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl hover:border-green-500/40'}`}
          >
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-bold text-white text-base mb-1">WhatsApp Us</h3>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">Quick questions? We respond within the hour on business days.</p>
            <span className={`inline-block text-white text-xs font-bold px-4 py-2 rounded-full transition ${isPlaceholder(WHATSAPP_LINK) ? 'bg-slate-600' : 'bg-green-500 group-hover:bg-green-400'}`}>
              {isPlaceholder(WHATSAPP_LINK) ? 'Coming soon' : 'Chat Now →'}
            </span>
            <p className="text-sm text-gray-400 mt-2">{isPlaceholder(WHATSAPP_NUMBER) ? '+91 XXXXX XXXXX' : '+91 90195 88700'}</p>
          </a>

          {/* Email */}
          <a
            href={isPlaceholder(EMAIL_ADDRESS) ? undefined : `mailto:${EMAIL_ADDRESS}`}
            className={`group rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-all ${isPlaceholder(EMAIL_ADDRESS) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/40'}`}
          >
            <div className="text-3xl mb-3">✉️</div>
            <h3 className="font-bold text-white text-base mb-1">Send an Email</h3>
            <p className="text-slate-400 text-xs mb-4 leading-relaxed">For formal proposals, pricing enquiries, and partnership discussions.</p>
            <span className={`inline-block text-white text-xs font-bold px-4 py-2 rounded-full transition ${isPlaceholder(EMAIL_ADDRESS) ? 'bg-slate-600' : 'bg-blue-500 group-hover:bg-blue-400'}`}>
              {isPlaceholder(EMAIL_ADDRESS) ? 'Coming soon' : `${EMAIL_ADDRESS} →`}
            </span>
          </a>
        </div>

        {/* Why schools partner */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-10">
          <h3 className="font-bold text-white text-base mb-4 text-center">Why school management says yes</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            {[
              { icon: '📈', text: 'Better board results: mastery-first learning builds retention' },
              { icon: '🏫', text: 'More admissions: parents talk when their children actually enjoy studying' },
              { icon: '☎️', text: 'Fewer parent complaints: daily progress visibility removes the "what did you do today" guesswork' },
            ].map(r => (
              <div key={r.text} className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">{r.icon}</span>
                <p className="text-slate-400 text-xs leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer strip */}
        <div className="border-t border-white/10 pt-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-slate-400">
          {/* Column 1: Company Info */}
          <div className="flex flex-col gap-2 md:items-start items-center">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="font-semibold text-slate-300 text-sm">StudyRealm Technologies</span>
            </div>
            <span className="text-center md:text-left">MSME Udyam Registered • Bangalore, Karnataka</span>
          </div>

          {/* Column 2: Platform Links */}
          <div className="flex flex-col gap-2 md:items-start items-center">
            <h4 className="font-semibold text-slate-300 text-sm mb-1">Platform</h4>
            <a href="https://studyrealm.app" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">Main Website</a>
            <a href="https://studyrealm.app/support" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">Support & Help</a>
          </div>

          {/* Column 3: Legal & Trust */}
          <div className="flex flex-col gap-2 md:items-start items-center">
            <h4 className="font-semibold text-slate-300 text-sm mb-1">Legal & Trust</h4>
            <a href="https://studyrealm.app/privacy" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">Privacy Policy</a>
            <a href="https://studyrealm.app/terms" target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition-colors">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </section>
  );
}
