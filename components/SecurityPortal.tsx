
import React, { useState, useEffect } from 'react';
import { User, LoginActivity } from '../types';

interface SecurityPortalProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
}

const MOCK_ACTIVITY: LoginActivity[] = [
  { id: '1', device: 'MacBook Pro • Chrome', location: 'San Francisco, US', ip: '192.168.1.1', timestamp: 'Just now', isCurrent: true },
  { id: '2', device: 'iPhone 15 Pro • Safari', location: 'San Francisco, US', ip: '172.20.10.4', timestamp: '2 hours ago', isCurrent: false },
  { id: '3', device: 'Windows PC • Edge', location: 'London, UK', ip: '82.14.23.11', timestamp: '3 days ago', isCurrent: false },
];

export const SecurityPortal: React.FC<SecurityPortalProps> = ({ user, onUpdateUser }) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Basic password strength calculation
    let strength = 0;
    if (newPassword.length > 6) strength += 25;
    if (/[A-Z]/.test(newPassword)) strength += 25;
    if (/[0-9]/.test(newPassword)) strength += 25;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 25;
    setPasswordStrength(strength);
  }, [newPassword]);

  const handleToggle2FA = () => {
    if (user.twoFactorEnabled) {
      // If enabling, just turn off directly for this mock
      onUpdateUser({ ...user, twoFactorEnabled: false });
    } else {
      setShowTwoFactorModal(true);
    }
  };

  const verify2FA = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onUpdateUser({ ...user, twoFactorEnabled: true });
      setIsVerifying(false);
      setShowTwoFactorModal(false);
      setTwoFactorCode('');
    }, 1500);
  };

  const securityScore = user.twoFactorEnabled ? 95 : 65;

  return (
    <div className="space-y-8 animate-slide-up">
      {/* Security Health Header */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none transition-all group-hover:bg-emerald-500/10"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-midnight tracking-tight flex items-center">
              <svg className="w-5 h-5 mr-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              Security Governance
            </h3>
            <p className="text-slate-500 text-sm font-medium italic">Manage authentication layers and audit account access.</p>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Protection Strength</span>
              <div className="flex items-center space-x-3">
                <span className={`text-2xl font-black tracking-tighter ${securityScore >= 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{securityScore}%</span>
                <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full transition-all duration-1000 ${securityScore >= 90 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]'}`}
                    style={{ width: `${securityScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Authentication Settings */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm space-y-8">
          <h4 className="text-lg font-black text-midnight uppercase tracking-tight border-b border-slate-100 pb-4">Authentication</h4>
          
          <div className="space-y-6">
            {/* Two-Factor Auth */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${user.twoFactorEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <div>
                  <span className="text-sm font-black text-midnight block">Two-Factor Auth</span>
                  <p className="text-[10px] text-slate-500 font-medium">Extra layer of security for logins.</p>
                </div>
              </div>
              <button 
                onClick={handleToggle2FA}
                className={`w-14 h-7 rounded-full transition-all relative flex items-center px-1 ${user.twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all transform ${user.twoFactorEnabled ? 'translate-x-7' : 'translate-x-0'}`}></div>
              </button>
            </div>

            {/* Password */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                </div>
                <div>
                  <span className="text-sm font-black text-midnight block">Account Password</span>
                  <p className="text-[10px] text-slate-500 font-medium italic">Last updated 4 months ago.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChangingPassword(true)}
                className="text-[10px] font-black text-brand-600 uppercase tracking-widest hover:underline"
              >
                Reset
              </button>
            </div>
          </div>

          {isChangingPassword && (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-slide-up space-y-4">
              <div className="space-y-1">
                <input type="password" placeholder="Current Password" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="space-y-1">
                <input 
                  type="password" 
                  placeholder="New Password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-brand-500" 
                />
                {newPassword && (
                  <div className="px-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[8px] font-black uppercase text-slate-400">Strength</span>
                      <span className={`text-[8px] font-black uppercase ${passwordStrength < 50 ? 'text-rose-500' : passwordStrength < 100 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {passwordStrength < 50 ? 'Weak' : passwordStrength < 100 ? 'Fair' : 'Strong'}
                      </span>
                    </div>
                    <div className="h-1 bg-white rounded-full overflow-hidden border border-slate-200">
                      <div 
                        className={`h-full transition-all duration-500 ${passwordStrength < 50 ? 'bg-rose-500' : passwordStrength < 100 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${passwordStrength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex space-x-2">
                <button onClick={() => { setIsChangingPassword(false); setNewPassword(''); }} className="flex-grow bg-midnight text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">Update Password</button>
                <button onClick={() => { setIsChangingPassword(false); setNewPassword(''); }} className="px-4 text-slate-400 text-[10px] font-bold hover:text-midnight transition-colors">Cancel</button>
              </div>
            </div>
          )}
        </section>

        {/* Login Activity */}
        <section className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm space-y-8 overflow-hidden relative">
          <h4 className="text-lg font-black text-midnight uppercase tracking-tight border-b border-slate-100 pb-4 flex items-center">
            Recent Activity
            <span className="ml-3 px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full border border-emerald-100">Live</span>
          </h4>
          
          <div className="space-y-6 relative">
            <div className="absolute left-[23px] top-2 bottom-4 w-px bg-slate-100"></div>
            {MOCK_ACTIVITY.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-6 relative z-10 group/item">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${activity.isCurrent ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-100' : 'bg-white border-slate-100 text-slate-400 group-hover/item:border-slate-200'}`}>
                  {activity.device.includes('iPhone') ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  )}
                </div>
                <div className="flex-grow pt-1">
                  <div className="flex justify-between">
                    <span className="text-xs font-black text-midnight block">{activity.device}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{activity.timestamp}</span>
                  </div>
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-[10px] text-slate-500 font-medium italic">{activity.location}</span>
                    <span className="text-[10px] text-slate-300 font-black">•</span>
                    <span className="text-[10px] text-slate-400 font-mono">{activity.ip}</span>
                  </div>
                  {activity.isCurrent && (
                    <div className="mt-2 inline-flex items-center space-x-1.5 px-2 py-0.5 bg-brand-50 rounded-lg border border-brand-100">
                      <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></div>
                      <span className="text-[8px] font-black text-brand-600 uppercase tracking-widest">Active Session</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 transition-all">
            Sign out of all other sessions
          </button>
        </section>
      </div>

      {/* 2FA Verification Modal */}
      {showTwoFactorModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-midnight/90 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-[2rem] p-8 shadow-2xl max-w-sm w-full border border-slate-200">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center text-brand-600 mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-black text-midnight tracking-tight">Enable 2FA</h3>
              <p className="text-slate-500 text-xs mt-2 italic font-medium">Verify your device by entering the 6-digit code sent to your registered email.</p>
            </div>
            
            <div className="space-y-4">
              <input 
                type="text" 
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                placeholder="0 0 0 0 0 0" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-center text-2xl font-black tracking-[0.5em] text-midnight focus:ring-2 focus:ring-brand-600 outline-none"
              />
              <button 
                onClick={verify2FA}
                disabled={twoFactorCode.length < 6 || isVerifying}
                className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${twoFactorCode.length === 6 ? 'bg-brand-600 text-white shadow-xl shadow-brand-100 hover:bg-brand-500' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                {isVerifying ? (
                  <svg className="animate-spin h-5 w-5 text-white mx-auto" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Confirm Verification'}
              </button>
              <button 
                onClick={() => { setShowTwoFactorModal(false); setTwoFactorCode(''); }}
                className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-midnight transition-colors"
              >
                Cancel Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Security Controls */}
      <section className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-brand-500"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center justify-center md:justify-start">
              <svg className="w-5 h-5 mr-3 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
              Biometric & API Keys
            </h4>
            <p className="text-slate-400 text-sm font-medium italic">Configure advanced hardware security and developer access.</p>
          </div>
          <div className="flex space-x-4">
            <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
              Manage API Keys
            </button>
            <button className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-brand-900/40">
              Setup Passkey
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
