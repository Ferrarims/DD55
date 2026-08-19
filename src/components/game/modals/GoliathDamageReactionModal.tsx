import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';

interface GoliathDamageReactionModalProps {
  pendingGoliathDamageInfo: any;
  setPendingGoliathDamageInfo: (info: any) => void;
  entities: any[];
  character: any;
  goliathAncestryUses: number;
  goliathAncestryMaxUses: number;
  handleExecuteGoliathDamage: (type: 'stone' | 'storm') => void;
}

export const GoliathDamageReactionModal: React.FC<GoliathDamageReactionModalProps> = ({
  pendingGoliathDamageInfo,
  setPendingGoliathDamageInfo,
  entities,
  character,
  goliathAncestryUses,
  goliathAncestryMaxUses,
  handleExecuteGoliathDamage
}) => {
  const gType = (character?.giant_ancestry || character?.giantAncestry || '').toLowerCase();
  const showStone = gType === '' || gType.includes('pedra') || gType.includes('stone');
  const showStorm = gType === '' || gType.includes('tempestade') || gType.includes('storm');
  const heroEntity = entities.find(e => e.type === 'hero');

  useModalKeyboard({
    onCancel: () => setPendingGoliathDamageInfo(null),
    onClose: () => setPendingGoliathDamageInfo(null),
    onConfirm: () => {
      if (showStone) {
        handleExecuteGoliathDamage('stone');
      } else if (showStorm && pendingGoliathDamageInfo?.isWithin60Ft && heroEntity?.hasReaction) {
        handleExecuteGoliathDamage('storm');
      } else {
        setPendingGoliathDamageInfo(null);
      }
    },
    disabled: !pendingGoliathDamageInfo,
  });

  if (!pendingGoliathDamageInfo) return null;


  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn" />
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-indigo-500/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col p-6 text-slate-100 animate-scaleUp">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-500/50 flex items-center justify-center text-2xl shadow-lg shadow-indigo-950/50">
            ⚡
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-500/40">
              Ancestralidade Golias - Reação
            </span>
            <h3 className="text-xl font-black text-indigo-400 mt-1">Reagir ao Dano</h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Você acabou de sofrer <strong className="text-rose-400">{pendingGoliathDamageInfo.damageDealt} pontos de dano</strong> de <strong className="text-amber-400">{pendingGoliathDamageInfo.attackerName}</strong>!
          <br />
          Deseja gastar sua <strong className="text-indigo-300">Reação</strong> e <strong className="text-indigo-300">1 uso do seu Ancestral Gigante</strong> ({goliathAncestryUses}/{goliathAncestryMaxUses} restantes) para reagir?
        </p>

        <div className="flex flex-col gap-3 mt-2">
          {/* Opção 1: Stone's Endurance */}
          {showStone && (
            <button
              onClick={() => handleExecuteGoliathDamage('stone')}
              className="w-full p-4 rounded-xl border border-zinc-500/30 bg-zinc-950/40 hover:bg-zinc-900/60 transition text-left flex items-start gap-3 group cursor-pointer"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🛡️</span>
              <div className="flex-1">
                <span className="font-bold text-zinc-300 text-sm block">Resistência da Pedra (Gigante da Pedra)</span>
                <span className="text-xs text-slate-400">Rola 1d12 + Modificador de Constituição para reduzir o dano recebido.</span>
              </div>
            </button>
          )}

          {/* Opção 2: Storm's Thunder */}
          {showStorm && (
            <button
              onClick={() => handleExecuteGoliathDamage('storm')}
              disabled={!pendingGoliathDamageInfo.isWithin60Ft || !heroEntity?.hasReaction}
              className={`w-full p-4 rounded-xl border transition text-left flex items-start gap-3 group ${
                pendingGoliathDamageInfo.isWithin60Ft && heroEntity?.hasReaction
                  ? 'border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/60 cursor-pointer'
                  : 'border-slate-800 bg-slate-950 text-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">⚡</span>
              <div className="flex-1">
                <span className="font-bold text-indigo-400 text-sm block">Trovão da Tempestade (Gigante da Tempestade)</span>
                <span className="text-xs text-slate-400">
                  {pendingGoliathDamageInfo.isWithin60Ft && heroEntity?.hasReaction
                    ? `Retribui o ataque descarregando 1d8 de dano de Trovão de volta ao atacante (dentro de 18m / 12 cel).`
                    : !heroEntity?.hasReaction
                      ? "Não disponível: Sua reação já foi usada neste turno."
                      : `Não disponível: O atacante está além de 18m (12 células) de distância.`}
                </span>
              </div>
            </button>
          )}

          {/* Opção Cancelar */}
          <button
            onClick={() => setPendingGoliathDamageInfo(null)}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-300 border border-slate-700 transition mt-2 text-center cursor-pointer"
          >
            Ignorar (Poupar Reação/Uso)
          </button>
        </div>
      </div>
    </div>
  );
};
