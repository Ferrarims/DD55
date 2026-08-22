import { CombatEntity } from '../types';
import { checkRangeAndCover, RangeAndCoverCheckResult } from './helpers/attackRangeAndCover';
import { evaluateLightingAndSenses } from './helpers/attackLightingAndSenses';
import { evaluateCombatModifiers } from './helpers/attackCombatModifiers';

export interface AttackResult {
  hit: boolean;
  attackRollHit: boolean;
  isGraze?: boolean;
  isCritical: boolean;
  isFumble: boolean;
  totalAttack: number;
  damage: number;
  logTitle: string;
  logDetail: string;
  isTotalCover?: boolean;
}

export interface EvaluatedAttackConditions {
  earlyResult?: AttackResult;
  attackerDisplayName: string;
  defenderDisplayName: string;
  distance: number;
  effectiveArmorClass: number;
  coverLogText: string;
  advantageSources: string[];
  disadvantageSources: string[];
  finalAdvantage: 'normal' | 'advantage' | 'disadvantage';
  advReason: string;
  criticalThreshold: number;
  autoCritMelee: boolean;
  attackBonus: number;
  damageDice: string;
  weaponLabel: string;
  damageTypeLabel: string;
  attExhaustion: number;
}

export function evaluateAttackConditions(
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
): EvaluatedAttackConditions {
  const hero = attacker.type === 'hero' ? attacker : (defender.type === 'hero' ? defender : null);

  const getIsHidden = (ent: CombatEntity): boolean => {
    if (ent.type !== 'monster' || ent.isDead || !lightingContext?.isDarkEnvironment) return false;

    const list = lightingContext.torches;
    const isPosIlluminated = list && list.length > 0 && list.some(t => Math.max(Math.abs(ent.x - t.x), Math.abs(ent.y - t.y)) <= 4);
    if (isPosIlluminated) return false;

    const heroX = lightingContext.heroX !== undefined ? lightingContext.heroX : (hero ? hero.x : ent.x);
    const heroY = lightingContext.heroY !== undefined ? lightingContext.heroY : (hero ? hero.y : ent.y);
    const distToHero = Math.max(Math.abs(ent.x - heroX), Math.abs(ent.y - heroY));

    if (lightingContext.heroLightRadius !== undefined && lightingContext.heroLightRadius > 0 && distToHero <= lightingContext.heroLightRadius) return false;

    if (hero && hero.hasDarkvision) {
      const dvCells = (hero.darkvisionRange || 18) / 1.5;
      if (distToHero <= dvCells) return false;
    }

    return true;
  };

  const attackerDisplayName = getIsHidden(attacker) ? 'Inimigo Oculto' : attacker.name;
  const defenderDisplayName = getIsHidden(defender) ? 'Inimigo Oculto' : defender.name;

  // 1. Condição Encantado / Enfeitiçado
  const isCharmed = attacker.conditions.some(c => c === 'Enfeitiçado' || c === 'Encantado' || c === 'Charmed');
  if (attacker.charmedById === defender.id || (isCharmed && (!attacker.charmedById || attacker.charmedById === defender.id))) {
    return {
      earlyResult: {
        hit: false,
        attackRollHit: false,
        isCritical: false,
        isFumble: false,
        totalAttack: 0,
        damage: 0,
        logTitle: '💖 Encantado (Charmed)',
        logDetail: `${attacker.name} está sob a condição Encantado/Enfeitiçado por ${defender.name} e não pode atacá-lo nem alvejá-lo com efeitos nocivos!`
      },
      attackerDisplayName, defenderDisplayName, distance: 0, effectiveArmorClass: 10, coverLogText: '', advantageSources: [], disadvantageSources: [], finalAdvantage: 'normal', advReason: '', criticalThreshold: 20, autoCritMelee: false, attackBonus: 0, damageDice: '', weaponLabel: '', damageTypeLabel: '', attExhaustion: 0
    };
  }

  // 2. Condição Incapacitado (inclui Paralisado, Atordoado, Inconsciente, Petrificado)
  const isIncapacitated = attacker.conditions.some(c => 
    c === 'Incapacitado' || c === 'Incapacitated' ||
    c === 'Paralisado' || c === 'Paralyzed' ||
    c === 'Atordoado' || c === 'Stunned' ||
    c === 'Inconsciente' || c === 'Unconscious' ||
    c === 'Petrificado' || c === 'Petrified'
  );
  if (isIncapacitated) {
    return {
      earlyResult: {
        hit: false,
        attackRollHit: false,
        isCritical: false,
        isFumble: false,
        totalAttack: 0,
        damage: 0,
        logTitle: '🌀 Incapacitado (Incapacitated)',
        logDetail: `${attacker.name} está Incapacitado e não pode realizar ações, ataques ou reações!`
      },
      attackerDisplayName, defenderDisplayName, distance: 0, effectiveArmorClass: 10, coverLogText: '', advantageSources: [], disadvantageSources: [], finalAdvantage: 'normal', advReason: '', criticalThreshold: 20, autoCritMelee: false, attackBonus: 0, damageDice: '', weaponLabel: '', damageTypeLabel: '', attExhaustion: 0
    };
  }

  // 3. Alcance e Cobertura
  const rangeCoverResult = checkRangeAndCover(attacker, defender, attackerDisplayName, defenderDisplayName, weaponOverride, allEntities, grid);
  if (rangeCoverResult.earlyResult) {
    return {
      earlyResult: rangeCoverResult.earlyResult,
      attackerDisplayName, defenderDisplayName, distance: rangeCoverResult.distance, effectiveArmorClass: rangeCoverResult.effectiveArmorClass, coverLogText: rangeCoverResult.coverLogText, advantageSources: [], disadvantageSources: [], finalAdvantage: 'normal', advReason: '', criticalThreshold: 20, autoCritMelee: false, attackBonus: 0, damageDice: '', weaponLabel: '', damageTypeLabel: '', attExhaustion: 0
    };
  }

  // 4. Iluminação e Sentidos
  const lightingResult = evaluateLightingAndSenses(attacker, defender, rangeCoverResult.distance, lightingContext);
  if (lightingResult.earlyResult) {
    return {
      earlyResult: lightingResult.earlyResult,
      attackerDisplayName, defenderDisplayName, distance: rangeCoverResult.distance, effectiveArmorClass: rangeCoverResult.effectiveArmorClass, coverLogText: rangeCoverResult.coverLogText, advantageSources: [], disadvantageSources: [], finalAdvantage: 'normal', advReason: '', criticalThreshold: 20, autoCritMelee: false, attackBonus: 0, damageDice: '', weaponLabel: '', damageTypeLabel: '', attExhaustion: 0
    };
  }

  // 5. Modificadores e Condições de Combate
  const modifiers = evaluateCombatModifiers(
    attacker,
    defender,
    rangeCoverResult.distance,
    rangeCoverResult.normalCells,
    rangeCoverResult.longCells,
    rangeCoverResult.isRangedAttack,
    rangeCoverResult.isPureRanged,
    advantage,
    weaponOverride,
    allEntities,
    lightingResult.lightingDisadvantages
  );

  const damageDice = weaponOverride?.damageDice || attacker.damageDice;
  const weaponLabel = weaponOverride?.name ? ` com ${weaponOverride.name}` : '';
  const damageTypeLabel = weaponOverride?.damageType ? ` (${weaponOverride.damageType})` : '';

  return {
    attackerDisplayName,
    defenderDisplayName,
    distance: rangeCoverResult.distance,
    effectiveArmorClass: rangeCoverResult.effectiveArmorClass,
    coverLogText: rangeCoverResult.coverLogText,
    advantageSources: modifiers.advantageSources,
    disadvantageSources: modifiers.disadvantageSources,
    finalAdvantage: modifiers.finalAdvantage,
    advReason: modifiers.advReason,
    criticalThreshold: modifiers.criticalThreshold,
    autoCritMelee: modifiers.autoCritMelee,
    attackBonus: modifiers.attackBonus,
    damageDice,
    weaponLabel,
    damageTypeLabel,
    attExhaustion: modifiers.attExhaustion
  };
}
