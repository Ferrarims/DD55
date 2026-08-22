import React from 'react';

interface ClassSubclassesProps {
  ptName: string;
  classKey: string;
  subclasses: any[];
  selectedSubKey: string;
  setSelectedSubKey: (key: string) => void;
  loadingSubs: boolean;
}

export const ClassSubclasses: React.FC<ClassSubclassesProps> = ({
  ptName,
  classKey,
  subclasses,
  selectedSubKey,
  setSelectedSubKey,
  loadingSubs,
}) => {
  if (loadingSubs) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-6 text-center text-slate-400 text-sm">
        Carregando subclasses...
      </div>
    );
  }

  if (subclasses.length === 0) {
    return (
      <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-5 text-center text-slate-500 text-xs">
        Nenhuma subclasse cadastrada no momento para {ptName}.
      </div>
    );
  }

  return (
    <div className="bg-slate-850 border border-slate-700 rounded-xl p-5 space-y-6 shadow-md">
      <div className="border-b border-slate-700/80 pb-3">
        <h4 className="text-base font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
          <span>✨</span> Subclasses & Especializações
        </h4>
        <p className="text-xs text-slate-400 mt-1">
          Escolha uma das especializações de {ptName} disponíveis no sistema.
        </p>
      </div>

      {/* Subclass Tabs */}
      <div className="flex flex-wrap gap-2">
        {subclasses.map((sub) => {
          const subId = sub.id || sub.name;
          const isSelected = selectedSubKey === subId;
          return (
            <button
              key={subId}
              onClick={() => setSelectedSubKey(subId)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
                isSelected
                  ? 'bg-amber-600/20 border-amber-500/80 text-amber-300 shadow-sm'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {sub.name}
            </button>
          );
        })}
      </div>

      {/* Selected Subclass Details */}
      {subclasses.map((sub) => {
        const subId = sub.id || sub.name;
        if (selectedSubKey !== subId) return null;

        return (
          <div key={subId} className="space-y-6 animate-fade-in">
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-750/50">
              <h5 className="font-bold text-slate-200 text-sm mb-1.5">Sobre o {sub.name}</h5>
              <p className="text-xs text-slate-300 leading-relaxed">{sub.description}</p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Habilidades de Subclasse</h5>
              <div className="relative border-l-2 border-slate-700 ml-3 pl-5 space-y-5">
                {sub.features?.map((feat: any, fIdx: number) => (
                  <div key={fIdx} className="relative">
                    <span className="absolute -left-[27px] top-1 w-3 h-3 bg-amber-500 border-2 border-slate-800 rounded-full shadow-sm" />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-amber-400 font-bold text-xs">{feat.level}º Nível</span>
                        <span className="font-bold text-slate-200 text-sm">{feat.name}</span>
                        {feat.actionType && (
                          <span className="text-[10px] px-2 py-0.5 bg-slate-850 border border-slate-700 text-slate-400 rounded-md font-medium">
                            {feat.actionType}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">{feat.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Maneuvers Special Case (BattleMaster) */}
            {sub.maneuvers && (
              <div className="space-y-3 pt-4 border-t border-slate-700/60">
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <span>🎯</span> Manobras do Mestre da Batalha ({sub.maneuvers.length})
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sub.maneuvers.map((man: any, mIdx: number) => (
                    <div key={mIdx} className="bg-slate-900/25 border border-slate-800 p-3 rounded-lg hover:border-slate-700 transition-all">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-slate-200 text-xs">{man.name}</span>
                        <span className="text-[9px] bg-slate-950/60 border border-slate-800/60 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold">
                          {man.actionType}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal">{man.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
