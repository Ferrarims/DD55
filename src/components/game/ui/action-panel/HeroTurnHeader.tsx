import React from 'react';
import { useGameContext } from '../../context/GameContext';

export const HeroTurnHeader: React.FC = () => {
  const {
    activeEntity,
    entities,
    isEntityVisible,
    advanceTurn,
    isBattleOver
  } = useGameContext();

  if (!activeEntity) return null;

  return (
    <div className="space-y-1.5 border-b border-slate-800 pb-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
          ⚔️ Turno de Combate
        </span>
        {activeEntity.type === 'hero' && (
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-red-500">
              {activeEntity.currentHp} {activeEntity.tempHp ? `(+${activeEntity.tempHp})` : ''} / {activeEntity.maxHp} HP
            </span>
          </div>
        )}
        <span className="text-[10px] text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
          {activeEntity.name}
        </span>
      </div>

      <div className="flex items-center justify-between gap-1.5">
        <div className="flex-1 flex flex-col justify-center text-xs bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 flex items-center gap-1">🏃 Mover</span>
          <span className="font-black text-amber-400 text-[11px] leading-tight">
            {entities.some(e => e.type === 'monster' && !e.isDead && isEntityVisible(e))
              ? `${activeEntity.remainingMovement * 1.5}m (${activeEntity.remainingMovement} cel)`
              : 'Livre'}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
            activeEntity.hasAction ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' : 'bg-slate-800/60 text-slate-500 border-slate-700 line-through'
          }`}>
            ⚔️ Ação
          </span>
          <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
            activeEntity.hasBonusAction ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700' : 'bg-slate-800/60 text-slate-500 border-slate-700 line-through'
          }`}>
            ⚡ Bônus
          </span>
          <span className={`px-2 py-1 rounded text-[10px] font-bold border ${
            activeEntity.hasReaction ? 'bg-purple-950/80 text-purple-300 border-purple-700' : 'bg-slate-800/60 text-slate-500 border-slate-700 line-through'
          }`}>
            🛡️ Reação
          </span>
        </div>
      </div>

      <div className="space-y-1.5 mt-2">
        <button
          onClick={advanceTurn}
          disabled={isBattleOver || (activeEntity?.type !== 'hero') || activeEntity?.isDead}
          className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl transition shadow flex items-center justify-center gap-1.5 border border-amber-300 disabled:opacity-50"
        >
          Finalizar Turno ⏭️
        </button>
      </div>
    </div>
  );
};
