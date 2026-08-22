import React from 'react';
import { FIGHTER_SUBCLASSES } from '../../../../../lib/api/references';

export interface LevelUpSubclassChoiceProps {
  needsSubclassChoice: boolean;
  subclassLevel: number;
  levelUpSubclass: string;
  setLevelUpSubclass: (sub: string) => void;
}

export const LevelUpSubclassChoice: React.FC<LevelUpSubclassChoiceProps> = ({
  needsSubclassChoice,
  subclassLevel,
  levelUpSubclass,
  setLevelUpSubclass,
}) => {
  if (!needsSubclassChoice) return null;

  return (
    <div className="bg-slate-950/90 p-2.5 rounded-lg border border-amber-500/40 space-y-1.5">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
          <span>🛡️</span> Escolha de Subclasse (Nível {subclassLevel}+)
        </h3>
        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 py-0.5 rounded font-bold">
          Permanente
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {Array.from(
          new Map(
            Object.entries(FIGHTER_SUBCLASSES).map(([subKey, subInfo]: [string, any]) => [
              subInfo.name,
              { subKey, subInfo },
            ])
          ).values()
        ).map(({ subKey, subInfo }) => {
          const isSelected =
            levelUpSubclass === subKey ||
            levelUpSubclass === subInfo.name ||
            (levelUpSubclass === 'Champion' && subInfo.id === 'Champion');
          const icon =
            subInfo.id === 'BattleMaster' || subKey.includes('Battle') || subInfo.name.includes('Batalha')
              ? '🎯'
              : subInfo.id === 'Champion' || subKey.includes('Champion') || subInfo.name.includes('Campe')
              ? '🏆'
              : subInfo.id === 'EldritchKnight' || subKey.includes('Eldritch') || subInfo.name.includes('Arcano') || subInfo.name.includes('Místico')
              ? '⚡'
              : '🧠';
          const level3Features = subInfo.features?.filter((f: any) => f.level === 3) || [];

          return (
            <button
              key={subKey}
              type="button"
              onClick={() => setLevelUpSubclass(subKey)}
              className={`p-2.5 rounded-lg border text-left transition flex flex-col justify-between gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/80'
                  : 'bg-slate-900 border-slate-800 hover:border-amber-500/40 text-slate-400'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <div className="font-bold text-[11px] text-amber-300 flex items-center gap-1.5">
                    <span>{icon}</span>
                    <span className="leading-tight">{subInfo.name}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[9px] font-black bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider flex-shrink-0">
                      ✓ Selecionada
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-300 leading-snug line-clamp-2">
                  {subInfo.description}
                </p>
              </div>

              {level3Features.length > 0 && (
                <div className="pt-1.5 border-t border-slate-800/80 space-y-0.5">
                  <span className="text-[9px] font-bold text-amber-400/90 uppercase tracking-wider block">
                    Recursos de Nível 3:
                  </span>
                  <div className="text-[9px] text-slate-300 font-medium space-y-0.5">
                    {level3Features.map((f: any, fIdx: number) => (
                      <div key={fIdx} className="truncate">
                        • <strong className="text-amber-200">{f.name}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
