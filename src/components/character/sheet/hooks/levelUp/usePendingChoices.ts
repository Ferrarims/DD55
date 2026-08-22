import { useState } from 'react';
import { saveCharacterFeatures, addChoiceToCharacter } from '../../../../../lib/api/characterService';
import { calculateResources } from '../../../../../lib/mechanics/resourcesParser';
import { FIGHTER_SUBCLASSES } from '../../../../../lib/api/references';

export interface UsePendingChoicesProps {
  character: any;
  setSelectedSubclass: (sub: string) => void;
  setSaveMessage: (msg: string | null) => void;
  calculateTotalAc: (
    char: any,
    armor: string | null,
    shield: string | null,
    ring: string | null,
    fStyle?: string | null,
    invItems?: any[]
  ) => number;
  setCurrentAc: (ac: number) => void;
  equippedArmor: string | null;
  equippedShield: string | null;
  equippedRing: string | null;
  hasPendingFightingStyle: boolean;
  hasPendingSubclass: boolean;
  pendingFightingStyle: string;
  pendingSubclass: string;
  onCharacterUpdated?: () => void;
}

export function usePendingChoices({
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
}: UsePendingChoicesProps) {
  const [isSavingPendingChoices, setIsSavingPendingChoices] = useState(false);

  const handleSavePendingChoices = async () => {
    if (!character.id) return;
    setIsSavingPendingChoices(true);

    try {
      const coreUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      const featuresUpdates: any = {
        updated_at: new Date().toISOString(),
      };

      if (hasPendingFightingStyle) {
        featuresUpdates.fighting_style = pendingFightingStyle;
        featuresUpdates.fighting_style_locked = true;
        character.fighting_style = pendingFightingStyle;
        character.fighting_style_locked = true;
        const newAc = calculateTotalAc(
          character,
          equippedArmor,
          equippedShield,
          equippedRing,
          pendingFightingStyle
        );
        coreUpdates.armor_class = newAc;
        character.armor_class = newAc;
        setCurrentAc(newAc);
      }

      if (hasPendingSubclass) {
        const subInfo = FIGHTER_SUBCLASSES[pendingSubclass];
        const subName = subInfo?.name || pendingSubclass;
        featuresUpdates.subclass = pendingSubclass;
        featuresUpdates.subclass_name = subName;
        featuresUpdates.subclass_locked = true;

        character.subclass = pendingSubclass;
        character.subclass_name = subName;
        character.subclass_locked = true;
        setSelectedSubclass(pendingSubclass);

        const stats = {
          str: character.strength || 10,
          dex: character.dexterity || 10,
          con: character.constitution || 10,
          int: character.intelligence || 10,
          wis: character.wisdom || 10,
          cha: character.charisma || 10,
        };
        const newResources = calculateResources(character.class_name, character.level || 1, stats, pendingSubclass);
        coreUpdates.class_resources = newResources;
        featuresUpdates.class_resources = newResources;
        character.class_resources = newResources;
      }

      const pastChoices = Array.isArray(character.level_choices) ? [...character.level_choices] : [];
      const choiceEntry = {
        level: character.level || 1,
        date: new Date().toLocaleDateString('pt-BR'),
        subclass: featuresUpdates.subclass_name || character.subclass_name,
        fightingStyle: featuresUpdates.fighting_style || character.fighting_style,
        locked: true,
      };
      featuresUpdates.level_choices = [...pastChoices, choiceEntry];
      character.level_choices = featuresUpdates.level_choices;

      await saveCharacterFeatures(character.id, coreUpdates, featuresUpdates);

      try {
        await addChoiceToCharacter(
          character.id,
          `level_${choiceEntry.level}_choices`,
          JSON.stringify(choiceEntry),
          'nivelamento'
        );
      } catch (dbErr) {
        console.error('Erro no dual write (choices):', dbErr);
      }

      setSaveMessage('🔒 ESCOLHAS CONFIRMADAS E TRAVADAS PERMANENTEMENTE NA FICHA!');
      setTimeout(() => setSaveMessage(null), 6000);

      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      alert('Erro ao salvar escolhas: ' + err.message);
    } finally {
      setIsSavingPendingChoices(false);
    }
  };

  const handleSelectSubclass = async (subKey: string, setShowSubclassModal: (show: boolean) => void) => {
    const subInfo = FIGHTER_SUBCLASSES[subKey];
    if (!subInfo) return;

    setSelectedSubclass(subKey);
    character.subclass = subKey;
    character.subclass_name = subInfo.name;

    const stats = {
      str: character.strength || 10,
      dex: character.dexterity || 10,
      con: character.constitution || 10,
      int: character.intelligence || 10,
      wis: character.wisdom || 10,
      cha: character.charisma || 10,
    };
    const newResources = calculateResources(character.class_name, character.level || 1, stats, subKey);
    character.class_resources = newResources;

    try {
      if (character.id) {
        await saveCharacterFeatures(
          character.id,
          { class_resources: newResources, updated_at: new Date().toISOString() },
          { subclass: subKey, subclass_name: subInfo.name, class_resources: newResources }
        );
      }
      setShowSubclassModal(false);
      setSaveMessage(`✨ Subclasse "${subInfo.name}" ativada! Recursos e habilidades de combate atualizados.`);
      setTimeout(() => setSaveMessage(null), 5000);
      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      console.error('Erro ao salvar subclasse:', err);
    }
  };

  return {
    isSavingPendingChoices,
    handleSavePendingChoices,
    handleSelectSubclass,
  };
}
