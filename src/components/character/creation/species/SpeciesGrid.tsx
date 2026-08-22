import React from 'react';

interface SpeciesGridProps {
  races: any[];
  race: string;
  setRace: (race: string) => void;
  setDraconicAncestry: (ancestry: string | undefined) => void;
  setGiantAncestry: (ancestry: string | undefined) => void;
}

export const SpeciesGrid: React.FC<SpeciesGridProps> = ({
  races,
  race,
  setRace,
  setDraconicAncestry,
  setGiantAncestry,
}) => {
  return (
    <div>
      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Escolha sua Espécie</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {races.map((r, rIdx) => {
          const isBlocked = r.id === 'Elfo' || r.id === 'Gnomo' || r.id === 'Tiferino';
          return (
            <button
              key={`${r.id || r.name}-${rIdx}`}
              disabled={isBlocked}
              onClick={() => {
                if (isBlocked) return;
                setRace(r.id);
                if (r.id !== 'Draconato') setDraconicAncestry(undefined);
                if (r.id !== 'Golias' && r.id !== 'Goliath') setGiantAncestry(undefined);
              }}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                isBlocked 
                  ? 'opacity-40 cursor-not-allowed bg-slate-950/40 border-slate-900 text-slate-600'
                  : race === r.id 
                    ? 'bg-amber-500/10 border-amber-500 text-amber-500 cursor-pointer' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-600 cursor-pointer'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className={`text-4xl ${isBlocked ? 'grayscale opacity-50' : ''}`}>{r.icon}</span>
                <span className="font-bold text-lg flex items-center gap-1.5 text-slate-100">
                  {r.name}
                  {isBlocked && <span className="text-[10px] bg-red-500/10 text-red-500 px-1 rounded border border-red-500/20">🔒 Bloqueado</span>}
                </span>
              </div>
              
              {!isBlocked && (
                <div className="text-left text-sm text-slate-300 w-full space-y-1.5 border-t border-slate-800 pt-4 mt-2">
                  <p><span className="text-slate-500">Tamanho:</span> {r.size}</p>
                  <p><span className="text-slate-500">Deslocamento:</span> {r.speed}</p>
                  <p><span className="text-slate-500">Habilidades:</span> {r.traits.map((t: any) => t.name).join(', ')}</p>
                </div>
              )}
              {isBlocked && <span className="text-xs text-center opacity-60 mt-4 border-t border-slate-800 pt-4 w-full">Temporariamente indisponível</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};
