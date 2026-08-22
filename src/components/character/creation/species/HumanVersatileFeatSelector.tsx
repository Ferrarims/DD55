import React from 'react';
import { FEATS_REFERENCE } from '../../../../lib/api/references';

interface HumanVersatileFeatSelectorProps {
  race: string;
  bgFeatsList: string[];
  humanFeat: string;
  setHumanFeat: (feat: string) => void;
}

export const HumanVersatileFeatSelector: React.FC<HumanVersatileFeatSelectorProps> = ({
  race,
  bgFeatsList,
  humanFeat,
  setHumanFeat,
}) => {
  if (race !== 'Humano' && race !== 'Human') return null;

  const featIcons: Record<string, string> = {
    'Alerta': '👁️',
    'Artifista': '🛠️',
    'Atacante Selvagem': '⚔️',
    'Curandeiro': '💊',
    'Habilidoso': '🎓',
    'Iniciado em Magia': '✨',
    'Músico': '🎶',
    'Sortudo': '🍀',
    'Valentão de Taverna': '🥊',
    'Vigoroso': '❤️'
  };

  return (
    <div className="bg-slate-950 p-6 rounded-xl border border-amber-500/30 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">👤</span>
        <div>
          <h3 className="text-lg font-bold text-amber-500">Talento de Origem Extra (Versátil)</h3>
          <p className="text-xs text-slate-400">
            A característica racial <strong className="text-amber-400">Versátil</strong> do Humano permite escolher um Talento de Origem adicional no Nível 1.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.values(FEATS_REFERENCE)
          .filter(f => f.category === 'Origem')
          .map(feat => {
            const isBgFeat = bgFeatsList.includes(feat.name.trim().toLowerCase());
            const isSelected = !isBgFeat && humanFeat === feat.name;

            return (
              <button
                key={feat.name}
                type="button"
                disabled={isBgFeat}
                onClick={() => {
                  if (!isBgFeat) setHumanFeat(feat.name);
                }}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  isBgFeat
                    ? 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-50 cursor-not-allowed'
                    : isSelected 
                      ? 'bg-amber-500/10 border-amber-500 text-amber-500 cursor-pointer shadow-lg shadow-amber-500/5' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 cursor-pointer'
                }`}
              >
                <span className="text-2xl mt-0.5">{featIcons[feat.name] || '📜'}</span>
                <div className="flex-1">
                  <div className="font-bold text-sm flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1.5">
                      {feat.name}
                    </span>
                    {isBgFeat ? (
                      <span className="text-[9px] bg-red-950/40 text-red-400 px-1.5 py-0.5 rounded border border-red-800/40 font-semibold shrink-0">
                        🔒 Já no Antecedente
                      </span>
                    ) : isSelected ? (
                      <span className="text-[9px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-black shrink-0">
                        SELECIONADO
                      </span>
                    ) : null}
                  </div>
                  <div className={`text-[10px] mt-1 leading-relaxed ${isBgFeat ? 'text-slate-600' : 'text-slate-500'}`}>
                    {feat.description}
                  </div>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
};
