import { useEffect, MutableRefObject } from 'react';
import { parseWeightToKg, getItemWeight } from '../../../lib/mechanics/xpAndLootManager';

interface UseSurvivalNeedsProps {
  totalGameTurns: number;
  prevTurns: MutableRefObject<number>;
  biome: string;
  character: any;
  onCharacterUpdated?: () => Promise<void> | void;
  lastMealTurn: MutableRefObject<number>;
  lastShortRestTurn: MutableRefObject<number>;
  lastLongRestTurn: MutableRefObject<number>;
  weather: string;
  addCombatLog: (actorName: string, title: string, detail: string, type: 'roll' | 'damage' | 'heal' | 'system') => void;
}

export function useSurvivalNeeds({
  totalGameTurns,
  prevTurns,
  biome,
  character,
  onCharacterUpdated,
  lastMealTurn,
  lastShortRestTurn,
  lastLongRestTurn,
  weather,
  addCombatLog,
}: UseSurvivalNeedsProps) {
  useEffect(() => {
    if (totalGameTurns === prevTurns.current) return;
    
    // Check how many blocks have passed (Deserto consumes twice as fast)
    const turnDelta = totalGameTurns - prevTurns.current;
    const isMajorTimeJump = turnDelta > 10;

    const waterInterval = biome === 'Deserto' ? 40 : 80;
    const oldMilestone = Math.floor(prevTurns.current / waterInterval);
    const newMilestone = Math.floor(totalGameTurns / waterInterval);
    const rawWaterConsumes = newMilestone - oldMilestone;
    const consumesToProcess = isMajorTimeJump ? Math.min(1, rawWaterConsumes) : rawWaterConsumes;

    // Always initialize water resource if Cantil exists so the UI shows it correctly immediately
    if (character) {
      const cantilItem = (character.character_inventory || []).find(
        (i: any) => {
          const n = (i.items?.name || i.name || '').toLowerCase();
          return n.includes('cantil');
        }
      );
      const cantilCount = cantilItem ? (cantilItem.quantity || 1) : 0;
      const maxWaterCapacity = cantilCount * 10;
      
      const currentResources = character.class_resources ? [...character.class_resources] : [];
      let waterResource = currentResources.find((r: any) => r.name === "Cantil de Água");
      
      let structureModified = false;
      if (!waterResource && maxWaterCapacity > 0) {
         waterResource = { name: "Cantil de Água", used: 0, max: maxWaterCapacity, reset: "none", action: "Livre", description: "Consumo automático a cada 80 turnos (40 no deserto)." };
         currentResources.push(waterResource);
         structureModified = true;
      } else if (waterResource && waterResource.max !== maxWaterCapacity) {
         waterResource.max = maxWaterCapacity;
         if (waterResource.used > waterResource.max) waterResource.used = waterResource.max;
         structureModified = true;
      }
      
      if (structureModified) character.class_resources = currentResources;
      if (structureModified && character.id) {
         import('../../../lib/api/characterService').then(({ updateCharacter }) => {
            updateCharacter(character.id, { class_resources: currentResources }).catch(e => console.warn(e));
         });
      }
    }

    if (consumesToProcess > 0 && character) {
      const currentResources = character.class_resources ? [...character.class_resources] : [];
      let waterResource = currentResources.find((r: any) => r.name === "Cantil de Água");
      let structureModified = false;

      let currentExhaustion = character.exhaustion_level || 0;
      let logsToAdd: string[] = [];
      let didModify = false;

      for (let i = 0; i < consumesToProcess; i++) {
        if (waterResource && waterResource.used < waterResource.max) {
          waterResource.used += 1;
          didModify = true;
        } else {
          currentExhaustion = Math.min(6, currentExhaustion + 1);
          didModify = true;
          logsToAdd.push(`⚠️ Sede Extrema! +1 Nível de Exaustão. (Cantil Vazio ou Ausente)`);
        }
      }

      if (didModify || structureModified) {
        if (logsToAdd.length > 0) {
          logsToAdd.forEach(log => {
             addCombatLog('Sistema', 'Necessidades Vitais (Sede)', log, 'system');
          });
        }
        import('../../../lib/api/characterService').then(({ updateCharacter }) => {
          updateCharacter(character.id, {
             class_resources: currentResources,
             exhaustion_level: currentExhaustion
          }).then(() => {
             if (onCharacterUpdated) onCharacterUpdated();
          });
        });
      }
    }

    // --- Sistema de Comida (Ração) ---
    const turnsSinceLastMeal = totalGameTurns - lastMealTurn.current;
    if (turnsSinceLastMeal >= 400 && character) {
      const foodConsumes = Math.floor(turnsSinceLastMeal / 400);
      let currentExhaustion = character.exhaustion_level || 0;
      let logsToAdd: string[] = [];
      let didModifyFood = false;

      const currentInventory = character.character_inventory ? [...character.character_inventory] : [];
      let promises: Promise<any>[] = [];

      for (let i = 0; i < foodConsumes; i++) {
        const rationIdx = currentInventory.findIndex((inv: any) => {
          const name = (inv.item?.name || inv.items?.name || inv.name || '').toLowerCase();
          return name.includes('ração') || name.includes('racao') || name.includes('ration') || name.includes('marmita') || name.includes('comida');
        });

        if (rationIdx !== -1) {
          const item = currentInventory[rationIdx];
          const newQty = (item.quantity || 1) - 1;
          if (newQty <= 0) {
            currentInventory.splice(rationIdx, 1);
            if (character.id) promises.push(import('../../../lib/api/characterService').then(m => m.removeItemFromInventory(item.id)));
          } else {
            item.quantity = newQty;
            if (character.id) promises.push(import('../../../lib/api/characterService').then(m => m.updateItemQuantity(item.id, newQty)));
          }
          logsToAdd.push(`🍗 Você consumiu 1 Ração automaticamente ao longo do dia para se manter saciado.`);
          didModifyFood = true;
        } else {
          currentExhaustion = Math.min(6, currentExhaustion + 1);
          logsToAdd.push(`⚠️ Fome Extrema! +1 Nível de Exaustão. (Ração Ausente)`);
          didModifyFood = true;
        }
      }

      if (didModifyFood) {
        if (logsToAdd.length > 0) {
          logsToAdd.forEach(log => addCombatLog('Sistema', 'Necessidades Vitais (Fome)', log, 'system'));
        }
        promises.push(import('../../../lib/api/characterService').then(({ updateCharacter }) => {
          return updateCharacter(character.id, { exhaustion_level: currentExhaustion });
        }));
        Promise.all(promises).then(() => {
           if (onCharacterUpdated) onCharacterUpdated();
        });
      }
      
      lastMealTurn.current += (foodConsumes * 400); 
    }

    // --- Privação de Descanso (24 horas / 400 turnos) ---
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
        import('../../../lib/api/characterService').then(({ updateCharacter }) => {
          updateCharacter(character.id, { exhaustion_level: currentExhaustion }).catch(e => console.warn(e));
        });
        character.exhaustion_level = currentExhaustion;
      }
      lastLongRestTurn.current += (sleepConsumes * 400);
    }

    // --- Marcha Forçada (8 horas / 133 turnos) ---
    const turnsSinceShortRest = totalGameTurns - lastShortRestTurn.current;
    if (turnsSinceShortRest >= 133 && character) {
      const marchConsumes = Math.floor(turnsSinceShortRest / 133);
      let currentExhaustion = character.exhaustion_level || 0;
      let logsToAdd = [];
      let didModifyMarch = false;

      // Calculando Sobrecarga
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
        
        // Sobrecarga impõe Desvantagem em testes de CON. Bárbaro dá Vantagem. Se tiver os dois, rola normal.
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
        import('../../../lib/api/characterService').then(({ updateCharacter }) => {
          updateCharacter(character.id, { exhaustion_level: currentExhaustion }).catch(e => console.warn(e));
        });
        character.exhaustion_level = currentExhaustion;
      }
      lastShortRestTurn.current += (marchConsumes * 133);
    }

    // --- Clima Extremo (1 hora / 17 turnos) ---
    const weatherInterval = 17;
    const oldWeatherMilestone = Math.floor(prevTurns.current / weatherInterval);
    const newWeatherMilestone = Math.floor(totalGameTurns / weatherInterval);
    const rawWeatherConsumes = newWeatherMilestone - oldWeatherMilestone;
    const weatherConsumesToProcess = isMajorTimeJump ? Math.min(1, rawWeatherConsumes) : rawWeatherConsumes;

    if (weatherConsumesToProcess > 0 && character) {
      const isCold = weather === 'snow' || weather === 'storm';
      const isHeat = biome === 'Deserto';

      if (isCold || isHeat) {
        let currentExhaustion = character.exhaustion_level || 0;
        let logsToAdd = [];
        let didModifyWeather = false;

        const equippedClothes = character.equipment_slots?.roupa_clima?.toLowerCase() || '';
        const hasWinterClothes = equippedClothes.includes('frio') || equippedClothes.includes('inverno');
        const hasTravelClothes = equippedClothes.includes('viagem') || equippedClothes.includes('fina');

        for (let i = 0; i < weatherConsumesToProcess; i++) {
          if (isCold) {
            if (!hasWinterClothes) {
              const race = (character?.race || character?.raca || '').toLowerCase();
              const hasColdRes = race.includes('anão') || race.includes('anao') || race.includes('goliath');
              const roll1 = Math.floor(Math.random() * 20) + 1;
              const roll2 = Math.floor(Math.random() * 20) + 1;
              const roll = hasColdRes ? Math.max(roll1, roll2) : roll1;
              const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
              const total = roll + conMod;
              if (total < 10) {
                currentExhaustion = Math.min(6, currentExhaustion + 1);
                didModifyWeather = true;
                logsToAdd.push(`❄️ Clima Frio Extremo: Falhou no teste de CON (Rolou ${total} vs CD 10). Sem Roupas de Frio. +1 Exaustão!`);
              } else {
                logsToAdd.push(`🥶 Clima Frio Extremo: Passou no teste de CON (Rolou ${total} vs CD 10). Sem Roupas de Frio, mas resiste.`);
              }
            }
          } else if (isHeat) {
            if (hasWinterClothes) {
              // Roupas muito quentes no calor escaldante geram teste de CON com desvantagem em vez de dano letal automático
              const roll1 = Math.floor(Math.random() * 20) + 1;
              const roll2 = Math.floor(Math.random() * 20) + 1;
              const roll = Math.min(roll1, roll2);
              const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
              const total = roll + conMod;
              if (total < 10) {
                currentExhaustion = Math.min(6, currentExhaustion + 1);
                didModifyWeather = true;
                logsToAdd.push(`🔥 Calor Extremo: Usando roupas pesadas de frio no deserto! Falhou no teste de CON com desvantagem (Rolou ${total} vs CD 10). +1 Nível de Exaustão!`);
              } else {
                logsToAdd.push(`☀️ Calor Extremo: Suando sob roupas pesadas no deserto, mas resiste ao teste de CON (Rolou ${total} vs CD 10). Troque para Roupas de Viagem na Mochila!`);
              }
            } else if (!hasTravelClothes) {
              const race = (character?.race || character?.raca || '').toLowerCase();
              const hasHeatRes = race.includes('tiefling') || race.includes('draconato') || race.includes('dragonborn');
              const roll1 = Math.floor(Math.random() * 20) + 1;
              const roll2 = Math.floor(Math.random() * 20) + 1;
              const roll = hasHeatRes ? Math.max(roll1, roll2) : roll1;
              const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
              const total = roll + conMod;
              if (total < 10) {
                currentExhaustion = Math.min(6, currentExhaustion + 1);
                didModifyWeather = true;
                logsToAdd.push(`🥵 Calor Extremo: Falhou no teste de CON (Rolou ${total} vs CD 10). Sem Roupas de Viagem. +1 Exaustão!`);
              } else {
                logsToAdd.push(`☀️ Calor Extremo: Passou no teste de CON (Rolou ${total} vs CD 10). Sem Roupas de Viagem, mas resiste.`);
              }
            }
          }
        }

        if (logsToAdd.length > 0) {
          logsToAdd.forEach(log => {
             addCombatLog('Sistema', 'Necessidades Vitais (Clima Extremo)', log, 'system');
          });
        }

        if (didModifyWeather) {
          import('../../../lib/api/characterService').then(({ updateCharacter }) => {
            updateCharacter(character.id, { exhaustion_level: currentExhaustion }).catch(e => console.warn(e));
          });
          character.exhaustion_level = currentExhaustion;
        }
      }
    }

    prevTurns.current = totalGameTurns;
  }, [totalGameTurns, character, onCharacterUpdated]);
}
