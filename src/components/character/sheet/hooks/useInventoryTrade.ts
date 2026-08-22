import { useState, useEffect } from 'react';
import { parseCoinsToGoldNumber } from '../../../../lib/mechanics/xpAndLootManager';
import { useInventoryCategorization } from './inventoryTrade/useInventoryCategorization';
import { useItemConsumption } from './inventoryTrade/useItemConsumption';
import { useItemSelling } from './inventoryTrade/useItemSelling';
import { useItemBuyingAndGold } from './inventoryTrade/useItemBuyingAndGold';

export const useInventoryTrade = (
  character: any,
  equipmentSlots: Record<string, string | null>,
  setEquipmentSlots: (slots: Record<string, string | null>) => void,
  setEquippedArmor: (armor: string | null) => void,
  setEquippedShield: (shield: string | null) => void,
  setEquippedRing: (ring: string | null) => void,
  calculateTotalAc: (
    char: any,
    armor: string | null,
    shield: string | null,
    ring: string | null,
    fStyle?: string | null,
    invItems?: any[]
  ) => number,
  setCurrentAc: (ac: number) => void,
  currentHp: number,
  setCurrentHp: (hp: number) => void,
  setShowShortRestModal: (show: boolean) => void,
  setShopMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void,
  getItemCategory: (itemName: string) => 'armaduras' | 'armas' | 'municoes' | 'consumiveis' | 'outros' | 'teste',
  levelUpFightingStyle: string,
  onCharacterUpdated?: () => void
) => {
  const [inventoryTab, setInventoryTab] = useState<'inventory' | 'shop'>('inventory');

  const currentGoldNumber = parseCoinsToGoldNumber(character.coins);

  const formatGold = (num: number) => {
    if (num % 1 === 0) return `${num} PO`;
    return `${num.toFixed(2)} PO`;
  };

  const { totalInventoryWeight, maxWeightCapacity, isOverburdened, categorizedInventory } =
    useInventoryCategorization({
      character,
      getItemCategory,
    });

  const { handleConsumeItem } = useItemConsumption({
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
  });

  const {
    itemToSellConfirm,
    setItemToSellConfirm,
    sellQuantity,
    setSellQuantity,
    handleSellItem,
    confirmSellItem,
  } = useItemSelling({
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
  });

  const {
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
  } = useItemBuyingAndGold({
    character,
    currentGoldNumber,
    formatGold,
    setShopMessage,
    onCharacterUpdated,
  });

  useEffect(() => {
    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (itemToSellConfirm) {
          e.preventDefault();
          confirmSellItem();
        } else if (itemToBuyConfirm) {
          e.preventDefault();
          const totalPrice = itemToBuyConfirm.pricePO * buyQuantity;
          if (currentGoldNumber >= totalPrice) {
            handleBuyItemConfirmed(itemToBuyConfirm, buyQuantity);
            setItemToBuyConfirm(null);
          }
        }
      }
    };

    if (itemToSellConfirm || itemToBuyConfirm) {
      window.addEventListener('keydown', handleEnterKey);
    }
    return () => {
      window.removeEventListener('keydown', handleEnterKey);
    };
  }, [itemToSellConfirm, itemToBuyConfirm, sellQuantity, buyQuantity, currentGoldNumber]);

  return {
    inventoryTab,
    setInventoryTab,
    itemToSellConfirm,
    setItemToSellConfirm,
    sellQuantity,
    setSellQuantity,
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
    currentGoldNumber,
    totalInventoryWeight,
    maxWeightCapacity,
    isOverburdened,
    categorizedInventory,
    formatGold,
    handleSellItem,
    confirmSellItem,
    handleBuyItem,
    handleBuyItemConfirmed,
    handleAddCustomItem,
    handleSaveGold,
    handleConsumeItem,
  };
};
