import { RACES_REFERENCE } from '../../../lib/api/references';
import { parseSpeedToGridCells } from '../../../lib/api/references';
import { getItemWeight, parseWeightToKg } from '../../../lib/mechanics/xpAndLootManager';

/**
 * Utilitários puros para cálculos do GamePlatform
 */

/**
 * Verifica se um nome de armadura é uma armadura pesada em D&D 5.5e
 */
export function isHeavyArmor(armorName?: string | null): boolean {
  if (!armorName) return false;
  const an = armorName.toLowerCase();
  return (
    an.includes('placas') ||
    an.includes('plate') ||
    an.includes('malha') ||
    an.includes('chainmail') ||
    an.includes('ringmail') ||
    an.includes('pesada')
  );
}

/**
 * Calcula a redução de dano físico para personagens com o talento Especialista em Armaduras Pesadas
 */
export function calculateHeavyArmorReduction(character: any, damageAmount: number): number {
  if (!character?.equipped_armor || !isHeavyArmor(character.equipped_armor)) {
    return 0;
  }
  const profBonus = Math.max(2, Math.floor(((character.level || 1) - 1) / 4) + 2);
  return Math.min(damageAmount, profBonus);
}

/**
 * Calcula o modificador de um atributo D&D (ex: 16 -> +3, 8 -> -1)
 */
export function calculateStatModifier(score: number = 10): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calcula o bônus total de iniciativa de um personagem herói
 */
export function calculateHeroInitiativeBonus(character: any, activeFeats: string[] = []): {
  dexMod: number;
  featBonus: number;
  exBonus: number;
  totalMod: number;
} {
  const dexMod = calculateStatModifier(character?.dexterity || character?.dex || 10);
  const hasAlertFeat = activeFeats.some(
    f => f && (f.trim().toLowerCase() === 'alerta' || f.trim().toLowerCase() === 'alert')
  );
  const featBonus = hasAlertFeat ? 2 + Math.floor(((character?.level || 1) - 1) / 4) : 0;
  const exBonus = -((character?.exhaustion_level || 0) * 2);
  const totalMod = dexMod + featBonus + exBonus;

  return { dexMod, featBonus, exBonus, totalMod };
}

/**
 * Calcula o peso total do inventário em kg
 */
export function calculateInventoryWeight(inventory: any[] = []): number {
  let sumWeight = 0;
  inventory.forEach((inv: any) => {
    const itemName = inv.item?.name || inv.items?.name || inv.name;
    if (itemName) {
      sumWeight += parseWeightToKg(getItemWeight(itemName)) * (inv.quantity || 1);
    }
  });
  return sumWeight;
}

/**
 * Calcula a capacidade máxima de carga do herói (considerando Porte Poderoso / Golias)
 */
export function calculateMaxCarryingCapacity(character: any): number {
  const isGoliathOrPowerfulBuild =
    ['Golias', 'Goliath'].includes(character?.race || character?.race_name) ||
    character?.traits?.some(
      (t: any) =>
        t.name?.includes('Porte Poderoso') ||
        t.name?.includes('Físico Poderoso') ||
        t.name?.includes('Powerful Build')
    );
  return (character?.strength || 10) * (isGoliathOrPowerfulBuild ? 30 : 15);
}

/**
 * Calcula o deslocamento do herói em células do grid considerando classe, armadura, carga, exaustão e transformações
 */
export function calculateEffectiveHeroSpeedCells(
  character: any,
  activeLargeForm: boolean = false
): number {
  let rawHeroSpeed = character?.speed;
  if (!rawHeroSpeed && character?.race && (RACES_REFERENCE as any)[character.race]) {
    rawHeroSpeed = (RACES_REFERENCE as any)[character.race].speed;
  }
  let heroSpeedGridCells = parseSpeedToGridCells(rawHeroSpeed || '9m');

  const clsNameLower = (character?.class_name || character?.charClass || '').toLowerCase();
  const heroLevelNum = character?.level || 1;
  let extraSpeedMeters = 0;

  if ((clsNameLower.includes('monge') || clsNameLower.includes('monk')) && heroLevelNum >= 2) {
    if (!character?.equipped_armor) {
      extraSpeedMeters +=
        heroLevelNum >= 18
          ? 9
          : heroLevelNum >= 14
          ? 7.5
          : heroLevelNum >= 10
          ? 6
          : heroLevelNum >= 6
          ? 4.5
          : 3;
    }
  }
  if ((clsNameLower.includes('bárbaro') || clsNameLower.includes('barbarian')) && heroLevelNum >= 5) {
    if (!character?.equipped_armor || !character?.equipped_armor.toLowerCase().includes('placas')) {
      extraSpeedMeters += 3;
    }
  }
  if (extraSpeedMeters > 0) {
    heroSpeedGridCells += Math.round(extraSpeedMeters / 1.5);
  }

  const exLevel = character?.exhaustion_level || 0;
  if (exLevel > 0) {
    heroSpeedGridCells = Math.max(0, heroSpeedGridCells - exLevel);
  }

  const sumWeight = calculateInventoryWeight(character?.character_inventory || []);
  const maxCapacity = calculateMaxCarryingCapacity(character);

  if (sumWeight > maxCapacity * 2) {
    heroSpeedGridCells = 0;
  } else if (sumWeight > maxCapacity) {
    heroSpeedGridCells = Math.max(0, heroSpeedGridCells - 4);
  }

  if (activeLargeForm) {
    heroSpeedGridCells += 2;
  }

  return heroSpeedGridCells;
}
