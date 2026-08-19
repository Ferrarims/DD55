import { Dispatch, SetStateAction } from 'react';
import { CombatEntity } from '../../../types/game';
import { removeItemFromInventory, updateItemQuantity } from '../../../lib/api/characterService';

interface UseGameInventoryActionsProps {
  character: any;
  activeEntity: CombatEntity | undefined;
  entities: CombatEntity[];
  setEntities: Dispatch<SetStateAction<CombatEntity[]>>;
  itemQuantities: Record<string, number>;
  setItemQuantities: Dispatch<SetStateAction<Record<string, number>>>;
  addCombatLog: (actorName: string, title: string, detail: string, type: 'roll' | 'damage' | 'heal' | 'system' | 'attack') => void;
  isHeroTurn: boolean;
  isBattleOver: boolean;
  setShowItemModal: Dispatch<SetStateAction<boolean>>;
  setShowTargetModal: Dispatch<SetStateAction<boolean>>;
  setTargetCandidates: Dispatch<SetStateAction<CombatEntity[]>>;
  setPendingAttackInfo: Dispatch<SetStateAction<any>>;
  processDamageAndCheckKill: (targetId: string, dmg: number, attackerName: string, damageType: string, attackerType: 'hero' | 'monster') => void;
  getActiveFeats: () => string[];
  setPendingShortRestItem: Dispatch<SetStateAction<any>>;
  setHitDiceToSpend: Dispatch<SetStateAction<number>>;
  setShowShortRestModal: Dispatch<SetStateAction<boolean>>;
  onCharacterUpdated?: () => Promise<void> | void;
}

export function useGameInventoryActions({
  character,
  activeEntity,
  entities,
  setEntities,
  itemQuantities,
  setItemQuantities,
  addCombatLog,
  isHeroTurn,
  isBattleOver,
  setShowItemModal,
  setShowTargetModal,
  setTargetCandidates,
  setPendingAttackInfo,
  processDamageAndCheckKill,
  getActiveFeats,
  setPendingShortRestItem,
  setHitDiceToSpend,
  setShowShortRestModal,
  onCharacterUpdated,
}: UseGameInventoryActionsProps) {

  // Remover 1 unidade de item consumível do inventário do personagem no banco e na memória
  const removeConsumableFromCharacter = async (itemNameToRemove: string) => {
    if (!character || !character.character_inventory) return;
    const targetLower = itemNameToRemove.toLowerCase().trim();
    const idx = character.character_inventory.findIndex((inv: any) => {
      const name = inv.items?.name?.toLowerCase().trim() || '';
      return name === targetLower || name.includes(targetLower) || targetLower.includes(name);
    });

    if (idx !== -1) {
      const item = character.character_inventory[idx];
      const newQty = (item.quantity || 1) - 1;

      try {
        if (newQty <= 0) {
          character.character_inventory.splice(idx, 1);
          if (character.id) await removeItemFromInventory(item.id);
        } else {
          item.quantity = newQty;
          if (character.id) await updateItemQuantity(item.id, newQty);
        }
        if (onCharacterUpdated) await onCharacterUpdated();
      } catch (err) {
        console.error('Erro ao remover consumível:', err);
      }
    }
  };

  // 4. Usar Itens do Inventário de Combate
  const handleUseItem = (item: {
    id?: string;
    name: string;
    icon: string;
    actionCost: 'bonus' | 'action';
    effectType: 'heal_minor' | 'heal_major' | 'speed' | 'ac' | 'bomb' | 'kit' | 'tent' | 'sleeping_bag' | 'custom';
    customDetail?: string;
    targetEntity?: CombatEntity;
  }) => {
    const isTent = item.effectType === 'tent' || item.effectType === 'sleeping_bag';
    if (!isTent && (!isHeroTurn || isBattleOver)) return;
    const hero = (activeEntity || entities.find(e => e.type === 'hero') || { 
      name: character?.name || 'Herói', 
      id: 'hero', 
      maxHp: 10, 
      currentHp: 10, 
      x: 0, 
      y: 0,
      hasAction: true,
      hasBonusAction: true
    }) as CombatEntity;

    const itemId = item.id || item.name;
    const currentQty = itemQuantities[itemId] ?? 1;

    if (currentQty <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Item Esgotado', `Você já consumiu todas as unidades de ${item.name}!`, 'system');
      return;
    }

    if (!isTent && item.actionCost === 'bonus' && !hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Você já usou sua Ação Bônus neste turno!', 'system');
      return;
    }
    if (!isTent && item.actionCost === 'action' && !hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Principal Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    if (item.effectType === 'bomb') {
      const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead);
      if (aliveMonsters.length === 0) {
        addCombatLog('Mestre do Jogo', '⚠️ Nenhum Monstro Visto', 'Não há alvos válidos na arena.', 'system');
        return;
      }

      if (item.targetEntity) {
        setItemQuantities(prev => ({
          ...prev,
          [itemId]: Math.max(0, (prev[itemId] ?? 1) - 1)
        }));

        removeConsumableFromCharacter(item.name);

        const dmg = Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1; // 2d6
        addCombatLog(hero.name, `💣 ${item.name.toUpperCase()} em ${item.targetEntity.name}!`, `Arremessou bomba e causou ${dmg} de dano de fogo/explosão.`, 'attack');
        processDamageAndCheckKill(item.targetEntity.id, dmg, hero.name, 'Fogo', 'hero');

        setEntities(prev => prev.map(e => {
          if (e.id === hero.id) return { ...e, hasAction: false };
          return e;
        }));
        setShowItemModal(false);
        setShowTargetModal(false);
        setPendingAttackInfo(null);
        return;
      }

      if (aliveMonsters.length === 1) {
        handleUseItem({ ...item, targetEntity: aliveMonsters[0] });
      } else {
        setTargetCandidates(aliveMonsters);
        setPendingAttackInfo({ type: 'bomb', item });
        setShowTargetModal(true);
      }
      return;
    }

    if (item.effectType === 'tent' || item.effectType === 'sleeping_bag') {
      const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead);
      if (aliveMonsters.length > 0) {
        addCombatLog('Mestre do Jogo', '⚠️ Perigo', 'Você não pode acampar enquanto houver monstros vivos na área!', 'system');
        return;
      }
    }

    if (item.effectType !== 'tent' && item.effectType !== 'sleeping_bag') {
      setItemQuantities(prev => ({
        ...prev,
        [itemId]: Math.max(0, (prev[itemId] ?? 1) - 1)
      }));

      removeConsumableFromCharacter(item.name);
    }

    const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
    const hasFortitude = getActiveFeats().includes('Dádiva da Fortitude');
    const extraHeal = hasFortitude ? Math.max(0, conMod) : 0;

    if (item.effectType === 'heal_minor') {
      let healAmount = Math.floor(Math.random() * 4) + 1 + Math.floor(Math.random() * 4) + 1 + 2; // 2d4+2
      if (hasFortitude) {
        healAmount += extraHeal;
      }
      const newHp = Math.min(hero.maxHp, hero.currentHp + healAmount);
      const recovered = newHp - hero.currentHp;
      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, currentHp: newHp, hasBonusAction: false } : e));
      addCombatLog(hero.name, `🧪 ${item.name.toUpperCase()}!`, `Recuperou ${recovered} PV (2d4+2${hasFortitude ? ` + ${extraHeal} [Dádiva da Fortitude]` : ''}). HP atual: ${newHp}/${hero.maxHp}`, 'heal');
    } else if (item.effectType === 'heal_major') {
      let healAmount = (Math.floor(Math.random() * 4) + 1) + (Math.floor(Math.random() * 4) + 1) + (Math.floor(Math.random() * 4) + 1) + (Math.floor(Math.random() * 4) + 1) + 4; // 4d4+4
      if (hasFortitude) {
        healAmount += extraHeal;
      }
      const newHp = Math.min(hero.maxHp, hero.currentHp + healAmount);
      const recovered = newHp - hero.currentHp;
      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, currentHp: newHp, hasBonusAction: false } : e));
      addCombatLog(hero.name, `🏺 ${item.name.toUpperCase()}!`, `Recuperou ${recovered} PV (4d4+4${hasFortitude ? ` + ${extraHeal} [Dádiva da Fortitude]` : ''}). HP atual: ${newHp}/${hero.maxHp}`, 'heal');
    } else if (item.effectType === 'speed') {
      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, remainingMovement: e.remainingMovement + 3, hasBonusAction: false } : e));
      addCombatLog(hero.name, `⚡ ${item.name.toUpperCase()}!`, 'Tomou o elixir de velocidade para ganhar +4.5m de deslocamento livre.', 'system');
    } else if (item.effectType === 'ac') {
      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, ac: e.armor_class + 3, hasBonusAction: false } : e));
      addCombatLog(hero.name, `📜 ${item.name.toUpperCase()}!`, 'Ativou proteção mágica (+3 na CA até o próximo turno).', 'system');
    } else if (item.effectType === 'kit') {
      const pb = 2 + Math.floor(((character.level || 1) - 1) / 4);
      const hasHealerFeat = getActiveFeats().includes('Curandeiro');
      let healAmount = 5;
      let rollDetails = '5';
      if (hasHealerFeat) {
        const roll = Math.floor(Math.random() * 4) + 1;
        healAmount = roll + 4 + pb;
        rollDetails = `1d4 (${roll}) + 4 + PB (${pb})`;
      }
      if (hasFortitude) {
        healAmount += extraHeal;
        rollDetails += ` + ${extraHeal} [Dádiva da Fortitude]`;
      }
      const newHp = Math.min(hero.maxHp, hero.currentHp + healAmount);
      const recovered = newHp - hero.currentHp;
      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, currentHp: newHp, hasBonusAction: false } : e));
      addCombatLog(hero.name, `🩹 ${item.name.toUpperCase()}!`, `Usou o kit de curandeiro restaurando ${recovered} PV (${rollDetails}).`, 'heal');
    } else if (item.effectType === 'tent' || item.effectType === 'sleeping_bag') {
      setPendingShortRestItem(item);
      setHitDiceToSpend(1);
      setShowShortRestModal(true);
      setShowItemModal(false);
      return;
    } else {
      let healAmount = Math.floor(Math.random() * 6) + 1 + 2;
      if (hasFortitude) {
        healAmount += extraHeal;
      }
      const newHp = Math.min(hero.maxHp, hero.currentHp + healAmount);
      const recovered = newHp - hero.currentHp;
      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, currentHp: newHp, hasBonusAction: false } : e));
      addCombatLog(hero.name, `🎒 ${item.name.toUpperCase()}!`, item.customDetail || `Usou o item da ficha recuperando ${recovered} PV.`, 'system');
    }

    setShowItemModal(false);
  };

  return {
    removeConsumableFromCharacter,
    handleUseItem,
  };
}
