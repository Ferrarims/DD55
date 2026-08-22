import React, { useEffect, useRef } from 'react';
import { CombatEntity, CellData, BiomeType, GridPosition } from '../../../game/types';
import { executeMonsterTurnAI } from '../../../game/monsterAI';
import { checkHeroOpportunityAttack } from './monsterAI/checkHeroOpportunityAttack';
import { processMonsterAttackAndVisuals } from './monsterAI/processMonsterAttackEffects';

export interface UseMonsterTurnAIProps {
  activeEntity: CombatEntity | undefined;
  activeEntityIndex: number;
  isBattleOver: boolean;
  entities: CombatEntity[];
  entitiesRef: React.MutableRefObject<CombatEntity[]>;
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  grid: CellData[][];
  biome: BiomeType;
  isNight: boolean;
  torches: GridPosition[];
  character: any;
  activeLargeForm: boolean;
  currentSelectedAttack: any;
  getHeroLightRadiusInCells: () => number;
  advanceTurn: () => void;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  triggerAttackVisualEffect: (start: GridPosition, end: GridPosition, isRanged: boolean, hit: boolean, damage: number, isCritical: boolean) => void;
  setLatestRoll: (roll: any) => void;
  processDamageAndCheckKill: (targetId: string, rawDamage: number, attackerName: string, damageType: string, attackerId: string) => void;
  checkGridTriggers: (entityId: string, x: number, y: number) => void;
  onTriggerOpportunityAttack?: (opportunityInfo: {
    monster: CombatEntity;
    triggerStep: GridPosition;
    decision: any;
    hero: CombatEntity;
    atkToUse: any;
    isDarkEnv: boolean;
  }) => void;
}

export function useMonsterTurnAI(props: UseMonsterTurnAIProps) {
  const {
    activeEntity,
    activeEntityIndex,
    isBattleOver,
  } = props;

  // Ref sempre atualizada para props e callbacks, evitando que re-renders cancelem os timeouts
  const propsRef = useRef(props);
  propsRef.current = props;

  // Ref para controlar se a IA já está processando o turno do monstro ativo
  const isExecutingRef = useRef<string | null>(null);

  useEffect(() => {
    if (!activeEntity || isBattleOver) {
      isExecutingRef.current = null;
      return;
    }

    if (activeEntity.type === 'monster' && !activeEntity.isDead) {
      const turnKey = `${activeEntity.id}_${activeEntityIndex}`;

      // Se já estiver agendado ou executando este mesmo turno, não reagendar
      if (isExecutingRef.current === turnKey) {
        return;
      }

      isExecutingRef.current = turnKey;

      const turnTimeout = setTimeout(() => {
        try {
          const currentProps = propsRef.current;
          const currentEntities = currentProps.entitiesRef.current;
          const currentActive = currentEntities[currentProps.activeEntityIndex];

          // Se a entidade ativa mudou, morreu ou o combate acabou, apenas avança o turno com segurança
          if (!currentActive || currentActive.id !== activeEntity.id || currentActive.type !== 'monster' || currentActive.isDead || currentProps.isBattleOver) {
            isExecutingRef.current = null;
            currentProps.advanceTurn();
            return;
          }

          const hero = currentEntities.find(e => e.type === 'hero');
          if (!hero || hero.isDead) {
            isExecutingRef.current = null;
            currentProps.advanceTurn();
            return;
          }

          const isIndoor = currentProps.biome === 'Caverna' || currentProps.biome === 'Masmorra';
          const isDarkEnv = isIndoor || (currentProps.isNight && (currentProps.biome === 'Floresta' || currentProps.biome === 'Pântano' || currentProps.biome === 'Deserto'));

          const decision = executeMonsterTurnAI(
            currentActive,
            hero,
            currentProps.grid,
            currentEntities,
            isDarkEnv,
            currentProps.torches,
            currentProps.getHeroLightRadiusInCells(),
            hero.x,
            hero.y
          );

          // Checagem de Ataque de Oportunidade do Herói
          const { triggeredStep, atkToUse } = checkHeroOpportunityAttack({
            hero,
            monster: currentActive,
            pathTaken: decision.pathTaken,
            currentSelectedAttack: currentProps.currentSelectedAttack,
            characterRace: currentProps.character?.race,
            activeLargeForm: currentProps.activeLargeForm,
          });

          if (triggeredStep && currentProps.onTriggerOpportunityAttack) {
            isExecutingRef.current = null;
            currentProps.onTriggerOpportunityAttack({
              monster: currentActive,
              triggerStep: triggeredStep,
              decision,
              hero,
              atkToUse,
              isDarkEnv
            });
            return;
          }

          // Atualiza as entidades do combate
          currentProps.setEntities(prev =>
            prev.map(ent => {
              if (ent.id === currentActive.id) {
                return {
                  ...ent,
                  x: decision.newPosition.x,
                  y: decision.newPosition.y,
                  currentHp: currentActive.currentHp,
                  isDead: false,
                  hasAction: false,
                  remainingMovement: 0
                };
              }
              return ent;
            })
          );

          if (decision.newPosition.x !== currentActive.x || decision.newPosition.y !== currentActive.y) {
            currentProps.checkGridTriggers(currentActive.id, decision.newPosition.x, decision.newPosition.y);
          }

          processMonsterAttackAndVisuals({
            decision,
            monster: currentActive,
            hero,
            currentProps,
          });

          const delayTime = decision.attackExecuted ? 600 : decision.logActionName ? 300 : 50;
          setTimeout(() => {
            isExecutingRef.current = null;
            currentProps.advanceTurn();
          }, delayTime);

        } catch (error) {
          console.error("Erro na execução do turno da IA do monstro:", error);
          isExecutingRef.current = null;
          propsRef.current.advanceTurn();
        }
      }, 500);

      return () => {
        // Mantém a execução sem cancelar o timeout por re-renders secundários
      };
    } else {
      isExecutingRef.current = null;
    }
  }, [activeEntity?.id, activeEntityIndex, isBattleOver]);
}
