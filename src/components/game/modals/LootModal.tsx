import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';
import { LootItem } from '../../../game/types';

interface LootModalProps {
  showLootModal: boolean;
  setShowLootModal: (v: boolean) => void;
  victoryData: { totalXp: number, loot: LootItem[] } | null;
  mapStreak: number;
  handleClaimLootAndSave: () => void;
  isSaving: boolean;
}

export const LootModal: React.FC<LootModalProps> = ({
  showLootModal,
  setShowLootModal,
  victoryData,
  mapStreak,
  handleClaimLootAndSave,
  isSaving
}) => {
  useModalKeyboard({
    onCancel: () => setShowLootModal(false),
    onClose: () => setShowLootModal(false),
    onConfirm: () => {
      if (!isSaving) {
        handleClaimLootAndSave();
      }
    },
    disabled: !showLootModal || !victoryData,
  });

  if (!showLootModal || !victoryData) return null;


  return (
        <div 
          className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 cursor-pointer"
          onClick={() => setShowLootModal(false)}
        >
          <div 
            className="bg-slate-900 border border-amber-500/50 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-3">
              <div className="flex items-center gap-2.5 text-amber-400">
                <span className="text-2xl">🎁</span>
                <div>
                  <h3 className="text-base font-bold text-amber-300">
                    Premiação Acumulada (Mapa #{mapStreak})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Recompensas dos combates anteriores preservadas para sua Ficha.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLootModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30 text-center space-y-1">
                <span className="text-xs text-slate-400 font-medium block">Experiência Total</span>
                <span className="text-lg font-black text-emerald-400">
                  +{victoryData?.totalXp || 0} XP
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/30 text-center space-y-1">
                <span className="text-xs text-slate-400 font-medium block">Itens & Moedas</span>
                <span className="text-lg font-black text-amber-300">
                  {victoryData?.loot.length || 0} item(ns)
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                📦 Lista de Tesouros no Baú:
              </span>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {victoryData?.loot && victoryData.loot.length > 0 ? (
                  victoryData.loot.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3"
                    >
                      <span className="text-2xl p-1.5 bg-slate-900 rounded-lg border border-slate-700">
                        {item.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-amber-300 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                    Nenhum item acumulado até o momento.
                  </div>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 bg-amber-950/20 border border-amber-500/20 p-2.5 rounded-xl leading-relaxed">
              💡 <strong>Nota:</strong> Estas recompensas são mantidas em segurança enquanto você explora. Você pode recolhê-las e adicioná-las à sua ficha a qualquer momento!
            </p>

            <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setShowLootModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
              >
                Voltar à Batalha
              </button>
              <button
                onClick={handleClaimLootAndSave}
                disabled={isSaving}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-lg transition"
              >
                {isSaving ? 'Salvando...' : '📥 Salvar na Ficha e Sair'}
              </button>
            </div>
          </div>
        </div>
  );
};
