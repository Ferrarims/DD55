import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../../../lib/api/supabase';
import { saveCharacterFeatures, addChoiceToCharacter, addFeatToCharacter, updateCharacter } from '../../../../lib/api/characterService';
import { getMod, calculateTotalMaxHp, normalizeHitDice } from '../../../../lib/mechanics/hpCalculator';
import { calculateResources, calculateRaceResources } from '../../../../lib/mechanics/resourcesParser';
import { FIGHTER_SUBCLASSES, formatSubclassName } from '../../../../lib/api/references';
import { STAT_NAMES } from '../constants';
import { getLevelFromXp, getXpProgress, XP_LEVEL_TABLE } from '../../../../lib/mechanics/xpAndLootManager';

const STAT_NAMES_MAP = STAT_NAMES;

const extractBaseHpFromLevelChoice = (choice: any, defaultHitDieVal: number, conMod: number): number => {
  if (typeof choice?.baseHp === 'number') return choice.baseHp;
  const match = choice?.hpGain ? String(choice.hpGain).match(/\+(\d+)/) : null;
  if (match) {
    return Math.max(1, parseInt(match[1], 10) - conMod);
  }
  return Math.floor(defaultHitDieVal / 2) + 1;
};

export const useLevelUpEngine = (
  character: any,
  selectedSubclass: string,
  setSelectedSubclass: (sub: string) => void,
  setCurrentHp: (hp: number) => void,
  setSaveMessage: (msg: string | null) => void,
  getCharacterActiveFeats: (char: any) => string[],
  calculateTotalAc: (char: any, armor: string | null, shield: string | null, ring: string | null, fStyle?: string | null, invItems?: any[]) => number,
  setCurrentAc: (ac: number) => void,
  equippedArmor: string | null,
  equippedShield: string | null,
  equippedRing: string | null,
  onCharacterUpdated?: () => void
) => {
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [hpGainMode, setHpGainMode] = useState<'avg' | 'roll'>('avg');
  const [rolledValue, setRolledValue] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

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
  const [isSavingPendingChoices, setIsSavingPendingChoices] = useState(false);

  const effectiveLevel = character.level || 1;
  const nextLevel = effectiveLevel + 1;
  const isDwarf = ['Anão', 'Dwarf'].includes(character.race);
  const normalizedHD = normalizeHitDice(character.hit_dice, effectiveLevel, character.class_name);
  const hitDieVal = normalizedHD.sides;
  const hitDieStr = normalizedHD.unitStr; // e.g. 'd10'
  const currentConMod = getMod(character.constitution || 10);

  const isCurrentLevelAsi = (character.class_name || '').toLowerCase().includes('guerreiro')
    ? [4, 6, 8, 12, 14, 16, 19].includes(nextLevel)
    : [4, 8, 12, 16, 19].includes(nextLevel);

  const isFighter = (character.class_name || '').toLowerCase().includes('guerreiro');
  const needsSubclassChoice = nextLevel === 3 && (!character.subclass || character.subclass === 'Champion');
  const needsFightingStyleChoice = isFighter;

  // Sincronizar estilo de luta ao abrir modal ou atualizar personagem
  useEffect(() => {
    if (character.fighting_style) {
      setLevelUpFightingStyle(character.fighting_style);
    }
  }, [character.fighting_style, showLevelUpModal]);

  const hasPendingFightingStyle =
    !character.fighting_style_locked &&
    (character.class_name || '').toLowerCase().includes('guerreiro');

  const hasPendingSubclass =
    effectiveLevel >= 3 &&
    !character.subclass_locked &&
    (character.class_name || '').toLowerCase().includes('guerreiro');

  const hasPendingLevelChoices = hasPendingFightingStyle || hasPendingSubclass;

  const xpProgress = useMemo(() => getXpProgress(character.xp || 0), [character.xp]);
  const canLevelUp = (xpProgress.level > effectiveLevel || (character.xp || 0) >= (XP_LEVEL_TABLE[nextLevel] || 999999)) && effectiveLevel < 20;

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
      let newStr = character.strength || 10;
      let newDex = character.dexterity || 10;
      let newCon = character.constitution || 10;
      let newInt = character.intelligence || 10;
      let newWis = character.wisdom || 10;
      let newCha = character.charisma || 10;
      const featsList = Array.isArray(character.feats) ? [...character.feats] : [];
      let asiSummaryText = 'Nenhum';

      if (isCurrentLevelAsi) {
        if (levelUpAsiChoice === 'asi') {
          if (asiMode === 'single' || (asiMode as any) === '+2') {
            if (asiStat1 === 'str') newStr = Math.min(20, newStr + 2);
            else if (asiStat1 === 'dex') newDex = Math.min(20, newDex + 2);
            else if (asiStat1 === 'con') newCon = Math.min(20, newCon + 2);
            else if (asiStat1 === 'int') newInt = Math.min(20, newInt + 2);
            else if (asiStat1 === 'wis') newWis = Math.min(20, newWis + 2);
            else if (asiStat1 === 'cha') newCha = Math.min(20, newCha + 2);
            asiSummaryText = `+2 em ${STAT_NAMES[asiStat1] || asiStat1.toUpperCase()}`;
          } else {
            if (asiStat1 === 'str') newStr = Math.min(20, newStr + 1);
            else if (asiStat1 === 'dex') newDex = Math.min(20, newDex + 1);
            else if (asiStat1 === 'con') newCon = Math.min(20, newCon + 1);
            else if (asiStat1 === 'int') newInt = Math.min(20, newInt + 1);
            else if (asiStat1 === 'wis') newWis = Math.min(20, newWis + 1);
            else if (asiStat1 === 'cha') newCha = Math.min(20, newCha + 1);

            if (asiStat2 === 'str') newStr = Math.min(20, newStr + 1);
            else if (asiStat2 === 'dex') newDex = Math.min(20, newDex + 1);
            else if (asiStat2 === 'con') newCon = Math.min(20, newCon + 1);
            else if (asiStat2 === 'int') newInt = Math.min(20, newInt + 1);
            else if (asiStat2 === 'wis') newWis = Math.min(20, newWis + 1);
            else if (asiStat2 === 'cha') newCha = Math.min(20, newCha + 1);
            asiSummaryText = `+1 em ${STAT_NAMES[asiStat1] || asiStat1.toUpperCase()} e +1 em ${
              STAT_NAMES[asiStat2] || asiStat2.toUpperCase()
            }`;
          }
        } else if (levelUpAsiChoice === 'feat') {
          if (selectedFeatName) {
            if (
              selectedFeatName === 'Mestre em Armas Grandes' ||
              selectedFeatName === 'Great Weapon Master'
            ) {
              if (nextLevel < 4 || newStr < 13) {
                alert('⚠️ Mestre em Armas Grandes requer Nível 4+ e Força 13+!');
                setIsLevelingUp(false);
                return;
              }
              newStr = Math.min(20, newStr + 1);
            } else if (
              selectedFeatName === 'Mestre-Atirador' ||
              selectedFeatName === 'Sharpshooter'
            ) {
              if (nextLevel < 4 || newDex < 13) {
                alert('⚠️ Mestre-Atirador requer Nível 4+ e Destreza 13+!');
                setIsLevelingUp(false);
                return;
              }
              newDex = Math.min(20, newDex + 1);
            } else if (selectedFeatName === 'Perfurador' || selectedFeatName === 'Piercer') {
              if (nextLevel < 4) {
                alert('⚠️ Perfurador requer Nível 4+!');
                setIsLevelingUp(false);
                return;
              }
              newDex = Math.min(20, newDex + 1);
            }

            if (!featsList.includes(selectedFeatName)) {
              featsList.push(selectedFeatName);
            }
          }
          asiSummaryText = `Talento: ${selectedFeatName}`;
        }
      }

      newStr = Math.min(20, newStr);
      newDex = Math.min(20, newDex);
      newCon = Math.min(20, newCon);
      newInt = Math.min(20, newInt);
      newWis = Math.min(20, newWis);
      newCha = Math.min(20, newCha);

      const newConMod = Math.floor((newCon - 10) / 2);
      const baseDieHp =
        hpGainMode === 'avg'
          ? Math.floor(hitDieVal / 2) + 1
          : rolledValue || Math.floor(hitDieVal / 2) + 1;

      const finalSubclass = needsSubclassChoice
        ? levelUpSubclass
        : character.subclass || selectedSubclass || 'Champion';
      const finalSubclassName = formatSubclassName(
        FIGHTER_SUBCLASSES[finalSubclass]?.name || finalSubclass
      );
      const finalFightingStyle = needsFightingStyleChoice
        ? levelUpFightingStyle
        : character.fighting_style || 'Arquearia';

      const pastChoices = Array.isArray(character.level_choices)
        ? [...character.level_choices]
        : [];
      const choiceEntry: any = {
        level: nextLevel,
        date: new Date().toLocaleDateString('pt-BR'),
        baseHp: baseDieHp,
        hpGainMode,
        hpGain: `+${baseDieHp + newConMod} PV (${
          hpGainMode === 'avg' ? 'Média' : 'Dado Rolado'
        } + ${newConMod >= 0 ? '+' : ''}${newConMod} Con)`,
        locked: true,
      };

      // Subclasse só é gravada como escolha de nível no nível em que é desbloqueada/escolhida (Nível 3+)
      if (needsSubclassChoice || nextLevel === 3) {
        choiceEntry.subclass = finalSubclassName;
      }

      // Estilo de Luta só é gravado no nível 1 ou quando selecionado especificamente neste nível
      if (needsFightingStyleChoice || nextLevel === 1) {
        choiceEntry.fightingStyle = finalFightingStyle;
      }

      // Bônus de Atributo ou Talento só é gravado em níveis onde o bônus de atributo é realmente ganho
      if (isCurrentLevelAsi && asiSummaryText && asiSummaryText !== 'Nenhum') {
        choiceEntry.asiOrFeat = asiSummaryText;
      }

      const newLevelChoices = [...pastChoices, choiceEntry];

      let sumBaseHp = hitDieVal;
      pastChoices.forEach((lc: any) => {
        if (lc.level === 1) return;
        sumBaseHp += extractBaseHpFromLevelChoice(lc, hitDieVal, newConMod);
      });
      sumBaseHp += baseDieHp;

      const currentActiveFeats = getCharacterActiveFeats({ ...character, feats: featsList });
      const hasTough = currentActiveFeats.some(f => /vigoroso|tough/i.test(f || ''));
      const toughBonus = hasTough ? nextLevel * 2 : 0;
      const dwarfBonus = isDwarf ? nextLevel : 0;
      const fortitudeBonus = currentActiveFeats.some(f => /dádiva da fortitude/i.test(f || '')) ? 40 : 0;
      const newMaxHp = sumBaseHp + newConMod * nextLevel + dwarfBonus + toughBonus + fortitudeBonus;
      const newCurrentHp = newMaxHp;
      const newHitDice = `${nextLevel}d${hitDieVal}`;

      let newResources = calculateResources(
        character.class_name,
        nextLevel,
        {
          str: newStr,
          dex: newDex,
          con: newCon,
          int: newInt,
          wis: newWis,
          cha: newCha,
        },
        finalSubclass
      );

      const raceResources = calculateRaceResources(
        character.race || '',
        nextLevel,
        character.draconic_ancestry,
        character.giant_ancestry || character.giantAncestry
      );
      raceResources.forEach(rr => {
        if (!newResources.some(cr => cr.name === rr.name)) {
          newResources.push(rr);
        }
      });

      if (['Golias', 'Goliath'].includes(character.race)) {
        const giantAncestry = (
          character.giant_ancestry ||
          character.giantAncestry ||
          ''
        ).toLowerCase();
        newResources = newResources.filter(res => {
          const name = res.name.toLowerCase();
          if (
            name.includes('resistência da pedra') ||
            name.includes('resistência de pedra') ||
            name.includes("stone's endurance")
          ) {
            return (
              giantAncestry.includes('pedra') ||
              giantAncestry.includes('stone') ||
              !giantAncestry
            );
          }
          if (name.includes('salto das nuvens') || name.includes("cloud's jaunt")) {
            return giantAncestry.includes('nuvens') || giantAncestry.includes('cloud');
          }
          if (name.includes('queimadura do fogo') || name.includes("fire's burn")) {
            return giantAncestry.includes('fogo') || giantAncestry.includes('fire');
          }
          if (name.includes('frio do gelo') || name.includes("frost's chill")) {
            return giantAncestry.includes('gelo') || giantAncestry.includes('frost');
          }
          if (name.includes('queda da colina') || name.includes("hill's tumble")) {
            return giantAncestry.includes('colina') || giantAncestry.includes('hill');
          }
          if (name.includes('trovão da tempestade') || name.includes("storm's thunder")) {
            return giantAncestry.includes('tempestade') || giantAncestry.includes('storm');
          }
          return true;
        });
      }

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
        const newResources = calculateResources(
          character.class_name,
          character.level || 1,
          stats,
          pendingSubclass
        );
        coreUpdates.class_resources = newResources;
        featuresUpdates.class_resources = newResources;
        character.class_resources = newResources;
      }

      const pastChoices = Array.isArray(character.level_choices)
        ? [...character.level_choices]
        : [];
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

    let updatedLevelChoices = Array.isArray(character.level_choices)
      ? [...character.level_choices]
      : [];
    if (targetLevel < oldLevel) {
      updatedLevelChoices = updatedLevelChoices.filter(
        (entry: any) => entry.level <= targetLevel
      );
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
    const newResources = calculateResources(
      character.class_name,
      character.level || 1,
      stats,
      subKey
    );
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
      setSaveMessage(
        `✨ Subclasse "${subInfo.name}" ativada! Recursos e habilidades de combate atualizados.`
      );
      setTimeout(() => setSaveMessage(null), 5000);
      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      console.error('Erro ao salvar subclasse:', err);
    }
  };

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
