import React from 'react';
import { LevelUpModal } from './LevelUpModal';
import { SheetRestAndSubclassModals, SheetRestAndSubclassModalsProps } from './SheetRestAndSubclassModals';
import { SheetTradeAndEquipmentModals, SheetTradeAndEquipmentModalsProps } from './SheetTradeAndEquipmentModals';
import { calculateTotalMaxHp } from '../../../../lib/mechanics/hpCalculator';
import { getCharacterActiveFeats } from '../utils/characterSheetCalculations';

export interface LevelUpModalExtendedProps {
  showLevelUpModal: boolean;
  setShowLevelUpModal: (val: boolean) => void;
  icon: string;
  effectiveLevel: number;
  nextLevel: number;
  needsSubclassChoice: boolean;
  levelUpSubclass: string;
  setLevelUpSubclass: (val: string) => void;
  needsFightingStyleChoice: boolean;
  levelUpFightingStyle: string;
  setLevelUpFightingStyle: (val: string) => void;
  isCurrentLevelAsi: boolean;
  levelUpAsiChoice: any;
  setLevelUpAsiChoice: (val: any) => void;
  asiMode: any;
  setAsiMode: (val: any) => void;
  asiStat1: string;
  setAsiStat1: (val: any) => void;
  asiStat2: string;
  setAsiStat2: (val: any) => void;
  selectedFeatName: string;
  setSelectedFeatName: (val: string) => void;
  hitDieStr: string;
  hpGainMode: any;
  setHpGainMode: (val: any) => void;
  avgHpGain: number;
  rolledValue: number | null;
  rolledHpGain: number;
  handleRollHitDie: () => void;
  isRolling: boolean;
  hpBreakdown: any;
  activeHpGain: number;
  hitDieVal: number;
  currentConMod: number;
  isDwarf: boolean;
  newFeaturesText: string;
  nextProgression: any;
  handleConfirmLevelUp: () => void;
  isLevelingUp: boolean;
}

export type CharacterSheetModalsProps = SheetRestAndSubclassModalsProps &
  SheetTradeAndEquipmentModalsProps &
  LevelUpModalExtendedProps;

export const CharacterSheetModals: React.FC<CharacterSheetModalsProps> = (props) => {
  return (
    <>
      <SheetRestAndSubclassModals {...props} />
      <SheetTradeAndEquipmentModals {...props} />

      <LevelUpModal
        showLevelUpModal={props.showLevelUpModal}
        setShowLevelUpModal={props.setShowLevelUpModal}
        icon={props.icon}
        currentLevel={props.effectiveLevel}
        nextLevel={props.nextLevel}
        character={props.character}
        needsSubclassChoice={props.needsSubclassChoice}
        subclassLevel={3}
        levelUpSubclass={props.levelUpSubclass}
        setLevelUpSubclass={props.setLevelUpSubclass}
        needsFightingStyleChoice={props.needsFightingStyleChoice}
        levelUpFightingStyle={props.levelUpFightingStyle}
        setLevelUpFightingStyle={props.setLevelUpFightingStyle}
        isCurrentLevelAsi={props.isCurrentLevelAsi}
        levelUpAsiChoice={props.levelUpAsiChoice}
        setLevelUpAsiChoice={props.setLevelUpAsiChoice}
        asiMode={props.asiMode}
        setAsiMode={props.setAsiMode}
        asiStat1={props.asiStat1 as any}
        setAsiStat1={props.setAsiStat1 as any}
        asiStat2={props.asiStat2 as any}
        setAsiStat2={props.setAsiStat2 as any}
        selectedFeatName={props.selectedFeatName}
        setSelectedFeatName={props.setSelectedFeatName}
        hitDieStr={props.hitDieStr}
        hpGainMode={props.hpGainMode}
        setHpGainMode={props.setHpGainMode}
        avgHpGain={props.avgHpGain}
        rolledValue={props.rolledValue}
        rolledHpGain={props.rolledHpGain}
        handleRollHitDie={props.handleRollHitDie}
        isRolling={props.isRolling}
        getCharacterActiveFeats={getCharacterActiveFeats}
        calculateTotalMaxHp={calculateTotalMaxHp}
        hpBreakdown={props.hpBreakdown}
        activeHpGain={props.activeHpGain}
        hitDieVal={props.hitDieVal}
        conMod={props.currentConMod}
        isDwarf={props.isDwarf}
        newFeaturesText={props.newFeaturesText}
        nextProgression={props.nextProgression}
        handleConfirmLevelUp={props.handleConfirmLevelUp}
        isLevelingUp={props.isLevelingUp}
      />
    </>
  );
};
