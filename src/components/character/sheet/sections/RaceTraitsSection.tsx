import React from 'react';
import {
  RACES_REFERENCE,
  getRaceInfo,
  DRACONIC_ANCESTRIES,
  GIANT_ANCESTRIES,
  BACKGROUNDS_REFERENCE,
  FEATS_REFERENCE
} from '../../../../lib/api/references';

interface RaceTraitsSectionProps {
  character: any;
  getCharacterActiveFeats: (char: any) => string[];
  breathWeaponDetails: any;
}

export const RaceTraitsSection: React.FC<RaceTraitsSectionProps> = ({
  character,
  getCharacterActiveFeats,
  breathWeaponDetails,
}) => {
  const raceKey = character.race?.trim();
  const raceInfo = getRaceInfo(raceKey) || RACES_REFERENCE[raceKey];
  if (!raceInfo || !raceInfo.traits || raceInfo.traits.length === 0) return null;

  const isDragonborn = /draconato|dragonborn/i.test(raceKey || '');
  const isGoliath = /golias|goliath/i.test(raceKey || '');
  const draconicAncestryName = character.draconic_ancestry;
  const ancestry = isDragonborn
    ? DRACONIC_ANCESTRIES.find(
        a =>
          a.name.toLowerCase() === draconicAncestryName?.toLowerCase() ||
          draconicAncestryName?.toLowerCase().includes(a.name.toLowerCase())
      )
    : null;

  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 shadow-xl">
      <div className="border-b border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
          <span>🧬</span> Habilidades de Raça ({raceInfo.name})
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Traços raciais, características anatômicas e poderes ancestrais do seu herói.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {raceInfo.traits.map((trait: any, idx: number) => {
          const traitNameLower = (trait.name || '').toLowerCase();
          const isAncestryTrait =
            isDragonborn && (traitNameLower.includes('herança') || traitNameLower.includes('ancestry'));
          const isGoliathAncestry =
            isGoliath && (traitNameLower.includes('ancestralidade') || traitNameLower.includes('ancestry'));
          const isBreathTrait =
            isDragonborn && (traitNameLower.includes('sopro') || traitNameLower.includes('breath'));
          const isResistanceTrait =
            isDragonborn && (traitNameLower.includes('resistência') || traitNameLower.includes('resistance'));
          const isFlightTrait =
            isDragonborn &&
            (traitNameLower.includes('voo') || traitNameLower.includes('flight') || traitNameLower.includes('asas'));
          const isLargeFormTrait =
            isGoliath && (traitNameLower.includes('forma grande') || traitNameLower.includes('large form'));
          const isBonusActionTrait =
            isFlightTrait ||
            isLargeFormTrait ||
            (trait.type || '').toLowerCase().includes('ação bônus') ||
            (trait.type || '').toLowerCase().includes('bonus action');

          const isHuman = /humano|human/i.test(raceKey || '');
          const isVersatileTrait =
            isHuman && (traitNameLower.includes('versátil') || traitNameLower.includes('versatile'));

          return (
            <div
              key={`${trait.name}-${idx}`}
              className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/30 p-3.5 rounded-xl space-y-2 transition flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                    <span className="text-sky-400">🧬</span>
                    <span>{trait.name || 'Sem nome'}</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-slate-950 text-sky-400 border border-sky-900/40 px-2 py-0.5 rounded whitespace-nowrap">
                    {isGoliathAncestry
                      ? 'Automática'
                      : isBreathTrait
                      ? 'Ataque'
                      : isBonusActionTrait
                      ? 'Ação Bônus'
                      : trait.type || 'Automática'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {trait.description || 'Sem descrição'}
                </p>

                {/* Informações detalhadas da Herança Dracônica */}
                {isAncestryTrait && (
                  <div className="mt-2 p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[11px] space-y-1">
                    <div className="flex justify-between items-center text-amber-200 font-bold">
                      <span>🐉 Herança Escolhida:</span>
                      <span className="text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/40">
                        {ancestry ? `Dragão ${ancestry.name}` : draconicAncestryName || 'Não Selecionada'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300">
                      <span>Elemento / Dano:</span>
                      <span className="font-semibold text-amber-400">{ancestry?.damageType || 'Elemento Elemental'}</span>
                    </div>
                  </div>
                )}

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

                {/* Informações detalhadas do Ataque de Sopro / Baforada */}
                {isBreathTrait && (
                  <div className="mt-2 p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[11px] space-y-1">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-200">
                      <div>
                        🔥 Dano:{' '}
                        <strong className="text-amber-300">
                          {breathWeaponDetails?.damage || '1d10'} (
                          {breathWeaponDetails?.damageType || ancestry?.damageType || 'Elemento'})
                        </strong>
                      </div>
                      <div>
                        🎯 CD Resistência:{' '}
                        <strong className="text-amber-300">
                          CD {breathWeaponDetails?.dc} Destreza (8 + PB + CON)
                        </strong>
                      </div>
                      <div>
                        📐 Formas: <strong className="text-amber-300">Cone 4,5m / Linha 9m</strong>
                      </div>
                      <div>
                        ⚡ Usos Restantes:{' '}
                        <strong className="text-amber-300">
                          {breathWeaponDetails?.pb || 2} / Descanso Longo
                        </strong>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações detalhadas da Resistência a Dano */}
                {isResistanceTrait && (
                  <div className="mt-2 p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-[11px]">
                    <div className="flex justify-between items-center text-emerald-200">
                      <span>🛡️ Resistência Ativa:</span>
                      <strong className="text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/40">
                        Dano de {ancestry?.damageType || 'Elemento da Herança'}
                      </strong>
                    </div>
                  </div>
                )}

                {/* Informações detalhadas do Voo Dracônico */}
                {isFlightTrait && (
                  <div className="mt-2 p-2 bg-sky-950/40 border border-sky-500/30 rounded-lg text-[11px] space-y-1">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-200">
                      <div>
                        ⏳ Duração: <strong className="text-sky-300">100 turnos (10 min)</strong>
                      </div>
                      <div>
                        🕊️ Velocidade: <strong className="text-sky-300">Deslocamento de Voo</strong>
                      </div>
                      <div className="col-span-2">
                        🔄 Cargas: <strong className="text-sky-300">1 uso / Descanso Longo</strong>
                      </div>
                    </div>
                  </div>
                )}

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
              </div>
              {trait.usageLimit && (
                <div className="text-[10px] text-sky-400/90 italic pt-2 border-t border-slate-800">
                  💡 limite: {trait.usageLimit}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
