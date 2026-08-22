import React from 'react';
import { parseEquipmentToList } from '../../../../lib/mechanics/xpAndLootManager';

interface HeroTraitsAndEquipmentProps {
  entity: any;
  character: any;
}

export const HeroTraitsAndEquipment: React.FC<HeroTraitsAndEquipmentProps> = ({
  entity,
  character,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Talentos e Características */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <h5 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider border-b border-slate-800 pb-1">
          ✨ Talentos & Traços de Raça
        </h5>
        <div className="text-[11px] text-slate-300 leading-relaxed space-y-1.5">
          {character?.feats && character.feats.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {character.feats.map((feat: string, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-blue-500/15 text-blue-300 border border-blue-500/25 rounded-md text-[10px] font-semibold">
                  {feat}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-slate-500 italic">Nenhum talento ou traço adicional listado na ficha.</div>
          )}
        </div>
      </div>

      {/* Equipamentos e Armas */}
      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <h5 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1">
          ⚔️ Equipamentos & Ataques
        </h5>
        <div className="text-[11px] text-slate-300 space-y-1">
          <div>
            <strong className="text-slate-400">Ataque Selecionado:</strong> <span className="text-amber-300 font-semibold">{entity.damageDice}</span> (Bônus: +{entity.attackBonus})
          </div>
          <div className="mt-2 text-[10px] text-slate-400">
            <strong className="text-slate-400 block mb-1">Itens de Combate Equipados:</strong>
            <div className="max-h-[80px] overflow-y-auto space-y-0.5">
              {parseEquipmentToList(character?.equipment || []).map((eq, i) => (
                <div key={i} className="bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800/80">
                  🛡️ {eq}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
