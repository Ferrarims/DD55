import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { PlayerStats } from '../../../../types';
import { CLASS_REFERENCE } from '../../../../lib/api/references';
import { CLASSES, getSpellSlotsForClass } from '../constants';
import { fetchBackgrounds } from '../../../../lib/api/backgroundsService';
import { fetchRacesFromDb } from '../../../../lib/api/racesService';
import { buildFinalStats } from '../helpers/creationHelpers';
import { useCreationAttributesState } from './state/useCreationAttributesState';
import { useCreationEquipmentCalculator } from './state/useCreationEquipmentCalculator';

export interface UseCharacterCreationStateProps {
  onComplete: (stats: PlayerStats) => void;
}

export function useCharacterCreationState({ onComplete }: UseCharacterCreationStateProps) {
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
  }, [races, race]);

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
  }, [backgrounds, background]);

  const [charClass, setCharClass] = useState('Fighter');
  const [fightingStyle, setFightingStyle] = useState<string>('Arquearia');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const firstStatSelectRef = useRef<HTMLSelectElement | HTMLButtonElement>(null);

  const currentBg = useMemo(() => 
    backgrounds.find(b => b.id === background) || backgrounds[0] || { id: '', name: 'Desconhecido', stats: ['str', 'dex', 'con', 'int', 'wis', 'cha'], equipment: [], skillProficiencies: [] },
  [background, backgrounds]);

  const currentClass = useMemo(() => 
    ({ ...CLASSES[charClass as keyof typeof CLASSES], icon: (CLASS_REFERENCE as any)[charClass]?.icon || CLASSES[charClass as keyof typeof CLASSES].icon }),
  [charClass]);
  
  const currentRace = useMemo(() => {
    return races.find(r => r.id === race) || { id: '', name: 'Humano', icon: '👤', desc: '' };
  }, [race, races]);

  const attributesState = useCreationAttributesState({ currentBg });
  const {
    bgBonusMode, setBgBonusMode, bgBonuses, setBgBonuses,
    statMethod, setStatMethod, baseStats, setBaseStats,
    unassignedStandard, setUnassignedStandard, rolledScores, setRolledScores,
    unassignedRolls, setUnassignedRolls, getPointsSpentValue, getFinalStat,
    rollStats, assignStat,
  } = attributesState;

  const { getEquipmentAndAC } = useCreationEquipmentCalculator({
    charClass,
    classEqChoice,
    bgEqChoice,
    currentBg,
    getFinalStat,
  });

  const finalizeCharacter = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const statsPayload = buildFinalStats({
        name,
        charClass,
        race,
        draconicAncestry,
        giantAncestry,
        background,
        humanFeat,
        currentBg,
        currentClass,
        currentRace,
        selectedSkills,
        selectedTools,
        alignment,
        selectedCantrips,
        selectedSpells,
        fightingStyle,
        bgBonuses,
        getFinalStat,
        getEquipmentAndAC
      });
      await onComplete(statsPayload);
    } catch (error) {
      console.error('Erro ao finalizar personagem:', error);
      setIsSubmitting(false);
    }
  };

  const isSpellcaster = !!getSpellSlotsForClass(charClass);
  const totalSteps = isSpellcaster ? 9 : 8;

  const isStepValid = useCallback(() => {
    if (step === 1) return true;
    if (step === 2) return true;
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
    if (step === 4) return isSkillsValid;
    if (step === 5) {
      if (statMethod === 'pointbuy') return getPointsSpentValue() === 27;
      if (statMethod === 'standard') return unassignedStandard.length === 0;
      if (statMethod === 'roll') return unassignedRolls.length === 0 && rolledScores.length === 6;
    }
    if (step === 6) return name.trim().length > 0;
    if (step === 7) return true;
    return true;
  }, [step, race, draconicAncestry, giantAncestry, humanFeat, currentBg, isSkillsValid, statMethod, getPointsSpentValue, unassignedStandard, unassignedRolls, rolledScores, name]);

  return {
    backgrounds, races, racesLoaded, step, setStep, name, setName, alignment, setAlignment,
    classEqChoice, setClassEqChoice, bgEqChoice, setBgEqChoice, race, setRace,
    draconicAncestry, setDraconicAncestry, giantAncestry, setGiantAncestry, humanFeat, setHumanFeat,
    selectedSkills, setSelectedSkills, selectedTools, setSelectedTools, isSkillsValid, setIsSkillsValid,
    selectedCantrips, setSelectedCantrips, selectedSpells, setSelectedSpells, background, setBackground,
    charClass, setCharClass, fightingStyle, setFightingStyle, bgBonusMode, setBgBonusMode, bgBonuses,
    setBgBonuses, statMethod, setStatMethod, baseStats, setBaseStats, unassignedStandard,
    setUnassignedStandard, rolledScores, setRolledScores, unassignedRolls, setUnassignedRolls,
    isSubmitting, nameInputRef, firstStatSelectRef, currentBg, currentClass, currentRace,
    getPointsSpent: getPointsSpentValue, getFinalStat, rollStats, assignStat, getEquipmentAndAC,
    finalizeCharacter, isSpellcaster, totalSteps, isStepValid
  };
}
