import React from 'react';

interface LatestRollData {
  id: string;
  attackerName: string;
  defenderName: string;
  logTitle: string;
  logDetail: string;
  isCritical?: boolean;
  isFumble?: boolean;
  hit?: boolean;
  damage: number;
}

interface AttackRollHudProps {
  latestRoll: LatestRollData | null;
  onClose: () => void;
}

export const AttackRollHud: React.FC<AttackRollHudProps> = ({ latestRoll, onClose }) => {
  if (!latestRoll) return null;

  return (
    <div
      id="attack-roll-hud"
      key={latestRoll.id}
      className="fixed bottom-4 right-4 z-[9999] max-w-sm w-[340px] bg-slate-900/95 border-2 border-amber-500 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 text-slate-100 backdrop-blur-md overflow-hidden transform transition-all duration-300 ease-out animate-[bounce_0.5s_ease-out_1]"
      style={{
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.7)',
      }}
    >
      {/* Linha de Destaque Vermelho/Ouro */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-red-500" />

      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
          🎲 Jogada de Ataque (Attack Roll)
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-full transition text-xs w-6 h-6 flex items-center justify-center cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex gap-3 items-center">
        {/* Dado D20 Estilizado */}
        <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-inner">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-red-500/10" />
          <svg
            className="w-10 h-10 text-red-600/80 animate-pulse"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <polygon
              points="50,5 95,25 95,75 50,95 5,75 5,25"
              fill="none"
              stroke="currentColor"
              strokeWidth="5"
            />
            <polygon
              points="50,5 50,95"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <polygon
              points="5,25 95,25"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <polygon
              points="5,75 95,75"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            />
            <polygon
              points="50,35 15,55 85,55"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <div className="absolute font-black text-base text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
            {latestRoll.logDetail.match(/D20:\s*(\d+)/)?.[1] || '20'}
          </div>
        </div>

        {/* Informações dos Lutadores */}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate">
            ⚔️ {latestRoll.attackerName} vs {latestRoll.defenderName}
          </div>
          <div className="text-xs font-black text-amber-400 leading-snug mt-0.5">
            {latestRoll.logTitle}
          </div>
        </div>
      </div>

      {/* Resultado do Golpe (HIT/MISS/CRIT/FUMBLE) */}
      <div className="flex items-center gap-2">
        <span
          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
            latestRoll.isCritical
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-bounce'
              : latestRoll.isFumble
              ? 'bg-red-500/20 text-red-400 border-red-500/50'
              : latestRoll.hit
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
          }`}
        >
          {latestRoll.isCritical
            ? '💥 Crítico!'
            : latestRoll.isFumble
            ? '💀 Desastre!'
            : latestRoll.hit
            ? '🎯 Acerto'
            : '❌ Errou'}
        </span>

        {/* Valor de Dano */}
        {latestRoll.hit && latestRoll.damage > 0 && (
          <span className="text-xs font-bold text-emerald-400">
            Causou{' '}
            <strong className="text-sm font-extrabold text-emerald-300">
              {latestRoll.damage}
            </strong>{' '}
            de dano!
          </span>
        )}
      </div>

      {/* Descrição Detalhada da Rolada de Dados e Maestria */}
      <div className="bg-slate-950 border border-slate-800 p-2 rounded-xl text-[10px] text-slate-300 font-mono leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
        {latestRoll.logDetail}
      </div>
    </div>
  );
};
