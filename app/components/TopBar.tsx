'use client';

import Image from 'next/image';
import { usePager } from './PageFlow';

export default function TopBar() {
  const { goTo } = usePager();

  return (
    <nav
      className="flex-none flex items-center justify-between pl-[max(5%,env(safe-area-inset-left,0px))] pr-[max(5%,env(safe-area-inset-right,0px))] pt-[max(28px,env(safe-area-inset-top,0px))] pb-4 z-30"
      style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
    >
      <div className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="StudyRealm Logo"
          width={32}
          height={32}
          className="w-8 h-8 object-contain rounded-lg"
        />
        <span className="text-white font-medium text-[15px] tracking-[0.28em] uppercase leading-none">
          STUDYREALM
        </span>
      </div>
      <div className="hidden md:flex items-center gap-[40px] text-[14px] font-normal text-white/85">
        <a
          href="#features"
          onClick={(e) => {
            e.preventDefault();
            goTo('features');
          }}
          className="hover:text-white transition"
        >
          Features
        </a>
        <a
          href="https://studyrealm.app"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition"
        >
          Main Website
        </a>
        <a
          href="#contact"
          onClick={(e) => {
            e.preventDefault();
            goTo('contact');
          }}
          className="hover:text-white transition"
        >
          Contact
        </a>
      </div>
    </nav>
  );
}
