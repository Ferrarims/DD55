import React from 'react';
import { getWeaponMasteryDescription } from '../inventoryHelpers';

interface ItemCardStatsProps {
  category: string;
  priceInfo: any;
  calculatedWeightKg: string;
  refInfo: any;
  weaponMastery: string | null;
  isWeaponProf: boolean;
  isArmorProf: boolean;
  isEquipped: boolean;
  isArmor: boolean;
  heavyReq: { requiresMinStr: boolean; met: boolean; minStr: number };
  character: any;
}

export const ItemCardStats: React.FC<ItemCardStatsProps> = ({
  category,
  priceInfo,
  calculatedWeightKg,
  refInfo,
  weaponMastery,
  isWeaponProf,
  isArmorProf,
  isEquipped,
  isArmor,
  heavyReq,
  character,
}) => {
  return (
    <div className="text-[11px] text-slate-400 mt-2 flex flex-col gap-1">
      {category !== 'teste' ? (
        <div className="flex items-center justify-between">
          <span>Preço: <strong className="text-slate-300">{priceInfo.costStr}</strong></span>
          <span>Peso: <strong className="text-slate-300 font-mono">{calculatedWeightKg} kg</strong></span>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span>Função: <strong className="text-slate-300">Apenas Decorativo</strong></span>
        </div>
      )}

      {refInfo?.armor_class && (
        <div className="text-amber-400 font-semibold mt-0.5">
          CA: {refInfo.armor_class}
        </div>
      )}

      {refInfo?.damage && (
        <div className="text-red-400 font-semibold mt-0.5">
          Dano: {refInfo.damage}
        </div>
      )}

      {refInfo?.properties && (
        <div className="text-slate-400 italic mt-0.5">
          Prop: {refInfo.properties}
        </div>
      )}

      {weaponMastery && (
        isWeaponProf ? (
          <div
            className="text-amber-500 font-semibold flex items-center gap-1 cursor-help mt-1"
            title={getWeaponMasteryDescription(weaponMastery)}
          >
            <span>🎯 Maestria:</span>
            <span className="underline decoration-dotted">{weaponMastery}</span>
          </div>
        ) : (
          <div
            className="text-rose-400/80 font-semibold flex items-center gap-1 cursor-help mt-1"
            title="Recurso de Maestria bloqueado porque o personagem não tem proficiência com esta arma."
          >
            <span>🎯 Maestria:</span>
            <span className="line-through">{weaponMastery}</span>
            <span className="text-[9px] bg-rose-950 text-rose-300 border border-rose-800 px-1 rounded ml-1 font-mono">🚫 Bloqueado</span>
          </div>
        )
      )}

      {!isArmorProf && isEquipped && (
        <div className="text-[10px] text-rose-200 bg-rose-950/80 border border-rose-600/80 p-1.5 rounded mt-1 space-y-0.5">
          <div className="font-bold text-rose-300 flex items-center gap-1">
            <span>⚠️</span> Penalidades Ativas (Equipado sem Proficiência):
          </div>
          <p>• Desvantagem em testes, salvaguardas e ataques de FOR e DES.</p>
          <p>• Bloqueio total da conjuração de magias.</p>
        </div>
      )}

      {isArmor && heavyReq.requiresMinStr && !heavyReq.met && isEquipped && (
        <div className="text-[10px] text-amber-200 bg-amber-950/70 border border-amber-600/70 p-1.5 rounded mt-1">
          ⚠️ <strong>Força Insuficiente:</strong> Deslocamento reduzido em -10 pés (-3m / -2 células).
        </div>
      )}

      {!isWeaponProf && (
        <div className="text-[10px] text-rose-200 bg-rose-950/70 border border-rose-800/80 p-1.5 rounded mt-1.5 space-y-0.5">
          ⚠️ <strong>Sem Proficiência:</strong> Bônus de Proficiência (+PB +{character.proficiencyBonus || character.proficiency_bonus || 2}) não é adicionado ao acerto; Recursos de Maestria são bloqueados.
        </div>
      )}
    </div>
  );
};
