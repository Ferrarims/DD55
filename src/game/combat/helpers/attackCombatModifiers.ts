import { CombatEntity } from '../../types';
import { getEntitySizeInSquares, isTwoHandedWeaponLocal } from '../weaponClassifier';

export interface CombatModifiersResult {
  advantageSources: string[];
  disadvantageSources: string[];
  finalAdvantage: 'normal' | 'advantage' | 'disadvantage';
  advReason: string;
  criticalThreshold: number;
  autoCritMelee: boolean;
  attackBonus: number;
  attExhaustion: number;
}

export function evaluateCombatModifiers(
  attacker: CombatEntity,
  defender: CombatEntity,
  distance: number,
  normalCells: number,
  longCells: number,
  isRangedAttack: boolean,
  isPureRanged: boolean,
  advantage: 'normal' | 'advantage' | 'disadvantage' = 'normal',
  weaponOverride?: { 
    name?: string; 
    attackBonus?: number; 
    properties?: string; 
    range?: string;
    gwmToggled?: boolean;
    sharpshooterToggled?: boolean;
  },
  allEntities?: CombatEntity[],
  lightingDisadvantages: string[] = []
): CombatModifiersResult {
  const advantageSources: string[] = [];
  const disadvantageSources: string[] = [...lightingDisadvantages];

  const pStr = String(weaponOverride?.properties || '').toLowerCase();
  const nStr = String(weaponOverride?.name || '').toLowerCase();

  const hasSharpshooter = attacker.feats?.some((f: string) => {
    if (typeof f !== 'string') return false;
    const n = f.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return n.includes('mestre-atirador') || n.includes('mestre atirador') || n.includes('sharpshooter');
  }) || false;

  if (distance > normalCells && distance <= longCells) {
    if (!hasSharpshooter || !isRangedAttack) {
      disadvantageSources.push(`Alcance Longo (${distance * 1.5}m)`);
    }
  }

  if (isRangedAttack) {
    let potentialEnemies: CombatEntity[] = allEntities && allEntities.length > 0 ? allEntities : [defender];

    const hasAdjacentThreat = potentialEnemies.some(enemy => {
      const isEnemyType = (attacker.type === 'hero' && enemy.type === 'monster') ||
                          (attacker.type === 'monster' && enemy.type === 'hero');
      if (!isEnemyType || enemy.isDead) return false;

      const s1 = getEntitySizeInSquares(attacker.size);
      const s2 = getEntitySizeInSquares(enemy.size);
      let minDist = Infinity;
      for (let x1 = attacker.x; x1 < attacker.x + s1; x1++) {
        for (let y1 = attacker.y; y1 < attacker.y + s1; y1++) {
          for (let x2 = enemy.x; x2 < enemy.x + s2; x2++) {
            for (let y2 = enemy.y; y2 < enemy.y + s2; y2++) {
              const d = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
              if (d < minDist) minDist = d;
            }
          }
        }
      }

      if (minDist > 1) return false;

      const enemyIncapacitated = enemy.conditions.some(c => 
        c === 'Incapacitado' || c === 'Incapacitated' ||
        c === 'Paralisado' || c === 'Paralyzed' ||
        c === 'Inconsciente' || c === 'Unconscious' ||
        c === 'Atordoado' || c === 'Stunned' ||
        c === 'Petrificado' || c === 'Petrified'
      );
      if (enemyIncapacitated) return false;

      const enemyCanSee = !enemy.conditions.some(c => c === 'Cego' || c === 'Blinded') &&
                          !attacker.conditions.some(c => c === 'Invisível' || c === 'Invisible');
      
      return enemyCanSee;
    });

    if (hasAdjacentThreat && !hasSharpshooter) {
      disadvantageSources.push('Combate Próximo (Inimigo adjacente ativo que pode ver o atacante)');
    }
  }

  if (advantage === 'advantage') {
    advantageSources.push('Habilidade Ativa/Seleção');
  } else if (advantage === 'disadvantage') {
    disadvantageSources.push('Imposição de Efeito/Seleção');
  }

  // 1. Condições de Drenado e Afligido
  if (attacker.conditions.includes('Drenado') || attacker.conditions.includes('Sapped')) {
    disadvantageSources.push('Drenado (Sap)');
    attacker.conditions = attacker.conditions.filter(c => c !== 'Drenado' && c !== 'Sapped');
  }
  if (defender.conditions.includes('Afligido') || defender.conditions.includes('Vexed') || defender.conditions.includes('Vex')) {
    advantageSources.push('Afligido (Vex)');
    defender.conditions = defender.conditions.filter(c => c !== 'Afligido' && c !== 'Vexed' && c !== 'Vex');
  }

  // 2. Condições no ATACANTE
  const attExhaustion = attacker.exhaustionLevel || 0;
  if (attacker.conditions.some(c => c === 'Amedrontado' || c === 'Amedrontado_New' || c === 'Frightened')) {
    disadvantageSources.push('Atacante Amedrontado');
  }
  if (attacker.conditions.some(c => c === 'Envenenado' || c === 'Poisoned')) {
    disadvantageSources.push('Atacante Envenenado');
  }
  if (attacker.conditions.some(c => c === 'Cego' || c === 'Blinded')) {
    disadvantageSources.push('Atacante Cego');
  }
  if (attacker.conditions.some(c => c === 'Contido' || c === 'Restringido' || c === 'Restrained')) {
    disadvantageSources.push('Atacante Restringido');
  }
  if (attacker.conditions.some(c => c === 'Caído' || c === 'Prone')) {
    disadvantageSources.push('Atacante Caído');
  }
  if (attacker.conditions.some(c => c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled')) {
    if (attacker.grappledById && attacker.grappledById !== defender.id) {
      disadvantageSources.push('Agarrado (Alvo não é o Agarrador)');
    } else if (!attacker.grappledById) {
      disadvantageSources.push('Agarrado (Desvantagem contra alvos sob agarrão geral)');
    }
  }
  if (attacker.conditions.some(c => c === 'Invisível' || c === 'Invisible')) {
    advantageSources.push('Atacante Invisível');
  }

  // 2.1. Regra de Arma Pesada
  const isHeavyWeapon = pStr.includes('heavy') || pStr.includes('pesada') || nStr.includes('machado grande') || nStr.includes('espada grande') || nStr.includes('arco longo') || nStr.includes('besta pesada') || nStr.includes('malho') || nStr.includes('alabarda') || nStr.includes('glaive');
  if (isHeavyWeapon && attacker.type === 'hero') {
    const isMeleeHeavy = !isPureRanged;
    const strScore = attacker.stats?.str !== undefined ? attacker.stats.str : ((attacker as any).strength !== undefined ? (attacker as any).strength : 10);
    const dexScore = attacker.stats?.dex !== undefined ? attacker.stats.dex : ((attacker as any).dexterity !== undefined ? (attacker as any).dexterity : 10);
    if (isMeleeHeavy && strScore < 13) {
      disadvantageSources.push(`Arma Pesada (Força ${strScore} < 13)`);
    } else if (!isMeleeHeavy && dexScore < 13) {
      disadvantageSources.push(`Arma Pesada À Distância (Destreza ${dexScore} < 13)`);
    }
  }

  // 3. Condições no DEFENSOR
  if (defender.conditions.some(c => c === 'Caído' || c === 'Prone')) {
    if (distance <= 1) {
      advantageSources.push('Alvo Caído (Corpo a Corpo)');
    } else {
      disadvantageSources.push('Alvo Caído (À Distância)');
    }
  }
  if (defender.conditions.some(c => c === 'Cego' || c === 'Blinded')) advantageSources.push('Alvo Cego');
  if (defender.conditions.some(c => c === 'Paralisado' || c === 'Paralyzed')) advantageSources.push('Alvo Paralisado');
  if (defender.conditions.some(c => c === 'Inconsciente' || c === 'Unconscious')) advantageSources.push('Alvo Inconsciente');
  if (defender.conditions.some(c => c === 'Contido' || c === 'Restringido' || c === 'Restrained')) advantageSources.push('Alvo Restringido');
  if (defender.conditions.some(c => c === 'Atordoado' || c === 'Stunned')) advantageSources.push('Alvo Atordoado');
  if (defender.conditions.some(c => c === 'Petrificado' || c === 'Petrified')) advantageSources.push('Alvo Petrificado');
  if (defender.conditions.some(c => c === 'Invisível' || c === 'Invisible')) disadvantageSources.push('Alvo Invisível');
  if (defender.conditions.some(c => c === 'Esquivando' || c === 'Dodge')) disadvantageSources.push('Alvo Esquivando (Dodge)');

  let finalAdvantage: 'normal' | 'advantage' | 'disadvantage' = 'normal';
  let advReason = '';

  if (advantageSources.length > 0 && disadvantageSources.length > 0) {
    finalAdvantage = 'normal';
    advReason = ` [Normal - Fontes se Anulam: Vantagem (${advantageSources.join(', ')}) vs Desvantagem (${disadvantageSources.join(', ')})]`;
  } else if (advantageSources.length > 0) {
    finalAdvantage = 'advantage';
    advReason = ` [Vantagem de: ${advantageSources.join(', ')}]`;
  } else if (disadvantageSources.length > 0) {
    finalAdvantage = 'disadvantage';
    advReason = ` [Desvantagem de: ${disadvantageSources.join(', ')}]`;
  }

  let criticalThreshold = 20;
  if (attacker.type === 'hero' && attacker.charClass) {
    const clsLower = attacker.charClass.toLowerCase().trim();
    const lvl = attacker.level || 1;
    if ((clsLower.includes('guerreiro') || clsLower.includes('fighter')) && lvl >= 3) {
      criticalThreshold = 19;
    }
  }

  const hasAutoCritCondition = defender.conditions.some(c => 
    c === 'Paralisado' || c === 'Paralyzed' || c === 'Inconsciente' || c === 'Unconscious'
  );
  const autoCritMelee = hasAutoCritCondition && distance <= 1;

  let baseAttackBonus = weaponOverride?.attackBonus !== undefined ? weaponOverride.attackBonus : attacker.attackBonus;
  
  if (weaponOverride?.attackBonus === undefined) {
    const isRangedWeapon = weaponOverride?.properties?.toLowerCase().includes('munição') ||
                           (weaponOverride?.name && (
                             weaponOverride.name.toLowerCase().includes('arco') ||
                             weaponOverride.name.toLowerCase().includes('besta') ||
                             weaponOverride.name.toLowerCase().includes('funda') ||
                             weaponOverride.name.toLowerCase().includes('dardo') ||
                             weaponOverride.name.toLowerCase().includes('bow') ||
                             weaponOverride.name.toLowerCase().includes('crossbow') ||
                             weaponOverride.name.toLowerCase().includes('sling') ||
                             weaponOverride.name.toLowerCase().includes('dart')
                           ));
    const isRanged = isRangedWeapon || (weaponOverride === undefined && (distance > 1 || (weaponOverride?.range && parseFloat(weaponOverride.range) > 1.5)));
    const hasArchery = attacker.feats?.includes('Arquearia') || attacker.feats?.includes('Archery') || (attacker as any).fightingStyle === 'Arquearia';
    if (isRanged && hasArchery && !weaponOverride?.properties?.toLowerCase().includes('arquearia')) {
      baseAttackBonus += 2;
    }

    const isMeleeCombat = distance <= 1;
    const isTwoHandedWeapon = weaponOverride?.properties?.toLowerCase().includes('duas mãos') || 
                              weaponOverride?.properties?.toLowerCase().includes('two-handed') || 
                              (weaponOverride?.name && isTwoHandedWeaponLocal(weaponOverride.name));
    const hasDuelistFeat = attacker.feats?.some((f: string) => typeof f === 'string' && (f.toLowerCase().includes('duelismo') || f.toLowerCase().includes('duelist'))) || (attacker as any).fightingStyle === 'Duelismo' || (attacker as any).fighting_style === 'Duelismo';
    const isMeleeOneHandedCombat = isMeleeCombat && !isTwoHandedWeapon && !isRanged && weaponOverride?.name !== 'Ataque Desarmado';
    const alreadyHasDuelistInProps = weaponOverride?.properties?.toLowerCase().includes('duelismo');

    if (isMeleeOneHandedCombat && hasDuelistFeat && !alreadyHasDuelistInProps) {
      baseAttackBonus += 2;
    }
  }

  if (weaponOverride?.gwmToggled) {
    baseAttackBonus -= 5;
  }

  return {
    advantageSources,
    disadvantageSources,
    finalAdvantage,
    advReason,
    criticalThreshold,
    autoCritMelee,
    attackBonus: baseAttackBonus,
    attExhaustion
  };
}
