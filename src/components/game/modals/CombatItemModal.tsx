import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';
import { updateCharacter } from '../../../lib/api/characterService';

interface UsableItem {
  id: string;
  name: string;
  icon: string;
  actionCost: 'action' | 'bonus' | 'free';
  actionCostLabel: string;
  badgeColor: string;
  btnColor: string;
  description: string;
  effectType: string;
  customDetail?: string;
}

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

        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {usableInventoryItems.length > 0 ? (
            usableInventoryItems.map((item, idx) => {
              const qty = itemQuantities[item.id] ?? 1;
              const isHealItem = item.effectType === 'heal_minor' || item.effectType === 'heal_major' || item.effectType === 'kit';
              const isTent = item.effectType === 'tent' || item.effectType === 'sleeping_bag';
              const isFullHp = activeEntity?.currentHp >= activeEntity?.maxHp;
              const hasLivingMonsters = entities.some(e => e.type === 'monster' && !e.isDead);
              const isActionBlocked = isTent ? false : (item.actionCost === 'bonus' ? !activeEntity?.hasBonusAction : !activeEntity?.hasAction);
              const isDisabled = isActionBlocked || qty <= 0 || (isHealItem && isFullHp) || (isTent && hasLivingMonsters);

              return (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-slate-900 rounded-lg border border-slate-700">{item.icon}</span>
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-2 flex-wrap">
                        <span>{item.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${item.badgeColor}`}>
                          {item.actionCostLabel}
                        </span>
                        {isTent ? (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                            totalRationsCount > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            {`Rações: ${totalRationsCount}`}
                          </span>
                        ) : (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${
                            qty > 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {qty > 0 ? `Qtd: ${qty}` : 'Esgotado'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUseItem({
                      id: item.id,
                      name: item.name,
                      icon: item.icon,
                      actionCost: item.actionCost,
                      effectType: item.effectType,
                      customDetail: item.customDetail
                    })}
                    disabled={isDisabled}
                    title={
                      qty <= 0 ? 'Item esgotado' :
                      (isTent && hasLivingMonsters) ? 'Não é possível acampar com monstros vivos' :
                      (isHealItem && isFullHp) ? 'Você já está com a vida cheia' :
                      (!isTent && item.actionCost === 'bonus' && !activeEntity?.hasBonusAction) ? 'Sem Ação Bônus' :
                      (!isTent && item.actionCost === 'action' && !activeEntity?.hasAction) ? 'Sem Ação Principal' : ''
                    }
                    className={`px-3.5 py-2 font-bold text-xs text-white rounded-lg transition shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${item.btnColor}`}
                  >
                    {qty <= 0 ? 'Esgotado' :
                     (isTent && hasLivingMonsters) ? 'Inseguro' :
                     (isHealItem && isFullHp) ? 'Vida Cheia' :
                     'Usar Item'}
                  </button>
                </div>
              );
            })
          ) : (
            <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-3">
              <span className="text-3xl block">🎒</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Nenhum item usável foi encontrado no inventário de <strong className="text-amber-300">{character?.name || 'seu personagem'}</strong>.
              </p>
              <button
                onClick={() => handleUseItem({
                  name: 'Poção de Cura',
                  icon: '🧪',
                  actionCost: 'bonus',
                  effectType: 'heal_minor'
                })}
                disabled={!activeEntity?.hasBonusAction || activeEntity?.currentHp >= activeEntity?.maxHp}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-40 cursor-pointer"
              >
                🧪 Usar Poção de Cura de Emergência (2d4+2)
              </button>
            </div>
          )}
        </div>

        {/* Extra: Roupas */}
        {(() => {
          const hasLivingMonstersForClothes = entities.some(e => e.type === 'monster' && e.currentHp > 0 && !e.isDead);
          if (hasLivingMonstersForClothes) return null;
          const clothingItems = (character?.character_inventory || []).filter((inv: any) => {
            const name = (inv.item?.name || inv.items?.name || inv.name || '').toLowerCase();
            return /roupa|veste|traje|manto/.test(name);
          });
          if (clothingItems.length === 0) return null;

          const equippedClothes = (character?.equipment_slots?.roupa_clima || '').toLowerCase();

          return (
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 pb-2">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-slate-500 text-base">👕</span> Vestuário e Roupas
              </h4>
              {clothingItems.map((inv: any) => {
                const name = inv.item?.name || inv.items?.name || inv.name || 'Roupa';
                const isEq = equippedClothes === name.toLowerCase();
                return (
                  <div key={inv.id || name} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between gap-3 shadow hover:border-slate-700 transition">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          <span>{name}</span>
                          {isEq && <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-amber-900/50 text-amber-300 border border-amber-500/30">Equipada</span>}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">Use para suportar temperaturas do ambiente.</div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const updatedSlots = { ...(character?.equipment_slots || {}) };
                        if (isEq) {
                          updatedSlots.roupa_clima = null;
                        } else {
                          updatedSlots.roupa_clima = name;
                        }
                        if (character) {
                          character.equipment_slots = updatedSlots;
                        }
                        if (forceUpdate) forceUpdate();
                        updateCharacter(character?.id, { equipment_slots: updatedSlots }).then(() => {
                          if (onCharacterUpdated) onCharacterUpdated();
                        }).catch(e => console.warn(e));
                      }}
                      className={`px-3.5 py-2 font-bold text-xs rounded-lg transition shrink-0 cursor-pointer ${
                        isEq ? 'bg-amber-900 text-amber-300 border border-amber-600/50 hover:bg-amber-800' : 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 shadow'
                      }`}
                    >
                      {isEq ? '✓ Despir' : 'Vestir'}
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
};
