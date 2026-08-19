import React from 'react';
import { FIGHTER_SUBCLASSES } from '../../../../lib/api/references';
import { FIGHTING_STYLES } from '../constants';

interface PendingLevelChoicesSectionProps {
  hasPendingLevelChoices: boolean;
  hasPendingFightingStyle: boolean;
  hasPendingSubclass: boolean;
  pendingFightingStyle: string;
  setPendingFightingStyle: (s: string) => void;
  pendingSubclass: string;
  setPendingSubclass: (s: string) => void;
  handleSavePendingChoices: () => void;
  isSavingPendingChoices: boolean;
  character: any;
}

export const PendingLevelChoicesSection: React.FC<PendingLevelChoicesSectionProps> = ({
  hasPendingLevelChoices,
  hasPendingFightingStyle,
  hasPendingSubclass,
  pendingFightingStyle,
  setPendingFightingStyle,
  pendingSubclass,
  setPendingSubclass,
  handleSavePendingChoices,
  isSavingPendingChoices,
  character,
}) => {
  if (!hasPendingLevelChoices) return null;

  return (
    <div className="bg-slate-950 border-2 border-amber-500/80 rounded-2xl p-5 space-y-4 shadow-2xl animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b border-amber-500/40 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚠️</span>
          <div>
            <h2 className="text-base font-black text-amber-300" style={{ fontFamily: 'Georgia, serif' }}>
              ESCOLHAS PENDENTES DO SEU NÍVEL (NÍVEL {character.level || 1})
            </h2>
            <p className="text-xs text-amber-200/90">
              Você possui escolhas táticas pendentes do seu personagem. Escolha agora — após a confirmação, elas serão <strong>travadas permanentemente</strong> na sua ficha.
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2.5 py-1 rounded-full font-bold uppercase">
          🔒 Escolha Permanente
        </span>
      </div>

      {hasPendingFightingStyle && (
        <div className="space-y-2">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>⚔️</span> Escolha o Estilo de Luta (Permanente)
          </label>
          <p className="text-xs text-slate-300">
            Selecione a especialidade de combate que reflete o treinamento do seu herói:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
            {FIGHTING_STYLES.map(fs => (
              <button
                key={fs.id}
                type="button"
                disabled={fs.disabled}
                onClick={() => !fs.disabled && setPendingFightingStyle(fs.name)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  fs.disabled
                    ? 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-60 cursor-not-allowed'
                    : pendingFightingStyle === fs.name
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-100">{fs.name}</div>
                  {fs.disabled && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-slate-900 text-amber-400 border border-amber-500/30">
                      🔒 Em Grupo
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight mt-1">{fs.disabledReason || fs.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {hasPendingSubclass && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>🛡️</span> Escolha a Subclasse (Permanente - Nível 3+)
          </label>
          <p className="text-xs text-slate-300">
            Selecione sua especialização de classe para ativar novos recursos em combate:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {Object.entries(FIGHTER_SUBCLASSES).map(([subKey, subInfo]: [string, any]) => (
              <button
                key={subKey}
                type="button"
                onClick={() => setPendingSubclass(subKey)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  pendingSubclass === subKey
                    ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="font-bold text-xs text-amber-300">{subInfo.name}</div>
                <div className="text-[10px] text-slate-400 leading-tight mt-1">{subInfo.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={handleSavePendingChoices}
          disabled={isSavingPendingChoices}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xl transition flex items-center gap-2 border border-emerald-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <span>🔒 Confirmar e Travar Escolhas Permanentemente</span>
        </button>
      </div>
    </div>
  );
};
