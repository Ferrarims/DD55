import { useState } from 'react';
import { updateCharacter, removeItemFromInventory, updateItemQuantity } from '../../../../../lib/api/characterService';
import { getItemPriceInfo } from '../../../../../lib/mechanics/xpAndLootManager';

export interface UseItemSellingProps {
  character: any;
  equipmentSlots: Record<string, string | null>;
  setEquipmentSlots: (slots: Record<string, string | null>) => void;
  setEquippedArmor: (armor: string | null) => void;
  setEquippedShield: (shield: string | null) => void;
  setEquippedRing: (ring: string | null) => void;
  calculateTotalAc: (
    char: any,
    armor: string | null,
    shield: string | null,
    ring: string | null,
    fStyle?: string | null,
    invItems?: any[]
  ) => number;
  setCurrentAc: (ac: number) => void;
  currentGoldNumber: number;
  formatGold: (num: number) => string;
  setShopMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  levelUpFightingStyle: string;
  categorizedInventory: { all: any[] };
  onCharacterUpdated?: () => void;
}

export function useItemSelling({
  character,
  equipmentSlots,
  setEquipmentSlots,
  setEquippedArmor,
  setEquippedShield,
  setEquippedRing,
  calculateTotalAc,
  setCurrentAc,
  currentGoldNumber,
  formatGold,
  setShopMessage,
  levelUpFightingStyle,
  categorizedInventory,
  onCharacterUpdated,
}: UseItemSellingProps) {
  const [itemToSellConfirm, setItemToSellConfirm] = useState<{
    id: string;
    name: string;
    sellPricePO: number;
    costStr: string;
    isEquipped: boolean;
    quantityAvailable: number;
  } | null>(null);
  const [sellQuantity, setSellQuantity] = useState<number>(1);

  const handleSellItem = (inventoryId: string) => {
    const itemObj = categorizedInventory.all.find((i: any) => i.id === inventoryId);
    if (!itemObj) return;

    const targetName = itemObj.name;
    const priceInfo = getItemPriceInfo(targetName);
    const isEquipped = Object.values(equipmentSlots).some(slotItem => slotItem === targetName);

    setSellQuantity(1);
    setItemToSellConfirm({
      id: inventoryId,
      name: targetName,
      sellPricePO: priceInfo.sellPricePO,
      costStr: priceInfo.costStr,
      isEquipped,
      quantityAvailable: itemObj.quantity,
    });
  };

  const confirmSellItem = async () => {
    if (!itemToSellConfirm) return;
    const { name: targetName, sellPricePO, costStr } = itemToSellConfirm;

    const quantity = sellQuantity;
    setItemToSellConfirm(null);

    const totalSellPrice = sellPricePO * quantity;
    const newGoldNum = currentGoldNumber + totalSellPrice;
    const newCoinsStr = formatGold(newGoldNum);

    let quantityToReduce = quantity;
    const rowsToDelete: string[] = [];
    const rowsToUpdate: { id: string; qty: number }[] = [];

    if (character.character_inventory) {
      const matchingRows = [...character.character_inventory].filter(
        (inv: any) => (inv.items?.name || inv.name || 'Item Desconhecido') === targetName
      );

      for (const row of matchingRows) {
        if (quantityToReduce <= 0) break;

        const rowQty = row.quantity || 1;
        if (rowQty <= quantityToReduce) {
          rowsToDelete.push(row.id);
          quantityToReduce -= rowQty;
          const idx = character.character_inventory.findIndex((inv: any) => inv.id === row.id);
          if (idx !== -1) {
            character.character_inventory.splice(idx, 1);
          }
        } else {
          const newQty = rowQty - quantityToReduce;
          rowsToUpdate.push({ id: row.id, qty: newQty });
          row.quantity = newQty;
          quantityToReduce = 0;
        }
      }
    }

    let updatedSlots = { ...equipmentSlots };
    const remainingCount =
      character.character_inventory
        ?.filter((inv: any) => inv.items?.name === targetName)
        .reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0) || 0;

    let equippedCount = 0;
    Object.keys(updatedSlots).forEach(slotKey => {
      if (updatedSlots[slotKey] === targetName) {
        equippedCount++;
      }
    });

    if (equippedCount > remainingCount) {
      let diff = equippedCount - remainingCount;
      for (const slotKey of Object.keys(updatedSlots)) {
        if (updatedSlots[slotKey] === targetName) {
          updatedSlots[slotKey] = null;
          diff--;
          if (diff <= 0) break;
        }
      }
    }

    let newArmor = updatedSlots.corpo_torso || null;
    let newShield =
      updatedSlots.empunhadura_2 && updatedSlots.empunhadura_2.toLowerCase().includes('escudo')
        ? updatedSlots.empunhadura_2
        : null;
    let newRing = updatedSlots.dedo_anel_1 || updatedSlots.dedo_anel_2 || null;

    setEquippedArmor(newArmor);
    setEquippedShield(newShield);
    setEquippedRing(newRing);
    setEquipmentSlots(updatedSlots);

    character.equipped_armor = newArmor;
    character.equipped_shield = newShield;
    character.equipped_ring = newRing;
    character.equipment_slots = updatedSlots;

    const newAc = calculateTotalAc(
      character,
      newArmor,
      newShield,
      newRing,
      levelUpFightingStyle,
      character.character_inventory
    );
    setCurrentAc(newAc);
    character.armor_class = newAc;

    try {
      if (character.id) {
        const updatePayload: any = {
          coins: newCoinsStr,
          equipment_slots: updatedSlots,
          armor_class: newAc,
          equipped_armor: newArmor,
          equipped_shield: newShield,
          equipped_ring: newRing,
        };
        await updateCharacter(character.id, updatePayload);

        try {
          for (const rowId of rowsToDelete) {
            await removeItemFromInventory(rowId);
          }
          for (const upd of rowsToUpdate) {
            await updateItemQuantity(upd.id, upd.qty);
          }
        } catch (dbErr) {
          console.error('Erro no dual write (venda):', dbErr);
        }
      }

      character.coins = newCoinsStr;

      setShopMessage({
        type: 'success',
        text: `💰 Vendeu "${targetName}" por +${sellPricePO} PO! (50% do valor de compra ${costStr})`,
      });
      setTimeout(() => setShopMessage(null), 4000);

      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      setShopMessage({ type: 'error', text: 'Erro ao vender item: ' + err.message });
    }
  };

  return {
    itemToSellConfirm,
    setItemToSellConfirm,
    sellQuantity,
    setSellQuantity,
    handleSellItem,
    confirmSellItem,
  };
}
