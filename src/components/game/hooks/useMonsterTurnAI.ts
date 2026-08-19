import React, { useEffect, useRef } from 'react';
import { CombatEntity, CellData, BiomeType, GridPosition } from '../../../game/types';
import { executeMonsterTurnAI } from '../../../game/monsterAI';
import { executeAttack } from '../../../game/combatEngine';
import { getWeaponMaxRangeCells, getDistanceBetweenEntities, hasThrownProperty } from '../../../game/combatUtils';

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

          let heroOpportunityResult: any = null;
          let finalMonsterHp = currentActive.currentHp;
          let isMonsterDead = false;

          const canHeroSeeMonster = !hero.conditions?.some(c => c === 'Cego' || c === 'Blinded') &&
                                    !currentActive.conditions?.some(c => c === 'Invisível' || c === 'Invisible');
          const isHeroIncapacitated = hero.conditions?.some(c => 
            c === 'Incapacitado' || c === 'Incapacitated' ||
            c === 'Paralisado' || c === 'Paralyzed' ||
            c === 'Inconsciente' || c === 'Unconscious' ||
            c === 'Atordoado' || c === 'Stunned' ||
            c === 'Petrificado' || c === 'Petrified'
          );

          // Checagem de Ataque de Oportunidade do Herói
          let triggeredOpportunityStep: GridPosition | null = null;
          let atkToUse = currentProps.currentSelectedAttack;
          let heroReach = 1;

          if (hero.hasReaction && !isHeroIncapacitated && canHeroSeeMonster && !currentActive.conditions?.includes('Desengajando') && !currentActive.conditions?.includes('Voando') && decision.pathTaken && decision.pathTaken.length > 0) {
            if (atkToUse) {
              heroReach = getWeaponMaxRangeCells(atkToUse);
              const isRanged = getWeaponMaxRangeCells(atkToUse) > 1 && !hasThrownProperty(atkToUse) && 
                                (atkToUse.range?.toLowerCase().includes('/') || atkToUse.properties?.toLowerCase().includes('munição') || atkToUse.properties?.toLowerCase().includes('ammunition') || atkToUse.properties?.toLowerCase().includes('distância') || atkToUse.properties?.toLowerCase().includes('ranged'));
              if (isRanged) {
                heroReach = 1;
                atkToUse = undefined;
              }
            }

            let wasInReach = getDistanceBetweenEntities(hero, currentActive, currentProps.character?.race, currentProps.activeLargeForm) <= heroReach;
            let prevStep = { x: currentActive.x, y: currentActive.y };
            for (let step of decision.pathTaken) {
              const isNowInReach = getDistanceBetweenEntities(hero, { ...currentActive, x: step.x, y: step.y }, currentProps.character?.race, currentProps.activeLargeForm) <= heroReach;
              if (wasInReach && !isNowInReach) {
                triggeredOpportunityStep = prevStep;
                break;
              }
              wasInReach = isNowInReach;
              prevStep = step;
            }
          }

          if (triggeredOpportunityStep && currentProps.onTriggerOpportunityAttack) {
            isExecutingRef.current = null;
            currentProps.onTriggerOpportunityAttack({
              monster: currentActive,
              triggerStep: triggeredOpportunityStep,
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
                  x: isMonsterDead && heroOpportunityResult ? heroOpportunityResult.triggerStep.x : decision.newPosition.x,
                  y: isMonsterDead && heroOpportunityResult ? heroOpportunityResult.triggerStep.y : decision.newPosition.y,
                  currentHp: finalMonsterHp,
                  isDead: isMonsterDead,
                  hasAction: false,
                  remainingMovement: 0
                };
              }
              let nextEnt = { ...ent };
              if (ent.type === 'hero' && heroOpportunityResult) {
                nextEnt.hasReaction = false;
              }
              if (!isMonsterDead && decision.attackExecuted && decision.attackResult && decision.attackResult.hit && decision.attackResult.damage > 0 && ent.type === 'hero') {
                setTimeout(() => {
                  currentProps.processDamageAndCheckKill(
                    'hero',
                    decision.attackResult!.damage,
                    currentActive.name,
                    'Cortante',
                    currentActive.id
                  );
                }, 50);
              }
              return nextEnt;
            })
          );

          if (heroOpportunityResult) {
            currentProps.addCombatLog(
              hero.name,
              heroOpportunityResult.logTitle,
              heroOpportunityResult.logDetail,
              heroOpportunityResult.hit ? 'damage' : 'attack'
            );
            currentProps.addCombatLog(
              hero.name,
              '🛡️ REAÇÃO GASTA',
              'Você utilizou sua Reação para realizar um Ataque de Oportunidade contra o inimigo em movimento.',
              'system'
            );
            currentProps.triggerAttackVisualEffect(
              { x: hero.x, y: hero.y },
              { x: heroOpportunityResult.triggerStep.x, y: heroOpportunityResult.triggerStep.y },
              false,
              heroOpportunityResult.hit,
              heroOpportunityResult.damage,
              heroOpportunityResult.isCritical
            );
          }

          if (decision.newPosition.x !== currentActive.x || decision.newPosition.y !== currentActive.y) {
            if (!(isMonsterDead && heroOpportunityResult)) {
              currentProps.checkGridTriggers(currentActive.id, decision.newPosition.x, decision.newPosition.y);
            }
          }

          if (!isMonsterDead && decision.attackExecuted && decision.attackResult) {
            const dist = Math.max(
              Math.abs(decision.newPosition.x - hero.x),
              Math.abs(decision.newPosition.y - hero.y)
            );
            const isMonsterRanged = dist > 1.5;
            currentProps.triggerAttackVisualEffect(
              { x: decision.newPosition.x, y: decision.newPosition.y },
              { x: hero.x, y: hero.y },
              isMonsterRanged,
              decision.attackResult.hit,
              decision.attackResult.damage,
              decision.attackResult.isCritical
            );

            currentProps.setLatestRoll({
              id: Math.random().toString(),
              attackerName: currentActive.name,
              defenderName: hero.name,
              logTitle: decision.attackResult.logTitle,
              logDetail: decision.attackResult.logDetail,
              isCritical: decision.attackResult.isCritical,
              isFumble: decision.attackResult.isFumble,
              damage: decision.attackResult.damage,
              hit: decision.attackResult.hit
            });
          }

          if (decision.logActionName) {
            currentProps.addCombatLog(currentActive.name, decision.logActionName, decision.logDetail, 'attack');
          }

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

