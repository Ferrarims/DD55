import React from 'react';

export interface UsableItem {
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

interface ConsumableItemsListProps {
  character: any;
  usableInventoryItems: UsableItem[];
  itemQuantities: Record<string, number>;
  totalRationsCount: number;
  activeEntity: any;
  entities: any[];
  handleUseItem: (item: any) => void;
}

export const ConsumableItemsList: React.FC<ConsumableItemsListProps> = ({
  character,
  usableInventoryItems,
  itemQuantities,
  totalRationsCount,
  activeEntity,
  entities,
  handleUseItem,
}) => {
  return (
    <div className="space-y-2.5">
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
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-2">
          <span className="text-2xl block">🎒</span>
          <p className="text-xs text-slate-400">
            Nenhum consumível encontrado na bolsa de <strong className="text-amber-300">{character?.name || 'seu personagem'}</strong>.
          </p>
          <button
            onClick={() => handleUseItem({
              name: 'Poção de Cura',
              icon: '🧪',
              actionCost: 'bonus',
              effectType: 'heal_minor'
            })}
            disabled={!activeEntity?.hasBonusAction || activeEntity?.currentHp >= activeEntity?.maxHp}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition disabled:opacity-40 cursor-pointer"
          >
            🧪 Usar Poção de Cura de Emergência (2d4+2)
          </button>
        </div>
      )}
    </div>
  );
};
