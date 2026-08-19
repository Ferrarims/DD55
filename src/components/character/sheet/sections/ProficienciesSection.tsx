import React from 'react';

export const ProficienciesSection: React.FC<{
  character: any;
}> = ({
  character,
}) => {
  const skills = character.skillProficiencies || character.skill_proficiencies || [];
  const tools = character.toolProficiencies || character.tool_proficiencies || [];
  
  const weapons = character.weaponProficiencies || character.weapon_proficiencies || 
    (['Guerreiro', 'Fighter', 'Paladino', 'Paladin', 'Bárbaro', 'Barbarian', 'Patrulheiro', 'Ranger'].some(c => (character.class_name || '').includes(c))
      ? ['Armas Simples', 'Armas Marciais']
      : ['Armas Simples']);

  const armor = character.armorProficiencies || character.armor_proficiencies ||
    (['Guerreiro', 'Fighter', 'Paladino', 'Paladin'].some(c => (character.class_name || '').includes(c))
      ? ['Todas as armaduras', 'Escudos']
      : ['Armaduras Leves', 'Armaduras Médias', 'Escudos']);

  return (
    <div className="bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl w-full mb-4 shadow-lg animate-in fade-in duration-300">
      <div className="flex flex-col gap-3">
        {/* Perícias */}
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 flex items-center gap-1.5"><span className="text-sky-400">🎯</span> PERÍCIAS PROFICIENTES</div>
          <div className="flex flex-wrap gap-1.5">
            {skills.length > 0 ? (
              skills.map((s: string, idx: number) => (
                <span key={idx} className="bg-sky-950/40 text-sky-200 border border-sky-500/30 px-2.5 py-0.5 rounded-md text-[11px] font-semibold shadow-sm">{s}</span>
              ))
            ) : (
              <span className="text-slate-600 text-xs italic">Nenhuma registrada</span>
            )}
          </div>
        </div>

        {/* Armas */}
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 flex items-center gap-1.5"><span className="text-amber-400">⚔️</span> ARMAS PROFICIENTES</div>
          <div className="flex flex-wrap gap-1.5">
            {weapons.length > 0 ? (
              weapons.map((w: string, idx: number) => (
                <span key={idx} className="bg-amber-950/40 text-amber-200 border border-amber-500/30 px-2.5 py-0.5 rounded-md text-[11px] font-semibold shadow-sm">{w}</span>
              ))
            ) : (
              <span className="text-slate-600 text-xs italic">Armas Simples</span>
            )}
          </div>
        </div>

        {/* Armaduras */}
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 flex items-center gap-1.5"><span className="text-emerald-400">🛡️</span> ARMADURAS PROFICIENTES</div>
          <div className="flex flex-wrap gap-1.5">
            {armor.length > 0 ? (
              armor.map((a: string, idx: number) => (
                <span key={idx} className="bg-emerald-950/40 text-emerald-200 border border-emerald-500/30 px-2.5 py-0.5 rounded-md text-[11px] font-semibold shadow-sm">{a}</span>
              ))
            ) : (
              <span className="text-slate-600 text-xs italic">Nenhuma</span>
            )}
          </div>
        </div>

        {/* Ferramentas */}
        {(tools && tools.length > 0) && (
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 flex items-center gap-1.5"><span className="text-purple-400">🛠️</span> FERRAMENTAS PROFICIENTES</div>
            <div className="flex flex-wrap gap-1.5">
              {tools.map((t: string, idx: number) => (
                <span key={idx} className="bg-purple-950/40 text-purple-200 border border-purple-500/30 px-2.5 py-0.5 rounded-md text-[11px] font-semibold shadow-sm">{t}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

