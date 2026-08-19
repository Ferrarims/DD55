import React from 'react';

interface InitiativeRollEntry {
  id: string;
  isHero?: boolean;
  icon?: string;
  name: string;
  d20: number;
  mod: number;
  total: number;
}

interface LatestInitiativeRollData {
  id: string;
  rolls: InitiativeRollEntry[];
  firstToActName: string;
}

interface InitiativeRollHudProps {
  latestInitiativeRoll: LatestInitiativeRollData | null;
  onClose: () => void;
}

export const InitiativeRollHud: React.FC<InitiativeRollHudProps> = ({
  latestInitiativeRoll,
  onClose,
}) => {
  if (!latestInitiativeRoll) return null;

  return (
    <div
      id="initiative-roll-hud"
      key={latestInitiativeRoll.id}
      className="fixed bottom-4 right-4 z-[9999] max-w-sm w-[350px] bg-slate-900/95 border-2 border-amber-500/80 rounded-2xl shadow-2xl p-4 flex flex-col gap-3 text-slate-100 backdrop-blur-md overflow-hidden transform transition-all duration-300 ease-out animate-[bounce_0.5s_ease-out_1]"
      style={{
        boxShadow:
          '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 10px 10px -5px rgba(0, 0, 0, 0.7)',
      }}
    >
      {/* Linha de Destaque Dourada / Indigo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />

      {/* Cabeçalho */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
          ⚡ Rolagem de Iniciativa
        </span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-slate-800 p-1 rounded-full transition text-xs w-6 h-6 flex items-center justify-center cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Lista das rolagens de todos os combatentes */}
      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
        {latestInitiativeRoll.rolls.map((r, idx) => (
          <div
            key={`${r.id || 'init-roll'}-${idx}`}
            className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs font-mono transition ${
              r.isHero
                ? 'bg-blue-950/60 border-blue-500/40 text-blue-200'
                : 'bg-red-950/40 border-red-500/30 text-red-200'
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="text-sm">{r.icon}</span>
              <span className="font-bold font-sans truncate">{r.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] shrink-0">
              <span className="text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                d20({r.d20}) {r.mod >= 0 ? `+${r.mod}` : r.mod}
              </span>
              <span className="font-black text-amber-300 text-xs bg-slate-900 border border-amber-500/40 px-2 py-0.5 rounded-lg shadow">
                = {r.total}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Destaque de quem joga primeiro */}
      <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-400/40 rounded-xl p-2.5 flex items-center justify-between gap-2 shadow text-xs">
        <span className="font-black text-amber-300 flex items-center gap-1 shrink-0">
          👑 Primeiro a Agir:
        </span>
        <span className="font-extrabold text-emerald-300 truncate">
          {latestInitiativeRoll.firstToActName}
        </span>
      </div>
    </div>
  );
};
