import React from 'react';
import { getItemWeight } from '../../../../lib/mechanics/xpAndLootManager';

interface ItemCardActionsProps {
  isEquippable: boolean;
  isEquipped: boolean;
  itemName: string;
  category: string;
  priceInfo: any;
  itemObj: any;
  isConsumableItem: (itemName: string) => boolean;
  handleToggleEquipInInventory: (itemName: string) => void;
  handleConsumeItem: (inventoryId: string) => void;
  handleSellItem: (index: number) => void;
}

export const ItemCardActions: React.FC<ItemCardActionsProps> = ({
  isEquippable,
  isEquipped,
  itemName,
  category,
  priceInfo,
  itemObj,
  isConsumableItem,
  handleToggleEquipInInventory,
  handleConsumeItem,
  handleSellItem,
}) => {
  return (
    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5 flex-wrap">
      {isEquippable ? (
        <button
          type="button"
          onClick={() => handleToggleEquipInInventory(itemName)}
          className={`px-2 py-1 text-[11px] font-black rounded-lg transition shadow flex items-center gap-1 ${
            isEquipped
              ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 border border-amber-600 shadow-md'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
          title={isEquipped ? 'Desequipar item' : 'Equipar item'}
        >
          <span>{isEquipped ? 'Desequipar' : 'Equipar'}</span>
        </button>
      ) : category === 'teste' ? (
        <div className="text-[11px]">
          <span className="text-slate-400">Peso: </span>
          <span className="font-extrabold text-slate-200">{getItemWeight(itemName)}</span>
        </div>
      ) : (
        <div className="text-[11px]">
          <span className="text-slate-400">Recebe: </span>
          <span className="font-extrabold text-emerald-400">+{priceInfo.sellPricePO} PO</span>
        </div>
      )}

      {isConsumableItem(itemName) && !/tenda|saco de dormir|bedroll|tent/i.test(itemName) && (
        <button
          type="button"
          onClick={() => handleConsumeItem(itemObj.id)}
          className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
          title="Usar / Consumir item"
        >
          <span>🧪 Usar</span>
        </button>
      )}

      <button
        type="button"
        onClick={() => handleSellItem(itemObj.id)}
        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[11px] rounded-lg shadow transition flex items-center gap-1 active:scale-95"
        title={category === 'teste' ? `Remover ${itemName}` : `Vender ${itemName} por metade do preço (+${priceInfo.sellPricePO} PO)`}
      >
        <span>{category === 'teste' ? '🗑️ Remover' : `💰 Vender (+${priceInfo.sellPricePO} PO)`}</span>
      </button>
    </div>
  );
};
