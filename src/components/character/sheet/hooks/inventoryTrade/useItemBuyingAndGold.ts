import { useState } from 'react';
import { updateCharacter, addItemToInventory } from '../../../../../lib/api/characterService';
import { getItemIdByName } from '../../../../../lib/api/itemsService';
import { ShopCatalogItem } from '../../../../../types';

export interface UseItemBuyingAndGoldProps {
  character: any;
  currentGoldNumber: number;
  formatGold: (num: number) => string;
  setShopMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  onCharacterUpdated?: () => void;
}

export function useItemBuyingAndGold({
  character,
  currentGoldNumber,
  formatGold,
  setShopMessage,
  onCharacterUpdated,
}: UseItemBuyingAndGoldProps) {
  const [itemToBuyConfirm, setItemToBuyConfirm] = useState<ShopCatalogItem | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);

  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customItemInput, setCustomItemInput] = useState('');

  const [showGoldModal, setShowGoldModal] = useState(false);
  const [goldInput, setGoldInput] = useState('');

  const handleBuyItem = (item: ShopCatalogItem) => {
    setItemToBuyConfirm(item);
    setBuyQuantity(1);
  };

  const handleBuyItemConfirmed = async (item: ShopCatalogItem, quantity: number) => {
    const totalPrice = item.pricePO * quantity;
    if (currentGoldNumber < totalPrice) {
      setShopMessage({
        type: 'error',
        text: `⚠️ Moedas insuficientes! ${quantity}x "${item.name}" custam ${totalPrice} PO e você tem apenas ${formatGold(
          currentGoldNumber
        )}.`,
      });
      setTimeout(() => setShopMessage(null), 4000);
      return;
    }

    const newGoldNum = currentGoldNumber - totalPrice;
    const newCoinsStr = formatGold(newGoldNum);

    try {
      if (character.id) {
        await updateCharacter(character.id, {
          coins: newCoinsStr,
        });

        try {
          const itemId = getItemIdByName(item.name);
          if (itemId) {
            const addedItem = await addItemToInventory(character.id, itemId, quantity);
            if (addedItem) {
              if (!character.character_inventory) character.character_inventory = [];
              const existing = character.character_inventory.find((i: any) => i.id === addedItem.id);
              if (existing) {
                existing.quantity = addedItem.quantity;
              } else {
                character.character_inventory.push(addedItem);
              }
            }
          } else {
            console.warn(`Item ${item.name} não encontrado no banco de dados para inserção relacional.`);
          }
        } catch (dbErr) {
          console.error('Erro no dual write (compra):', dbErr);
        }
      }

      character.coins = newCoinsStr;

      setShopMessage({
        type: 'success',
        text: `🛒 Comprou ${quantity}x "${item.name}" por -${totalPrice} PO! Adicionado ao seu inventário.`,
      });
      setTimeout(() => setShopMessage(null), 4000);

      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      setShopMessage({ type: 'error', text: 'Erro ao comprar item: ' + err.message });
    }
  };

  const handleAddCustomItem = async () => {
    if (!customItemInput.trim()) return;
    const newItem = customItemInput.trim();

    try {
      if (character.id) {
        try {
          const itemId = getItemIdByName(newItem);
          if (itemId) {
            const addedItem = await addItemToInventory(character.id, itemId, 1);
            if (addedItem) {
              if (!character.character_inventory) character.character_inventory = [];
              const existing = character.character_inventory.find((i: any) => i.id === addedItem.id);
              if (existing) {
                existing.quantity = addedItem.quantity;
              } else {
                character.character_inventory.push(addedItem);
              }
            }
          } else {
            console.warn(`Item customizado ${newItem} não encontrado no BD para inserção.`);
          }
        } catch (dbErr) {
          console.error('Erro no dual write (add custom):', dbErr);
        }
      }
      setCustomItemInput('');
      setShowCustomItemModal(false);
      setShopMessage({ type: 'success', text: `✓ Item "${newItem}" adicionado ao inventário.` });
      setTimeout(() => setShopMessage(null), 3000);
      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      setShopMessage({ type: 'error', text: 'Erro ao adicionar item: ' + err.message });
    }
  };

  const handleSaveGold = async () => {
    const val = parseFloat(goldInput.replace(',', '.'));
    if (isNaN(val) || val < 0) return;
    const newCoinsStr = formatGold(val);

    try {
      if (character.id) {
        await updateCharacter(character.id, {
          coins: newCoinsStr,
        });
      }
      character.coins = newCoinsStr;
      setShowGoldModal(false);
      setShopMessage({ type: 'success', text: `✓ Saldo atualizado para ${newCoinsStr}.` });
      setTimeout(() => setShopMessage(null), 3000);
      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      setShopMessage({ type: 'error', text: 'Erro ao atualizar moedas: ' + err.message });
    }
  };

  return {
    itemToBuyConfirm,
    setItemToBuyConfirm,
    buyQuantity,
    setBuyQuantity,
    showCustomItemModal,
    setShowCustomItemModal,
    customItemInput,
    setCustomItemInput,
    showGoldModal,
    setShowGoldModal,
    goldInput,
    setGoldInput,
    handleBuyItem,
    handleBuyItemConfirmed,
    handleAddCustomItem,
    handleSaveGold,
  };
}
