import { useEffect } from 'react';
import { UseCanvasRendererProps } from '../renderer/rendererTypes';
import { render2DTopDown } from '../renderer/render2DTopDown';
import { render3DIsometric } from '../renderer/render3DIsometric';

export function useCanvasRenderer(props: UseCanvasRendererProps) {
  const {
    canvasRef, grid, entities, activeEntityIndex, biome, isNight, weather, weatherTime, torches, character,
    activeEffects, floatingTexts, droppedLoot, chests, hazards, powerups, restPoints, cols, rows,
    isFullscreenMap, activeRevelation, isTeleportTargetMode, isGoliath, is3dMode, nightProgress
  } = props;

  // Renderizador do Canvas 2D Top-Down & 3D Pixel Art Isométrico
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !grid || grid.length === 0 || !grid[0]) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (is3dMode) {
      render3DIsometric(ctx, canvas, props);
      return;
    }

    render2DTopDown(ctx, canvas, props);
  }, [grid, entities, activeEntityIndex, biome, isNight, weather, weatherTime, torches, character, activeEffects, floatingTexts, droppedLoot, chests, hazards, powerups, restPoints, cols, rows, isFullscreenMap, activeRevelation, isTeleportTargetMode, isGoliath, is3dMode, nightProgress]);
}
