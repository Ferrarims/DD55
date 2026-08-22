import { supabase } from '../../../../../../lib/api/supabase';
import { saveCharacterFeatures, addChoiceToCharacter, addFeatToCharacter } from '../../../../../../lib/api/characterService';

interface PersistLevelUpParams {
  character: any;
  nextLevel: number;
  newMaxHp: number;
  newCurrentHp: number;
  newHitDice: string;
  newStr: number;
  newDex: number;
  newCon: number;
  newInt: number;
  newWis: number;
  newCha: number;
  finalSubclass: string;
  finalSubclassName: string;
  finalFightingStyle: string;
  featsList: any[];
  newLevelChoices: any[];
  newResources: any[];
  choiceEntry: any;
  isCurrentLevelAsi: boolean;
  levelUpAsiChoice: 'asi' | 'feat';
  selectedFeatName: string;
}

export async function persistLevelUpChanges({
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
}: PersistLevelUpParams): Promise<void> {
  const coreData = {
    level: nextLevel,
    max_hp: newMaxHp,
    current_hp: newCurrentHp,
    hit_dice: newHitDice,
    hit_dice_current: nextLevel,
    strength: newStr,
    dexterity: newDex,
    constitution: newCon,
    intelligence: newInt,
    wisdom: newWis,
    charisma: newCha,
    class_resources: newResources,
    updated_at: new Date().toISOString(),
  };

  const featuresData = {
    subclass: finalSubclass,
    subclass_name: finalSubclassName,
    subclass_locked: true,
    fighting_style: finalFightingStyle,
    fighting_style_locked: true,
    feats: featsList,
    level_choices: newLevelChoices,
    class_resources: newResources,
  };

  await saveCharacterFeatures(character.id, coreData, featuresData);

  try {
    await addChoiceToCharacter(
      character.id,
      `level_${nextLevel}_choices`,
      JSON.stringify(choiceEntry),
      'level_up'
    );
  } catch (dbErr) {
    console.error('Erro no dual write (choices):', dbErr);
  }

  if (isCurrentLevelAsi && levelUpAsiChoice === 'feat' && selectedFeatName) {
    try {
      const { data: fData } = await (supabase.from('feats') as any)
        .select('id')
        .ilike('name', selectedFeatName)
        .limit(1);
      const featsData = fData as any[];
      if (featsData && featsData.length > 0) {
        await addFeatToCharacter(character.id, featsData[0].id, 'level_up');
      }
    } catch (featErr) {
      console.error('Erro ao salvar feat (level_up):', featErr);
    }
  }

  // Sincroniza o objeto character em memória
  character.level = nextLevel;
  character.max_hp = newMaxHp;
  character.current_hp = newCurrentHp;
  character.hit_dice = newHitDice;
  character.hit_dice_current = nextLevel;
  character.strength = newStr;
  character.dexterity = newDex;
  character.constitution = newCon;
  character.intelligence = newInt;
  character.wisdom = newWis;
  character.charisma = newCha;
  character.subclass = finalSubclass;
  character.subclass_name = finalSubclassName;
  character.subclass_locked = true;
  character.fighting_style = finalFightingStyle;
  character.fighting_style_locked = true;
  character.class_resources = newResources;
  character.feats = featsList;
  character.level_choices = newLevelChoices;
}
