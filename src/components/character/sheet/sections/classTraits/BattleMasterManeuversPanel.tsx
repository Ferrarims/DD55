import React from 'react';
import { FIGHTER_SUBCLASSES } from '../../../../../lib/api/references';

interface BattleMasterManeuversPanelProps {
  selectedSubclass: string;
  handleUseManeuver: (name: string, desc: string) => void;
}

export const BattleMasterManeuversPanel: React.FC<BattleMasterManeuversPanelProps> = ({
  selectedSubclass,
  handleUseManeuver,
}) => {
  const isBattleMaster = selectedSubclass === 'BattleMaster' ||
    (FIGHTER_SUBCLASSES[selectedSubclass]?.name || '').includes('Batalha');

  if (!isBattleMaster) return null;

  return (
    <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl space-y-3 mt-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 text-lg">🎯</span>
          <div>
            <h4 className="font-black text-xs text-amber-300 uppercase tracking-wider">
              Manobras de Mestre da Batalha (20 Manobras Táticas)
            </h4>
            <p className="text-[11px] text-slate-400">
              Clique em qualquer manobra para gastar 1 Dado de Superioridade e executar a ação tática em combate.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {FIGHTER_SUBCLASSES.BattleMaster.maneuvers?.map((man, mIdx) => (
          <div
            key={(man as any).id || `${man.name}-${mIdx}`}
            className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between gap-2 hover:border-amber-400/50 transition"
          >
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-100">
                <span>{man.name}</span>
                <span className="text-[9px] bg-slate-900 text-amber-400 border border-slate-700 px-1.5 py-0.2 rounded">
                  {man.actionType}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 leading-tight">{man.description}</p>
            </div>

            <button
              type="button"
              onClick={() => handleUseManeuver(man.name, man.description)}
              className="w-full py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/40 font-bold text-[10px] rounded transition active:scale-95 flex items-center justify-center gap-1"
            >
              <span>🎯 Executar Manobra</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
