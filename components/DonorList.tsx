
import React, { useState, useEffect } from 'react';
import { DonorLead, GroundingSource, NonprofitProfile, DraftProposal } from '../types';
import { generateOutreachDraft } from '../services/geminiService';
import { GrantProposalModal } from './GrantProposalModal';

interface ContactRecord {
  date: string;
  notes: string;
}

interface DonorListProps {
  leads: DonorLead[];
  sources: GroundingSource[];
  analysis: string;
  isPro: boolean;
  onUpgradeClick?: () => void;
  nonprofitSector: string;
  profile: NonprofitProfile | null;
  onSaveDraft?: (draft: DraftProposal) => void;
}

export const DonorList: React.FC<DonorListProps> = ({ 
  leads, 
  sources, 
  analysis, 
  isPro, 
  onUpgradeClick,
  nonprofitSector,
  profile,
  onSaveDraft
}) => {
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [activeDraft, setActiveDraft] = useState<{ id: string, text: string } | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAnimateStart, setIsAnimateStart] = useState(false);
  const [savedOutreachIds, setSavedOutreachIds] = useState<Set<string>>(new Set());
  
  // Enhanced Contact Tracking State
  const [contactLog, setContactLog] = useState<Record<string, ContactRecord>>({});
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  
  // Proposal Modal State
  const [selectedDonorForProposal, setSelectedDonorForProposal] = useState<DonorLead | null>(null);

  // Trigger progress bar animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimateStart(true), 100);
    return () => clearTimeout(timer);
  }, [leads]);

  const handleGenerateDraft = async (lead: DonorLead, id: string) => {
    if (!isPro) {
      onUpgradeClick?.();
      return;
    }

    setLoadingDraft(true);
    setDraftingId(id);
    setActiveDraft(null);

    try {
      const draft = await generateOutreachDraft(
        lead.name,
        lead.type,
        lead.focusAreas,
        nonprofitSector
      );
      setActiveDraft({ id, text: draft });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDraft(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveOutreachToDrafts = (text: string, lead: DonorLead, id: string) => {
    if (!isPro) {
      onUpgradeClick?.();
      return;
    }

    const draft: DraftProposal = {
      id: Math.random().toString(36).substr(2, 9),
      donorName: lead.name,
      projectTitle: "Initial Outreach Email",
      content: text,
      createdAt: new Date().toISOString()
    };

    onSaveDraft?.(draft);
    setSavedOutreachIds(prev => new Set(prev).add(id));
    setTimeout(() => {
      setSavedOutreachIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 3000);
  };

  const handleToggleContacted = (id: string) => {
    setContactLog(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = {
          date: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
          notes: ''
        };
      }
      return next;
    });
  };

  const handleSaveNotes = (id: string) => {
    setContactLog(prev => ({
      ...prev,
      [id]: { ...prev[id], notes: tempNote }
    }));
    setEditingNotesId(null);
    setTempNote('');
  };

  const startEditingNotes = (id: string) => {
    setTempNote(contactLog[id]?.notes || '');
    setEditingNotesId(id);
  };

  const handleExportCSV = () => {
    if (leads.length === 0) return;

    const headers = ['Name', 'Type', 'Relevance Score', 'Email', 'Focus Areas', 'Description', 'Status', 'Contact Date', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...leads.map((lead, idx) => {
        const record = contactLog[`lead-${idx}`];
        const status = record ? 'Contacted' : 'Pending';
        const contactDate = record ? record.date : 'N/A';
        const notes = record ? record.notes : '';
        const row = [
          `"${lead.name.replace(/"/g, '""')}"`,
          `"${lead.type}"`,
          `${lead.relevanceScore}`,
          `"${lead.email}"`,
          `"${lead.focusAreas.join('; ')}"`,
          `"${lead.description.replace(/"/g, '""')}"`,
          `"${status}"`,
          `"${contactDate}"`,
          `"${notes.replace(/"/g, '""')}"`
        ];
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `donor_leads_${nonprofitSector.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 90) return 'from-emerald-400 to-emerald-600';
    if (score >= 75) return 'from-indigo-400 to-indigo-600';
    return 'from-amber-400 to-amber-600';
  };

  const getScoreTextClass = (score: number) => {
    if (score >= 90) return 'text-emerald-700';
    if (score >= 75) return 'text-brand-700';
    return 'text-amber-700';
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-8 bg-brand-600 rounded-full"></div>
              <h3 className="text-2xl font-extrabold text-midnight tracking-tight">Lead Audit</h3>
            </div>
            
            <div className="flex items-center space-x-3">
              <button 
                onClick={handleExportCSV}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-50 hover:text-brand-600 hover:border-brand-200 transition-all shadow-sm uppercase tracking-widest"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Export CSV</span>
              </button>
              
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span>{leads.length} Matches Found</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {leads.map((lead, idx) => {
              const leadId = `lead-${idx}`;
              const emailCopyId = `email-${leadId}`;
              const draftCopyId = `${leadId}-draft`;
              
              const isDraftingThis = draftingId === leadId;
              const hasDraftThis = activeDraft?.id === leadId;
              const isEmailCopied = copiedId === emailCopyId;
              const isDraftCopied = copiedId === draftCopyId;
              const isSaved = savedOutreachIds.has(leadId);
              const contactRecord = contactLog[leadId];
              const isContacted = !!contactRecord;
              const barGradient = getScoreColorClass(lead.relevanceScore);
              const scoreText = getScoreTextClass(lead.relevanceScore);

              return (
                <div 
                  key={idx} 
                  className={`bg-white rounded-[1.5rem] border border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden group ${isContacted ? 'border-brand-100' : ''}`}
                >
                  <div className={`p-8 ${isContacted ? 'bg-slate-50/30' : ''} transition-colors`}>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                      <div className="space-y-3 flex-grow">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            lead.type === 'Corporate' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
                            lead.type === 'Foundation' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                            'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {lead.type}
                          </span>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">• Verified Registry</span>
                          
                          {isContacted && (
                            <div className="relative group/badge">
                              <button 
                                onClick={() => startEditingNotes(leadId)}
                                className="bg-brand-600 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-lg shadow-brand-100 animate-fade-in tracking-widest hover:bg-brand-700 transition-colors flex items-center space-x-1"
                              >
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                <span>Contacted</span>
                                {contactRecord.notes && (
                                  <svg className="w-2.5 h-2.5 ml-1 opacity-70" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zm-4 0H9v2h2V9z" /></svg>
                                )}
                              </button>
                              
                              {/* Hover Tooltip for Contact History */}
                              <div className="absolute top-full mt-2 left-0 z-20 w-64 invisible group-hover/badge:visible opacity-0 group-hover/badge:opacity-100 transition-all transform scale-95 group-hover/badge:scale-100">
                                <div className="bg-midnight text-white p-4 rounded-xl shadow-2xl border border-slate-700 text-left">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">History</span>
                                    <span className="text-[9px] text-brand-400 font-bold">{contactRecord.date}</span>
                                  </div>
                                  <div className="text-xs text-slate-300 leading-relaxed italic mb-3">
                                    {contactRecord.notes || "No notes added for this contact attempt."}
                                  </div>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); startEditingNotes(leadId); }}
                                    className="text-[9px] font-black text-brand-500 hover:text-brand-400 uppercase tracking-[0.2em]"
                                  >
                                    Edit Notes
                                  </button>
                                </div>
                                <div className="w-3 h-3 bg-midnight rotate-45 absolute -top-1.5 left-4 border-l border-t border-slate-700"></div>
                              </div>
                            </div>
                          )}
                        </div>
                        <h4 className={`font-extrabold text-midnight text-2xl group-hover:text-brand-600 transition-colors ${isContacted ? 'opacity-80' : ''}`}>
                          {lead.name}
                        </h4>
                        
                        <div className="flex items-center space-x-2 group/email relative">
                          <div className={`flex items-center space-x-2 text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 group-hover/email:border-brand-200 transition-all ${isContacted ? 'opacity-70' : ''}`}>
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <a href={`mailto:${lead.email}`} className="text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors">{lead.email}</a>
                            <button 
                              onClick={() => copyToClipboard(lead.email, emailCopyId)}
                              className={`ml-2 p-1.5 rounded-lg border transition-all ${isEmailCopied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-400 hover:text-brand-600 hover:border-brand-200 shadow-sm'}`}
                              title="Copy Email Address"
                            >
                              {isEmailCopied ? (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                              )}
                            </button>
                            {isEmailCopied && (
                              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-midnight text-white text-[9px] font-black uppercase px-2 py-1 rounded shadow-xl animate-bounce tracking-widest pointer-events-none">
                                Copied!
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                          {lead.focusAreas.map(area => (
                            <span key={area} className="text-[10px] px-3 py-1 bg-slate-50 text-slate-500 border border-slate-100 rounded-full font-bold uppercase">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className={`bg-slate-50/50 p-4 rounded-2xl border border-slate-100 min-w-[140px] ${isContacted ? 'opacity-60' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tighter">Mission Affinity</span>
                          <span className={`text-lg font-black tracking-tighter ${scoreText}`}>
                            {lead.relevanceScore}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-[1200ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-gradient-to-r ${barGradient}`}
                            style={{ width: isAnimateStart ? `${lead.relevanceScore}%` : '0%' }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <p className={`text-slate-600 leading-relaxed text-base mb-8 border-l-2 border-slate-100 pl-6 italic ${isContacted ? 'opacity-70' : ''}`}>
                      {lead.description}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-6 border-t border-slate-100">
                      <button 
                        onClick={() => handleGenerateDraft(lead, leadId)}
                        disabled={loadingDraft && isDraftingThis}
                        className={`flex-grow sm:flex-grow-0 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-xs font-extrabold transition-all border ${
                          isPro 
                            ? 'bg-midnight text-white hover:bg-slate-800 shadow-sm border-midnight' 
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border-slate-100'
                        }`}
                      >
                        {loadingDraft && isDraftingThis ? (
                          <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        )}
                        <span>{hasDraftThis ? 'Recalibrate Outreach' : 'Draft Outreach Email'}</span>
                        {!isPro && <span className="ml-2 text-[8px] bg-slate-200 text-slate-600 px-1 rounded uppercase">Pro</span>}
                      </button>

                      <button 
                        onClick={() => isPro ? setSelectedDonorForProposal(lead) : onUpgradeClick?.()}
                        className={`flex-grow sm:flex-grow-0 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl text-xs font-extrabold transition-all border ${
                          isPro 
                            ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-100 border-brand-600' 
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border-slate-100'
                        }`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <span>Draft Full Grant Proposal</span>
                        {!isPro && <span className="ml-2 text-[8px] bg-brand-600 text-white px-1 rounded uppercase">Pro</span>}
                      </button>
                      
                      <div className="flex items-center space-x-2 ml-auto">
                        <button 
                          onClick={() => handleToggleContacted(leadId)}
                          className={`p-3 rounded-xl transition-all border ${isContacted ? 'bg-brand-600 text-white border-brand-500 shadow-md' : 'bg-slate-50 text-slate-400 hover:text-brand-600 border-slate-100'}`}
                          title={isContacted ? "Reset Status" : "Mark as Contacted"}
                        >
                          {isContacted ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                          )}
                        </button>
                        <button className="p-3 bg-slate-50 text-slate-300 hover:text-rose-500 border border-slate-100 rounded-xl transition-all" title="Add to Shortlist">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Inline Notes Editor */}
                    {editingNotesId === leadId && (
                      <div className="mt-6 animate-slide-up">
                        <div className="bg-slate-50 p-6 rounded-2xl border border-brand-100 space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black text-midnight uppercase tracking-widest">Update Contact History</span>
                            <span className="text-[9px] text-slate-400 italic">Last Activity: {contactRecord?.date}</span>
                          </div>
                          <textarea 
                            value={tempNote}
                            onChange={(e) => setTempNote(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-brand-500 h-24 resize-none transition-all"
                            placeholder="Add notes about your outreach... (e.g., Spoke with program officer, follow-up scheduled for next Tuesday)"
                          />
                          <div className="flex justify-end space-x-2">
                            <button 
                              onClick={() => setEditingNotesId(null)}
                              className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-midnight"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleSaveNotes(leadId)}
                              className="bg-brand-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100"
                            >
                              Save History
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {hasDraftThis && activeDraft && (
                      <div className="mt-8 animate-slide-up">
                        <div className="bg-slate-900 rounded-2xl p-8 relative ring-1 ring-slate-800 shadow-2xl">
                          <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-2.5 h-2.5 bg-brand-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(79,70,229,0.8)]"></div>
                              <h5 className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em]">High-Impact Outreach Draft</h5>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleSaveOutreachToDrafts(activeDraft.text, lead, leadId)}
                                className={`transition-all px-3 py-1.5 rounded-lg flex items-center space-x-2 border text-[10px] font-bold ${
                                  isSaved 
                                    ? 'bg-emerald-600 border-emerald-500 text-white' 
                                    : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
                                }`}
                              >
                                {isSaved ? (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                    <span>SAVED TO DRAFTS</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                                    <span>SAVE TO DRAFTS</span>
                                  </>
                                )}
                              </button>
                              <button 
                                onClick={() => copyToClipboard(activeDraft.text, draftCopyId)}
                                className={`bg-slate-800 transition-all px-3 py-1.5 rounded-lg flex items-center space-x-2 border border-slate-700 ${isDraftCopied ? 'text-emerald-400 border-emerald-500/30' : 'text-slate-300 hover:text-white'}`}
                              >
                                {isDraftCopied ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                )}
                                <span className="text-[10px] font-bold">{isDraftCopied ? 'COPIED' : 'COPY CONTENT'}</span>
                              </button>
                            </div>
                          </div>
                          <div className="text-slate-300 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto custom-scrollbar pr-4">
                            {activeDraft.text}
                          </div>
                          <div className="mt-6 pt-5 border-t border-slate-800/50 flex items-center justify-between">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Model: Gemini 3 Flash-Pro</span>
                            <span className="text-[10px] text-slate-500 italic">Replace bracketed fields with project specifics.</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-10 rounded-[2rem] border border-slate-200 shadow-sm mt-12">
            <h3 className="text-2xl font-extrabold text-midnight mb-6 flex items-center space-x-3">
              <div className="p-2 bg-brand-50 rounded-lg">
                <svg className="w-6 h-6 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span>Intelligence Synthesis</span>
            </h3>
            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-base font-medium opacity-90 prose prose-indigo max-w-none">
              {analysis}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-midnight text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-600/10 blur-[60px] group-hover:bg-brand-600/20 transition-all"></div>
            <h3 className="text-xl font-extrabold mb-6 flex items-center space-x-3">
              <svg className="w-6 h-6 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.826L10.242 9.172a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102 1.101" />
              </svg>
              <span>Grounding Nodes</span>
            </h3>
            <div className="space-y-5">
              {sources.map((source, idx) => (
                <div key={idx} className="group/item">
                  <a 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:bg-slate-800 hover:border-brand-500/50 transition-all"
                  >
                    <span className="text-xs font-extrabold text-brand-200 group-hover/item:text-brand-300 transition-colors block mb-1">
                      {source.title}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate font-mono">
                      {source.uri}
                    </span>
                  </a>
                </div>
              ))}
              {sources.length === 0 && (
                <div className="text-sm text-slate-500 italic py-4">Verification nodes currently initializing...</div>
              )}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-800">
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                Our AI cross-references institutional registries and philanthropic indices to ensure zero-hallucination lead generation.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-8">
            <h3 className="text-xl font-extrabold text-midnight mb-2">Market Outlook</h3>
            
            <div className="space-y-6">
              {[
                { label: 'Yield Expectation', value: '$25k — $100k', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Saturation Level', value: 'Moderate Intensity', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'bg-orange-50 text-orange-600' },
                { label: 'Closing Efficiency', value: 'High Probability', icon: 'M14 10h4.757c1.27 0 1.906 1.535 1.01 2.432l-3.32 3.32a.6.6 0 00.108.97l2.844 1.551a.6.6 0 01-.225 1.108h-7.39a.6.6 0 01-.51-.284l-3.303-5.284a.6.6 0 01-.51-.916H10a2 2 0 012-2z', color: 'bg-brand-50 text-brand-600' }
              ].map((stat, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${stat.color}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={stat.icon} /></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                    <span className="text-base font-extrabold text-midnight">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] font-black text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest">
              Unlock Deep Ecosystem Metrics
            </button>
          </div>
        </div>
      </div>
      
      {/* Proposal Modal */}
      {selectedDonorForProposal && (
        <GrantProposalModal 
          donor={selectedDonorForProposal}
          isPro={isPro}
          profile={profile}
          onClose={() => setSelectedDonorForProposal(null)}
          onSaveDraft={onSaveDraft}
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
};
