import React from 'react';
import {
  RACES_REFERENCE,
  getRaceInfo,
  DRACONIC_ANCESTRIES,
  GIANT_ANCESTRIES,
} from '../../../../lib/api/references';
import { RaceTraitCard } from './racialTraits/RaceTraitCard';

interface RaceTraitsSectionProps {
  character: any;
  getCharacterActiveFeats: (char: any) => string[];
  breathWeaponDetails: any;
  racialResources?: any[];
}

export const RaceTraitsSection: React.FC<RaceTraitsSectionProps> = ({
  character,
  getCharacterActiveFeats,
  breathWeaponDetails,
  racialResources = [],
}) => {
  const raceKey = character.race?.trim();
  const raceInfo = getRaceInfo(raceKey) || RACES_REFERENCE[raceKey];
  if (!raceInfo || !raceInfo.traits || raceInfo.traits.length === 0) return null;

  const isDragonborn = /draconato|dragonborn/i.test(raceKey || '');
  const isGoliath = /golias|goliath/i.test(raceKey || '');
  const draconicAncestryName = character.draconic_ancestry;
  const giantAncestryName = character.giant_ancestry || character.giantAncestry;

  const ancestry = isDragonborn
    ? DRACONIC_ANCESTRIES.find(
        a =>
          a.name.toLowerCase() === draconicAncestryName?.toLowerCase() ||
          draconicAncestryName?.toLowerCase().includes(a.name.toLowerCase())
      )
    : null;

  const giantAncestry = isGoliath
    ? GIANT_ANCESTRIES.find(
        g =>
          g.name.toLowerCase() === giantAncestryName?.toLowerCase() ||
          g.giantType.toLowerCase() === giantAncestryName?.toLowerCase() ||
          giantAncestryName?.toLowerCase().includes(g.name.toLowerCase()) ||
          giantAncestryName?.toLowerCase().includes(g.giantType.toLowerCase())
      )
    : null;

  return (
    <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-sky-500/30 space-y-4 shadow-xl">
      {/* Header Unificado da Raça */}
      <div className="border-b border-slate-800/80 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-slate-900 border border-sky-500/30 p-2 rounded-xl flex items-center justify-center shadow-inner">
              {raceInfo.icon || '🧬'}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-sky-400 uppercase tracking-wider">
                  Raça: {raceInfo.name}
                </h3>
                {ancestry && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-medium">
                    🐉 {ancestry.name} ({ancestry.damageType})
                  </span>
                )}
                {giantAncestry && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 font-medium">
                    🗿 {giantAncestry.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Traços raciais, características anatômicas e poderes ancestrais do seu herói.
              </p>
            </div>
          </div>

          {/* Badges de Atributos Físicos Raciais */}
          <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
            {raceInfo.creatureType && (
              <span className="text-[11px] px-2 py-0.5 bg-slate-900 text-slate-300 rounded-md border border-slate-800">
                Tipo: <strong>{raceInfo.creatureType}</strong>
              </span>
            )}
            {raceInfo.size && (
              <span className="text-[11px] px-2 py-0.5 bg-slate-900 text-slate-300 rounded-md border border-slate-800">
                Tamanho: <strong>{raceInfo.size}</strong>
              </span>
            )}
            {raceInfo.speed && (
              <span className="text-[11px] px-2 py-0.5 bg-slate-900 text-slate-300 rounded-md border border-slate-800">
                Vel: <strong>{raceInfo.speed}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Se houver recursos e poderes raciais ativos com contador de cargas */}
      {racialResources && racialResources.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400/90 flex items-center gap-1.5">
            <span>⚡</span> Poderes e Recursos Raciais Ativos
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {racialResources.map((res: any, idx: number) => {
              const resetLabel =
                res.reset === 'short'
                  ? 'Descanso Curto'
                  : res.reset === 'long'
                  ? 'Descanso Longo'
                  : res.reset === 'turn'
                  ? 'A cada turno'
                  : res.reset || 'Descanso Longo';
              const actionCost = res.action || 'Ação';
              const usedCharges = res.used || 0;
              const remaining = Math.max(0, (res.max || 1) - usedCharges);

              return (
                <div
                  key={res.id || `${res.name || 'res'}-${idx}`}
                  className="bg-slate-900 border border-sky-500/20 hover:border-sky-500/40 p-3 rounded-xl flex flex-col justify-between transition shadow-md gap-2"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                        <span className="text-sky-400">✨</span>
                        <span>{res.name}</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/30 whitespace-nowrap">
                        {actionCost}
                      </span>
                    </div>

                    {res.description && (
                      <p className="text-[11px] text-slate-300 leading-tight">
                        {res.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">
                        Recarrega: <strong className="text-slate-200">{resetLabel}</strong>
                      </span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded border ${
                          remaining > 0
                            ? 'text-sky-300 bg-sky-950/40 border-sky-500/30'
                            : 'text-red-400 bg-red-950/40 border-red-500/30'
                        }`}
                      >
                        Cargas: {remaining} / {res.max || 1}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Grid com Todos os Traços Raciais */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <span>📜</span> Traços e Características Raciais
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {raceInfo.traits.map((trait: any, idx: number) => (
            <RaceTraitCard
              key={`${trait.name}-${idx}`}
              trait={trait}
              idx={idx}
              raceKey={raceKey}
              isDragonborn={isDragonborn}
              isGoliath={isGoliath}
              character={character}
              ancestry={ancestry}
              draconicAncestryName={draconicAncestryName}
              breathWeaponDetails={breathWeaponDetails}
              getCharacterActiveFeats={getCharacterActiveFeats}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
