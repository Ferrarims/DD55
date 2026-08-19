import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { getWeaponMasteryDescription } from '../../../../game/combatUtils';

export const HeroMasteryAndSpells: React.FC = () => {
  const {
    character,
    activeEntity,
    isBattleOver,
    weaponMasteryInfo,
    secondWindUses,
    hasMagicCapability,
    spellSlots,
    spellSlotsMax,
    handleHeroMagicSpell
  } = useGameContext();

  const hasMastery = Boolean(weaponMasteryInfo);
  const hasTactical = Boolean(character?.level >= 2 && (character?.class_name?.toLowerCase().includes('guerreiro') || character?.class_name?.toLowerCase().includes('fighter')));

  const inCombat = !isBattleOver;
  const isHeroTurn = !inCombat || (activeEntity?.type === 'hero' && !activeEntity?.isDead);
  const canMagic = isHeroTurn && activeEntity?.hasAction && spellSlots > 0;

  return (
    <>
      {/* Maestria de Arma e Mente Tática */}
      {hasMastery && hasTactical ? (
        <div className="col-span-2 grid grid-cols-2 gap-1.5">
          {/* Maestria */}
          <div className="py-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center justify-between gap-1 shadow opacity-80" title={getWeaponMasteryDescription(weaponMasteryInfo.name)}>
            <span className="text-amber-300/90 font-semibold truncate flex items-center gap-1">
              <span>🎯</span> Maestria: {weaponMasteryInfo.name}
            </span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700 font-mono shrink-0">
              Sempre Ativa
            </span>
          </div>
          {/* Mente Tática */}
          <div className="py-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center justify-between gap-1 shadow opacity-80" title="Mente Tática: Ao falhar em um teste de habilidade, gasta automaticamente 1 uso de Recuperar Fôlego para rolar 1d10 e somar.">
            <span className="text-cyan-300/90 font-semibold truncate flex items-center gap-1">
              <span>🧠</span> Mente Tática
            </span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700 font-mono shrink-0">
              {secondWindUses > 0 ? '(Automático)' : '(Sem Fôlego)'}
            </span>
          </div>
        </div>
      ) : hasMastery ? (
        <div className="col-span-2 py-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center justify-between gap-1 shadow opacity-80" title={getWeaponMasteryDescription(weaponMasteryInfo.name)}>
          <span className="text-amber-300/90 font-semibold truncate flex items-center gap-1.5">
            <span>🎯</span> Maestria: {weaponMasteryInfo.name}
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700 font-mono shrink-0">
            Sempre Ativa
          </span>
        </div>
      ) : hasTactical ? (
        <div className="col-span-2 py-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center justify-between gap-1 shadow opacity-80" title="Mente Tática: Ao falhar em um teste de habilidade, gasta automaticamente 1 uso de Recuperar Fôlego para rolar 1d10 e somar.">
          <span className="text-cyan-300/90 font-semibold truncate flex items-center gap-1.5">
            <span>🧠</span> Mente Tática
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700 font-mono shrink-0">
            {secondWindUses > 0 ? '(Automático)' : '(Sem Fôlego)'}
          </span>
        </div>
      ) : null}

      {/* 2. Conjurar Magia */}
      {hasMagicCapability && (
        <button
          onClick={() => handleHeroMagicSpell()}
          disabled={!canMagic}
          className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
            canMagic
              ? 'bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border-purple-500/50'
              : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
          }`}
        >
          <span className="truncate">🪄 Magia</span>
          <span className="text-[9px] px-1 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 shrink-0">
            {spellSlots}/{spellSlotsMax}
          </span>
        </button>
      )}
    </>
  );
};
