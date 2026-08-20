import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';

interface SettingsModalProps {
  showSettingsModal: boolean;
  setShowSettingsModal: (v: boolean) => void;
  isAmbientSoundEnabled: boolean;
  setIsAmbientSoundEnabled: (v: boolean) => void;
  isSfxEnabled: boolean;
  setIsSfxEnabled: (v: boolean) => void;
  isShowMinimap: boolean;
  setIsShowMinimap: (v: boolean) => void;
  isShowZoomControls: boolean;
  setIsShowZoomControls: (v: boolean) => void;
  proceduralWorldEnabled?: boolean;
  setProceduralWorldEnabled?: (v: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  showSettingsModal,
  setShowSettingsModal,
  isAmbientSoundEnabled,
  setIsAmbientSoundEnabled,
  isSfxEnabled,
  setIsSfxEnabled,
  isShowMinimap,
  setIsShowMinimap,
  isShowZoomControls,
  setIsShowZoomControls,
  proceduralWorldEnabled = false,
  setProceduralWorldEnabled,
}) => {
  useModalKeyboard({
    onCancel: () => setShowSettingsModal(false),
    onClose: () => setShowSettingsModal(false),
    onConfirm: () => setShowSettingsModal(false),
    disabled: !showSettingsModal,
  });

  if (!showSettingsModal) return null;


  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowSettingsModal(false)} />
      <div className="relative bg-slate-900 border-2 border-slate-700/80 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950">
          <h3 className="font-black text-amber-400 uppercase tracking-widest text-sm flex items-center gap-2">
            <span>⚙️</span> Configurações
          </h3>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="text-slate-400 hover:text-rose-400 transition"
          >
            ✖
          </button>
        </div>
        
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <label className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl cursor-pointer transition">
            <div className="flex flex-col">
              <span className="font-bold text-slate-200 text-sm">Som Ambiente</span>
              <span className="text-xs text-slate-500">Músicas e ruídos de fundo</span>
            </div>
            <input 
              type="checkbox" 
              checked={isAmbientSoundEnabled}
              onChange={(e) => setIsAmbientSoundEnabled(e.target.checked)}
              className="w-5 h-5 accent-amber-500"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl cursor-pointer transition">
            <div className="flex flex-col">
              <span className="font-bold text-slate-200 text-sm">Efeitos Sonoros</span>
              <span className="text-xs text-slate-500">Ataques, passos e interações</span>
            </div>
            <input 
              type="checkbox" 
              checked={isSfxEnabled}
              onChange={(e) => setIsSfxEnabled(e.target.checked)}
              className="w-5 h-5 accent-amber-500"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl cursor-pointer transition">
            <div className="flex flex-col">
              <span className="font-bold text-slate-200 text-sm">Minimapa</span>
              <span className="text-xs text-slate-500">Exibir o minimapa no canto</span>
            </div>
            <input 
              type="checkbox" 
              checked={isShowMinimap}
              onChange={(e) => setIsShowMinimap(e.target.checked)}
              className="w-5 h-5 accent-amber-500"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl cursor-pointer transition">
            <div className="flex flex-col">
              <span className="font-bold text-slate-200 text-sm">Controles de Zoom</span>
              <span className="text-xs text-slate-500">Exibir os botões de zoom na tela normal</span>
            </div>
            <input 
              type="checkbox" 
              checked={isShowZoomControls}
              onChange={(e) => setIsShowZoomControls(e.target.checked)}
              className="w-5 h-5 accent-amber-500"
            />
          </label>
          <label className="flex items-center justify-between p-3 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-700/50 rounded-xl cursor-pointer transition">
            <div className="flex flex-col">
              <span className="font-bold text-indigo-200 text-sm flex items-center gap-1.5">
                <span>🌐</span> Mundo Procedural
              </span>
              <span className="text-xs text-indigo-400/80">
                Gerar terreno e chunks infinitos no modo exploração
              </span>
            </div>
            <input 
              type="checkbox" 
              checked={proceduralWorldEnabled}
              onChange={(e) => setProceduralWorldEnabled?.(e.target.checked)}
              className="w-5 h-5 accent-indigo-500"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
