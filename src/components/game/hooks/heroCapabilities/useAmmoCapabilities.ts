import { removeItemFromInventory, updateItemQuantity } from '../../../../lib/api/characterService';

export interface UseAmmoCapabilitiesProps {
  character: any;
  onCharacterUpdated?: () => Promise<void> | void;
}

export function useAmmoCapabilities({ character, onCharacterUpdated }: UseAmmoCapabilitiesProps) {
  const checkAmmunitionRequirement = (atkToUse: any) => {
    if (!atkToUse) return null;
    const name = (atkToUse.name || '').toLowerCase();
    const properties = (atkToUse.properties || '').toLowerCase();

    const requiresAmmo = properties.includes('munição') || properties.includes('municao') || properties.includes('muni') ||
                         name.includes('arco') || name.includes('besta') || name.includes('funda') ||
                         name.includes('pistola') || name.includes('mosquete') || name.includes('blowgun') || name.includes('zarabatana') ||
                         name.includes('bow') || name.includes('crossbow') || name.includes('sling');

    if (!requiresAmmo) return null;

    if (name.includes('arco') || name.includes('bow')) {
      return { type: 'Flecha', pattern: /flecha|arrow/i };
    }
    if (name.includes('besta') || name.includes('crossbow')) {
      return { type: 'Virote de Besta', pattern: /virote|bolt/i };
    }
    if (name.includes('funda') || name.includes('sling')) {
      return { type: 'Munição de Funda', pattern: /bala|bullet|pedra|sling/i };
    }
    if (name.includes('pistola') || name.includes('mosquete') || name.includes('pistol') || name.includes('musket')) {
      return { type: 'Bala de Arma de Fogo', pattern: /bala|bullet/i };
    }
    if (name.includes('zarabatana') || name.includes('blowgun')) {
      return { type: 'Agulha', pattern: /agulha|needle|dardo/i };
    }

    return { type: 'Munição', pattern: /muni|flecha|virote|bala/i };
  };

  const getCharacterAmmoCount = (req: { type: string; pattern: RegExp }) => {
    if (!character || !character.character_inventory) return 0;
    const ammoItem = character.character_inventory.find((inv: any) => {
      const name = String(inv.items?.name || inv.name || inv.item_name || '').toLowerCase();
      return req.pattern.test(name);
    });
    if (!ammoItem) return 0;
    let qty = ammoItem.quantity || 1;
    if (qty === 1) {
      const itemName = String(ammoItem.items?.name || ammoItem.name || ammoItem.item_name || '');
      const match = itemName.match(/\((\d+)\)/);
      qty = match ? parseInt(match[1], 10) : (/bala de arma de fogo/i.test(itemName) ? 10 : 20);
    }
    return qty;
  };

  const consumeAmmunition = async (req: { type: string; pattern: RegExp }) => {
    if (!character || !character.character_inventory) return;
    const idx = character.character_inventory.findIndex((inv: any) => {
      const name = String(inv.items?.name || inv.name || inv.item_name || '').toLowerCase();
      return req.pattern.test(name);
    });
    if (idx === -1) return;

    const ammoItem = character.character_inventory[idx];
    let currentQty = ammoItem.quantity || 1;
    if (currentQty === 1) {
      const itemName = String(ammoItem.items?.name || ammoItem.name || ammoItem.item_name || '');
      const match = itemName.match(/\((\d+)\)/);
      currentQty = match ? parseInt(match[1], 10) : (/bala de arma de fogo/i.test(itemName) ? 10 : 20);
    }
    const newQty = currentQty - 1;

    try {
      if (newQty <= 0) {
        character.character_inventory.splice(idx, 1);
        if (ammoItem.id) await removeItemFromInventory(ammoItem.id);
      } else {
        ammoItem.quantity = newQty;
        if (ammoItem.id) await updateItemQuantity(ammoItem.id, newQty);
      }
      if (onCharacterUpdated) await onCharacterUpdated();
    } catch (e) {
      console.warn('Aviso ao consumir munição:', e);
    }
  };

  const consumeThrownWeapon = async (weaponName: string) => {
    if (!character || !character.character_inventory) return;
    const idx = character.character_inventory.findIndex((inv: any) => {
      const name = String(inv.items?.name || inv.name || inv.item_name || '').toLowerCase();
      return name.includes(weaponName.toLowerCase()) || weaponName.toLowerCase().includes(name);
    });
    if (idx === -1) return;

    const thrownItem = character.character_inventory[idx];
    const newQty = (thrownItem.quantity || 1) - 1;

    try {
      if (newQty <= 0) {
        character.character_inventory.splice(idx, 1);
        if (thrownItem.id) await removeItemFromInventory(thrownItem.id);
      } else {
        thrownItem.quantity = newQty;
        if (thrownItem.id) await updateItemQuantity(thrownItem.id, newQty);
      }
      if (onCharacterUpdated) await onCharacterUpdated();
    } catch (e) {
      console.warn('Aviso ao consumir arma de arremesso:', e);
    }
  };

  return {
    checkAmmunitionRequirement,
    getCharacterAmmoCount,
    consumeAmmunition,
    consumeThrownWeapon,
  };
}
