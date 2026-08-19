import { MutableRefObject } from 'react';
import { CombatEntity, BiomeType, WeatherType, CellData } from '../../../game/types';

export interface UseCanvasRendererProps {
  canvasRef: MutableRefObject<HTMLCanvasElement | null>;
  grid: CellData[][];
  entities: CombatEntity[];
  activeEntityIndex: number;
  biome: BiomeType;
  isNight: boolean;
  weather: WeatherType;
  weatherTime: number;
  torches: { x: number; y: number }[];
  character: any;
  activeEffects: any[];
  floatingTexts: any[];
  droppedLoot: any[];
  chests: any[];
  hazards: any[];
  powerups: any[];
  restPoints: any[];
  cols: number;
  rows: number;
  isFullscreenMap: boolean;
  activeRevelation: string | null;
  isTeleportTargetMode: boolean;
  isGoliath: boolean;
  is3dMode: boolean;

  highlightedPath: any[];
  activeLargeForm: any;
  getEntitySizeInSquares: (e: any) => number;
  RACES_REFERENCE: any;
  activeEntity: any;
  getEntityCover: any;
  shouldHideEntityDetails: any;
  getDamageTypeColor: (damageType?: string) => { primary: string; secondary: string; glow: string; particle: string; main: string; light: string; dark: string };
  isIndoor: boolean;
  heroHasBlindFighting: () => boolean;
  nightProgress: number;

  heroEntity: CombatEntity | undefined;
  getHeroLightRadiusInCells: () => number;
  isEntityVisible: (ent: CombatEntity) => boolean;
  isEntityVisibleByBlindFightingOnly: (ent: CombatEntity) => boolean;
  getDistanceBetweenEntities: (e1: CombatEntity, e2: CombatEntity, race?: string, isLarge?: boolean) => number;
}

export interface CameraConfig {
  cameraX: number;
  cameraY: number;
  cellSize: number;
  renderMargin: number;
}

export interface RenderContext2D {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  props: UseCanvasRendererProps;
  camera: CameraConfig;
  isIndoorEnv: boolean;
  isNightOrDarkEnv: boolean;
}
