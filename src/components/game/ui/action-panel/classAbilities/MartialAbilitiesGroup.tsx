import React from 'react';
import { useGameContext } from '../../../context/GameContext';

export const MartialAbilitiesGroup: React.FC = () => {
  const {
    character,
    activeEntity,
    entities,
    heroEntity,
    isBattleOver,
    recklessAttackActive,
    handleHeroRecklessAttack,
    superiorityDiceUses,
    superiorityDiceMaxUses,
    handleHeroManeuver,
    indomitableUses,
    indomitableMaxUses,
    handleHeroIndomitable,
    hasSecondWindCapability,
    secondWindUses,
    secondWindMaxUses,
    handleHeroSecondWind,
    actionSurgeUses,
    actionSurgeMaxUses,
    handleHeroActionSurge,
    rageUses,
    rageMaxUses,
    handleHeroRage,
  } = useGameContext();

  const inCombat = !isBattleOver;
  const isHeroTurn = !inCombat || (activeEntity?.type === 'hero' && !activeEntity?.isDead);

  return (
    <>
      {/* 1. Ataque Imprudente (Bárbaro Nível 2+) */}
      {(character?.level >= 2 && (character?.class_name?.toLowerCase().includes('bárbaro') || character?.class_name?.toLowerCase().includes('barbarian'))) && (() => {
        const canReckless = isHeroTurn && (activeEntity.hasAction || (activeEntity.attacksRemaining || 0) > 0);
        return (
          <button
            onClick={handleHeroRecklessAttack}
            disabled={!canReckless}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              !canReckless
                ? 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
                : recklessAttackActive
                  ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                  : 'bg-orange-950/80 hover:bg-orange-900 text-orange-200 border-orange-500/50'
            }`}
            title="Vantagem nos ataques corpo a corpo do turno"
          >
            <span className="truncate">🪓 Imprudente</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-slate-950 text-amber-300 border border-amber-500/30 shrink-0">
              {recklessAttackActive ? 'On' : 'Vant'}
            </span>
          </button>
        );
      })()}

      {/* 2. Manobra Tática (Guerreiro Mestre da Batalha) */}
      {superiorityDiceMaxUses > 0 && (() => {
        const canManeuver = isHeroTurn && (activeEntity.hasAction || (activeEntity.attacksRemaining || 0) > 0) && superiorityDiceUses > 0;
        return (
          <button
            onClick={() => handleHeroManeuver()}
            disabled={!canManeuver}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canManeuver
                ? 'bg-amber-900/80 hover:bg-amber-800 text-amber-100 border-amber-500/50'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title="Executa Manobra Tática de Mestre da Batalha"
          >
            <span className="truncate">⚔️ Manobra</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 shrink-0">
              {superiorityDiceUses}/{superiorityDiceMaxUses}
            </span>
          </button>
        );
      })()}

      {/* 3. Indomável (Guerreiro) */}
      {indomitableMaxUses > 0 && (() => {
        const canIndomitable = isHeroTurn && indomitableUses > 0;
        return (
          <button
            onClick={handleHeroIndomitable}
            disabled={!canIndomitable}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canIndomitable
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-600'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title="Re-rola testes de resistência com bônus"
          >
            <span className="truncate">🛡️ Indomável</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-700 shrink-0">
              {indomitableUses}/{indomitableMaxUses}
            </span>
          </button>
        );
      })()}

      {/* 4. Segundo Fôlego / Recuperar Fôlego (Guerreiro) */}
      {hasSecondWindCapability && (() => {
        const currentHero = (activeEntity?.type === 'hero' ? activeEntity : null) || entities.find(e => e.type === 'hero') || heroEntity;
        const isHpFull = currentHero ? (currentHero.currentHp >= currentHero.maxHp) : false;
        const canSecondWind = secondWindUses > 0 && !isHpFull && (!inCombat || (isHeroTurn && activeEntity?.hasBonusAction));
        
        return (
          <button
            key="btn-second-wind"
            onClick={handleHeroSecondWind}
            disabled={!canSecondWind || isHpFull}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canSecondWind && !isHpFull
                ? 'bg-cyan-900/60 hover:bg-cyan-800/80 text-cyan-200 border-cyan-500/50 cursor-pointer'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title={
              isHpFull
                ? "Pontos de vida já estão em 100% (máximo). Não é possível usar o Recuperar Fôlego com a vida cheia."
                : secondWindUses <= 0
                  ? "Sem usos restantes de Recuperar Fôlego."
                  : "Recuperar Fôlego: Recupera pontos de vida instantaneamente (1d10 + Nível)."
            }
          >
            <span className="truncate">⚡ Recuperar Fôlego</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 shrink-0">
              {secondWindUses}/{secondWindMaxUses}
            </span>
          </button>
        );
      })()}

      {/* 5. Surto de Ação (Guerreiro) */}
      {actionSurgeMaxUses > 0 && (() => {
        const canActionSurge = inCombat && isHeroTurn && actionSurgeUses > 0 && !activeEntity.hasAction && (activeEntity.attacksRemaining || 0) <= 0;
        return (
          <button
            onClick={handleHeroActionSurge}
            disabled={!canActionSurge}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canActionSurge
                ? 'bg-gradient-to-r from-amber-600 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 text-slate-950 border-amber-300 animate-pulse'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title={
              !inCombat
                ? 'Surto de Ação só pode ser utilizado durante o combate!'
                : actionSurgeUses <= 0
                  ? 'Sem usos restantes de Surto de Ação.'
                  : activeEntity.hasAction || (activeEntity.attacksRemaining || 0) > 0
                    ? 'Surto de Ação fica disponível após você gastar a sua Ação Principal do turno.'
                    : 'Ganha +1 Ação Principal completa no seu turno (com Ataque Extra se possuir)'
            }
          >
            <span className="truncate">⚡ Surto de Ação</span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 border border-amber-400/40 shrink-0">
              {actionSurgeUses}/{actionSurgeMaxUses}
            </span>
          </button>
        );
      })()}

      {/* 6. Fúria Bárbara (Bárbaro) */}
      {rageMaxUses > 0 && (() => {
        const activeRage = activeEntity?.conditions?.includes('Fúria') || activeEntity?.conditions?.includes('Rage');
        const canRage = isHeroTurn && rageUses > 0 && (!inCombat || activeEntity.hasBonusAction) && !activeRage;
        return (
          <button
            onClick={handleHeroRage}
            disabled={!canRage}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canRage
                ? 'bg-red-900/80 hover:bg-red-800 text-red-100 border-red-500/50'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title={activeRage ? "Você já está em Fúria!" : "Entra em fúria (+2 Dano e +1 CA)"}
          >
            <span className="truncate">🔥 {activeRage ? 'Fúria (Ativa)' : 'Fúria'}</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30 shrink-0">
              {rageUses}/{rageMaxUses}
            </span>
          </button>
        );
      })()}
    </>
  );
};
