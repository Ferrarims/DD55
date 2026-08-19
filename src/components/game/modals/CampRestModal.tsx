import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';

interface CampRestModalProps {
  pendingRestPointId: string | null;
  setPendingRestPointId: (id: string | null) => void;
  useShortRestPoint: (id: string) => void;
  useRestPoint: (id: string) => void;
}

export const CampRestModal: React.FC<CampRestModalProps> = ({
  pendingRestPointId,
  setPendingRestPointId,
  useShortRestPoint,
  useRestPoint
}) => {
  useModalKeyboard({
    onCancel: () => setPendingRestPointId(null),
    onClose: () => setPendingRestPointId(null),
    onConfirm: () => {
      if (pendingRestPointId) {
        useShortRestPoint(pendingRestPointId);
        setPendingRestPointId(null);
      }
    },
    disabled: !pendingRestPointId,
  });

  if (!pendingRestPointId) return null;


  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn" 
        onClick={() => setPendingRestPointId(null)} 
      />
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col p-6 text-slate-100 animate-scaleUp">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-950/60 border border-amber-500/50 flex items-center justify-center text-2xl shadow-lg shadow-amber-950/50">
            🏕️
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
              Acampamento no Mapa
            </span>
            <h3 className="text-xl font-black text-amber-400 mt-1">Escolher Tipo de Descanso</h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Você encontrou um acampamento aconchegante! Como deseja descansar? O tempo do mundo avançará de acordo com a sua escolha.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Descanso Curto */}
          <button
            onClick={() => {
              useShortRestPoint(pendingRestPointId);
              setPendingRestPointId(null);
            }}
            className="p-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-amber-500/30 hover:border-amber-500 text-left transition flex flex-col gap-2 group shadow-lg cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-300 flex items-center gap-1.5 text-sm">
                <span>☕</span> Descanso Curto
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                1 Hora (+1h)
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-snug">
              Gasta 1 Dado de Vida para curar PV e recupera habilidades de Descanso Curto (Surto de Ação, Fôlego, etc.).
            </p>
          </button>

          {/* Descanso Longo */}
          <button
            onClick={() => {
              useRestPoint(pendingRestPointId);
              setPendingRestPointId(null);
            }}
            className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 to-slate-900 hover:from-amber-900/50 hover:to-slate-900 border border-amber-500/60 hover:border-amber-400 text-left transition flex flex-col gap-2 group shadow-lg cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-amber-400 flex items-center gap-1.5 text-sm">
                <span>🏕️</span> Descanso Longo
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/40">
                8 Horas (+8h)
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-snug">
              Restaura 100% dos PVs, todos os Dados de Vida, espaços de magia e recursos completos.
            </p>
          </button>
        </div>

        <button
          onClick={() => setPendingRestPointId(null)}
          className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-300 border border-slate-700 transition cursor-pointer"
        >
          Agora Não
        </button>
      </div>
    </div>
  );
};
