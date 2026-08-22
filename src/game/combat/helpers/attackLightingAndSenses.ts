import { CombatEntity } from '../../types';
import { AttackResult } from '../attackConditionsEvaluator';

export interface LightingCheckResult {
  earlyResult?: AttackResult;
  lightingDisadvantages: string[];
}

export function evaluateLightingAndSenses(
  attacker: CombatEntity,
  defender: CombatEntity,
  distance: number,
  lightingContext?: {
    isDarkEnvironment: boolean;
    torches: { x: number; y: number }[];
    heroLightRadius?: number;
    heroX?: number;
    heroY?: number;
  }
): LightingCheckResult {
  const lightingDisadvantages: string[] = [];

  if (!lightingContext?.isDarkEnvironment) {
    return { lightingDisadvantages };
  }

  const isPosIlluminated = (px: number, py: number, list: { x: number; y: number }[]): boolean => {
    const nearStaticTorch = list && list.length > 0 && list.some(t => Math.max(Math.abs(px - t.x), Math.abs(py - t.y)) <= 4);
    if (nearStaticTorch) return true;

    if (lightingContext.heroLightRadius !== undefined && lightingContext.heroLightRadius > 0 &&
        lightingContext.heroX !== undefined && lightingContext.heroY !== undefined) {
      const distToHero = Math.max(Math.abs(px - lightingContext.heroX), Math.abs(py - lightingContext.heroY));
      if (distToHero <= lightingContext.heroLightRadius) {
        return true;
      }
    }

    if (list && list.some(t => Math.max(Math.abs(px - t.x), Math.abs(py - t.y)) <= 4)) return true;

    return false;
  };

  const isAttackerInLight = isPosIlluminated(attacker.x, attacker.y, lightingContext.torches);
  const isDefenderInLight = isPosIlluminated(defender.x, defender.y, lightingContext.torches);

  const hasBlindFighting = attacker.feats?.some(f => {
    const n = (f || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return n.includes('luta as cegas') || n.includes('blind fighting');
  }) || false;

  let attackerBlindsightRangeCells = 0;
  if (attacker.senses) {
    const sensesLower = attacker.senses.toLowerCase();
    if (sensesLower.includes('blindsight') || sensesLower.includes('sentido cegante') || sensesLower.includes('blind sense')) {
      const match = sensesLower.match(/(\d+)\s*(ft|pés|m)/i);
      attackerBlindsightRangeCells = match ? (match[2].includes('m') ? parseInt(match[1], 10) / 1.5 : parseInt(match[1], 10) / 5) : 6;
    }
  }
  if (attacker.traits) {
    for (const t of attacker.traits) {
      const text = `${t.name} ${t.text || ''}`.toLowerCase();
      if (text.includes('blindsight') || text.includes('sentido cegante') || text.includes('blind sense')) {
        const match = text.match(/(\d+)\s*(ft|pés|m)/i);
        attackerBlindsightRangeCells = match ? (match[2].includes('m') ? parseInt(match[1], 10) / 1.5 : parseInt(match[1], 10) / 5) : 6;
      }
    }
  }
  if (hasBlindFighting) {
    attackerBlindsightRangeCells = Math.max(attackerBlindsightRangeCells, 2);
  }

  const isWithinBlindsight = distance <= attackerBlindsightRangeCells;

  if (attacker.type === 'monster') {
    let canMonsterSeeDefender = isDefenderInLight || isWithinBlindsight;
    if (!canMonsterSeeDefender && attacker.hasDarkvision) {
      const dvCells = (attacker.darkvisionRange || 18) / 1.5;
      if (distance <= dvCells) canMonsterSeeDefender = true;
    }

    if (!canMonsterSeeDefender) {
      return {
        earlyResult: {
          hit: false,
          attackRollHit: false,
          isCritical: false,
          isFumble: false,
          totalAttack: 0,
          damage: 0,
          logTitle: '🌑 Ataque Falhou na Escuridão',
          logDetail: `${attacker.name} não consegue ver ${defender.name} na escuridão (fora da iluminação, visão no escuro e sentido cegante)!`
        },
        lightingDisadvantages
      };
    }
  }

  if (!isAttackerInLight && !attacker.hasDarkvision && !(hasBlindFighting && isWithinBlindsight)) {
    lightingDisadvantages.push('Atacante na Escuridão (Sem Visão no Escuro)');
  }
  if (!isDefenderInLight && !attacker.hasDarkvision && !(hasBlindFighting && isWithinBlindsight)) {
    lightingDisadvantages.push('Alvo na Escuridão (Sem Visão no Escuro)');
  }

  return { lightingDisadvantages };
}
