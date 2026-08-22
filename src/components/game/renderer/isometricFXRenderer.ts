import { drawWeatherOverlay } from '../../../game/weatherEffects';
import { UseCanvasRendererProps } from './rendererTypes';
import { renderIsoFloatingTexts } from './isometric/isoFloatingTextsRenderer';
import { renderIsoAttackFX } from './isometric/isoAttackFXRenderer';
import { renderIsoLightingFX } from './isometric/isoLightingFXRenderer';

interface DrawIsometricFXProps {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  props: UseCanvasRendererProps;
  centerC: number;
  centerR: number;
  isoTileW: number;
  isoTileH: number;
  isIndoorEnv: boolean;
  isNightOrDarkEnv: boolean;
}

export function drawIsometricFX({
  ctx,
  canvas,
  props,
  centerC,
  centerR,
  isoTileW,
  isoTileH,
  isIndoorEnv,
  isNightOrDarkEnv,
}: DrawIsometricFXProps): void {
  const {
    entities,
    biome,
    isNight,
    weather,
    weatherTime,
    torches,
    activeEffects,
    floatingTexts,
    droppedLoot,
    restPoints,
    getDamageTypeColor,
    heroHasBlindFighting,
    nightProgress,
    getHeroLightRadiusInCells,
  } = props;

  // 1. Floating Texts em 3D
  renderIsoFloatingTexts({
    ctx,
    canvas,
    floatingTexts,
    centerC,
    centerR,
    isoTileW,
    isoTileH,
  });

  // 2. Efeitos Visuais de Ataque em 3D
  renderIsoAttackFX({
    ctx,
    canvas,
    activeEffects,
    entities,
    centerC,
    centerR,
    isoTileW,
    isoTileH,
    getDamageTypeColor,
  });

  // 3. Máscara de Escuridão e Iluminação Dinâmica 3D
  renderIsoLightingFX({
    ctx,
    canvas,
    entities,
    torches,
    droppedLoot,
    restPoints,
    isIndoorEnv,
    isNightOrDarkEnv,
    nightProgress,
    heroHasBlindFighting,
    getHeroLightRadiusInCells,
    centerC,
    centerR,
    isoTileW,
    isoTileH,
  });

  // 4. Renderização Atmosférica de Clima no Modo 3D Pixel Art
  drawWeatherOverlay(
    ctx,
    canvas.width,
    canvas.height,
    weather,
    isNight,
    biome,
    true,
    weatherTime || performance.now()
  );
}
