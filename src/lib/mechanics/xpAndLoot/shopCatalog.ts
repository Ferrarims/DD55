import { getCachedEquipmentReference } from '../../api/itemsService';
import { ItemPriceInfo, ShopCatalogItem } from '../../../types/item';
import { parseCostToGold } from './coinParser';

export function getItemPriceInfo(rawItemName: string): ItemPriceInfo {
  const EQUIPMENT_REFERENCE = getCachedEquipmentReference();
  const cleanName = rawItemName.trim();

  const stackMatch = cleanName.match(/^(.*?) \((\d+)\)$/);
  let baseName = cleanName;
  let currentQty = 1;
  let hasStack = false;

  if (stackMatch) {
    baseName = stackMatch[1].trim();
    currentQty = parseInt(stackMatch[2], 10);
    hasStack = true;
  }

  let matchedKey = Object.keys(EQUIPMENT_REFERENCE).find(
    key => key.toLowerCase() === cleanName.toLowerCase()
  );

  let originalTotalQty = 1;

  if (!matchedKey && hasStack) {
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
