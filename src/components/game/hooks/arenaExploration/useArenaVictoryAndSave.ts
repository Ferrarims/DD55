import React, { useState } from 'react';
import { addItemToInventory, updateCharacter } from '../../../../lib/api/characterService';
import { getAllShopCatalog, getLevelFromXp } from '../../../../lib/mechanics/xpAndLootManager';
import { calculateResources, calculateRaceResources } from '../../../../lib/mechanics/resourcesParser';
import { VictoryData } from './types';

export interface UseArenaVictoryAndSaveProps {
  character: any;
  onCharacterUpdated?: () => Promise<void> | void;
  onExitGame: () => void;
  victoryData: VictoryData | null;
  setVictoryData: React.Dispatch<React.SetStateAction<VictoryData | null>>;
  setIsBattleOver: (val: boolean) => void;
  setIsVictoryScreenVisible: (val: boolean) => void;
  setShowVictorySummaryModal: (val: boolean) => void;
  setMapStreak: React.Dispatch<React.SetStateAction<number>>;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
}

export function useArenaVictoryAndSave(props: UseArenaVictoryAndSaveProps) {
  const {
    character,
    onCharacterUpdated,
    onExitGame,
    victoryData,
    setVictoryData,
    setIsBattleOver,
    setIsVictoryScreenVisible,
    setShowVictorySummaryModal,
    setMapStreak,
    addCombatLog,
  } = props;

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleFinishExploration = () => {
    setIsBattleOver(true);
    setIsVictoryScreenVisible(true);
    addCombatLog('Mestre do Jogo', '🚪 MAPA FINALIZADO!', 'Você encerrou a exploração do mapa e pode reivindicar suas recompensas!', 'system');
  };

  const handleClaimLootAndSave = async () => {
    if (!character.id || !victoryData) return;
    setIsSaving(true);
    try {
      const currentXp = (character.xp || 0) + victoryData.totalXp;
      const targetLvl = getLevelFromXp(currentXp);
      const hasLevelUpAvailable = targetLvl > (character.level || 1);

      const catalog = getAllShopCatalog();
      const equipmentSet = new Set((character.character_inventory || []).map((inv: any) => inv.items?.name?.toLowerCase()));
      
      for (const item of victoryData.loot) {
        if (item.type !== 'gold') {
          if (!equipmentSet.has(item.name.toLowerCase())) {
             const cleanName = item.name.replace(/^1x\s*/i, '').replace(/^\d+\s+/, '').trim();
             const shopItem = catalog.find((i: any) => i.name.toLowerCase() === cleanName.toLowerCase());
             const itemId = shopItem ? shopItem.id : null;
             if (!itemId) {
                console.warn("Item não encontrado no banco de dados:", cleanName);
                addCombatLog('Mestre do Jogo', '⚠️ Item Desconhecido', `O item ${cleanName} não existe no banco de dados e não pôde ser adicionado.`, 'system');
                continue;
             }
             await addItemToInventory(character.id, itemId, 1, null);
             equipmentSet.add(item.name.toLowerCase());
          }
        }
      }

      let newBestiary = character.defeated_monsters || character.defeatedMonsters || {};
      if (victoryData.defeatedMonsters) {
        newBestiary = { ...newBestiary };
        Object.entries(victoryData.defeatedMonsters).forEach(([name, count]) => {
          newBestiary[name] = (newBestiary[name] || 0) + (count as number);
        });
        character.defeated_monsters = newBestiary;
        character.defeatedMonsters = newBestiary;
        const bestiaryKey = `bestiary_${character.id}`;
        localStorage.setItem(bestiaryKey, JSON.stringify(newBestiary));
      }

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
      let refreshedRes = calculateResources(
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
        if (!refreshedRes.some(cr => cr.name.toLowerCase() === rr.name.toLowerCase())) {
          refreshedRes.push(rr);
        }
      });
      refreshedRes = refreshedRes.map((r: any) => ({ ...r, used: 0 }));

      character.xp = currentXp;
      character.current_hp = maxHp;
      character.temp_hp = 0;
      character.hit_dice_current = fullLevel;
      character.exhaustion_level = 0;
      character.class_resources = refreshedRes;

      const updatePayload: any = {
        xp: currentXp,
        current_hp: maxHp,
        temp_hp: 0,
        hit_dice_current: fullLevel,
        exhaustion_level: 0,
        class_resources: refreshedRes,
        defeated_monsters: newBestiary
      };
      
      await updateCharacter(character.id, updatePayload);

      alert(`🎉 Recompensas salvas na Ficha com sucesso!\n\n⭐ +${victoryData.totalXp} XP (Total: ${currentXp} XP)\n🎒 ${victoryData.loot.filter((i: any) => i.type !== 'gold').length} item(ns) no inventário!${hasLevelUpAvailable ? '\n\n🔥 EVOLUÇÃO DISPONÍVEL! Vá até a Ficha do Personagem para Rolar seu Dado de Vida e Ativar as Habilidades do Nível!' : ''}`);
      
      setMapStreak(1);
      setVictoryData({ totalXp: 0, loot: [], defeatedMonsters: {}, totalDamageDealt: 0 });
      setShowVictorySummaryModal(false);
      if (onCharacterUpdated) await onCharacterUpdated();
      onExitGame();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao salvar progresso no banco de dados: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    setIsSaving,
    handleFinishExploration,
    handleClaimLootAndSave
  };
}
