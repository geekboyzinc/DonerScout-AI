
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { SearchPanel } from './components/SearchPanel';
import { DonorList } from './components/DonorList';
import { VerificationCenter } from './components/VerificationCenter';
import { ReviewSection } from './components/ReviewSection';
import { SubscriptionPanel } from './components/SubscriptionPanel';
import { OrganizationProfile } from './components/OrganizationProfile';
import { AuthModal } from './components/AuthModal';
import { SecurityPortal } from './components/SecurityPortal';
import { DebugPanel } from './components/DebugPanel';
import { findDonors } from './services/geminiService';
import { SearchResult, AppView, NonprofitProfile, User, DraftProposal } from './types';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const LeadSkeleton = () => (
  <div className="bg-white rounded-[1.5rem] border border-slate-200/60 p-8 shadow-sm animate-pulse">
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
      <div className="space-y-4 flex-grow">
        <div className="h-5 w-20 bg-slate-100 rounded-lg mb-2"></div>
        <div className="h-8 w-3/4 bg-slate-100 rounded-xl"></div>
        <div className="h-6 w-1/2 bg-slate-50 rounded-lg mt-2"></div>
      </div>
      <div className="w-40 h-16 bg-slate-50 rounded-2xl"></div>
    </div>
    <div className="space-y-3 mb-8">
      <div className="h-4 w-full bg-slate-50 rounded"></div>
      <div className="h-4 w-2/3 bg-slate-50 rounded"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('discovery');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchContext, setSearchContext] = useState<string>('');
  
  const [profile, setProfile] = useState<NonprofitProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<DraftProposal[]>([]);
  const [isPro, setIsPro] = useState(true);

  const handleSearch = async (category: string, region: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setSearchContext(category);
    try {
      const data = await findDonors(category, region);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch donor data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsPro(false);
    setResult(null);
    setActiveView('discovery');
  };

  const handleSaveDraft = (draft: DraftProposal) => {
    setSavedDrafts(prev => [draft, ...prev]);
  };

  return (
    <>
      <Layout 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isPro={isPro} 
        user={currentUser}
        onSignInClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          
          {activeView === 'discovery' && (
            <div className="space-y-12">
              <div className="max-w-3xl mx-auto text-center">
                <span className="inline-block px-4 py-1.5 bg-brand-50 text-brand-700 text-[10px] font-black uppercase tracking-[0.3em] rounded-full mb-6">
                  Institutional Philanthropy Platform
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold text-midnight mb-6 tracking-tighter">
                  {currentUser ? (
                    <>Impact Strategy for <span className="text-brand-600">{currentUser.name.split(' ')[0]}</span></>
                  ) : (
                    <>Intelligence for <span className="text-brand-600">Impact</span></>
                  )}
                </h1>
                <p className="text-xl text-slate-500 font-medium leading-relaxed italic max-w-2xl mx-auto">
                  Discover matching donors and automate grant outreach with zero-hallucination AI grounding.
                </p>
              </div>

              <div className="max-w-5xl mx-auto space-y-12">
                <OrganizationProfile profile={profile} onUpdate={setProfile} />
                
                <div className={`${!profile ? 'opacity-30 pointer-events-none grayscale' : ''} transition-all duration-500`}>
                  <div className="mb-6 flex items-center justify-between">
                     <h3 className="text-xl font-extrabold text-midnight tracking-tight flex items-center">
                       <svg className="w-5 h-5 mr-3 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                       Donor Discovery
                     </h3>
                     {!profile && <span className="text-xs font-bold text-amber-600 animate-pulse">Complete Profile to Unlock Search</span>}
                  </div>
                  <SearchPanel onSearch={handleSearch} isLoading={isLoading} />
                </div>
              </div>

              {error && (
                <div className="max-w-5xl mx-auto mb-10 bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-700 flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {isLoading && (
                <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
                  <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2.5 h-2.5 bg-brand-600 rounded-full animate-bounce"></div>
                      <div className="w-2.5 h-2.5 bg-brand-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2.5 h-2.5 bg-brand-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-2xl font-black text-midnight mb-2">Analyzing Ecosystems...</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-6">
                      <LeadSkeleton />
                      <LeadSkeleton />
                    </div>
                    <div className="lg:col-span-4 h-96 bg-slate-50 rounded-[2rem] animate-pulse"></div>
                  </div>
                </div>
              )}

              {result && !isLoading && (
                <div className="max-w-6xl mx-auto">
                  <DonorList 
                    leads={result.leads} 
                    sources={result.sources} 
                    analysis={result.analysis} 
                    isPro={isPro}
                    profile={profile}
                    onUpgradeClick={() => setActiveView('billing')}
                    nonprofitSector={searchContext}
                    onSaveDraft={handleSaveDraft}
                  />
                </div>
              )}
            </div>
          )}

          {activeView === 'trust-center' && <VerificationCenter />}
          {activeView === 'billing' && <SubscriptionPanel isPro={isPro} onUpgrade={() => setIsPro(true)} onCancel={() => setIsPro(false)} />}
          {activeView === 'account' && currentUser && <SecurityPortal user={currentUser} onUpdateUser={setCurrentUser} />}
        </div>
      </Layout>
      <DebugPanel />
      <Analytics />
      <SpeedInsights />
    </>
  );
};

export default App;
