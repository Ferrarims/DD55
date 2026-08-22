import React from 'react';
import {
  FIGHTER_SUBCLASSES,
  FEATS_REFERENCE,
  formatSubclassName,
} from '../../../../../lib/api/references';
import { FIGHTING_STYLES } from '../../constants';

interface ClassFeatureCardProps {
  feat: any;
  character: any;
  selectedSubclass: string;
}

export const ClassFeatureCard: React.FC<ClassFeatureCardProps> = ({
  feat,
  character,
  selectedSubclass,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 p-3.5 rounded-xl space-y-2 transition flex flex-col justify-between">
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md">
              Nível {feat.level}
            </span>
            <h4 className="font-bold text-xs text-slate-100">{feat.name}</h4>
          </div>
          <span className="text-[10px] font-semibold bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded whitespace-nowrap">
            {feat.actionType}
          </span>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed">{feat.description}</p>

        {feat.usageLimit && (
          <div className="text-[10px] text-amber-400/90 italic pt-0.5">
            💡 limite: {feat.usageLimit}
          </div>
        )}
      </div>

      {/* Exibição da Escolha Permanente: Estilo de Luta */}
      {feat.name.includes('Estilo de Luta') && (() => {
        const currentStyleObj = FIGHTING_STYLES.find(fs => fs.name === character.fighting_style);
        return (
          <div className="mt-2 p-3 bg-amber-950/40 border border-amber-500/40 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-200">
                <span className="text-lg">{currentStyleObj?.icon || '⚔️'}</span>
                <div>
                  <div className="text-[10px] uppercase font-bold text-amber-400/80">Talento de Estilo de Luta Selecionado</div>
                  <div className="font-bold text-amber-200 text-sm">
                    {character.fighting_style || 'Não selecionado'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                <span>🔒</span> Permanente
              </span>
            </div>

            {currentStyleObj && (
              <div className="pt-1.5 border-t border-amber-500/20 text-[11px] text-slate-300 leading-relaxed">
                {currentStyleObj.desc}
              </div>
            )}
          </div>
        );
      })()}

      {/* Exibição da Escolha Permanente: Subclasse */}
      {feat.name.includes('Subclasse') && (
        <div className="mt-2 p-2.5 bg-amber-950/50 border border-amber-500/40 rounded-lg flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-200">
            <span className="text-base">🛡️</span>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400/80">Especialização Ativa</div>
              <div className="font-bold text-amber-200">
                {formatSubclassName(
                  FIGHTER_SUBCLASSES[selectedSubclass]?.name ||
                    selectedSubclass ||
                    character.subclass_name ||
                    character.subclass ||
                    'Campeão'
                )}
              </div>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
            <span>🔒</span> Permanente
          </span>
        </div>
      )}

      {/* Exibição da Escolha Permanente: Aumento de Atributo (ASI) */}
      {(feat.name.includes('Aumento') || feat.name.includes('ASI')) &&
        (() => {
          const levelChoice = Array.isArray(character.level_choices)
            ? character.level_choices.find((lc: any) => lc.level === feat.level)
            : null;

          if (levelChoice && levelChoice.asiOrFeat && !levelChoice.asiOrFeat.toLowerCase().includes('nenhum')) {
            const featNameMatch = levelChoice.asiOrFeat.replace('Talento:', '').trim();
            const featInfo =
              FEATS_REFERENCE[featNameMatch] ||
              Object.values(FEATS_REFERENCE).find(
                (f: any) => f.name.toLowerCase() === featNameMatch.toLowerCase()
              );

            return (
              <div className="mt-2 p-2.5 bg-emerald-950/50 border border-emerald-500/40 rounded-lg space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold">
                    <span>✨</span>
                    <span className="uppercase text-[10px] tracking-wider">
                      Escolha Efetuada (Nível {feat.level}):
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                    <span>🔒</span> Permanente
                  </span>
                </div>
                <div className="font-extrabold text-amber-200 text-xs">
                  {levelChoice.asiOrFeat}
                </div>
                {featInfo && (
                  <div className="text-[10px] text-slate-300 pt-1 border-t border-emerald-900/50">
                    <span className="font-bold text-indigo-300">[{featInfo.category}]</span>{' '}
                    {featInfo.description}
                  </div>
                )}
              </div>
            );
          } else {
            return (
              <div className="mt-2 p-2 bg-slate-950/80 border border-amber-500/30 rounded-lg text-xs text-amber-300/80 italic flex items-center justify-between">
                <span>💡 Escolha disponível ao subir para o Nível {feat.level}</span>
              </div>
            );
          }
        })()}
    </div>
  );
};
