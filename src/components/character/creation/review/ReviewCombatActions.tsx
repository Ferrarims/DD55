import React from 'react';

interface ReviewCombatActionsProps {
  attacksList: any[];
  charClass: string;
}

export const ReviewCombatActions: React.FC<ReviewCombatActionsProps> = ({
  attacksList,
  charClass,
}) => {
  return (
    <div className="space-y-4">
      {/* Attacks Panel */}
      <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-3">Ataques e Truques</span>
        <div className="space-y-2">
          {attacksList.map((atk, idx) => (
            <div key={idx} className="flex flex-col gap-1 bg-slate-950 p-2.5 rounded border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-200">{atk.name}</span>
                    <span className="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">Ação</span>
                  </div>
                  {atk.range && <span className="text-[10px] text-slate-500 uppercase tracking-widest">{atk.range}</span>}
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className={`font-black ${atk.bonus >= 0 ? 'text-green-400' : 'text-red-400'}`}>{atk.bonus >= 0 ? '+' : ''}{atk.bonus}</span>
                  <span className="text-amber-500 font-bold">{atk.damage} <span className="text-[10px] text-slate-500 font-normal ml-1">({atk.type})</span></span>
                </div>
              </div>
              {atk.mastery && ['Barbarian', 'Fighter', 'Paladin', 'Ranger', 'Rogue'].includes(charClass) && (
                <div className="text-[10px] text-emerald-400 font-semibold bg-emerald-900/20 px-2 py-0.5 rounded w-fit border border-emerald-900/30 mt-1">
                  Maestria: {atk.mastery}
                </div>
              )}
              {atk.properties && (
                <div className="text-[9px] text-slate-400 font-medium italic mt-0.5">
                  {atk.properties}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions / Reactions Panel */}
      <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
        <span className="block text-[10px] text-slate-500 uppercase font-bold mb-3">Ações Especiais e Reações</span>
        <div className="space-y-2">
          {attacksList.filter(a => a.properties?.includes('Leve')).length >= 2 && (
            <div className="flex flex-col gap-1 bg-slate-950 p-2.5 rounded border border-slate-800 border-dashed">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200">Combate c/ Duas Armas</span>
                    <span className="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">Ação Bônus</span>
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Requer 2 armas Leves</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Quando ataca com arma Leve, pode fazer um ataque extra com outra arma Leve na mão secundária.</p>
            </div>
          )}

          <div className="flex flex-col gap-1 bg-slate-950 p-2.5 rounded border border-slate-800 border-dashed">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200">Ataque de Oportunidade</span>
                  <span className="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">Reação</span>
                </div>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Gatilho: Inimigo sai do alcance corporal</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Realiza 1 ataque corpo a corpo contra a criatura que sair do seu alcance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
