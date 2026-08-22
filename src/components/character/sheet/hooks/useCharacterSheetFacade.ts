import { useState, useMemo, useEffect } from 'react';
import { getMod } from '../../../../lib/mechanics/hpCalculator';
import { getBestiaryStats } from '../utils';
import { useCharacterSheetState } from './useCharacterSheetState';
import { useEquipmentSlots } from './useEquipmentSlots';
import { useInventoryTrade } from './useInventoryTrade';
import { useCharacterClassActions } from './useCharacterClassActions';
import { useLevelUpEngine } from './useLevelUpEngine';
import {
  getCharacterActiveFeats,
  getDisplayResistances,
  getBreathWeaponDetails,
  calculateHpBreakdown,
  getNextProgressionDetails,
  getAttacksList,
} from '../utils/characterSheetCalculations';
import { CLASS_ICONS, CLASS_NAME_MAP } from '../constants';

export interface UseCharacterSheetFacadeProps {
  character: any;
  onCharacterUpdated?: () => void;
  isAdminView?: boolean;
}

export function useCharacterSheetFacade({
  character,
  onCharacterUpdated,
  isAdminView = false,
}: UseCharacterSheetFacadeProps) {
  // 1. Estado Base da Ficha
  const sheetState = useCharacterSheetState(character);
  const {
    currentHp,
    setCurrentHp,
    setCurrentExhaustion,
    setSaveMessage,
  } = sheetState;

  // 2. Subclasse
  const [selectedSubclass, setSelectedSubclass] = useState<string>(
    character.subclass || character.subclass_name || 'Champion'
  );
  const [showSubclassModal, setShowSubclassModal] = useState(false);

  // 3. Equipamentos e Slots
  const equipmentSlotsHook = useEquipmentSlots(
    character,
    getCharacterActiveFeats,
    msg => {
      if (msg) {
        setSaveMessage(msg.text);
        setTimeout(() => setSaveMessage(null), 4000);
      }
    },
    onCharacterUpdated,
    currentHp,
    setCurrentHp
  );

  const {
    equipmentSlots,
    setEquippedArmor,
    setEquippedShield,
    setEquippedRing,
    calculateTotalAc,
    setCurrentAc,
    getItemCategory,
  } = equipmentSlotsHook;

  // 4. Comércio e Inventário
  const inventoryTrade = useInventoryTrade(
    character,
    equipmentSlots,
    equipmentSlotsHook.setEquipmentSlots,
    setEquippedArmor,
    setEquippedShield,
    setEquippedRing,
    calculateTotalAc,
    setCurrentAc,
    currentHp,
    setCurrentHp,
    sheetState.setShowShortRestModal,
    msg => {
      if (msg) {
        setSaveMessage(msg.text);
        setTimeout(() => setSaveMessage(null), 4000);
      }
    },
    getItemCategory,
    character.fighting_style || 'Arquearia',
    onCharacterUpdated
  );

  // 5. Ações de Classe e Descansos
  const classActions = useCharacterClassActions(
    character,
    currentHp,
    setCurrentHp,
    setCurrentExhaustion,
    setSaveMessage,
    onCharacterUpdated,
    selectedSubclass
  );

  useEffect(() => {
    if (!isAdminView) {
      classActions.handleLongRest();
    }
  }, [character?.id, isAdminView]);

  // 6. Nivelamento
  const levelUpEngine = useLevelUpEngine(
    character,
    selectedSubclass,
    setSelectedSubclass,
    setCurrentHp,
    setSaveMessage,
    getCharacterActiveFeats,
    calculateTotalAc,
    setCurrentAc,
    equipmentSlots.corpo_torso,
    equipmentSlots.empunhadura_2,
    equipmentSlots.dedo_anel_1,
    onCharacterUpdated
  );

  const bestiaryStats = useMemo(() => getBestiaryStats(character), [character]);
  const displayResistances = useMemo(() => getDisplayResistances(character), [character]);
  const breathWeaponDetails = useMemo(() => getBreathWeaponDetails(character), [character]);
  const hpBreakdown = useMemo(
    () => calculateHpBreakdown(character, levelUpEngine.hitDieVal),
    [character, levelUpEngine.hitDieVal]
  );

  const rawClassKey = (character.class_name || character.className || 'Fighter').toLowerCase();
  const matchedClassKey = CLASS_NAME_MAP[rawClassKey] || 'Fighter';
  const icon = CLASS_ICONS[matchedClassKey] || '⚔️';
  const pb = 2 + Math.floor(((character.level || 1) - 1) / 4);

  const avgHpGain = Math.floor(levelUpEngine.hitDieVal / 2) + 1 + levelUpEngine.currentConMod;
  const rolledHpGain =
    (levelUpEngine.rolledValue !== null
      ? levelUpEngine.rolledValue
      : Math.floor(levelUpEngine.hitDieVal / 2) + 1) + levelUpEngine.currentConMod;
  const activeHpGain = levelUpEngine.hpGainMode === 'avg' ? avgHpGain : rolledHpGain;

  const { nextProgression, newFeaturesText } = useMemo(
    () =>
      getNextProgressionDetails(
        character.class_name,
        levelUpEngine.nextLevel,
        levelUpEngine.levelUpSubclass
      ),
    [character.class_name, levelUpEngine.nextLevel, levelUpEngine.levelUpSubclass]
  );

  const spellsList = useMemo(() => {
    const raw = character.spells || character.character_spells || [];
    return Array.isArray(raw) ? raw : [];
  }, [character.spells, character.character_spells]);

  const attacks = useMemo(
    () => getAttacksList(character, pb, spellsList),
    [character, pb, spellsList]
  );

  const hasMasteryFeature = useMemo(() => {
    const lvl = character.level || 1;
    return (character.class_name || '').toLowerCase().includes('guerreiro') && lvl >= 1;
  }, [character.class_name, character.level]);

  return {
    ...sheetState,
    selectedSubclass,
    setSelectedSubclass,
    showSubclassModal,
    setShowSubclassModal,
    ...equipmentSlotsHook,
    ...inventoryTrade,
    ...classActions,
    ...levelUpEngine,
    bestiaryStats,
    displayResistances,
    breathWeaponDetails,
    hpBreakdown,
    icon,
    pb,
    avgHpGain,
    rolledHpGain,
    activeHpGain,
    nextProgression,
    newFeaturesText,
    spellsList,
    attacks,
    hasMasteryFeature,
  };
}
