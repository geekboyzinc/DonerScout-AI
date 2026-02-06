
import React, { useState } from 'react';
import { NonprofitCategory } from '../types';

interface SearchPanelProps {
  onSearch: (category: string, region: string) => void;
  isLoading: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, isLoading }) => {
  const [category, setCategory] = useState<string>(NonprofitCategory.ENVIRONMENT);
  const [customCategory, setCustomCategory] = useState('');
  const [region, setRegion] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(useCustom ? customCategory : category, region);
  };

  return (
    <section className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-slate-200/60 p-8 md:p-12 animate-slide-up">
      <div className="mb-10 text-center">
        <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-700 text-[11px] font-extrabold uppercase tracking-[0.2em] rounded-full mb-4">
          Intelligent Discovery Engine
        </span>
        <h2 className="text-3xl font-extrabold text-midnight tracking-tight">Identify Your Next Major Donor</h2>
        <p className="text-slate-500 mt-3 text-lg max-w-2xl mx-auto leading-relaxed italic">
          Enter your sector and operational region to begin the deep-web audit.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="group">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-brand-600 transition-colors">
              Impact Sector
            </label>
            {!useCustom ? (
              <div className="relative">
                {/* Fixed: Moved side-effect from render to onChange handler */}
                <select
                  value={category}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setUseCustom(true);
                    } else {
                      setCategory(val);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 outline-none transition-all appearance-none cursor-pointer"
                >
                  {Object.values(NonprofitCategory).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="custom">Other / Niche Sector...</option>
                </select>
                <div className="absolute right-5 top-5 pointer-events-none text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            ) : (
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Sustainable Agriculture in Kenya"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 outline-none transition-all"
                  required
                />
                <button 
                  type="button"
                  onClick={() => {
                    setUseCustom(false);
                    setCategory(NonprofitCategory.ENVIRONMENT);
                  }}
                  className="absolute right-4 top-4 text-slate-300 hover:text-slate-600 transition-colors p-1"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )}
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1 group-focus-within:text-brand-600 transition-colors">
              Operational Region
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. London Metro Area or Global"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-12 py-4 text-slate-900 font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 outline-none transition-all"
                required
              />
              <div className="absolute left-5 top-4.5 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full max-w-sm bg-midnight hover:bg-slate-800 text-white font-extrabold py-5 rounded-2xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center space-x-3 group relative overflow-hidden ${isLoading ? 'opacity-90 cursor-wait' : ''}`}
          >
            {isLoading && (
              <div className="absolute inset-0 bg-brand-600/10 animate-pulse"></div>
            )}
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="tracking-tight">Initializing Discovery...</span>
              </>
            ) : (
              <>
                <span className="tracking-tight">Search intelligence Database</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
