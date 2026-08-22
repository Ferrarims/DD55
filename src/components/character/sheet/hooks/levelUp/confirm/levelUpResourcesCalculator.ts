import { calculateResources, calculateRaceResources } from '../../../../../../lib/mechanics/resourcesParser';

interface CalculateResourcesParams {
  character: any;
  nextLevel: number;
  newStr: number;
  newDex: number;
  newCon: number;
  newInt: number;
  newWis: number;
  newCha: number;
  finalSubclass: string;
}

export function calculateLevelUpResources({
  character,
  nextLevel,
  newStr,
  newDex,
  newCon,
  newInt,
  newWis,
  newCha,
  finalSubclass,
}: CalculateResourcesParams) {
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
    const giantAncestry = (character.giant_ancestry || character.giantAncestry || '').toLowerCase();
    newResources = newResources.filter(res => {
      const name = res.name.toLowerCase();
      if (
        name.includes('resistência da pedra') ||
        name.includes('resistência de pedra') ||
        name.includes("stone's endurance")
      ) {
        return giantAncestry.includes('pedra') || giantAncestry.includes('stone') || !giantAncestry;
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

  return newResources;
}
