import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';

interface OpportunityAttackModalProps {
  pendingOpportunityAttack: any;
  setPendingOpportunityAttack: (v: any) => void;
  handleResolveOpportunityAttack: (accepted: boolean) => void;
}

export const OpportunityAttackModal: React.FC<OpportunityAttackModalProps> = ({
  pendingOpportunityAttack,
  setPendingOpportunityAttack,
  handleResolveOpportunityAttack
}) => {
  useModalKeyboard({
    onCancel: () => handleResolveOpportunityAttack(false),
    onClose: () => handleResolveOpportunityAttack(false),
    onConfirm: () => handleResolveOpportunityAttack(true),
    disabled: !pendingOpportunityAttack,
  });

  if (!pendingOpportunityAttack) return null;

  const monster = pendingOpportunityAttack.monster;
  const atkName = pendingOpportunityAttack.atkToUse?.name || "Ataque corpo-a-corpo";

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn" 
        onClick={() => handleResolveOpportunityAttack(false)} 
      />
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col p-6 text-slate-100 animate-scaleUp">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-2xl shadow-lg shadow-amber-950/50">
            ⚔️
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/40">
              Reação (Ataque de Oportunidade)
            </span>
            <h3 className="text-xl font-black text-amber-400 mt-1">Oportunidade de Ataque!</h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          O inimigo <strong className="text-rose-400">{monster.name}</strong> está se movendo e saiu da sua <strong className="text-amber-300">área ameaçada</strong>!
          <br /><br />
          Você deseja gastar sua <strong className="text-purple-300">Reação</strong> para realizar um Ataque de Oportunidade com <strong className="text-emerald-400">{atkName}</strong>?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleResolveOpportunityAttack(true)}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 font-black text-sm text-white shadow-lg shadow-amber-900/40 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>⚔️ Sim, Atacar!</span>
          </button>
          
          <button
            onClick={() => handleResolveOpportunityAttack(false)}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-300 border border-slate-700 transition text-center cursor-pointer"
          >
            Não, poupar reação
          </button>
        </div>
      </div>
    </div>
  );
};
