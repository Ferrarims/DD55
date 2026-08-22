import React from 'react';
import { formatEquipmentChoiceDescription } from '../../../lib/mechanics/equipmentParser';

interface ClassQuickStatsProps {
  currentClassData: any;
}

export const ClassQuickStats: React.FC<ClassQuickStatsProps> = ({ currentClassData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Proficiências básicas */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <span>🛡️</span> Proficiências Iniciais
        </h4>
        <div className="space-y-2.5 text-xs text-slate-300">
          <div>
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Salvaguardas</span>
            <div className="flex gap-1.5 flex-wrap">
              {(currentClassData.savingThrows as string[]).map((st, i) => (
                <span key={i} className="bg-slate-900/60 px-2.5 py-1 rounded border border-slate-700/50 text-slate-200">
                  {st}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Armaduras</span>
            <p>{(currentClassData.armor as string[]).join(', ') || 'Nenhuma'}</p>
          </div>
          <div>
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Armas</span>
            <p>{(currentClassData.weapons as string[]).join(', ') || 'Nenhuma'}</p>
          </div>
          {currentClassData.tools && (
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Ferramentas</span>
              <p>{(currentClassData.tools as string[]).join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Perícias e Opções de Equipamento */}
      <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
          <span>🎒</span> Escolhas e Equipamentos
        </h4>
        <div className="space-y-3 text-xs text-slate-300">
          <div>
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-0.5">Perícias de Classe</span>
            <p className="leading-relaxed text-slate-300">{currentClassData.skills}</p>
          </div>
          <div>
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Equipamento Inicial (Opção A)</span>
            <p className="bg-slate-900/40 p-2 rounded border border-slate-750 text-slate-300 leading-relaxed italic">
              {formatEquipmentChoiceDescription(currentClassData.equipmentOptions, 'A')}
            </p>
          </div>
          <div>
            <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Equipamento Inicial (Opção B - Ouro)</span>
            <p className="bg-slate-900/40 p-2 rounded border border-slate-750 text-slate-300 leading-relaxed italic">
              {formatEquipmentChoiceDescription(currentClassData.equipmentOptions, 'B')}
            </p>
          </div>
          {currentClassData.equipmentOptions && (currentClassData.equipmentOptions as any).C && (
            <div>
              <span className="text-slate-500 font-bold uppercase text-[10px] block mb-1">Equipamento Inicial (Opção C)</span>
              <p className="bg-slate-900/40 p-2 rounded border border-slate-750 text-slate-300 leading-relaxed italic">
                {formatEquipmentChoiceDescription(currentClassData.equipmentOptions, 'C')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
