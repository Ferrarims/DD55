// Gerenciador de Experiência (XP), Nível, Moedas e Inventário do Livro D&D 5.5e (2024)

export const XP_LEVEL_TABLE: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000
};

export function getLevelFromXp(xp: number): number {
  if (!xp || xp <= 0) return 1;
  for (let lvl = 20; lvl >= 1; lvl--) {
    if (xp >= XP_LEVEL_TABLE[lvl]) {
      return lvl;
    }
  }
  return 1;
}

export function getXpProgress(xp: number) {
  const level = getLevelFromXp(xp);
  const currentLevelMinXp = XP_LEVEL_TABLE[level] || 0;
  const nextLevelXp = XP_LEVEL_TABLE[level + 1] || currentLevelMinXp;
  const xpInCurrentLevel = Math.max(0, xp - currentLevelMinXp);
  const xpNeededForNextLevel = Math.max(1, nextLevelXp - currentLevelMinXp);
  const percent = level >= 20 ? 100 : Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return {
    level,
    xp,
    currentLevelMinXp,
    nextLevelXp,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    percent
  };
}

export function parseCoinsToGoldNumber(coins: any): number {
  if (typeof coins === 'number') return coins;
  if (!coins) return 0;
  const str = String(coins).replace(',', '.');
  const match = str.match(/\d+(?:\.\d+)?/);
  return match ? parseFloat(match[0]) : 0;
}

export function parseCostToGold(costStr?: string): number {
  if (!costStr) return 1;
  let str = String(costStr).trim();

  // Handle standard decimal points vs thousands separators in Portuguese/English notation
  if (str.includes('.') && str.includes(',')) {
    // Both present (e.g., 1.500,50) -> remove dot, convert comma to dot
    str = str.replace(/\./g, '').replace(',', '.');
  } else if (str.includes(',')) {
    // Only comma present (e.g., 0,05) -> convert comma to dot
    str = str.replace(',', '.');
  } else if (str.includes('.')) {
    // Only dot present (e.g., 0.05 or 1.500)
    const parts = str.split('.');
    const decimalPart = parts[parts.length - 1].replace(/[^\d]/g, '');
    const firstPart = parts[0].replace(/[^\d]/g, '');

    // If starts with '0' (e.g., 0.05 or 0.025), it's definitely a decimal
    if (firstPart === '0') {
      // keep the dot
    }
    // If there are exactly 3 digits after the dot (e.g., 1.500) and it doesn't start with 0, assume it's a thousands separator
    else if (decimalPart.length === 3) {
      str = str.replace(/\./g, '');
    }
    // Otherwise (e.g., 1.5 or 0.05), it is a decimal, keep the dot
  }

  const match = str.match(/(\d+(?:\.\d+)?)\s*(PO|PP|PC|PL|PE)?/i);
  if (!match) return 1;
  const val = parseFloat(match[1]);
  const unit = (match[2] || 'PO').toUpperCase();

  if (unit === 'PL') return val * 10;
  if (unit === 'PO') return val;
  if (unit === 'PE') return val * 0.5;
  if (unit === 'PP') return val * 0.1;
  if (unit === 'PC') return val * 0.01;
  return val;
}

import { getCachedEquipmentReference } from '../api/itemsService';
import { ItemPriceInfo, ShopCatalogItem, LootItem } from '../../types/item';

export function getItemPriceInfo(rawItemName: string): ItemPriceInfo {
  const EQUIPMENT_REFERENCE = getCachedEquipmentReference();
  const cleanName = rawItemName.trim();

  // Handle ammunition/stacked items like "Flechas (19)" vs "Flechas (20)"
  const stackMatch = cleanName.match(/^(.*?) \((\d+)\)$/);
  let baseName = cleanName;
  let currentQty = 1;
  let hasStack = false;

  if (stackMatch) {
    baseName = stackMatch[1].trim();
    currentQty = parseInt(stackMatch[2], 10);
    hasStack = true;
  }

  // 1. Exact or partial match in EQUIPMENT_REFERENCE
  let matchedKey = Object.keys(EQUIPMENT_REFERENCE).find(
    key => key.toLowerCase() === cleanName.toLowerCase()
  );

  let originalTotalQty = 1;

  if (!matchedKey && hasStack) {
    // Try to find a match ignoring the exact number, e.g. "Flechas (20)" matches "Flechas"
    matchedKey = Object.keys(EQUIPMENT_REFERENCE).find(key => {
      const keyStackMatch = key.match(/^(.*?) \((\d+)\)$/);
      if (keyStackMatch) {
        return keyStackMatch[1].trim().toLowerCase() === baseName.toLowerCase();
      }
      return key.toLowerCase() === baseName.toLowerCase();
    });

    if (matchedKey) {
      const keyStackMatch = matchedKey.match(/^(.*?) \((\d+)\)$/);
      if (keyStackMatch) {
        originalTotalQty = parseInt(keyStackMatch[2], 10);
      }
    }
  }

  if (!matchedKey) {
    matchedKey = Object.keys(EQUIPMENT_REFERENCE).find(
      key => key !== 'Equipamento de Aventura' && (cleanName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName.toLowerCase()))
    );
  }

  if (matchedKey && matchedKey !== 'Equipamento de Aventura') {
    const info = EQUIPMENT_REFERENCE[matchedKey];
    let basePricePO = parseCostToGold(info.cost);
    let sellPricePO = basePricePO / 2;
    
    // Proportional pricing for ammunition/stacks
    if (originalTotalQty > 1 && currentQty < originalTotalQty) {
      basePricePO = basePricePO * (currentQty / originalTotalQty);
      sellPricePO = sellPricePO * (currentQty / originalTotalQty);
      basePricePO = Math.round(basePricePO * 100) / 100;
      sellPricePO = Math.round(sellPricePO * 100) / 100;
    }

    return {
      basePricePO,
      sellPricePO,
      costStr: info.cost || `${parseCostToGold(info.cost)} PO`,
      category: info.category || 'Equipamento'
    };
  }

  // 2. Check if item has explicit cost in string like "Poção de Cura (50 PO)"
  const costMatch = cleanName.match(/\((\d+(?:[,\.]\d+)?\s*(?:PO|PP|PC|PL|PE))\)/i);
  if (costMatch) {
    const costStr = costMatch[1];
    const basePricePO = parseCostToGold(costStr);
    return {
      basePricePO,
      sellPricePO: basePricePO / 2,
      costStr,
      category: 'Geral'
    };
  }

  // 3. Check inside "Equipamento de Aventura" string items
  const gearString = EQUIPMENT_REFERENCE['Equipamento de Aventura']?.items || '';
  if (gearString) {
    const gearItems = gearString.split(/,\s*(?![^()]*\))/);
    for (const gItem of gearItems) {
      const parts = gItem.trim().match(/^([^(]+)\(([^)]+)\)$/);
      if (parts) {
        const gName = parts[1].trim();
        const gCost = parts[2].trim();
        if (cleanName.toLowerCase().includes(gName.toLowerCase()) || gName.toLowerCase().includes(cleanName.toLowerCase())) {
          const basePricePO = parseCostToGold(gCost);
          return {
            basePricePO,
            sellPricePO: basePricePO / 2,
            costStr: gCost,
            category: 'Equipamento de Aventura'
          };
        }
      }
    }
  }

  // Default fallback if unknown item
  return {
    basePricePO: 5,
    sellPricePO: 2.5,
    costStr: '5 PO',
    category: 'Geral'
  };
}

export function getAllShopCatalog(): ShopCatalogItem[] {
  const catalog: ShopCatalogItem[] = [];

  const EQUIPMENT_REFERENCE = getCachedEquipmentReference();

  Object.entries(EQUIPMENT_REFERENCE).forEach(([key, info]) => {
    if (key === 'Equipamento de Aventura') return;
    
    let itemName = info.name || key;
    let props = info.properties;
    let cost = info.cost;
    let weight = info.weight;

    if (itemName.toLowerCase().trim() === 'cantil') {
      itemName = 'Cantil (Cheio)';
      props = 'Odre de água (10 cargas)';
      cost = '2 PO';
      weight = '2.5 kg';
    }

    const pricePO = parseCostToGold(cost);
    
    catalog.push({
      id: (info as any).id,
      name: itemName,
      category: info.category || 'Equipamentos',
      cost: cost || `${pricePO} PO`,
      pricePO,
      sellPricePO: pricePO / 2,
      weight: weight,
      damage: info.damage,
      armor_class: info.armor_class,
      properties: props
    });
  });

  const gearString = EQUIPMENT_REFERENCE['Equipamento de Aventura']?.items || '';
  if (gearString) {
    const gearItems = gearString.split(/,\s*(?![^()]*\))/);
    gearItems.forEach(gItem => {
      const parts = gItem.trim().match(/^([^(]+)\(([^)]+)\)$/);
      if (parts) {
        const name = parts[1].trim();
        const cost = parts[2].trim();
        
        // Skip cantil since we already handled it from the DB
        if (name.toLowerCase() === 'cantil' || name.toLowerCase() === 'cantil (cheio)') return;

        const pricePO = parseCostToGold(cost);
        if (!catalog.some(c => c.name.toLowerCase() === name.toLowerCase())) {
          catalog.push({
            name,
            category: 'Equipamento de Aventura',
            cost,
            pricePO,
            sellPricePO: pricePO / 2
          });
        }
      }
    });
  }

  return catalog;
}

export function normalizeEquipmentList(rawList: string[]): string[] {
  if (!rawList || !Array.isArray(rawList)) return [];

  const nonAmmoItems: string[] = [];
  const ammoCounts: Record<string, number> = {};
  const ammoCanonicalName: Record<string, string> = {};

  const getAmmoInfo = (name: string): { isAmmo: boolean; baseKey: string; canonicalName: string; qty: number } => {
    if (!name || typeof name !== 'string') return { isAmmo: false, baseKey: '', canonicalName: '', qty: 0 };
    const trimmed = name.trim();
    if (!trimmed) return { isAmmo: false, baseKey: '', canonicalName: '', qty: 0 };

    if (trimmed.match(/^\d+\s*(PO|PP|PC|PE|PL)(\s*\(.*\))?$/i)) {
      return { isAmmo: false, baseKey: '', canonicalName: '', qty: 0 };
    }

    let qty = 1;
    let clean = trimmed;

    // e.g. "1x Flechas", "20 Flechas", "2x Adaga"
    const prefixMatch = trimmed.match(/^(\d+)\s*x?\s+(.+)$/i);
    if (prefixMatch) {
      qty = parseInt(prefixMatch[1], 10);
      clean = prefixMatch[2].trim();
    }

    // e.g. "Flechas (13)", "Virotes (20)"
    const stackMatch = clean.match(/^(.*?)\s*\((\d+)\)$/);
    if (stackMatch) {
      clean = stackMatch[1].trim();
      qty = qty * parseInt(stackMatch[2], 10);
    }

    const lower = clean.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    const isRangedWeapon = /arco|besta|funda|pistola|mosquete|zarabatana|bow|crossbow|sling/.test(lower);
    const isAmmoPattern = /flecha|arrow|virote|bolt|bala|bullet|agulha|needle|municao|municoes|ammo|ammunition/.test(lower);

    if (isAmmoPattern && !isRangedWeapon) {
      let baseKey = 'flechas';
      let canonicalName = 'Flechas';

      if (/virote|bolt/.test(lower)) {
        baseKey = 'virotes';
        canonicalName = 'Virote de Besta';
      } else if (/bala|bullet/.test(lower)) {
        baseKey = 'balas';
        canonicalName = 'Balas de Funda';
      } else if (/agulha|needle/.test(lower)) {
        baseKey = 'agulhas';
        canonicalName = 'Agulhas';
      } else {
        baseKey = 'flechas';
        canonicalName = 'Flechas';
      }

      return { isAmmo: true, baseKey, canonicalName, qty };
    }

    return { isAmmo: false, baseKey: '', canonicalName: clean, qty };
  };

  rawList.forEach(rawItem => {
    if (!rawItem || typeof rawItem !== 'string') return;
    if (rawItem.match(/^\d+\s*(PO|PP|PC|PE|PL)(\s*\(.*\))?$/i)) return;

    const { isAmmo, baseKey, canonicalName, qty } = getAmmoInfo(rawItem);

    if (isAmmo) {
      ammoCounts[baseKey] = (ammoCounts[baseKey] || 0) + qty;
      ammoCanonicalName[baseKey] = canonicalName;
    } else {
      let itemName = canonicalName;
      let itemQty = qty;

      // Check if we still need to parse qty from itemName (some patterns might be missed)
      const prefixMatch = itemName.match(/^(\d+)\s*x?\s+(.+)$/i);
      if (prefixMatch) {
        itemQty = parseInt(prefixMatch[1], 10);
        itemName = prefixMatch[2].trim();
      } else {
        const lowerName = itemName.toLowerCase().trim();
        if (lowerName === 'rações de viagem' || lowerName === 'racoes de viagem' || lowerName === 'rações' || lowerName === 'racoes') {
          // If we didn't get quantity from Ração, default to 10
          if (itemQty === 1) itemQty = 10;
          itemName = 'Ração de Viagem';
        }
      }

      if (itemQty > 1) {
        const lowerName = itemName.toLowerCase();
        if (lowerName === 'adagas') itemName = 'Adaga';
        else if (lowerName === 'azagaias') itemName = 'Azagaia';
        else if (lowerName === 'dardos') itemName = 'Dardo';
        else if (lowerName === 'poções de cura' || lowerName === 'pocoes de cura') itemName = 'Poção de Cura';
        else if (lowerName === 'rações de viagem' || lowerName === 'racoes de viagem' || lowerName === 'rações' || lowerName === 'racoes') itemName = 'Ração de Viagem';
        else if (lowerName === 'tochas') itemName = 'Tocha';
      }

      for (let i = 0; i < itemQty; i++) {
        nonAmmoItems.push(itemName);
      }
    }
  });

  const finalResult: string[] = [...nonAmmoItems];

  // Re-build ammo stacks in groups of 20 with smaller stack FIRST
  Object.keys(ammoCounts).forEach(baseKey => {
    const total = ammoCounts[baseKey];
    if (total <= 0) return;

    const canonical = ammoCanonicalName[baseKey] || 'Flechas';
    const fullStacks = Math.floor(total / 20);
    const remainder = total % 20;

    // Place the partial stack FIRST so it is used first!
    if (remainder > 0) {
      finalResult.push(`${canonical} (${remainder})`);
    }

    // Then place full stacks of 20
    for (let i = 0; i < fullStacks; i++) {
      finalResult.push(`${canonical} (20)`);
    }
  });

  return finalResult;
}

import { getItemNameById } from '../api/itemsService';

export function parseEquipmentToList(equipment: any): string[] {
  let rawList: string[] = [];
  const getItemStr = (item: any): string => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object') {
      const name = (item.id ? getItemNameById(item.id) : undefined) || item.name;
      if (name) {
        const qty = item.quantity || 1;
        return qty > 1 ? `${qty} ${name}` : name;
      }
    }
    return JSON.stringify(item);
  };

  if (Array.isArray(equipment)) {
    rawList = equipment.map(getItemStr);
  } else if (typeof equipment === 'string') {
    try {
      const parsed = JSON.parse(equipment);
      if (Array.isArray(parsed)) {
        rawList = parsed.map(getItemStr);
      } else {
        rawList = [equipment];
      }
    } catch {
      rawList = [equipment];
    }
  }

  const separatedList: string[] = [];
  rawList.forEach(str => {
    if (!str || typeof str !== 'string') return;
    
    // Ignore pure currency entries like "50 PO", "4 PO", etc.
    if (str.match(/^\d+\s*(PO|PP|PC|PE|PL)(\s*\(.*\))?$/i)) {
      return;
    }

    // Split by comma or " e "
    const parts = str.split(/,\s*|\s+e\s+/);
    parts.forEach(part => {
      let trimmed = part.trim();
      if (!trimmed) return;

      // Ignore currency parts if any
      if (trimmed.match(/^\d+\s*(PO|PP|PC|PE|PL)(\s*\(.*\))?$/i)) {
        return;
      }

      separatedList.push(trimmed);
    });
  });

  return normalizeEquipmentList(separatedList);
}

export function getItemWeight(rawItemName: string): string {
  const EQUIPMENT_REFERENCE = getCachedEquipmentReference();
  const cleanName = rawItemName.trim();

  // Handle ammunition/stacked items like "Flechas (14)" or "Flechas (20)"
  const stackMatch = cleanName.match(/^(.*?)\s*\((\d+)\)$/);
  if (stackMatch) {
    const baseName = stackMatch[1].trim().toLowerCase();
    const currentQty = parseInt(stackMatch[2], 10);
    if (baseName.includes('flecha') || baseName.includes('virote') || baseName.includes('bala')) {
      const weightKg = currentQty * 0.075;
      return `${weightKg.toFixed(2).replace('.', ',')} kg`;
    }
    if (baseName.includes('agulha')) {
      const weightKg = currentQty * 0.01;
      return `${weightKg.toFixed(2).replace('.', ',')} kg`;
    }
  }

  // 1. Exact or partial match in EQUIPMENT_REFERENCE
  let matchedKey = Object.keys(EQUIPMENT_REFERENCE).find(
    key => key.toLowerCase() === cleanName.toLowerCase()
  );

  if (!matchedKey) {
    matchedKey = Object.keys(EQUIPMENT_REFERENCE).find(
      key => key !== 'Equipamento de Aventura' && (cleanName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName.toLowerCase()))
    );
  }

  if (matchedKey && matchedKey !== 'Equipamento de Aventura') {
    const info = EQUIPMENT_REFERENCE[matchedKey];
    if (info && info.weight) {
      return info.weight;
    }
  }

  // Fallback patterns for common items if no key matched
  const lowerName = cleanName.toLowerCase();
  if (lowerName.includes('mochila') || lowerName.includes('backpack')) return '2 kg';
  if (lowerName.includes('poção') || lowerName.includes('pocao') || lowerName.includes('potion')) return '0.1 kg';
  if (lowerName.includes('ração') || lowerName.includes('racao')) return '0.5 kg';
  if (lowerName.includes('tocha') || lowerName.includes('torch')) return '0.5 kg';
  if (lowerName.includes('corda') || lowerName.includes('rope')) return '5 kg';
  if (lowerName.includes('pederneira') || lowerName.includes('tinderbox')) return '—';
  
  return '—';
}

export function parseWeightToKg(weightStr: string | undefined): number {
  if (!weightStr) return 0;
  const clean = weightStr.trim().toLowerCase();
  if (clean === '—' || clean === '-' || clean === '') return 0;
  
  // Replace comma with dot (e.g. 0,5 kg -> 0.5 kg)
  const normalized = clean.replace(',', '.');
  
  // Match number with unit
  const match = normalized.match(/([\d.]+)\s*(kg|g)/);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    if (unit === 'g') {
      return value / 1000; // convert grams to kg
    }
    return value; // already in kg
  }
  
  // Fallback: see if there's any float number
  const fallbackMatch = normalized.match(/[\d.]+/);
  if (fallbackMatch) {
    return parseFloat(fallbackMatch[0]);
  }
  
  return 0;
}

export function getItemRarityFromCost(costPO: number): 'comum' | 'incomum' | 'raro' | 'lendário' {
  if (costPO <= 20) return 'comum';
  if (costPO <= 100) return 'incomum';
  if (costPO <= 500) return 'raro';
  return 'lendário';
}

export function getItemTypeFromNameAndCat(name: string, category: string): 'weapon' | 'armor' | 'potion' | 'scroll' {
  const lowerName = name.toLowerCase();
  const lowerCat = category.toLowerCase();

  if (lowerName.includes('pergaminho')) return 'scroll';
  if (
    lowerName.includes('poção') ||
    lowerName.includes('pocao') ||
    lowerName.includes('elixir') ||
    lowerName.includes('fogo alquímico') ||
    lowerName.includes('fogo alquimico') ||
    lowerName.includes('ração') ||
    lowerName.includes('racao') ||
    lowerName.includes('óleo') ||
    lowerName.includes('oleo')
  ) {
    return 'potion';
  }
  if (lowerCat.includes('armadura') || lowerCat.includes('escudo') || lowerName.includes('escudo')) {
    return 'armor';
  }
  return 'weapon';
}

export function getItemIcon(name: string, category: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('poção de cura maior') || lower.includes('pocao de cura maior')) return '🏺';
  if (lower.includes('poção') || lower.includes('pocao')) return '🧪';
  if (lower.includes('elixir')) return '⚡';
  if (lower.includes('pergaminho')) return '📜';
  if (lower.includes('fogo alquímico') || lower.includes('fogo alquimico')) return '💣';
  if (lower.includes('ração') || lower.includes('racao')) return '🍞';
  if (lower.includes('tocha')) return '🔥';
  if (lower.includes('lanterna') || lower.includes('lâmpada') || lower.includes('lampada') || lower.includes('vela')) return '🏮';
  if (lower.includes('corda')) return '🪢';
  if (lower.includes('mochila')) return '🎒';
  if (lower.includes('cantil')) return '💧';
  if (lower.includes('escudo')) return '🛡️';
  if (lower.includes('adaga')) return '🗡️';
  if (lower.includes('machado')) return '🪓';
  if (lower.includes('arco') || lower.includes('besta') || lower.includes('flecha') || lower.includes('virote')) return '🏹';
  if (lower.includes('pistola') || lower.includes('mosquete') || lower.includes('bala')) return '🔫';
  if (category.toLowerCase().includes('armadura')) return '🧥';
  if (category.toLowerCase().includes('arma')) return '⚔️';
  return '📦';
}

export function getRandomItemFromDatabase(options?: {
  category?: 'weapon' | 'armor' | 'potion' | 'scroll' | 'consumable' | 'mundane' | 'any';
  rarity?: 'comum' | 'incomum' | 'raro' | 'lendário';
  maxCostPO?: number;
}): LootItem {
  const catalog = getAllShopCatalog().filter(item => !item.name.includes('(Decorativo)') && !item.name.toLowerCase().includes('teste'));

  let candidates = catalog;

  if (options?.category && options.category !== 'any') {
    if (options.category === 'weapon') {
      candidates = candidates.filter(c => c.category.toLowerCase().includes('arma'));
    } else if (options.category === 'armor') {
      candidates = candidates.filter(c => c.category.toLowerCase().includes('armadura') || c.name.toLowerCase().includes('escudo'));
    } else if (options.category === 'potion' || options.category === 'consumable') {
      candidates = candidates.filter(c =>
        c.name.toLowerCase().includes('poção') ||
        c.name.toLowerCase().includes('pocao') ||
        c.name.toLowerCase().includes('elixir') ||
        c.name.toLowerCase().includes('pergaminho') ||
        c.name.toLowerCase().includes('fogo alquímico') ||
        c.name.toLowerCase().includes('fogo alquimico') ||
        c.name.toLowerCase().includes('ração') ||
        c.name.toLowerCase().includes('racao')
      );
    } else if (options.category === 'scroll') {
      candidates = candidates.filter(c => c.name.toLowerCase().includes('pergaminho'));
    } else if (options.category === 'mundane') {
      candidates = candidates.filter(c =>
        c.pricePO <= 30 &&
        !c.name.toLowerCase().includes('poção') &&
        !c.name.toLowerCase().includes('pocao')
      );
    }
  }

  if (options?.maxCostPO) {
    const filteredByCost = candidates.filter(c => c.pricePO <= options.maxCostPO!);
    if (filteredByCost.length > 0) candidates = filteredByCost;
  }

  if (options?.rarity) {
    const rarityFiltered = candidates.filter(c => {
      const itemRarity = getItemRarityFromCost(c.pricePO);
      return itemRarity === options.rarity;
    });
    if (rarityFiltered.length > 0) candidates = rarityFiltered;
  }

  if (candidates.length === 0) candidates = catalog;

  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  const itemType = getItemTypeFromNameAndCat(chosen.name, chosen.category);
  const rarity = options?.rarity || getItemRarityFromCost(chosen.pricePO);
  const icon = getItemIcon(chosen.name, chosen.category);

  let description = '';
  if (chosen.damage) description += `Dano: ${chosen.damage}. `;
  if (chosen.armor_class) description += `CA: ${chosen.armor_class}. `;
  if (chosen.properties && chosen.properties !== '—') description += `Propriedades: ${chosen.properties}. `;
  if (!description) description = `Item oficial do Livro D&D 5.5e (${chosen.category}).`;

  let bonusHp: number | undefined = undefined;
  if (chosen.name.toLowerCase().includes('poção de cura maior') || chosen.name.toLowerCase().includes('pocao de cura maior')) {
    bonusHp = 14;
  } else if (chosen.name.toLowerCase().includes('poção de cura') || chosen.name.toLowerCase().includes('pocao de cura')) {
    bonusHp = 7;
  }

  return {
    id: `dbitem-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: chosen.name,
    type: itemType,
    rarity,
    value: chosen.pricePO,
    description: description.trim(),
    bonusHp,
    icon
  };
}


