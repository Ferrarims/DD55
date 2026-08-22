export interface IsoRockRenderParams {
  ctx: CanvasRenderingContext2D;
  objIsoX: number;
  objTopY: number;
  isoTileW: number;
  isoTileH: number;
  scale: number;
  variant: string;
  w: number;
  h: number;
  biome?: string;
  weather?: string;
  isIndoorEnv: boolean;
}
