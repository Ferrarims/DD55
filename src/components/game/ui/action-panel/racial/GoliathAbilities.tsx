import React from 'react';
import { useGameContext } from '../../../context/GameContext';
import { formatRoundsToTime } from './formatRoundsToTime';

export const GoliathAbilities: React.FC = () => {
  const {
    activeEntity,
    character,
    isBattleOver,
    largeFormUses,
    largeFormMaxUses,
    activeLargeForm,
    largeFormRoundsLeft,
    handleLargeForm,
    isGoliath,
    goliathAncestryUses,
    goliathAncestryMaxUses,
    isTeleportTargetMode,
    setIsTeleportTargetMode,
    addCombatLog,
  } = useGameContext();

  const inCombat = !isBattleOver;
  const isHeroTurn = !inCombat || (activeEntity?.type === 'hero' && !activeEntity?.isDead);

  return (
    <>
      {/* Golias: Forma Grande (Nível 5+) */}
      {largeFormMaxUses > 0 && (() => {
        const canLarge = isHeroTurn && (activeLargeForm ? true : ((largeFormUses > 0 || (largeFormRoundsLeft > 0 && largeFormRoundsLeft < 100)) && (!inCombat || activeEntity.hasBonusAction)));
        return (
          <button
            onClick={() => {
              handleLargeForm();
            }}
            disabled={!canLarge}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              !canLarge
                ? 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
                : activeLargeForm
                  ? 'bg-amber-950 hover:bg-amber-900 text-amber-200 border-amber-500/80 animate-pulse cursor-pointer'
                  : 'bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 border-amber-500/50 cursor-pointer'
            }`}
            title={
              activeLargeForm
                ? `Encolher: Restam ${formatRoundsToTime(largeFormRoundsLeft)}.`
                : largeFormRoundsLeft < 100 && largeFormRoundsLeft > 0
                  ? `Retomar Forma Grande (${formatRoundsToTime(largeFormRoundsLeft)} restantes até o Descanso Longo).`
                  : `Forma Grande (Ação Bônus): Cresce para tamanho Grande, recebe +3m de deslocamento e Vantagem em testes de Força (${largeFormUses}/${largeFormMaxUses} usos).`
            }
          >
            <span className="truncate">
              🪨 {activeLargeForm 
                ? `Crescido (${formatRoundsToTime(largeFormRoundsLeft)})` 
                : largeFormRoundsLeft < 100 && largeFormRoundsLeft > 0 
                  ? `Retomar Forma (${formatRoundsToTime(largeFormRoundsLeft)})` 
                  : 'Forma Grande'}
            </span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 shrink-0">
              {largeFormUses}/{largeFormMaxUses}
            </span>
          </button>
        );
      })()}

      {/* Golias: Habilidade da Ancestralidade Gigante */}
      {isGoliath && (() => {
        const gType = (character?.giant_ancestry || character?.giantAncestry || '').toLowerCase();
        
        if (gType.includes('fogo') || gType.includes('fire')) {
          return (
            <div
              className="py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow bg-slate-950 border-slate-800 text-slate-500 opacity-70 cursor-help"
              title="Queimadura do Fogo (No Acerto): Ao acertar um ataque, você pode causar +1d10 de dano de Fogo adicional."
            >
              <span className="truncate">🔥 Queimadura do Fogo</span>
              <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-slate-900 text-orange-400 border border-slate-700 shrink-0 font-extrabold">
                {goliathAncestryUses}/{goliathAncestryMaxUses} (No Acerto)
              </span>
            </div>
          );
        }

        if (gType.includes('gelo') || gType.includes('frost')) {
          return (
            <div
              className="py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow bg-slate-950 border-slate-800 text-slate-500 opacity-70 cursor-help"
              title="Frio do Gelo (No Acerto): Ao acertar um ataque, causará +1d6 de dano de Frio e reduz o deslocamento em 3m."
            >
              <span className="truncate">❄️ Frio do Gelo</span>
              <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-700 shrink-0 font-extrabold">
                {goliathAncestryUses}/{goliathAncestryMaxUses} (No Acerto)
              </span>
            </div>
          );
        }

        if (gType.includes('colina') || gType.includes('hill')) {
          return (
            <div
              className="py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow bg-slate-950 border-slate-800 text-slate-500 opacity-70 cursor-help"
              title="Queda da Colina (No Acerto): Ao acertar um ataque em criatura Grande ou menor, pode derrubá-la (Caído)."
            >
              <span className="truncate">⛰️ Queda da Colina</span>
              <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-700 shrink-0 font-extrabold">
                {goliathAncestryUses}/{goliathAncestryMaxUses} (No Acerto)
              </span>
            </div>
          );
        }

        if (gType.includes('pedra') || gType.includes('stone')) {
          return (
            <div
              className="py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow bg-slate-950 border-slate-800 text-slate-500 opacity-70 cursor-help"
              title="Resistência da Pedra (Reação ao levar dano): Reduz o dano sofrido em 1d12 + CON."
            >
              <span className="truncate">🪨 Resistência da Pedra</span>
              <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700 shrink-0 font-extrabold">
                {goliathAncestryUses}/{goliathAncestryMaxUses} (Reação)
              </span>
            </div>
          );
        }

        if (gType.includes('tempestade') || gType.includes('storm')) {
          return (
            <div
              className="py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow bg-slate-950 border-slate-800 text-slate-500 opacity-70 cursor-help"
              title="Trovão da Tempestade (Reação ao levar dano): Causa 1d8 de dano de Trovão ao atacante."
            >
              <span className="truncate">⚡ Trovão Tempestade</span>
              <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-slate-900 text-indigo-400 border border-slate-700 shrink-0 font-extrabold">
                {goliathAncestryUses}/{goliathAncestryMaxUses} (Reação)
              </span>
            </div>
          );
        }

        const canTeleport = isHeroTurn && (isTeleportTargetMode || (goliathAncestryUses > 0 && (!inCombat || activeEntity.hasBonusAction)));
        return (
          <button
            onClick={() => {
              if (isTeleportTargetMode) {
                setIsTeleportTargetMode(false);
              } else {
                if (goliathAncestryUses <= 0) {
                  addCombatLog('Mestre do Jogo', '⚠️ Sem Usos', 'Você esgotou os usos de seu Ancestral Gigante!', 'system');
                  return;
                }
                if (inCombat && !activeEntity.hasBonusAction) {
                  addCombatLog('Mestre do Jogo', '⚠️ Sem Ação Bônus', 'Você precisa de uma Ação Bônus para usar o Passo das Nuvens!', 'system');
                  return;
                }
                setIsTeleportTargetMode(true);
              }
            }}
            disabled={!canTeleport}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              !canTeleport
                ? 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
                : isTeleportTargetMode
                  ? 'bg-purple-950 hover:bg-purple-900 text-purple-200 border-purple-500/80 animate-pulse cursor-pointer'
                  : 'bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border-purple-500/50 cursor-pointer'
            }`}
            title={
              isTeleportTargetMode
                ? 'Selecione uma célula para teleportar!'
                : `Passo das Nuvens (Ação Bônus): Teleporte-se por até 9m (6 quadrados) para um espaço desocupado (${goliathAncestryUses}/{goliathAncestryMaxUses} usos compartilhados do Ancestral Gigante).`
            }
          >
            <span className="truncate">
              🌌 {isTeleportTargetMode ? 'Mirando...' : 'Passo das Nuvens'}
            </span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30 shrink-0">
              {goliathAncestryUses}/{goliathAncestryMaxUses}
            </span>
          </button>
        );
      })()}
    </>
  );
};
