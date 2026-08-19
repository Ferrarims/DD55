import React from 'react';
import {
  FIGHTER_SUBCLASSES,
  getFighterFeaturesForLevel,
  FEATS_REFERENCE,
  formatSubclassName,
} from '../../../../lib/api/references';

interface ClassTraitsSectionProps {
  character: any;
  selectedSubclass: string;
  handleUseManeuver: (name: string, desc: string) => void;
  handleUsePsiPower?: (power: string, desc: string) => void;
}

export const ClassTraitsSection: React.FC<ClassTraitsSectionProps> = ({
  character,
  selectedSubclass,
  handleUseManeuver,
  handleUsePsiPower,
}) => {
  const isFighter =
    (character.class_name || '').toLowerCase().includes('guerreiro') ||
    (character.class_name || '').toLowerCase().includes('fighter');

  if (!isFighter) return null;

  return (
    <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 space-y-4 shadow-xl">
      {/* Header e Seleção de Subclasse */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3
            className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            <span>⚔️</span> Habilidades de Classe &amp; Subclasse (2024 PHB)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Todas as características marciais e escolhas permanentes desbloqueadas.
          </p>
        </div>
      </div>

      {/* Grid de Habilidades da Classe Obtidas por Nível */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {getFighterFeaturesForLevel(character.level || 1, selectedSubclass).map((feat, idx) => (
          <div
            key={(feat as any).id || `${feat.name}-${feat.level}-${idx}`}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 p-3.5 rounded-xl space-y-2 transition flex flex-col justify-between"
          >
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

            {/* Exibição da Escolha Permanente dentro do Quadro da Habilidade: Estilo de Luta */}
            {feat.name.includes('Estilo de Luta') && (
              <div className="mt-2 p-2.5 bg-amber-950/50 border border-amber-500/40 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-200">
                  <span className="text-base">⚔️</span>
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-400/80">Opção Escolhida</div>
                    <div className="font-bold text-amber-200">
                      {character.fighting_style || 'Não selecionado'}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1">
                  <span>🔒</span> Permanente
                </span>
              </div>
            )}

            {/* Exibição da Escolha Permanente dentro do Quadro da Habilidade: Subclasse */}
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

            {/* Exibição da Escolha Permanente dentro do Quadro da Habilidade: Aumento de Atributo (ASI) */}
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
        ))}
      </div>

      {/* Painel de Manobras Táticas (se Mestre da Batalha estiver selecionado) */}
      {(selectedSubclass === 'BattleMaster' ||
        (FIGHTER_SUBCLASSES[selectedSubclass]?.name || '').includes('Batalha')) && (
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
      )}

      {/* Painel de Poderes Psiônicos (se Combatente Psíquico estiver selecionado) */}
      {(selectedSubclass === 'PsiWarrior' ||
        (FIGHTER_SUBCLASSES[selectedSubclass]?.name || '').includes('Psíquico')) && (
        <div className="bg-slate-900 border border-purple-500/30 p-4 rounded-xl space-y-3 mt-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 text-lg">🧠</span>
              <div>
                <h4 className="font-black text-xs text-purple-300 uppercase tracking-wider">
                  Poderes Psiônicos (Combatente Psíquico)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Utilize a energia psiônica para potencializar seus golpes, mover aliados e absorver dano.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between gap-2">
              <div>
                <span className="font-bold text-xs text-purple-200">Golpe Psiônico</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Causa dano Energético adicional igual ao Dado Psiônico + mod. Inteligência.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleUsePsiPower?.(
                    'Golpe Psiônico',
                    'Infunde seu ataque com dano Energético psíquico extra!'
                  )
                }
                className="w-full py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/40 font-bold text-[10px] rounded transition active:scale-95"
              >
                🧠 Aplicar Golpe Psiônico
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between gap-2">
              <div>
                <span className="font-bold text-xs text-purple-200">Vínculo Protetivo</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Reação para reduzir o dano sofrido por você ou aliado a até 9m.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleUsePsiPower?.(
                    'Vínculo Protetivo',
                    'Ergue uma barreira de força psíquica reduzindo o dano sofrido!'
                  )
                }
                className="w-full py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/40 font-bold text-[10px] rounded transition active:scale-95"
              >
                🛡️ Ativar Vínculo Protetivo
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between gap-2">
              <div>
                <span className="font-bold text-xs text-purple-200">Movimento Telecinético</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Move telecineticamente uma criatura voluntária ou objeto a até 9m.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleUsePsiPower?.(
                    'Movimento Telecinético',
                    'Mexe telecineticamente um alvo até 9 metros!'
                  )
                }
                className="w-full py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/40 font-bold text-[10px] rounded transition active:scale-95"
              >
                ✨ Mover Telecineticamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
