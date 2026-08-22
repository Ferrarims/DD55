import React from 'react';

interface EntityStatCardsProps {
  entity: any;
  character: any;
}

export const EntityStatCards: React.FC<EntityStatCardsProps> = ({
  entity,
  character,
}) => {
  const hpPercent = (entity.currentHp / entity.maxHp) * 100;

  const statsObj = entity.type === 'hero' 
    ? {
        str: character?.strength || 10,
        dex: character?.dexterity || 10,
        con: character?.constitution || 10,
        int: character?.intelligence || 10,
        wis: character?.wisdom || 10,
        cha: character?.charisma || 10
      }
    : entity.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

  const getModifier = (val: number) => {
    const mod = Math.floor((val - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const attributes = [
    { label: 'FOR', name: 'Força', value: statsObj.str, color: 'border-red-500/20 hover:border-red-500/40' },
    { label: 'DES', name: 'Destreza', value: statsObj.dex, color: 'border-emerald-500/20 hover:border-emerald-500/40' },
    { label: 'CON', name: 'Constituição', value: statsObj.con, color: 'border-orange-500/20 hover:border-orange-500/40' },
    { label: 'INT', name: 'Inteligência', value: statsObj.int, color: 'border-blue-500/20 hover:border-blue-500/40' },
    { label: 'SAB', name: 'Sabedoria', value: statsObj.wis, color: 'border-teal-500/20 hover:border-teal-500/40' },
    { label: 'CAR', name: 'Carisma', value: statsObj.cha, color: 'border-purple-500/20 hover:border-purple-500/40' },
  ];

  return (
    <>
      {/* Barra de Vida & Estatísticas Básicas */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
        <div className="md:col-span-6 space-y-2">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-400 flex items-center gap-1">❤️ Pontos de Vida</span>
            <span className="text-slate-200">
              {entity.currentHp} / {entity.maxHp} HP
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                hpPercent > 50 
                  ? 'bg-emerald-500' 
                  : hpPercent > 25 
                  ? 'bg-amber-500' 
                  : 'bg-rose-500'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        <div className="md:col-span-2 text-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-semibold">🛡️ Classe Armadura</span>
          <span className="text-base font-black text-amber-300">{entity.ac ?? entity.armor_class} CA</span>
        </div>

        <div className="md:col-span-2 text-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-semibold">🏃 Deslocamento</span>
          <span className="text-xs font-bold text-slate-200">
            {entity.speed} cel ({entity.speed * 1.5}m)
          </span>
        </div>

        <div className="md:col-span-2 text-center bg-slate-900/60 p-2 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 block font-semibold">⚡ Iniciativa Rolada</span>
          <span className="text-base font-bold text-indigo-300">{entity.initiative}</span>
        </div>
      </div>

      {/* Atributos / Habilidades */}
      <div>
        <h4 className="text-xs font-black text-amber-400/90 uppercase tracking-wider mb-2.5 border-b border-slate-800 pb-1 flex items-center gap-1">
          <span>📊</span> Atributos Principais
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {attributes.map(attr => (
            <div key={attr.label} className={`bg-slate-950 p-2.5 rounded-xl border ${attr.color} text-center transition`}>
              <span className="text-[9px] font-black text-slate-400 block">{attr.label}</span>
              <span className="text-sm font-black text-slate-100 block mt-0.5">{attr.value}</span>
              <span className="text-xs font-extrabold text-amber-400 mt-0.5 bg-slate-900 px-1.5 py-0.5 rounded-md inline-block">
                {getModifier(attr.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
