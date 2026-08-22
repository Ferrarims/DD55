import { useState } from 'react';
import { FIGHTER_SUBCLASSES, formatSubclassName } from '../../../../../lib/api/references';
import { applyAsiStats } from './levelUpHelpers';
import { calculateHpAndChoices } from './confirm/levelUpHpAndChoicesCalculator';
import { calculateLevelUpResources } from './confirm/levelUpResourcesCalculator';
import { persistLevelUpChanges } from './confirm/persistLevelUpChanges';

export interface UseConfirmLevelUpProps {
  character: any;
  nextLevel: number;
  hitDieVal: number;
  isCurrentLevelAsi: boolean;
  needsSubclassChoice: boolean;
  needsFightingStyleChoice: boolean;
  hpGainMode: 'avg' | 'roll';
  setHpGainMode: (mode: 'avg' | 'roll') => void;
  rolledValue: number | null;
  setRolledValue: (val: number | null) => void;
  levelUpSubclass: string;
  levelUpFightingStyle: string;
  levelUpAsiChoice: 'asi' | 'feat';
  asiMode: 'single' | 'double';
  asiStat1: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  asiStat2: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
  selectedFeatName: string;
  setSelectedSubclass: (sub: string) => void;
  setCurrentHp: (hp: number) => void;
  setSaveMessage: (msg: string | null) => void;
  getCharacterActiveFeats: (char: any) => string[];
  setShowLevelUpModal: (show: boolean) => void;
  onCharacterUpdated?: () => void;
}

export function useConfirmLevelUp({
  character,
  nextLevel,
  hitDieVal,
  isCurrentLevelAsi,
  needsSubclassChoice,
  needsFightingStyleChoice,
  hpGainMode,
  setHpGainMode,
  rolledValue,
  setRolledValue,
  levelUpSubclass,
  levelUpFightingStyle,
  levelUpAsiChoice,
  asiMode,
  asiStat1,
  asiStat2,
  selectedFeatName,
  setSelectedSubclass,
  setCurrentHp,
  setSaveMessage,
  getCharacterActiveFeats,
  setShowLevelUpModal,
  onCharacterUpdated,
}: UseConfirmLevelUpProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  const handleRollHitDie = () => {
    setIsRolling(true);
    setHpGainMode('roll');
    let count = 0;
    const interval = setInterval(() => {
      setRolledValue(Math.floor(Math.random() * hitDieVal) + 1);
      count++;
      if (count > 8) {
        clearInterval(interval);
        setIsRolling(false);
      }
    }, 60);
  };

  const handleConfirmLevelUp = async () => {
    setIsLevelingUp(true);
    try {
      const featsList = Array.isArray(character.feats) ? [...character.feats] : [];

      const statsResult = applyAsiStats({
        character,
        nextLevel,
        levelUpAsiChoice,
        asiMode,
        asiStat1,
        asiStat2,
        selectedFeatName,
        featsList,
      });

      if (!statsResult.success) {
        setIsLevelingUp(false);
        return;
      }

      const { newStr, newDex, newCon, newInt, newWis, newCha, asiSummaryText } = statsResult;
      const newConMod = Math.floor((newCon - 10) / 2);

      const finalSubclass = needsSubclassChoice
        ? levelUpSubclass
        : character.subclass || 'Champion';
      const finalSubclassName = formatSubclassName(FIGHTER_SUBCLASSES[finalSubclass]?.name || finalSubclass);
      const finalFightingStyle = needsFightingStyleChoice ? levelUpFightingStyle : character.fighting_style || 'Arquearia';

      const hpChoicesResult = calculateHpAndChoices({
        character,
        nextLevel,
        hitDieVal,
        hpGainMode,
        rolledValue,
        newConMod,
        finalSubclassName,
        finalFightingStyle,
        isCurrentLevelAsi,
        asiSummaryText,
        needsSubclassChoice,
        needsFightingStyleChoice,
        featsList,
        getCharacterActiveFeats,
      });

      const { choiceEntry, newLevelChoices, newMaxHp, newCurrentHp, newHitDice } = hpChoicesResult;

      const newResources = calculateLevelUpResources({
        character,
        nextLevel,
        newStr,
        newDex,
        newCon,
        newInt,
        newWis,
        newCha,
        finalSubclass,
      });

      await persistLevelUpChanges({
        character,
        nextLevel,
        newMaxHp,
        newCurrentHp,
        newHitDice,
        newStr,
        newDex,
        newCon,
        newInt,
        newWis,
        newCha,
        finalSubclass,
        finalSubclassName,
        finalFightingStyle,
        featsList,
        newLevelChoices,
        newResources,
        choiceEntry,
        isCurrentLevelAsi,
        levelUpAsiChoice,
        selectedFeatName,
      });

      setSelectedSubclass(finalSubclass);
      setCurrentHp(newCurrentHp);

      setShowLevelUpModal(false);
      setRolledValue(null);
      setHpGainMode('avg');
      setSaveMessage(
        `🎉 EVOLUÇÃO CONCLUÍDA! ${character.name} subiu para o Nível ${nextLevel}! Todas as escolhas foram gravadas PERMANENTEMENTE na sua ficha.`
      );
      setTimeout(() => setSaveMessage(null), 7000);

      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      console.error('Erro ao subir de nível:', err);
      alert('Erro ao atualizar subida de nível: ' + err.message);
    } finally {
      setIsLevelingUp(false);
    }
  };

  return {
    isRolling,
    isLevelingUp,
    handleRollHitDie,
    handleConfirmLevelUp,
  };
}
