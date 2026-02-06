
import React, { useState, useEffect } from 'react';
import { DebugLog } from '../types';

export const DebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    const handleDebugEvent = (event: any) => {
      setLogs(prev => [event.detail, ...prev].slice(0, 50));
    };

    window.addEventListener('donor-scout-debug', handleDebugEvent);
    return () => window.removeEventListener('donor-scout-debug', handleDebugEvent);
  }, []);

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-midnight rounded-2xl shadow-2xl flex items-center justify-center border border-slate-700 hover:scale-110 active:scale-95 transition-all group"
      >
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 rounded-full flex items-center justify-center text-[8px] font-black text-white ring-2 ring-white">
          {logs.length}
        </div>
        <svg className="w-6 h-6 text-brand-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      {/* Slide-over Console */}
      <div className={`fixed inset-y-0 right-0 z-[110] w-full max-w-lg bg-midnight/95 backdrop-blur-xl border-l border-slate-800 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></span>
                Intelligence Console
              </h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Real-time AI Grounding Monitor</p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setLogs([])}
                className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                title="Clear Session Logs"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-500 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>

          {/* Logs Feed */}
          <div className="flex-grow overflow-y-auto p-4 custom-scrollbar-dark font-mono text-xs">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30 grayscale">
                <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Awaiting Intelligence Bus...</p>
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map(log => (
                  <div key={log.id} className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/30 hover:border-slate-700 transition-all">
                    <button 
                      onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                      className="w-full flex items-center justify-between p-4 text-left group"
                    >
                      <div className="flex items-center space-x-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span className="font-black text-brand-400 text-[10px] uppercase">{log.method}</span>
                        <span className="text-slate-600 text-[9px]">{log.timestamp}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-500 text-[9px] font-bold">{log.latency}ms</span>
                        <svg className={`w-4 h-4 text-slate-600 transition-transform ${expandedLogId === log.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </button>
                    
                    {expandedLogId === log.id && (
                      <div className="p-4 border-t border-slate-800 bg-black/40 animate-slide-up space-y-4">
                        <div className="space-y-2">
                          <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Payload</h4>
                          <div className="bg-slate-900/80 p-3 rounded-lg overflow-x-auto text-brand-100 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                            {JSON.stringify(log.payload, null, 2)}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Response</h4>
                          <div className="bg-slate-900/80 p-3 rounded-lg overflow-x-auto text-emerald-100 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                            {typeof log.response === 'string' ? log.response : JSON.stringify(log.response, null, 2)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Model Index</span>
                <span className="text-[10px] font-bold text-white">Gemini 3 Pro</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Status</span>
                <span className="text-[10px] font-bold text-emerald-500">Connected</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Active Registry</span>
              <span className="text-[10px] font-bold text-brand-400">Mainnet-Grounding-V4</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar-dark::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-dark::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </>
  );
};
