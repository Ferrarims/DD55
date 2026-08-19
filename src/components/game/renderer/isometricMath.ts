export interface Point {
  x: number;
  y: number;
}

/**
 * Converte coordenadas de célula do grid (coluna, linha) para coordenadas isométricas na tela (x, y).
 */
export function toIsometric(
  mapC: number,
  mapR: number,
  centerC: number,
  centerR: number,
  canvasWidth: number,
  canvasHeight: number,
  isoTileW: number,
  isoTileH: number
): Point {
  const relC = mapC - centerC;
  const relR = mapR - centerR;
  const x = canvasWidth / 2 + (relC - relR) * (isoTileW / 2);
  const y = canvasHeight / 2 + (relC + relR) * (isoTileH / 2) + isoTileH * 0.5;
  return { x, y };
}
