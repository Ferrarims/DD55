import { drawWeatherOverlay } from '../../../game/weatherEffects';
import { WeatherType, BiomeType } from '../../../game/types';
import { drawMeleeEffect, drawRangedEffect } from './attackFx/drawWeaponFx';
import { drawBreathConeEffect, drawBreathLineEffect } from './attackFx/drawBreathFx';

export interface ActiveEffectData {
  type: 'melee' | 'ranged' | 'breath_cone' | 'breath_line' | string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  progress: number;
  hit?: boolean;
  damageType?: string;
}

export {
  drawMeleeEffect,
  drawRangedEffect,
  drawBreathConeEffect,
  drawBreathLineEffect,
};

/**
 * Renderiza a lista de todos os efeitos ativos de combate (activeEffects).
 */
export function renderActiveEffects(
  ctx: CanvasRenderingContext2D,
  activeEffects: ActiveEffectData[],
  cameraX: number,
  cameraY: number,
  cellSize: number
): void {
  if (!activeEffects || activeEffects.length === 0) return;

  activeEffects.forEach(eff => {
    const ax = (eff.startX - cameraX) * cellSize + cellSize / 2;
    const ay = (eff.startY - cameraY) * cellSize + cellSize / 2;
    const dx = (eff.endX - cameraX) * cellSize + cellSize / 2;
    const dy = (eff.endY - cameraY) * cellSize + cellSize / 2;

    if (eff.type === 'melee') {
      drawMeleeEffect(ctx, ax, ay, dx, dy, eff.progress, eff.hit, cellSize);
    } else if (eff.type === 'ranged') {
      drawRangedEffect(ctx, ax, ay, dx, dy, eff.progress, eff.hit, cellSize);
    } else if (eff.type === 'breath_cone') {
      drawBreathConeEffect(ctx, ax, ay, dx, dy, eff.progress, eff.damageType, cellSize);
    } else if (eff.type === 'breath_line') {
      drawBreathLineEffect(ctx, ax, ay, dx, dy, eff.progress, eff.damageType, cellSize);
    }
  });
}

/**
 * Renderiza os efeitos de clima no canvas.
 */
export function renderWeatherFX(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  weather: WeatherType,
  weatherTime: number,
  isIndoorEnv: boolean,
  isNightOrDarkEnv: boolean,
  biome?: BiomeType
): void {
  drawWeatherOverlay(ctx, width, height, weather, isNightOrDarkEnv, biome || 'Floresta', false, weatherTime);
}
