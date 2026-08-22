import {
  isTwoHandedWeapon,
  isCrossbow,
  blocksShield,
  isArmorNotShield,
} from './ac/acWeaponClassification';
import { computeBaseCandidates } from './ac/acBaseCandidates';
import { computeShieldAndBonuses } from './ac/acBonusCalculator';
import {
  ACCalculationInventoryItem,
  ACCalculationParams,
  ACCalculationResult,
} from './ac/acTypes';

export type { ACCalculationInventoryItem, ACCalculationParams, ACCalculationResult };
export { isTwoHandedWeapon, isCrossbow, blocksShield, isArmorNotShield };

export const calculateAC = (params: ACCalculationParams): ACCalculationResult => {
  const {
    charClass,
    stats,
    equippedArmor,
    equippedShield,
    equippedRing,
    fightingStyle,
    inventoryItems,
    selectedWeaponName,
    equipmentSlots,
    feats = [],
    activeSpells = [],
    coverType = 'none',
    dualWieldingActive = false,
  } = params;

  const dexMod = Math.floor(((stats.dex || 10) - 10) / 2);
  const conMod = Math.floor(((stats.con || 10) - 10) / 2);
  const wisMod = Math.floor(((stats.wis || 10) - 10) / 2);

  let slots: Record<string, string | null> = {};
  if (typeof equipmentSlots === 'string') {
    try {
      slots = JSON.parse(equipmentSlots);
    } catch {
      slots = {};
    }
  } else if (equipmentSlots && typeof equipmentSlots === 'object') {
    slots = equipmentSlots;
  }

  let armorName = equippedArmor || slots['corpo_torso'] || null;
  if (armorName && !isArmorNotShield(armorName)) {
    armorName = null;
  }

  let shieldName = equippedShield || slots['empunhadura_2'] || slots['empunhadura_1'] || null;
  if (shieldName && !shieldName.toLowerCase().includes('escudo') && !shieldName.toLowerCase().includes('shield')) {
    if (slots['empunhadura_1'] && (slots['empunhadura_1'].toLowerCase().includes('escudo') || slots['empunhadura_1'].toLowerCase().includes('shield'))) {
      shieldName = slots['empunhadura_1'];
    } else {
      shieldName = null;
    }
  }

  const getItemName = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.name || item.items?.name || '';
  };

  const items = inventoryItems || [];
  if (!armorName && Array.isArray(items)) {
    const foundArmor = items.find(item => {
      if (typeof item === 'string') return false;
      if (!item) return false;
      const isEquipped = item.equipped === true || (item as any).equip_slot === 'corpo_torso';
      if (!isEquipped) return false;
      const n = getItemName(item);
      return isArmorNotShield(n);
    });
    if (foundArmor && typeof foundArmor !== 'string') {
      armorName = getItemName(foundArmor) || null;
    }
  }

  if (!shieldName && Array.isArray(items)) {
    const foundShield = items.find(item => {
      if (typeof item === 'string') return false;
      if (!item) return false;
      const slot = (item as any).equip_slot;
      const isEquipped = item.equipped === true || (slot && /escudo|shield|empunhadura_2|empunhadura_1/i.test(slot));
      if (!isEquipped) return false;
      const n = getItemName(item);
      return /escudo|shield/i.test(n);
    });
    if (foundShield && typeof foundShield !== 'string') {
      shieldName = getItemName(foundShield) || null;
    }
  }

  const hasArmorWorn = Boolean(armorName && isArmorNotShield(armorName));

  // 1. Calcular candidatos de fórmula base
  const { chosenBase, armorDexBonus } = computeBaseCandidates({
    charClass,
    dexMod,
    conMod,
    wisMod,
    hasArmorWorn,
    armorName,
    activeSpells,
    slots,
    feats,
  });

  const conflictAlerts: string[] = [];
  if (chosenBase.requiresNoArmor && hasArmorWorn) {
    conflictAlerts.push(`Conflito de Base: Habilidade sem armadura escolhida, mas armadura "${armorName}" está equipada. O motor priorizou a maior CA.`);
  }

  // 2. Calcular bônus de escudo, itens mágicos, talentos e cobertura
  const bonusResult = computeShieldAndBonuses({
    shieldName,
    chosenBase,
    selectedWeaponName,
    slots,
    items,
    versatileTwoHanded: params.versatileTwoHanded,
    equippedRing,
    fightingStyle,
    dualWieldingActive,
    feats,
    coverType,
  });

  conflictAlerts.push(...bonusResult.conflictAlerts);
  const aditivosConstantes = bonusResult.aditivosConstantes;

  const finalAc = chosenBase.acValue + (bonusResult.shieldActive ? bonusResult.shieldBonus : 0) + bonusResult.otherBonuses;

  const formulaBaseText = `${chosenBase.name} (${chosenBase.calcStr} = ${chosenBase.acValue})`;
  const aditivosText = aditivosConstantes.length > 0 ? aditivosConstantes.join('; ') : 'Nenhum aditivo constante adicional';
  const conflitosText = conflictAlerts.length > 0 ? conflictAlerts.join(' | ') : 'Nenhum conflito detectado';

  const structuredExplanation = `
1. FÓRMULA BASE ESCOLHIDA: ${formulaBaseText}
2. ADITIVOS CONSTANTES: ${aditivosText}
3. CA FINAL: ${finalAc}
4. ALERTAS DE CONFLITO: ${conflitosText}
`.trim();

  return {
    armor_class: finalAc,
    ac: finalAc,
    finalAc,
    baseAc: chosenBase.acValue,
    dexBonus: chosenBase.armorType === 'medium' ? armorDexBonus : chosenBase.armorType === 'heavy' ? 0 : dexMod,
    armorName,
    armorType: chosenBase.armorType,
    hasShield: bonusResult.hasShield,
    shieldActive: bonusResult.shieldActive,
    shieldBonus: bonusResult.shieldActive ? bonusResult.shieldBonus : 0,
    twoHandedWeaponBlockedShield: bonusResult.twoHandedWeaponBlockedShield,
    otherBonuses: bonusResult.otherBonuses,
    formulaBaseEscolhida: formulaBaseText,
    aditivosConstantes,
    alertasDeConflito: conflictAlerts,
    explanation: structuredExplanation
  };
};
