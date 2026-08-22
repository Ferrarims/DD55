import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';
import { ConsumableItemsList, UsableItem } from './combatItem/ConsumableItemsList';
import { LightSourcesList } from './combatItem/LightSourcesList';
import { ClothingItemsList } from './combatItem/ClothingItemsList';

export type { UsableItem };

interface CombatItemModalProps {
  showItemModal: boolean;
  setShowItemModal: (show: boolean) => void;
  character: any;
  usableInventoryItems: UsableItem[];
  itemQuantities: Record<string, number>;
  totalRationsCount: number;
  activeEntity: any;
  entities: any[];
  handleUseItem: (item: any) => void;
  onCharacterUpdated?: () => void;
  forceUpdate?: () => void;
}

export const CombatItemModal: React.FC<CombatItemModalProps> = ({
  showItemModal,
  setShowItemModal,
  character,
  usableInventoryItems,
  itemQuantities,
  totalRationsCount,
  activeEntity,
  entities,
  handleUseItem,
  onCharacterUpdated,
  forceUpdate
}) => {
  useModalKeyboard({
    onCancel: () => setShowItemModal(false),
    onClose: () => setShowItemModal(false),
    onConfirm: () => {
      const firstAvailableItem = usableInventoryItems.find(item => {
        const qty = itemQuantities[item.id] ?? 1;
        const isHealItem = item.effectType === 'heal_minor' || item.effectType === 'heal_major' || item.effectType === 'kit';
        const isTent = item.effectType === 'tent' || item.effectType === 'sleeping_bag';
        const isFullHp = activeEntity?.currentHp >= activeEntity?.maxHp;
        const hasLivingMonsters = entities.some(e => e.type === 'monster' && !e.isDead);
        const isActionBlocked = isTent ? false : (item.actionCost === 'bonus' ? !activeEntity?.hasBonusAction : !activeEntity?.hasAction);
        const isDisabled = isActionBlocked || qty <= 0 || (isHealItem && isFullHp) || (isTent && hasLivingMonsters);
        return !isDisabled;
      });

      if (firstAvailableItem) {
        handleUseItem({
          id: firstAvailableItem.id,
          name: firstAvailableItem.name,
          icon: firstAvailableItem.icon,
          actionCost: firstAvailableItem.actionCost,
          effectType: firstAvailableItem.effectType,
          customDetail: firstAvailableItem.customDetail
        });
      } else {
        setShowItemModal(false);
      }
    },
    disabled: !showItemModal,
  });

  if (!showItemModal) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-in fade-in cursor-pointer"
      onClick={() => setShowItemModal(false)}
    >
      <div
        className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-xl w-full space-y-4 shadow-2xl max-h-[85vh] flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-lg font-black text-rose-400 flex items-center gap-2" style={{ fontFamily: 'Georgia, serif' }}>
            <span>🎒</span> Inventário de Combate - Usar Itens
          </h3>
          <button
            onClick={() => setShowItemModal(false)}
            className="text-slate-400 hover:text-white font-bold text-xl px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Itens usáveis presentes no inventário de <strong className="text-amber-300">{character?.name || 'seu personagem'}</strong>:
        </p>

        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* 1. Consumíveis */}
          <ConsumableItemsList
            character={character}
            usableInventoryItems={usableInventoryItems}
            itemQuantities={itemQuantities}
            totalRationsCount={totalRationsCount}
            activeEntity={activeEntity}
            entities={entities}
            handleUseItem={handleUseItem}
          />

          {/* 2. Iluminação */}
          <LightSourcesList
            character={character}
            onCharacterUpdated={onCharacterUpdated}
            forceUpdate={forceUpdate}
          />

          {/* 3. Vestuário */}
          <ClothingItemsList
            character={character}
            entities={entities}
            onCharacterUpdated={onCharacterUpdated}
            forceUpdate={forceUpdate}
          />
        </div>
      </div>
    </div>
  );
};
