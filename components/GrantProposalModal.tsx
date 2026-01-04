
import React, { useState, useEffect } from 'react';
import { DonorLead, NonprofitProjectInfo, NonprofitProfile, DraftProposal } from '../types';
import { generateGrantProposal } from '../services/geminiService';

interface GrantProposalModalProps {
  donor: DonorLead;
  onClose: () => void;
  isPro: boolean;
  profile: NonprofitProfile | null;
  onSaveDraft?: (draft: DraftProposal) => void;
}

const LOADING_STATUSES = [
  "Auditing donor's historical grant patterns...",
  "Aligning project objectives with mission values...",
  "Synthesizing impact metrics and outcomes...",
  "Optimizing proposal for institutional relevance...",
  "Polishing executive summary for maximum engagement...",
  "Finalizing strategic sustainability plan..."
];

export const GrantProposalModal: React.FC<GrantProposalModalProps> = ({ donor, onClose, isPro, profile, onSaveDraft }) => {
  const [step, setStep] = useState(1);
  // Separate local form state from the final submission object that requires profile info
  const [projectInfo, setProjectInfo] = useState<Omit<NonprofitProjectInfo, 'nonprofitName' | 'mission'>>({
    projectTitle: '',
    projectGoals: '',
    amountRequested: '',
    timeline: '',
    beneficiaries: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [proposal, setProposal] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  
  // Loading Animation States
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    let interval: number;
    if (isLoading) {
      setLoadingProgress(0);
      setStatusIndex(0);
      
      interval = window.setInterval(() => {
        setLoadingProgress(prev => {
          if (prev < 92) return prev + Math.random() * 8;
          return prev;
        });
        setStatusIndex(prev => (prev + 1) % LOADING_STATUSES.length);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      alert("Please complete your Organization Profile first.");
      return;
    }
    setIsLoading(true);
    setStep(3);
    try {
      // Correctly merge form state with profile data to satisfy NonprofitProjectInfo type
      const result = await generateGrantProposal(donor, {
        ...projectInfo,
        nonprofitName: profile.name,
        mission: profile.mission,
      });
      setProposal(result);
    } catch (err) {
      console.error(err);
      alert("Failed to generate proposal. Please try again.");
      setStep(2);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (proposal) {
      navigator.clipboard.writeText(proposal);
      alert("Proposal copied to clipboard!");
    }
  };

  const handleEmailDonor = () => {
    if (!proposal) return;
    const subject = encodeURIComponent(`Grant Proposal: ${projectInfo.projectTitle}`);
    const body = encodeURIComponent(proposal);
    window.location.href = `mailto:${donor.email}?subject=${subject}&body=${body}`;
  };

  const handleSaveToDrafts = () => {
    if (!proposal || isSaved) return;
    const draft: DraftProposal = {
      id: Math.random().toString(36).substr(2, 9),
      donorName: donor.name,
      projectTitle: projectInfo.projectTitle,
      content: proposal,
      createdAt: new Date().toISOString()
    };
    onSaveDraft?.(draft);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-midnight/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header with Step Indicator */}
        <div className="p-8 border-b border-slate-100 flex flex-col space-y-6 bg-slate-50/50">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-black text-midnight tracking-tight">Grant Proposal Wizard</h3>
              <p className="text-sm text-slate-500 font-medium">Strategizing for <span className="text-brand-600 font-bold">{donor.name}</span></p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-4 max-w-sm">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-grow flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                  step === s ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-100' : 
                  step > s ? 'bg-emerald-500 border-emerald-500 text-white' : 
                  'bg-white border-slate-200 text-slate-400'
                }`}>
                  {step > s ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  ) : s}
                </div>
                {s < 3 && <div className={`flex-grow h-1 mx-2 rounded-full ${step > s ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          {step === 1 && (
            <div className="animate-slide-up space-y-6 text-center py-10">
              <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-600">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <h4 className="text-xl font-extrabold text-midnight">Organizational Context</h4>
              {profile ? (
                <div className="max-w-md mx-auto space-y-4">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Confirmed Entity</span>
                    <p className="font-bold text-slate-900">{profile.name}</p>
                    <p className="text-xs text-slate-500 mt-2 italic leading-relaxed">{profile.mission}</p>
                  </div>
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full bg-midnight text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    Confirm & Proceed
                  </button>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <p className="text-slate-500 mb-6">No organization profile detected. Please close this wizard and complete your profile on the Discovery page.</p>
                  <button onClick={onClose} className="text-brand-600 font-black text-xs uppercase tracking-widest hover:underline">Return to Discovery</button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-8 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Title</label>
                  <input
                    required
                    value={projectInfo.projectTitle}
                    onChange={(e) => setProjectInfo({ ...projectInfo, projectTitle: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-600 outline-none transition-all"
                    placeholder="e.g. Clean Water Expansion Phase II"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Budget Request</label>
                  <input
                    required
                    value={projectInfo.amountRequested}
                    onChange={(e) => setProjectInfo({ ...projectInfo, amountRequested: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-600 outline-none transition-all"
                    placeholder="e.g. $125,000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estimated Timeline</label>
                  <input
                    required
                    value={projectInfo.timeline}
                    onChange={(e) => setProjectInfo({ ...projectInfo, timeline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-600 outline-none transition-all"
                    placeholder="e.g. 24 Months"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Direct Beneficiaries</label>
                  <input
                    required
                    value={projectInfo.beneficiaries}
                    onChange={(e) => setProjectInfo({ ...projectInfo, beneficiaries: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-600 outline-none transition-all"
                    placeholder="e.g. 5,000 rural families"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Objectives & Desired Impact</label>
                <textarea
                  required
                  value={projectInfo.projectGoals}
                  onChange={(e) => setProjectInfo({ ...projectInfo, projectGoals: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-600 outline-none transition-all h-32 resize-none"
                  placeholder="Describe the problem you are solving and the measurable outcomes you anticipate..."
                />
              </div>

              <div className="flex space-x-4">
                <button type="button" onClick={() => setStep(1)} className="px-8 py-4 bg-slate-100 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest">Back</button>
                <button
                  type="submit"
                  className="flex-grow bg-brand-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-brand-500 transition-all flex items-center justify-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <span>Synthesize Full Proposal</span>
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              {isLoading ? (
                <div className="py-20 text-center space-y-12">
                  <div className="relative w-32 h-32 mx-auto">
                    {/* Pulsing Outer Rings */}
                    <div className="absolute inset-0 border-2 border-brand-100 rounded-full animate-ping opacity-25"></div>
                    <div className="absolute inset-4 border-2 border-brand-200 rounded-full animate-ping opacity-25 [animation-delay:0.5s]"></div>
                    
                    {/* Central Rotating Icon */}
                    <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full shadow-xl border border-slate-100 z-10">
                      <div className="w-16 h-16 text-brand-600 animate-[spin_3s_linear_infinite]">
                         <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                         </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="text-center">
                      <h4 className="text-2xl font-black text-midnight tracking-tight mb-2">Strategy Synthesis</h4>
                      <p key={statusIndex} className="text-brand-600 text-sm font-bold uppercase tracking-widest animate-fade-in">
                        {LOADING_STATUSES[statusIndex]}
                      </p>
                    </div>

                    {/* Dynamic Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        <span>Neural Mapping</span>
                        <span className="text-brand-600">{Math.round(loadingProgress)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                        <div 
                          className="h-full bg-gradient-to-r from-brand-600 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(79,70,229,0.3)]"
                          style={{ width: `${loadingProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    <p className="text-slate-400 text-xs italic font-medium pt-2">
                      Gemini 3 Pro is processing organizational impact vs. {donor.name}'s funding patterns.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-slate-900 rounded-[2rem] p-8 relative ring-1 ring-slate-800 shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/5 blur-[100px] pointer-events-none"></div>
                    <div className="flex justify-between items-center mb-8 relative z-10">
                      <div className="flex items-center space-x-3">
                        <div className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(79,70,229,0.8)]"></div>
                        <h5 className="text-indigo-400 text-xs font-black uppercase tracking-[0.3em]">AI Strategic Master Draft</h5>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={copyToClipboard}
                          className="bg-slate-800 text-slate-300 hover:text-white transition-all px-5 py-2.5 rounded-xl flex items-center space-x-2 border border-slate-700 text-[10px] font-bold uppercase tracking-widest"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                    <div className="text-slate-200 font-sans text-sm leading-[1.8] whitespace-pre-wrap prose prose-invert prose-sm max-w-none max-h-[50vh] overflow-y-auto custom-scrollbar-dark pr-6">
                      {proposal}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={handleEmailDonor}
                      className="bg-brand-600 text-white p-5 rounded-[1.5rem] flex flex-col items-center justify-center space-y-2 hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 group"
                    >
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">Email to Donor</span>
                    </button>
                    
                    <button 
                      onClick={handleSaveToDrafts}
                      disabled={isSaved}
                      className={`${isSaved ? 'bg-emerald-500' : 'bg-midnight'} text-white p-5 rounded-[1.5rem] flex flex-col items-center justify-center space-y-2 hover:opacity-90 transition-all shadow-lg group`}
                    >
                      {isSaved ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest">{isSaved ? 'Draft Saved' : 'Save to Drafts'}</span>
                    </button>

                    <button className="bg-slate-50 border border-slate-200 text-slate-600 p-5 rounded-[1.5rem] flex flex-col items-center justify-center space-y-2 hover:bg-slate-100 transition-all group">
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">Export PDF</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            DonorScout Intelligence Engine • Version 4.2.0
          </p>
          {step === 3 && !isLoading && (
             <button onClick={() => setStep(2)} className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">Revise Inputs</button>
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar-dark::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};
