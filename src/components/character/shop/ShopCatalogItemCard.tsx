import React from 'react';
import { ShopCatalogItem } from '../../../types/item';
import {
  stripLeadingEmoji,
  getWeaponMastery,
  getWeaponMasteryDescription,
} from './shopWeaponMasteryUtils';

interface ShopCatalogItemCardProps {
  item: ShopCatalogItem;
  idx: number;
  currentGoldNumber: number;
  handleBuyItem: (item: ShopCatalogItem) => void;
  formatGold: (num: number) => string;
}

export const ShopCatalogItemCard: React.FC<ShopCatalogItemCardProps> = ({
  item,
  idx,
  currentGoldNumber,
  handleBuyItem,
  formatGold,
}) => {
  const canAfford = currentGoldNumber >= item.pricePO;
  const weaponMastery = getWeaponMastery(item.name);

  return (
    <div
      key={item.id || `${item.name}-${idx}`}
      className="bg-slate-900 border border-slate-800/90 hover:border-emerald-500/40 p-3 rounded-xl flex flex-col justify-between gap-2 transition shadow-sm"
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="font-bold text-xs text-slate-100">{stripLeadingEmoji(item.name)}</span>
          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 whitespace-nowrap">
            {item.cost}
          </span>
        </div>

        <div className="text-[10px] text-slate-400 mt-1 space-y-0.5">
          <div className="flex items-center justify-between">
            <span>Cat: {item.category}</span>
            {item.weight && <span>Peso: {item.weight}</span>}
          </div>
          {item.damage && <div className="text-red-400 font-semibold">Dano: {item.damage}</div>}
          {item.armor_class && <div className="text-amber-400 font-semibold">CA: {item.armor_class}</div>}
          {item.properties && <div className="text-slate-400 italic">Prop: {item.properties}</div>}
          {weaponMastery && (
            <div
              className="text-amber-500 font-semibold flex items-center gap-1 cursor-help mt-0.5"
              title={getWeaponMasteryDescription(weaponMastery)}
            >
              <span>🎯 Maestria:</span>
              <span className="underline decoration-dotted">{weaponMastery}</span>
            </div>
          )}
        </div>
      </div>

      {/* Botão de Compra */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400">
          Revenda: <span className="text-emerald-400 font-bold">{item.sellPricePO} PO</span>
        </span>

        <button
          type="button"
          onClick={() => handleBuyItem(item)}
          disabled={!canAfford}
          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition flex items-center gap-1 ${
            canAfford
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow active:scale-95'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
          title={
            canAfford
              ? `Comprar ${item.name} por ${item.cost}`
              : `Moedas insuficientes (${formatGold(currentGoldNumber)} < ${item.cost})`
          }
        >
          <span>🛒 Comprar</span>
        </button>
      </div>
    </div>
  );
};
