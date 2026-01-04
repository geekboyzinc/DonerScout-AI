
import React, { useState } from 'react';
import { verifyNonprofit } from '../services/geminiService';
import { VerificationInfo } from '../types';

export const VerificationCenter: React.FC = () => {
  const [name, setName] = useState('');
  const [regId, setRegId] = useState('');
  const [region, setRegion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verification, setVerification] = useState<VerificationInfo | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await verifyNonprofit(name, regId, region);
      setVerification(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Trust & Verification Center</h2>
        <p className="text-slate-500 mb-6">Verify your organization's credentials to unlock higher trust scores and premium donor connections.</p>
        
        {!verification ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Organization Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Official Name"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tax ID / Reg Number</label>
                <input 
                  type="text" 
                  value={regId} 
                  onChange={(e) => setRegId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. 12-3456789"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Jurisdiction</label>
                <input 
                  type="text" 
                  value={region} 
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. United States"
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? 'Verifying Registry Records...' : 'Request Official Verification'}
            </button>
          </form>
        ) : (
          <div className="animate-fadeIn">
            <div className={`p-6 rounded-xl border-2 flex items-center justify-between mb-6 ${
              verification.status === 'Verified' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  verification.status === 'Verified' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}>
                  {verification.status === 'Verified' ? (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  )}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">{verification.status} Status</h4>
                  <p className="text-slate-600 text-sm">Last checked: {verification.lastUpdated}</p>
                </div>
              </div>
              <button onClick={() => setVerification(null)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h5 className="font-bold text-slate-900 mb-2">Registration Details</h5>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-sm text-slate-500">Official Name</span>
                    <span className="text-sm font-semibold">{verification.officialName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-sm text-slate-500">ID / EIN</span>
                    <span className="text-sm font-semibold">{verification.registrationId}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="text-sm text-slate-500">Tax Status</span>
                    <span className="text-sm font-semibold text-indigo-600">{verification.taxStatus}</span>
                  </div>
                </div>
                
                <h5 className="font-bold text-slate-900 mt-6 mb-2">Verified Sources</h5>
                <ul className="space-y-2">
                  {verification.verificationSources.map((s, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm text-indigo-600 hover:underline">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      <a href={s.uri} target="_blank" rel="noreferrer">{s.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h5 className="font-bold text-slate-900 mb-2 italic">Registry Analysis</h5>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {verification.summary}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
