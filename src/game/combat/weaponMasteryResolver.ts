import { CombatEntity } from '../types';
import { calculateBaseDamageAndFeats } from './mastery/damageFeatModifiers';
import { resolveHitMasteryEffects, resolveMissMasteryEffects } from './mastery/hitAndMissMasteryEffects';

export interface DamageAndMasteryResolutionParams {
  hit: boolean;
  isCritical: boolean;
  attacker: CombatEntity;
  defender: CombatEntity;
  damageDice: string;
  weaponOverride?: { 
    name?: string; 
    attackBonus?: number; 
    damageDice?: string; 
    damageType?: string; 
    mastery?: string; 
    properties?: string; 
    range?: string;
    gwmToggled?: boolean;
    sharpshooterToggled?: boolean;
  };
  distance: number;
  attackerDisplayName: string;
  defenderDisplayName: string;
  grid?: any[][];
  allEntities?: CombatEntity[];
}

export interface DamageAndMasteryResolutionResult {
  damage: number;
  damageDetails: string;
  masteryEffectLog: string;
  hit: boolean;
  isGraze: boolean;
}

export function resolveDamageAndMasteries(
  params: DamageAndMasteryResolutionParams
): DamageAndMasteryResolutionResult {
  let { hit, isCritical, attacker, defender, damageDice, weaponOverride, distance, attackerDisplayName, defenderDisplayName, grid, allEntities } = params;

  let damage = 0;
  let damageDetails = '';
  let masteryEffectLog = '';
  let isGraze = false;

  const activeMastery = weaponOverride?.mastery || '';
  const mLower = activeMastery.toLowerCase();

  if (hit) {
    const baseCalc = calculateBaseDamageAndFeats({
      attacker,
      defender,
      damageDice,
      isCritical,
      weaponOverride,
      distance,
      defenderDisplayName,
    });

    damage = baseCalc.damage;
    damageDetails = baseCalc.damageDetails;
    masteryEffectLog = baseCalc.extraEffectLog;

    if (mLower) {
      const hitMasteryLog = resolveHitMasteryEffects({
        mLower,
        attacker,
        defender,
        attackerDisplayName,
        defenderDisplayName,
        grid,
        allEntities,
      });
      masteryEffectLog += hitMasteryLog;
    }
  } else {
    const missEffect = resolveMissMasteryEffects({
      mLower,
      attacker,
      defenderDisplayName,
    });

    if (missEffect) {
      damage = missEffect.damage;
      damageDetails = missEffect.damageDetails;
      hit = missEffect.hit;
      isGraze = missEffect.isGraze;
      masteryEffectLog = missEffect.masteryEffectLog;
    }
  }

  return {
    damage,
    damageDetails,
    masteryEffectLog,
    hit,
    isGraze
  };
}
