import { CLASSES, BACKGROUNDS, RACES } from './constants';
import { RACES_REFERENCE, CLASS_REFERENCE } from '../../../lib/api/references';

interface Props {
  name: string;
  charClass: string;
  race: string;
  currentRace: typeof RACES[0];
  currentClass: typeof CLASSES[keyof typeof CLASSES];
  currentBg: typeof BACKGROUNDS[0];
  draconicAncestry: string | undefined;
  giantAncestry: string | undefined;
  humanFeat: string;
  getEquipmentAndAC: () => any;
  getFinalStat: (stat: string) => number;
  selectedCantrips: string[];
  selectedSpells: string[];
  selectedSkills: string[];
  selectedTools: string[];
  calculateModifier: (score: number) => number;
  parseInventory: (list: string[]) => any;
  calculateTotalCoinsFromEquipment: (list: string[]) => number;
  parseAttacks: (items: any, cantrips: any, stats: any, attackStat: string, pb: number, feats: string[]) => any[];
  calculateResources: (cls: string, lvl: number, stats: any) => any[];
  calculateRaceResources: (race: string, lvl: number, drac: any, giant: any) => any[];
}

export function FinalReview({
  name, charClass, race, currentRace, currentClass, currentBg, draconicAncestry, giantAncestry, humanFeat,
  getEquipmentAndAC, getFinalStat, selectedCantrips, selectedSpells, selectedSkills, selectedTools, calculateModifier,
  parseInventory, calculateTotalCoinsFromEquipment, parseAttacks, calculateResources, calculateRaceResources
}: Props) {
  const { ac, acResult, equipmentList, rawEquipmentList } = getEquipmentAndAC();
  const { items } = parseInventory(equipmentList);
  const coins = calculateTotalCoinsFromEquipment(rawEquipmentList);
  
  let attackStat: 'str' | 'dex' | 'int' | 'wis' | 'cha' = 'str';
  if (['Rogue'].includes(charClass)) attackStat = 'dex';
  if (['Wizard'].includes(charClass)) attackStat = 'int';
  if (['Cleric', 'Druid'].includes(charClass)) attackStat = 'wis';
  if (['Bard', 'Sorcerer', 'Warlock'].includes(charClass)) attackStat = 'cha';
  if (['Fighter', 'Paladin', 'Ranger', 'Monk'].includes(charClass)) {
     attackStat = getFinalStat('dex') > getFinalStat('str') ? 'dex' : 'str';
  }
  const statsObj = { str: getFinalStat('str'), dex: getFinalStat('dex'), con: getFinalStat('con'), int: getFinalStat('int'), wis: getFinalStat('wis'), cha: getFinalStat('cha') };
  let currentFeat = currentBg?.feat || '';
  if (race === 'Human' || race === 'Humano') {
    const chosenHumanFeat = humanFeat || 'Alerta';
    if (!currentFeat.includes(chosenHumanFeat)) {
      currentFeat = `${currentFeat}, ${chosenHumanFeat}`;
    }
  }
  const attacksList = parseAttacks(items, selectedCantrips, statsObj, attackStat, 2, [currentFeat]);
  const resourcesList = [...calculateResources(charClass, 1, statsObj), ...calculateRaceResources(race, 1, draconicAncestry, giantAncestry)];

  const isSpellcaster = ['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Warlock', 'Wizard', 'Paladin', 'Ranger'].includes(charClass);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 w-full">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-black text-amber-500">{name || 'Herói Desconhecido'}</h2>
        <p className="text-slate-400 uppercase tracking-widest text-xs mt-1">Nível 1 • {currentRace?.name || 'Humano'} {currentBg?.name || 'Desconhecido'} {currentClass?.name || 'Desconhecido'}</p>
      </div>
      
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 sm:p-6 flex flex-col items-center w-full">
        <div className="text-6xl mb-6 bg-slate-900 w-24 h-24 flex items-center justify-center rounded-2xl border-2 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          {currentClass?.icon}
        </div>
        
        {/* Primary Combat Metrics Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          

          <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
            <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">HP</span>
            <span className="text-2xl font-black text-red-400 flex items-center justify-center h-8">{(currentClass?.hpBase || 8) + calculateModifier(getFinalStat('con')) + (['Anão', 'Dwarf'].includes(race) ? 1 : 0)}</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
            <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Dados de Vida</span>
            <span className="text-2xl font-black text-rose-400 flex items-center justify-center h-8">1d{currentClass?.hpBase || 8}</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800 relative group cursor-help" title={acResult?.explanation}>
            <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">CA</span>
            <div className="flex flex-col items-center justify-center h-8">
              <span className="text-2xl font-black text-blue-400">
                {ac}
              </span>
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
            <span className="text-xl font-black text-purple-400 flex items-center justify-center h-8">{RACES_REFERENCE[race]?.speed || '9m'}</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
            <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Iniciativa</span>
            <span className="text-2xl font-black text-green-400 flex items-center justify-center h-8">
              {(() => {
                const dexMod = calculateModifier(getFinalStat('dex'));
                const isAlert = currentFeat.includes('Alerta') || currentFeat.includes('Alert');
                const totalInit = dexMod + (isAlert ? 2 : 0);
                return totalInit >= 0 ? `+${totalInit}` : `${totalInit}`;
              })()}
            </span>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
            <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Proficiência</span>
            <span className="text-2xl font-black text-blue-400 flex items-center justify-center h-8">+2</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
            <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Percep. Passiva</span>
            <span className="text-2xl font-black text-indigo-400 flex items-center justify-center h-8">{10 + calculateModifier(getFinalStat('wis')) + ((currentBg?.skillProficiencies || []).includes('Percepção') ? 2 : 0)}</span>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg text-center border border-slate-800">
            <span className="block text-[10px] text-slate-500 uppercase font-bold mb-1">Talento de Origem</span>
            <span className="text-[11px] font-bold text-amber-500 flex items-center justify-center h-8 leading-tight">{currentFeat}</span>
          </div>

          {(() => {
            let spellcastingStat = null;
            if (['Wizard'].includes(charClass)) spellcastingStat = 'int';
            if (['Cleric', 'Druid', 'Ranger'].includes(charClass)) spellcastingStat = 'wis';
            if (['Bard', 'Sorcerer', 'Warlock', 'Paladin'].includes(charClass)) spellcastingStat = 'cha';
            if (!spellcastingStat) return null;
            const mod = calculateModifier(getFinalStat(spellcastingStat));
            const dc = 8 + 2 + mod;
            const attackBonus = 2 + mod;
            return (
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
            );
          })()}
        </div>

        {/* Senses and Resistances Badges */}
        {(() => {
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

          if (senses.length === 0 && res.length === 0) return null;

          return (
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
          );
        })()}

        {/* Attributes & Saving Throws Section */}
        <div className="w-full mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="block text-[10px] text-slate-500 uppercase font-bold">Atributos & Salvaguardas</span>
            <span className="text-[8px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded cursor-help group relative">
              <span className="border-b border-dashed border-slate-500">Info: Salvaguardas</span>
              <div className="absolute bottom-full right-0 mb-2 w-52 bg-slate-800 text-slate-300 text-[10px] p-2.5 rounded shadow-xl border border-slate-700 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 text-left">
                <p className="font-bold text-amber-500 mb-1 border-b border-slate-700 pb-1">Regra D&D 2024</p>
                <p>Diferente de ataques, rolar um 20 natural em uma Salvaguarda ou Teste de Perícia <b>não garante sucesso automático</b>. O resultado final deve atingir a CD.</p>
              </div>
            </span>
          </div>
          <div className="w-full grid grid-cols-3 sm:grid-cols-6 gap-2">
            {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as ('str' | 'dex' | 'con' | 'int' | 'wis' | 'cha')[]).map(stat => {
               const statToPt = { str: 'Força', dex: 'Destreza', con: 'Constituição', int: 'Inteligência', wis: 'Sabedoria', cha: 'Carisma' };
               const savingThrows = (CLASS_REFERENCE as any)[charClass]?.savingThrows || [];
               const isProficient = savingThrows.includes(statToPt[stat]);
               const mod = calculateModifier(getFinalStat(stat));
               const saveMod = mod + (isProficient ? 2 : 0);
               
               return (
                 <div key={stat} className={`bg-slate-900 p-2 rounded-lg text-center border ${isProficient ? 'border-blue-500/50 bg-blue-900/10 shadow-[0_0_10px_rgba(59,130,246,0.1)]' : 'border-slate-800'}`}>
                   <span className={`block text-[9px] uppercase font-bold ${isProficient ? 'text-blue-400' : 'text-slate-400'}`}>{stat}</span>
                   <span className="font-black text-sm block my-1 text-slate-100">{getFinalStat(stat)}</span>
                   <div className="flex flex-col gap-1 items-center">
                     <span className={`text-[9px] font-bold bg-slate-950 px-1.5 rounded ${mod >= 0 ? 'text-slate-300' : 'text-red-400'}`}>
                       MOD: {mod >= 0 ? '+' : ''}{mod}
                     </span>
                     <span className={`text-[9px] font-bold px-1.5 rounded ${isProficient ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-950 text-slate-500 border border-transparent'}`}>
                       SALV: {saveMod >= 0 ? '+' : ''}{saveMod}
                     </span>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>

        {/* Proficiências */}
        <div className="w-full mb-6">
          <span className="block text-[10px] text-slate-500 uppercase font-bold mb-2">Proficiências</span>
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1.5">Perícias ({selectedSkills.length})</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedSkills.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded text-[10px] font-semibold border border-slate-700/50">{s}</span>
                ))}
                {selectedSkills.length === 0 && <span className="text-slate-600 text-[10px]">Nenhuma selecionada</span>}
              </div>
            </div>
            <div>
              <span className="block text-[9px] text-slate-400 uppercase font-bold mb-1.5">Ferramentas ({selectedTools.length})</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedTools.map(t => (
                  <span key={t} className="px-2 py-0.5 bg-slate-950 text-slate-300 rounded text-[10px] font-semibold border border-slate-700/50">{t}</span>
                ))}
                {selectedTools.length === 0 && <span className="text-slate-600 text-[10px]">Nenhuma concedida</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Panels Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Attacks & Special Actions */}
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

          {/* Right Column: Inventory, Resources & Common Actions */}
          <div className="space-y-4">
            {/* Inventory Panel */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Inventário</span>
                <span className="text-xs font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{coins}</span>
              </div>
              <ul className="text-sm text-slate-300 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {items.map((item: any, idx: number) => {
                  return (
                    <li key={idx} className="flex justify-between items-center bg-slate-950 p-2 px-3 rounded border border-slate-800/50">
                      <span className="flex-1 text-xs mr-2" title={item.name}>
                        {item.quantity && item.quantity > 1 ? `${item.quantity}x ` : ''}{item.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.equipped && <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest bg-green-950/40 px-1.5 py-0.5 rounded border border-green-800/40">Equipado</span>}
                      </div>
                    </li>
                  );
                })}
                {items.length === 0 && <li className="italic text-slate-500 text-xs">Sem equipamento definido.</li>}
              </ul>
            </div>

            {/* Resources Panel */}
            {resourcesList.length > 0 && (
              <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-bold mb-3">Recursos Consumíveis</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {resourcesList.map((res, idx) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded border border-slate-800 relative">
                      {res.action && (
                        <span className={`absolute top-2 right-2 text-[8px] uppercase font-black px-1.5 py-0.5 rounded ${res.action === 'Ação Bônus' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                          {res.action}
                        </span>
                      )}
                      <span className="block text-xs font-bold text-slate-300 mb-2 pr-16">{res.name}</span>
                      <div className="flex gap-1 flex-wrap">
                        <span className="text-sm font-bold text-blue-400">{res.max} Usos</span>
                      </div>
                      <span className="block text-[9px] text-slate-500 mt-2 uppercase">Restaura em Descanso {res.reset === 'long' ? 'Longo' : 'Curto/Longo'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Actions Panel */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase font-bold mb-3">Ações Comuns em Combate</span>
              <div className="flex flex-wrap gap-1.5">
                {['Esquivar', 'Desengajar', 'Esconder', 'Disparada', 'Ajuda', 'Procurar', 'Usar Objeto'].map((action, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 px-2.5 py-1 rounded text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    {action}
                    <span className="text-[7px] uppercase font-black px-1 py-0.2 rounded bg-blue-500/20 text-blue-400">Ação</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Spells Section */}
        {isSpellcaster && (selectedCantrips.length > 0 || selectedSpells.length > 0) && (
          <div className="w-full flex flex-col gap-4 mt-4">
            <div className="w-full bg-slate-900 p-4 rounded-lg border border-slate-800">
              <span className="block text-[10px] text-slate-500 uppercase font-bold mb-2">Magias Conhecidas</span>
              {selectedCantrips.length > 0 && (
                <div className="mb-2">
                  <span className="text-[10px] text-slate-400 font-bold">Truques: </span>
                  <span className="text-sm text-amber-500">{selectedCantrips.join(', ')}</span>
                </div>
              )}
              {selectedSpells.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 font-bold">1º Círculo: </span>
                  <span className="text-sm text-amber-500">{selectedSpells.join(', ')}</span>
                </div>
              )}
            </div>

            {selectedSpells.length > 0 && (
              <div className="w-full bg-slate-900 p-4 rounded-lg border border-slate-800">
                <span className="block text-[10px] text-slate-500 uppercase font-bold mb-2">Espaços de Magia (1º Círculo)</span>
                <div className="flex gap-2">
                  {Array.from({ length: charClass === 'Warlock' ? 1 : 2 }).map((_, i) => (
                    <label key={i} className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="w-6 h-6 rounded border-2 border-slate-700 bg-slate-950 text-fuchsia-500 focus:ring-fuchsia-500 focus:ring-offset-slate-900 cursor-pointer accent-fuchsia-500" />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
