import React from 'react';
import { stripLeadingEmoji, shortenCategory } from '../inventoryHelpers';

interface ItemCardHeaderProps {
  itemName: string;
  quantity: number;
  category: 'armaduras' | 'armas' | 'municoes' | 'consumiveis' | 'outros' | 'teste';
  isEquipped: boolean;
  isEquippable: boolean;
  isArmor: boolean;
  isWeapon: boolean;
  isArmorProf: boolean;
  isWeaponProf: boolean;
  heavyReq: { requiresMinStr: boolean; met: boolean; minStr: number };
  character: any;
  priceInfo: any;
}

export const ItemCardHeader: React.FC<ItemCardHeaderProps> = ({
  itemName,
  quantity,
  category,
  isEquipped,
  isEquippable,
  isArmor,
  isWeapon,
  isArmorProf,
  isWeaponProf,
  heavyReq,
  character,
  priceInfo,
}) => {
  const lowerName = itemName.toLowerCase();
  const isRation = category === 'consumiveis' && (lowerName.includes('ração') || lowerName.includes('racao') || lowerName.includes('ration') || lowerName.includes('marmita') || lowerName.includes('comida'));

  const renderCantilCharges = () => {
    if (!lowerName.includes('cantil')) return null;
    const waterResource = (character.class_resources || []).find((r: any) => r.name === "Cantil de Água");
    const maxCapacity = quantity * 10;
    const used = waterResource ? (waterResource.used || 0) : 0;
    const remaining = Math.max(0, maxCapacity - used);
    return (
      <span className="bg-blue-950 text-blue-300 border border-blue-500/50 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shrink-0 ml-1">
        💧 {remaining}/{maxCapacity}
      </span>
    );
  };

  return (
    <div className="font-bold text-xs text-slate-100 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 min-w-0 w-full">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <span className={`font-extrabold truncate text-sm ${isEquipped ? 'text-amber-300' : 'text-slate-100'}`} title={itemName}>
            {stripLeadingEmoji(itemName)}
          </span>
          <span className="bg-slate-800 text-amber-400 border border-slate-700 text-[10px] font-black px-1.5 py-0.5 rounded font-mono shrink-0">
            x{quantity}
          </span>
          {renderCantilCharges()}
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono border shrink-0 ${
          category === 'teste'
            ? 'bg-slate-950 text-amber-400 border-slate-800'
            : isRation
            ? 'bg-amber-950/60 text-amber-300 border-amber-500/30 font-bold'
            : 'bg-slate-950 text-slate-400 border-slate-800'
        }`}>
          {category === 'teste' ? 'Decorativo' : isRation ? '⛺ Acampamento' : category === 'consumiveis' ? 'Consumível' : shortenCategory(priceInfo.category)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {isEquipped ? (
          <span className="text-[9px] uppercase tracking-wider bg-amber-500/25 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-black flex items-center gap-1 shrink-0">
            {isArmor ? '🛡️ Equipado' : isWeapon ? '⚔️ Equipado' : category === 'municoes' ? '🏹 Equipado' : '💡 Equipado'}
          </span>
        ) : (
          <span className="text-[9px] uppercase tracking-wider bg-slate-800/80 text-slate-400 border border-slate-700/60 px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shrink-0">
            🎒 Na Mochila
          </span>
        )}

        {isArmor && (
          isArmorProf ? (
            <span className="text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0">
              ⚡ Proficiente
            </span>
          ) : (
            <span className="text-[9px] uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0">
              ⚠️ Sem Proficiência
            </span>
          )
        )}

        {isWeapon && (
          isWeaponProf ? (
            <span className="text-[9px] uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0">
              ⚡ Proficiente
            </span>
          ) : (
            <span className="text-[9px] uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0">
              ⚠️ Sem Proficiência
            </span>
          )
        )}

        {isArmor && heavyReq.requiresMinStr && !heavyReq.met && (
          <span className="text-[9px] uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shrink-0">
            ⚠️ FOR Insuficiente ({character.strength || 10}/{heavyReq.minStr})
          </span>
        )}

        {category === 'municoes' && (
          <span className="text-[9px] uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0">
            🏹 Munição
          </span>
        )}

        {category === 'consumiveis' && (
          <span className="text-[9px] uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0">
            🧪 Consumível
          </span>
        )}

        {category === 'outros' && (
          isEquipped ? (
            <span className="text-[9px] uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0">
              ⚡ Ativo
            </span>
          ) : isEquippable ? (
            <span className="text-[9px] uppercase tracking-wider bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0">
              💡 Equipável
            </span>
          ) : (
            <span className="text-[9px] uppercase tracking-wider bg-slate-800/60 text-slate-400 border border-slate-700/30 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5 shrink-0">
              📦 Utilitário
            </span>
          )
        )}
      </div>
    </div>
  );
};
