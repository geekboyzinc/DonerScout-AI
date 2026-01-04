
import React, { useState } from 'react';

interface SubscriptionPanelProps {
  isPro: boolean;
  onUpgrade: () => void;
  onCancel: () => void;
}

export const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({ isPro, onUpgrade, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleAction = () => {
    setLoading(true);
    setTimeout(() => {
      if (isPro) onCancel();
      else onUpgrade();
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-16 py-12 animate-slide-up">
      <div className="text-center max-w-3xl mx-auto px-4">
        <span className="inline-block px-4 py-1 bg-brand-50 text-brand-600 text-[11px] font-black uppercase tracking-widest rounded-full mb-6">
          Flexible Philanthropic Intelligence
        </span>
        <h2 className="text-4xl md:text-5xl font-extrabold text-midnight tracking-tight">
          Power Your Mission with <span className="text-brand-600">Pro Scout</span>
        </h2>
        <p className="mt-6 text-xl text-slate-500 leading-relaxed font-medium">
          Whether you're a local nonprofit or a global foundation, our intelligence scales with your vision.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 max-w-5xl mx-auto px-4">
        {/* Essential Plan */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm flex flex-col group hover:border-slate-300 transition-all">
          <div className="mb-10">
            <h3 className="text-lg font-black text-midnight uppercase tracking-widest mb-4">Essential</h3>
            <div className="flex items-baseline">
              <span className="text-5xl font-black text-midnight tracking-tighter">$2.99</span>
              <span className="ml-2 text-slate-400 font-bold">/month</span>
            </div>
            <p className="mt-4 text-slate-500 text-sm font-medium">Standard intelligence for growing nonprofit teams.</p>
          </div>
          
          <div className="space-y-4 mb-12 flex-grow">
            {[
              { label: '10 Intelligence Audits / mo', active: true },
              { label: 'Global Registry Access', active: true },
              { label: 'Donor Sentiment Reviews', active: true },
              { label: 'Standard Web Grounding', active: true },
              { label: 'Regional Philanthropy Heatmaps', active: true },
              { label: 'Basic Outreach Templates', active: true },
              { label: 'AI Strategic Drafts', active: false },
              { label: 'API & CRM Integration', active: false },
            ].map((f, i) => (
              <div key={i} className={`flex items-center space-x-3 text-sm ${f.active ? 'text-slate-700 font-semibold' : 'text-slate-300'}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${f.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                  {f.active ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </div>
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          <button 
            disabled={!isPro}
            onClick={isPro ? handleAction : undefined}
            className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${
              !isPro 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {!isPro ? 'Current Tier' : (loading ? 'Processing...' : 'Switch to Essential')}
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-midnight rounded-[2.5rem] p-12 shadow-2xl relative flex flex-col scale-105 border-4 border-brand-500/30">
          <div className="absolute -top-5 inset-x-0 flex justify-center">
            <span className="bg-gradient-to-r from-brand-500 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full shadow-lg">
              Enterprise Ready
            </span>
          </div>
          
          <div className="mb-10">
            <h3 className="text-lg font-black text-indigo-400 uppercase tracking-widest mb-4">Pro Scout</h3>
            <div className="flex items-baseline text-white">
              <span className="text-5xl font-black tracking-tighter">$199.00</span>
              <span className="ml-2 text-slate-400 font-bold">/month</span>
            </div>
            <p className="mt-4 text-slate-400 text-sm font-medium">Advanced suite for professional, multi-region fundraising teams.</p>
          </div>
          
          <div className="space-y-4 mb-12 flex-grow">
            {[
              { label: 'Unlimited Deep-Web Audits', active: true },
              { label: 'AI Strategic Outreach Drafts', active: true },
              { label: 'Priority Registry Verification', active: true },
              { label: 'Advanced Ecosystem Analytics', active: true },
              { label: 'Verified Partner Badge', active: true },
              { label: 'Multi-user Team Collaboration', active: true },
              { label: 'CRM & API Data Integration', active: true },
              { label: 'White-label Proposal Export', active: true },
              { label: 'Real-time Funding Alerts', active: true },
              { label: 'Dedicated Concierge Support', active: true },
            ].map((f, i) => (
              <div key={i} className="flex items-center space-x-3 text-sm text-slate-100 font-semibold">
                <div className="w-5 h-5 bg-brand-600/20 text-brand-400 rounded-full flex items-center justify-center shrink-0 border border-brand-500/30">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={handleAction}
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${
              isPro 
                ? 'bg-slate-800 text-white hover:bg-slate-700' 
                : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/20'
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 mx-auto" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : isPro ? (
              'Manage Subscription'
            ) : (
              'Unlock Full Access'
            )}
          </button>
        </div>
      </div>

      <div className="bg-slate-100/50 rounded-[2.5rem] p-10 border border-slate-200/60 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col text-center md:text-left">
          <h4 className="font-extrabold text-midnight text-lg">Trusted Transaction Standards</h4>
          <p className="text-slate-500 text-sm font-medium">Enterprise-grade security for your organizational billing.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-10 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
          <span className="font-black italic text-xl tracking-tighter">STRIPE</span>
          <span className="font-black italic text-xl tracking-tighter">PAYPAL</span>
          <span className="font-black italic text-xl tracking-tighter">MASTERCARD</span>
          <span className="font-black italic text-xl tracking-tighter">VISA</span>
        </div>
      </div>
    </div>
  );
};
