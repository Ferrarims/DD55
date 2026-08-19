import { useState, useMemo, useEffect, useRef } from 'react';
import { PlayerStats } from '../../types';
import { calculateTotalMaxHp } from '../../lib/mechanics/hpCalculator';
import { parseInventory, parseAttacks, calculateTotalCoinsFromEquipment } from '../../lib/mechanics/inventoryParser';
import { parseEquipmentToList } from '../../lib/mechanics/xpAndLootManager';
import { extractEquipmentChoiceItems, formatEquipmentChoiceDescription } from '../../lib/mechanics/equipmentParser';
import { calculateResources, calculateRaceResources } from '../../lib/mechanics/resourcesParser';
import { calculateAC } from '../../lib/mechanics/acCalculator';
import { RACES_REFERENCE, CLASS_REFERENCE, DRACONIC_ANCESTRIES, getRaceIcon } from '../../lib/api/references';
import { RACES, CLASSES, STANDARD_ARRAY, StatKey, getSpellSlotsForClass, statMap, GIANT_ANCESTRIES_INFO } from './creation/constants';
import { fetchBackgrounds } from '../../lib/api/backgroundsService';
import { fetchRacesFromDb } from '../../lib/api/racesService';

import { ClassSelection } from './creation/ClassSelection';
import { BackgroundSelection } from './creation/BackgroundSelection';
import { SpeciesSelection } from './creation/SpeciesSelection';
import { SkillsSelection } from './creation/SkillsSelection';
import { AbilitiesSelection } from './creation/AbilitiesSelection';
import { DetailsSelection } from './creation/DetailsSelection';
import { EquipmentSelection } from './creation/EquipmentSelection';
import { SpellsSelection } from './creation/SpellsSelection';
import { FinalReview } from './creation/FinalReview';

interface CharacterCreationProps {
  onComplete: (stats: PlayerStats) => void;
}

export function CharacterCreation({ onComplete }: CharacterCreationProps) {
  const [backgrounds, setBackgrounds] = useState<any[]>([]);
  const [races, setRaces] = useState<any[]>([]);
  const [racesLoaded, setRacesLoaded] = useState(false);
  useEffect(() => {
    fetchBackgrounds().then(setBackgrounds);
    fetchRacesFromDb().then((fetchedRaces: any) => {
      setRaces(fetchedRaces);
      setRacesLoaded(true);
    });
  }, []);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [alignment, setAlignment] = useState('Neutro');
  const [classEqChoice, setClassEqChoice] = useState<'A' | 'B' | 'C'>('A');
  const [bgEqChoice, setBgEqChoice] = useState<'A' | 'B' | 'C'>('A');
  const [race, setRace] = useState('');
  useEffect(() => {
    if (races.length > 0 && race === '') {
       setRace(races[0].id);
    }
  }, [races]);
  const [draconicAncestry, setDraconicAncestry] = useState<string | undefined>(undefined);
  const [giantAncestry, setGiantAncestry] = useState<string | undefined>(undefined);
  const [humanFeat, setHumanFeat] = useState<string>('Alerta');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isSkillsValid, setIsSkillsValid] = useState(true);
  const [selectedCantrips, setSelectedCantrips] = useState<string[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<string[]>([]);
  const [background, setBackground] = useState('');
  useEffect(() => {
    if (backgrounds.length > 0 && !background) {
      setBackground(backgrounds[0].id);
    }
  }, [backgrounds]);

  const [charClass, setCharClass] = useState('Fighter');
  const [fightingStyle, setFightingStyle] = useState<string>('Arquearia');
  
  // Background Stats allocation (+2 / +1)
  const [bgBonusMode, setBgBonusMode] = useState<'2/1' | '1/1/1'>('2/1');
  const [bgBonuses, setBgBonuses] = useState<{stat: StatKey, value: number}[]>(() => {
    const saved = localStorage.getItem('bgBonuses');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('bgBonuses', JSON.stringify(bgBonuses));
  }, [bgBonuses]);

  // Base Stats
  const [statMethod, setStatMethod] = useState<'standard' | 'pointbuy' | 'roll'>('standard');
  const [baseStats, setBaseStats] = useState<Record<StatKey, number>>({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 });
  const [unassignedStandard, setUnassignedStandard] = useState<number[]>(STANDARD_ARRAY);

  // Rolled Stats
  const [rolledScores, setRolledScores] = useState<number[]>([]);
  const [unassignedRolls, setUnassignedRolls] = useState<number[]>([]);

  // Submitting state to prevent double click
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref for name input and first stat select auto-focus
  const nameInputRef = useRef<HTMLInputElement>(null);
  const firstStatSelectRef = useRef<HTMLSelectElement | HTMLButtonElement>(null);

  const currentBg = useMemo(() => 
    backgrounds.find(b => b.id === background) || backgrounds[0] || { id: '', name: 'Desconhecido', stats: ['str', 'dex', 'con', 'int', 'wis', 'cha'], equipment: [], skillProficiencies: [] },
  [background, backgrounds]);
  
  const { stat1, stat2, stat3 } = useMemo(() => {
    const stats = currentBg.stats || currentBg.ability_scores || ['str', 'dex', 'con'];
    return {
      stat1: stats[0] || 'str',
      stat2: stats[1] || 'dex',
      stat3: stats[2] || 'con'
    };
  }, [currentBg]);

  const currentClass = useMemo(() => 
    ({ ...CLASSES[charClass as keyof typeof CLASSES], icon: (CLASS_REFERENCE as any)[charClass]?.icon || CLASSES[charClass as keyof typeof CLASSES].icon }),
  [charClass]);
  
  const currentRace = useMemo(() => {
    return races.find(r => r.id === race) || { id: '', name: 'Humano', icon: '👤', desc: '' };
  }, [race, races]);

  const newBonuses = useMemo(() => {
    const s1 = (statMap[stat1] || stat1) as StatKey;
    const s2 = (statMap[stat2] || stat2) as StatKey;
    const s3 = (statMap[stat3] || stat3) as StatKey;
    return bgBonusMode === '2/1' 
      ? [{stat: s1, value: 2}, {stat: s2, value: 1}]
      : [{stat: s1, value: 1}, {stat: s2, value: 1}, {stat: s3, value: 1}];
  }, [bgBonusMode, stat1, stat2, stat3]);

  const prevBackgroundRef = useRef(background);
  const prevBonusModeRef = useRef(bgBonusMode);
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (!isInitialized) {
       setIsInitialized(true);
       prevBackgroundRef.current = background;
       prevBonusModeRef.current = bgBonusMode;
       return;
    }
    if (background !== prevBackgroundRef.current || bgBonusMode !== prevBonusModeRef.current) {
        // background or mode changed, reset to defaults
        setBgBonuses(newBonuses);
        prevBackgroundRef.current = background;
        prevBonusModeRef.current = bgBonusMode;
    }
  }, [background, bgBonusMode, newBonuses]);

  const POINT_COSTS: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
  const getPointsSpent = (): number => {
    return (Object.values(baseStats) as number[]).reduce<number>((acc, val) => acc + (POINT_COSTS[val] || 0), 0);
  };

  const calculateModifier = (score: number) => Math.floor((score - 10) / 2);

  const getFinalStat = (stat: StatKey) => {
    const bonus = bgBonuses.find(b => b.stat === stat)?.value || 0;
    const final = Math.min(20, (baseStats[stat] || 0) + bonus);
    return final;
  };

  const rollStats = () => {
    const rolls = Array.from({length: 6}, () => {
      const dice = Array.from({length: 4}, () => Math.floor(Math.random() * 6) + 1).sort();
      return dice[1] + dice[2] + dice[3]; // Drop lowest
    });
    setRolledScores(rolls);
    setUnassignedRolls([...rolls]);
    setBaseStats({ str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 }); // clear
  };

  const assignStat = (stat: StatKey, val: number) => {
    if (statMethod === 'standard') {
      const oldVal = baseStats[stat];
      const newStats = { ...baseStats, [stat]: val };
      setBaseStats(newStats);
      
      let newUnassigned = [...unassignedStandard];
      if (oldVal > 0) newUnassigned.push(oldVal); // Return old value
      const valIndex = newUnassigned.indexOf(val);
      if (valIndex > -1) newUnassigned.splice(valIndex, 1); // Remove new value
      setUnassignedStandard(newUnassigned.sort((a,b)=>b-a));
    } else if (statMethod === 'roll') {
      const oldVal = baseStats[stat];
      const newStats = { ...baseStats, [stat]: val };
      setBaseStats(newStats);
      
      let newUnassigned = [...unassignedRolls];
      if (oldVal > 0) newUnassigned.push(oldVal);
      const valIndex = newUnassigned.indexOf(val);
      if (valIndex > -1) newUnassigned.splice(valIndex, 1);
      setUnassignedRolls(newUnassigned.sort((a,b)=>b-a));
    }
  };

  const getStandardClassEquipment = (cls: string, option: 'A' | 'B' | 'C') => {
    const classData = (CLASS_REFERENCE as any)[cls];
    if (classData && classData.equipmentOptions) {
      return formatEquipmentChoiceDescription(classData.equipmentOptions, option);
    }
    
    switch(cls) {
      case 'Fighter': 
        return '155 PO';
      default: 
        if (option === 'A') return 'Armas e armaduras básicas';
        if (option === 'B') return 'Opção alternativa';
        return '50 PO';
    }
  };

  const getEquipmentAndAC = () => {
    let weaponDice = 6;
    let weaponCount = 1;
    let rawEquipmentList: string[] = [];

    // Class Equipment
    const classData = (CLASS_REFERENCE as any)[charClass];
    if (classData && classData.equipmentOptions) {
      rawEquipmentList.push(...extractEquipmentChoiceItems(classData.equipmentOptions, classEqChoice));
    } else {
      rawEquipmentList.push(getStandardClassEquipment(charClass, classEqChoice));
    }

    // Background Equipment
    if (currentBg && currentBg.equipment) {
      rawEquipmentList.push(...extractEquipmentChoiceItems(currentBg.equipment, bgEqChoice));
    } else {
      rawEquipmentList.push('50 PO');
    }

    const equipmentList = parseEquipmentToList(rawEquipmentList);
    const { items } = parseInventory(equipmentList);

    const acResult = calculateAC({
      charClass,
      stats: {
        dex: getFinalStat('dex'),
        con: getFinalStat('con'),
        wis: getFinalStat('wis')
      },
      inventoryItems: items
    });

    if (charClass === 'Barbarian') { weaponDice = 12; }
    if (charClass === 'Fighter') { weaponDice = classEqChoice === 'A' ? 12 : 8; }
    if (charClass === 'Paladin') { weaponDice = 8; }
    if (charClass === 'Ranger') { weaponDice = 8; }
    if (charClass === 'Bard') { weaponDice = 8; }
    if (charClass === 'Rogue') { weaponDice = 6; weaponCount = 2; }
    if (charClass === 'Warlock') { weaponDice = 6; }
    if (charClass === 'Sorcerer') { weaponDice = 6; }
    if (charClass === 'Wizard') { weaponDice = 4; weaponCount = 3; }
    if (charClass === 'Cleric') { weaponDice = 6; }
    if (charClass === 'Druid') { weaponDice = 4; }
    if (charClass === 'Monk') { weaponDice = 6; weaponCount = 2; }

    return { ac: acResult.ac, acResult, weaponDice, weaponCount, equipmentList, rawEquipmentList };
  };

  const finalizeCharacter = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const conMod = calculateModifier(getFinalStat('con'));
      const dexMod = calculateModifier(getFinalStat('dex'));
      
      let attackStat: StatKey = 'str';
      if (['Rogue'].includes(charClass)) attackStat = 'dex';
      if (['Wizard'].includes(charClass)) attackStat = 'int';
      if (['Cleric', 'Druid'].includes(charClass)) attackStat = 'wis';
      if (['Bard', 'Sorcerer', 'Warlock'].includes(charClass)) attackStat = 'cha';
      if (['Fighter', 'Paladin', 'Ranger', 'Monk'].includes(charClass)) {
         attackStat = getFinalStat('dex') > getFinalStat('str') ? 'dex' : 'str';
      }

      const attackMod = calculateModifier(getFinalStat(attackStat));
      const pb = 2; // Proficiency Bonus level 1

      const { ac, weaponDice, weaponCount, equipmentList, rawEquipmentList } = getEquipmentAndAC();
      const startingCoins = calculateTotalCoinsFromEquipment(rawEquipmentList);

      const featArray: string[] = [];
      if (currentBg?.feat) {
        currentBg.feat.split(',').forEach(f => {
          const t = f.trim();
          if (t && !featArray.includes(t)) featArray.push(t);
        });
      }

      if (race === 'Human' || race === 'Humano') {
        const chosenHumanFeat = humanFeat || 'Alerta';
        if (!featArray.includes(chosenHumanFeat)) {
          featArray.push(chosenHumanFeat);
        }
      }
      const finalFeat = featArray.join(', ');
      const hpBase = currentClass.hpBase + conMod;
      const finalHp = calculateTotalMaxHp(hpBase, currentRace?.name || 'Humano', 1, finalFeat);

      await onComplete({
        name,
        charClass: currentClass.name,
        race: currentRace?.name || 'Desconhecido',
        draconicAncestry,
        giantAncestry,
        background: currentBg?.name || 'Desconhecido',
        originFeat: finalFeat,
        feats: featArray,
        icon: currentRace?.icon || getRaceIcon(currentRace?.name),
        maxHp: finalHp,
        hp: finalHp,
        armor_class: ac,
        initiative: dexMod + (finalFeat.includes('Alerta') || finalFeat.includes('Alert') || currentBg?.feat === 'Alerta' || currentBg?.feat === 'Alert' ? pb : 0),
        attackBonus: attackMod + pb,
        damageDiceSides: weaponDice,
        damageDiceCount: weaponCount,
        damageBonus: attackMod,
        str: getFinalStat('str'),
        dex: getFinalStat('dex'),
        con: getFinalStat('con'),
        int: getFinalStat('int'),
        wis: getFinalStat('wis'),
        cha: getFinalStat('cha'),
        strength: getFinalStat('str'),
        dexterity: getFinalStat('dex'),
        constitution: getFinalStat('con'),
        intelligence: getFinalStat('int'),
        wisdom: getFinalStat('wis'),
        charisma: getFinalStat('cha'),
        bgBonuses: bgBonuses,
        skillProficiencies: selectedSkills,
        toolProficiencies: selectedTools,
        alignment,
        equipment: equipmentList,
        inventory: parseInventory(equipmentList).items,
        coins: startingCoins,
        attacks: parseAttacks(parseInventory(equipmentList).items, selectedCantrips, { str: getFinalStat('str'), dex: getFinalStat('dex'), con: getFinalStat('con'), int: getFinalStat('int'), wis: getFinalStat('wis'), cha: getFinalStat('cha') }, attackStat as any, 2, [finalFeat]),
        spells: [...selectedCantrips, ...selectedSpells],
        speed: RACES_REFERENCE[race].speed,
        savingThrows: (CLASS_REFERENCE as any)[charClass]?.savingThrows || [],
        level: 1,
        proficiencyBonus: 2,
        fighting_style: charClass === 'Fighter' ? fightingStyle : undefined,
        fighting_style_locked: charClass === 'Fighter' ? true : undefined,
        level_choices: charClass === 'Fighter' ? [{ level: 1, fightingStyle }] : [],
        resources: [...calculateResources(charClass, 1, { str: getFinalStat('str'), dex: getFinalStat('dex'), con: getFinalStat('con'), int: getFinalStat('int'), wis: getFinalStat('wis'), cha: getFinalStat('cha') }), ...calculateRaceResources(race, 1, draconicAncestry, giantAncestry)],
        passivePerception: 10 + calculateModifier(getFinalStat('wis')) + ((currentBg?.skillProficiencies || []).includes('Percepção') ? 2 : 0),
        hitDice: `d${CLASSES[charClass as keyof typeof CLASSES].hpBase}`,
        hitDiceCount: 1,
        resistances: (() => {
          const res = [];
          if (['Aasimar'].includes(race)) res.push('Radiante', 'Necrótico');
          if (['Anão', 'Dwarf'].includes(race)) res.push('Veneno');
          if (['Draconato', 'Dragonborn'].includes(race)) {
            const ancestry = (DRACONIC_ANCESTRIES as any).find((a: any) => a.name === draconicAncestry);
            res.push(ancestry ? ancestry.damageType : 'Elemento Dracônico');
          }
          if (['Tiferino', 'Tiefling'].includes(race)) res.push('Fogo');
          if (['Golias', 'Goliath'].includes(race)) {
            if (giantAncestry) {
              const ancestry = (GIANT_ANCESTRIES_INFO as any)[giantAncestry];
              res.push(ancestry ? ancestry.benefit : 'Resistência de Gigante');
            } else {
              res.push('Físico (Depende do Gigante)');
            }
          }
          return res;
        })(),
        senses: (() => {
          const senses = [];
          const raceInfo = (RACES_REFERENCE as any)[race];
          if (raceInfo && raceInfo.traits) {
            const darkvision = raceInfo.traits.find((t: any) => t.name.includes('Visão no Escuro'));
            if (darkvision) senses.push(darkvision.name);
          }
          return senses;
        })(),
        spellSaveDC: (() => {
          let spellcastingStat = null;
          if (['Wizard'].includes(charClass)) spellcastingStat = 'int';
          if (['Cleric', 'Druid', 'Ranger'].includes(charClass)) spellcastingStat = 'wis';
          if (['Bard', 'Sorcerer', 'Warlock', 'Paladin'].includes(charClass)) spellcastingStat = 'cha';
          return spellcastingStat ? 8 + 2 + calculateModifier(getFinalStat(spellcastingStat as StatKey)) : undefined;
        })()
      });
    } catch (error) {
      console.error('Erro ao finalizar personagem:', error);
      setIsSubmitting(false);
    }
  };

  const isSpellcaster = !!getSpellSlotsForClass(charClass);
  const totalSteps = isSpellcaster ? 9 : 8;

  const isStepValid = () => {
    if (step === 1) return true; // Class
    if (step === 2) return true; // Background
    if (step === 3) {
      if (race === 'Draconato' && !draconicAncestry) return false;
      if (race === 'Golias' && !giantAncestry) return false;
      if (race === 'Humano' || race === 'Human') {
        if (!humanFeat) return false;
        const bgFeats = (currentBg?.feat || '').split(',').map(f => f.trim().toLowerCase()).filter(Boolean);
        if (bgFeats.includes(humanFeat.trim().toLowerCase())) return false;
      }
      return true;
    }
    if (step === 4) return isSkillsValid; // Skills
    if (step === 5) { // Stats
      if (statMethod === 'pointbuy') return getPointsSpent() === 27;
      if (statMethod === 'standard') return unassignedStandard.length === 0;
      if (statMethod === 'roll') return unassignedRolls.length === 0 && rolledScores.length === 6;
    }
    if (step === 6) return name.trim().length > 0; // Details
    if (step === 7) return true; // Items
    if (step === 8 && isSpellcaster) {
      const slots = getSpellSlotsForClass(charClass);
      // Removed classSpells filtering logic here for brevity, assuming simple array length checks if we pass available counts
      return true; // Simple validation for now
    }
    return true;
  };

  useEffect(() => {
    if (step === 5) {
      const timer = setTimeout(() => {
        firstStatSelectRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else if (step === 6) {
      const timer = setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [step, statMethod]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (isStepValid()) {
          e.preventDefault();
          if (step < totalSteps) {
            setStep((prev) => prev + 1);
          } else if (!isSubmitting) {
            finalizeCharacter();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, totalSteps, isSubmitting, isStepValid, finalizeCharacter]);

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen w-full flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 max-w-5xl w-full shadow-2xl flex flex-col md:flex-row gap-8">
        
        {/* Left Panel: Form Steps */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
            <h1 className="text-2xl font-black tracking-tight text-amber-500">CRIAÇÃO DE PERSONAGEM</h1>
            <div className="flex gap-2">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map(i => (
                <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === i ? 'bg-amber-500 text-slate-950' : step > i ? 'bg-slate-700 text-slate-300' : 'bg-slate-900 border border-slate-700 text-slate-500'}`}>
                  {i}
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-[400px]">
            {step === 1 && (
              <ClassSelection 
                charClass={charClass} 
                setCharClass={setCharClass} 
                fightingStyle={fightingStyle}
                setFightingStyle={setFightingStyle}
              />
            )}

            {step === 2 && (
              <BackgroundSelection 
                backgrounds={backgrounds}
                background={background}
                setBackground={setBackground}
                bgBonusMode={bgBonusMode}
                setBgBonusMode={setBgBonusMode}
                bgBonuses={bgBonuses}
                setBgBonuses={setBgBonuses}
                currentBg={currentBg}
              />
            )}

            {step === 3 && (
              <SpeciesSelection 
                race={race}
                setRace={setRace}
                draconicAncestry={draconicAncestry}
                setDraconicAncestry={setDraconicAncestry}
                giantAncestry={giantAncestry}
                setGiantAncestry={setGiantAncestry}
                humanFeat={humanFeat}
                setHumanFeat={setHumanFeat}
                currentBg={currentBg}
              />
            )}

            {step === 4 && (
              <SkillsSelection
                charClass={charClass}
                currentBg={currentBg}
                currentRace={currentRace}
                selectedSkills={selectedSkills}
                setSelectedSkills={setSelectedSkills}
                selectedTools={selectedTools}
                setSelectedTools={setSelectedTools}
                onValidationChange={setIsSkillsValid}
              />
            )}

            {step === 5 && (
              <AbilitiesSelection 
                statMethod={statMethod}
                setStatMethod={setStatMethod}
                baseStats={baseStats}
                setBaseStats={setBaseStats}
                unassignedStandard={unassignedStandard}
                setUnassignedStandard={setUnassignedStandard}
                rolledScores={rolledScores}
                setRolledScores={setRolledScores}
                unassignedRolls={unassignedRolls}
                setUnassignedRolls={setUnassignedRolls}
                bgBonuses={bgBonuses}
                currentClass={currentClass}
                assignStat={assignStat as any}
                rollStats={rollStats}
                getPointsSpent={getPointsSpent}
                getFinalStat={getFinalStat}
                firstStatSelectRef={firstStatSelectRef}
              />
            )}

            {step === 6 && (
              <DetailsSelection 
                name={name}
                setName={setName}
                alignment={alignment}
                setAlignment={setAlignment}
                charClass={charClass}
                nameInputRef={nameInputRef}
              />
            )}

            {step === 7 && (
              <EquipmentSelection 
                charClass={charClass}
                currentClass={currentClass}
                currentBg={currentBg}
                classEqChoice={classEqChoice}
                setClassEqChoice={setClassEqChoice}
                bgEqChoice={bgEqChoice}
                setBgEqChoice={setBgEqChoice}
                getStandardClassEquipment={getStandardClassEquipment}
                formatEquipmentChoiceDescription={formatEquipmentChoiceDescription as any}
              />
            )}

            {step === 8 && isSpellcaster && (
              <SpellsSelection 
                charClass={charClass}
                selectedCantrips={selectedCantrips}
                setSelectedCantrips={setSelectedCantrips}
                selectedSpells={selectedSpells}
                setSelectedSpells={setSelectedSpells}
                spellSlots={getSpellSlotsForClass(charClass)}
              />
            )}

            {step === totalSteps && (
              <FinalReview 
                name={name}
                charClass={charClass}
                race={race}
                currentRace={currentRace}
                currentClass={currentClass}
                currentBg={currentBg}
                draconicAncestry={draconicAncestry}
                giantAncestry={giantAncestry}
                humanFeat={humanFeat}
                getEquipmentAndAC={getEquipmentAndAC}
                getFinalStat={getFinalStat}
                selectedCantrips={selectedCantrips}
                selectedSpells={selectedSpells}
                selectedSkills={selectedSkills || []}
                selectedTools={selectedTools || []}
                calculateModifier={calculateModifier}
                parseInventory={parseInventory as any}
                calculateTotalCoinsFromEquipment={calculateTotalCoinsFromEquipment as any}
                parseAttacks={parseAttacks as any}
                calculateResources={calculateResources}
                calculateRaceResources={calculateRaceResources}
              />
            )}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800 mt-auto">
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-3 bg-slate-900 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-30"
            >
              Voltar
            </button>

            {step < totalSteps ? (
              <button 
                onClick={() => setStep(step + 1)}
                disabled={!isStepValid()}
                className="px-6 py-3 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-colors disabled:opacity-30 flex items-center gap-2"
              >
                Próximo Passo <span>→</span>
              </button>
            ) : (
              <button 
                onClick={finalizeCharacter}
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-500 text-slate-950 font-black tracking-widest uppercase rounded-xl hover:bg-green-400 transition-colors shadow-[0_0_15px_rgba(34,197,94,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin text-lg">⏳</span> Salvando...
                  </>
                ) : (
                  <>
                    Finalizar Personagem <span>⚔️</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
