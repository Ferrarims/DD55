import React from 'react';
import { FIGHTING_STYLES } from '../../constants';

export interface LevelUpFightingStyleChoiceProps {
  needsFightingStyleChoice: boolean;
  character: any;
  levelUpFightingStyle: string;
  setLevelUpFightingStyle: (fs: string) => void;
}

export const LevelUpFightingStyleChoice: React.FC<LevelUpFightingStyleChoiceProps> = ({
  needsFightingStyleChoice,
  character,
  levelUpFightingStyle,
  setLevelUpFightingStyle,
}) => {
  if (!needsFightingStyleChoice) return null;

  return (
    <div className="bg-slate-950/90 p-3 rounded-lg border border-amber-500/30 space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-1.5">
        <div>
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚔️</span> Estilo de Luta do Guerreiro (Talentos de Combate)
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Versatilidade Marcial: Você pode manter seu estilo atual ou trocá-lo ao avançar de nível.
          </p>
        </div>
        <span className="text-[10px] bg-slate-900 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-medium">
          {character.fighting_style
            ? levelUpFightingStyle === character.fighting_style
              ? `Estilo Atual: ${character.fighting_style}`
              : `Trocando: ${character.fighting_style} ➔ ${levelUpFightingStyle}`
            : 'Escolha de Nível'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {FIGHTING_STYLES.map(fs => {
          const isSelected = levelUpFightingStyle === fs.name;
          const isCurrent = character.fighting_style === fs.name;

          return (
            <button
              key={fs.id}
              type="button"
              disabled={fs.disabled}
              onClick={() => !fs.disabled && setLevelUpFightingStyle(fs.name)}
              className={`p-3 rounded-lg border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                fs.disabled
                  ? 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                  : isSelected
                  ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400 font-medium'
                  : 'bg-slate-900 border-slate-800 hover:border-amber-500/40 text-slate-400'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-base shrink-0">{(fs as any).icon || '⚔️'}</span>
                    <span className={`font-bold text-xs leading-tight ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                      {fs.name}
                    </span>
                  </div>
                  {fs.disabled ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-amber-400 border border-amber-500/30 shrink-0">
                      🔒 Em Grupo
                    </span>
                  ) : isSelected ? (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-bold shrink-0">
                      ✓ {isCurrent ? 'Atual' : 'Novo'}
                    </span>
                  ) : null}
                </div>

                <div className="text-[10.5px] text-slate-300 leading-relaxed">
                  {fs.disabled ? fs.disabledReason || fs.desc : fs.desc}
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400">
                <span className="text-amber-400/80 font-medium">Talento de Estilo de Luta</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
