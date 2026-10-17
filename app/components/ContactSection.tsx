'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Calendar,
  Mail,
  TrendingUp,
  Building2,
  Phone,
  Share2,
  Star,
  MessageCircle,
  ArrowRight,
} from 'lucide-react';
import { m, useReducedMotion } from 'motion/react';
import SceneShell, { SplitHeadline, StageReveal, DesktopTreeScope } from './SceneShell';
import TopBar from './TopBar';
import { usePageState } from './PageFlow';
import { TIME_SCALE } from '../lib/stageScenes';

export const MOBILE_CONTACT_FLASH_DELAY_OFFSET = 0.7 * TIME_SCALE;
export const MOBILE_CONTACT_FLASH_DURATION = 0.9 * TIME_SCALE;
export const MOBILE_CONTACT_FLASH_PEAK = 0.3;
import { ROLE_CONFIGS } from '../data/roleConfig';
import { RoleConfig, RoleKey } from '../types';

const CALENDLY_LINK = 'https://calendly.com/studyrealmtechnologies';
const WHATSAPP_NUMBER = '919019588700';
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi, I'd like to know more about StudyRealm"
)}`;
const EMAIL_ADDRESS = 'hello@studyrealm.app';

const isPlaceholder = (val: string) =>
  val.includes('XXXXXXXXXX') || val.includes('your-calendly-link') || val.includes('your@email.com');

const CARD_BASE_STYLE: React.CSSProperties = {
  borderRadius: '20px',
  background: 'linear-gradient(180deg, rgba(10,40,58,0.85), rgba(6,22,38,0.90))',
  border: '1px solid rgba(94,234,212,0.30)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 20px rgba(0,0,0,0.35)',
  padding: '18px',
};

const CARD_HIGHLIGHTED_STYLE: React.CSSProperties = {
  borderRadius: '20px',
  background:
    'linear-gradient(180deg, rgba(20,184,166,0.16), rgba(20,184,166,0.16)), linear-gradient(180deg, rgba(10,40,58,0.85), rgba(6,22,38,0.90))',
  border: '1px solid rgba(94,234,212,0.60)',
  boxShadow:
    'inset 0 1px 0 rgba(255,255,255,0.22), 0 -6px 24px -8px rgba(45,212,191,0.35), 0 4px 20px rgba(0,0,0,0.35)',
  padding: '18px',
};

export interface ContactSectionProps {
  config?: RoleConfig['contact'];
  role?: RoleKey;
  share?: RoleConfig['share'];
}

export default function ContactSection({
  config: propConfig,
  role: propRole,
  share: propShare,
}: ContactSectionProps) {
  const role = propRole || 'Other';
  const config = propConfig || ROLE_CONFIGS[role]?.contact || ROLE_CONFIGS.Other.contact;
  const share = propShare || ROLE_CONFIGS[role]?.share || ROLE_CONFIGS.Other.share;

  const { isCurrent = true, isLeaving = false, transitionId = 0, textDelayMs = 250 } = usePageState();
  const shouldReduceMotion = useReducedMotion();

  const isStudent = role === 'Student';
  const isSharePrimary = config.primary === 'share';

  const buttonBlockDelay =
    (textDelayMs ?? 250) / 1000 + 0.1 * TIME_SCALE + 3 * (0.1 * TIME_SCALE);
  const flashDelay = buttonBlockDelay + MOBILE_CONTACT_FLASH_DELAY_OFFSET;

  const mobileFlashOverlay =
    isCurrent && !isLeaving && !shouldReduceMotion ? (
      <m.span
        key={`contact-flash-t${transitionId}`}
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-white pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, MOBILE_CONTACT_FLASH_PEAK, 0] }}
        transition={{
          duration: MOBILE_CONTACT_FLASH_DURATION,
          delay: flashDelay,
          ease: [0.22, 1, 0.36, 1] as const,
        }}
      />
    ) : null;

  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const handleStudentShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'StudyRealm', text: share.message });
        return;
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(share.message);
        setCopied(true);
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => {
          setCopied(false);
        }, 4000);
      } catch {
        // clipboard fallback error
      }
    }
  };

  const shareLink = `https://wa.me/?text=${encodeURIComponent(share.message)}`;

  const calendlyDesc =
    role === 'Teacher'
      ? 'A 30-minute session you can bring your principal to.'
      : role === 'Parent'
      ? "A 30-minute session your child's school can book."
      : "A 30-minute session for your school's team.";

  const emailDesc =
    role === 'Teacher' || role === 'Parent'
      ? 'Questions about StudyRealm?'
      : 'For proposals and partnerships.';

  const calendlyCard = (isHighlighted: boolean) => (
    <a
      key="calendly"
      href={isPlaceholder(CALENDLY_LINK) ? undefined : CALENDLY_LINK}
      target="_blank"
      rel="noopener noreferrer"
      style={isHighlighted ? CARD_HIGHLIGHTED_STYLE : CARD_BASE_STYLE}
      className="group flex flex-col justify-between h-full text-center transition-all duration-200 select-none hover:translate-y-[-2px]"
    >
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 mb-2 flex items-center justify-center">
          <Calendar
            className={`w-7 h-7 transition-colors ${
              isHighlighted ? 'text-teal-300' : 'text-slate-300 group-hover:text-white'
            }`}
          />
        </div>
        <h3 className="font-bold text-white text-[15px] sm:text-[16px] leading-snug mb-1 text-balance">
          Book a Demo
        </h3>
        <p className="text-slate-300 text-[12px] leading-relaxed mb-3">
          {calendlyDesc}
        </p>
      </div>
      <span
        className={`h-[44px] w-full rounded-xl font-bold text-xs sm:text-[13px] flex items-center justify-center transition shrink-0 ${
          isHighlighted
            ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-md shadow-teal-500/25'
            : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
        }`}
      >
        Open Calendar →
      </span>
    </a>
  );

  const shareCard = (isHighlighted: boolean) => (
    <a
      key="share"
      href={shareLink}
      target="_blank"
      rel="noopener noreferrer"
      style={isHighlighted ? CARD_HIGHLIGHTED_STYLE : CARD_BASE_STYLE}
      className="group flex flex-col justify-between h-full text-center transition-all duration-200 select-none hover:translate-y-[-2px]"
    >
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 mb-2 flex items-center justify-center">
          <Share2
            className={`w-7 h-7 transition-colors ${
              isHighlighted ? 'text-teal-300' : 'text-slate-300 group-hover:text-white'
            }`}
          />
        </div>
        <h3 className="font-bold text-white text-[15px] sm:text-[16px] leading-snug mb-1 text-balance">
          {share.label}
        </h3>
        <p className="text-slate-300 text-[12px] leading-relaxed mb-3">
          Forward via WhatsApp in 1 tap.
        </p>
      </div>
      <span
        className={`h-[44px] w-full rounded-xl font-bold text-xs sm:text-[13px] flex items-center justify-center transition shrink-0 ${
          isHighlighted
            ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-md shadow-teal-500/25'
            : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
        }`}
      >
        Share on WhatsApp →
      </span>
    </a>
  );

  const whatsappCard = (isHighlighted = false) => (
    <a
      key="whatsapp"
      href={isPlaceholder(WHATSAPP_LINK) ? undefined : WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      style={isHighlighted ? CARD_HIGHLIGHTED_STYLE : CARD_BASE_STYLE}
      className="group flex flex-col justify-between h-full text-center transition-all duration-200 select-none hover:translate-y-[-2px]"
    >
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 mb-2 flex items-center justify-center">
          <MessageCircle
            className={`w-7 h-7 transition-colors ${
              isHighlighted ? 'text-teal-300' : 'text-slate-300 group-hover:text-white'
            }`}
          />
        </div>
        <h3 className="font-bold text-white text-[15px] sm:text-[16px] leading-snug mb-1 text-balance">
          WhatsApp
        </h3>
        <p className="text-slate-300 text-[12px] leading-relaxed mb-3">
          Quick questions? We reply in 1 hr.
          <br />
          <span className="text-teal-300 font-semibold">+91 90195 88700</span>
        </p>
      </div>
      <span
        className={`h-[44px] w-full rounded-xl font-bold text-xs sm:text-[13px] flex items-center justify-center transition shrink-0 ${
          isHighlighted
            ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-md shadow-teal-500/25'
            : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
        }`}
      >
        Chat Now →
      </span>
    </a>
  );

  const emailCard = (isHighlighted = false) => (
    <a
      key="email"
      href={isPlaceholder(EMAIL_ADDRESS) ? undefined : `mailto:${EMAIL_ADDRESS}`}
      style={isHighlighted ? CARD_HIGHLIGHTED_STYLE : CARD_BASE_STYLE}
      className="group flex flex-col justify-between h-full text-center transition-all duration-200 select-none hover:translate-y-[-2px]"
    >
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 mb-2 flex items-center justify-center">
          <Mail
            className={`w-7 h-7 transition-colors ${
              isHighlighted ? 'text-teal-300' : 'text-slate-300 group-hover:text-white'
            }`}
          />
        </div>
        <h3 className="font-bold text-white text-[15px] sm:text-[16px] leading-snug mb-1 text-balance">
          Email Us
        </h3>
        <p className="text-slate-300 text-[12px] leading-relaxed mb-3">
          {emailDesc}
          <br />
          <span className="text-slate-300 font-semibold">{EMAIL_ADDRESS}</span>
        </p>
      </div>
      <span
        className={`h-[44px] w-full rounded-xl font-bold text-xs sm:text-[13px] flex items-center justify-center transition shrink-0 ${
          isHighlighted
            ? 'bg-teal-500 hover:bg-teal-400 text-white shadow-md shadow-teal-500/25'
            : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
        }`}
      >
        Email →
      </span>
    </a>
  );

  const studentShareCard = () => (
    <div
      key="student-share"
      style={CARD_HIGHLIGHTED_STYLE}
      className="flex flex-col justify-between h-full text-center transition-all duration-200 select-none"
    >
      <div className="flex flex-col items-center">
        <div className="w-7 h-7 mb-2 flex items-center justify-center">
          <Share2 className="w-7 h-7 text-teal-300" />
        </div>
        <h3 className="font-bold text-white text-[15px] sm:text-[16px] leading-snug mb-1 text-balance">
          {share.label}
        </h3>
        <p className="text-slate-300 text-[12px] leading-relaxed mb-3">
          Share your progress with parents or teachers.
        </p>
      </div>
      <div className="flex flex-col items-center gap-1.5 w-full">
        <button
          type="button"
          onClick={handleStudentShare}
          className="h-[44px] w-full rounded-xl font-bold text-xs sm:text-[13px] flex items-center justify-center gap-2 transition shrink-0 bg-teal-500 hover:bg-teal-400 text-white shadow-md shadow-teal-500/25 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
        >
          <Share2 className="w-4 h-4 shrink-0" />
          <span>Share</span>
        </button>
        {copied && (
          <p
            aria-live="polite"
            className="text-teal-300 text-xs font-semibold mt-1"
          >
            Copied! Paste it to your parent or teacher.
          </p>
        )}
      </div>
    </div>
  );

  // Standard 4-card ordering based on primary action
  const standardActionCards = isSharePrimary
    ? [shareCard(true), calendlyCard(false), whatsappCard(), emailCard()]
    : [calendlyCard(true), whatsappCard(), emailCard(), shareCard(false)];

  return (
    <SceneShell scene="contact">
      {/* Static Dawn Glow Overlay */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 45% at 50% 108%, rgba(255,150,70,0.50) 0%, rgba(214,86,66,0.22) 42%, transparent 72%)',
        }}
        aria-hidden="true"
      />

      {/* Static Top Veil Overlay */}
      <div
        className="absolute inset-0 pointer-events-none select-none z-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(3,8,18,0.55) 0%, rgba(3,8,18,0.15) 55%, transparent 100%)',
        }}
        aria-hidden="true"
      />

      {/* Nav / Top Bar */}
      <TopBar />

      {/* Main Content Container: Vertically Centered in Free Area */}
      <div
        className="relative z-10 w-full flex-1 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-2 pb-6 md:py-4 my-auto flex flex-col justify-center text-left"
        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
      >
        {/* Top: Header */}
        <div className="text-center shrink-0 mb-4 md:mb-5 flex flex-col items-center">
          <StageReveal order={0} className="w-full text-center">
            <p className="uppercase tracking-[0.2em] text-[12px] md:text-[length:calc(13*var(--u))] text-white/80 font-medium mb-1.5 md:mb-2 text-center select-none">
              {config.tag}
            </p>
          </StageReveal>

          <SplitHeadline
            lines={[config.headline]}
            className="font-semibold text-white tracking-tight leading-[1.12] mb-2 md:mb-2.5 text-center text-[max(clamp(2.2rem,3.8vw,4.2rem),3.5vw)]"
          />

          <StageReveal order={2} className="w-full text-center">
            <p className="text-white/85 max-w-[640px] mx-auto text-[14px] md:text-[clamp(0.95rem,1.1vw,1.15rem)] mb-4 md:mb-0 leading-relaxed text-center">
              {config.description}
            </p>
          </StageReveal>
        </div>

        {/* Action Cards Area (Desktop >= 768px) */}
        <DesktopTreeScope>
          {isStudent ? (
            <StageReveal order={3} rise="14vh" className="hidden md:flex flex-col items-center w-full mb-3 md:mb-5 shrink-0">
              {/* CSS-drawn badge above card */}
              <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl mb-4 shadow-lg select-none">
                <div className="w-6 h-6 rounded-full bg-teal-400 flex items-center justify-center text-slate-950 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="font-bold text-white text-xs sm:text-sm">
                  I learned Acids & Bases
                </span>
              </div>

              {/* Single share card */}
              <div className="w-full max-w-sm mx-auto">
                {studentShareCard()}
              </div>
            </StageReveal>
          ) : (
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-3 md:mb-5 shrink-0 items-stretch">
              {standardActionCards.map((card, i) => (
                <StageReveal key={i} order={3 + i} rise="14vh" className="h-full">
                  {card}
                </StageReveal>
              ))}
            </div>
          )}
        </DesktopTreeScope>

        {/* Action Cards Area (Phone < 768px) */}
        <div className="flex md:hidden flex-col gap-4 w-full mb-4 shrink-0">
          {/* Primary Action Button */}
          <StageReveal order={3} rise={30} className="w-full">
            {isStudent ? (
              <div className="w-full flex flex-col items-center">
                <p className="text-white/80 text-[13px] font-medium mb-1.5 text-center">
                  {share.label}
                </p>
                <div className="relative w-full">
                  <button
                    type="button"
                    onClick={handleStudentShare}
                    className="h-[52px] w-full rounded-full font-semibold text-[16px] text-white bg-[#14B8A6] hover:bg-[#0D9488] active:scale-95 transition-all flex items-center justify-center gap-2 select-none cursor-pointer shadow-lg shadow-teal-500/25"
                  >
                    <Share2 className="w-5 h-5 shrink-0" />
                    <span>Share</span>
                  </button>
                  {mobileFlashOverlay}
                </div>
                {copied && (
                  <p
                    aria-live="polite"
                    className="text-teal-300 text-xs font-semibold mt-1.5 text-center"
                  >
                    Copied! Paste it to your parent or teacher.
                  </p>
                )}
              </div>
            ) : isSharePrimary ? (
              <div className="w-full flex flex-col items-center">
                <p className="text-white/80 text-[13px] font-medium mb-1.5 text-center">
                  {share.label}
                </p>
                <div className="relative w-full">
                  <a
                    href={shareLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-[52px] w-full rounded-full font-semibold text-[16px] text-white bg-[#14B8A6] hover:bg-[#0D9488] active:scale-95 transition-all flex items-center justify-center gap-2 select-none shadow-lg shadow-teal-500/25"
                  >
                    <Share2 className="w-5 h-5 shrink-0" />
                    <span>Share on WhatsApp</span>
                    <ArrowRight className="w-4 h-4 ml-0.5 shrink-0" />
                  </a>
                  {mobileFlashOverlay}
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <p className="text-white/80 text-[13px] font-medium mb-1.5 text-center">
                  Book a Demo
                </p>
                <div className="relative w-full">
                  <a
                    href={isPlaceholder(CALENDLY_LINK) ? undefined : CALENDLY_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-[52px] w-full rounded-full font-semibold text-[16px] text-white bg-[#14B8A6] hover:bg-[#0D9488] active:scale-95 transition-all flex items-center justify-center gap-2 select-none shadow-lg shadow-teal-500/25"
                  >
                    <Calendar className="w-5 h-5 shrink-0" />
                    <span>Open Calendar</span>
                    <ArrowRight className="w-4 h-4 ml-0.5 shrink-0" />
                  </a>
                  {mobileFlashOverlay}
                </div>
              </div>
            )}
          </StageReveal>

          {/* Secondary Actions List (Teacher, Parent, Principal, Other) */}
          {!isStudent && (
            <StageReveal order={4} className="w-full">
              <div className="rounded-2xl border border-white/10 bg-white/5 divide-y divide-white/10 flex flex-col w-full overflow-hidden">
                {isSharePrimary ? (
                  <>
                    {/* Calendar Row */}
                    <a
                      href={isPlaceholder(CALENDLY_LINK) ? undefined : CALENDLY_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3.5 min-h-[56px] px-4 py-2.5 transition hover:bg-white/[0.04] active:bg-white/[0.08] select-none text-left w-full"
                    >
                      <Calendar className="w-5 h-5 text-teal-300 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-white leading-snug">
                          Book a Demo
                        </p>
                        <p className="text-[12px] text-white/70 leading-snug">
                          {calendlyDesc}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/60 shrink-0 ml-auto" />
                    </a>

                    {/* WhatsApp Row */}
                    <a
                      href={isPlaceholder(WHATSAPP_LINK) ? undefined : WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3.5 min-h-[56px] px-4 py-2.5 transition hover:bg-white/[0.04] active:bg-white/[0.08] select-none text-left w-full"
                    >
                      <MessageCircle className="w-5 h-5 text-teal-300 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-white leading-snug">
                          WhatsApp
                        </p>
                        <p className="text-[12px] text-white/70 leading-snug">
                          +91 90195 88700
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/60 shrink-0 ml-auto" />
                    </a>

                    {/* Email Row */}
                    <a
                      href={isPlaceholder(EMAIL_ADDRESS) ? undefined : `mailto:${EMAIL_ADDRESS}`}
                      className="flex items-center gap-3.5 min-h-[56px] px-4 py-2.5 transition hover:bg-white/[0.04] active:bg-white/[0.08] select-none text-left w-full"
                    >
                      <Mail className="w-5 h-5 text-teal-300 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-white leading-snug">
                          Email Us
                        </p>
                        <p className="text-[12px] text-white/70 leading-snug">
                          {emailDesc} · {EMAIL_ADDRESS}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/60 shrink-0 ml-auto" />
                    </a>
                  </>
                ) : (
                  <>
                    {/* WhatsApp Row */}
                    <a
                      href={isPlaceholder(WHATSAPP_LINK) ? undefined : WHATSAPP_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3.5 min-h-[56px] px-4 py-2.5 transition hover:bg-white/[0.04] active:bg-white/[0.08] select-none text-left w-full"
                    >
                      <MessageCircle className="w-5 h-5 text-teal-300 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-white leading-snug">
                          WhatsApp
                        </p>
                        <p className="text-[12px] text-white/70 leading-snug">
                          +91 90195 88700
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/60 shrink-0 ml-auto" />
                    </a>

                    {/* Email Row */}
                    <a
                      href={isPlaceholder(EMAIL_ADDRESS) ? undefined : `mailto:${EMAIL_ADDRESS}`}
                      className="flex items-center gap-3.5 min-h-[56px] px-4 py-2.5 transition hover:bg-white/[0.04] active:bg-white/[0.08] select-none text-left w-full"
                    >
                      <Mail className="w-5 h-5 text-teal-300 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-white leading-snug">
                          Email Us
                        </p>
                        <p className="text-[12px] text-white/70 leading-snug">
                          {emailDesc} · {EMAIL_ADDRESS}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/60 shrink-0 ml-auto" />
                    </a>

                    {/* Share on WhatsApp Row */}
                    <a
                      href={shareLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3.5 min-h-[56px] px-4 py-2.5 transition hover:bg-white/[0.04] active:bg-white/[0.08] select-none text-left w-full"
                    >
                      <Share2 className="w-5 h-5 text-teal-300 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-semibold text-white leading-snug">
                          {share.label}
                        </p>
                        <p className="text-[12px] text-white/70 leading-snug">
                          Forward via WhatsApp in 1 tap.
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-white/60 shrink-0 ml-auto" />
                    </a>
                  </>
                )}
              </div>
            </StageReveal>
          )}
        </div>

        {/* Middle-Bottom: Value Proposition Columns (Shows ONLY for Principal and Other) */}
        {(role === 'Principal' || role === 'Other') && (
          <StageReveal order={7} rise="14vh" className="shrink-0 mb-4 md:mb-5 text-center">
            <p className="text-slate-400 font-semibold text-[11px] md:text-[12px] uppercase tracking-[0.2em] mb-2 md:mb-3 text-center select-none">
              Why Schools Say Yes
            </p>
            <div className="flex flex-wrap md:grid md:grid-cols-3 gap-2 md:gap-5 w-full max-w-5xl mx-auto justify-center">
              {[
                {
                  icon: <TrendingUp className="w-4 h-4 md:w-[18px] md:h-[18px] text-teal-400 shrink-0" />,
                  title: 'Built for board results',
                  desc: 'Mastery-first learning builds retention.',
                },
                {
                  icon: <Building2 className="w-4 h-4 md:w-[18px] md:h-[18px] text-teal-400 shrink-0" />,
                  title: 'Built for admissions',
                  desc: 'A premium tech-stack attracts parents.',
                },
                {
                  icon: <Phone className="w-4 h-4 md:w-[18px] md:h-[18px] text-teal-400 shrink-0" />,
                  title: 'Built for fewer complaints',
                  desc: 'Daily visibility removes guesswork.',
                },
              ].map((r) => (
                <div
                  key={r.title}
                  className="flex items-center gap-2 md:gap-3 bg-white/[0.04] md:bg-white/[0.03] border border-white/10 md:border-white/5 rounded-xl px-2.5 py-1.5 md:px-3.5 md:py-2.5 text-left flex-1 min-w-[95px] md:min-w-0"
                >
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg bg-teal-500/15 border border-teal-400/25 flex items-center justify-center shrink-0">
                    {r.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-bold text-[12px] md:text-[14px] leading-tight line-clamp-2 md:truncate">
                      {r.title}
                    </p>
                    <p className="hidden md:block text-slate-300 text-[13px] leading-tight truncate">
                      {r.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </StageReveal>
        )}

        {/* Bottom: Slim Footer */}
        <StageReveal order={8} className="w-full shrink-0 mt-4 md:mt-0">
          <div className="w-full border-t border-white/10 pt-3 md:pt-3.5 flex flex-col md:flex-row items-center justify-between gap-2.5 md:gap-4 text-[12px] md:text-[13px] text-slate-400 shrink-0 select-none">
            {/* Left: Company & Registration */}
            <div className="flex items-center gap-2 text-center md:text-left text-[12px] md:text-[13px]">
              <Image
                src="/logo.png"
                alt="StudyRealm Logo"
                width={16}
                height={16}
                className="h-3.5 w-auto md:h-4 object-contain shrink-0"
              />
              <span className="text-slate-300 text-[12px] md:text-[13px]">
                StudyRealm Technologies · MSME Udyam Registered · Bangalore, Karnataka
              </span>
            </div>

            {/* Right: Existing Links in One Row */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 md:gap-x-5 gap-y-1 text-slate-300 text-[12px] md:text-[13px]">
              <a
                href="https://studyrealm.app"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-300 transition-colors"
              >
                Main Website
              </a>
              <a
                href="https://studyrealm.app/support"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-300 transition-colors"
              >
                Support & Help
              </a>
              <a
                href="https://studyrealm.app/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-300 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="https://studyrealm.app/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-teal-300 transition-colors"
              >
                Terms & Conditions
              </a>
            </div>
          </div>
        </StageReveal>
      </div>
    </SceneShell>
  );
}

