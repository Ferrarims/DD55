import { useState, useMemo, useEffect } from 'react';
import { getMod, normalizeHitDice } from '../../../../lib/mechanics/hpCalculator';
import { getXpProgress, XP_LEVEL_TABLE } from '../../../../lib/mechanics/xpAndLootManager';
import { useXpManager } from './levelUp/useXpManager';
import { usePendingChoices } from './levelUp/usePendingChoices';
import { useConfirmLevelUp } from './levelUp/useConfirmLevelUp';

export const useLevelUpEngine = (
  character: any,
  selectedSubclass: string,
  setSelectedSubclass: (sub: string) => void,
  setCurrentHp: (hp: number) => void,
  setSaveMessage: (msg: string | null) => void,
  getCharacterActiveFeats: (char: any) => string[],
  calculateTotalAc: (
    char: any,
    armor: string | null,
    shield: string | null,
    ring: string | null,
    fStyle?: string | null,
    invItems?: any[]
  ) => number,
  setCurrentAc: (ac: number) => void,
  equippedArmor: string | null,
  equippedShield: string | null,
  equippedRing: string | null,
  onCharacterUpdated?: () => void
) => {
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [hpGainMode, setHpGainMode] = useState<'avg' | 'roll'>('avg');
  const [rolledValue, setRolledValue] = useState<number | null>(null);

  // Seleções no Modal de Level Up
  const [levelUpSubclass, setLevelUpSubclass] = useState<string>(character.subclass || 'Champion');
  const [levelUpFightingStyle, setLevelUpFightingStyle] = useState<string>(character.fighting_style || 'Arquearia');
  const [levelUpAsiChoice, setLevelUpAsiChoice] = useState<'asi' | 'feat'>('asi');
  const [asiMode, setAsiMode] = useState<'single' | 'double'>('single');
  const [asiStat1, setAsiStat1] = useState<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'>('str');
  const [asiStat2, setAsiStat2] = useState<'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'>('con');
  const [selectedFeatName, setSelectedFeatName] = useState<string>('');

  // Escolhas pendentes no topo da ficha
  const [pendingFightingStyle, setPendingFightingStyle] = useState<string>(character.fighting_style || 'Arquearia');
  const [pendingSubclass, setPendingSubclass] = useState<string>(character.subclass || 'Champion');

  const effectiveLevel = character.level || 1;
  const nextLevel = effectiveLevel + 1;
  const isDwarf = ['Anão', 'Dwarf'].includes(character.race);
  const normalizedHD = normalizeHitDice(character.hit_dice, effectiveLevel, character.class_name);
  const hitDieVal = normalizedHD.sides;
  const hitDieStr = normalizedHD.unitStr;
  const currentConMod = getMod(character.constitution || 10);

  const isCurrentLevelAsi = (character.class_name || '').toLowerCase().includes('guerreiro')
    ? [4, 6, 8, 12, 14, 16, 19].includes(nextLevel)
    : [4, 8, 12, 16, 19].includes(nextLevel);

  const isFighter = (character.class_name || '').toLowerCase().includes('guerreiro');
  const needsSubclassChoice = nextLevel === 3 && (!character.subclass || character.subclass === 'Champion');
  const needsFightingStyleChoice = isFighter;

  useEffect(() => {
    if (character.fighting_style) {
      setLevelUpFightingStyle(character.fighting_style);
    }
  }, [character.fighting_style, showLevelUpModal]);

  const hasPendingFightingStyle =
    !character.fighting_style_locked &&
    !character.fighting_style &&
    (character.class_name || '').toLowerCase().includes('guerreiro');

  const hasPendingSubclass =
    effectiveLevel >= 3 &&
    !character.subclass_locked &&
    !character.subclass &&
    (character.class_name || '').toLowerCase().includes('guerreiro');

  const hasPendingLevelChoices = hasPendingFightingStyle || hasPendingSubclass;

  const xpProgress = useMemo(() => getXpProgress(character.xp || 0), [character.xp]);
  const canLevelUp =
    (xpProgress.level > effectiveLevel || (character.xp || 0) >= (XP_LEVEL_TABLE[nextLevel] || 999999)) &&
    effectiveLevel < 20;

  const { handleModifyXp } = useXpManager({
    character,
    hitDieVal,
    getCharacterActiveFeats,
    setCurrentHp,
    setSaveMessage,
    onCharacterUpdated,
  });

  const { isSavingPendingChoices, handleSavePendingChoices, handleSelectSubclass } = usePendingChoices({
    character,
    setSelectedSubclass,
    setSaveMessage,
    calculateTotalAc,
    setCurrentAc,
    equippedArmor,
    equippedShield,
    equippedRing,
    hasPendingFightingStyle,
    hasPendingSubclass,
    pendingFightingStyle,
    pendingSubclass,
    onCharacterUpdated,
  });

  const { isRolling, isLevelingUp, handleRollHitDie, handleConfirmLevelUp } = useConfirmLevelUp({
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
  });

  useEffect(() => {
    if (!showLevelUpModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirmLevelUp();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLevelUpModal, handleConfirmLevelUp]);

  return {
    showLevelUpModal,
    setShowLevelUpModal,
    hpGainMode,
    setHpGainMode,
    rolledValue,
    setRolledValue,
    isRolling,
    isLevelingUp,
    levelUpSubclass,
    setLevelUpSubclass,
    levelUpFightingStyle,
    setLevelUpFightingStyle,
    levelUpAsiChoice,
    setLevelUpAsiChoice,
    asiMode,
    setAsiMode,
    asiStat1,
    setAsiStat1,
    asiStat2,
    setAsiStat2,
    selectedFeatName,
    setSelectedFeatName,
    pendingFightingStyle,
    setPendingFightingStyle,
    pendingSubclass,
    setPendingSubclass,
    isSavingPendingChoices,
    effectiveLevel,
    nextLevel,
    isDwarf,
    hitDieStr,
    hitDieVal,
    currentConMod,
    isCurrentLevelAsi,
    needsSubclassChoice,
    needsFightingStyleChoice,
    hasPendingFightingStyle,
    hasPendingSubclass,
    hasPendingLevelChoices,
    canLevelUp,
    xpProgress,
    handleRollHitDie,
    handleConfirmLevelUp,
    handleSavePendingChoices,
    handleModifyXp,
    handleSelectSubclass,
  };
};
