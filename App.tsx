
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
import { findDonors } from './services/geminiService';
import { SearchResult, AppView, NonprofitProfile, User, DraftProposal } from './types';
import { Analytics } from '@vercel/analytics/react';

const LeadSkeleton = () => (
  <div className="bg-white rounded-[1.5rem] border border-slate-200/60 p-8 shadow-sm animate-pulse">
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
      <div className="space-y-4 flex-grow">
        <div className="flex space-x-2">
          <div className="h-5 w-20 bg-slate-100 rounded-lg"></div>
          <div className="h-5 w-32 bg-slate-50 rounded-lg"></div>
        </div>
        <div className="h-8 w-3/4 bg-slate-100 rounded-xl"></div>
        <div className="h-6 w-1/2 bg-slate-50 rounded-lg"></div>
        <div className="flex space-x-2">
          <div className="h-4 w-16 bg-slate-100 rounded-full"></div>
          <div className="h-4 w-16 bg-slate-100 rounded-full"></div>
          <div className="h-4 w-16 bg-slate-100 rounded-full"></div>
        </div>
      </div>
      <div className="w-40 h-16 bg-slate-50 rounded-2xl border border-slate-100"></div>
    </div>
    <div className="space-y-3 mb-8">
      <div className="h-4 w-full bg-slate-50 rounded"></div>
      <div className="h-4 w-full bg-slate-50 rounded"></div>
      <div className="h-4 w-2/3 bg-slate-50 rounded"></div>
    </div>
    <div className="flex space-x-3 pt-6 border-t border-slate-50">
      <div className="h-10 w-40 bg-slate-100 rounded-xl"></div>
      <div className="h-10 w-48 bg-slate-100 rounded-xl"></div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('discovery');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchContext, setSearchContext] = useState<string>('');
  
  // Organization State
  const [profile, setProfile] = useState<NonprofitProfile | null>(null);

  // User State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState<DraftProposal[]>([]);

  // Subscription State - Now active by default
  const [isPro, setIsPro] = useState(true);

  const handleSearch = async (category: string, region: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null); // Clear previous results to show skeleton
    setSearchContext(category);
    try {
      const data = await findDonors(category, region);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch donor data. Please check your network or try a different region.");
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

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
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
                      <p className="text-slate-500 max-w-sm mx-auto font-medium italic">
                        Cross-referencing global philanthropy indices with regional registration databases.
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8 space-y-6">
                      <LeadSkeleton />
                      <LeadSkeleton />
                      <LeadSkeleton />
                    </div>
                    <div className="lg:col-span-4 space-y-8">
                      <div className="h-64 bg-slate-100 rounded-[2rem] animate-pulse"></div>
                      <div className="h-80 bg-slate-50 rounded-[2rem] animate-pulse border border-slate-100"></div>
                    </div>
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

              {!result && !isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12 max-w-5xl mx-auto">
                  {[
                    { title: "Strategic Audit", desc: "Real-time scans of foundation spending and CSR reports.", icon: "🔍" },
                    { title: "Mission Matching", desc: "AI calculates donor alignment based on your specific profile.", icon: "🤝" },
                    { title: "Grounding Data", desc: "Every insight is backed by verified links to official sources.", icon: "🛡️" }
                  ].map((feature, i) => (
                    <div key={i} className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm text-center hover:shadow-lg transition-all group">
                      <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all">{feature.icon}</div>
                      <h3 className="text-lg font-black text-midnight mb-3 uppercase tracking-tight">{feature.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'trust-center' && (
            <div className="space-y-12 pb-20">
              <VerificationCenter />
              <div className="border-t border-slate-200 pt-12">
                <ReviewSection />
              </div>
            </div>
          )}

          {activeView === 'billing' && (
            <SubscriptionPanel 
              isPro={isPro} 
              onUpgrade={() => {
                setIsPro(true);
                setActiveView('discovery');
              }} 
              onCancel={() => setIsPro(false)} 
            />
          )}

          {activeView === 'account' && currentUser && (
            <div className="max-w-4xl mx-auto space-y-12 py-10 animate-slide-up">
              <div className="flex items-center justify-between">
                <h2 className="text-4xl font-black text-midnight tracking-tight">Account Settings</h2>
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${isPro ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}>
                  {isPro ? 'Enterprise Pro Account' : 'Standard Free Tier'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="md:col-span-2 space-y-8">
                  {savedDrafts.length > 0 && (
                    <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                      <h3 className="text-xl font-extrabold text-midnight mb-8">Saved Proposals ({savedDrafts.length})</h3>
                      <div className="space-y-4">
                        {savedDrafts.map(draft => (
                          <div key={draft.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50 flex items-center justify-between group">
                            <div>
                              <p className="text-sm font-black text-midnight">{draft.projectTitle}</p>
                              <p className="text-xs text-slate-500">Donor: {draft.donorName} • Saved {new Date(draft.createdAt).toLocaleDateString()}</p>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-brand-600 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-extrabold text-midnight mb-8">Personal Information</h3>
                    <div className="space-y-6">
                      <div className="flex flex-col space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          type="text" 
                          defaultValue={currentUser.name}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-600 outline-none transition-all"
                        />
                      </div>
                      <div className="flex flex-col space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                          type="email" 
                          defaultValue={currentUser.email}
                          readOnly
                          className="bg-slate-100 border border-slate-200 rounded-xl px-5 py-4 text-sm text-slate-500 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="mt-10 flex justify-end">
                      <button className="bg-midnight text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">Update Information</button>
                    </div>
                  </section>

                  <SecurityPortal user={currentUser} onUpdateUser={handleUpdateUser} />

                  <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-extrabold text-midnight mb-4">Linked Organization</h3>
                    <p className="text-slate-500 text-sm mb-8 italic">Manage which nonprofit mission powers your AI discovery.</p>
                    
                    {profile ? (
                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-brand-600 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          </div>
                          <span className="font-bold text-midnight">{profile.name}</span>
                        </div>
                        <button onClick={() => setActiveView('discovery')} className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline">Manage Profile</button>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-slate-400 text-sm mb-4">No organization linked yet.</p>
                        <button onClick={() => setActiveView('discovery')} className="bg-brand-50 text-brand-600 px-6 py-2 rounded-xl text-xs font-bold border border-brand-100 hover:bg-brand-100 transition-all">Setup Profile</button>
                      </div>
                    )}
                  </section>
                </div>

                <div className="space-y-8">
                  <section className="bg-midnight text-white p-8 rounded-[2.5rem] shadow-xl">
                    <h3 className="text-lg font-black mb-6 flex items-center">
                      <svg className="w-5 h-5 mr-3 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Scout Intelligence
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium italic">Your account is secured by our global impact nodes. We never sell your organizational data.</p>
                    <div className="space-y-4">
                      <button className="w-full text-left p-4 bg-slate-800 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all flex items-center justify-between group">
                        <span>Encryption Details</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded uppercase font-black">AES-256</span>
                      </button>
                    </div>
                  </section>

                  <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm text-center">
                    <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </div>
                    <h4 className="font-bold text-midnight mb-2">Delete Account</h4>
                    <p className="text-xs text-slate-500 mb-6 italic leading-relaxed">Permanently remove your profile and history. This action is irreversible.</p>
                    <button className="text-rose-500 text-[10px] font-black uppercase tracking-[0.2em] hover:underline">Request Deletion</button>
                  </section>
                </div>
              </div>
            </div>
          )}

          {showAuthModal && (
            <AuthModal 
              onClose={() => setShowAuthModal(false)} 
              onLogin={handleLogin} 
            />
          )}
        </div>
      </Layout>
      <Analytics />
    </>
  );
};

export default App;
