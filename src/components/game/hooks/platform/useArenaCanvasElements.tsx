import React from 'react';
import { CombatEntity } from '../../../../game/types';

export interface UseArenaCanvasElementsProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  minimapRef: React.RefObject<HTMLCanvasElement | null>;
  isFullscreenMap: boolean;
  is3dMode: boolean;
  cols: number;
  rows: number;
  entities: CombatEntity[];
  handleCellClick: (x: number, y: number) => void;
}

export function useArenaCanvasElements({
  canvasRef,
  minimapRef,
  isFullscreenMap,
  is3dMode,
  cols,
  rows,
  entities,
  handleCellClick
}: UseArenaCanvasElementsProps) {
  const renderCanvasElement = () => {
    return (
      <canvas
        ref={canvasRef}
        width={isFullscreenMap ? 1440 : 1200}
        height={isFullscreenMap ? 1080 : 840}
        onClick={(e) => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const rect = canvas.getBoundingClientRect();
          const scaleX = canvas.width / rect.width;
          const scaleY = canvas.height / rect.height;
          const clickX = (e.clientX - rect.left) * scaleX;
          const clickY = (e.clientY - rect.top) * scaleY;

          const hero = entities.find(ent => ent.type === 'hero');
          const heroX = hero ? hero.x : 75;
          const heroY = hero ? hero.y : 75;
          const cameraX = Math.max(0, Math.min(150 - cols, heroX - Math.floor(cols / 2)));
          const cameraY = Math.max(0, Math.min(150 - rows, heroY - Math.floor(rows / 2)));

          if (is3dMode) {
            const centerC = cameraX + cols / 2;
            const centerR = cameraY + rows / 2;
            const isoTileW = (canvas.width / cols) * 1.65;
            const isoTileH = isoTileW * 0.5;

            const dx = clickX - canvas.width / 2;
            const dy = clickY - (canvas.height / 2 + isoTileH * 0.5);

            const relC = (dx / (isoTileW / 2) + dy / (isoTileH / 2)) / 2;
            const relR = (dy / (isoTileH / 2) - dx / (isoTileW / 2)) / 2;

            const gridX = Math.floor(relC + centerC);
            const gridY = Math.floor(relR + centerR);
            handleCellClick(gridX, gridY);
          } else {
            const cellSize = canvas.width / cols;
            const gridX = Math.floor(clickX / cellSize) + cameraX;
            const gridY = Math.floor(clickY / cellSize) + cameraY;
            handleCellClick(gridX, gridY);
          }
        }}
        className={`cursor-pointer block mx-auto transition-all duration-300 ${
          isFullscreenMap 
            ? 'h-full w-full object-fill border-0 rounded-none' 
            : 'max-w-full w-auto object-contain rounded-xl border-2 shadow-2xl max-h-[620px] h-auto border-slate-800'
        }`}
      />
    );
  };

  const renderMinimapElement = (customClass?: string) => {
    return (
      <canvas 
        ref={minimapRef} 
        className={customClass || "block w-[126px] h-auto pointer-events-none"} 
      />
    );
  };

  return {
    renderCanvasElement,
    renderMinimapElement
  };
}
