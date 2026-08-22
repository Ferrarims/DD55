import { CLASSES, BACKGROUNDS, RACES } from './constants';
import { ReviewHeaderMetrics } from './review/ReviewHeaderMetrics';
import { ReviewAttributesAndSaves } from './review/ReviewAttributesAndSaves';
import { ReviewCombatActions } from './review/ReviewCombatActions';
import { ReviewInventoryAndResources } from './review/ReviewInventoryAndResources';
import { ReviewSpellcasting } from './review/ReviewSpellcasting';

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
        <ReviewHeaderMetrics
          currentClass={currentClass}
          race={race}
          ac={ac}
          acResult={acResult}
          calculateModifier={calculateModifier}
          getFinalStat={getFinalStat}
          currentFeat={currentFeat}
          currentBg={currentBg}
          charClass={charClass}
        />

        {/* Attributes & Saving Throws Section */}
        <ReviewAttributesAndSaves
          charClass={charClass}
          getFinalStat={getFinalStat}
          calculateModifier={calculateModifier}
          selectedSkills={selectedSkills}
          selectedTools={selectedTools}
        />

        {/* Detailed Panels Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column: Attacks & Special Actions */}
          <ReviewCombatActions
            attacksList={attacksList}
            charClass={charClass}
          />

          {/* Right Column: Inventory, Resources & Common Actions */}
          <ReviewInventoryAndResources
            items={items}
            coins={coins}
            resourcesList={resourcesList}
          />
        </div>

        {/* Spells Section */}
        <ReviewSpellcasting
          isSpellcaster={isSpellcaster}
          selectedCantrips={selectedCantrips}
          selectedSpells={selectedSpells}
          charClass={charClass}
        />
      </div>
    </div>
  );
}
