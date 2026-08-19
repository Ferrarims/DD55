import React from 'react';
import {
  FEATS_REFERENCE,
  getClassFeaturesGainedAtLevel,
  formatSubclassName,
} from '../../../../lib/api/references';

interface FeatsHistorySectionProps {
  character: any;
  activeFeatsList: string[];
  hpBreakdown: any;
}

export const FeatsHistorySection: React.FC<FeatsHistorySectionProps> = ({
  character,
  activeFeatsList,
  hpBreakdown,
}) => {
  return (
    <>
      {/* Talentos Escolhidos & Bônus Ativos */}
      {activeFeatsList.length > 0 && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 shadow-xl">
          <div className="border-b border-slate-800 pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <span>🎯</span> Talentos Escolhidos &amp; Bônus Ativos (D&amp;D 5.5e)
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-300 font-extrabold bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded">
                  {activeFeatsList.length} Talento(s) Ativo(s)
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Talentos de origem, estilos de luta e bônus especiais selecionados para o personagem.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {activeFeatsList.map((featName, fIdx) => {
              const featInfo =
                FEATS_REFERENCE[featName] ||
                Object.values(FEATS_REFERENCE).find(
                  (f: any) => f.name.toLowerCase() === featName.toLowerCase()
                );

              return (
                <div
                  key={`${featName}-${fIdx}`}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-3 rounded-lg space-y-1.5 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs text-amber-300 flex items-center gap-1">
                        <span>❖</span> {featName}
                      </span>
                      {featInfo && (
                        <span className="text-[9px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-1.5 py-0.5 rounded whitespace-nowrap">
                          {featInfo.category}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {featInfo
                        ? featInfo.description
                        : 'Talento especial ativo para este personagem.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Histórico de Escolhas Permanentes de Nível */}
      {Array.isArray(character.level_choices) && character.level_choices.length > 0 && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="border-b border-slate-800 pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <span>📜</span> Histórico de Escolhas Permanentes de Nível
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                🔒 Inalteráveis
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Registro das decisões, pontos de vida, subclasses e ganhos obtidos a cada avanço de nível.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {character.level_choices.map((lc: any, idx: number) => {
              const isFighter = (character.class_name || '').toLowerCase().includes('guerreiro');
              const isAsiLevel = isFighter
                ? [4, 6, 8, 12, 14, 16, 19].includes(lc.level)
                : [4, 8, 12, 16, 19].includes(lc.level);

              const featNameMatch = (lc.asiOrFeat || '').replace('Talento:', '').trim();
              const featInfo =
                isAsiLevel && featNameMatch && !featNameMatch.toLowerCase().includes('nenhum')
                  ? FEATS_REFERENCE[featNameMatch] ||
                    Object.values(FEATS_REFERENCE).find(
                      (f: any) => f.name.toLowerCase() === featNameMatch.toLowerCase()
                    )
                  : null;

              const gainedFeatures = getClassFeaturesGainedAtLevel(
                character.class_name,
                lc.level,
                lc.subclass || character.subclass || character.subclass_name
              );

              const hasAsiBonus =
                isAsiLevel &&
                lc.asiOrFeat &&
                lc.asiOrFeat !== 'Evolução de Classe' &&
                !lc.asiOrFeat.startsWith('Evolução') &&
                !lc.asiOrFeat.toLowerCase().includes('nenhum') &&
                lc.asiOrFeat.trim() !== '';

              // Subclasse de Guerreiro só é desbloqueada/escolhida no nível 3
              const showSubclass =
                lc.level === 3 &&
                (lc.subclass || character.subclass_name || character.subclass);

              // Estilo de Luta é exibido no nível 1 ou quando gravado/alterado em passagens de nível
              const showFightingStyle =
                (lc.level === 1 && (lc.fightingStyle || character.fighting_style)) ||
                Boolean(lc.fightingStyle);

              return (
                <div
                  key={lc.level ? `lc-lvl-${lc.level}-${idx}` : `lc-idx-${idx}`}
                  className="bg-slate-900 border border-slate-800 p-3 rounded-lg space-y-2 text-xs hover:border-amber-500/40 transition flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-amber-300 border-b border-slate-800 pb-1.5">
                      <span>Nível {lc.level}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{lc.date}</span>
                    </div>

                    <p className="text-slate-300 flex items-center justify-between">
                      <span>❤️ Vida Ganha:</span>
                      <strong className="text-slate-100 font-semibold">
                        {(() => {
                          const breakdown = hpBreakdown?.levelsBreakdown?.find(
                            (l: any) => l.level === lc.level
                          );
                          if (breakdown) {
                            const {
                              baseHp,
                              conMod,
                              method,
                              dwarfBonusAtLevel,
                              toughBonusAtLevel,
                              totalLevelHp,
                            } = breakdown as any;
                            const total =
                              totalLevelHp ??
                              baseHp + conMod + (dwarfBonusAtLevel || 0) + (toughBonusAtLevel || 0);
                            const methodLabel =
                              lc.level === 1 ? 'Dado Máx' : method === 'Dado Rolado' ? 'Dado' : 'Média';
                            const bonuses = [
                              `${baseHp} ${methodLabel}`,
                              ...(conMod !== 0 ? [`${conMod >= 0 ? '+' : ''}${conMod} Con`] : []),
                              ...(dwarfBonusAtLevel > 0 ? [`+${dwarfBonusAtLevel} Anão`] : []),
                              ...(toughBonusAtLevel > 0 ? [`+${toughBonusAtLevel} Vigoroso`] : []),
                            ].join(' + ');

                            return `+${total} PV (${bonuses})`;
                          }

                          if (lc.level === 1) {
                            return lc.hpGain && !String(lc.hpGain).includes(String(character.max_hp))
                              ? lc.hpGain
                              : '+12 PV (10 Dado Máx + +2 Con)';
                          }

                          return lc.hpGain || '-';
                        })()}
                      </strong>
                    </p>
                    {showSubclass && (
                      <p className="text-slate-300 flex items-center justify-between">
                        <span>🛡️ Subclasse:</span>
                        <strong className="text-amber-200">
                          {formatSubclassName(lc.subclass || character.subclass_name || character.subclass)}
                        </strong>
                      </p>
                    )}
                    {showFightingStyle && (
                      <p className="text-slate-300 flex items-center justify-between">
                        <span>⚔️ Estilo de Luta:</span>
                        <strong className="text-amber-200">
                          {lc.fightingStyle || character.fighting_style}
                        </strong>
                      </p>
                    )}
                  </div>

                  {/* Quadro Verde de Ganhos da Classe no Nível */}
                  <div className="mt-2 p-2 bg-emerald-950/40 border border-emerald-500/40 rounded-lg space-y-1.5">
                    <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider flex items-center justify-between">
                      <span>✨ GANHOS DA CLASSE</span>
                    </div>

                    {/* Bônus de Atributo (ASI) - Apenas se for nível de ASI e houver escolha */}
                    {hasAsiBonus && !featInfo && (
                      <div className="font-bold text-emerald-200 text-xs flex items-center gap-1 bg-emerald-900/40 border border-emerald-500/30 p-1 rounded">
                        <span>💪 Bônus:</span> {lc.asiOrFeat}
                      </div>
                    )}

                    {/* Talento Escolhido - Apenas se for nível de ASI/Talento */}
                    {featInfo && (
                      <div className="p-1.5 bg-indigo-950/60 border border-indigo-500/40 rounded space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] font-bold text-indigo-300">
                          <span>🎯 {featInfo.name}</span>
                          <span className="bg-indigo-900/60 px-1 rounded text-[9px]">
                            {featInfo.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 leading-snug line-clamp-2">
                          {featInfo.description}
                        </p>
                      </div>
                    )}

                    {/* Lista de Habilidades de Classe Ganhas no Nível */}
                    <div className="space-y-0.5 pt-0.5">
                      {gainedFeatures.map((fName: string, fIdx: number) => (
                        <div
                          key={`gf-${fIdx}`}
                          className="text-[11px] font-medium text-emerald-200/90 flex items-start gap-1 leading-tight"
                        >
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{fName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
