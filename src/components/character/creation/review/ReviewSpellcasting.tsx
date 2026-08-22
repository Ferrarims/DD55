import React from 'react';

interface ReviewSpellcastingProps {
  isSpellcaster: boolean;
  selectedCantrips: string[];
  selectedSpells: string[];
  charClass: string;
}

export const ReviewSpellcasting: React.FC<ReviewSpellcastingProps> = ({
  isSpellcaster,
  selectedCantrips,
  selectedSpells,
  charClass,
}) => {
  if (!isSpellcaster || (selectedCantrips.length === 0 && selectedSpells.length === 0)) {
    return null;
  }

  return (
    <div className="w-full flex flex-col gap-4 mt-4">
      <div className="w-full bg-slate-900 p-4 rounded-lg border border-slate-800">
        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-2">Magias Conhecidas</span>
        {selectedCantrips.length > 0 && (
          <div className="mb-2">
            <span className="text-[10px] text-slate-400 font-bold">Truques: </span>
            <span className="text-sm text-amber-500">{selectedCantrips.join(', ')}</span>
          </div>
        )}
        {selectedSpells.length > 0 && (
          <div>
            <span className="text-[10px] text-slate-400 font-bold">1º Círculo: </span>
            <span className="text-sm text-amber-500">{selectedSpells.join(', ')}</span>
          </div>
        )}
      </div>

      {selectedSpells.length > 0 && (
        <div className="w-full bg-slate-900 p-4 rounded-lg border border-slate-800">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-2">Espaços de Magia (1º Círculo)</span>
          <div className="flex gap-2">
            {Array.from({ length: charClass === 'Warlock' ? 1 : 2 }).map((_, i) => (
              <label key={i} className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-6 h-6 rounded border-2 border-slate-700 bg-slate-950 text-fuchsia-500 focus:ring-fuchsia-500 focus:ring-offset-slate-900 cursor-pointer accent-fuchsia-500" />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
