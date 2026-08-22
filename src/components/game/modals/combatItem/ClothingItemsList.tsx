import React from 'react';
import { updateCharacter } from '../../../../lib/api/characterService';

interface ClothingItemsListProps {
  character: any;
  entities: any[];
  onCharacterUpdated?: () => void;
  forceUpdate?: () => void;
}

export const ClothingItemsList: React.FC<ClothingItemsListProps> = ({
  character,
  entities,
  onCharacterUpdated,
  forceUpdate,
}) => {
  const hasLivingMonstersForClothes = entities.some(e => e.type === 'monster' && e.currentHp > 0 && !e.isDead);
  if (hasLivingMonstersForClothes) return null;

  const clothingItems = (character?.character_inventory || []).filter((inv: any) => {
    const name = (inv.item?.name || inv.items?.name || inv.name || '').toLowerCase();
    return /roupa|veste|traje|manto/.test(name);
  });
  if (clothingItems.length === 0) return null;

  const equippedClothes = (character?.equipment_slots?.roupa_clima || '').toLowerCase();

  return (
    <div className="pt-3 border-t border-slate-800 space-y-2.5">
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
};
