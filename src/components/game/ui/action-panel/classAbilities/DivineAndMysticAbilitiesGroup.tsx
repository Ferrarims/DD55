import React from 'react';
import { useGameContext } from '../../../context/GameContext';

export const DivineAndMysticAbilitiesGroup: React.FC = () => {
  const {
    activeEntity,
    isBattleOver,
    bardicInspirationUses,
    bardicInspirationMaxUses,
    handleHeroBardicInspiration,
    layOnHandsPool,
    layOnHandsMaxPool,
    handleHeroLayOnHands,
    focusPointsUses,
    focusPointsMaxUses,
    handleHeroFlurryOfBlows,
    wildShapeUses,
    wildShapeMaxUses,
    handleHeroWildShape,
    luckyPoints,
    luckyMaxPoints,
    handleUseLuckyPoint,
    channelDivinityUses,
    channelDivinityMaxUses,
    handleHeroChannelDivinity,
    getActiveFeats,
  } = useGameContext();

  const inCombat = !isBattleOver;
  const isHeroTurn = !inCombat || (activeEntity?.type === 'hero' && !activeEntity?.isDead);

  const activeFeatsList = getActiveFeats();
  const hasLuckyFeat = activeFeatsList.includes('Sortudo') || activeFeatsList.includes('Lucky');

  return (
    <>
      {/* 1. Inspiração Bárdica (Bardo) */}
      {bardicInspirationMaxUses > 0 && (() => {
        const canInspire = isHeroTurn && (isBattleOver || activeEntity.hasBonusAction) && bardicInspirationUses > 0;
        return (
          <button
            onClick={handleHeroBardicInspiration}
            disabled={!canInspire}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canInspire
                ? 'bg-pink-900/80 hover:bg-pink-800 text-pink-100 border-pink-500/50'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title="Concede dado de inspiração bônus"
          >
            <span className="truncate">🪕 Inspiração</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-pink-950 text-pink-300 border border-pink-500/30 shrink-0">
              {bardicInspirationUses}/{bardicInspirationMaxUses}
            </span>
          </button>
        );
      })()}

      {/* 2. Imposição de Mãos (Paladino) */}
      {layOnHandsMaxPool > 0 && (() => {
        const canLayOnHands = isHeroTurn && (isBattleOver || activeEntity.hasAction) && layOnHandsPool > 0 && activeEntity.currentHp < activeEntity.maxHp;
        return (
          <button
            onClick={handleHeroLayOnHands}
            disabled={!canLayOnHands}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canLayOnHands
                ? 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border-emerald-500/50'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title="Cura ferimentos com Imposição de Mãos"
          >
            <span className="truncate">✨ Imp. Mãos</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 shrink-0">
              {layOnHandsPool} PV
            </span>
          </button>
        );
      })()}

      {/* 3. Rajada de Golpes (Monge) */}
      {focusPointsMaxUses > 0 && (() => {
        const canFlurry = isHeroTurn && (isBattleOver || activeEntity.hasBonusAction) && focusPointsUses > 0;
        return (
          <button
            onClick={() => handleHeroFlurryOfBlows()}
            disabled={!canFlurry}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canFlurry
                ? 'bg-amber-900/80 hover:bg-amber-800 text-amber-100 border-amber-500/50'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title="Desfere golpe desarmado gastando 1 Ponto de Foco (Ki)"
          >
            <span className="truncate">👊 Rajada</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 shrink-0">
              {focusPointsUses}/{focusPointsMaxUses} Ki
            </span>
          </button>
        );
      })()}

      {/* 4. Forma Selvagem (Druida) */}
      {wildShapeMaxUses > 0 && (() => {
        const canWildShape = isHeroTurn && (isBattleOver || activeEntity.hasBonusAction) && wildShapeUses > 0;
        return (
          <button
            onClick={handleHeroWildShape}
            disabled={!canWildShape}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canWildShape
                ? 'bg-green-900/80 hover:bg-green-800 text-green-100 border-green-500/50'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title="Transforma-se em Forma Bestial de combate"
          >
            <span className="truncate">🐻 Forma Bicho</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-green-950 text-green-300 border border-green-500/30 shrink-0">
              {wildShapeUses}/{wildShapeMaxUses}
            </span>
          </button>
        );
      })()}

      {/* 5. Ponto de Sorte (Sortudo / Lucky) */}
      {hasLuckyFeat && (() => {
        const canLucky = isHeroTurn && luckyPoints > 0;
        return (
          <button
            onClick={handleUseLuckyPoint}
            disabled={!canLucky}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canLucky
                ? 'bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border-emerald-500/50'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title="Gasta 1 Ponto de Sorte para ter Vantagem no seu próximo teste!"
          >
            <span className="truncate">🍀 Sortudo (Sorte)</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 shrink-0">
              {luckyPoints}/{luckyMaxPoints}
            </span>
          </button>
        );
      })()}

      {/* 6. Canalizar Divindade (Clérigo / Paladino) */}
      {channelDivinityMaxUses > 0 && (() => {
        const canChannel = isHeroTurn && channelDivinityUses > 0 && (!inCombat || activeEntity.hasAction);
        return (
          <button
            onClick={handleHeroChannelDivinity}
            disabled={!canChannel}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canChannel
                ? 'bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 border-amber-500/50'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title="Invocação divina de cura radiante"
          >
            <span className="truncate">✨ Divindade</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 shrink-0">
              {channelDivinityUses}/{channelDivinityMaxUses}
            </span>
          </button>
        );
      })()}
    </>
  );
};
