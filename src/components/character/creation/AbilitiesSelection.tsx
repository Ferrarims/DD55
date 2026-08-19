import { STAT_NAMES, StatKey, POINT_COSTS } from './constants';
import { CLASSES } from './constants';
import { RefObject } from 'react';

interface Props {
  statMethod: 'standard' | 'pointbuy' | 'roll';
  setStatMethod: (method: 'standard' | 'pointbuy' | 'roll') => void;
  baseStats: Record<StatKey, number>;
  setBaseStats: (stats: Record<StatKey, number>) => void;
  unassignedStandard: number[];
  setUnassignedStandard: (unassigned: number[]) => void;
  rolledScores: number[];
  setRolledScores: (scores: number[]) => void;
  unassignedRolls: number[];
  setUnassignedRolls: (unassigned: number[]) => void;
  bgBonuses: { stat: StatKey; value: number }[];
  currentClass: typeof CLASSES[keyof typeof CLASSES];
  assignStat: (stat: StatKey, val: number) => void;
  rollStats: () => void;
  getPointsSpent: () => number;
  getFinalStat: (stat: StatKey) => number;
  firstStatSelectRef: RefObject<HTMLSelectElement | HTMLButtonElement | null>;
}

export function AbilitiesSelection({
  statMethod, setStatMethod, baseStats, setBaseStats, unassignedStandard, setUnassignedStandard,
  rolledScores, setRolledScores, unassignedRolls, setUnassignedRolls, bgBonuses,
  currentClass, assignStat, rollStats, getPointsSpent, getFinalStat, firstStatSelectRef
}: Props) {
  const calculateModifier = (score: number) => Math.floor((score - 10) / 2);
  const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <label className="block text-xs font-bold text-slate-500 uppercase">Geração de Atributos</label>
        <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
          <button onClick={() => { setStatMethod('standard'); setBaseStats({str:0,dex:0,con:0,int:0,wis:0,cha:0}); setUnassignedStandard(STANDARD_ARRAY); }} className={`px-3 py-1 text-xs rounded ${statMethod === 'standard' ? 'bg-slate-800 text-amber-500 font-bold' : 'text-slate-400'}`}>Padrão</button>
          <button onClick={() => { setStatMethod('pointbuy'); setBaseStats({str:8,dex:8,con:8,int:8,wis:8,cha:8}); }} className={`px-3 py-1 text-xs rounded ${statMethod === 'pointbuy' ? 'bg-slate-800 text-amber-500 font-bold' : 'text-slate-400'}`}>Pontos</button>
          <button onClick={() => { setStatMethod('roll'); rollStats(); }} className={`px-3 py-1 text-xs rounded ${statMethod === 'roll' ? 'bg-slate-800 text-amber-500 font-bold' : 'text-slate-400'}`}>Rolar</button>
        </div>
      </div>

      {statMethod === 'pointbuy' && (() => {
        const remainingPoints = 27 - getPointsSpent();
        return (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6 flex justify-between items-center">
            <span className="text-sm text-slate-400">Pontos Disponíveis:</span>
            <span className={`text-2xl font-black ${remainingPoints === 0 ? 'text-green-500' : remainingPoints < 0 ? 'text-red-500' : 'text-amber-500'}`}>
              {remainingPoints}
            </span>
          </div>
        );
      })()}

      {statMethod === 'standard' && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
          <span className="text-xs text-slate-400 uppercase block mb-2">Valores para Atribuir:</span>
          <div className="flex gap-2 flex-wrap">
            {unassignedStandard.map((val, i) => (
              <div key={i} className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-slate-200 border border-slate-600">{val}</div>
            ))}
            {unassignedStandard.length === 0 && <span className="text-sm text-green-500 italic">Todos distribuídos!</span>}
          </div>
        </div>
      )}

      {statMethod === 'roll' && (
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-slate-400 uppercase block">Valores Rolados (4d6 drop lowest):</span>
            <button onClick={rollStats} className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded text-amber-500 border border-slate-700">Rolar Novamente</button>
          </div>
          <div className="flex gap-2 flex-wrap">
            {unassignedRolls.map((val, i) => (
              <div key={i} className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center font-bold text-slate-200 border border-slate-600">{val}</div>
            ))}
            {unassignedRolls.length === 0 && rolledScores.length > 0 && <span className="text-sm text-green-500 italic">Todos distribuídos!</span>}
            {rolledScores.length === 0 && <span className="text-sm text-slate-500 italic">Clique em Rolar Novamente.</span>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as StatKey[]).map((stat, idx) => {
          const bgBonus = bgBonuses.find(b => b.stat === stat)?.value || 0;
          const val = baseStats[stat];
          const finalVal = Math.min(20, val + bgBonus);
          const isMain = currentClass.mainStats.includes(stat);

          return (
            <div key={stat} className={`bg-slate-950 p-3 rounded-xl border ${isMain ? 'border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'border-slate-800'}`}>
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-black uppercase ${isMain ? 'text-amber-500' : 'text-slate-400'}`}>{STAT_NAMES[stat]}</span>
                {bgBonus > 0 && <span className="text-[10px] bg-amber-500/20 text-amber-500 px-1 rounded border border-amber-500/30">+{bgBonus} Bg</span>}
              </div>
              
              {statMethod === 'pointbuy' ? (
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setBaseStats({...baseStats, [stat]: Math.max(8, val - 1)})}
                    className="w-8 h-8 bg-slate-900 border border-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-30"
                    disabled={val <= 8}
                  >-</button>
                  <span className="text-xl font-bold">{val}</span>
                  <button 
                    ref={idx === 0 ? (firstStatSelectRef as any) : undefined}
                    onClick={() => setBaseStats({...baseStats, [stat]: Math.min(15, val + 1)})}
                    className="w-8 h-8 bg-slate-900 border border-slate-700 rounded text-slate-400 hover:text-white disabled:opacity-30"
                    disabled={val >= 15 || (27 - getPointsSpent() - ((POINT_COSTS[val+1] ?? 0) - (POINT_COSTS[val] ?? 0))) < 0}
                  >+</button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <select
                    ref={idx === 0 ? (firstStatSelectRef as any) : undefined}
                    autoFocus={idx === 0}
                    value={val}
                    onChange={(e) => assignStat(stat, parseInt(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-center font-bold text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="0" className="bg-slate-900 text-slate-150">-</option>
                    {val > 0 && <option value={val} className="bg-slate-900 text-slate-150">{val}</option>}
                    {(statMethod === 'standard' ? unassignedStandard : unassignedRolls).map((v, i) => (
                      <option key={i} value={v} className="bg-slate-900 text-slate-150">{v}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="mt-3 pt-2 border-t border-slate-800 text-center flex justify-between px-1">
                <span className="text-[10px] text-slate-500">Total: <b className="text-white">{val > 0 ? `${val} + ${bgBonus} = ` : ''}{finalVal}</b></span>
                <span className="text-[10px] text-slate-500">Mod: <b className={calculateModifier(finalVal) >= 0 ? 'text-green-400' : 'text-red-400'}>{calculateModifier(finalVal) >= 0 ? '+' : ''}{calculateModifier(finalVal)}</b></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
