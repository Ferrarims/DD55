import React from 'react';
import { CombatEntity } from '../../../../game/types';
import { updateCharacter } from '../../../../lib/api/characterService';

export interface UseShortRestInteractionProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  character: any;
  onCharacterUpdated?: () => Promise<void> | void;
  secondWindUses: number;
  setSecondWindUses: React.Dispatch<React.SetStateAction<number>>;
  secondWindMaxUses: number;
  actionSurgeMaxUses: number;
  setActionSurgeUses: React.Dispatch<React.SetStateAction<number>>;
  channelDivinityMaxUses: number;
  setChannelDivinityUses: React.Dispatch<React.SetStateAction<number>>;
  spellSlotsMax: number;
  setSpellSlots: React.Dispatch<React.SetStateAction<number>>;
  focusPointsMaxUses: number;
  setFocusPointsUses: React.Dispatch<React.SetStateAction<number>>;
  setActiveDraconicFlight: (val: boolean) => void;
  activeRevelation: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null;
  setActiveRevelation: (val: any) => void;
  pendingShortRestItem: any;
  setPendingShortRestItem: (item: any) => void;
  setShowShortRestModal: (val: boolean) => void;
  totalGameTurns: number;
  setTotalGameTurns: React.Dispatch<React.SetStateAction<number>>;
  lastMealTurn: React.MutableRefObject<number>;
  lastShortRestTurn: React.MutableRefObject<number>;
  prevTurns: React.MutableRefObject<number>;
  setMovementStepsCount: React.Dispatch<React.SetStateAction<number>>;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
  setItemQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  removeConsumableFromCharacter: (itemName: string) => void;
  getActiveFeats: () => string[];
}

export function useShortRestInteraction({
  entities,
  setEntities,
  character,
  onCharacterUpdated,
  secondWindUses,
  setSecondWindUses,
  secondWindMaxUses,
  actionSurgeMaxUses,
  setActionSurgeUses,
  channelDivinityMaxUses,
  setChannelDivinityUses,
  spellSlotsMax,
  setSpellSlots,
  focusPointsMaxUses,
  setFocusPointsUses,
  setActiveDraconicFlight,
  activeRevelation,
  setActiveRevelation,
  pendingShortRestItem,
  setPendingShortRestItem,
  setShowShortRestModal,
  totalGameTurns,
  setTotalGameTurns,
  lastMealTurn,
  lastShortRestTurn,
  prevTurns,
  setMovementStepsCount,
  addCombatLog,
  setFloatingTexts,
  setItemQuantities,
  removeConsumableFromCharacter,
  getActiveFeats,
}: UseShortRestInteractionProps) {

  const confirmGameShortRest = (diceToSpend: number) => {
    setShowShortRestModal(false);
    const item = pendingShortRestItem;
    if (!item) return;

    const hero = entities.find(e => e.type === 'hero');
    if (!hero) return;

    const className = (character.class_name || character.charClass || '').toLowerCase();
    setActiveDraconicFlight(false);
    if (activeRevelation === 'Alma Radiante') {
      setActiveRevelation(null);
    }
    setEntities(prev => prev.map(e => e.type === 'hero' ? {
      ...e,
      conditions: e.conditions.filter(c => c !== 'Voando')
    } : e));

    const allInv = [...(character.inventory || []), ...(character.character_inventory || [])];
    const rationItem = allInv.find((inv: any) => {
      const name = (inv.item?.name || inv.items?.name || '').toLowerCase();
      return name.includes('ração') || name.includes('racao') || name.includes('ration');
    })?.item?.name || allInv.find((inv: any) => {
      const name = (inv.item?.name || inv.items?.name || '').toLowerCase();
      return name.includes('ração') || name.includes('racao') || name.includes('ration');
    })?.items?.name;

    if (rationItem) {
      removeConsumableFromCharacter(rationItem);
      lastMealTurn.current = totalGameTurns + 17;
      const match = rationItem.match(/\b(\d+)\s*x?\b/i);
      let rationBaseName = rationItem.replace(/\b\d+\s*x?\b/i, '').trim();
      if (rationBaseName.startsWith('x ')) rationBaseName = rationBaseName.substring(2);
      rationBaseName = rationBaseName.charAt(0).toUpperCase() + rationBaseName.slice(1);
      const canonicalRationId = rationBaseName.toLowerCase();
      setItemQuantities(prev => ({
        ...prev,
        [canonicalRationId]: Math.max(0, (prev[canonicalRationId] ?? 1) - 1)
      }));
    }

    const ambushChance = item.effectType === 'tent' ? 0.20 : 0.50;
    const isAmbushed = Math.random() < ambushChance;

    if (!isAmbushed) {
      const newSwUses = Math.min(secondWindMaxUses, secondWindUses + 1);
      setSecondWindUses(newSwUses);
      setActionSurgeUses(actionSurgeMaxUses);
      setChannelDivinityUses(prev => Math.min(channelDivinityMaxUses, prev + 1));
      if (className.includes('bruxo') || className.includes('warlock')) {
        setSpellSlots(spellSlotsMax);
      }
      setFocusPointsUses(prev => Math.min(focusPointsMaxUses, prev + 1));

      if (character && Array.isArray(character.class_resources)) {
        const updatedResources = character.class_resources.map((r: any) => {
          if (!r) return r;
          const name = (r.name || '').toLowerCase();
          if (name.includes('fôlego') || name.includes('folego') || name.includes('second wind')) {
            return { ...r, used: Math.max(0, (r.max || secondWindMaxUses) - newSwUses) };
          }
          if (r.reset === 'short' || r.reset === 'short/long') {
            return { ...r, used: 0 };
          }
          return r;
        });
        character.class_resources = updatedResources;
        if (character.id) {
          updateCharacter(character.id, { class_resources: updatedResources }).catch(err => console.warn(err));
        }
      }

      let hitDieSides = 8;
      if (className.includes('bárbaro') || className.includes('barbarian')) hitDieSides = 12;
      else if (className.includes('guerreiro') || className.includes('fighter') || className.includes('paladino') || className.includes('paladin') || className.includes('patrulheiro') || className.includes('ranger')) hitDieSides = 10;
      else if (className.includes('mago') || className.includes('wizard') || className.includes('feiticeiro') || className.includes('sorcerer')) hitDieSides = 6;

      const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
      let rollHp = 0;
      for (let i = 0; i < diceToSpend; i++) {
        const dieRoll = Math.floor(Math.random() * hitDieSides) + 1;
        rollHp += Math.max(1, dieRoll + conMod);
      }
      
      const activeFeatsList = getActiveFeats();
      const hasFortitude = activeFeatsList.includes('Dádiva da Fortitude');
      const extraHeal = Math.floor(((character.constitution || 10) - 10) / 2) + Math.max(1, Math.floor(((character.level || 1) - 1) / 4) + 2);
      if (hasFortitude) rollHp += extraHeal;

      const newHp = Math.min(hero.maxHp, hero.currentHp + rollHp);
      const recovered = newHp - hero.currentHp;
      const newHitDice = Math.max(0, (character.hit_dice_current ?? character.level ?? 1) - diceToSpend);

      if (character) {
        character.current_hp = newHp;
        character.hit_dice_current = newHitDice;
        if (character.id) {
          updateCharacter(character.id, {
            current_hp: newHp,
            hit_dice_current: newHitDice
          }).catch(err => console.error("Error updating short rest in DB:", err));
        }
      }

      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, currentHp: newHp, hasAction: false } : e));

      if (onCharacterUpdated) {
        onCharacterUpdated();
      }

      const newTurns = totalGameTurns + 17;
      prevTurns.current = newTurns;
      lastShortRestTurn.current = newTurns;
      setTotalGameTurns(newTurns);
      setMovementStepsCount(0);

      setFloatingTexts(prev => [...prev, {
        id: Math.random().toString(),
        x: hero.x,
        y: hero.y,
        text: `⛺ Descanso Curto (+${recovered} PV)`,
        color: '#10b981',
        progress: 0
      }]);

      addCombatLog(
        hero.name,
        item.effectType === 'tent' ? `⛺ DESCANSO CURTO NA TENDA` : `🛌 DESCANSO CURTO NO ACAMPAMENTO`,
        `Você descansou com segurança. Gastou ${diceToSpend} Dados de Vida, recuperou ${recovered} PV e renovou suas habilidades de combate (-1 Ração consumida, +2h de tempo de jogo decorrido).`,
        'heal'
      );
    }
    setPendingShortRestItem(null);
  };

  return { confirmGameShortRest };
}
