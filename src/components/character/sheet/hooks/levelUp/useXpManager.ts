import { getLevelFromXp } from '../../../../../lib/mechanics/xpAndLootManager';
import { getMod } from '../../../../../lib/mechanics/hpCalculator';
import { calculateResources } from '../../../../../lib/mechanics/resourcesParser';
import { updateCharacter, saveCharacterFeatures } from '../../../../../lib/api/characterService';
import { extractBaseHpFromLevelChoice } from './levelUpHelpers';

export interface UseXpManagerProps {
  character: any;
  hitDieVal: number;
  getCharacterActiveFeats: (char: any) => string[];
  setCurrentHp: (hp: number) => void;
  setSaveMessage: (msg: string | null) => void;
  onCharacterUpdated?: () => void;
}

export function useXpManager({
  character,
  hitDieVal,
  getCharacterActiveFeats,
  setCurrentHp,
  setSaveMessage,
  onCharacterUpdated,
}: UseXpManagerProps) {
  const handleModifyXp = async (amount: number, isAbsolute = false) => {
    const currentXp = character.xp || 0;
    const newXp = isAbsolute ? Math.max(0, amount) : Math.max(0, currentXp + amount);
    const oldLevel = character.level || 1;
    const targetLevel = getLevelFromXp(newXp);

    character.xp = newXp;
    let newEffectiveLevel = oldLevel;
    if (targetLevel < oldLevel) {
      character.level = targetLevel;
      newEffectiveLevel = targetLevel;
    }

    let updatedLevelChoices = Array.isArray(character.level_choices) ? [...character.level_choices] : [];
    if (targetLevel < oldLevel) {
      updatedLevelChoices = updatedLevelChoices.filter((entry: any) => entry.level <= targetLevel);
      character.level_choices = updatedLevelChoices;

      const baseHp = hitDieVal;
      let sumBaseHp = baseHp;
      updatedLevelChoices.forEach((entry: any) => {
        if (entry.level === 1) return;
        sumBaseHp += extractBaseHpFromLevelChoice(entry, hitDieVal, getMod(character.constitution || 10));
      });

      const conMod = getMod(character.constitution || 10);
      const conBonusTotal = conMod * targetLevel;
      const isDwarfRace = ['Anão', 'Dwarf'].includes(character.race);
      const dwarfBonus = isDwarfRace ? targetLevel : 0;
      const activeFeats = getCharacterActiveFeats(character);
      const hasTough = activeFeats.some(f => /vigoroso|tough/i.test(f || ''));
      const toughBonus = hasTough ? targetLevel * 2 : 0;
      const fortitudeBonus = activeFeats.some(f => /dádiva da fortitude/i.test(f || '')) ? 40 : 0;

      const newMaxHp = sumBaseHp + conBonusTotal + dwarfBonus + toughBonus + fortitudeBonus;
      character.max_hp = newMaxHp;
      setCurrentHp(Math.min(character.current_hp || character.max_hp, character.max_hp));
      character.current_hp = Math.min(character.current_hp || character.max_hp, character.max_hp);

      const recalculatedResources = calculateResources(
        character.class_name || 'Guerreiro',
        targetLevel,
        {
          str: character.strength || 10,
          dex: character.dexterity || 10,
          con: character.constitution || 10,
          int: character.intelligence || 10,
          wis: character.wisdom || 10,
          cha: character.charisma || 10,
        },
        character.subclass || 'Champion'
      );
      character.class_resources = recalculatedResources;
    }

    try {
      if (character.id) {
        const updatePayload: any = {
          xp: newXp,
        };
        if (targetLevel < oldLevel) {
          updatePayload.level = targetLevel;
          updatePayload.max_hp = character.max_hp;
          updatePayload.current_hp = character.current_hp;
          updatePayload.class_resources = character.class_resources;
        }

        await updateCharacter(character.id, updatePayload);

        if (targetLevel < oldLevel) {
          await saveCharacterFeatures(
            character.id,
            {
              level: targetLevel,
              xp: newXp,
              max_hp: character.max_hp,
              current_hp: character.current_hp,
              class_resources: character.class_resources,
            },
            { level_choices: updatedLevelChoices }
          );
        } else {
          await saveCharacterFeatures(character.id, { xp: newXp }, {});
        }
      }

      if (targetLevel > oldLevel) {
        setSaveMessage(
          `🎉 EXPERIÊNCIA ATUALIZADA: ${newXp} XP! Nível ${targetLevel} alcançado. Clique no botão de Evolução Disponível acima para subir de nível!`
        );
      } else if (targetLevel < oldLevel) {
        setSaveMessage(
          `⚠️ REGRESSÃO DE NÍVEL! Experiência: ${newXp} XP. Regrediu do Nível ${oldLevel} para o Nível ${targetLevel}. Bônus e histórico superiores foram removidos.`
        );
      } else {
        setSaveMessage(`⭐ Experiência atualizada para ${newXp} XP (Nível ${oldLevel}).`);
      }
      setTimeout(() => setSaveMessage(null), 6000);

      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      console.error('Erro ao atualizar XP:', err);
      alert('Erro ao atualizar XP: ' + err.message);
    }
  };

  return { handleModifyXp };
}
