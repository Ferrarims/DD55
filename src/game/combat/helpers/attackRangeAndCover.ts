import { CombatEntity } from '../../types';
import { calculateCover } from '../../coverMechanics';
import { getEntitySizeInSquares } from '../weaponClassifier';
import { AttackResult } from '../attackConditionsEvaluator';

export interface RangeAndCoverCheckResult {
  distance: number;
  normalCells: number;
  longCells: number;
  isReachMelee: boolean;
  isPureRanged: boolean;
  isRangedAttack: boolean;
  effectiveArmorClass: number;
  coverLogText: string;
  earlyResult?: AttackResult;
}

export function checkRangeAndCover(
  attacker: CombatEntity,
  defender: CombatEntity,
  attackerDisplayName: string,
  defenderDisplayName: string,
  weaponOverride?: { 
    name?: string; 
    properties?: string; 
    range?: string;
  },
  allEntities?: CombatEntity[],
  grid?: any[][]
): RangeAndCoverCheckResult {
  const attackerSize = getEntitySizeInSquares(attacker.size);
  const defenderSize = getEntitySizeInSquares(defender.size);

  let dx = 0;
  if (attacker.x + attackerSize <= defender.x) {
    dx = defender.x - (attacker.x + attackerSize - 1);
  } else if (defender.x + defenderSize <= attacker.x) {
    dx = attacker.x - (defender.x + defenderSize - 1);
  }

  let dy = 0;
  if (attacker.y + attackerSize <= defender.y) {
    dy = defender.y - (attacker.y + attackerSize - 1);
  } else if (defender.y + defenderSize <= attacker.y) {
    dy = attacker.y - (defender.y + defenderSize - 1);
  }

  const distance = Math.max(dx, dy);

  const weaponRangeStr = weaponOverride?.range || (attacker.type === 'hero' ? (attacker as any).range : `${attacker.range * 1.5}m`);
  const weaponProps = weaponOverride?.properties || '';
  const weaponName = weaponOverride?.name || '';

  let normalCells = 1;
  let longCells = 1;
  const rStr = String(weaponRangeStr || '').toLowerCase();
  const pStr = String(weaponProps || '').toLowerCase();
  const nStr = String(weaponName || '').toLowerCase();

  const isPureRangedName = nStr.includes('arco') || nStr.includes('besta') || nStr.includes('funda') || 
    nStr.includes('bow') || nStr.includes('crossbow') || nStr.includes('sling') || nStr.includes('dardo') || nStr.includes('dart');

  const hasThrown = rStr.includes('arremesso') || pStr.includes('arremesso') || pStr.includes('thrown') || isPureRangedName;

  const hasMeleeBase = rStr.startsWith('1,5m') || rStr.startsWith('1.5m') || rStr.startsWith('3m') || rStr.startsWith('3.0m') || rStr.includes('toque') || rStr.includes('touch');

  const isPureRanged = isPureRangedName || (
    (rStr.includes('/') || rStr.includes('munição') || pStr.includes('munição') || pStr.includes('ammunition')) && 
    !hasMeleeBase && 
    !hasThrown
  );

  const slashMatch = rStr.match(/([0-9]+[\.,]?[0-9]*)\s*m?\s*\/\s*([0-9]+[\.,]?[0-9]*)\s*m?/i);
  if (slashMatch) {
    const normalMeters = parseFloat(slashMatch[1].replace(',', '.'));
    const longMeters = parseFloat(slashMatch[2].replace(',', '.'));
    normalCells = Math.max(1, Math.round(normalMeters / 1.5));
    longCells = Math.max(normalCells, Math.round(longMeters / 1.5));
    if (distance <= 1 && rStr.startsWith('1,5m')) {
      normalCells = 1;
      longCells = 1;
    }
  } else {
    const singleMatch = rStr.match(/([0-9]+[\.,]?[0-9]*)\s*m/i);
    if (singleMatch) {
      const meters = parseFloat(singleMatch[1].replace(',', '.'));
      normalCells = Math.max(1, Math.round(meters / 1.5));
    } else {
      const parsed = parseFloat(rStr);
      if (!isNaN(parsed)) {
        normalCells = Math.max(1, Math.round(parsed / 1.5));
      }
    }
    longCells = normalCells;

    if (hasThrown || pStr.includes('arremesso')) {
      if (distance > normalCells) {
        normalCells = 4;
        longCells = 12;
      }
    }
  }

  const isReachMelee = pStr.includes('extensão') || pStr.includes('extensao') || pStr.includes('reach') || pStr.includes('alcance');
  if (isReachMelee && !isPureRanged) {
    normalCells = Math.max(normalCells, 2);
    longCells = Math.max(longCells, 2);
  }

  if (distance > longCells) {
    return {
      distance, normalCells, longCells, isReachMelee, isPureRanged, isRangedAttack: false, effectiveArmorClass: 10, coverLogText: '',
      earlyResult: {
        hit: false,
        attackRollHit: false,
        isCritical: false,
        isFumble: false,
        totalAttack: 0,
        damage: 0,
        logTitle: '⚠️ Fora de Alcance',
        logDetail: `O alvo está a ${distance * 1.5}m, mas o alcance máximo da arma é ${longCells * 1.5}m.`
      }
    };
  }

  const coverResult = calculateCover(attacker, defender, grid, allEntities);
  if (coverResult.degree === 'total') {
    return {
      distance, normalCells, longCells, isReachMelee, isPureRanged, isRangedAttack: false, effectiveArmorClass: 10, coverLogText: '',
      earlyResult: {
        hit: false,
        attackRollHit: false,
        isCritical: false,
        isFumble: false,
        totalAttack: 0,
        damage: 0,
        logTitle: '🛡️ Cobertura Total (Total Cover)',
        logDetail: `${defenderDisplayName} está em Cobertura Total em relação a ${attackerDisplayName} e não pode ser alvejado diretamente!`,
        isTotalCover: true
      }
    };
  }

  const isRangedAttack = !isReachMelee && (isPureRanged || 
    (hasThrown && distance > (isReachMelee ? 2 : 1)) ||
    (pStr.includes('munição') || pStr.includes('ammunition') || pStr.includes('distância') || pStr.includes('ranged') || pStr.includes('distancia')) ||
    (attacker.type !== 'hero' && attacker.range > 1 && !attacker.name.toLowerCase().includes('glaive') && !attacker.name.toLowerCase().includes('alabarda')) ||
    (weaponOverride?.range && !weaponOverride.range.toLowerCase().includes('toque') && !weaponOverride.range.toLowerCase().includes('touch') && !weaponOverride.range.toLowerCase().includes('1.5') && !weaponOverride.range.toLowerCase().includes('1,5') && !hasThrown));

  const hasSharpshooter = attacker.feats?.some((f: string) => {
    if (typeof f !== 'string') return false;
    const n = f.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    return n.includes('mestre-atirador') || n.includes('mestre atirador') || n.includes('sharpshooter');
  }) || false;

  const ignoresCover = hasSharpshooter && isRangedAttack && (coverResult.degree === 'half' || coverResult.degree === 'three_quarters');

  const defenderAc = defender.ac !== undefined ? defender.ac : (defender.armor_class !== undefined ? defender.armor_class : 10);
  const effectiveArmorClass = ignoresCover ? defenderAc : (defenderAc + coverResult.acBonus);
  const coverLogText = coverResult.acBonus > 0 
    ? (ignoresCover ? ` [🎯 Mestre-Atirador: Ignorou ${coverResult.description}]` : ` [🛡️ Cobertura Aplicada: +${coverResult.acBonus} CA - ${coverResult.description}]`) 
    : '';

  const isTargetFlying = defender.conditions.includes('Voando');
  if (!isRangedAttack && isTargetFlying) {
    return {
      distance, normalCells, longCells, isReachMelee, isPureRanged, isRangedAttack, effectiveArmorClass, coverLogText,
      earlyResult: {
        hit: false,
        attackRollHit: false,
        isCritical: false,
        isFumble: false,
        totalAttack: 0,
        damage: 0,
        logTitle: '🕊️ Alvo Voando',
        logDetail: `O alvo está voando a 3m de altura e não pode ser atingido por ataques corpo a corpo!`
      }
    };
  }

  return {
    distance,
    normalCells,
    longCells,
    isReachMelee,
    isPureRanged,
    isRangedAttack,
    effectiveArmorClass,
    coverLogText
  };
}
