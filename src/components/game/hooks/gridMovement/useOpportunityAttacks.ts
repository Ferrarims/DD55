import React from 'react';
import { CombatEntity, CellData, BiomeType, WeatherType } from '../../../../game/types';
import { getDistanceBetweenEntities } from '../../../../game/combatUtils';
import { executeAttack } from '../../../../game/combatEngine';

export interface UseOpportunityAttacksProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  grid: CellData[][];
  character: any;
  activeLargeForm: boolean;
  biome: BiomeType;
  weather: WeatherType;
  isNight: boolean;
  torches: { x: number; y: number }[];
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  triggerAttackVisualEffect: (source: { x: number; y: number }, target: { x: number; y: number }, isRanged: boolean, hit: boolean, damage: number, isCritical?: boolean) => void;
  setLatestRoll: (roll: any) => void;
  processDamageAndCheckKill: (targetId: string, dmg: number, attackerName: string, damageType: string, attackerId: string) => void;
  getHeroLightRadiusInCells: () => number;
}

export function useOpportunityAttacks({
  entities,
  setEntities,
  grid,
  character,
  activeLargeForm,
  biome,
  isNight,
  torches,
  addCombatLog,
  triggerAttackVisualEffect,
  setLatestRoll,
  processDamageAndCheckKill,
  getHeroLightRadiusInCells,
}: UseOpportunityAttacksProps) {
  const checkOpportunityAttacks = (hero: CombatEntity, targetX: number, targetY: number, isBattleOver: boolean) => {
    const isDisengaging = hero.conditions?.includes('Desengajando');
    const isFlying = hero.conditions?.includes('Voando');
    const adjacentMonsters = entities.filter(e => e.type === 'monster' && !e.isDead);

    if (!isBattleOver && !isDisengaging && !isFlying) {
      adjacentMonsters.forEach(monster => {
        const canMonsterSeeHero =
          !monster.conditions?.some(c => c === 'Cego' || c === 'Blinded') &&
          !hero.conditions?.some(c => c === 'Invisível' || c === 'Invisible');
        const isMonsterIncapacitated = monster.conditions?.some(
          c =>
            c === 'Incapacitado' ||
            c === 'Incapacitated' ||
            c === 'Paralisado' ||
            c === 'Paralyzed' ||
            c === 'Inconsciente' ||
            c === 'Unconscious' ||
            c === 'Atordoado' ||
            c === 'Stunned' ||
            c === 'Petrificado' ||
            c === 'Petrified'
        );

        if (monster.hasReaction && !isMonsterIncapacitated && canMonsterSeeHero) {
          const monsterReach = monster.range || 1;
          const wasInReach =
            getDistanceBetweenEntities(hero, monster, character?.race, activeLargeForm) <= monsterReach;
          const willBeInReach =
            getDistanceBetweenEntities({ ...hero, x: targetX, y: targetY }, monster, character?.race, activeLargeForm) <= monsterReach;

          if (wasInReach && !willBeInReach) {
            const isIndoor = biome === 'Caverna' || biome === 'Masmorra';
            const isDarkEnv = isIndoor || (isNight && (biome === 'Floresta' || biome === 'Pântano' || biome === 'Deserto'));

            const atkRes = executeAttack(
              monster,
              hero,
              'normal',
              undefined,
              {
                isDarkEnvironment: isDarkEnv,
                torches,
                heroLightRadius: getHeroLightRadiusInCells(),
                heroX: hero.x,
                heroY: hero.y,
              },
              entities,
              grid
            );

            addCombatLog(
              monster.name,
              `⚔️ [Ataque de Oportunidade] ` + atkRes.logTitle,
              atkRes.logDetail,
              atkRes.hit ? 'damage' : 'attack'
            );

            triggerAttackVisualEffect(
              { x: monster.x, y: monster.y },
              { x: hero.x, y: hero.y },
              false,
              atkRes.hit,
              atkRes.damage,
              atkRes.isCritical
            );

            setLatestRoll({
              id: Math.random().toString(),
              attackerName: monster.name,
              defenderName: hero.name,
              logTitle: `[Ataque de Oportunidade] ` + atkRes.logTitle,
              logDetail: atkRes.logDetail,
              isCritical: atkRes.isCritical,
              isFumble: atkRes.isFumble,
              damage: atkRes.damage,
              hit: atkRes.hit,
            });

            if (atkRes.hit && atkRes.damage > 0) {
              processDamageAndCheckKill(hero.id, atkRes.damage, monster.name, 'Cortante', monster.id);
            }

            setEntities(prev => prev.map(e => (e.id === monster.id ? { ...e, hasReaction: false } : e)));
          }
        }
      });
    }
  };

  return { checkOpportunityAttacks };
}
