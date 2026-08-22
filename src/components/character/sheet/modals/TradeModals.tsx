import React from 'react';
import { ConfirmSellModal } from './trade/ConfirmSellModal';
import { ConfirmBuyModal } from './trade/ConfirmBuyModal';
import { EditGoldModal } from './trade/EditGoldModal';
import { AddCustomItemModal } from './trade/AddCustomItemModal';

interface TradeModalsProps {
  itemToSellConfirm: any;
  setItemToSellConfirm: (item: any) => void;
  sellQuantity: number;
  setSellQuantity: (q: number) => void;
  confirmSellItem: () => void;

  itemToBuyConfirm: any;
  setItemToBuyConfirm: (item: any) => void;
  buyQuantity: number;
  setBuyQuantity: (q: number) => void;
  currentGoldNumber: number;
  formatGold: (g: number) => string;
  handleBuyItemConfirmed: (item: any, qty: number) => void;

  showGoldModal: boolean;
  setShowGoldModal: (show: boolean) => void;
  goldInput: string;
  setGoldInput: (g: string) => void;
  handleSaveGold: () => void;

  showCustomItemModal: boolean;
  setShowCustomItemModal: (show: boolean) => void;
  customItemInput: string;
  setCustomItemInput: (val: string) => void;
  handleAddCustomItem: () => void;
}

export const TradeModals: React.FC<TradeModalsProps> = ({
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
}) => {
  return (
    <>
      <ConfirmSellModal
        itemToSellConfirm={itemToSellConfirm}
        setItemToSellConfirm={setItemToSellConfirm}
        sellQuantity={sellQuantity}
        setSellQuantity={setSellQuantity}
        confirmSellItem={confirmSellItem}
      />

      <ConfirmBuyModal
        itemToBuyConfirm={itemToBuyConfirm}
        setItemToBuyConfirm={setItemToBuyConfirm}
        buyQuantity={buyQuantity}
        setBuyQuantity={setBuyQuantity}
        currentGoldNumber={currentGoldNumber}
        formatGold={formatGold}
        handleBuyItemConfirmed={handleBuyItemConfirmed}
      />

      <EditGoldModal
        showGoldModal={showGoldModal}
        setShowGoldModal={setShowGoldModal}
        goldInput={goldInput}
        setGoldInput={setGoldInput}
        handleSaveGold={handleSaveGold}
      />

      <AddCustomItemModal
        showCustomItemModal={showCustomItemModal}
        setShowCustomItemModal={setShowCustomItemModal}
        customItemInput={customItemInput}
        setCustomItemInput={setCustomItemInput}
        handleAddCustomItem={handleAddCustomItem}
      />
    </>
  );
};
