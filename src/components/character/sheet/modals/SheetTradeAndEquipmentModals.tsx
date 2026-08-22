import React from 'react';
import { TradeModals } from './TradeModals';
import { EquipmentSlotsModal } from './EquipmentSlotsModal';
import { AcCalculatorModal } from './AcCalculatorModal';
import { isTwoHandedWeapon } from '../../../../lib/mechanics/acCalculator';

export interface SheetTradeAndEquipmentModalsProps {
  character: any;
  itemToSellConfirm: any;
  setItemToSellConfirm: (val: any) => void;
  sellQuantity: number;
  setSellQuantity: (val: number) => void;
  confirmSellItem: () => void;
  itemToBuyConfirm: any;
  setItemToBuyConfirm: (val: any) => void;
  buyQuantity: number;
  setBuyQuantity: (val: number) => void;
  currentGoldNumber: number;
  formatGold: (val: any) => string;
  handleBuyItemConfirmed: () => void;
  showGoldModal: boolean;
  setShowGoldModal: (val: boolean) => void;
  goldInput: string;
  setGoldInput: (val: string) => void;
  handleSaveGold: () => void;
  showCustomItemModal: boolean;
  setShowCustomItemModal: (val: boolean) => void;
  customItemInput: any;
  setCustomItemInput: (val: any) => void;
  handleAddCustomItem: () => void;
  showSlotsModal: boolean;
  setShowSlotsModal: (val: boolean) => void;
  equipmentSlots: any;
  currentAc: number;
  handleAssignSlot: (slotKey: any, itemId: string | null) => void;
  getAvailableItemsForSlot: (slotKey: any) => any[];
  showAcModal: boolean;
  setShowAcModal: (val: boolean) => void;
  acDetails: any;
}

export const SheetTradeAndEquipmentModals: React.FC<SheetTradeAndEquipmentModalsProps> = ({
  character,
  itemToSellConfirm,
  setItemToSellConfirm,
  sellQuantity,
  setSellQuantity,
  confirmSellItem,
  itemToBuyConfirm,
  setItemToBuyConfirm,
  buyQuantity,
  setBuyQuantity,
  currentGoldNumber,
  formatGold,
  handleBuyItemConfirmed,
  showGoldModal,
  setShowGoldModal,
  goldInput,
  setGoldInput,
  handleSaveGold,
  showCustomItemModal,
  setShowCustomItemModal,
  customItemInput,
  setCustomItemInput,
  handleAddCustomItem,
  showSlotsModal,
  setShowSlotsModal,
  equipmentSlots,
  currentAc,
  handleAssignSlot,
  getAvailableItemsForSlot,
  showAcModal,
  setShowAcModal,
  acDetails,
}) => {
  return (
    <>
      <TradeModals
        itemToSellConfirm={itemToSellConfirm}
        setItemToSellConfirm={setItemToSellConfirm}
        sellQuantity={sellQuantity}
        setSellQuantity={setSellQuantity}
        confirmSellItem={confirmSellItem}
        itemToBuyConfirm={itemToBuyConfirm}
        setItemToBuyConfirm={setItemToBuyConfirm}
        buyQuantity={buyQuantity}
        setBuyQuantity={setBuyQuantity}
        currentGoldNumber={currentGoldNumber}
        formatGold={formatGold}
        handleBuyItemConfirmed={handleBuyItemConfirmed}
        showGoldModal={showGoldModal}
        setShowGoldModal={setShowGoldModal}
        goldInput={goldInput}
        setGoldInput={setGoldInput}
        handleSaveGold={handleSaveGold}
        showCustomItemModal={showCustomItemModal}
        setShowCustomItemModal={setShowCustomItemModal}
        customItemInput={customItemInput}
        setCustomItemInput={setCustomItemInput}
        handleAddCustomItem={handleAddCustomItem}
      />

      {showSlotsModal && (
        <EquipmentSlotsModal
          character={character}
          equipmentSlots={equipmentSlots}
          currentAc={currentAc}
          onClose={() => setShowSlotsModal(false)}
          handleAssignSlot={handleAssignSlot}
          getAvailableItemsForSlot={getAvailableItemsForSlot}
          isTwoHandedWeapon={isTwoHandedWeapon}
        />
      )}

      {showAcModal && (
        <AcCalculatorModal
          acDetails={acDetails}
          onClose={() => setShowAcModal(false)}
        />
      )}
    </>
  );
};
