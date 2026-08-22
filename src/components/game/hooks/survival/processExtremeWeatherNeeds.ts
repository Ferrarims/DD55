import { updateCharacter } from '../../../../lib/api/characterService';

interface ProcessExtremeWeatherProps {
  character: any;
  biome: string;
  weather: string;
  totalGameTurns: number;
  prevTurns: { current: number };
  addCombatLog: (actorName: string, title: string, detail: string, type: 'roll' | 'damage' | 'heal' | 'system') => void;
}

export function processExtremeWeatherNeeds({
  character,
  biome,
  weather,
  totalGameTurns,
  prevTurns,
  addCombatLog,
}: ProcessExtremeWeatherProps) {
  const weatherInterval = 17;
  const oldWeatherMilestone = Math.floor(prevTurns.current / weatherInterval);
  const newWeatherMilestone = Math.floor(totalGameTurns / weatherInterval);
  const rawWeatherConsumes = newWeatherMilestone - oldWeatherMilestone;
  const turnDelta = totalGameTurns - prevTurns.current;
  const isMajorTimeJump = turnDelta > 10;
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
        updateCharacter(character.id, { exhaustion_level: currentExhaustion }).catch(e => console.warn(e));
        character.exhaustion_level = currentExhaustion;
      }
    }
  }
}
