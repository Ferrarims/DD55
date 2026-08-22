import React from 'react';

interface LevelUpHpGainPanelProps {
  hitDieStr: string;
  hitDieVal: number;
  hpGainMode: 'avg' | 'roll';
  setHpGainMode: (m: 'avg' | 'roll') => void;
  avgHpGain: number;
  rolledValue: number | null;
  rolledHpGain: number;
  handleRollHitDie: () => void;
  isRolling: boolean;
  currentMax: number;
  nextMaxHp: number;
  conMod: number;
  isDwarf: boolean;
  previewHasTough: boolean;
}

export const LevelUpHpGainPanel: React.FC<LevelUpHpGainPanelProps> = ({
  hitDieStr,
  hitDieVal,
  hpGainMode,
  setHpGainMode,
  avgHpGain,
  rolledValue,
  rolledHpGain,
  handleRollHitDie,
  isRolling,
  currentMax,
  nextMaxHp,
  conMod,
  isDwarf,
  previewHasTough,
}) => {
  return (
    <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
          <span>🎲</span> Dado de Vida &amp; PV
        </h3>
        <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-semibold border border-slate-700">
          {hitDieStr.startsWith('d') ? hitDieStr : `d${hitDieVal}`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {/* Opção Média */}
        <button
          type="button"
          onClick={() => setHpGainMode('avg')}
          className={`p-2 rounded-lg border text-left transition flex flex-col justify-between cursor-pointer ${
            hpGainMode === 'avg'
              ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/50 shadow-md'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <span className="font-bold text-[10px] uppercase text-amber-400 flex items-center gap-1">
              📊 Média
            </span>
            {hpGainMode === 'avg' && (
              <span className="text-[8px] bg-amber-400 text-slate-950 px-1 py-0.2 rounded font-black tracking-wider uppercase">
                Selecionado
              </span>
            )}
          </div>
          <div className="text-base font-black text-white my-0.5">
            + {avgHpGain} PV
          </div>
          <div className="text-[9px] text-slate-400 font-medium">
            {Math.floor(hitDieVal / 2) + 1} Base + CON
          </div>
        </button>

        {/* Opção Rolar */}
        <div
          onClick={() => {
            setHpGainMode('roll');
            if (rolledValue === null && !isRolling) {
              handleRollHitDie();
            }
          }}
          className={`p-2 rounded-lg border flex flex-col justify-between transition cursor-pointer ${
            hpGainMode === 'roll'
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/50 shadow-md'
              : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex justify-between items-center w-full">
            <span className="font-bold text-[10px] uppercase text-emerald-400 flex items-center gap-1">
              🎲 Rolar
            </span>
            <div className="flex items-center gap-1">
              {rolledValue !== null && (
                <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 px-1 rounded border border-emerald-700/50">
                  Dado: {rolledValue}
                </span>
              )}
              {hpGainMode === 'roll' && (
                <span className="text-[8px] bg-emerald-400 text-slate-950 px-1 py-0.2 rounded font-black tracking-wider uppercase">
                  Selecionado
                </span>
              )}
            </div>
          </div>

          <div className="text-base font-black text-white my-0.5">
            {rolledValue !== null ? `+ ${rolledHpGain} PV` : `+ ${avgHpGain} PV`}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleRollHitDie();
            }}
            disabled={isRolling}
            className="w-full mt-0.5 py-1 px-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[9px] rounded transition shadow flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
          >
            <span>
              {isRolling
                ? 'Rolando...'
                : rolledValue !== null
                ? `Rolar Novamente (1${hitDieStr.startsWith('d') ? hitDieStr : `d${hitDieVal}`})`
                : `Rolar 1${hitDieStr.startsWith('d') ? hitDieStr : `d${hitDieVal}`}`}
            </span>
          </button>
        </div>
      </div>

      <div className="bg-slate-900/90 px-2.5 py-2 rounded border border-slate-800 flex flex-col gap-1.5 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
            Novo Máximo de PV:
          </span>
          <span className="font-black text-amber-300 flex items-center gap-1.5">
            <span className="text-slate-500 line-through decoration-slate-600/50">
              {currentMax}
            </span>
            <span className="text-slate-400">➔</span>
            <span className="text-emerald-400 text-sm font-black drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
              {nextMaxHp} PV
            </span>
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1 text-[9px] text-slate-500 font-medium border-t border-slate-800/50 pt-1">
          <span className="bg-slate-950 px-1 rounded text-slate-400">
            {currentMax} PV atuais
          </span>
          <span>+</span>
          <div className="flex items-center gap-1 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800/50">
            <span className="text-emerald-400 font-bold">
              {hpGainMode === 'avg'
                ? Math.floor(hitDieVal / 2) + 1
                : rolledValue !== null
                ? rolledValue
                : Math.floor(hitDieVal / 2) + 1}
            </span>
            <span className="text-[8px] opacity-60 uppercase">
              {hpGainMode === 'avg' ? 'Média' : 'Dado'}
            </span>
          </div>
          <span>+</span>
          <div className="flex items-center gap-1 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800/50">
            <span className="text-sky-400 font-bold">
              {conMod >= 0 ? `+${conMod}` : conMod}
            </span>
            <span className="text-[8px] opacity-60 uppercase">Con</span>
          </div>
          {isDwarf && (
            <>
              <span>+</span>
              <div className="flex items-center gap-1 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-900/30">
                <span className="text-amber-400 font-bold">+1</span>
                <span className="text-[8px] opacity-60 uppercase">Raça</span>
              </div>
            </>
          )}
          {previewHasTough && (
            <>
              <span>+</span>
              <div className="flex items-center gap-1 bg-amber-950/30 px-1.5 py-0.5 rounded border border-amber-900/30">
                <span className="text-amber-400 font-bold">+2</span>
                <span className="text-[8px] opacity-60 uppercase">Talento</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
