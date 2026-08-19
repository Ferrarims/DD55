import React from 'react';
import { useGameContext } from '../context/GameContext';
import { HeroVictoryDefeatScreen } from './action-panel/HeroVictoryDefeatScreen';
import { HeroTurnHeader } from './action-panel/HeroTurnHeader';
import { HeroAttackPrediction } from './action-panel/HeroAttackPrediction';
import { HeroWeaponAttackSection } from './action-panel/HeroWeaponAttackSection';
import { HeroBasicActionsGrid } from './action-panel/HeroBasicActionsGrid';
import { HeroMasteryAndSpells } from './action-panel/HeroMasteryAndSpells';
import { HeroRacialAbilities } from './action-panel/HeroRacialAbilities';
import { HeroClassAbilities } from './action-panel/HeroClassAbilities';

export const HeroActionPanel: React.FC = () => {
  const {
    isFullscreenMap,
    isBattleOver,
    isVictoryScreenVisible,
    isHeroDead,
    activeEntity
  } = useGameContext();

  return (
    <div className={isFullscreenMap ? "fixed top-4 left-4 bottom-4 z-[9999] w-[360px] overflow-y-auto custom-scrollbar flex flex-col gap-4 p-2 bg-slate-900/95 rounded-2xl border border-slate-700/80 shadow-2xl backdrop-blur-md" : "lg:col-span-4 space-y-2.5"}>
      {isBattleOver && (isVictoryScreenVisible || isHeroDead) ? (
        <HeroVictoryDefeatScreen />
      ) : activeEntity ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 space-y-2.5 shadow-xl">
          <HeroTurnHeader />

          {/* Lista de Ações do Herói */}
          {activeEntity.type === 'hero' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ações &amp; Habilidades {isBattleOver ? '(Fora de Combate)' : ''}
                </span>
              </div>

              {/* Indicador de Previsão de Vantagem / Desvantagem */}
              <HeroAttackPrediction />

              {/* Seção de Ataque com Armas, Maestrias, Grip e Switcher */}
              <HeroWeaponAttackSection />

              {/* Ações Básicas (Mochila, Stand Up, Escape Grapple, Dash, Hide, Dodge, Disengage) */}
              <HeroBasicActionsGrid />

              {/* Grid de Habilidades Especiais em 2 Colunas */}
              <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                {/* Maestria de Arma, Mente Tática e Magias */}
                <HeroMasteryAndSpells />

                {/* Habilidades Raciais (Draconato, Aasimar, Golias, Orc, Humano) */}
                <HeroRacialAbilities />

                {/* Habilidades de Classe e Talentos (Bárbaro, Guerreiro, Monge, Paladino, etc.) */}
                <HeroClassAbilities />
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
