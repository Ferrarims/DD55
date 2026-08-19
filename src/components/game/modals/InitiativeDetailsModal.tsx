import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';
import { parseEquipmentToList } from '../../../lib/mechanics/xpAndLootManager';

interface InitiativeDetailsModalProps {
  selectedEntityForPopup: any;
  setSelectedEntityForPopup: (entity: any) => void;
  shouldHideEntityDetails: (entity: any) => boolean;
  shouldHideMonsterStats: (entity: any) => boolean;
  character: any;
}

export const InitiativeDetailsModal: React.FC<InitiativeDetailsModalProps> = ({
  selectedEntityForPopup,
  setSelectedEntityForPopup,
  shouldHideEntityDetails,
  shouldHideMonsterStats,
  character
}) => {
  useModalKeyboard({
    onCancel: () => setSelectedEntityForPopup(null),
    onClose: () => setSelectedEntityForPopup(null),
    onConfirm: () => setSelectedEntityForPopup(null),
    disabled: !selectedEntityForPopup,
  });

  if (!selectedEntityForPopup) return null;


  const isHidden = shouldHideEntityDetails(selectedEntityForPopup);
  const hideStats = shouldHideMonsterStats(selectedEntityForPopup);
  const popupName = isHidden ? 'Inimigo Oculto' : selectedEntityForPopup.name;
  const popupIcon = isHidden ? '❓' : selectedEntityForPopup.icon;

  return (
    <div 
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[99999] animate-in fade-in duration-150 cursor-pointer"
      onClick={() => setSelectedEntityForPopup(null)}
    >
      <div 
        className={`bg-slate-900 border ${
          selectedEntityForPopup.type === 'hero' ? 'border-blue-500/50 shadow-blue-500/10' : 'border-amber-500/50 shadow-amber-500/10'
        } rounded-2xl max-w-2xl w-full flex flex-col max-h-[85vh] shadow-2xl overflow-hidden cursor-default`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com Nome, Ícone, Subtítulo */}
        <div className={`p-5 border-b border-slate-800 flex justify-between items-start ${
          selectedEntityForPopup.type === 'hero' ? 'bg-blue-950/20' : 'bg-amber-950/20'
        }`}>
          <div className="flex items-center gap-4">
            <span className="text-3xl p-2.5 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
              {popupIcon}
            </span>
            <div>
              <h3 className="text-xl font-black text-slate-100 tracking-wide flex items-center gap-2">
                {popupName}
                {selectedEntityForPopup.isDead && (
                  <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-bold">
                    Morto
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {selectedEntityForPopup.type === 'hero' ? (
                  <span>
                    🛡️ Personagem Jogador • <strong className="text-blue-400">{selectedEntityForPopup.charClass || character?.class_name || 'Herói'}</strong> Nível {selectedEntityForPopup.level || character?.level || 1} • {character?.race || 'Raça não definida'}
                  </span>
                ) : (
                  <span>
                    👹 Monstro Desafiador • <strong className="text-amber-400">ND {hideStats ? '??' : (selectedEntityForPopup.cr || 'N/A')}</strong> ({hideStats ? '??' : (selectedEntityForPopup.xpValue || '0')} XP)
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedEntityForPopup(null)}
            className="text-slate-400 hover:text-white font-bold text-xl p-1 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {isHidden ? (
            <div className="text-center py-16 space-y-4">
              <span className="text-6xl block animate-pulse">🌫️</span>
              <div className="max-w-md mx-auto space-y-3">
                <h4 className="text-base font-black text-amber-400 uppercase tracking-wider">Criatura Desconhecida</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Este inimigo está atualmente oculto pela escuridão ou fora da sua linha de visão normal. Você percebe sua presença na iniciativa, mas não possui informações sobre seus atributos, vida ou habilidades.
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  "As sombras ocultam a natureza do perigo que se aproxima."
                </p>
              </div>
            </div>
          ) : hideStats ? (
            <div className="text-center py-16 space-y-4">
              <span className="text-6xl block animate-bounce">📜</span>
              <div className="max-w-md mx-auto space-y-3">
                <h4 className="text-base font-black text-amber-400 uppercase tracking-wider">Criatura Não Catalogada</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Você vê este inimigo em campo, mas como nunca o derrotou anteriormente, ele ainda não está registrado no seu <strong>Bestiário</strong>.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Seus atributos exatos, Classe de Armadura, Pontos de Vida, imunidades e ações de combate continuam sendo um mistério para você nesta aventura.
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  "Derrote esta criatura para registrá-la no seu Bestiário e desvendar seus atributos e habilidades!"
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Barra de Vida & Estatísticas Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                <div className="md:col-span-6 space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400 flex items-center gap-1">❤️ Pontos de Vida</span>
                    <span className="text-slate-200">
                      {selectedEntityForPopup.currentHp} / {selectedEntityForPopup.maxHp} HP
                    </span>
                  </div>
                  {/* Progress Bar de HP */}
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        selectedEntityForPopup.currentHp / selectedEntityForPopup.maxHp > 0.5 
                          ? 'bg-emerald-500' 
                          : selectedEntityForPopup.currentHp / selectedEntityForPopup.maxHp > 0.25 
                          ? 'bg-amber-500' 
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${(selectedEntityForPopup.currentHp / selectedEntityForPopup.maxHp) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="md:col-span-2 text-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">🛡️ Classe Armadura</span>
                  <span className="text-base font-black text-amber-300">{selectedEntityForPopup.ac ?? selectedEntityForPopup.armor_class} CA</span>
                </div>

                <div className="md:col-span-2 text-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">🏃 Deslocamento</span>
                  <span className="text-xs font-bold text-slate-200">
                    {selectedEntityForPopup.speed} cel ({selectedEntityForPopup.speed * 1.5}m)
                  </span>
                </div>

                <div className="md:col-span-2 text-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-semibold">⚡ Iniciativa Rolada</span>
                  <span className="text-base font-bold text-indigo-300">{selectedEntityForPopup.initiative}</span>
                </div>
              </div>

              {/* Atributos / Habilidades */}
              <div>
                <h4 className="text-xs font-black text-amber-400/90 uppercase tracking-wider mb-2.5 border-b border-slate-800 pb-1 flex items-center gap-1">
                  <span>📊</span> Atributos Principais
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(() => {
                    const statsObj = selectedEntityForPopup.type === 'hero' 
                      ? {
                          str: character?.strength || 10,
                          dex: character?.dexterity || 10,
                          con: character?.constitution || 10,
                          int: character?.intelligence || 10,
                          wis: character?.wisdom || 10,
                          cha: character?.charisma || 10
                        }
                      : selectedEntityForPopup.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

                    const getModifier = (val: number) => {
                      const mod = Math.floor((val - 10) / 2);
                      return mod >= 0 ? `+${mod}` : `${mod}`;
                    };

                    const attributes = [
                      { label: 'FOR', name: 'Força', value: statsObj.str, color: 'border-red-500/20 hover:border-red-500/40' },
                      { label: 'DES', name: 'Destreza', value: statsObj.dex, color: 'border-emerald-500/20 hover:border-emerald-500/40' },
                      { label: 'CON', name: 'Constituição', value: statsObj.con, color: 'border-orange-500/20 hover:border-orange-500/40' },
                      { label: 'INT', name: 'Inteligência', value: statsObj.int, color: 'border-blue-500/20 hover:border-blue-500/40' },
                      { label: 'SAB', name: 'Sabedoria', value: statsObj.wis, color: 'border-teal-500/20 hover:border-teal-500/40' },
                      { label: 'CAR', name: 'Carisma', value: statsObj.cha, color: 'border-purple-500/20 hover:border-purple-500/40' },
                    ];

                    return attributes.map(attr => (
                      <div key={attr.label} className={`bg-slate-950 p-2.5 rounded-xl border ${attr.color} text-center transition`}>
                        <span className="text-[9px] font-black text-slate-400 block">{attr.label}</span>
                        <span className="text-sm font-black text-slate-100 block mt-0.5">{attr.value}</span>
                        <span className="text-xs font-extrabold text-amber-400 mt-0.5 bg-slate-900 px-1.5 py-0.5 rounded-md inline-block">
                          {getModifier(attr.value)}
                        </span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Informações adicionais (Sentidos, Resistências, Vulnerabilidades, Imunidades) */}
              {selectedEntityForPopup.type === 'monster' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Sentidos e Perícias */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <h5 className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider border-b border-slate-800 pb-1">
                      👁️ Sentidos e Perícias
                    </h5>
                    <div className="text-[11px] text-slate-300 leading-relaxed space-y-1">
                      <div>
                        <strong className="text-slate-400">Senses:</strong> {selectedEntityForPopup.senses || 'Percepção Passiva 10'}
                      </div>
                      {selectedEntityForPopup.skills && selectedEntityForPopup.skills.length > 0 && (
                        <div>
                          <strong className="text-slate-400">Skills:</strong> {selectedEntityForPopup.skills.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Resistências e Imunidades */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <h5 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                      🛡️ Resistências e Vulnerabilidades
                    </h5>
                    <div className="text-[11px] text-slate-300 space-y-1.5">
                      {selectedEntityForPopup.resistances && selectedEntityForPopup.resistances.length > 0 && (
                        <div>
                          <strong className="text-slate-400">Resistências:</strong> <span className="text-emerald-400 font-semibold">{selectedEntityForPopup.resistances.join(', ')}</span>
                        </div>
                      )}
                      {selectedEntityForPopup.vulnerabilities && selectedEntityForPopup.vulnerabilities.length > 0 && (
                        <div>
                          <strong className="text-slate-400">Vulnerabilidades:</strong> <span className="text-red-400 font-semibold">{selectedEntityForPopup.vulnerabilities.join(', ')}</span>
                        </div>
                      )}
                      {selectedEntityForPopup.immunities && selectedEntityForPopup.immunities.length > 0 && (
                        <div>
                          <strong className="text-slate-400">Imunidades a Dano:</strong> <span className="text-teal-400 font-semibold">{selectedEntityForPopup.immunities.join(', ')}</span>
                        </div>
                      )}
                      {selectedEntityForPopup.condition_immunities && selectedEntityForPopup.condition_immunities.length > 0 && (
                        <div>
                          <strong className="text-slate-400">Imunidades a Condições:</strong> <span className="text-purple-400 font-semibold">{selectedEntityForPopup.condition_immunities.join(', ')}</span>
                        </div>
                      )}
                      {(!selectedEntityForPopup.resistances?.length && !selectedEntityForPopup.vulnerabilities?.length && !selectedEntityForPopup.immunities?.length && !selectedEntityForPopup.condition_immunities?.length) && (
                        <div className="text-slate-500 italic">Nenhuma resistência, imunidade ou vulnerabilidade especial listada.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Informações adicionais do Herói (Talentos e Equipamentos) */}
              {selectedEntityForPopup.type === 'hero' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Talentos e Características */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <h5 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                      ✨ Talentos & Traços de Raça
                    </h5>
                    <div className="text-[11px] text-slate-300 leading-relaxed space-y-1.5">
                      {character?.feats && character.feats.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {character.feats.map((feat: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-blue-500/15 text-blue-300 border border-blue-500/25 rounded-md text-[10px] font-semibold">
                              {feat}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-slate-500 italic">Nenhum talento ou traço adicional listado na ficha.</div>
                      )}
                    </div>
                  </div>

                  {/* Equipamentos e Armas */}
                  <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <h5 className="text-[10px] font-bold text-amber-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                      ⚔️ Equipamentos & Ataques
                    </h5>
                    <div className="text-[11px] text-slate-300 space-y-1">
                      <div>
                        <strong className="text-slate-400">Ataque Selecionado:</strong> <span className="text-amber-300 font-semibold">{selectedEntityForPopup.damageDice}</span> (Bônus: +{selectedEntityForPopup.attackBonus})
                      </div>
                      <div className="mt-2 text-[10px] text-slate-400">
                        <strong className="text-slate-400 block mb-1">Itens de Combate Equipados:</strong>
                        <div className="max-h-[80px] overflow-y-auto space-y-0.5">
                          {parseEquipmentToList(character?.equipment || []).map((eq, i) => (
                            <div key={i} className="bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800/80">
                              🛡️ {eq}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Traços / Características do Monstro */}
              {selectedEntityForPopup.type === 'monster' && selectedEntityForPopup.traits && selectedEntityForPopup.traits.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-amber-400/90 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center gap-1">
                    <span>⚡</span> Traços de Combate
                  </h4>
                  <div className="space-y-2">
                    {selectedEntityForPopup.traits.map((trait: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                        <div className="font-bold text-xs text-slate-200">{trait.name}</div>
                        <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{trait.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações (Ações de Combate / Ataques) */}
              {selectedEntityForPopup.type === 'monster' && selectedEntityForPopup.actions && selectedEntityForPopup.actions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-amber-400/90 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center gap-1">
                    <span>⚔️</span> Ações do Turno
                  </h4>
                  <div className="space-y-2">
                    {selectedEntityForPopup.actions.map((act: any, idx: number) => (
                      <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <span className="font-bold text-xs text-amber-300">{act.name}</span>
                          <div className="flex gap-1.5">
                            {act.to_hit !== undefined && (
                              <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-md text-amber-400 font-extrabold border border-amber-500/25">
                                Atk: +{act.to_hit}
                              </span>
                            )}
                            {act.damage && (
                              <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-md text-emerald-400 font-black border border-emerald-500/25">
                                Dano: {act.damage}
                              </span>
                            )}
                          </div>
                        </div>
                        {act.text && (
                          <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{act.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outras Ações (Bônus, Reações, Lendárias) */}
              {selectedEntityForPopup.type === 'monster' && (
                <>
                  {selectedEntityForPopup.bonus_actions && selectedEntityForPopup.bonus_actions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-amber-400/90 uppercase tracking-wider border-b border-slate-800 pb-1">
                        ⚡ Ações Bônus
                      </h4>
                      <div className="space-y-2">
                        {selectedEntityForPopup.bonus_actions.map((act: any, idx: number) => (
                          <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                            <span className="font-bold text-xs text-slate-200">{act.name}</span>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{act.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEntityForPopup.reactions && selectedEntityForPopup.reactions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-amber-400/90 uppercase tracking-wider border-b border-slate-800 pb-1">
                        ↩️ Reações
                      </h4>
                      <div className="space-y-2">
                        {selectedEntityForPopup.reactions.map((act: any, idx: number) => (
                          <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                            <span className="font-bold text-xs text-slate-200">{act.name}</span>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{act.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEntityForPopup.legendary_actions && selectedEntityForPopup.legendary_actions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-black text-amber-400/90 uppercase tracking-wider border-b border-slate-800 pb-1">
                        👑 Ações Lendárias
                      </h4>
                      <div className="space-y-2">
                        {selectedEntityForPopup.legendary_actions.map((act: any, idx: number) => (
                          <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                            <span className="font-bold text-xs text-slate-200">{act.name}</span>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{act.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
