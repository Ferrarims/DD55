import React from 'react';
import {
  GIANT_ANCESTRIES,
  BACKGROUNDS_REFERENCE,
  FEATS_REFERENCE,
} from '../../../../../lib/api/references';

interface GoliathAndHumanTraitDetailsProps {
  isVersatileTrait: boolean;
  isGoliathAncestry: boolean;
  isLargeFormTrait: boolean;
  character: any;
  getCharacterActiveFeats: (char: any) => string[];
}

export const GoliathAndHumanTraitDetails: React.FC<GoliathAndHumanTraitDetailsProps> = ({
  isVersatileTrait,
  isGoliathAncestry,
  isLargeFormTrait,
  character,
  getCharacterActiveFeats,
}) => {
  return (
    <>
      {/* Informações detalhadas do Talento Humano (Versátil) */}
      {isVersatileTrait && (() => {
        const bgName = character.background || '';
        const bgKey =
          Object.keys(BACKGROUNDS_REFERENCE).find(
            k =>
              k.toLowerCase() === bgName.toLowerCase() ||
              BACKGROUNDS_REFERENCE[k].name.toLowerCase() === bgName.toLowerCase()
          ) || '';
        const bgInfo = BACKGROUNDS_REFERENCE[bgKey];
        const bgFeat = bgInfo?.feat || '';

        const allFeats = getCharacterActiveFeats(character);
        const humanFeat = allFeats.find(
          f => FEATS_REFERENCE[f]?.category === 'Origem' && f !== bgFeat
        );

        if (humanFeat) {
          return (
            <div className="mt-2 p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[11px] space-y-1">
              <div className="flex justify-between items-center text-amber-200 font-bold">
                <span>📜 Talento Escolhido:</span>
                <span className="text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/40">
                  {humanFeat}
                </span>
              </div>
              <div className="text-slate-300">
                {FEATS_REFERENCE[humanFeat]?.description || ''}
              </div>
            </div>
          );
        }
        return null;
      })()}

      {/* Informações detalhadas da Ancestralidade Gigante */}
      {isGoliathAncestry && (() => {
        const giantName = character.giant_ancestry || character.giantAncestry;
        const selectedGiant = GIANT_ANCESTRIES.find(
          g => g.name === giantName || g.giantType === giantName
        );
        return (
          <div className="mt-2 p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[11px] space-y-1.5">
            <div className="flex justify-between items-center text-amber-200 font-bold">
              <span>🪨 Linhagem Escolhida:</span>
              <div className="flex items-center gap-1.5">
                {selectedGiant?.actionType && (
                  <span className="text-[10px] font-semibold bg-amber-950 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded whitespace-nowrap">
                    {selectedGiant.actionType}
                  </span>
                )}
                <span className="text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/40">
                  {selectedGiant ? selectedGiant.name : giantName || 'Não Selecionada'}
                </span>
              </div>
            </div>
            {selectedGiant && (
              <>
                <div className="text-slate-300">
                  <strong className="text-amber-400 font-semibold">{selectedGiant.benefitName}:</strong>{' '}
                  {selectedGiant.description}
                </div>
                <div className="text-[10px] text-slate-400 pt-1 border-t border-amber-500/20">
                  🔄 Usos: <strong>Bônus de Proficiência ({character.proficiencyBonus || 2} vezes)</strong> por Descanso Longo.
                </div>
              </>
            )}
          </div>
        );
      })()}

      {/* Informações detalhadas da Forma Grande do Golias */}
      {isLargeFormTrait && (
        <div className="mt-2 p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[11px] space-y-1">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-200">
            <div>
              ⏳ Duração: <strong className="text-amber-300">100 turnos (10 min)</strong>
            </div>
            <div>
              🏃 Deslocamento: <strong className="text-amber-300">+3m (+10 pés)</strong>
            </div>
            <div>
              💪 Benefício: <strong className="text-amber-300">Vantagem em Força</strong>
            </div>
            <div>
              🔄 Cargas: <strong className="text-amber-300">1 uso / Descanso Longo</strong>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
