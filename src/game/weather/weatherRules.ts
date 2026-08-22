import { WeatherType, BiomeType } from '../types';

export function getWeatherRollModifiers(
  weather: WeatherType,
  isRanged: boolean,
  distanceInCells: number,
  biome?: BiomeType,
  isPureProjectileWeapon: boolean = false
): { hasDisadvantage: boolean; reason?: string } {
  // Cavernas e Masmorras são subterrâneas/fechadas e não sofrem efeitos climáticos externos
  if (biome === 'Caverna' || biome === 'Masmorra') {
    return { hasDisadvantage: false };
  }

  // No Deserto, chuva, neve, tempestade e neblina não existem (apenas vento / tempestade de areia)
  if (biome === 'Deserto' && weather !== 'wind') {
    return { hasDisadvantage: false };
  }

  if (weather === 'wind' && isRanged && (isPureProjectileWeapon || distanceInCells > 4)) {
    return {
      hasDisadvantage: true,
      reason: 'Vento Forte (Desvantagem em projéteis a distância)'
    };
  }

  if (weather === 'storm' && isRanged && distanceInCells > 3) {
    return {
      hasDisadvantage: true,
      reason: 'Tempestade Severa (Chuva pesada e vento com desvantagem a distância)'
    };
  }

  if (weather === 'fog' && isRanged && distanceInCells > 6) {
    return {
      hasDisadvantage: true,
      reason: 'Neblina Densa (Obscurecimento pesado além de 9m)'
    };
  }

  return { hasDisadvantage: false };
}
