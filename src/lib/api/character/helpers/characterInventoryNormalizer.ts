import { getCachedEquipmentReference, getItemById, getItemNameById } from '../../itemsService';

export function normalizeCharacterInventoryAndSlots(char: any): void {
  const itemsRef = getCachedEquipmentReference();

  if (!char.character_inventory || !Array.isArray(char.character_inventory) || char.character_inventory.length === 0) {
    let choiceInv: any[] = [];
    if (char.character_choices && Array.isArray(char.character_choices)) {
      const backupChoice = char.character_choices.find((c: any) => 
        c.feature_name === 'inventory_backup' || 
        c.feature_name === 'inventory_items_data' || 
        c.choice_type === 'inventory_backup'
      );
      if (backupChoice && backupChoice.choice_value) {
        try {
          const parsed = JSON.parse(backupChoice.choice_value);
          if (Array.isArray(parsed)) choiceInv = parsed;
        } catch (e) {
          if (typeof backupChoice.choice_value === 'string') {
            choiceInv = backupChoice.choice_value.split(',').map((s: string) => s.trim()).filter(Boolean);
          }
        }
      }
    }

    const rawEquip = choiceInv.length > 0 
      ? choiceInv 
      : (Array.isArray(char.equipment) && char.equipment.length > 0 
          ? char.equipment 
          : (Array.isArray(char.inventory) && char.inventory.length > 0 ? char.inventory : []));

    if (rawEquip.length > 0) {
      char.character_inventory = rawEquip.map((eq: any, idx: number) => {
        let name = typeof eq === 'string' ? eq : (eq?.items?.name || eq?.name || 'Item');
        let qty = typeof eq === 'object' && eq?.quantity ? eq.quantity : 1;
        if (typeof eq === 'string') {
          const match = eq.match(/^(\d+)x?\s+(.+)$/i);
          if (match) {
            qty = parseInt(match[1], 10);
            name = match[2];
          }
        }
        const ref = itemsRef[name] || Object.values(itemsRef).find((i: any) => i.name?.toLowerCase() === name.toLowerCase());
        return {
          id: typeof eq === 'object' && eq?.id ? eq.id : `char-inv-${char.id || 'temp'}-${idx}`,
          character_id: char.id,
          quantity: qty,
          equip_slot: typeof eq === 'object' && eq?.equip_slot ? eq.equip_slot : null,
          items: {
            id: ref?.id || (typeof eq === 'object' && eq?.items?.id ? eq.items.id : `item-${idx}`),
            name: ref?.name || name,
            category: ref?.category || (typeof eq === 'object' && (eq?.items?.category || eq?.category) ? (eq.items?.category || eq.category) : 'Outros'),
            cost: ref?.cost || (typeof eq === 'object' && (eq?.items?.cost || eq?.cost) ? (eq.items?.cost || eq.cost) : '1 PO'),
            weight: ref?.weight || (typeof eq === 'object' && (eq?.items?.weight || eq?.weight) ? (eq.items?.weight || eq.weight) : '1 kg'),
            properties: ref?.properties || (typeof eq === 'object' && (eq?.items?.properties || eq?.properties) ? (eq.items?.properties || eq.properties) : '')
          }
        };
      });
    }
  }

  if (char.character_inventory && Array.isArray(char.character_inventory)) {
    char.character_inventory = char.character_inventory.map((inv: any, idx: number) => {
      const cachedById = inv.item_id ? getItemById(inv.item_id) : null;
      const name = inv.items?.name || inv.name || inv.item_name || (inv.item_id ? getItemNameById(inv.item_id) : null) || (inv.item_id && itemsRef[inv.item_id] ? itemsRef[inv.item_id].name : null) || 'Item';
      const ref = cachedById || itemsRef[name] || (inv.item_id ? itemsRef[inv.item_id] : null) || Object.values(itemsRef).find((i: any) => i.name?.toLowerCase() === name.toLowerCase());

      const populatedItems = {
        id: inv.items?.id || inv.item_id || ref?.id || `item-ref-${idx}`,
        name: inv.items?.name || ref?.name || name,
        category: inv.items?.category || ref?.category || inv.category || 'Outros',
        cost: inv.items?.cost || ref?.cost || '1 PO',
        weight: inv.items?.weight || ref?.weight || '1 kg',
        properties: inv.items?.properties || ref?.properties || ''
      };

      return {
        ...inv,
        name: populatedItems.name,
        items: populatedItems
      };
    });

    const equipList: string[] = [];
    char.character_inventory.forEach((inv: any) => {
      const name = inv.items?.name || inv.name;
      if (name) {
        const qty = inv.quantity || 1;
        if (qty > 1) {
          equipList.push(`${qty}x ${name}`);
        } else {
          equipList.push(name);
        }
      }
    });
    char.equipment = equipList;
  }

  if (char.equipment_slots) {
    let slots: any = char.equipment_slots;
    if (typeof slots === 'string') {
      try { slots = JSON.parse(slots); } catch (e) { slots = {}; }
    }
    if (slots && typeof slots === 'object') {
      char.equipment_slots = slots;
    } else {
      char.equipment_slots = {};
    }
  } else {
    char.equipment_slots = {};
  }

  // Sincroniza equip_slot da tabela character_inventory com char.equipment_slots
  if (char.character_inventory && Array.isArray(char.character_inventory)) {
    char.character_inventory.forEach((inv: any) => {
      const name = inv.items?.name || inv.name || (inv.item_id && itemsRef[inv.item_id] ? itemsRef[inv.item_id].name : null);
      if (inv.equip_slot && name) {
        char.equipment_slots[inv.equip_slot] = name;
      } else if (!inv.equip_slot && char.equipment_slots) {
        const invName = (name || '').toLowerCase().trim();
        if (invName) {
          for (const [sKey, sVal] of Object.entries(char.equipment_slots)) {
            if (sVal && typeof sVal === 'string' && sVal.toLowerCase().trim() === invName) {
              inv.equip_slot = sKey;
              break;
            }
          }
        }
      }
    });
  }

  if (char.character_attacks && Array.isArray(char.character_attacks)) {
    char.character_attacks = char.character_attacks.map((atk: any) => {
      let updatedAtk = { ...atk };
      if (atk.item_id) {
        const matchedItem = Object.values(itemsRef).find((i: any) => i.id === atk.item_id);
        if (matchedItem) {
          updatedAtk = {
            ...updatedAtk,
            name: atk.name || matchedItem.name,
            properties: atk.properties || matchedItem.properties,
            damage: atk.damage || matchedItem.damage
          };
        }
      }
      return updatedAtk;
    });

    char.character_attacks.forEach((atk: any) => {
      if (atk.equip_slot && atk.name) {
        if (char.equipment_slots && !char.equipment_slots[atk.equip_slot]) {
          char.equipment_slots[atk.equip_slot] = atk.name;
        }
      } else if (!atk.equip_slot && char.equipment_slots) {
        const atkName = (atk.name || '').toLowerCase().trim();
        if (atkName) {
          for (const [sKey, sVal] of Object.entries(char.equipment_slots)) {
            if (sVal && typeof sVal === 'string' && sVal.toLowerCase().trim() === atkName) {
              atk.equip_slot = sKey;
              break;
            }
          }
        }
      }
    });
  }

  if (char.equipment_slots && typeof char.equipment_slots === 'object') {
    const slots = char.equipment_slots;
    if (!char.equipped_armor && slots.corpo_torso) char.equipped_armor = slots.corpo_torso;
    if (!char.equipped_shield && slots.empunhadura_2 && /escudo|shield/i.test(slots.empunhadura_2)) {
      char.equipped_shield = slots.empunhadura_2;
    }
    if (!char.equipped_ring) char.equipped_ring = slots.dedo_anel_1 || slots.dedo_anel_2 || null;
  }
}
