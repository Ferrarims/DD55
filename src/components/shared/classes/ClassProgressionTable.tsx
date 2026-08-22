import React from 'react';

interface ClassProgressionTableProps {
  currentClassData: any;
  progressionKeys: string[];
  getColLabel: (key: string) => string;
}

export const ClassProgressionTable: React.FC<ClassProgressionTableProps> = ({
  currentClassData,
  progressionKeys,
  getColLabel,
}) => {
  return (
    <div className="bg-slate-850 border border-slate-700 rounded-xl overflow-hidden shadow-md">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
          <span>📈</span> Tabela de Progressão de Nível
        </h4>
        <span className="text-[10px] bg-slate-950 px-2 py-0.5 text-amber-400 font-bold uppercase rounded border border-slate-800">1 ao 20</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[640px]">
          <thead>
            <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-700 uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4 font-black">Nível</th>
              <th className="py-3 px-4 font-black">Bônus Prof.</th>
              <th className="py-3 px-4 font-black">Características de Nível</th>
              {progressionKeys.map(k => (
                <th key={k} className="py-3 px-4 font-black text-center">{getColLabel(k)}</th>
              ))}
              {currentClassData.progression[0].spellSlots && (
                <th className="py-3 px-4 font-black text-center">Espaços de Magia (1º ao 9º Círculo)</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-750 bg-slate-900/20">
            {currentClassData.progression.map((row: any) => (
              <tr key={row.level} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-2.5 px-4 font-bold text-amber-400 bg-slate-950/20">{row.level}º</td>
                <td className="py-2.5 px-4 text-slate-300">{row.prof}</td>
                <td className="py-2.5 px-4 text-slate-200 font-medium leading-normal">{row.features}</td>
                {progressionKeys.map(k => (
                  <td key={k} className="py-2.5 px-4 text-slate-300 text-center font-mono bg-slate-950/10">
                    {row[k] !== undefined && row[k] !== null ? String(row[k]) : '—'}
                  </td>
                ))}
                {row.spellSlots !== undefined && (
                  <td className="py-2.5 px-4 text-center">
                    <div className="flex gap-1 justify-center">
                      {Array.isArray(row.spellSlots) ? (
                        <>
                          {row.spellSlots.map((slots: number, idx: number) => {
                            if (slots === 0) return null;
                            return (
                              <span key={idx} className="bg-fuchsia-950/50 text-fuchsia-300 text-[10px] px-1.5 py-0.5 rounded border border-fuchsia-900/40 font-mono" title={`Círculo ${idx + 1}: ${slots} espaços`}>
                                {idx + 1}º:{slots}
                              </span>
                            );
                          })}
                          {row.spellSlots.every((s: number) => s === 0) && <span className="text-slate-600">—</span>}
                        </>
                      ) : (
                        <span className="bg-fuchsia-950/50 text-fuchsia-300 text-[10px] px-1.5 py-0.5 rounded border border-fuchsia-900/40 font-mono" title={`Círculo ${row.slotLevel || row.warlockSlotLevel}: ${row.spellSlots} espaços`}>
                          {row.slotLevel || row.warlockSlotLevel}º:{row.spellSlots}
                        </span>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
