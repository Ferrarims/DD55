import React from 'react';

interface CombatStatsSectionProps {
  character: any;
  currentHp: number;
  hpBreakdown: any;
  currentAc: number;
  displayResistances: string[];
  currentExhaustion: number;
  pb: number;
  setShowHpAudit: (b: boolean) => void;
  setShowAcModal: (b: boolean) => void;
  getCharacterActiveFeats: (char: any) => string[];
  getMod: (val: number) => number;
  formatMod: (val: number) => string;
}

export const CombatStatsSection: React.FC<CombatStatsSectionProps> = ({
  character,
  currentHp,
  hpBreakdown,
  currentAc,
  displayResistances,
  currentExhaustion,
  pb,
  setShowHpAudit,
  setShowAcModal,
  getCharacterActiveFeats,
  getMod,
  formatMod,
}) => {
  return (
    <>
      {/* Estatísticas Rápidas de Combate */}
      <div className="grid grid-cols-7 gap-1">
        {/* PV Atual / Max */}
        <div
          onClick={() => setShowHpAudit(true)}
          className="bg-slate-800 border border-red-900/50 rounded-lg p-2 flex flex-col justify-between cursor-pointer hover:border-red-500/80 transition-all"
          title="Clique para abrir a Auditoria de PV"
        >
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[9px] font-extrabold uppercase text-red-400 tracking-wider flex items-center justify-center gap-0.5">
              <span>PV</span> <span className="text-[8px] text-red-400 underline">⚙️</span>
            </span>
            <span className="text-[9px] text-slate-400">
              Máx: {hpBreakdown.total}
            </span>
          </div>
          <div className="flex items-center justify-center h-full">
            <div className="text-sm font-black text-white text-center flex items-center justify-center gap-1">
              {currentHp} <span className="text-slate-500 text-[10px]">/ {hpBreakdown.total}</span>
            </div>
          </div>
        </div>

        {/* Classe de Armadura (CA) */}
        <div
          onClick={() => setShowAcModal(true)}
          className="bg-slate-800 border border-slate-700 hover:border-amber-500/80 rounded-lg p-2 text-center flex flex-col justify-center relative group cursor-pointer transition-all shadow-sm hover:shadow-amber-500/10"
          title="Clique para abrir a Auditoria do Motor de Regras de CA (D&D 2024 / 5.5e)"
        >
          <span className="text-[9px] font-extrabold uppercase text-slate-400 flex items-center justify-center gap-0.5">
            <span>CA</span> <span className="text-[8px] text-amber-400 underline">⚙️</span>
          </span>
          <div className="text-lg font-black text-amber-400">{currentAc}</div>
        </div>

        {/* Resistências */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-center flex flex-col justify-center">
          <span className="text-[9px] font-extrabold uppercase text-slate-400">Resistências</span>
          <div className="text-[10px] font-bold text-amber-200 mt-0.5">
            {displayResistances.length > 0 ? displayResistances.join(', ') : '-'}
          </div>
        </div>

        {/* Iniciativa */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-center flex flex-col justify-center">
          <span className="text-[9px] font-extrabold uppercase text-slate-400">Iniciativa</span>
          <div className="text-lg font-black text-amber-400">
            {(() => {
              const baseMod = getMod(character.dexterity || character.dex || 10);
              const hasAlert = getCharacterActiveFeats(character).some(
                f => f && (f.trim().toLowerCase() === 'alerta' || f.trim().toLowerCase() === 'alert')
              );
              const featBonus = hasAlert ? pb : 0;
              const totalMod = baseMod + featBonus;
              return totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
            })()}
          </div>
        </div>

        {/* Deslocamento */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-center flex flex-col justify-center">
          <span className="text-[9px] font-extrabold uppercase text-slate-400">Deslocamento</span>
          <div className="text-[10px] font-black text-slate-200 truncate flex flex-col gap-0.5">
            <span className={`${currentExhaustion > 0 ? 'line-through text-slate-500 text-[8px]' : ''}`}>
              {character.speed || '9m'}
            </span>
            {currentExhaustion > 0 && (
              <span className="text-red-400 text-[10px]">
                {(() => {
                  const baseSpeedStr = character.speed || '9m';
                  let baseMeters = 9;
                  const match = baseSpeedStr.match(/(\d+(\.\d+)?)/);
                  if (match) {
                    baseMeters = parseFloat(match[1]);
                  }
                  const penalty = currentExhaustion * 1.5;
                  const finalSpeed = Math.max(0, baseMeters - penalty);
                  return `${finalSpeed}m`;
                })()}
              </span>
            )}
          </div>
        </div>

        {/* Dado de Vida */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-center flex flex-col justify-center">
          <span className="text-[9px] font-extrabold uppercase text-slate-400">Dado de Vida</span>
          <div className="text-[10px] font-black text-slate-200">
            {character.hit_dice || 'd8'} ({character.hit_dice_current ?? character.level ?? 1}/
            {character.level || 1})
          </div>
        </div>

        {/* Exaustão */}
        <div
          className={`border rounded-lg p-2 text-center flex flex-col justify-center ${
            currentExhaustion > 0 ? 'bg-red-950/40 border-red-800/80' : 'bg-slate-800 border-slate-700'
          }`}
          title="O nível de exaustão é automático (Sede/Fome/Descansos)"
        >
          <span
            className={`text-[9px] font-extrabold uppercase flex items-center justify-center gap-0.5 ${
              currentExhaustion > 0 ? 'text-red-400' : 'text-slate-400'
            }`}
          >
            Exaustão {currentExhaustion > 0 ? '⚠️' : ''}
          </span>
          <div
            className={`text-lg font-black ${
              currentExhaustion > 0 ? 'text-red-400' : 'text-slate-500'
            }`}
          >
            {currentExhaustion}
          </div>
        </div>
      </div>

      {/* Atributos Básicos (3x2 ou 6x1) */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
        <div className="border-b border-slate-800 pb-2 mb-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Atributos e Modificadores
          </h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'FORÇAS (FOR)', val: character.str || character.strength || 10 },
            { label: 'DESTREZA (DES)', val: character.dex || character.dexterity || 10 },
            { label: 'CONSTITUIÇÃO (CON)', val: character.con || character.constitution || 10 },
            { label: 'INTELIGÊNCIA (INT)', val: character.int || character.intelligence || 10 },
            { label: 'SABEDORIA (SAB)', val: character.wis || character.wisdom || 10 },
            { label: 'CARISMA (CAR)', val: character.cha || character.charisma || 10 },
          ].map(stat => (
            <div
              key={stat.label}
              className="bg-slate-900 border border-slate-700/80 rounded-lg p-3 text-center flex flex-col items-center"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</span>
              <span className="text-2xl font-black text-amber-400 my-1">{formatMod(stat.val)}</span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                Valor: {stat.val}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
