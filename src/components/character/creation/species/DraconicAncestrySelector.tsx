import React from 'react';
import { DRACONIC_DAMAGE_TYPES } from '../constants';

interface DraconicAncestrySelectorProps {
  race: string;
  selectedRace: any;
  draconicAncestry: string | undefined;
  setDraconicAncestry: (ancestry: string | undefined) => void;
}

export const DraconicAncestrySelector: React.FC<DraconicAncestrySelectorProps> = ({
  race,
  selectedRace,
  draconicAncestry,
  setDraconicAncestry,
}) => {
  if (race !== 'Draconato') return null;
  if (!selectedRace?.variants || selectedRace.variants.length === 0) return null;

  return (
    <div className="bg-slate-950 p-6 rounded-xl border border-amber-500/30 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🐉</span>
        <div>
          <h3 className="text-lg font-bold text-amber-500">Ancestralidade Dracônica</h3>
          <p className="text-xs text-slate-400">Escolha o tipo de dragão de sua linhagem. Isso afeta seu sopro e resistência.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {selectedRace.variants.map((v: any) => (
          <button
            key={v.name}
            type="button"
            onClick={() => setDraconicAncestry(v.name)}
            className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
              draconicAncestry === v.name 
                ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex-1">
              <div className="font-bold text-sm flex items-center justify-start gap-1.5 flex-wrap">
                <span>{v.name}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 space-y-1 leading-relaxed">
                <div className="flex items-center gap-1.5">
                  <b>Resistência:</b>
                  <span className="text-[9px] bg-slate-950 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-semibold">
                    {DRACONIC_DAMAGE_TYPES[v.name] || v.metadata?.damageType || '---'}
                  </span>
                </div>
                <div className="text-[10px] leading-tight space-y-0.5">
                  <div className="font-bold">Sopro de {DRACONIC_DAMAGE_TYPES[v.name] || '---'}</div>
                  <div>15' Cone / 30' Linha · DES Save (CD 8+Con+Prof)</div>
                  <div>1d10 Dano (aumenta níveis 5, 11, 17)</div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
