import React from 'react';

interface LevelUpFeaturesListProps {
  nextLevel: number;
  nextProgression: any;
  newFeaturesText: string;
}

export const LevelUpFeaturesList: React.FC<LevelUpFeaturesListProps> = ({
  nextLevel,
  nextProgression,
  newFeaturesText,
}) => {
  return (
    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
      <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
        <span>✨</span> Habilidades (Nível {nextLevel})
      </h3>
      <div className="bg-slate-900 p-2 rounded border border-slate-800 space-y-1.5 max-h-36 overflow-y-auto">
        {Array.isArray(nextProgression?.features) && nextProgression.features.length > 0 ? (
          nextProgression.features.map((feat: any, idx: number) => {
            const featName =
              typeof feat === 'string'
                ? feat
                : feat?.name || 'Habilidade de Classe';
            const featDesc =
              typeof feat === 'object' && feat?.description ? feat.description : null;
            return (
              <div key={idx} className="flex flex-col text-[10px]">
                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                  <span className="text-amber-400">•</span>
                  <span>{featName}</span>
                </div>
                {featDesc && (
                  <p className="text-[9px] text-slate-400 pl-3 leading-snug line-clamp-2">
                    {featDesc}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-[10px] font-bold text-slate-100 flex items-start gap-1">
            <span className="text-amber-400">•</span>
            <span>
              {typeof newFeaturesText === 'string'
                ? newFeaturesText
                : 'Recursos de classe atualizados para o novo nível.'}
            </span>
          </div>
        )}
      </div>

      {(nextProgression as any)?.spellSlots && (
        <div className="text-[9px] bg-purple-950/50 border border-purple-800/50 p-1.5 rounded text-purple-200">
          ✨ <strong>Espaços de Magia:</strong> Atualizados para o Nível {nextLevel}!
        </div>
      )}
    </div>
  );
};
