import { CellData } from '../../../game/types';
import { UseCanvasRendererProps } from './rendererTypes';
import { drawSkyAndAtmosphere } from './isometricSkyRenderer';
import { toIsometric } from './isometricMath';
import { drawIsometricTile } from './isometricTerrainRenderer';
import { drawIsometricEntities } from './isometricEntityRenderer';
import { drawIsometricFX } from './isometricFXRenderer';
import { drawIsometricObstacle } from './isometricObstacleRenderer';
import { drawIsometricObjects } from './isometricObjectRenderer';

export function render3DIsometric(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  props: UseCanvasRendererProps
): void {
  const {
    grid, entities, biome, cols, rows, isFullscreenMap, restPoints, torches, chests, droppedLoot, powerups, hazards, nightProgress
  } = props;

  const isIndoorEnv = biome === 'Caverna' || biome === 'Masmorra';
  const isNightOrDarkEnv = isIndoorEnv || (nightProgress > 0 && (biome === 'Floresta' || biome === 'Pântano' || biome === 'Deserto'));

  // =========================================================
  // MOTOR GRÁFICO 3D PIXEL ART ISOMÉTRICO (3D VOXEL RENDERING)
  // =========================================================
  canvas.height = isFullscreenMap ? 1080 : 840;

  // Renderizar Fundo de Atmosfera e Céu (Dia / Crepúsculo / Noite / Subterrâneo) em 3D com transição gradual
  drawSkyAndAtmosphere(ctx, canvas, props);

  const hero = entities.find(e => e.type === 'hero');
  const heroX = hero ? hero.x : 75;
  const heroY = hero ? hero.y : 75;
  const cameraX = Math.max(0, Math.min(150 - cols, heroX - Math.floor(cols / 2)));
  const cameraY = Math.max(0, Math.min(150 - rows, heroY - Math.floor(rows / 2)));

  const centerC = cameraX + cols / 2;
  const centerR = cameraY + rows / 2;

  // Dimensões do Diamante Isométrico 3D Pixel Art
  const isoTileW = (canvas.width / cols) * 1.65;
  const isoTileH = isoTileW * 0.5;

  const renderMargin = 12;
  const minR = -renderMargin;
  const maxR = rows + renderMargin - 1;
  const minC = -renderMargin;
  const maxC = cols + renderMargin - 1;

  // Renderizar Terreno e Bloco 3D por Ordenação de Profundidade (Painter's Algorithm: depth = r + c)
  for (let depth = (minR + minC); depth <= (maxR + maxC); depth++) {
    for (let r = minR; r <= maxR; r++) {
      const c = depth - r;
      if (c < minC || c > maxC) continue;

      const mapR = r + cameraY;
      const mapC = c + cameraX;
      let cell = grid[mapR]?.[mapC];
      if (!cell) {
        if (mapR >= 0 && mapR < 150 && mapC >= 0 && mapC < 150) continue;
        cell = { x: mapC, y: mapR, terrain: 'normal', movementCost: 1, isExplored: true, visible: true } as CellData;
      }

      // Coordenadas Isométricas no Canvas
      const { x: isoX, y: isoY } = toIsometric(
        mapC,
        mapR,
        centerC,
        centerR,
        canvas.width,
        canvas.height,
        isoTileW,
        isoTileH
      );

      // Determinar Altura do Bloco 3D (Extrusão Vertical) e desenhar ladrilho isométrico
      const blockH = drawIsometricTile({
        ctx,
        cell,
        mapC,
        mapR,
        isoX,
        isoY,
        isoTileW,
        isoTileH,
        biome,
        weather: props.weather,
        isNightOrDarkEnv,
        isIndoorEnv,
        highlightedPath: props.highlightedPath,
        activeLargeForm: props.activeLargeForm,
        hero,
      });

      const topY = isoY - blockH;

      // Objetos de Obstáculos em 3D SÓLIDOS (100% Opacos) com Suporte a Múltiplos Tamanhos
      drawIsometricObstacle({
        ctx,
        canvas,
        props,
        cell,
        mapC,
        mapR,
        centerC,
        centerR,
        isoTileW,
        isoTileH,
        blockH,
        isIndoorEnv,
      });

      // Renderizar Tochas, Baús, Loot, Power-ups, Armadilhas e Acampamentos em 3D Isométrico
      drawIsometricObjects({
        ctx,
        canvas,
        props,
        mapC,
        mapR,
        centerC,
        centerR,
        isoX,
        topY,
        isoTileW,
        isoTileH,
      });

      // Renderizar Entidades (Herói e Monstros) no topo do Bloco 3D
      drawIsometricEntities({
        ctx,
        props,
        mapC,
        mapR,
        isoX,
        topY,
        isoTileW,
        isoTileH,
      });

    }
  }

  // Renderizar Efeitos, Iluminação, Clima e Textos Flutuantes em 3D Isométrico
  drawIsometricFX({
    ctx,
    canvas,
    props,
    centerC,
    centerR,
    isoTileW,
    isoTileH,
    isIndoorEnv,
    isNightOrDarkEnv,
  });
}
