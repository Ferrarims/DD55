import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { getDistanceBetweenEntities } from '../../../../game/combatUtils';

export const HeroBasicActionsGrid: React.FC = () => {
  const {
    activeEntity,
    character,
    isBattleOver,
    isNight,
    torches,
    grid,
    entities,
    activeLargeForm,
    handleHeroStandUp,
    handleHeroEscapeGrapple,
    handleHeroDash,
    handleHeroHide,
    handleHeroDodge,
    handleHeroDisengage,
    setShowItemModal
  } = useGameContext();

  if (!activeEntity || activeEntity.type !== 'hero') return null;

  return (
    <div className="space-y-1.5">
      {/* 13. Usar Itens do Inventário / Mochila */}
      <button
        onClick={() => setShowItemModal(true)}
        className="w-full py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition bg-rose-900/60 hover:bg-rose-800/80 text-rose-200 border-rose-500/50 cursor-pointer"
        title="Mochila / Usar Item: Abre o inventário para consumir poções de cura, pergaminhos ou gerenciar seus equipamentos e armas."
      >
        <span className="truncate">🎒 Usar Item</span>
        <span className="text-[9px] text-rose-300 opacity-80 shrink-0">Mochila</span>
      </button>

      {/* Levantar-se (Stand Up) - Apenas exibido se estiver Caído / Prone */}
      {activeEntity.conditions?.some(c => c === 'Caído' || c === 'Prone') && (() => {
        const inCombat = !isBattleOver;
        const isHeroTurn = !inCombat || activeEntity?.type === 'hero';
        const canStandUp = isHeroTurn && (activeEntity.movementRemaining || 0) >= Math.floor((activeEntity.speed || 6) / 2) * 1.5;
        return (
          <button
            onClick={handleHeroStandUp}
            disabled={!canStandUp}
            className={`w-full py-2 px-3 rounded-xl border font-extrabold text-[12px] flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${
              canStandUp
                ? 'border-red-500 bg-red-950/80 hover:bg-red-900 text-red-100 animate-pulse cursor-pointer'
                : 'border-slate-800 bg-slate-950 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title={`Levantar-se: Gasta metade do seu deslocamento (${Math.floor(activeEntity.speed / 2) * 1.5}m) para se levantar e remover a condição Caído (Prone).`}
          >
            <span>💥</span>
            <span>Levantar-se (Gasta {Math.floor(activeEntity.speed / 2) * 1.5}m)</span>
          </button>
        );
      })()}

      {/* Escapar do Agarrão (Escape Grapple) - Apenas exibido se estiver Agarrado */}
      {activeEntity.conditions?.some(c => c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled') && (() => {
        const inCombat = !isBattleOver;
        const isHeroTurn = !inCombat || activeEntity?.type === 'hero';
        const canEscape = isHeroTurn && activeEntity.hasAction;
        return (
          <button
            onClick={handleHeroEscapeGrapple}
            disabled={!canEscape}
            className={`w-full py-2 px-3 rounded-xl border font-extrabold text-[12px] flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${
              canEscape
                ? 'border-amber-500 bg-amber-950/80 hover:bg-amber-900 text-amber-100 animate-pulse cursor-pointer'
                : 'border-slate-800 bg-slate-950 text-slate-600 opacity-60 cursor-not-allowed'
            }`}
            title={`Escapar do Agarrão (Gasta 1 Ação Principal): Teste de Atletismo ou Acrobacia contra a CD do agarrador. ${
              ['Golias', 'Goliath'].includes(character?.race) ? '🪨 Possui VANTAGEM por Físico Poderoso!' : ''
            }`}
          >
            <span>✊</span>
            <span>Escapar do Agarrão (Ação){['Golias', 'Goliath'].includes(character?.race) ? ' • Vantagem 🪨' : ''}</span>
          </button>
        );
      })()}

      {/* Dash, Esconder, Esquivar e Desengajar em Grade 2x2 */}
      <div className="grid grid-cols-2 gap-1.5">
        {/* 11. Disparada (Dash) */}
        {(() => {
          const inCombat = !isBattleOver;
          const isHeroTurn = !inCombat || (activeEntity?.type === 'hero' && !activeEntity?.isDead);
          const canDash = isHeroTurn && activeEntity.hasAction;
          return (
            <button
              onClick={handleHeroDash}
              disabled={!canDash}
              className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
                canDash
                  ? 'bg-blue-900/60 hover:bg-blue-800/80 text-blue-200 border-blue-500/50 cursor-pointer'
                  : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
              }`}
              title="Ação de Disparada (Dash): Dobra sua capacidade de movimento neste turno para alcançar posições distantes."
            >
              <span className="truncate">🏃 Dash</span>
              <span className="text-[9px] text-blue-300 opacity-80 shrink-0">+9m</span>
            </button>
          );
        })()}

        {/* 12. Esconder (Hide) */}
        {(() => {
          const inCombat = !isBattleOver;
          const isHeroTurn = !inCombat || (activeEntity?.type === 'hero' && !activeEntity?.isDead);
          const hero = activeEntity;

          const isDarkEnv = isNight;
          const isLitByTorch = torches.some(t => Math.max(Math.abs(hero.x - t.x), Math.abs(hero.y - t.y)) <= 4);
          const isInDarkness = isDarkEnv && !isLitByTorch;
          const isDay = !isInDarkness;

          const heroCell = grid[hero.y]?.[hero.x];
          const isOnVegetation = heroCell && heroCell.terrain === 'difficult';

          const isNearObstacle = (() => {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = hero.x + dx;
                const ny = hero.y + dy;
                const neighbor = grid[ny]?.[nx];
                if (neighbor && neighbor.terrain === 'wall') {
                  return true;
                }
              }
            }
            return false;
          })();

          const isHalfling = character?.race === 'Pequenino' || character?.race?.toLowerCase().includes('pequenino') || character?.race?.toLowerCase().includes('halfling');

          const canHideGeneral = isInDarkness && isOnVegetation;
          const canHideHalflingDay = isHalfling && isDay && isOnVegetation && isNearObstacle;
          const canHide = isHeroTurn && hero.hasAction && (canHideGeneral || canHideHalflingDay);

          const hideTooltip = !hero.hasAction
            ? "Ação já utilizada neste turno."
            : !isOnVegetation
            ? "Você precisa estar em cima de um quadrado de vegetação (terreno difícil) para se esconder."
            : (isDay && !isHalfling)
            ? "Personagens comuns não podem se esconder à luz do dia (necessário estar no escuro e sobre vegetação)."
            : (isDay && isHalfling && !isNearObstacle)
            ? "Pequeninos de dia precisam estar sobre vegetação E ao lado de um obstáculo/árvore/rocha para se esconder (Naturally Stealthy)."
            : "Ação de Esconder (Hide): Tenta se ocultar (CD 15 Destreza). Ganha condição Invisível em caso de sucesso.";

          return (
            <button
              onClick={handleHeroHide}
              disabled={!canHide}
              className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
                canHide
                  ? 'bg-teal-900/60 hover:bg-teal-800/80 text-teal-200 border-teal-500/50 cursor-pointer'
                  : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
              }`}
              title={hideTooltip}
            >
              <span className="truncate">👻 Esconder</span>
              <span className="text-[9px] text-teal-300 opacity-80 shrink-0">CD15</span>
            </button>
          );
        })()}

        {/* 13. Esquivar (Dodge) */}
        {(() => {
          const inCombat = !isBattleOver;
          const isHeroTurn = !inCombat || (activeEntity?.type === 'hero' && !activeEntity?.isDead);
          const canDodge = isHeroTurn && activeEntity.hasAction;
          return (
            <button
              onClick={handleHeroDodge}
              disabled={!canDodge}
              className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
                canDodge
                  ? 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 border-emerald-500/50 cursor-pointer'
                  : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
              }`}
              title="Ação de Esquiva (Dodge): Concentra-se em evitar ataques. Impõe Desvantagem nas jogadas de ataque inimigas contra você e Vantagem em testes de resistência de Destreza até o próximo turno."
            >
              <span className="truncate">🛡️ Esquivar</span>
              <span className="text-[9px] text-emerald-300 opacity-80 shrink-0">Desv.</span>
            </button>
          );
        })()}

        {/* 14. Desengajar (Disengage) */}
        {(() => {
          const inCombat = !isBattleOver;
          const isHeroTurn = !inCombat || (activeEntity?.type === 'hero' && !activeEntity?.isDead);
          const isThreatened = activeEntity ? entities.some(m => m.type === 'monster' && !m.isDead && getDistanceBetweenEntities(m, activeEntity, character?.race, activeLargeForm) <= (m.range || 1)) : false;
          const canDisengage = isHeroTurn && activeEntity.hasAction && isThreatened;
          return (
            <button
              onClick={handleHeroDisengage}
              disabled={!canDisengage}
              className={`py-1.5 px-2 rounded-xl border font-bold text-[11px] flex items-center justify-between gap-1 shadow transition ${
                canDisengage
                  ? 'bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border-indigo-500/50 cursor-pointer'
                  : 'bg-slate-950 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
              }`}
              title={
                !isThreatened
                  ? "Desengajar só está disponível quando você estiver em área ameaçada por um inimigo (adjacente)."
                  : "Ação de Desengajar (Disengage): Você recua taticamente. Seu movimento não provocará ataques de oportunidade pelo resto do turno."
              }
            >
              <span className="truncate">💨 Desengajar</span>
              <span className="text-[9px] text-indigo-300 opacity-80 shrink-0">Recuar</span>
            </button>
          );
        })()}
      </div>
    </div>
  );
};
