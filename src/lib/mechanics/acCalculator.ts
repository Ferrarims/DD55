import { getCachedEquipmentReference } from '../api/itemsService';
const EQUIPMENT_REFERENCE = getCachedEquipmentReference();

export interface ACCalculationParams {
  charClass: string;
  stats: {
    str?: number;
    dex: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
  };
  equippedArmor?: string | null;
  equippedShield?: string | null;
  equippedRing?: string | null;
  fightingStyle?: string | null;
  inventoryItems?: (string | { name: string; equipped?: boolean })[];
  selectedWeaponName?: string | null;
  equipmentSlots?: Record<string, string | null>;
  feats?: string[];
  activeSpells?: string[];
  coverType?: 'none' | 'half' | 'threeQuarters';
  dualWieldingActive?: boolean;
  versatileTwoHanded?: boolean;
}

export interface ACCalculationResult {
  armor_class: number;
  ac: number;
  finalAc: number;
  baseAc: number;
  dexBonus: number;
  armorName: string | null;
  armorType: 'none' | 'light' | 'medium' | 'heavy';
  hasShield: boolean;
  shieldActive: boolean;
  shieldBonus: number;
  twoHandedWeaponBlockedShield: boolean;
  otherBonuses: number;
  
  formulaBaseEscolhida: string;
  aditivosConstantes: string[];
  alertasDeConflito: string[];
  explanation: string;
}

export const isTwoHandedWeapon = (itemName: string): boolean => {
  if (!itemName || typeof itemName !== 'string') return false;
  const normalized = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Besta de mão (hand crossbow) é de uma mão
  if (normalized.includes('besta de mao') || normalized.includes('hand crossbow')) {
    return false;
  }

  // Armas versáteis (como Espada Longa, Lança) podem ser usadas com uma mão e permitem escudo
  const versatileKeywords = ['espada longa', 'lanca', 'longsword', 'spear'];
  if (versatileKeywords.some(kw => normalized.includes(kw))) {
    return false;
  }

  const twoHandedKeywords = [
    'machado grande', 'espada grande', 'malho', 'alabarda', 'glaive',
    'lanca longa', 'lanca de montaria', 'arco longo', 'arco curto', 'arco',
    'besta leve', 'besta pesada', 'besta', 'clava grande', 'mosquete', 'zarabatana',
    'marreta', 'pique', 'cajado', 'greatsword', 'greataxe', 'maul', 'halberd',
    'heavy crossbow', 'light crossbow', 'longbow', 'shortbow', 'greatclub', 'pike',
    'staff', 'quarterstaff', 'bow', 'crossbow', 'duas maos', 'two-handed', '2 maos'
  ];

  if (twoHandedKeywords.some(kw => normalized.includes(kw))) return true;

  const trimmed = itemName.trim();
  const ref = EQUIPMENT_REFERENCE[trimmed] || Object.values(EQUIPMENT_REFERENCE).find(e => e.name.toLowerCase() === trimmed.toLowerCase());
  if (ref && ref.properties) {
    const props = ref.properties.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (props.includes('versatil') || props.includes('versatile')) {
      return false;
    }
    if (props.includes('duas maos') || props.includes('two-handed') || props.includes('2 maos')) {
      return true;
    }
  }

  return false;
};

export const isCrossbow = (itemName: string): boolean => {
  if (!itemName || typeof itemName !== 'string') return false;
  const normalized = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  return normalized.includes('besta') || normalized.includes('crossbow');
};

export const blocksShield = (itemName: string): boolean => {
  if (!itemName || typeof itemName !== 'string') return false;
  return isTwoHandedWeapon(itemName) || isCrossbow(itemName);
};

export const isArmorNotShield = (itemName: string): boolean => {
  if (!itemName || typeof itemName !== 'string') return false;
  const name = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (/escudo|shield/.test(name)) return false;
  return /armadura|tunica|cota|couraca|peitoral|vestimenta|traje|gibao|placas|couro|camisa|robe|veste|loriga|brigandina|cuirass|breastplate|tunic|chainmail|plate|leather|padded|armor|corselete|peles/.test(name);
};

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
    dualWieldingActive = false
  } = params;

  const dexMod = Math.floor(((stats.dex || 10) - 10) / 2);
  const conMod = Math.floor(((stats.con || 10) - 10) / 2);
  const wisMod = Math.floor(((stats.wis || 10) - 10) / 2);
  const cls = (charClass || '').toLowerCase();
  const slots = equipmentSlots || {};

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

  const items = inventoryItems || [];
  if (!armorName && Array.isArray(items)) {
    const foundArmor = items.find(item => {
      if (typeof item === 'string') return false;
      if (!item || item.equipped !== true) return false;
      return isArmorNotShield(item.name);
    });
    if (foundArmor && typeof foundArmor !== 'string') {
      armorName = foundArmor.name;
    }
  }

  if (!shieldName && Array.isArray(items)) {
    const foundShield = items.find(item => {
      if (typeof item === 'string') return false;
      if (!item || item.equipped !== true) return false;
      return /escudo|shield/.test((item.name || '').toLowerCase());
    });
    if (foundShield && typeof foundShield !== 'string') {
      shieldName = foundShield.name;
    }
  }

  const conflictAlerts: string[] = [];
  const aditivosConstantes: string[] = [];
  const hasArmorWorn = Boolean(armorName && isArmorNotShield(armorName));

  type BaseCandidate = {
    name: string;
    calcStr: string;
    acValue: number;
    armorType: 'none' | 'light' | 'medium' | 'heavy';
    allowsShield: boolean;
    requiresNoArmor: boolean;
  };

  const candidates: BaseCandidate[] = [];

  // 1. Sem Armadura (Padrão)
  candidates.push({
    name: 'Sem Armadura (Padrão)',
    calcStr: `10 + Mod. Destreza (${dexMod >= 0 ? '+' : ''}${dexMod})`,
    acValue: 10 + dexMod,
    armorType: 'none',
    allowsShield: true,
    requiresNoArmor: false
  });

  // 2. Bárbaro: Defesa Sem Armadura
  if (cls.includes('bárbaro') || cls.includes('barbarian')) {
    candidates.push({
      name: 'Defesa Sem Armadura (Bárbaro)',
      calcStr: `10 + Mod. Destreza (${dexMod >= 0 ? '+' : ''}${dexMod}) + Mod. Constituição (${conMod >= 0 ? '+' : ''}${conMod})`,
      acValue: 10 + dexMod + conMod,
      armorType: 'none',
      allowsShield: true,
      requiresNoArmor: true
    });
  }

  // 3. Monge: Defesa Sem Armadura
  if (cls.includes('monge') || cls.includes('monk')) {
    candidates.push({
      name: 'Defesa Sem Armadura (Monge)',
      calcStr: `10 + Mod. Destreza (${dexMod >= 0 ? '+' : ''}${dexMod}) + Mod. Sabedoria (${wisMod >= 0 ? '+' : ''}${wisMod})`,
      acValue: 10 + dexMod + wisMod,
      armorType: 'none',
      allowsShield: false,
      requiresNoArmor: true
    });
  }

  // 4. Magia (ex: Armadura Arcana / Mage Armor)
  const hasMageArmor = activeSpells.some(s => s.toLowerCase().includes('armadura arcana') || s.toLowerCase().includes('mage armor')) ||
    (slots['efeito_magico'] || '').toLowerCase().includes('armadura arcana');
  if (hasMageArmor) {
    candidates.push({
      name: 'Magia: Armadura Arcana (Mage Armor)',
      calcStr: `13 + Mod. Destreza (${dexMod >= 0 ? '+' : ''}${dexMod})`,
      acValue: 13 + dexMod,
      armorType: 'none',
      allowsShield: true,
      requiresNoArmor: true
    });
  }

  // 5. Armaduras
  let armorBaseAc = 10;
  let armorDexBonus = dexMod;
  let computedArmorType: 'none' | 'light' | 'medium' | 'heavy' = 'none';

  if (hasArmorWorn && armorName) {
    const lowerArmor = armorName.toLowerCase();
    let magicEnhancement = 0;
    if (lowerArmor.includes('+3')) magicEnhancement = 3;
    else if (lowerArmor.includes('+2')) magicEnhancement = 2;
    else if (lowerArmor.includes('+1')) magicEnhancement = 1;

    if (lowerArmor.includes('acolchoada') || lowerArmor.includes('couro') || lowerArmor.includes('couro batido')) {
      computedArmorType = 'light';
      if (lowerArmor.includes('couro batido')) armorBaseAc = 12;
      else armorBaseAc = 11;
      armorBaseAc += magicEnhancement;
      armorDexBonus = dexMod;

      candidates.push({
        name: `Armadura Leve (${armorName})`,
        calcStr: `CA Base da Armadura (${armorBaseAc - magicEnhancement}${magicEnhancement ? ` +${magicEnhancement} mágica` : ''}) + Mod. Destreza total (${dexMod >= 0 ? '+' : ''}${dexMod})`,
        acValue: armorBaseAc + dexMod,
        armorType: 'light',
        allowsShield: true,
        requiresNoArmor: false
      });
    } else if (
      lowerArmor.includes('peles') || lowerArmor.includes('gibão') || lowerArmor.includes('gibao') ||
      lowerArmor.includes('malha parcial') || lowerArmor.includes('loriga') || lowerArmor.includes('escamas') ||
      lowerArmor.includes('couraça') || lowerArmor.includes('couraca') || lowerArmor.includes('placas parcial') ||
      lowerArmor.includes('meia-armadura')
    ) {
      computedArmorType = 'medium';
      if (lowerArmor.includes('peles') || lowerArmor.includes('gibão') || lowerArmor.includes('gibao')) armorBaseAc = 12;
      else if (lowerArmor.includes('malha parcial')) armorBaseAc = 13;
      else if (lowerArmor.includes('loriga') || lowerArmor.includes('escamas') || lowerArmor.includes('couraça') || lowerArmor.includes('couraca')) armorBaseAc = 14;
      else armorBaseAc = 15;

      armorBaseAc += magicEnhancement;
      const hasMediumMaster = feats.includes('Medium Armor Master') || feats.includes('Mestre em Armadura Média');
      const maxDex = hasMediumMaster ? 3 : 2;
      armorDexBonus = Math.min(maxDex, dexMod);

      candidates.push({
        name: `Armadura Média (${armorName})`,
        calcStr: `CA Base da Armadura (${armorBaseAc - magicEnhancement}${magicEnhancement ? ` +${magicEnhancement} mágica` : ''}) + Mod. Destreza (máx +${maxDex}, obtido: ${dexMod >= 0 ? '+' : ''}${dexMod} -> usará ${armorDexBonus >= 0 ? '+' : ''}${armorDexBonus})`,
        acValue: armorBaseAc + armorDexBonus,
        armorType: 'medium',
        allowsShield: true,
        requiresNoArmor: false
      });
    } else {
      computedArmorType = 'heavy';
      if (lowerArmor.includes('anéis') || lowerArmor.includes('aneis')) armorBaseAc = 14;
      else if (lowerArmor.includes('cota de malha')) armorBaseAc = 16;
      else if (lowerArmor.includes('talas')) armorBaseAc = 17;
      else armorBaseAc = 18;

      armorBaseAc += magicEnhancement;
      armorDexBonus = 0;

      candidates.push({
        name: `Armadura Pesada (${armorName})`,
        calcStr: `CA Base da Armadura (${armorBaseAc - magicEnhancement}${magicEnhancement ? ` +${magicEnhancement} mágica` : ''}) [Ignora Modificador de Destreza]`,
        acValue: armorBaseAc,
        armorType: 'heavy',
        allowsShield: true,
        requiresNoArmor: false
      });
    }
  }

  candidates.sort((a, b) => b.acValue - a.acValue);
  const chosenBase = candidates[0] || {
    name: 'Sem Armadura (Padrão)',
    calcStr: `10 + Mod. Destreza (${dexMod >= 0 ? '+' : ''}${dexMod})`,
    acValue: 10 + dexMod,
    armorType: 'none',
    allowsShield: true,
    requiresNoArmor: false
  };

  if (chosenBase.requiresNoArmor && hasArmorWorn) {
    conflictAlerts.push(`Conflito de Base: Habilidade sem armadura escolhida, mas armadura "${armorName}" está equipada. O motor priorizou a maior CA.`);
  }

  const hasShield = Boolean(shieldName);
  let shieldActive = false;
  let shieldBonus = 0;
  let twoHandedWeaponBlockedShield = false;

  let weaponBlocksShield = false;
  const checkBlocksShield = (wName: string | null | undefined) => {
    if (!wName) return false;
    return blocksShield(wName);
  };

  if (selectedWeaponName) {
    weaponBlocksShield = checkBlocksShield(selectedWeaponName);
  } else if (slots['empunhadura_1'] && checkBlocksShield(slots['empunhadura_1'])) {
    weaponBlocksShield = true;
  } else if (slots['empunhadura_2'] && checkBlocksShield(slots['empunhadura_2'])) {
    weaponBlocksShield = true;
  } else if (Array.isArray(items)) {
    weaponBlocksShield = items.some(item => {
      if (typeof item === 'string') return false; // inventory strings are in backpack, not wielded in hands
      if (!item || item.equipped !== true) return false;
      return checkBlocksShield(item.name);
    });
  }

  if (params.versatileTwoHanded) {
    weaponBlocksShield = true;
  }

  if (hasShield) {
    if (!chosenBase.allowsShield) {
      conflictAlerts.push(`Escudo ignorado: A fórmula base "${chosenBase.name}" não permite o uso de escudos (ex: Monge).`);
    } else if (weaponBlocksShield) {
      twoHandedWeaponBlockedShield = true;
      conflictAlerts.push(`Escudo inativo (+0): Bestas (mão, leve, pesada) e armas de duas mãos não podem ser usadas com escudos.`);
    } else {
      shieldActive = true;
      shieldBonus = 2;
      const lowerS = (shieldName || '').toLowerCase();
      if (lowerS.includes('+3')) shieldBonus = 5;
      else if (lowerS.includes('+2')) shieldBonus = 4;
      else if (lowerS.includes('+1')) shieldBonus = 3;
      aditivosConstantes.push(`Escudo (${shieldName}): +${shieldBonus} na CA`);
    }
  }

  let otherBonuses = 0;
  const isDecorativeOrTest = (name: string): boolean => {
    const n = name.toLowerCase();
    return n.includes('teste') || n.includes('decorativo') || n.includes('comum') || n.includes('pano') || n.includes('lã') || n.includes('lenco');
  };

  const ringsToCheck = [slots['dedo_anel_1'], slots['dedo_anel_2'], equippedRing].filter(Boolean);
  ringsToCheck.forEach(ring => {
    if (!ring || isDecorativeOrTest(ring)) return;
    const lowerR = ring.toLowerCase();
    if (lowerR.includes('proteção') || lowerR.includes('protecao') || lowerR.includes('protection') || lowerR.includes('+1') || lowerR.includes('+2') || lowerR.includes('+3')) {
      const bonus = lowerR.includes('+3') ? 3 : lowerR.includes('+2') ? 2 : 1;
      otherBonuses += bonus;
      aditivosConstantes.push(`Item Maravilhoso (${ring}): +${bonus} na CA`);
    }
  });

  const cloakToCheck = slots['ombros_costas'];
  if (cloakToCheck && !isDecorativeOrTest(cloakToCheck)) {
    const lowerC = cloakToCheck.toLowerCase();
    if (lowerC.includes('proteção') || lowerC.includes('protecao') || lowerC.includes('protection') || lowerC.includes('manto de proteção') || lowerC.includes('+1') || lowerC.includes('+2') || lowerC.includes('+3')) {
      const bonus = lowerC.includes('+3') ? 3 : lowerC.includes('+2') ? 2 : 1;
      otherBonuses += bonus;
      aditivosConstantes.push(`Item Maravilhoso (${cloakToCheck}): +${bonus} na CA`);
    }
  }

  const bracersToCheck = slots['bracos_pulsos'];
  if (bracersToCheck && !isDecorativeOrTest(bracersToCheck)) {
    const lowerB = bracersToCheck.toLowerCase();
    if (lowerB.includes('defesa') || lowerB.includes('bracadeiras de defesa') || lowerB.includes('bracadeira de defesa')) {
      if (chosenBase.armorType === 'none') {
        const bonus = 2;
        otherBonuses += bonus;
        aditivosConstantes.push(`Braçadeiras de Defesa (${bracersToCheck}): +${bonus} na CA`);
      } else {
        conflictAlerts.push(`Braçadeiras de Defesa ignoradas: Exigem que o personagem não vista armadura.`);
      }
    }
  }

  const style = (fightingStyle || '').toLowerCase();
  if (style.includes('defensivo') || style.includes('defense') || style.includes('defesa')) {
    if (chosenBase.armorType !== 'none') {
      otherBonuses += 1;
      aditivosConstantes.push(`Estilo de Luta (Defesa): +1 na CA`);
    } else {
      conflictAlerts.push(`Estilo de Luta Defesa ignorado pois o personagem não veste armadura.`);
    }
  }

  if (dualWieldingActive || feats.includes('Dual Wielder') || feats.includes('Empunhadura Dupla')) {
    otherBonuses += 1;
    aditivosConstantes.push(`Talento Empunhadura Dupla (Dual Wielder): +1 na CA`);
  }

  if (coverType === 'half') {
    otherBonuses += 2;
    aditivosConstantes.push(`Cobertura (Meia-cobertura): +2 na CA`);
  } else if (coverType === 'threeQuarters') {
    otherBonuses += 5;
    aditivosConstantes.push(`Cobertura (Cobertura 3/4): +5 na CA`);
  }

  const finalAc = chosenBase.acValue + (shieldActive ? shieldBonus : 0) + otherBonuses;

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
    hasShield,
    shieldActive,
    shieldBonus: shieldActive ? shieldBonus : 0,
    twoHandedWeaponBlockedShield,
    otherBonuses,
    formulaBaseEscolhida: formulaBaseText,
    aditivosConstantes,
    alertasDeConflito: conflictAlerts,
    explanation: structuredExplanation
  };
};
