import { CellData } from '../../../game/types';
import { getIsoTileColors } from './isometric/isoTileColorPalette';
import { renderIsoBlockFaces } from './isometric/isoBlockFacesRenderer';
import { renderIsoTileTop } from './isometric/isoTileTopRenderer';

interface DrawIsometricTileProps {
  ctx: CanvasRenderingContext2D;
  cell: CellData;
  mapC: number;
  mapR: number;
  isoX: number;
  isoY: number;
  isoTileW: number;
  isoTileH: number;
  biome: string;
  weather: string;
  isNightOrDarkEnv: boolean;
  isIndoorEnv: boolean;
  highlightedPath: { x: number; y: number }[];
  activeLargeForm: boolean;
  hero: any;
}

/**
 * Desenha um único ladrilho (terreno, água, calçada, relevos 3D e grama/areia)
 * mantendo a compatibilidade estrita com o Painter's Algorithm.
 * Retorna o valor calculado de blockH para uso em elementos subsequentes da mesma célula.
 */
export function drawIsometricTile({
  ctx,
  cell,
  mapC,
  mapR,
  isoX,
  isoY,
  isoTileW,
  isoTileH,
  biome,
  weather,
  isNightOrDarkEnv,
  isIndoorEnv,
  highlightedPath,
  activeLargeForm,
  hero,
}: DrawIsometricTileProps): number {
  // 1. Obter Altura do Bloco 3D e Cores das Faces
  const { blockH, topColor, leftColor, rightColor } = getIsoTileColors({
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
  });

  const topY = isoY - blockH;

  // 2. Renderizar Faces Verticais (Direita e Esquerda)
  renderIsoBlockFaces({
    ctx,
    cell,
    mapC,
    mapR,
    isoX,
    isoY,
    isoTileW,
    isoTileH,
    biome,
    blockH,
    leftColor,
    rightColor,
  });

  // 3. Renderizar Face Superior (Lajotas, grama, runas)
  renderIsoTileTop({
    ctx,
    cell,
    mapC,
    mapR,
    isoX,
    topY,
    isoTileW,
    isoTileH,
    biome,
    blockH,
    topColor,
  });

  return blockH;
}
