import { getCachedEquipmentReference, getItemNameById } from '../../api/itemsService';

export function normalizeEquipmentList(rawList: string[]): string[] {
  if (!rawList || !Array.isArray(rawList)) return [];

  const nonAmmoItems: string[] = [];
  const ammoCounts: Record<string, number> = {};
  const ammoCanonicalName: Record<string, string> = {};
  const FEATS_REFERENCE = {}; // Mock or reference if needed

  const getAmmoInfo = (name: string): { isAmmo: boolean; baseKey: string; canonicalName: string; qty: number } => {
    if (!name || typeof name !== 'string') return { isAmmo: false, baseKey: '', canonicalName: '', qty: 0 };
    const trimmed = name.trim();
    if (!trimmed) return { isAmmo: false, baseKey: '', canonicalName: '', qty: 0 };

    if (trimmed.match(/^\d+\s*(PO|PP|PC|PE|PL)(\s*\(.*\))?$/i)) {
      return { isAmmo: false, baseKey: '', canonicalName: '', qty: 0 };
    }

    let qty = 1;
    let clean = trimmed;

    const prefixMatch = trimmed.match(/^(\d+)\s*x?\s+(.+)$/i);
    if (prefixMatch) {
      qty = parseInt(prefixMatch[1], 10);
      clean = prefixMatch[2].trim();
    }

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

      const prefixMatch = itemName.match(/^(\d+)\s*x?\s+(.+)$/i);
      if (prefixMatch) {
        itemQty = parseInt(prefixMatch[1], 10);
        itemName = prefixMatch[2].trim();
      } else {
        const lowerName = itemName.toLowerCase().trim();
        if (lowerName === 'rações de viagem' || lowerName === 'racoes de viagem' || lowerName === 'rações' || lowerName === 'racoes') {
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

  Object.keys(ammoCounts).forEach(baseKey => {
    const total = ammoCounts[baseKey];
    if (total <= 0) return;

    const canonical = ammoCanonicalName[baseKey] || 'Flechas';
    const fullStacks = Math.floor(total / 20);
    const remainder = total % 20;

    if (remainder > 0) {
      finalResult.push(`${canonical} (${remainder})`);
    }

    for (let i = 0; i < fullStacks; i++) {
      finalResult.push(`${canonical} (20)`);
    }
  });

  return finalResult;
}

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
    
    if (str.match(/^\d+\s*(PO|PP|PC|PE|PL)(\s*\(.*\))?$/i)) {
      return;
    }

    const parts = str.split(/,\s*|\s+e\s+/);
    parts.forEach(part => {
      let trimmed = part.trim();
      if (!trimmed) return;

      if (trimmed.match(/^\d+\s*(PO|PP|PC|PE|PL)(\s*\(.*\))?$/i)) {
        return;
      }

      separatedList.push(trimmed);
    });
  });

  return normalizeEquipmentList(separatedList);
}
