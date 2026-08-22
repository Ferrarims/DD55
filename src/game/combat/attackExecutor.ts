import { CombatEntity } from '../types';
import { evaluateAttackConditions, AttackResult } from './attackConditionsEvaluator';
import { resolveDamageAndMasteries } from './weaponMasteryResolver';
import { getCriticalDiceString } from './diceRoller';

export type { AttackResult };

export function executeAttack(
  attacker: CombatEntity,
  defender: CombatEntity,
  advantage: 'normal' | 'advantage' | 'disadvantage' = 'normal',
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
  },
  lightingContext?: {
    isDarkEnvironment: boolean;
    torches: { x: number; y: number }[];
    heroLightRadius?: number;
    heroX?: number;
    heroY?: number;
  },
  allEntities?: CombatEntity[],
  grid?: any[][]
): AttackResult {
  const evalResult = evaluateAttackConditions(
    attacker,
    defender,
    advantage,
    weaponOverride,
    lightingContext,
    allEntities,
    grid
  );

  if (evalResult.earlyResult) {
    return evalResult.earlyResult;
  }

  const {
    attackerDisplayName,
    defenderDisplayName,
    distance,
    effectiveArmorClass,
    coverLogText,
    finalAdvantage,
    advReason,
    criticalThreshold,
    autoCritMelee,
    attackBonus,
    damageDice,
    weaponLabel,
    damageTypeLabel,
    attExhaustion
  } = evalResult;

  let d1 = Math.floor(Math.random() * 20) + 1;
  let d2 = Math.floor(Math.random() * 20) + 1;
  let d20 = d1;
  let advText = '';

  if (finalAdvantage === 'advantage') {
    d20 = Math.max(d1, d2);
    advText = `${advReason} (Dados: ${d1}, ${d2})`;
  } else if (finalAdvantage === 'disadvantage') {
    d20 = Math.min(d1, d2);
    advText = `${advReason} (Dados: ${d1}, ${d2})`;
  } else if (advReason) {
    advText = advReason;
  }

  let isCritical = d20 >= criticalThreshold;
  const isFumble = d20 === 1;

  let totalAttack = d20 + attackBonus - (attExhaustion * 2);
  let hit = isCritical || (!isFumble && totalAttack >= effectiveArmorClass);

  // Sortudo (Lucky) re-roll
  const hasLuckyFeat = attacker.feats?.includes('Sortudo') || attacker.feats?.includes('Lucky');
  if (!hit && hasLuckyFeat) {
    const luckyD20 = Math.floor(Math.random() * 20) + 1;
    if (luckyD20 > d20) {
      d20 = luckyD20;
      const newTotalAttack = d20 + attackBonus - (attExhaustion * 2);
      const newHit = d20 >= criticalThreshold || (d20 !== 1 && newTotalAttack >= effectiveArmorClass);
      if (newHit) {
        hit = true;
        totalAttack = newTotalAttack;
        if (d20 >= criticalThreshold) {
          isCritical = true;
        }
        advText += ` 🍀 [TALENTO SORTUDO] Re-rolou d20 de falha: Novo D20 ${d20}! (Total: ${totalAttack})`;
      } else {
        advText += ` 🍀 [TALENTO SORTUDO] Re-rolou falha para ${luckyD20}, mas ainda errou.`;
      }
    }
  }

  // Dádiva da Proeza em Combate (Epic Boon of Combat Prowess)
  const hasCombatProwess = attacker.feats?.includes('Dádiva da Proeza em Combate') || attacker.feats?.includes('Epic Boon of Combat Prowess');
  if (!hit && hasCombatProwess) {
    hit = true;
    totalAttack = effectiveArmorClass;
    advText += ` 🛡️ [DÁDIVA DA PROEZA EM COMBATE] Transformou um erro em acerto automático!`;
  }

  const attackRollHit = hit;

  if (hit && autoCritMelee) {
    isCritical = true;
  }

  const masteryResolution = resolveDamageAndMasteries({
    hit,
    isCritical,
    attacker,
    defender,
    damageDice,
    weaponOverride,
    distance,
    attackerDisplayName,
    defenderDisplayName,
    grid,
    allEntities
  });

  const { damage, damageDetails, masteryEffectLog, isGraze } = masteryResolution;
  hit = masteryResolution.hit;

  let logTitle = '';
  if (isCritical) {
    logTitle = `🎯 CRÍTICO! ${attackerDisplayName}${weaponLabel} acertou ${defenderDisplayName} (${totalAttack} vs CA ${effectiveArmorClass}${coverLogText}) causando ${damage} de Dano${damageTypeLabel}!`;
  } else if (isFumble) {
    logTitle = `💀 ERRO CRÍTICO! ${attackerDisplayName}${weaponLabel} errou completamente ${defenderDisplayName} (${totalAttack} vs CA ${effectiveArmorClass}${coverLogText}).`;
  } else if (isGraze) {
    logTitle = `💥 ${attackerDisplayName}${weaponLabel} ERROU ${defenderDisplayName} (${totalAttack} vs CA ${effectiveArmorClass}${coverLogText}), mas causou ${damage} Dano de Raspão (Garantido)!`;
  } else if (hit) {
    logTitle = `⚔️ ${attackerDisplayName}${weaponLabel} ACERTOU ${defenderDisplayName}! (${totalAttack} vs CA ${effectiveArmorClass}${coverLogText}) -> ${damage} Dano${damageTypeLabel}`;
  } else {
    logTitle = `🛡️ ${attackerDisplayName}${weaponLabel} errou ${defenderDisplayName} (${totalAttack} vs CA ${effectiveArmorClass}${coverLogText})`;
  }

  const displayDice = isCritical ? getCriticalDiceString(damageDice) : damageDice;
  const exhaustionDetail = attExhaustion > 0 ? ` - Exaustão (${attExhaustion * 2})` : '';
  const logDetail = `D20: ${d20}${advText} + Bônus (${attackBonus >= 0 ? '+' : ''}${attackBonus})${exhaustionDetail} = ${totalAttack}. Dano (${displayDice}): ${damageDetails}.${masteryEffectLog}`;

  return {
    hit,
    attackRollHit,
    isGraze,
    isCritical,
    isFumble,
    totalAttack,
    damage,
    logTitle,
    logDetail
  };
}
