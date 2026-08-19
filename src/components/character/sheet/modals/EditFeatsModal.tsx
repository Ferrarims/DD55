import React, { useState } from 'react';
import { useModalKeyboard } from '../../../../components/shared/ModalKeyboardHandler';
import { FEATS_REFERENCE } from '../../../../lib/api/references';
import { updateCharacter, addFeatToCharacter, removeFeatFromCharacter } from '../../../../lib/api/characterService';

interface EditFeatsModalProps {
  showEditFeatsModal: boolean;
  setShowEditFeatsModal: (show: boolean) => void;
  character: any;
  getCharacterActiveFeats: (char: any) => string[];
  onCharacterUpdated?: () => void;
}

export const EditFeatsModal: React.FC<EditFeatsModalProps> = ({
  showEditFeatsModal,
  setShowEditFeatsModal,
  character,
  getCharacterActiveFeats,
  onCharacterUpdated,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  useModalKeyboard({
    onCancel: () => setShowEditFeatsModal(false),
    onClose: () => setShowEditFeatsModal(false),
    onConfirm: () => setShowEditFeatsModal(false),
    disabled: !showEditFeatsModal,
  });

  if (!showEditFeatsModal) return null;


  return (
    <div
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => setShowEditFeatsModal(false)}
    >
      <div
        className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-amber-400 shrink-0 border-b border-slate-800 pb-4">
          <span className="text-3xl">🎯</span>
          <h3 className="text-xl font-bold text-slate-100" style={{ fontFamily: 'Georgia, serif' }}>
            Gerenciar Talentos da Ficha
          </h3>
        </div>

        <p className="text-slate-300 text-sm leading-relaxed shrink-0">
          Gerencie manualmente os talentos do seu personagem (Ex: Vigoroso, Alerta). Você pode adicionar ou remover talentos como desejar.
        </p>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.values(FEATS_REFERENCE)
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((feat: any) => {
                const isActive = getCharacterActiveFeats(character).includes(feat.name);
                return (
                  <div
                    key={feat.name}
                    className={`p-3 rounded-xl border flex flex-col justify-between transition-colors ${
                      isActive
                        ? 'bg-amber-950/20 border-amber-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`font-bold text-sm ${
                            isActive ? 'text-amber-300' : 'text-slate-200'
                          }`}
                        >
                          {feat.name}
                        </span>
                        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                          {feat.category}
                        </span>
                      </div>
                      <p
                        className="text-[10px] text-slate-400 line-clamp-2"
                        title={feat.description}
                      >
                        {feat.description}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-800/50 flex justify-end">
                      <button
                        onClick={async () => {
                          try {
                            setIsSaving(true);
                            let featsList: string[] = Array.isArray(character.feats)
                              ? [...character.feats]
                              : [];
                            if (isActive) {
                              featsList = featsList.filter(f => f !== feat.name);
                            } else {
                              featsList.push(feat.name);
                            }
                            await updateCharacter(character.id, { feats: featsList });

                            // Dual write para tabela relacional (feats)
                            try {
                              if (isActive) {
                                // Remover
                                if (
                                  character.character_feats &&
                                  Array.isArray(character.character_feats)
                                ) {
                                  const dbFeat = character.character_feats.find(
                                    (f: any) => f.feats?.name === feat.name
                                  );
                                  if (dbFeat) await removeFeatFromCharacter(dbFeat.id);
                                }
                              } else {
                                // Adicionar
                                if (feat.id) await addFeatToCharacter(character.id, feat.id, 'manual');
                              }
                            } catch (dbErr) {
                              console.error('Erro no dual write (feats):', dbErr);
                            }

                            character.feats = featsList;
                            if (onCharacterUpdated) onCharacterUpdated();
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setIsSaving(false);
                          }
                        }}
                        disabled={isSaving}
                        className={`px-3 py-1 text-[10px] font-bold rounded border transition ${
                          isActive
                            ? 'bg-red-950/40 text-red-400 border-red-500/30 hover:bg-red-900/60'
                            : 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/60'
                        }`}
                      >
                        {isSaving ? 'Salvando...' : isActive ? 'Remover' : 'Adicionar'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
          <button
            onClick={() => setShowEditFeatsModal(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm rounded-xl border border-slate-600 transition w-full"
          >
            Concluir &amp; Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
