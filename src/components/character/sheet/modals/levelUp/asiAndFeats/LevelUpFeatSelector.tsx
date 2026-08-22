import React from 'react';
import { FEATS_REFERENCE } from '../../../../../../lib/api/references';

interface LevelUpFeatSelectorProps {
  character: any;
  selectedFeatName: string;
  setSelectedFeatName: (f: string) => void;
}

export const LevelUpFeatSelector: React.FC<LevelUpFeatSelectorProps> = ({
  character,
  selectedFeatName,
  setSelectedFeatName,
}) => {
  return (
    <div className="space-y-1 pt-0.5">
      <label className="text-[9px] font-bold text-slate-400 uppercase block">
        Selecione o Talento
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 max-h-32 overflow-y-auto pr-1">
        {Object.values(FEATS_REFERENCE)
          .filter((ft: any) => ft.category === 'Geral')
          .map((ft: any) => {
            const isFightingStyleFeat = ft.category === 'Estilo de Luta';
            const charHasFightingStyle = [
              'guerreiro',
              'fighter',
              'paladino',
              'paladin',
              'patrulheiro',
              'ranger',
            ].some(c => (character.class_name || '').toLowerCase().includes(c));
            const isBlocked = isFightingStyleFeat && !charHasFightingStyle;

            return (
              <button
                key={ft.name}
                type="button"
                disabled={isBlocked}
                onClick={() => !isBlocked && setSelectedFeatName(ft.name)}
                className={`p-1 rounded border text-left transition flex flex-col ${
                  isBlocked
                    ? 'bg-slate-950/60 border-slate-900 text-slate-600 cursor-not-allowed opacity-50'
                    : selectedFeatName === ft.name
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-sm ring-1 ring-amber-400'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="font-bold text-[10px] text-amber-300 flex justify-between items-center">
                  <span>{ft.name}</span>
                  {isFightingStyleFeat && (
                    <span className="text-[8px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1 rounded">
                      Estilo
                    </span>
                  )}
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5 leading-tight line-clamp-2">
                  {isBlocked
                    ? '⚠️ Requer característica Estilo de Luta da classe'
                    : ft.description || ft.benefit}
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
};
