import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';

interface TacticalMindAlertModalProps {
  handleDeclineTacticalMindAlert: () => void;
  handleAcceptTacticalMindAlert: () => void;
  secondWindUses: number;
  secondWindMaxUses: number;
  showTacticalMindAlertModal: boolean;
  setShowTacticalMindAlertModal: (v: boolean) => void;
  pendingTacticalMindInfo: any;
  setPendingTacticalMindInfo: (v: any) => void;
  addCombatLog: (title: string, log: string, details?: string, type?: string) => void;
  setHasHeroicInspiration: (v: boolean) => void;
}

export const TacticalMindAlertModal: React.FC<TacticalMindAlertModalProps> = ({
  showTacticalMindAlertModal,
  setShowTacticalMindAlertModal,
  pendingTacticalMindInfo,
  setPendingTacticalMindInfo,
  addCombatLog,
  setHasHeroicInspiration,
  handleDeclineTacticalMindAlert,
  handleAcceptTacticalMindAlert,
  secondWindUses,
  secondWindMaxUses
}) => {
  useModalKeyboard({
    onCancel: handleDeclineTacticalMindAlert,
    onClose: handleDeclineTacticalMindAlert,
    onConfirm: handleAcceptTacticalMindAlert,
    disabled: !showTacticalMindAlertModal || !pendingTacticalMindInfo,
  });

  if (!showTacticalMindAlertModal || !pendingTacticalMindInfo) return null;


  return (
<div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn" onClick={handleDeclineTacticalMindAlert} />
          <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col p-6 text-slate-100 animate-scaleUp">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-lg shadow-cyan-950/50">
                🧠
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Característica de Guerreiro (Nv 2+)
                </span>
                <h3 className="text-xl font-black text-cyan-400 mt-1">Mente Tática (Tactical Mind)</h3>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              Você falhou no <strong className="text-cyan-300">{pendingTacticalMindInfo.checkName}</strong> (Rolou <span className="font-bold text-rose-400">{pendingTacticalMindInfo.rollTotal}</span> vs CD <span className="font-bold text-amber-400">{pendingTacticalMindInfo.dc}</span>).
              <br /><br />
              Deseja gastar <strong className="text-cyan-300">1 uso de Retomar o Fôlego</strong> ({secondWindUses}/{secondWindMaxUses} restantes) para rolar <strong className="text-amber-300">1d10</strong> e somar ao teste?
              <br />
              <span className="text-xs text-slate-400 italic">💡 Regra oficial: Se o teste ainda assim falhar após o bônus, o uso de Retomar o Fôlego não é consumido!</span>
            </p>

            <div className="flex gap-3 mt-2">
              <button
                onClick={handleAcceptTacticalMindAlert}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-black text-sm text-white shadow-lg shadow-cyan-900/40 transition flex items-center justify-center gap-2"
              >
                <span>⚡ Usar Mente Tática (+1d10)</span>
              </button>
              <button
                onClick={handleDeclineTacticalMindAlert}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-300 border border-slate-700 transition"
              >
                Recusar
              </button>
            </div>
          </div>
        </div>
  );
};
