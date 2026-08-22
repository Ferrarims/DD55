import { useMemo } from 'react';
import { getCachedEquipmentReference } from '../../../../../lib/api/itemsService';
import { parseWeightToKg, getItemWeight } from '../../../../../lib/mechanics/xpAndLootManager';

export interface UseInventoryCategorizationProps {
  character: any;
  getItemCategory: (itemName: string) => 'armaduras' | 'armas' | 'municoes' | 'consumiveis' | 'outros' | 'teste';
}

export function useInventoryCategorization({
  character,
  getItemCategory,
}: UseInventoryCategorizationProps) {
  const totalInventoryWeight = useMemo(() => {
    let sum = 0;
    const itemsRef = getCachedEquipmentReference();
    const rawInv =
      character.character_inventory && character.character_inventory.length > 0
        ? character.character_inventory
        : Array.isArray(character.equipment)
        ? character.equipment
        : Array.isArray(character.inventory)
        ? character.inventory
        : [];

    rawInv.forEach((inv: any) => {
      let itemName =
        typeof inv === 'string'
          ? inv
          : inv.items?.name ||
            inv.name ||
            (inv.item_id && itemsRef[inv.item_id] ? itemsRef[inv.item_id].name : '');
      let qty = typeof inv === 'object' && inv?.quantity ? inv.quantity : 1;
      if (typeof inv === 'string') {
        const match = inv.match(/^(\d+)x?\s+(.+)$/i);
        if (match) {
          qty = parseInt(match[1], 10);
          itemName = match[2];
        }
      }
      if (itemName) {
        const weightStr = getItemWeight(itemName);
        const weightKg = parseWeightToKg(weightStr);
        sum += weightKg * qty;
      }
    });
    return Math.round(sum * 100) / 100;
  }, [character.character_inventory, character.equipment, character.inventory]);

  const isGoliathOrPowerfulBuild =
    ['Golias', 'Goliath'].includes(character.race || character.race_name) ||
    character.traits?.some(
      (t: any) =>
        t.name?.includes('Porte Poderoso') ||
        t.name?.includes('Físico Poderoso') ||
        t.name?.includes('Powerful Build')
    );
  const weightMultiplier = isGoliathOrPowerfulBuild ? 30 : 15;
  const maxWeightCapacity = (character.strength || 10) * weightMultiplier;
  const isOverburdened = totalInventoryWeight > maxWeightCapacity;

  const categorizedInventory = useMemo(() => {
    const itemsRef = getCachedEquipmentReference();
    let rawInv = (character.character_inventory || []) as any[];

    if (rawInv.length === 0) {
      if (Array.isArray(character.equipment) && character.equipment.length > 0) {
        rawInv = character.equipment.map((eqStr: string, idx: number) => {
          let name = eqStr;
          let qty = 1;
          const match = eqStr.match(/^(\d+)x?\s+(.+)$/i);
          if (match) {
            qty = parseInt(match[1], 10);
            name = match[2];
          }
          const ref =
            itemsRef[name] ||
            Object.values(itemsRef).find((i: any) => i.name?.toLowerCase() === name.toLowerCase());
          return {
            id: `equip-fallback-${idx}`,
            character_id: character.id,
            quantity: qty,
            items: {
              name,
              category: ref?.category || getItemCategory(name),
              cost: ref?.cost || '1 PO',
              weight: ref?.weight || '1 kg',
              properties: ref?.properties || '',
            },
          };
        });
      } else if (Array.isArray(character.inventory) && character.inventory.length > 0) {
        rawInv = character.inventory.map((invItem: any, idx: number) => ({
          id: invItem.id || `inv-fallback-${idx}`,
          character_id: character.id,
          quantity: invItem.quantity || 1,
          items: {
            name: invItem.name || 'Item',
            category: invItem.category || getItemCategory(invItem.name || ''),
            cost: invItem.cost || '1 PO',
            weight: invItem.weight || '1 kg',
            properties: invItem.properties || '',
          },
        }));
      }
    }

    const mapped = rawInv.map((inv, index) => {
      const itemName =
        typeof inv === 'string'
          ? inv
          : inv.items?.name ||
            inv.name ||
            inv.item_name ||
            (inv.item_id && itemsRef[inv.item_id] ? itemsRef[inv.item_id].name : 'Item Desconhecido');
      const ref =
        itemsRef[itemName] ||
        (inv.item_id ? itemsRef[inv.item_id] : null) ||
        Object.values(itemsRef).find((i: any) => i.name?.toLowerCase() === itemName.toLowerCase());
      const rawCat = inv.items?.category || inv.category || ref?.category;
      let cat: 'armaduras' | 'armas' | 'municoes' | 'consumiveis' | 'outros' | 'teste' = 'outros';

      if (rawCat) {
        const norm = rawCat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        if (norm.includes('consumivel') || norm.includes('consumiveis')) {
          cat = 'consumiveis';
        } else if (norm.includes('armadura') || norm.includes('protecao') || norm.includes('escudo')) {
          cat = 'armaduras';
        } else if (norm.includes('arma') && !norm.includes('armadura')) {
          cat = 'armas';
        } else if (norm.includes('municao') || norm.includes('municoes')) {
          cat = 'municoes';
        } else if (norm.includes('teste')) {
          cat = 'teste';
        } else if (
          norm === 'armaduras' ||
          norm === 'armas' ||
          norm === 'municoes' ||
          norm === 'consumiveis' ||
          norm === 'outros' ||
          norm === 'teste'
        ) {
          cat = norm as any;
        } else {
          cat = getItemCategory(itemName);
        }
      } else {
        cat = getItemCategory(itemName);
      }

      return {
        id: inv.id || `inv-${index}`,
        name: itemName,
        quantity: inv.quantity || 1,
        category: cat,
        dbItem: inv,
        originalIndex: index,
      };
    });

    const groupedMap = new Map<string, any>();
    mapped.forEach(item => {
      const name = item.name;
      if (groupedMap.has(name)) {
        const existing = groupedMap.get(name);
        existing.quantity += item.quantity;
      } else {
        groupedMap.set(name, { ...item });
      }
    });
    const groupedMapped = Array.from(groupedMap.values());

    const sortAlpha = (a: any, b: any) => {
      const nameA = (a.name || '')
        .replace(
          /^[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{200D}\s]+/u,
          ''
        )
        .trim();
      const nameB = (b.name || '')
        .replace(
          /^[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{200D}\s]+/u,
          ''
        )
        .trim();
      return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
    };

    const armaduras = groupedMapped.filter(i => i.category === 'armaduras').sort(sortAlpha);
    const armas = groupedMapped.filter(i => i.category === 'armas').sort(sortAlpha);
    const municoes = groupedMapped.filter(i => i.category === 'municoes').sort(sortAlpha);
    const consumiveis = groupedMapped.filter(i => i.category === 'consumiveis').sort(sortAlpha);
    const outros = groupedMapped.filter(i => i.category === 'outros').sort(sortAlpha);
    const teste = groupedMapped.filter(i => i.category === 'teste').sort(sortAlpha);
    const all = [...groupedMapped].sort(sortAlpha);

    return {
      armaduras,
      armas,
      municoes,
      consumiveis,
      outros,
      teste,
      all,
      totalConsumiveis: consumiveis.reduce((acc, curr) => acc + curr.quantity, 0),
    };
  }, [character.character_inventory, character.equipment, character.inventory, getItemCategory]);

  return {
    totalInventoryWeight,
    maxWeightCapacity,
    isOverburdened,
    categorizedInventory,
  };
}
