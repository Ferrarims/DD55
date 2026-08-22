import React from 'react';
import { GIANT_ANCESTRIES_INFO } from '../constants';

interface GiantAncestrySelectorProps {
  race: string;
  selectedRace: any;
  giantAncestry: string | undefined;
  setGiantAncestry: (ancestry: string | undefined) => void;
}

export const GiantAncestrySelector: React.FC<GiantAncestrySelectorProps> = ({
  race,
  selectedRace,
  giantAncestry,
  setGiantAncestry,
}) => {
  if (race !== 'Golias' && race !== 'Goliath') return null;
  if (!selectedRace?.variants || selectedRace.variants.length === 0) return null;

  return (
    <div className="bg-slate-950 p-6 rounded-xl border border-amber-500/30 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🪨</span>
        <div>
          <h3 className="text-lg font-bold text-amber-500">Ancestralidade Gigante</h3>
          <p className="text-xs text-slate-400">Escolha um dos benefícios de sua linhagem ancestral de gigantes.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {selectedRace.variants.map((v: any) => (
          <button
            key={v.name}
            type="button"
            onClick={() => setGiantAncestry(v.name)}
            className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
              giantAncestry === v.name 
                ? 'bg-amber-500/10 border-amber-500 text-amber-500' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
            }`}
          >
            <div className="flex-1">
              <div className="font-bold text-sm flex items-center justify-between gap-1.5 flex-wrap">
                <span>{v.name}</span>
                {giantAncestry === v.name && <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black shrink-0">SELECIONADO</span>}
              </div>
              <div className="text-[10px] text-slate-400 mt-2 space-y-1 leading-relaxed">
                <div className="flex items-center gap-1.5">
                  <b className="text-amber-500">{GIANT_ANCESTRIES_INFO[v.name]?.benefit || v.description}</b>
                </div>
                <div className="text-[10px] leading-tight text-slate-500">
                  {GIANT_ANCESTRIES_INFO[v.name]?.description || v.metadata?.description || ''}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
