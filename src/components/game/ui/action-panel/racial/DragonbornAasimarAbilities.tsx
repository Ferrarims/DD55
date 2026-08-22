import React from 'react';
import { useGameContext } from '../../../context/GameContext';
import { formatRoundsToTime } from './formatRoundsToTime';

export const DragonbornAasimarAbilities: React.FC = () => {
  const {
    activeEntity,
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
    addCombatLog,
    setEntities
  } = useGameContext();

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
    </>
  );
};
