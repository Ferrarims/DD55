import React, { useEffect } from 'react';
import { CombatEntity } from '../../../../game/types';
import { getXpForCr } from '../../../../game/dndLootTables';

export interface UseCombatResolutionLifecycleProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  character: any;
  heroEntity?: CombatEntity;
  isHeroDead: boolean;
  isBattleOver: boolean;
  setIsBattleOver: (over: boolean) => void;
  setActiveRevelation: (rev: any) => void;
  victoryLogged: React.MutableRefObject<boolean>;
  setShowVictorySummaryModal?: (val: boolean) => void;
  setVictoryData: React.Dispatch<React.SetStateAction<any>>;
  mapStreak: number;
  addCombatLog: (actorName: string, title: string, detail: string, type: any) => void;
  onCharacterUpdated?: () => Promise<void> | void;
}

export function useCombatResolutionLifecycle({
  entities,
  setEntities,
  character,
  heroEntity,
  isHeroDead,
  isBattleOver,
  setIsBattleOver,
  setActiveRevelation,
  victoryLogged,
  setShowVictorySummaryModal,
  setVictoryData,
  mapStreak,
  addCombatLog,
  onCharacterUpdated,
}: UseCombatResolutionLifecycleProps) {
  // Monitorar Fim do Combate para limpar a aura celestial e sincronizar XP/Bestiário de monstros mortos
  useEffect(() => {
    if (isBattleOver) {
      setActiveRevelation(null);
      const deadMonsters = entities.filter(e => e.type === 'monster' && (e.isDead || e.currentHp <= 0));
      const hasDefeatedMonsters = deadMonsters.length > 0;

      if (!victoryLogged.current && !isHeroDead) {
        victoryLogged.current = true;
        if (hasDefeatedMonsters) {
          addCombatLog('Mestre do Jogo', '🏆 VITÓRIA!', 'Você derrotou todos os inimigos!', 'system');
          if (setShowVictorySummaryModal) {
            setShowVictorySummaryModal(true);
          }
        }
      }

      if (!isHeroDead && deadMonsters.length > 0) {
        setVictoryData((prev: any) => {
          const currentLoot = prev?.loot || [];
          let currentXp = prev?.totalXp || 0;
          const currentDefeated = { ...(prev?.defeatedMonsters || {}) };
          const currentDmg = prev?.totalDamageDealt || 0;
          const multiplier = Math.max(1, mapStreak);

          deadMonsters.forEach(m => {
            const cleanName = m.name.replace(/ #?\d+$/, '').trim();
            const mXp = (m.xpValue || getXpForCr(m.cr || 0.25)) * multiplier;

            const recordedCount = currentDefeated[cleanName] || 0;
            const actualDeadCountWithThisName = deadMonsters.filter(dm => dm.name.replace(/ #?\d+$/, '').trim() === cleanName).length;

            if (recordedCount < actualDeadCountWithThisName) {
              const diff = actualDeadCountWithThisName - recordedCount;
              currentDefeated[cleanName] = actualDeadCountWithThisName;
              currentXp += diff * mXp;
            }
          });

          return {
            totalXp: currentXp,
            loot: currentLoot,
            defeatedMonsters: currentDefeated,
            totalDamageDealt: currentDmg
          };
        });
      }
    }
  }, [isBattleOver, isHeroDead, entities, mapStreak, setActiveRevelation, addCombatLog, setVictoryData, setShowVictorySummaryModal, victoryLogged]);

  // Monitorar término imediato do combate quando não houver monstros vivos na tela
  useEffect(() => {
    if (!isBattleOver && entities.length > 0) {
      const allMonsters = entities.filter(e => e.type === 'monster');
      const livingMonsters = allMonsters.filter(e => !e.isDead && e.currentHp > 0);
      const hero = entities.find(e => e.type === 'hero');
      if (hero && !hero.isDead && allMonsters.length > 0 && livingMonsters.length === 0) {
        setIsBattleOver(true);
      }
    }
  }, [entities, isBattleOver, setIsBattleOver]);

  // Monitorar Morte do Herói em tempo real
  useEffect(() => {
    if (isHeroDead && !isBattleOver) {
      setIsBattleOver(true);
      addCombatLog('Mestre do Jogo', '💀 DERROTA!', 'Seu herói tombou em combate. Todos os itens e XP não salvos foram perdidos.', 'kill');
    }
  }, [isHeroDead, isBattleOver, setIsBattleOver, addCombatLog]);

  // Monitorar morte por exaustão (Nível 6)
  useEffect(() => {
    if ((character?.exhaustion_level || 0) >= 6 && heroEntity && !heroEntity.isDead && heroEntity.currentHp > 0) {
      addCombatLog('Mestre do Jogo', '💀 EXAUSTÃO FATAL', 'Você sucumbiu à exaustão e desmaiou (Nível 6/6)!', 'kill');

      const newEntities = [...entities];
      const heroIdx = newEntities.findIndex(e => e.type === 'hero');
      if (heroIdx !== -1) {
        newEntities[heroIdx].currentHp = 0;
        newEntities[heroIdx].isDead = true;
        setEntities(newEntities);
      }

      character.exhaustion_level = 3;
      import('../../../../lib/api/characterService').then(({ updateCharacter }) => {
        updateCharacter(character.id, { exhaustion_level: 3, current_hp: 0 }).then(() => {
          if (onCharacterUpdated) onCharacterUpdated();
        }).catch(e => console.warn(e));
      });
    }
  }, [character?.exhaustion_level, heroEntity?.currentHp, heroEntity?.isDead, entities, addCombatLog, setEntities, onCharacterUpdated, character]);
}
