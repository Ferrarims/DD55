import { useMemo, useEffect } from 'react';
import { calculateAC } from '../../../../../lib/mechanics/acCalculator';
import { updateCharacter } from '../../../../../lib/api/characterService';

export interface UseSlotAcCalculatorProps {
  character: any;
  equippedArmor: string | null;
  equippedShield: string | null;
  equippedRing: string | null;
  equipmentSlots: Record<string, string | null>;
  getCharacterActiveFeats: (char: any) => string[];
  currentAc: number;
  setCurrentAc: (ac: number) => void;
}

export function useSlotAcCalculator({
  character,
  equippedArmor,
  equippedShield,
  equippedRing,
  equipmentSlots,
  getCharacterActiveFeats,
  currentAc,
  setCurrentAc,
}: UseSlotAcCalculatorProps) {
  const calculateTotalAc = (
    char: any,
    armor: string | null,
    shield: string | null,
    ring: string | null,
    fStyle?: string | null,
    invItems?: any[]
  ) => {
    const res = calculateAC({
      charClass: char.class_name || char.charClass || '',
      stats: {
        dex: char.dexterity || char.dex || 10,
        con: char.constitution || char.con || 10,
        wis: char.wisdom || char.wis || 10,
      },
      equippedArmor: armor,
      equippedShield: shield,
      equippedRing: ring,
      fightingStyle: fStyle || char.fighting_style,
      inventoryItems: invItems || char.character_inventory,
      equipmentSlots,
      feats: getCharacterActiveFeats(char),
    });
    return res.armor_class;
  };

  const acDetails = useMemo(() => {
    return calculateAC({
      charClass: character.class_name || character.charClass || '',
      stats: {
        dex: character.dexterity || character.dex || 10,
        con: character.constitution || character.con || 10,
        wis: character.wisdom || character.wis || 10,
      },
      equippedArmor,
      equippedShield,
      equippedRing,
      fightingStyle: character.fighting_style,
      inventoryItems: character.character_inventory,
      equipmentSlots,
      feats: getCharacterActiveFeats(character),
    });
  }, [character, equippedArmor, equippedShield, equippedRing, equipmentSlots, getCharacterActiveFeats]);

  useEffect(() => {
    if (acDetails.ac !== currentAc) {
      setCurrentAc(acDetails.ac);
      character.armor_class = acDetails.ac;
      if (character.id) {
        updateCharacter(character.id, { armor_class: acDetails.ac }).catch(err => {
          console.warn('Erro ao atualizar armor_class do personagem no DB:', err);
        });
      }
    }
  }, [acDetails.ac, currentAc, character, setCurrentAc]);

  return {
    calculateTotalAc,
    acDetails,
  };
}
