import { updateCharacter, removeItemFromInventory, updateItemQuantity } from '../../../../../lib/api/characterService';

export interface UseItemConsumptionProps {
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
  currentHp: number;
  setCurrentHp: (hp: number) => void;
  setShowShortRestModal: (show: boolean) => void;
  setShopMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  levelUpFightingStyle: string;
  categorizedInventory: { all: any[] };
  onCharacterUpdated?: () => void;
}

export function useItemConsumption({
  character,
  equipmentSlots,
  setEquipmentSlots,
  setEquippedArmor,
  setEquippedShield,
  setEquippedRing,
  calculateTotalAc,
  setCurrentAc,
  currentHp,
  setCurrentHp,
  setShowShortRestModal,
  setShopMessage,
  levelUpFightingStyle,
  categorizedInventory,
  onCharacterUpdated,
}: UseItemConsumptionProps) {
  const handleConsumeItem = async (inventoryId: string) => {
    const itemObj = categorizedInventory.all.find((i: any) => i.id === inventoryId);
    if (!itemObj) return;

    const itemToConsume = itemObj.name;
    if (!itemToConsume) return;

    const lower = itemToConsume.toLowerCase();

    if (
      lower.includes('tenda') ||
      lower.includes('saco de dormir') ||
      lower.includes('bedroll') ||
      lower.includes('tent')
    ) {
      setShowShortRestModal(true);
      return;
    }

    let healAmount = 0;
    let effectText = '';

    if (
      lower.includes('poção de cura maior') ||
      lower.includes('pocao de cura maior') ||
      lower.includes('poção maior') ||
      lower.includes('pocao maior')
    ) {
      healAmount =
        Math.floor(Math.random() * 4) +
        1 +
        Math.floor(Math.random() * 4) +
        1 +
        Math.floor(Math.random() * 4) +
        1 +
        Math.floor(Math.random() * 4) +
        1 +
        4;
      effectText = `Recuperou ${healAmount} PV (4d4+4)!`;
    } else if (
      lower.includes('poção') ||
      lower.includes('pocao') ||
      lower.includes('potion') ||
      lower.includes('cura') ||
      lower.includes('vida')
    ) {
      healAmount = Math.floor(Math.random() * 4) + 1 + Math.floor(Math.random() * 4) + 1 + 2;
      effectText = `Recuperou ${healAmount} PV (2d4+2)!`;
    } else if (
      lower.includes('kit de curandeiro') ||
      lower.includes('bandagem') ||
      lower.includes('curativo') ||
      lower.includes('primeiros socorros')
    ) {
      healAmount = 5;
      effectText = `Restaurou 5 PV!`;
    } else if (
      lower.includes('ração') ||
      lower.includes('racao') ||
      lower.includes('ration') ||
      lower.includes('marmita') ||
      lower.includes('comida')
    ) {
      healAmount = 0;
      effectText = `Consumido 1x Ração de Viagem. (A ração é utilizada para nutrir o personagem ao acampar em Descansos Curtos na Tenda/Saco de Dormir).`;
    } else if (lower.includes('elixir') || lower.includes('antídoto') || lower.includes('antidoto')) {
      healAmount = 0;
      effectText = `Consumido com sucesso!`;
    } else {
      effectText = `Consumido com sucesso!`;
    }

    const maxHp = character.max_hp || 20;
    const oldHp = currentHp || character.current_hp || maxHp;
    const newHp = Math.min(maxHp, oldHp + healAmount);
    character.current_hp = newHp;
    setCurrentHp(newHp);

    let updatedSlots = { ...equipmentSlots };
    const remainingCount =
      (character.character_inventory
        ?.filter((inv: any) => inv.items?.name === itemToConsume)
        .reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0) || 0) - 1;
    let equippedCount = 0;
    Object.keys(updatedSlots).forEach(slotKey => {
      if (updatedSlots[slotKey] === itemToConsume) {
        equippedCount++;
      }
    });

    if (equippedCount > remainingCount) {
      let diff = equippedCount - remainingCount;
      for (const slotKey of Object.keys(updatedSlots)) {
        if (updatedSlots[slotKey] === itemToConsume) {
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

    let quantityToReduce = 1;
    const rowsToDelete: string[] = [];
    const rowsToUpdate: { id: string; qty: number }[] = [];

    if (character.character_inventory) {
      const matchingRows = [...character.character_inventory].filter(
        (inv: any) => (inv.items?.name || inv.name || 'Item Desconhecido') === itemToConsume
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

    try {
      if (character.id) {
        await updateCharacter(character.id, {
          equipment_slots: updatedSlots,
          armor_class: newAc,
          current_hp: newHp,
        });

        try {
          for (const rowId of rowsToDelete) {
            await removeItemFromInventory(rowId);
          }
          for (const upd of rowsToUpdate) {
            await updateItemQuantity(upd.id, upd.qty);
          }
        } catch (dbErr) {
          console.error('Erro no dual write (consumo):', dbErr);
        }
      }

      setShopMessage({
        type: 'success',
        text: `🧪 ${itemToConsume} consumido! ${effectText}`,
      });
      setTimeout(() => setShopMessage(null), 4000);

      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      console.error('Erro ao consumir item:', err);
      setShopMessage({
        type: 'error',
        text: 'Erro ao remover o item do inventário: ' + err.message,
      });
    }
  };

  return { handleConsumeItem };
}
