import React from 'react';
import { InventoryTab } from '../../InventoryTab';
import { ShopTab } from '../../ShopTab';
import { ShopCatalogItem } from '../../../../types';

interface EquipmentAndInventorySectionProps {
  character: any;
  currentGoldNumber: number;
  formatGold: (n: number) => string;
  inventoryTab: 'inventory' | 'shop';
  setInventoryTab: (tab: 'inventory' | 'shop') => void;
  setGoldInput: (val: string) => void;
  setShowGoldModal: (show: boolean) => void;
  setShowSlotsModal: (show: boolean) => void;
  categorizedInventory: any;
  totalInventoryWeight: number;
  maxWeightCapacity: number;
  isOverburdened: boolean;
  isItemEquippedAnywhere: (itemName: string) => boolean;
  canItemBeEquipped: (itemName: string) => boolean;
  getEquipmentType: (itemName: string) => 'armor' | 'shield' | 'ring' | null;
  handleToggleEquipInInventory: (itemName: string) => Promise<void>;
  handleConsumeItem: (inventoryId: string) => Promise<void>;
  handleSellItem: (inventoryId: string) => void;
  handleBuyItem: (item: ShopCatalogItem) => void;
}

export const EquipmentAndInventorySection: React.FC<EquipmentAndInventorySectionProps> = ({
  character,
  currentGoldNumber,
  formatGold,
  inventoryTab,
  setInventoryTab,
  setGoldInput,
  setShowGoldModal,
  setShowSlotsModal,
  categorizedInventory,
  totalInventoryWeight,
  maxWeightCapacity,
  isOverburdened,
  isItemEquippedAnywhere,
  canItemBeEquipped,
  getEquipmentType,
  handleToggleEquipInInventory,
  handleConsumeItem,
  handleSellItem,
  handleBuyItem,
}) => {
  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 col-span-1 md:col-span-2">
      {/* Header com Saldo de Ouro, Edição de Moedas e Alternador de Abas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span>🎒</span> Equipamentos e Inventário
            </h3>

            {/* Badge de Moedas/Ouro com botão de editar */}
            <div className="flex items-center gap-1.5 bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs px-3 py-1 rounded-full font-extrabold shadow-sm">
              <span>💰 Saldo: {formatGold(currentGoldNumber)}</span>
              <button
                onClick={() => {
                  setGoldInput(String(currentGoldNumber));
                  setShowGoldModal(true);
                }}
                className="ml-1 text-[11px] bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 px-1.5 py-0.5 rounded transition"
                title="Editar Saldo de Moedas Manualmente"
              >
                ✏️ Editar
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gerencie suas armas, armaduras, recursos e moedas de ouro do personagem.
          </p>
        </div>

        {/* Alternador de Abas: Inventário (Vender) vs Loja (Comprar) vs Espaços Anatômicos */}
        <div className="flex flex-wrap items-center bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs gap-1">
          <button
            type="button"
            onClick={() => setInventoryTab('inventory')}
            className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 ${
              inventoryTab === 'inventory'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎒 Meus Itens (Venda)</span>
            <span className="bg-slate-950/50 px-1.5 py-0.2 rounded text-[10px]">
              {character.character_inventory?.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setInventoryTab('shop')}
            className={`px-3 py-1.5 rounded-md font-bold transition flex items-center gap-1.5 ${
              inventoryTab === 'shop'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🛒 Loja (Comprar)</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSlotsModal(true)}
            className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 font-bold rounded-md transition text-xs flex items-center gap-1.5 shadow"
            title="Ver e Alocar Itens nos Espaços Anatômicos do Corpo"
          >
            <span>🛡️ Espaços de Equipamento</span>
          </button>
        </div>
      </div>

      {inventoryTab === 'inventory' ? (
        <InventoryTab
          character={character}
          categorizedInventory={categorizedInventory}
          totalInventoryWeight={totalInventoryWeight}
          maxWeightCapacity={maxWeightCapacity}
          isOverburdened={isOverburdened}
          isItemEquippedAnywhere={isItemEquippedAnywhere}
          canItemBeEquipped={canItemBeEquipped}
          isConsumableItem={() => false}
          getEquipmentType={getEquipmentType}
          handleToggleEquipInInventory={handleToggleEquipInInventory}
          handleConsumeItem={handleConsumeItem}
          handleSellItem={handleSellItem}
          setShowSlotsModal={setShowSlotsModal}
        />
      ) : (
        <ShopTab
          currentGoldNumber={currentGoldNumber}
          handleBuyItem={handleBuyItem}
          formatGold={formatGold}
        />
      )}
    </div>
  );
};
