import React from 'react';
import { useGameContext } from '../context/GameContext';

export const CombatHistoryPanel: React.FC = () => {
  const context = useGameContext();
  if (!context) return null;

  const { logs } = context;

  return (
    <div id="combat-history-panel" className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col h-[180px] shadow-xl">
      <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider block border-b border-slate-800 pb-1 mb-1.5 shrink-0">
        📜 Histórico de Combate
      </span>
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar">
        {logs.map((log, idx) => (
          <div
            key={`${log.id || 'log'}-${idx}`}
            className="p-1.5 bg-slate-950 rounded-lg border border-slate-800 text-[11px] space-y-0.5"
          >
            <div className="flex justify-between text-[9px] text-slate-500 font-mono">
              <span>{log.actorName}</span>
              <span>{log.timestamp}</span>
            </div>
            <div className="font-bold text-slate-200 text-[10px]">{log.title}</div>
            <div className="text-[10px] text-slate-400 leading-tight">{log.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
