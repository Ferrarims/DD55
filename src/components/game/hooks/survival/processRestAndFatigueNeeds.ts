import { updateCharacter } from '../../../../lib/api/characterService';
import { parseWeightToKg, getItemWeight } from '../../../../lib/mechanics/xpAndLootManager';

interface ProcessRestAndFatigueProps {
  character: any;
  totalGameTurns: number;
  lastLongRestTurn: { current: number };
  lastShortRestTurn: { current: number };
  addCombatLog: (actorName: string, title: string, detail: string, type: 'roll' | 'damage' | 'heal' | 'system') => void;
}

export function processRestAndFatigueNeeds({
  character,
  totalGameTurns,
  lastLongRestTurn,
  lastShortRestTurn,
  addCombatLog,
}: ProcessRestAndFatigueProps) {
  // 1. Privação de Descanso (24 horas / 400 turnos)
  const turnsSinceLongRest = totalGameTurns - lastLongRestTurn.current;
  if (turnsSinceLongRest >= 400 && character) {
    const sleepConsumes = Math.floor(turnsSinceLongRest / 400);
    let currentExhaustion = character.exhaustion_level || 0;
    let logsToAdd = [];
    let didModifySleep = false;

    for (let i = 0; i < sleepConsumes; i++) {
      const roll = Math.floor(Math.random() * 20) + 1;
      const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
      const total = roll + conMod;
      
      if (total < 10) {
        currentExhaustion = Math.min(6, currentExhaustion + 1);
        didModifySleep = true;
        logsToAdd.push(`🥱 Privação de Sono: Falhou no teste de CON (Rolou ${total} vs CD 10). +1 Nível de Exaustão!`);
      } else {
        logsToAdd.push(`💪 Privação de Sono: Passou no teste de CON (Rolou ${total} vs CD 10). Resiste à exaustão!`);
      }
    }

    if (logsToAdd.length > 0) {
      logsToAdd.forEach(log => {
         addCombatLog('Sistema', 'Necessidades Vitais (Sono)', log, 'system');
      });
    }
    
    if (didModifySleep) {
      updateCharacter(character.id, { exhaustion_level: currentExhaustion }).catch(e => console.warn(e));
      character.exhaustion_level = currentExhaustion;
    }
    lastLongRestTurn.current += (sleepConsumes * 400);
  }

  // 2. Marcha Forçada (8 horas / 133 turnos)
  const turnsSinceShortRest = totalGameTurns - lastShortRestTurn.current;
  if (turnsSinceShortRest >= 133 && character) {
    const marchConsumes = Math.floor(turnsSinceShortRest / 133);
    let currentExhaustion = character.exhaustion_level || 0;
    let logsToAdd = [];
    let didModifyMarch = false;

    let sumWeight = 0;
    if (character.character_inventory) {
      character.character_inventory.forEach((inv: any) => {
        const itemName = inv.item?.name || inv.items?.name || inv.name;
        if (itemName) {
          sumWeight += parseWeightToKg(getItemWeight(itemName)) * (inv.quantity || 1);
        }
      });
    }
    const isGoliathOrPowerfulBuild = ['Golias', 'Goliath'].includes(character.race || character.race_name) || character.traits?.some((t: any) => t.name?.includes('Porte Poderoso') || t.name?.includes('Físico Poderoso') || t.name?.includes('Powerful Build'));
    const maxWeightCapacity = (character.strength || 10) * (isGoliathOrPowerfulBuild ? 30 : 15);
    const isOverburdened = sumWeight > maxWeightCapacity;

    for (let i = 0; i < marchConsumes; i++) {
      const isBarbarian = (character?.class || character?.classe || '').toLowerCase().includes('bárbaro');
      const roll1 = Math.floor(Math.random() * 20) + 1;
      const roll2 = Math.floor(Math.random() * 20) + 1;
      
      let finalRoll = roll1;
      if (isBarbarian && !isOverburdened) {
        finalRoll = Math.max(roll1, roll2);
      } else if (isOverburdened && !isBarbarian) {
        finalRoll = Math.min(roll1, roll2);
      }
      const roll = finalRoll;
      
      const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
      const total = roll + conMod;
      
      if (total < 10) {
        currentExhaustion = Math.min(6, currentExhaustion + 1);
        didModifyMarch = true;
        logsToAdd.push(`🏃‍♂️ Fadiga: Falhou no teste de CON (Rolou ${total} vs CD 10). +1 Nível de Exaustão!`);
      } else {
        logsToAdd.push(`💪 Fadiga: Passou no teste de CON (Rolou ${total} vs CD 10). Suporta o cansaço!`);
      }
    }

    if (logsToAdd.length > 0) {
      logsToAdd.forEach(log => {
         addCombatLog('Sistema', 'Necessidades Vitais (Fadiga)', log, 'system');
      });
    }

    if (didModifyMarch) {
      updateCharacter(character.id, { exhaustion_level: currentExhaustion }).catch(e => console.warn(e));
      character.exhaustion_level = currentExhaustion;
    }
    lastShortRestTurn.current += (marchConsumes * 133);
  }
}
