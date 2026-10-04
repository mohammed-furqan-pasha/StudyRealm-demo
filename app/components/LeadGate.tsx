'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LeadFormData } from '../types';

interface Props {
  onSubmit: (data: LeadFormData) => void;
}

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbydtyFaM1VYGakvHhV7Fa1gpbh0WX5PRgh_fFQSdWmigxh1yv2JkOBbuPcHvjJyUW00/exec';

export default function LeadGate({ onSubmit }: Props) {
  const [form, setForm] = useState<LeadFormData>({ name: '', role: 'Teacher', schoolName: '', mobile: '' });
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Disable right-click and devtools
  useEffect(() => {
    const noContext = (e: MouseEvent) => e.preventDefault();
    const noDevTools = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.shiftKey && e.key === 'C')) e.preventDefault();
    };
    document.addEventListener('contextmenu', noContext);
    document.addEventListener('keydown', noDevTools);
    return () => { document.removeEventListener('contextmenu', noContext); document.removeEventListener('keydown', noDevTools); };
  }, []);

  // Preload TTS voices in the background so they are ready for DemoPlayer
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      // Some browsers load voices asynchronously, so we also listen for the event
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const validate = () => {
    const e: Partial<LeadFormData> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.schoolName.trim()) e.schoolName = 'School name is required';
    if (!/^[6-9]\d{9}$/.test(form.mobile)) e.mobile = 'Enter a valid 10-digit Indian mobile number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        name: form.name,
        role: form.role,
        schoolName: form.schoolName,
        mobile: form.mobile,
        timestamp: new Date().toLocaleString('en-IN', { hour12: false }),
      });
      await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`, { method: 'GET', mode: 'no-cors' });
    } catch { /* silent — no-cors won't throw usefully */ }
    setSubmitted(true);
    setTimeout(() => { setLoading(false); onSubmit(form); }, 800);
  };

  const inputClasses = "w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition text-sm bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-50 overflow-y-auto">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 md:gap-16 items-center animate-[slideUp_0.4s_ease-out] py-8">
        
        {/* Left Side: Value/Trust (Hidden on mobile) */}
        <div className="hidden md:block">
          <div className="inline-flex items-center gap-2 mb-8">
            <Image src="/logo.png" alt="StudyRealm Logo" width={32} height={32} className="w-8 h-8 object-contain rounded-lg" />
            <span className="font-bold text-xl tracking-wide text-slate-800">STUDY<span className="text-teal-500">REALM</span></span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-8 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            See how StudyRealm transforms classrooms
          </h1>
          <div className="space-y-4 text-slate-700 text-lg">
            <div className="flex items-center gap-3"><span className="text-teal-500 font-bold text-xl">✓</span> Interactive 3D models</div>
            <div className="flex items-center gap-3"><span className="text-teal-500 font-bold text-xl">✓</span> Auto-graded quizzes</div>
            <div className="flex items-center gap-3"><span className="text-teal-500 font-bold text-xl">✓</span> NCF 2023 Compliant</div>
          </div>
        </div>

        {/* Right Side: Form card */}
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Logo */}
          <div className="text-center mb-6 md:hidden">
            <div className="inline-flex items-center gap-2 mb-3">
              <Image src="/logo.png" alt="StudyRealm Logo" width={32} height={32} className="w-8 h-8 object-contain rounded-lg" />
              <span className="font-bold text-xl tracking-wide text-slate-800">STUDY<span className="text-teal-500">REALM</span></span>
            </div>
          </div>

          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-slate-900 text-2xl font-bold mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
              Welcome to the Demo
            </h2>
            <p className="text-slate-600 text-sm">Tell us a bit about yourself to unlock a fully interactive demo chapter.</p>
          </div>

          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100">
            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Priya Sharma"
                  className={inputClasses}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">I am a <span className="text-red-400">*</span></label>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as LeadFormData['role'] }))}
                  className={inputClasses}
                >
                  <option value="Teacher">Teacher</option>
                  <option value="Principal">Principal / Management</option>
                  <option value="Parent">Parent</option>
                  <option value="Student">Student</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* School */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">School / Organization <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  value={form.schoolName}
                  onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))}
                  placeholder="e.g. Delhi Public School, Bengaluru"
                  className={inputClasses}
                />
                {errors.schoolName && <p className="text-red-500 text-xs mt-1.5">{errors.schoolName}</p>}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number <span className="text-red-400">*</span></label>
                <div className="flex">
                  <span className="inline-flex items-center px-4 border border-r-0 border-slate-200 rounded-l-xl bg-slate-50 text-slate-500 text-sm font-medium">+91</span>
                  <input
                    type="tel"
                    value={form.mobile}
                    onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="9876543210"
                    className="w-full border border-slate-200 rounded-r-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition text-sm bg-white"
                  />
                </div>
                {errors.mobile && <p className="text-red-500 text-xs mt-1.5">{errors.mobile}</p>}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading || submitted}
                className={`w-full py-3.5 mt-2 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-70 ${submitted ? 'bg-teal-500' : 'bg-teal-500 hover:bg-teal-600 shadow-sm hover:shadow'}`}
              >
                {submitted ? '✓ Welcome! Loading demo...' : loading ? 'Saving...' : 'Experience the Demo →'}
              </button>

              <p className="text-center text-slate-400 text-xs pt-2">
                We respect your privacy. No spam, ever.
              </p>
            </div>
          </div>

          <p className="text-center text-slate-500 text-xs mt-6">
            demo.studyrealm.app · MSME Registered · Bangalore, Karnataka
          </p>
        </div>
      </div>
    </div>
  );
}
