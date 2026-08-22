import React from 'react';
import { LevelUpHpGainPanel } from './hpAndFeatures/LevelUpHpGainPanel';
import { LevelUpFeaturesList } from './hpAndFeatures/LevelUpFeaturesList';

export interface LevelUpHpAndFeaturesSectionProps {
  hitDieStr: string;
  hitDieVal: number;
  hpGainMode: 'avg' | 'roll';
  setHpGainMode: (m: 'avg' | 'roll') => void;
  avgHpGain: number;
  rolledValue: number | null;
  rolledHpGain: number;
  handleRollHitDie: () => void;
  isRolling: boolean;
  character: any;
  isCurrentLevelAsi: boolean;
  levelUpAsiChoice: 'asi' | 'feat';
  selectedFeatName: string;
  getCharacterActiveFeats: (char: any) => string[];
  isDwarf: boolean;
  activeHpGain: number;
  conMod: number;
  nextLevel: number;
  nextProgression: any;
  newFeaturesText: string;
}

export const LevelUpHpAndFeaturesSection: React.FC<LevelUpHpAndFeaturesSectionProps> = ({
  hitDieStr,
  hitDieVal,
  hpGainMode,
  setHpGainMode,
  avgHpGain,
  rolledValue,
  rolledHpGain,
  handleRollHitDie,
  isRolling,
  character,
  isCurrentLevelAsi,
  levelUpAsiChoice,
  selectedFeatName,
  getCharacterActiveFeats,
  isDwarf,
  activeHpGain,
  conMod,
  nextLevel,
  nextProgression,
  newFeaturesText,
}) => {
  const previewFeats = getCharacterActiveFeats(character);
  if (
    isCurrentLevelAsi &&
    levelUpAsiChoice === 'feat' &&
    selectedFeatName &&
    !previewFeats.includes(selectedFeatName)
  ) {
    previewFeats.push(selectedFeatName);
  }
  const previewHasTough = previewFeats.some(f => /vigoroso|tough/i.test(f || ''));
  const currentMax = Number(character.max_hp) || 10;
  const dwarfBonusForNextLevel = isDwarf ? 1 : 0;
  const toughBonusForNextLevel = previewHasTough ? 2 : 0;
  const nextMaxHp =
    currentMax + activeHpGain + dwarfBonusForNextLevel + toughBonusForNextLevel;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <LevelUpHpGainPanel
        hitDieStr={hitDieStr}
        hitDieVal={hitDieVal}
        hpGainMode={hpGainMode}
        setHpGainMode={setHpGainMode}
        avgHpGain={avgHpGain}
        rolledValue={rolledValue}
        rolledHpGain={rolledHpGain}
        handleRollHitDie={handleRollHitDie}
        isRolling={isRolling}
        currentMax={currentMax}
        nextMaxHp={nextMaxHp}
        conMod={conMod}
        isDwarf={isDwarf}
        previewHasTough={previewHasTough}
      />

      <LevelUpFeaturesList
        nextLevel={nextLevel}
        nextProgression={nextProgression}
        newFeaturesText={newFeaturesText}
      />
    </div>
  );
};
