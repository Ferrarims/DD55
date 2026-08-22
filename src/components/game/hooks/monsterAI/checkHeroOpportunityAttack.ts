import { CombatEntity, GridPosition } from '../../../../game/types';
import { getWeaponMaxRangeCells, getDistanceBetweenEntities, hasThrownProperty } from '../../../../game/combatUtils';

export interface OpportunityAttackCheckResult {
  triggeredStep: GridPosition | null;
  atkToUse: any;
}

export function checkHeroOpportunityAttack({
  hero,
  monster,
  pathTaken,
  currentSelectedAttack,
  characterRace,
  activeLargeForm,
}: {
  hero: CombatEntity;
  monster: CombatEntity;
  pathTaken?: GridPosition[];
  currentSelectedAttack: any;
  characterRace?: string;
  activeLargeForm: boolean;
}): OpportunityAttackCheckResult {
  const canHeroSeeMonster =
    !hero.conditions?.some(c => c === 'Cego' || c === 'Blinded') &&
    !monster.conditions?.some(c => c === 'Invisível' || c === 'Invisible');

  const isHeroIncapacitated = hero.conditions?.some(c => 
    c === 'Incapacitado' || c === 'Incapacitated' ||
    c === 'Paralisado' || c === 'Paralyzed' ||
    c === 'Inconsciente' || c === 'Unconscious' ||
    c === 'Atordoado' || c === 'Stunned' ||
    c === 'Petrificado' || c === 'Petrified'
  );

  if (
    !hero.hasReaction ||
    isHeroIncapacitated ||
    !canHeroSeeMonster ||
    monster.conditions?.includes('Desengajando') ||
    monster.conditions?.includes('Voando') ||
    !pathTaken ||
    pathTaken.length === 0
  ) {
    return { triggeredStep: null, atkToUse: currentSelectedAttack };
  }

  let atkToUse = currentSelectedAttack;
  let heroReach = 1;

  if (atkToUse) {
    heroReach = getWeaponMaxRangeCells(atkToUse);
    const isRanged =
      getWeaponMaxRangeCells(atkToUse) > 1 &&
      !hasThrownProperty(atkToUse) && 
      (
        atkToUse.range?.toLowerCase().includes('/') ||
        atkToUse.properties?.toLowerCase().includes('munição') ||
        atkToUse.properties?.toLowerCase().includes('ammunition') ||
        atkToUse.properties?.toLowerCase().includes('distância') ||
        atkToUse.properties?.toLowerCase().includes('ranged')
      );
    if (isRanged) {
      heroReach = 1;
      atkToUse = undefined;
    }
  }

  let wasInReach = getDistanceBetweenEntities(hero, monster, characterRace, activeLargeForm) <= heroReach;
  let prevStep = { x: monster.x, y: monster.y };

  for (const step of pathTaken) {
    const isNowInReach = getDistanceBetweenEntities(hero, { ...monster, x: step.x, y: step.y }, characterRace, activeLargeForm) <= heroReach;
    if (wasInReach && !isNowInReach) {
      return { triggeredStep: prevStep, atkToUse };
    }
    wasInReach = isNowInReach;
    prevStep = step;
  }

  return { triggeredStep: null, atkToUse };
}
