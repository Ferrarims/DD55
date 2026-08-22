import { UseCanvasRendererProps } from './rendererTypes';
import { drawFloatingText, drawTeleportRange } from './drawHelpers';
import { renderActiveEffects, renderWeatherFX } from './renderAttackFX';
import { render2DTerrainFloor } from './topdown/render2DTerrainFloor';
import { render2DObstacles } from './topdown/render2DObstacles';
import { render2DGroundProps } from './topdown/render2DGroundProps';
import { render2DEntities } from './topdown/render2DEntities';
import { render2DLighting } from './topdown/render2DLighting';

/**
 * Motor de Renderização 2D Top-Down Clássico (Orquestrador).
 * Executa o pipeline gráfico 2D em submódulos especializados.
 */
export function render2DTopDown(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  props: UseCanvasRendererProps
): void {
  const {
    grid, entities, biome, isNight, weather, weatherTime, torches, character,
    activeEffects, floatingTexts, droppedLoot, chests, hazards, powerups, restPoints, cols, rows,
    activeRevelation, isTeleportTargetMode, isGoliath,
    activeLargeForm, getEntitySizeInSquares, RACES_REFERENCE,
    activeEntity, getEntityCover, shouldHideEntityDetails,
    heroHasBlindFighting, nightProgress,
    getHeroLightRadiusInCells, isEntityVisible, isEntityVisibleByBlindFightingOnly
  } = props;

  const isIndoorEnv = biome === 'Caverna' || biome === 'Masmorra';
  const isNightOrDarkEnv = isIndoorEnv || (nightProgress > 0 && (biome === 'Floresta' || biome === 'Pântano' || biome === 'Deserto'));

  const cellSize = Math.floor(canvas.width / cols);
  canvas.height = cellSize * rows;

  // 0. Limpeza do fundo
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cálculo da Câmera
  const hero = entities.find(e => e.type === 'hero');
  const heroX = hero ? hero.x : 75;
  const heroY = hero ? hero.y : 75;
  const cameraX = Math.max(0, Math.min(150 - cols, heroX - Math.floor(cols / 2)));
  const cameraY = Math.max(0, Math.min(150 - rows, heroY - Math.floor(rows / 2)));

  // 1. Renderizar Terrenos e Pisos do Grid
  render2DTerrainFloor({
    ctx, grid, cameraX, cameraY, cols, rows, cellSize, biome, weather, isNight, isIndoorEnv
  });

  // 2. Renderizar Obstáculos Multi-Célula, 1x1 e Terreno Difícil
  render2DObstacles({
    ctx, grid, cameraX, cameraY, cols, rows, cellSize, biome, weather, isNight, isIndoorEnv
  });

  // 3. Renderizar Tochas, Armadilhas, Power-ups, Acampamentos, Drops e Baús
  render2DGroundProps({
    ctx, torches, hazards, powerups, restPoints, droppedLoot, chests, cameraX, cameraY, cols, rows, cellSize
  });

  // 4. Renderizar Tokens de Entidades (Herói e Monstros)
  render2DEntities({
    ctx, entities, cameraX, cameraY, cols, rows, cellSize, activeEntity, character,
    activeLargeForm, getEntitySizeInSquares, RACES_REFERENCE,
    isEntityVisible, isEntityVisibleByBlindFightingOnly, getEntityCover, shouldHideEntityDetails
  });

  // 5. Sistema de Iluminação Dinâmica e Dia/Noite
  if (isNightOrDarkEnv) {
    render2DLighting({
      ctx, canvas, entities, torches, droppedLoot, cameraX, cameraY, cols, rows, cellSize,
      isIndoorEnv, activeRevelation, heroHasBlindFighting, getHeroLightRadiusInCells
    });
  }

  // 6. Efeitos Visuais Ativos (Ataques / Magias)
  renderActiveEffects(ctx, activeEffects, cameraX, cameraY, cellSize);

  // 7. Alcance do Passo das Nuvens (Teleporte Golias)
  if (isTeleportTargetMode && isGoliath && hero) {
    const hx = (hero.x - cameraX) * cellSize + cellSize / 2;
    const hy = (hero.y - cameraY) * cellSize + cellSize / 2;
    drawTeleportRange(ctx, hx, hy, cellSize);
  }

  // 8. Textos Flutuantes de Dano / Cura
  floatingTexts.forEach(ft => {
    const tx = (ft.x - cameraX) * cellSize + cellSize / 2;
    const ty = (ft.y - cameraY) * cellSize + cellSize / 2 - (ft.progress * cellSize);
    drawFloatingText(ctx, ft.text, tx, ty, ft.color, ft.progress);
  });

  // 9. Efeitos Atmosféricos de Clima
  renderWeatherFX(
    ctx,
    canvas.width,
    canvas.height,
    weather,
    weatherTime || performance.now(),
    isIndoorEnv,
    isNightOrDarkEnv
  );
}
