import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';

interface GoliathHitReactionModalProps {
  pendingGoliathHitInfo: any;
  setPendingGoliathHitInfo: (info: any) => void;
  entities: any[];
  character: any;
  goliathAncestryUses: number;
  goliathAncestryMaxUses: number;
  getEntitySizeInSquares: (size?: string) => number;
  handleExecuteGoliathHit: (type: 'fire' | 'frost' | 'hill') => void;
}

export const GoliathHitReactionModal: React.FC<GoliathHitReactionModalProps> = ({
  pendingGoliathHitInfo,
  setPendingGoliathHitInfo,
  entities,
  character,
  goliathAncestryUses,
  goliathAncestryMaxUses,
  getEntitySizeInSquares,
  handleExecuteGoliathHit
}) => {
  const targetEntityForHit = entities.find(e => e.id === pendingGoliathHitInfo?.targetId);
  const targetNameForHit = targetEntityForHit ? targetEntityForHit.name : 'Inimigo';
  const isLargeOrSmaller = targetEntityForHit ? (getEntitySizeInSquares(targetEntityForHit.size) <= 2) : true;
  const isTargetAlreadyProne = targetEntityForHit ? targetEntityForHit.conditions?.some((c: string) => c === 'Caído' || c === 'Prone' || c === 'Caido') : false;
  const gType = (character?.giant_ancestry || character?.giantAncestry || '').toLowerCase();
  const showFire = gType === '' || gType.includes('fogo') || gType.includes('fire');
  const showFrost = gType === '' || gType.includes('gelo') || gType.includes('frost');
  const showHill = gType === '' || gType.includes('colina') || gType.includes('hill');

  useModalKeyboard({
    onCancel: () => setPendingGoliathHitInfo(null),
    onClose: () => setPendingGoliathHitInfo(null),
    onConfirm: () => {
      if (showFire) {
        handleExecuteGoliathHit('fire');
      } else if (showFrost) {
        handleExecuteGoliathHit('frost');
      } else if (showHill && isLargeOrSmaller && !isTargetAlreadyProne) {
        handleExecuteGoliathHit('hill');
      } else {
        setPendingGoliathHitInfo(null);
      }
    },
    disabled: !pendingGoliathHitInfo,
  });

  if (!pendingGoliathHitInfo) return null;


  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-fadeIn" />
      <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-purple-500/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col p-6 text-slate-100 animate-scaleUp">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/50 flex items-center justify-center text-2xl shadow-lg shadow-purple-950/50">
            🏔️
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/40">
              Ancestral Gigante (Golias)
            </span>
            <h3 className="text-xl font-black text-purple-400 mt-1">Gatilho ao Acertar Ataque</h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          Você acertou um ataque em <strong className="text-amber-400">{targetNameForHit}</strong>!
          <br />
          Deseja gastar <strong className="text-purple-300">1 uso do seu Ancestral Gigante</strong> ({goliathAncestryUses}/{goliathAncestryMaxUses} restantes) para aplicar um efeito especial?
        </p>

        <div className="flex flex-col gap-3 mt-2">
          {/* Opção 1: Fire's Burn */}
          {showFire && (
            <button
              onClick={() => handleExecuteGoliathHit('fire')}
              className="w-full p-4 rounded-xl border border-orange-500/30 bg-orange-950/40 hover:bg-orange-900/60 transition text-left flex items-start gap-3 group cursor-pointer"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🔥</span>
              <div className="flex-1">
                <span className="font-bold text-orange-400 text-sm block">Queima do Fogo (Gigante do Fogo)</span>
                <span className="text-xs text-slate-400">Causa +1d10 de Dano de Fogo adicional imediatamente no alvo.</span>
              </div>
            </button>
          )}

          {/* Opção 2: Frost's Chill */}
          {showFrost && (
            <button
              onClick={() => handleExecuteGoliathHit('frost')}
              className="w-full p-4 rounded-xl border border-sky-500/30 bg-sky-950/40 hover:bg-sky-900/60 transition text-left flex items-start gap-3 group cursor-pointer"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">❄️</span>
              <div className="flex-1">
                <span className="font-bold text-sky-400 text-sm block">Frio do Gelo (Gigante do Gelo)</span>
                <span className="text-xs text-slate-400">Causa +1d6 de Dano de Frio adicional e reduz o deslocamento do alvo em 3m (2 células) até o início do seu próximo turno.</span>
              </div>
            </button>
          )}

          {/* Opção 3: Hill's Tumble */}
          {showHill && (
            <button
              onClick={() => handleExecuteGoliathHit('hill')}
              disabled={!isLargeOrSmaller || isTargetAlreadyProne}
              className={`w-full p-4 rounded-xl border transition text-left flex items-start gap-3 group ${
                isLargeOrSmaller && !isTargetAlreadyProne
                  ? 'border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/60 cursor-pointer'
                  : 'border-slate-800 bg-slate-950 text-slate-600 opacity-50 cursor-not-allowed'
              }`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">🪨</span>
              <div className="flex-1">
                <span className="font-bold text-amber-400 text-sm block">Queda da Colina (Gigante da Colina)</span>
                <span className="text-xs text-slate-400">
                  {isTargetAlreadyProne
                    ? 'Não disponível: O alvo já está caído.'
                    : isLargeOrSmaller 
                    ? 'Derruba o alvo no chão, aplicando a condição Caído.' 
                    : 'Não disponível: O alvo é muito grande para ser derrubado.'}
                </span>
              </div>
            </button>
          )}

          {/* Opção Cancelar */}
          <button
            onClick={() => setPendingGoliathHitInfo(null)}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-300 border border-slate-700 transition mt-2 text-center cursor-pointer"
          >
            Não usar habilidade (Poupar uso)
          </button>
        </div>
      </div>
    </div>
  );
};
