import { CellData } from '../../../../game/types';

interface GetIsoTileColorsProps {
  cell: CellData;
  mapC: number;
  mapR: number;
  biome: string;
  weather: string;
  isNightOrDarkEnv: boolean;
  isIndoorEnv: boolean;
  highlightedPath: { x: number; y: number }[];
  activeLargeForm: boolean;
  hero: any;
  isoTileH: number;
}

export interface IsoTileColorsResult {
  blockH: number;
  topColor: string;
  leftColor: string;
  rightColor: string;
}

export function getIsoTileColors({
  cell,
  mapC,
  mapR,
  biome,
  weather,
  isNightOrDarkEnv,
  isIndoorEnv,
  highlightedPath,
  activeLargeForm,
  hero,
  isoTileH,
}: GetIsoTileColorsProps): IsoTileColorsResult {
  const displayBiome = biome === 'Arena de Testes' ? 'Floresta' : biome;

  // Determinar Altura do Bloco 3D (Extrusão Vertical)
  let blockH = 0;
  if (cell.terrain === 'wall') {
    if (displayBiome === 'Masmorra') {
      if (cell.obstacleType === 'pillar' || cell.obstacleType === 'cell_bars') blockH = 0;
      else blockH = isoTileH * 1.6; // Paredes de Pedra de Masmorra
    } else if (cell.obstacleType === 'brick_wall') {
      blockH = isoTileH * 1.6; // Muralha de cobertura total
    } else {
      blockH = 0;
    }
  } else if (cell.terrain === 'difficult') {
    blockH = 0;
  }

  let topColor = '#1e293b';
  let leftColor = '#0f172a';
  let rightColor = '#334155';

  if (!isIndoorEnv && weather === 'snow') {
    const snowSeed = (mapR * 13 + mapC * 17) % 3;
    if (!isNightOrDarkEnv) {
      if (cell.terrain === 'difficult') {
        topColor = '#e2e8f0';
        leftColor = '#94a3b8';
        rightColor = '#cbd5e1';
      } else {
        topColor = snowSeed === 0 ? '#ffffff' : snowSeed === 1 ? '#f8fafc' : '#f1f5f9';
        leftColor = '#cbd5e1';
        rightColor = '#e2e8f0';
      }
    } else {
      if (cell.terrain === 'difficult') {
        topColor = '#94a3b8';
        leftColor = '#475569';
        rightColor = '#64748b';
      } else {
        topColor = snowSeed === 0 ? '#e2e8f0' : snowSeed === 1 ? '#cbd5e1' : '#dbeafe';
        leftColor = '#64748b';
        rightColor = '#94a3b8';
      }
    }
  } else if (displayBiome === 'Floresta') {
    if (!isNightOrDarkEnv) {
      if (cell.terrain === 'difficult') {
        topColor = '#15803d'; leftColor = '#14532d'; rightColor = '#22c55e';
      } else {
        topColor = '#22c55e'; leftColor = '#15803d'; rightColor = '#4ade80';
      }
    } else {
      if (cell.terrain === 'difficult') {
        topColor = '#14532d'; leftColor = '#0f3923'; rightColor = '#166534';
      } else {
        topColor = '#15803d'; leftColor = '#14532d'; rightColor = '#166534';
      }
    }
  } else if (displayBiome === 'Deserto') {
    if (!isNightOrDarkEnv) {
      if (cell.terrain === 'difficult') {
        topColor = '#d97706'; leftColor = '#92400e'; rightColor = '#f59e0b';
      } else {
        topColor = '#f59e0b'; leftColor = '#d97706'; rightColor = '#fbbf24';
      }
    } else {
      if (cell.terrain === 'difficult') {
        topColor = '#b45309'; leftColor = '#78350f'; rightColor = '#92400e';
      } else {
        topColor = '#d97706'; leftColor = '#92400e'; rightColor = '#f59e0b';
      }
    }
  } else if (displayBiome === 'Pântano') {
    if (!isNightOrDarkEnv) {
      if (cell.terrain === 'difficult') {
        topColor = '#0d9488'; leftColor = '#042f2e'; rightColor = '#14b8a6';
      } else {
        topColor = '#14b8a6'; leftColor = '#0f766e'; rightColor = '#2dd4bf';
      }
    } else {
      if (cell.terrain === 'difficult') {
        topColor = '#042f2e'; leftColor = '#021c1b'; rightColor = '#0d9488';
      } else {
        topColor = '#0f766e'; leftColor = '#042f2e'; rightColor = '#115e59';
      }
    }
  } else if (displayBiome === 'Masmorra') {
    if (cell.terrain === 'wall') {
      topColor = cell.obstacleType === 'pillar' ? '#64748b' : '#3b485e';
      leftColor = '#1c2536';
      rightColor = '#2d3d54';
    } else if (cell.dungeonFeature === 'hall') {
      topColor = '#222e3d'; leftColor = '#0f172a'; rightColor = '#1a2433';
    } else {
      const stoneVar = (mapR * 7 + mapC * 11) % 4;
      topColor = stoneVar === 0 ? '#1e293b' : stoneVar === 1 ? '#273549' : stoneVar === 2 ? '#1a2332' : '#223042';
      leftColor = '#0d131f'; rightColor = '#16202e';
    }
  }

  if (cell.terrain === 'water') {
    topColor = '#0284c7';
    leftColor = '#075985';
    rightColor = '#0369a1';
  }

  // Destaque de caminho e Golias
  const isHighlighted = highlightedPath.some(p => p.x === mapC && p.y === mapR);
  const isGoliathCell = activeLargeForm && hero && mapC >= hero.x && mapC < hero.x + 2 && mapR >= hero.y && mapR < hero.y + 2;
  if (isHighlighted) {
    topColor = '#f59e0b';
    leftColor = '#b45309';
    rightColor = '#d97706';
  } else if (isGoliathCell) {
    topColor = '#d97706';
    leftColor = '#78350f';
    rightColor = '#92400e';
  }

  return { blockH, topColor, leftColor, rightColor };
}
