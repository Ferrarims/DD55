import { useCanvasRenderer } from '../../useCanvasRenderer';
import { useMinimapRenderer } from '../../useMinimapRenderer';
import { getEntitySizeInSquares, getDistanceBetweenEntities, getDamageTypeColor } from '../../../../../game/combatUtils';
import { RACES_REFERENCE } from '../../../../../lib/api/references';
import { BiomeType } from '../../../../../game/types';

export interface UseArenaRenderingControllerProps {
  canvasRef: any;
  minimapRef: any;
  grid: any;
  entities: any[];
  activeEntityIndex: number;
  biome: BiomeType;
  isNight: boolean;
  weather: any;
  weatherTime: number;
  torches: any[];
  character: any;
  activeEffects: any;
  floatingTexts: any;
  droppedLoot: any;
  chests: any;
  hazards: any;
  powerups: any;
  restPoints: any;
  cols: number;
  rows: number;
  isFullscreenMap: boolean;
  activeRevelation: any;
  isTeleportTargetMode: boolean;
  isGoliath: boolean;
  is3dMode: boolean;
  highlightedPath: any;
  activeLargeForm: any;
  activeEntity: any;
  getEntityCover: any;
  shouldHideEntityDetails: any;
  isIndoor: boolean;
  heroHasBlindFighting: any;
  getHeroLightRadiusInCells: any;
  isEntityVisible: any;
  isEntityVisibleByBlindFightingOnly: any;
  exploredCellsRef: any;
}

export function useArenaRenderingController({
  canvasRef,
  minimapRef,
  grid,
  entities,
  activeEntityIndex,
  biome,
  isNight,
  weather,
  weatherTime,
  torches,
  character,
  activeEffects,
  floatingTexts,
  droppedLoot,
  chests,
  hazards,
  powerups,
  restPoints,
  cols,
  rows,
  isFullscreenMap,
  activeRevelation,
  isTeleportTargetMode,
  isGoliath,
  is3dMode,
  highlightedPath,
  activeLargeForm,
  activeEntity,
  getEntityCover,
  shouldHideEntityDetails,
  isIndoor,
  heroHasBlindFighting,
  getHeroLightRadiusInCells,
  isEntityVisible,
  isEntityVisibleByBlindFightingOnly,
  exploredCellsRef,
}: UseArenaRenderingControllerProps) {
  useCanvasRenderer({
    canvasRef,
    grid,
    entities,
    activeEntityIndex,
    biome,
    isNight,
    weather,
    weatherTime,
    torches,
    character,
    activeEffects,
    floatingTexts,
    droppedLoot,
    chests,
    hazards,
    powerups,
    restPoints,
    cols,
    rows,
    isFullscreenMap,
    activeRevelation,
    isTeleportTargetMode,
    isGoliath: isGoliath || false,
    is3dMode,
    nightProgress: isNight ? 1 : 0,
    highlightedPath,
    activeLargeForm,
    getEntitySizeInSquares,
    RACES_REFERENCE,
    activeEntity,
    getEntityCover,
    shouldHideEntityDetails,
    getDamageTypeColor,
    isIndoor: isIndoor || false,
    heroHasBlindFighting,
    heroEntity: entities.find(e => e.type === 'hero'),
    getHeroLightRadiusInCells,
    isEntityVisible,
    isEntityVisibleByBlindFightingOnly,
    getDistanceBetweenEntities
  });

  useMinimapRenderer({
    minimapRef,
    grid,
    entities,
    biome,
    weather,
    cols,
    rows,
    isFullscreenMap,
    isNight,
    getHeroLightRadiusInCells,
    heroHasBlindFighting,
    exploredCellsRef,
    isEntityVisible,
  });
}
