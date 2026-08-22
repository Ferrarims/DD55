import { CombatEntity } from '../../../../../game/types';
import { evaluateDamageAffinity } from '../../../../../game/combatUtils';
import { isHeavyArmor } from '../../../utils/platformUtils';

export interface CalculatedDamageResult {
  finalDamage: number;
  resistanceMsg: string;
  isSlashed: boolean;
  heavyArmorReducedBp: number;
}

export function calculateIncomingDamage({
  target,
  targetId,
  targetName,
  damageAmount,
  damageType,
  attackerId,
  character,
  heroFeats,
}: {
  target: CombatEntity;
  targetId: string;
  targetName: string;
  damageAmount: number;
  damageType?: string;
  attackerId?: string;
  character: any;
  heroFeats: string[];
}): CalculatedDamageResult {
  let finalDamage = damageAmount;
  let resistanceMsg = '';
  let isSlashed = false;
  let heavyArmorReducedBp = 0;

  // Verificar imunidades, resistências e vulnerabilidades
  if (damageType && damageAmount > 0) {
    const affinity = evaluateDamageAffinity({
      target,
      damageAmount,
      damageType,
      attackerId,
      heroFeats,
      isHeroAttacking: attackerId === 'hero'
    });

    if (affinity.multiplier === 0) {
      finalDamage = 0;
    } else if (affinity.multiplier === 0.5) {
      finalDamage = Math.floor(damageAmount / 2);
    } else if (affinity.multiplier === 2) {
      finalDamage = damageAmount * 2;
    }

    if (affinity.message) {
      resistanceMsg = affinity.message;
    }
  }

  // Especialista em Armaduras Pesadas
  if (targetId === 'hero' && heroFeats.includes('Especialista em Armaduras Pesadas')) {
    if (isHeavyArmor(character.equipped_armor)) {
      const bp = Math.max(2, Math.floor(((character.level || 1) - 1) / 4) + 2);
      finalDamage = Math.max(0, finalDamage - bp);
      heavyArmorReducedBp = bp;
    }
  }

  // Talhador (Slasher) debuff
  if (damageType && attackerId === 'hero' && heroFeats.includes('Talhador')) {
    const dtLower = damageType.toLowerCase();
    if (dtLower.includes('cortante') || dtLower.includes('slashing')) {
      isSlashed = true;
      resistanceMsg += ` ⚔️ [TALENTO TALHADOR] Debilitou ${targetName}, reduzindo seu deslocamento em 3m!`;
    }
  }

  return { finalDamage, resistanceMsg, isSlashed, heavyArmorReducedBp };
}

export function absorbDamageWithTempHp(currentTempHp: number, damage: number) {
  let damageRemaining = damage;
  let newTempHp = currentTempHp || 0;
  if (newTempHp > 0 && damageRemaining > 0) {
    if (damageRemaining <= newTempHp) {
      newTempHp -= damageRemaining;
      damageRemaining = 0;
    } else {
      damageRemaining -= newTempHp;
      newTempHp = 0;
    }
  }
  return { damageRemaining, newTempHp };
}
