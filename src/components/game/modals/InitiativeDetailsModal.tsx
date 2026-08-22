import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';
import { EntityStatCards } from './initiativeDetails/EntityStatCards';
import { MonsterTraitsAndActions } from './initiativeDetails/MonsterTraitsAndActions';
import { HeroTraitsAndEquipment } from './initiativeDetails/HeroTraitsAndEquipment';

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
              <EntityStatCards
                entity={selectedEntityForPopup}
                character={character}
              />

              {selectedEntityForPopup.type === 'monster' ? (
                <MonsterTraitsAndActions entity={selectedEntityForPopup} />
              ) : (
                <HeroTraitsAndEquipment
                  entity={selectedEntityForPopup}
                  character={character}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
