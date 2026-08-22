import React from 'react';
import { RACES_REFERENCE } from '../../../../lib/api/references';

interface ReviewHeaderMetricsProps {
  currentClass: any;
  race: string;
  ac: number;
  acResult: any;
  calculateModifier: (score: number) => number;
  getFinalStat: (stat: string) => number;
  currentFeat: string;
  currentBg: any;
  charClass: string;
}

export const ReviewHeaderMetrics: React.FC<ReviewHeaderMetricsProps> = ({
  currentClass,
  race,
  ac,
  acResult,
  calculateModifier,
  getFinalStat,
  currentFeat,
  currentBg,
  charClass,
}) => {
  const senses = [];
  const raceInfo = (RACES_REFERENCE as any)[race];
  if (raceInfo && raceInfo.traits) {
    const darkvision = raceInfo.traits.find((t: any) => t.name.includes('Visão no Escuro'));
    if (darkvision) senses.push(darkvision.name);
  }
  
  const res = [];
  if (['Aasimar'].includes(race)) res.push('Radiante', 'Necrótico');
  if (['Anão', 'Dwarf'].includes(race)) res.push('Veneno');
  if (['Draconato', 'Dragonborn'].includes(race)) res.push('Elemento Dracônico');
  if (['Tiferino', 'Tiefling'].includes(race)) res.push('Fogo');
  if (['Golias', 'Goliath'].includes(race)) res.push('Físico');

  let spellcastingStat: 'int' | 'wis' | 'cha' | null = null;
  if (['Wizard'].includes(charClass)) spellcastingStat = 'int';
  if (['Cleric', 'Druid', 'Ranger'].includes(charClass)) spellcastingStat = 'wis';
  if (['Bard', 'Sorcerer', 'Warlock', 'Paladin'].includes(charClass)) spellcastingStat = 'cha';
  const spellMod = spellcastingStat ? calculateModifier(getFinalStat(spellcastingStat)) : 0;
  const dc = spellcastingStat ? 8 + 2 + spellMod : 0;
  const attackBonus = spellcastingStat ? 2 + spellMod : 0;

  const dexMod = calculateModifier(getFinalStat('dex'));
  const isAlert = currentFeat.includes('Alerta') || currentFeat.includes('Alert');
  const totalInit = dexMod + (isAlert ? 2 : 0);

  return (
    <>
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">HP</span>
          <span className="text-2xl font-black text-red-400 flex items-center justify-center h-8">
            {(currentClass?.hpBase || 8) + calculateModifier(getFinalStat('con')) + (['Anão', 'Dwarf'].includes(race) ? 1 : 0)}
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Dados de Vida</span>
          <span className="text-2xl font-black text-rose-400 flex items-center justify-center h-8">
            1d{currentClass?.hpBase || 8}
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800 relative group cursor-help" title={acResult?.explanation}>
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">CA</span>
          <div className="flex flex-col items-center justify-center h-8">
            <span className="text-2xl font-black text-blue-400">{ac}</span>
            {acResult?.shieldActive && (
              <span className="text-[8px] text-blue-300 font-bold bg-blue-900/30 px-1 py-0.5 rounded">
                (+{acResult.shieldBonus} Escudo)
              </span>
            )}
            {acResult?.twoHandedWeaponBlockedShield && (
              <span className="text-[8px] text-amber-400 font-bold bg-amber-950/60 px-1 py-0.5 rounded" title="Escudo não ativo por empunhar arma de 2 mãos">
                (Escudo Inativo: Arma 2 Mãos)
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Deslocamento</span>
          <span className="text-xl font-black text-purple-400 flex items-center justify-center h-8">
            {RACES_REFERENCE[race]?.speed || '9m'}
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Iniciativa</span>
          <span className="text-2xl font-black text-green-400 flex items-center justify-center h-8">
            {totalInit >= 0 ? `+${totalInit}` : `${totalInit}`}
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Proficiência</span>
          <span className="text-2xl font-black text-blue-400 flex items-center justify-center h-8">+2</span>
        </div>

        <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Percep. Passiva</span>
          <span className="text-2xl font-black text-indigo-400 flex items-center justify-center h-8">
            {10 + calculateModifier(getFinalStat('wis')) + ((currentBg?.skillProficiencies || []).includes('Percepção') ? 2 : 0)}
          </span>
        </div>

        <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Talento de Origem</span>
          <span className="text-[11px] font-bold text-amber-500 flex items-center justify-center h-8 leading-tight">{currentFeat}</span>
        </div>

        {spellcastingStat && (
          <>
            <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">CD Magia</span>
              <span className="text-2xl font-black text-fuchsia-400 flex items-center justify-center h-8">{dc}</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Ataque Mágico</span>
              <span className="text-2xl font-black text-fuchsia-400 flex items-center justify-center h-8">{attackBonus >= 0 ? '+' : ''}{attackBonus}</span>
            </div>
          </>
        )}
      </div>

      {(senses.length > 0 || res.length > 0) && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {senses.length > 0 && (
            <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Sentidos Especiais</span>
              <span className="text-xs font-bold text-violet-400 flex items-center justify-center h-6">{senses.join(', ')}</span>
            </div>
          )}
          {res.length > 0 && (
            <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Resistências Raciais</span>
              <span className="text-xs font-bold text-teal-400 flex items-center justify-center h-6">{res.join(', ')}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};
