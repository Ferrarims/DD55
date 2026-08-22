import React from 'react';
import { useModalKeyboard } from '../../../../components/shared/ModalKeyboardHandler';
import { FIGHTER_SUBCLASSES } from '../../../../lib/api/references';

interface SubclassModalProps {
  showSubclassModal: boolean;
  setShowSubclassModal: (show: boolean) => void;
  selectedSubclass: string;
  handleSelectSubclass: (key: string) => void;
}

export const SubclassModal: React.FC<SubclassModalProps> = ({
  showSubclassModal,
  setShowSubclassModal,
  selectedSubclass,
  handleSelectSubclass,
}) => {
  useModalKeyboard({
    onCancel: () => setShowSubclassModal(false),
    onClose: () => setShowSubclassModal(false),
    onConfirm: () => setShowSubclassModal(false),
    disabled: !showSubclassModal,
  });

  if (!showSubclassModal) return null;


  return (
    <div
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={() => setShowSubclassModal(false)}
    >
      <div
        className="bg-slate-900 border-2 border-amber-400/80 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-5 my-8 animate-in fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
          <div className="flex items-center gap-3 text-amber-400">
            <span className="text-3xl">🛡️</span>
            <div>
              <h2 className="text-lg font-black text-amber-300" style={{ fontFamily: 'Georgia, serif' }}>
                ESCOLHA A SUBCLASSE DE GUERREIRO (NÍVEL 3)
              </h2>
              <p className="text-xs text-slate-300">
                Selecione a sua especialização marcial.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSubclassModal(false)}
            className="text-slate-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Opções de Subclasse */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {Array.from(
            new Map(
              Object.entries(FIGHTER_SUBCLASSES).map(([key, sub]: [string, any]) => [
                sub.name,
                { key, sub },
              ])
            ).values()
          ).map(({ key, sub }) => {
            const isSelected = selectedSubclass === key || selectedSubclass === sub.name;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectSubclass(key)}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-400 shadow-lg ring-2 ring-amber-400/50'
                    : 'bg-slate-950 border-slate-800 hover:border-amber-500/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-amber-300">{sub.name}</h4>
                    {isSelected && (
                      <span className="text-[10px] font-extrabold bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                        ✓ Ativa
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                    {sub.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider">
                    Habilidades Chave:
                  </span>
                  <ul className="text-[10px] text-slate-400 space-y-0.5">
                    {sub.features.slice(0, 3).map((f: any, fIdx: number) => (
                      <li key={`${f.name}-${fIdx}`} className="truncate">• <strong>{f.name}</strong> (Nv {f.level})</li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setShowSubclassModal(false)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-600 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
