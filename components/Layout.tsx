
import React, { useState } from 'react';
import { AppView, User } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  isPro: boolean;
  user: User | null;
  onSignInClick: () => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  activeView, 
  onViewChange, 
  isPro, 
  user, 
  onSignInClick,
  onLogout
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="glass-nav border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => onViewChange('discovery')}>
              <div className="w-10 h-10 bg-midnight rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg group-hover:scale-105 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-midnight tracking-tight leading-none">DonorScout <span className="text-brand-600">AI</span></span>
                {isPro && (
                  <div className="flex items-center mt-1 space-x-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Enterprise Intelligence</span>
                  </div>
                )}
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-1 bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
              {[
                { id: 'discovery', label: 'Discovery', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                { id: 'trust-center', label: 'Trust Center', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
                { id: 'billing', label: 'Pricing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z' }
              ].map((item) => (
                <button 
                  key={item.id}
                  onClick={() => onViewChange(item.id as AppView)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    activeView === item.id 
                      ? 'bg-white text-midnight shadow-sm border border-slate-200' 
                      : 'text-slate-500 hover:text-midnight hover:bg-white/50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-5">
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-3 p-1 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-all pr-4"
                  >
                    <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-indigo-100 shadow-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-none">
                      <span className="text-xs font-black text-midnight mb-0.5">{user.name}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{isPro ? 'Pro User' : 'Free Tier'}</span>
                    </div>
                    <svg className={`w-3 h-3 text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 animate-slide-up z-[60]">
                      <button 
                        onClick={() => { onViewChange('account'); setIsMenuOpen(false); }}
                        className="w-full flex items-center space-x-3 px-5 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-midnight transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span className="font-bold">My Account</span>
                      </button>
                      <button 
                        onClick={() => { onViewChange('discovery'); setIsMenuOpen(false); }}
                        className="w-full flex items-center space-x-3 px-5 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-midnight transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <span className="font-bold">Organization Profile</span>
                      </button>
                      <div className="my-2 border-t border-slate-100"></div>
                      <button 
                        onClick={() => { onLogout(); setIsMenuOpen(false); }}
                        className="w-full flex items-center space-x-3 px-5 py-3 text-sm text-rose-500 hover:bg-rose-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        <span className="font-bold">Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={onSignInClick}
                  className="bg-midnight hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-200"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-center md:text-left">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-extrabold text-midnight tracking-tight">DonorScout <span className="text-brand-600">AI</span></span>
            <p className="mt-2 text-slate-500 text-sm max-w-xs leading-relaxed">Intelligence for the modern nonprofit. Find your mission's next major partner.</p>
          </div>
          <div className="flex justify-center space-x-8 text-slate-400 font-medium text-sm">
            <a href="#" className="hover:text-midnight transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-midnight transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-midnight transition-colors">Contact Support</a>
          </div>
          <div className="text-slate-400 text-sm md:text-right">
            © 2024 DonorScout AI. Built for impact.
          </div>
        </div>
      </footer>
    </div>
  );
};
