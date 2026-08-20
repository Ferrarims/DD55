import React, { useState } from 'react';
import { ChunkCell, ChunkCoordinates, WorldCoordinates, WorldSeed } from '../../../game/world/types';

export interface ProceduralWorldDebugPanelProps {
  readonly enabled: boolean;
  readonly onToggleEnabled: (enabled: boolean) => void;
  readonly worldSeed?: WorldSeed;
  readonly currentChunk?: ChunkCoordinates;
  readonly worldPosition?: WorldCoordinates;
  readonly currentCell?: ChunkCell | null;
  readonly onResetToOrigin?: () => void;
}

export const ProceduralWorldDebugPanel: React.FC<ProceduralWorldDebugPanelProps> = ({
  enabled,
  onToggleEnabled,
  worldSeed,
  currentChunk,
  worldPosition,
  currentCell,
  onResetToOrigin,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  return (
    <div
      id="procedural-world-debug-panel"
      className="bg-slate-900/95 border border-indigo-500/40 rounded-xl p-2.5 shadow-xl text-xs backdrop-blur-md transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-1.5 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">🌐</span>
          <span className="font-black text-indigo-300 tracking-wide">Mundo Procedural</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              id="procedural-world-toggle"
              type="checkbox"
              checked={enabled}
              onChange={(e) => onToggleEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
            <span className="ml-1.5 text-[11px] font-bold text-slate-300">
              {enabled ? 'Ligado' : 'Desligado'}
            </span>
          </label>

          {/* Collapse Button */}
          {enabled && (
            <button
              id="procedural-debug-collapse-toggle"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-slate-400 hover:text-white px-1 py-0.5 rounded text-[10px] transition"
              title={isCollapsed ? 'Expandir painel de debug' : 'Minimizar painel de debug'}
            >
              {isCollapsed ? '▼' : '▲'}
            </button>
          )}
        </div>
      </div>

      {enabled && !isCollapsed && (
        <div className="space-y-1.5 text-[11px] text-slate-300 pt-0.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 font-semibold">Seed:</span>
            <span className="font-mono text-amber-300 font-bold max-w-[140px] truncate" title={String(worldSeed)}>
              {worldSeed !== undefined ? String(worldSeed) : '—'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 font-semibold">Chunk Atual:</span>
            <span className="font-mono text-emerald-400 font-bold">
              {currentChunk ? `(${currentChunk.chunkX}, ${currentChunk.chunkY})` : '(0, 0)'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 font-semibold">Posição Global:</span>
            <span className="font-mono text-sky-300 font-bold">
              {worldPosition ? `X: ${worldPosition.worldX}, Y: ${worldPosition.worldY}` : 'X: 0, Y: 0'}
            </span>
          </div>

          {currentCell && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-400 font-semibold">Bioma / Terreno:</span>
              <span className="font-semibold text-slate-200">
                {currentCell.biome} ({currentCell.terrain})
              </span>
            </div>
          )}

          {onResetToOrigin && (
            <button
              id="procedural-debug-reset-origin-btn"
              onClick={onResetToOrigin}
              className="w-full mt-1.5 px-2 py-1 bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 border border-indigo-500/40 rounded text-[10px] font-bold transition flex items-center justify-center gap-1"
            >
              <span>📍</span>
              <span>Retornar à Origem (0, 0)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
