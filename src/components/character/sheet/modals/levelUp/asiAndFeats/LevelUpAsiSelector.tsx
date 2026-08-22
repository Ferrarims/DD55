import React from 'react';
import { StatKey, STAT_NAMES } from '../../../constants';

interface LevelUpAsiSelectorProps {
  character: any;
  asiMode: 'single' | 'double';
  setAsiMode: (m: 'single' | 'double') => void;
  asiStat1: StatKey;
  setAsiStat1: (s: StatKey) => void;
  asiStat2: StatKey;
  setAsiStat2: (s: StatKey) => void;
}

export const LevelUpAsiSelector: React.FC<LevelUpAsiSelectorProps> = ({
  character,
  asiMode,
  setAsiMode,
  asiStat1,
  setAsiStat1,
  asiStat2,
  setAsiStat2,
}) => {
  const statsKeys: StatKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

  const getStatCurrentVal = (st: StatKey) => {
    return character[
      st === 'str'
        ? 'strength'
        : st === 'dex'
        ? 'dexterity'
        : st === 'con'
        ? 'constitution'
        : st === 'int'
        ? 'intelligence'
        : st === 'wis'
        ? 'wisdom'
        : 'charisma'
    ] || 10;
  };

  return (
    <div className="space-y-1.5 pt-0.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setAsiMode('single')}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
            asiMode === 'single'
              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          +2 em um Atributo
        </button>
        <button
          type="button"
          onClick={() => {
            setAsiMode('double');
            if (asiStat1 === asiStat2) {
              setAsiStat2(asiStat1 === 'str' ? 'con' : 'str');
            }
          }}
          className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
            asiMode === 'double'
              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}
        >
          +1 em dois Atributos
        </button>
      </div>

      {asiMode === 'single' ? (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
          {statsKeys.map(st => {
            const currentVal = getStatCurrentVal(st);
            const isAtMax = currentVal >= 20;
            const isSelected = asiStat1 === st;

            return (
              <button
                key={st}
                type="button"
                disabled={isAtMax}
                onClick={() => setAsiStat1(st)}
                className={`p-1.5 rounded border text-center transition flex flex-col justify-between items-center ${
                  isAtMax
                    ? 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                    : isSelected
                    ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-bold shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-[9px] font-bold uppercase">{STAT_NAMES[st]}</div>
                <div className="text-[10px]">
                  {isAtMax ? (
                    <span className="text-red-400 font-bold text-[9px]">20 (MÁX)</span>
                  ) : (
                    <span>
                      {currentVal} ➔{' '}
                      <strong className="text-emerald-400">
                        {Math.min(20, currentVal + 2)}
                      </strong>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
            {statsKeys.map(st => {
              const currentVal = getStatCurrentVal(st);
              const isAtMax = currentVal >= 20;
              const isSelected = asiStat1 === st || asiStat2 === st;

              const handleToggleDouble = () => {
                if (isAtMax) return;
                if (st === asiStat1) {
                  setAsiStat1(asiStat2);
                  setAsiStat2(st);
                  return;
                }
                if (st === asiStat2) {
                  return;
                }
                setAsiStat1(asiStat2);
                setAsiStat2(st);
              };

              return (
                <button
                  key={st}
                  type="button"
                  disabled={isAtMax}
                  onClick={handleToggleDouble}
                  className={`p-1.5 rounded border text-center transition flex flex-col justify-between items-center ${
                    isAtMax
                      ? 'bg-slate-950 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                      : isSelected
                      ? 'bg-amber-500/30 border-amber-400 text-amber-200 font-bold shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-[9px] font-bold uppercase">{STAT_NAMES[st]}</div>
                  <div className="text-[10px]">
                    {isAtMax ? (
                      <span className="text-red-400 font-bold text-[9px]">20 (MÁX)</span>
                    ) : (
                      <span>
                        {currentVal} ➔{' '}
                        <strong className={isSelected ? 'text-emerald-400' : 'text-slate-400'}>
                          {Math.min(20, currentVal + 1)}
                        </strong>
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
