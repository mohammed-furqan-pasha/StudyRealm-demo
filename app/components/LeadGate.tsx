'use client';
import { useState, useEffect } from 'react';
import { LeadFormData } from '../types';

interface Props {
  onSubmit: () => void;
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
    setTimeout(() => { setLoading(false); onSubmit(); }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,20,40,0.92)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md animate-[slideUp_0.4s_ease-out]">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-white font-bold text-xl tracking-wide">STUDY<span className="text-teal-400">REALM</span></span>
          </div>
          <h2 className="text-white text-2xl font-bold mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>
            Welcome to the Demo
          </h2>
          <p className="text-slate-400 text-sm">Enter your details to experience a live chapter</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Priya Sharma"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition text-sm"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">I am a *</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as LeadFormData['role'] }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition text-sm bg-white"
              >
                <option value="Teacher">Teacher</option>
                <option value="Principal">Principal / Management</option>
                <option value="Parent">Parent</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* School */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">School / Organization *</label>
              <input
                type="text"
                value={form.schoolName}
                onChange={e => setForm(f => ({ ...f, schoolName: e.target.value }))}
                placeholder="e.g. Delhi Public School, Bengaluru"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition text-sm"
              />
              {errors.schoolName && <p className="text-red-500 text-xs mt-1">{errors.schoolName}</p>}
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile Number *</label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-slate-200 rounded-l-xl bg-slate-50 text-slate-500 text-sm font-medium">+91</span>
                <input
                  type="tel"
                  value={form.mobile}
                  onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  placeholder="9876543210"
                  className="flex-1 border border-slate-200 rounded-r-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition text-sm"
                />
              </div>
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || submitted}
              className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-60"
              style={{ background: submitted ? '#14B8A6' : 'linear-gradient(135deg, #14B8A6, #3B82F6)' }}
            >
              {submitted ? '✓ Welcome! Loading demo...' : loading ? 'Saving...' : 'Experience the Demo →'}
            </button>

            <p className="text-center text-slate-400 text-xs">
              We respect your privacy. No spam, ever.
            </p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          demo.studyrealm.app · MSME Registered · Bangalore, Karnataka
        </p>
      </div>
    </div>
  );
}
