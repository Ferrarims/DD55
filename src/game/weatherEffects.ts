import { WeatherType, BiomeType } from './types';
import { WeatherInfo, WEATHER_CONFIGS } from './weather/weatherConfigs';
import { getWeatherRollModifiers } from './weather/weatherRules';
import { drawRainOverlay, drawSnowOverlay } from './weather/weatherPrecipitationRenderer';
import { drawWindOverlay, drawStormOverlay, drawFogOverlay } from './weather/weatherAtmosphereRenderer';

export type { WeatherInfo };
export { WEATHER_CONFIGS, getWeatherRollModifiers };

// Renderização dos efeitos de partículas e atmosfera de Clima no Canvas
export function drawWeatherOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  weather: WeatherType,
  isNight: boolean | number,
  biome: BiomeType,
  is3dMode: boolean,
  timeMs: number
) {
  // Ambientes fechados e subterrâneos (Cavernas e Masmorras) não têm clima externo
  if (weather === 'clear' || biome === 'Caverna' || biome === 'Masmorra') return;

  // No Deserto, apenas vento ocorre
  if (biome === 'Deserto' && weather !== 'wind') return;

  const isNightBool = typeof isNight === 'number' ? isNight > 0.5 : isNight;

  ctx.save();

  if (weather === 'rain') {
    drawRainOverlay(ctx, width, height, isNightBool, is3dMode, timeMs);
  } else if (weather === 'snow') {
    drawSnowOverlay(ctx, width, height, isNightBool, is3dMode, timeMs);
  } else if (weather === 'wind') {
    drawWindOverlay(ctx, width, height, isNightBool, biome, timeMs);
  } else if (weather === 'storm') {
    drawStormOverlay(ctx, width, height, isNightBool, is3dMode, timeMs);
  } else if (weather === 'fog') {
    drawFogOverlay(ctx, width, height, isNightBool, timeMs);
  }

  ctx.restore();
}
