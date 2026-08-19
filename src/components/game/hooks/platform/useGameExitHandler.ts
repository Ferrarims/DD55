import { useCallback } from 'react';
import { CombatEntity } from '../../../../game/types';
import { updateCharacter } from '../../../../lib/api/characterService';
import { calculateResources, calculateRaceResources } from '../../../../lib/mechanics/resourcesParser';

export interface UseGameExitHandlerProps {
  character: any;
  entities: CombatEntity[];
  secondWindUses: number;
  secondWindMaxUses: number;
  onCharacterUpdated?: () => Promise<void> | void;
  onExitGame: () => void;
}

export function useGameExitHandler({
  character,
  entities,
  secondWindUses,
  secondWindMaxUses,
  onCharacterUpdated,
  onExitGame
}: UseGameExitHandlerProps) {
  const handleExitGame = useCallback(async () => {
    if (character && character.id) {
      const maxHp = character.max_hp || 20;
      const fullLevel = character.level || 1;

      const stats = {
        str: character.strength || 10,
        dex: character.dexterity || 10,
        con: character.constitution || 10,
        int: character.intelligence || 10,
        wis: character.wisdom || 10,
        cha: character.charisma || 10,
      };
      let updatedResources = calculateResources(
        character.class_name || 'Guerreiro',
        fullLevel,
        stats,
        character.subclass || 'Champion'
      );
      const raceRes = calculateRaceResources(
        character.race || '',
        fullLevel,
        character.draconic_ancestry,
        character.giant_ancestry || character.giantAncestry
      );
      raceRes.forEach(rr => {
        if (!updatedResources.some(cr => cr.name.toLowerCase() === rr.name.toLowerCase())) {
          updatedResources.push(rr);
        }
      });
      updatedResources = updatedResources.map((r: any) => ({ ...r, used: 0 }));

      character.current_hp = maxHp;
      character.temp_hp = 0;
      character.hit_dice_current = fullLevel;
      character.exhaustion_level = 0;
      character.class_resources = updatedResources;

      try {
        await updateCharacter(character.id, { 
          current_hp: maxHp, 
          temp_hp: 0,
          hit_dice_current: fullLevel,
          exhaustion_level: 0,
          class_resources: updatedResources 
        });
        if (onCharacterUpdated) await onCharacterUpdated();
      } catch (err) {
        console.error("Error updating character on exit:", err);
      }
    }
    onExitGame();
  }, [character, onCharacterUpdated, onExitGame]);

  return {
    handleExitGame
  };
}
