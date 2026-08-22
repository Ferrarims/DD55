import { updateCharacter, removeItemFromInventory, updateItemQuantity } from '../../../../lib/api/characterService';

interface ProcessWaterProps {
  character: any;
  biome: string;
  totalGameTurns: number;
  prevTurns: { current: number };
  onCharacterUpdated?: () => Promise<void> | void;
  addCombatLog: (actorName: string, title: string, detail: string, type: 'roll' | 'damage' | 'heal' | 'system') => void;
}

export function processWaterNeeds({
  character,
  biome,
  totalGameTurns,
  prevTurns,
  onCharacterUpdated,
  addCombatLog,
}: ProcessWaterProps) {
  const turnDelta = totalGameTurns - prevTurns.current;
  const isMajorTimeJump = turnDelta > 10;

  const waterInterval = biome === 'Deserto' ? 40 : 80;
  const oldMilestone = Math.floor(prevTurns.current / waterInterval);
  const newMilestone = Math.floor(totalGameTurns / waterInterval);
  const rawWaterConsumes = newMilestone - oldMilestone;
  const consumesToProcess = isMajorTimeJump ? Math.min(1, rawWaterConsumes) : rawWaterConsumes;

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
       updateCharacter(character.id, { class_resources: currentResources }).catch(e => console.warn(e));
    }
  }

  if (consumesToProcess > 0 && character) {
    const currentResources = character.class_resources ? [...character.class_resources] : [];
    let waterResource = currentResources.find((r: any) => r.name === "Cantil de Água");
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

    if (didModify) {
      if (logsToAdd.length > 0) {
        logsToAdd.forEach(log => {
           addCombatLog('Sistema', 'Necessidades Vitais (Sede)', log, 'system');
        });
      }
      updateCharacter(character.id, {
         class_resources: currentResources,
         exhaustion_level: currentExhaustion
      }).then(() => {
         if (onCharacterUpdated) onCharacterUpdated();
      });
    }
  }
}

interface ProcessFoodProps {
  character: any;
  totalGameTurns: number;
  lastMealTurn: { current: number };
  onCharacterUpdated?: () => Promise<void> | void;
  addCombatLog: (actorName: string, title: string, detail: string, type: 'roll' | 'damage' | 'heal' | 'system') => void;
}

export function processFoodNeeds({
  character,
  totalGameTurns,
  lastMealTurn,
  onCharacterUpdated,
  addCombatLog,
}: ProcessFoodProps) {
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
          if (character.id) promises.push(removeItemFromInventory(item.id));
        } else {
          item.quantity = newQty;
          if (character.id) promises.push(updateItemQuantity(item.id, newQty));
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
      promises.push(updateCharacter(character.id, { exhaustion_level: currentExhaustion }));
      Promise.all(promises).then(() => {
         if (onCharacterUpdated) onCharacterUpdated();
      });
    }
    
    lastMealTurn.current += (foodConsumes * 400); 
  }
}
