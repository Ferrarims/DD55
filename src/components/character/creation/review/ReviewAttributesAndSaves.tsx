import React from 'react';
import { CLASS_REFERENCE } from '../../../../lib/api/references';

interface ReviewAttributesAndSavesProps {
  charClass: string;
  getFinalStat: (stat: string) => number;
  calculateModifier: (score: number) => number;
  selectedSkills: string[];
  selectedTools: string[];
}

export const ReviewAttributesAndSaves: React.FC<ReviewAttributesAndSavesProps> = ({
  charClass,
  getFinalStat,
  calculateModifier,
  selectedSkills,
  selectedTools,
}) => {
  return (
    <>
      <div className="w-full mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="block text-[10px] text-slate-500 uppercase font-bold">Atributos & Salvaguardas</span>
          <span className="text-[8px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded cursor-help group relative">
            <span className="border-b border-dashed border-slate-500">Info: Salvaguardas</span>
            <div className="absolute bottom-full right-0 mb-2 w-52 bg-slate-800 text-slate-300 text-[10px] p-2.5 rounded shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-left">
              <p className="font-bold text-amber-500 mb-1 border-b border-slate-700 pb-1">Regra Oficial</p>
              <p>Diferente de ataques, rolar um 20 natural em uma Salvaguarda ou Teste de Perícia <b>não garante sucesso automático</b>. O resultado final deve atingir a CD.</p>
            </div>
          </span>
        </div>
        <div className="w-full grid grid-cols-3 sm:grid-cols-6 gap-2">
          {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as ('str' | 'dex' | 'con' | 'int' | 'wis' | 'cha')[]).map(stat => {
            const statToPt = { str: 'Força', dex: 'Destreza', con: 'Constituição', int: 'Inteligência', wis: 'Sabedoria', cha: 'Carisma' };
            const savingThrows = (CLASS_REFERENCE as any)[charClass]?.savingThrows || [];
            const isProficient = savingThrows.includes(statToPt[stat]);
            const mod = calculateModifier(getFinalStat(stat));
            const saveMod = mod + (isProficient ? 2 : 0);
            
            return (
              <div key={stat} className={`bg-slate-900 p-2 rounded-lg text-center border ${isProficient ? 'border-blue-500/50 bg-blue-900/10 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'border-slate-800'}`}>
                <span className={`block text-[9px] uppercase font-bold ${isProficient ? 'text-blue-400' : 'text-slate-400'}`}>{stat}</span>
                <span className="font-black text-sm block my-1 text-slate-100">{getFinalStat(stat)}</span>
                <div className="flex flex-col gap-1 items-center">
                  <span className={`text-[9px] font-bold bg-slate-950 px-1.5 rounded ${mod >= 0 ? 'text-slate-300' : 'text-red-400'}`}>
                    MOD: {mod >= 0 ? '+' : ''}{mod}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 rounded ${isProficient ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-950 text-slate-500 border border-transparent'}`}>
                    SALV: {saveMod >= 0 ? '+' : ''}{saveMod}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full mb-6">
        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-2">Proficiências</span>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1.5">Perícias ({selectedSkills.length})</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedSkills.map(s => (
                <span key={s} className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded text-[10px] font-semibold border border-slate-700/50">{s}</span>
              ))}
              {selectedSkills.length === 0 && <span className="text-slate-600 text-[10px]">Nenhuma selecionada</span>}
            </div>
          </div>
          <div>
            <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1.5">Ferramentas ({selectedTools.length})</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedTools.map(t => (
                <span key={t} className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded text-[10px] font-semibold border border-slate-700/50">{t}</span>
              ))}
              {selectedTools.length === 0 && <span className="text-slate-600 text-[10px]">Nenhuma concedida</span>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
