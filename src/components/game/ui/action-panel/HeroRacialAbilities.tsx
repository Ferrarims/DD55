import React from 'react';
import { useGameContext } from '../../context/GameContext';

function formatRoundsToTime(rounds: number): string {
  const totalSeconds = Math.round(rounds * 6);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (totalMinutes < 60) {
    if (remainingSeconds === 0) {
      return `${totalMinutes}min`;
    }
    return `${totalMinutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export const HeroRacialAbilities: React.FC = () => {
  const {
    activeEntity,
    character,
    isBattleOver,
    isDragonborn,
    breathWeaponDetails,
    breathWeaponUses,
    breathWeaponMaxUses,
    handleOpenBreathWeaponModal,
    celestialRevelationUses,
    celestialRevelationMaxUses,
    activeRevelation,
    setActiveRevelation,
    radiantSoulRoundsLeft,
    showRevelationMenu,
    setShowRevelationMenu,
    handleCelestialRevelation,
    draconicFlightUses,
    draconicFlightMaxUses,
    activeDraconicFlight,
    draconicFlightRoundsLeft,
    handleDraconicFlight,
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
    isOrc,
    adrenalineRushUses,
    adrenalineRushMaxUses,
    handleAdrenalineRush,
    relentlessEnduranceUses,
    isHuman,
    hasHeroicInspiration,
    addCombatLog,
    setEntities
  } = useGameContext();

  if (!activeEntity || activeEntity.type !== 'hero') return null;

  const inCombat = !isBattleOver;
  const isHeroTurn = !inCombat || (activeEntity?.type === 'hero' && !activeEntity?.isDead);

  return (
    <>
      {/* 12.1 Baforada / Arma de Sopro (Draconato) */}
      {isDragonborn && (() => {
        const canBreath = isHeroTurn && (!inCombat || activeEntity.hasAction) && breathWeaponUses > 0;
        return (
          <button
            onClick={handleOpenBreathWeaponModal}
            disabled={!canBreath}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canBreath
                ? 'bg-amber-900/80 hover:bg-amber-800 text-amber-100 border-amber-500/60 shadow-amber-900/30 cursor-pointer'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title={`Arma de Sopro (Baforada): Exala ${breathWeaponDetails?.damageType || 'Energia'} em Cone (4.5m) ou Linha (9m). CD ${breathWeaponDetails?.dc} DEX. Dano ${breathWeaponDetails?.damageDice}.`}
          >
            <span className="truncate">🔥 Baforada</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40 shrink-0 font-mono">
              {breathWeaponUses}/{breathWeaponMaxUses}
            </span>
          </button>
        );
      })()}

      {/* Aasimar: Revelação Celestial */}
      {celestialRevelationMaxUses > 0 && (() => {
        const canRevel = isHeroTurn && (activeRevelation ? true : (celestialRevelationUses > 0 && (!inCombat || activeEntity.hasBonusAction)));
        return (
          <div className="relative">
            <button
              onClick={() => {
                if (activeRevelation === 'Alma Radiante') {
                  setActiveRevelation(null);
                  addCombatLog('Mestre do Jogo', '🌟 Alma Radiante Recolhida', 'Você recolheu suas asas celestes e pousou.', 'system');
                  setEntities(prev => prev.map(e => e.type === 'hero' ? { ...e, conditions: e.conditions.filter(c => c !== 'Voando') } : e));
                } else {
                  setShowRevelationMenu(!showRevelationMenu);
                }
              }}
              disabled={!canRevel}
              className={`w-full py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
                !canRevel
                  ? 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
                  : activeRevelation === 'Alma Radiante'
                    ? 'bg-amber-950 hover:bg-amber-900 text-amber-200 border-amber-500/80 animate-pulse cursor-pointer'
                    : activeRevelation
                      ? 'bg-amber-900/80 hover:bg-amber-800 text-amber-100 border-amber-500/50 cursor-pointer'
                      : 'bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 border-amber-500/50 cursor-pointer'
              }`}
              title="Revelação Celestial (Ação Bônus): Transformação concedida no nível 3."
            >
              <span className="truncate">🌟 {activeRevelation === 'Alma Radiante' ? `Alma Radiante (${formatRoundsToTime(radiantSoulRoundsLeft)})` : (activeRevelation || 'Revelação Celestial')}</span>
              <span className="text-[9px] px-1 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 shrink-0">
                {celestialRevelationUses}/{celestialRevelationMaxUses}
              </span>
            </button>
            
            {showRevelationMenu && !activeRevelation && (
              <div className="absolute bottom-full left-0 mb-2 w-56 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-1.5 z-50 flex flex-col gap-1">
                <button
                  onClick={() => handleCelestialRevelation('Alma Radiante')}
                  className="w-full text-left px-2 py-2 text-[10px] text-amber-200 hover:bg-amber-900/50 rounded transition"
                >
                  <strong className="block mb-0.5 text-xs text-amber-400">Alma Radiante</strong>
                  <span className="text-slate-400 font-normal leading-tight">Voar (Deslocamento de Voo igual ao seu Deslocamento).</span>
                </button>
                <button
                  onClick={() => handleCelestialRevelation('Consumo Radiante')}
                  className="w-full text-left px-2 py-2 text-[10px] text-amber-200 hover:bg-amber-900/50 rounded transition"
                >
                  <strong className="block mb-0.5 text-xs text-amber-400">Consumo Radiante</strong>
                  <span className="text-slate-400 font-normal leading-tight">Luz 3m plena/+3m penumbra. Dano Radiante em área ao fim do turno.</span>
                </button>
                <button
                  onClick={() => handleCelestialRevelation('Mortalha Necrótica')}
                  className="w-full text-left px-2 py-2 text-[10px] text-amber-200 hover:bg-amber-900/50 rounded transition"
                >
                  <strong className="block mb-0.5 text-xs text-amber-400">Mortalha Necrótica</strong>
                  <span className="text-slate-400 font-normal leading-tight">Inimigos em 3m devem passar em Teste de Carisma ou ficam Amedrontados.</span>
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Draconato: Voo Dracônico (Nível 5+) */}
      {draconicFlightMaxUses > 0 && (() => {
        const canFlight = isHeroTurn && (activeDraconicFlight ? true : ((draconicFlightUses > 0 || draconicFlightRoundsLeft > 0) && (!inCombat || activeEntity.hasBonusAction)));
        return (
          <button
            onClick={() => {
              handleDraconicFlight();
            }}
            disabled={!canFlight}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              !canFlight
                ? 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
                : activeDraconicFlight
                  ? 'bg-amber-950 hover:bg-amber-900 text-amber-200 border-amber-500/80 animate-pulse cursor-pointer'
                  : 'bg-amber-900/60 hover:bg-amber-800/80 text-amber-200 border-amber-500/50 cursor-pointer'
            }`}
            title={
              activeDraconicFlight
                ? `Recolher Asas: Restam ${formatRoundsToTime(draconicFlightRoundsLeft)}.`
                : draconicFlightRoundsLeft < 100 && draconicFlightRoundsLeft > 0
                  ? `Retomar Voo Dracônico (${formatRoundsToTime(draconicFlightRoundsLeft)} restantes até o Descanso Longo).`
                  : `Voo Dracônico (Ação Bônus): Asas espectrais (10 min, ${draconicFlightUses}/${draconicFlightMaxUses} usos).`
            }
          >
            <span className="truncate">
              🐉 {activeDraconicFlight 
                ? `Asas Ativas (${formatRoundsToTime(draconicFlightRoundsLeft)})` 
                : draconicFlightRoundsLeft < 100 && draconicFlightRoundsLeft > 0 
                  ? `Retomar Voo (${formatRoundsToTime(draconicFlightRoundsLeft)})` 
                  : 'Voo Dracônico'}
            </span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 shrink-0">
              {draconicFlightUses}/{draconicFlightMaxUses}
            </span>
          </button>
        );
      })()}

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

      {/* Orc: Pico de Adrenalina (Adrenaline Rush) */}
      {isOrc && (() => {
        const canAdrenaline = isHeroTurn && adrenalineRushUses > 0 && (!inCombat || activeEntity.hasBonusAction);
        const pb = character?.proficiencyBonus || (2 + Math.floor(((character?.level || 1) - 1) / 4));
        return (
          <button
            onClick={handleAdrenalineRush}
            disabled={!canAdrenaline}
            className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
              canAdrenaline
                ? 'bg-red-900/60 hover:bg-red-800/80 text-red-200 border-red-500/50 cursor-pointer'
                : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title={`Pico de Adrenalina (Ação Bônus): Realiza a ação de Disparada (Dash) e ganha +${pb} PV Temporários (${adrenalineRushUses}/${adrenalineRushMaxUses} usos).`}
          >
            <span className="truncate">🏃 Pico de Adrenalina</span>
            <span className="text-[9px] px-1 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30 shrink-0">
              {adrenalineRushUses}/{adrenalineRushMaxUses}
            </span>
          </button>
        );
      })()}

      {/* Orc: Resistência Implacável (Relentless Endurance) - AUTOMÁTICA */}
      {isOrc && (
        <div
          className="py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow bg-slate-950 border-slate-800 text-slate-500 opacity-70 cursor-help"
          title="Resistência Implacável (Automática): Ao ser reduzido a 0 PV, cai a 1 PV em vez de cair (1x por Descanso Longo)."
        >
          <span className="truncate">💪 Resistência Implacável</span>
          <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-700 shrink-0">
            {relentlessEnduranceUses}/1 (Automática)
          </span>
        </div>
      )}

      {/* Inspiração Heroica (Humano) - AUTOMÁTICA */}
      {isHuman && (
        <div
          className="py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow bg-slate-950 border-slate-800 text-slate-500 opacity-70 cursor-help"
          title={
            hasHeroicInspiration
              ? "Inspiração Heroica Ativa! Se falhar em qualquer teste de d20 (ataque, teste de resistência ou habilidade), você será perguntado se deseja usá-la para re-rolar."
              : "Inspiração Heroica Utilizada (Recarrega em um Descanso Longo)."
          }
        >
          <span className="truncate">✨ Inspiração Heroica</span>
          <span
            className={`text-[8px] font-mono px-1 py-0.5 rounded shrink-0 font-bold border ${
              hasHeroicInspiration
                ? 'bg-slate-900 text-amber-300 border-slate-700'
                : 'bg-slate-900 text-slate-600 border-slate-800'
            }`}
          >
            {hasHeroicInspiration ? '1/1 (Automática)' : '0/1 (Usada)'}
          </span>
        </div>
      )}
    </>
  );
};
