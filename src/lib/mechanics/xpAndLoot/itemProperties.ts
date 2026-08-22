import { getCachedEquipmentReference } from '../../api/itemsService';
import { LootItem } from '../../../types/item';
import { getAllShopCatalog } from './shopCatalog';

export function getItemWeight(rawItemName: string): string {
  const EQUIPMENT_REFERENCE = getCachedEquipmentReference();
  const cleanName = rawItemName.trim();

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
  
  const normalized = clean.replace(',', '.');
  const match = normalized.match(/([\d.]+)\s*(kg|g)/);
  if (match) {
    const value = parseFloat(match[1]);
    const unit = match[2];
    if (unit === 'g') {
      return value / 1000;
    }
    return value;
  }
  
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
  if (!description) description = `Item da categoria ${chosen.category}.`;

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
