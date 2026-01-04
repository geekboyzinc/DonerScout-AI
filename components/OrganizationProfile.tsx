
import React, { useState } from 'react';
import { NonprofitProfile } from '../types';

interface OrganizationProfileProps {
  profile: NonprofitProfile | null;
  onUpdate: (profile: NonprofitProfile) => void;
}

export const OrganizationProfile: React.FC<OrganizationProfileProps> = ({ profile, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(!profile);
  const [formData, setFormData] = useState<NonprofitProfile>(profile || {
    name: '',
    mission: '',
    impactStatement: '',
    website: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };

  if (!isEditing && profile) {
    return (
      <div className="bg-white rounded-[2rem] border border-slate-200/60 p-6 shadow-sm flex items-center justify-between group animate-fade-in">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 shadow-inner">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="text-lg font-extrabold text-midnight tracking-tight">{profile.name}</h4>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-100">Profile Active</span>
            </div>
            <p className="text-slate-500 text-xs font-medium max-w-md line-clamp-1 italic">{profile.mission}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsEditing(true)}
          className="px-6 py-2.5 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-midnight rounded-xl text-xs font-bold border border-slate-200 transition-all uppercase tracking-widest"
        >
          Modify Profile
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200/60 p-8 shadow-xl animate-slide-up">
      <div className="mb-6">
        <h3 className="text-xl font-extrabold text-midnight tracking-tight">Organization Profile</h3>
        <p className="text-slate-500 text-sm mt-1">Set your global mission to power all AI generation across the platform.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Organization Name</label>
            <input 
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-600 outline-none transition-all"
              placeholder="e.g. Hope Alliance International"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Website</label>
            <input 
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-600 outline-none transition-all"
              placeholder="https://www.yournonprofit.org"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Core Mission Statement</label>
          <textarea 
            required
            value={formData.mission}
            onChange={(e) => setFormData({...formData, mission: e.target.value})}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-600 outline-none transition-all h-24 resize-none"
            placeholder="What is your organization's ultimate goal?"
          />
        </div>
        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            className="px-10 py-3 bg-midnight text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};
