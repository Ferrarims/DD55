import { CombatEntity } from '../../types';
import { rollDamageDiceWithFeats, getCriticalDiceString } from '../diceRoller';
import { isTwoHandedWeaponLocal } from '../weaponClassifier';

export interface BaseDamageCalculationResult {
  damage: number;
  damageDetails: string;
  extraEffectLog: string;
}

export function calculateBaseDamageAndFeats({
  attacker,
  defender,
  damageDice,
  isCritical,
  weaponOverride,
  distance,
  defenderDisplayName,
}: {
  attacker: CombatEntity;
  defender: CombatEntity;
  damageDice: string;
  isCritical: boolean;
  weaponOverride?: any;
  distance: number;
  defenderDisplayName: string;
}): BaseDamageCalculationResult {
  let damage = 0;
  let damageDetails = '';
  let extraEffectLog = '';

  const dType = weaponOverride?.damageType || 'Cortante';
  const wName = weaponOverride?.name || 'Ataque Desarmado';
  const isSavageAttacker =
    (attacker.feats?.includes('Atacante Selvagem') || attacker.feats?.includes('Savage Attacker')) &&
    !attacker.usedSavageAttackerThisTurn;

  const isMeleeAttack =
    distance <= 1 &&
    !(
      (weaponOverride?.properties || '').toLowerCase().includes('munição') ||
      (weaponOverride?.properties || '').toLowerCase().includes('distância') ||
      wName.toLowerCase().includes('arco') ||
      wName.toLowerCase().includes('besta') ||
      wName.toLowerCase().includes('funda')
    );

  if (isSavageAttacker) {
    attacker.usedSavageAttackerThisTurn = true;
    const diceToRoll = isCritical ? getCriticalDiceString(damageDice) : damageDice;
    const rolled1 = rollDamageDiceWithFeats(diceToRoll, attacker, isCritical, dType, wName, weaponOverride?.properties, isMeleeAttack);
    const rolled2 = rollDamageDiceWithFeats(diceToRoll, attacker, isCritical, dType, wName, weaponOverride?.properties, isMeleeAttack);
    if (rolled2.total > rolled1.total) {
      damage = rolled2.total;
      damageDetails = `${rolled2.rollDetails} (Talento Atacante Selvagem - maior entre ${rolled1.total} e ${rolled2.total})`;
    } else {
      damage = rolled1.total;
      damageDetails = `${rolled1.rollDetails} (Talento Atacante Selvagem - maior entre ${rolled1.total} e ${rolled2.total})`;
    }
  } else {
    if (isCritical) {
      const critDiceStr = getCriticalDiceString(damageDice);
      const rolled = rollDamageDiceWithFeats(critDiceStr, attacker, isCritical, dType, wName, weaponOverride?.properties, isMeleeAttack);
      damage = rolled.total;
      damageDetails = rolled.rollDetails;
    } else {
      const rolled = rollDamageDiceWithFeats(damageDice, attacker, isCritical, dType, wName, weaponOverride?.properties, isMeleeAttack);
      damage = rolled.total;
      damageDetails = rolled.rollDetails;
    }
  }

  // Dado extra no Acerto Crítico para o Talento Perfurador
  const hasPiercer = attacker.feats?.includes('Perfurador') || attacker.feats?.includes('Piercer');
  const isPiercingType = dType.toLowerCase().includes('perfurante') || dType.toLowerCase().includes('piercing');
  if (isCritical && hasPiercer && isPiercingType) {
    const match = damageDice.match(/(\d+)d(\d+)/i);
    const sides = match ? parseInt(match[2], 10) : 8;
    const extraDieRoll = Math.floor(Math.random() * sides) + 1;
    damage += extraDieRoll;
    damageDetails += ` + ${extraDieRoll} (Crítico Perfurador: +1d${sides})`;
  }

  // Mestre em Armas Grandes
  const isMelee = distance <= 1;
  const isTwoHanded =
    weaponOverride?.properties?.toLowerCase().includes('duas mãos') ||
    weaponOverride?.properties?.toLowerCase().includes('two-handed') ||
    (weaponOverride?.name && isTwoHandedWeaponLocal(weaponOverride.name));

  const hasGWM = attacker.feats?.includes('Mestre em Armas Grandes') || attacker.feats?.includes('Great Weapon Master');
  if (isMelee && isTwoHanded && hasGWM) {
    const bp = attacker.level ? Math.floor((attacker.level - 1) / 4) + 2 : 2;
    damage += bp;
    damageDetails += ` + ${bp} (Mestre em Armas Grandes)`;
  }

  // Bônus de +10 de Dano para GWM (toggled)
  if (weaponOverride?.gwmToggled) {
    damage += 10;
    damageDetails += ` + 10 (Mestre em Armas Grandes - Ataque Poderoso)`;
  }

  // Resistência a dano por Petrificado
  if (defender.conditions.some(c => c === 'Petrificado' || c === 'Petrified') && damage > 0) {
    damage = Math.floor(damage / 2);
    damageDetails += ` (Resistência a dano por Petrificado)`;
  }

  // Empurrão do Valentão de Taverna
  const hasTavernBrawler = attacker.feats?.includes('Valentão de Taverna') || attacker.feats?.includes('Tavern Brawler');
  const isUnarmed = wName.toLowerCase().includes('desarmado') || wName.toLowerCase().includes('unarmed') || damageDice.includes('unarmed');
  if (hasTavernBrawler && isUnarmed && damage > 0 && !attacker.usedTavernBrawlerPushThisTurn) {
    attacker.usedTavernBrawlerPushThisTurn = true;
    const dx = defender.x - attacker.x;
    const dy = defender.y - attacker.y;
    const stepX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
    const stepY = dy > 0 ? 1 : dy < 0 ? -1 : 0;
    const newX = defender.x + stepX;
    const newY = defender.y + stepY;
    if (newX >= 0 && newX < 150 && newY >= 0 && newY < 150) {
      defender.x = newX;
      defender.y = newY;
      extraEffectLog += ` 👊 [VALENTÃO DE TAVERNA] Empurrou ${defenderDisplayName} 1 quadrado para trás!`;
    }
  }

  return { damage, damageDetails, extraEffectLog };
}
