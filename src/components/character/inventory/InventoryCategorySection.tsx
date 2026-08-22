import React from 'react';
import { InventoryItemCard } from './InventoryItemCard';

interface InventoryCategorySectionProps {
  title: string;
  icon: string;
  titleColor: string;
  items: any[];
  category: 'armaduras' | 'armas' | 'municoes' | 'consumiveis' | 'outros' | 'teste';
  showHeading: boolean;
  emptyMessage?: string;
  character: any;
  isItemEquippedAnywhere: (itemName: string) => boolean;
  canItemBeEquipped: (itemName: string) => boolean;
  isConsumableItem: (itemName: string) => boolean;
  getEquipmentType: (itemName: string) => 'armor' | 'shield' | 'ring' | null;
  handleToggleEquipInInventory: (itemName: string) => void;
  handleConsumeItem: (inventoryId: string) => void;
  handleSellItem: (index: number) => void;
}

export const InventoryCategorySection: React.FC<InventoryCategorySectionProps> = ({
  title,
  icon,
  titleColor,
  items,
  category,
  showHeading,
  emptyMessage,
  character,
  isItemEquippedAnywhere,
  canItemBeEquipped,
  isConsumableItem,
  getEquipmentType,
  handleToggleEquipInInventory,
  handleConsumeItem,
  handleSellItem
}) => {
  if (items.length === 0) {
    if (!emptyMessage) return null;
    return (
      <div className="p-6 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-xs text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {showHeading && (
        <h4 className={`text-xs font-bold ${titleColor} uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-1`}>
          <span>{icon}</span> {title} ({items.length})
        </h4>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {items.map((itemObj, i) => (
          <InventoryItemCard
            key={`${category}-${itemObj.name}-${itemObj.originalIndex ?? i}`}
            itemObj={itemObj}
            category={category}
            character={character}
            isItemEquippedAnywhere={isItemEquippedAnywhere}
            canItemBeEquipped={canItemBeEquipped}
            isConsumableItem={isConsumableItem}
            getEquipmentType={getEquipmentType}
            handleToggleEquipInInventory={handleToggleEquipInInventory}
            handleConsumeItem={handleConsumeItem}
            handleSellItem={handleSellItem}
          />
        ))}
      </div>
    </div>
  );
};
