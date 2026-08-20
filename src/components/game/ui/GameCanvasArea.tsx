import React from 'react';
import { MapControlsOverlay } from './MapControlsOverlay';
import { MinimapOverlay } from './MinimapOverlay';
import { GridLegend } from './GridLegend';
import { FullscreenMapOverlay } from './FullscreenMapOverlay';
import { ProceduralWorldDebugPanel } from './ProceduralWorldDebugPanel';
import { useGameContext } from '../context/GameContext';

export const GameCanvasArea: React.FC = () => {
  const context = useGameContext();
  if (!context) return null;

  const {
    grid,
    isFullscreenMap,
    setIsFullscreenMap,
    is3dMode,
    setIs3dMode,
    isIndoor,
    isNight,
    setIsNight,
    isDesert,
    weather,
    setWeather,
    setZoomLevel,
    isShowZoomControls,
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    isShowMinimap,
    isMinimapMinimized,
    setIsMinimapMinimized,
    renderMinimapElement,
    renderCanvasElement,
    biome,
    initNewCombat,
    timePhaseIcon,
    timePhaseLabel,
    timePhaseColor,
    timeFormatted,
    phaseTurn,
    totalGameTurns,
    handleFinishExploration,
    entities,
    proceduralWorldEnabled,
    setProceduralWorldEnabled,
    proceduralBridge,
  } = context;

  return (
    <>
      {/* COLUNA 1: Arena / Mapa Canvas 2D (lg:col-span-5) */}
      <div className="lg:col-span-5 space-y-2">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
          <div className="relative w-full flex justify-center min-h-[400px] items-center">
            {/* Canvas do Grid */}
            {!isFullscreenMap && renderCanvasElement()}

            {grid.length === 0 && (
              <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-3 z-30 rounded-2xl">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-amber-400 font-bold text-xs uppercase tracking-widest animate-pulse">
                  Gerando Nova Arena Procedural...
                </p>
              </div>
            )}

            {/* Controles de Zoom (+ / -) e Visualização (3D / 2D) */}
            {!isFullscreenMap && (
              <MapControlsOverlay
                is3dMode={is3dMode}
                setIs3dMode={setIs3dMode}
                isIndoor={isIndoor}
                isNight={isNight}
                setIsNight={setIsNight}
                isDesert={isDesert}
                weather={weather}
                setWeather={setWeather}
                setIsFullscreenMap={setIsFullscreenMap}
                setZoomLevel={setZoomLevel}
                isShowZoomControls={isShowZoomControls}
                zoomLevel={zoomLevel}
                isFullscreenMap={isFullscreenMap}
                handleZoomIn={handleZoomIn}
                handleZoomOut={handleZoomOut}
                handleZoomReset={handleZoomReset}
              />
            )}

            {/* Minimapa */}
            {!isFullscreenMap && (
              <MinimapOverlay
                isShowMinimap={isShowMinimap}
                isMinimapMinimized={isMinimapMinimized}
                setIsMinimapMinimized={setIsMinimapMinimized}
                isFullscreenMap={isFullscreenMap}
                renderMinimapElement={renderMinimapElement}
              />
            )}

            {/* Painel de Debug do Mundo Procedural */}
            {!isFullscreenMap && proceduralWorldEnabled && (
              <div className="absolute bottom-2 left-2 z-20 max-w-[240px]">
                <ProceduralWorldDebugPanel
                  enabled={Boolean(proceduralWorldEnabled)}
                  onToggleEnabled={(enabled) => setProceduralWorldEnabled?.(enabled)}
                  worldSeed={proceduralBridge?.worldSeed}
                  currentChunk={proceduralBridge?.currentChunk}
                  worldPosition={proceduralBridge?.worldPosition}
                  currentCell={proceduralBridge?.currentCell}
                  onResetToOrigin={proceduralBridge?.resetToOrigin}
                />
              </div>
            )}
          </div>

          {/* Legenda do Grid */}
          <GridLegend />
        </div>
      </div>

      {/* Overlay de Mapa em Tela Cheia */}
      <FullscreenMapOverlay
        isFullscreenMap={isFullscreenMap}
        setIsFullscreenMap={setIsFullscreenMap}
        setZoomLevel={setZoomLevel}
        zoomLevel={zoomLevel}
        handleZoomIn={handleZoomIn}
        handleZoomOut={handleZoomOut}
        handleZoomReset={handleZoomReset}
        isShowZoomControls={isShowZoomControls}
        is3dMode={is3dMode}
        setIs3dMode={setIs3dMode}
        biome={biome}
        initNewCombat={initNewCombat}
        isIndoor={isIndoor}
        isNight={isNight}
        setIsNight={setIsNight}
        timePhaseIcon={timePhaseIcon}
        timePhaseLabel={timePhaseLabel}
        timePhaseColor={timePhaseColor}
        timeFormatted={timeFormatted}
        phaseTurn={phaseTurn}
        totalGameTurns={totalGameTurns}
        weather={weather}
        setWeather={setWeather}
        isDesert={isDesert}
        isShowMinimap={isShowMinimap}
        renderMinimapElement={renderMinimapElement}
        renderCanvasElement={renderCanvasElement}
        handleFinishExploration={handleFinishExploration}
        entities={entities}
        proceduralWorldEnabled={proceduralWorldEnabled}
        setProceduralWorldEnabled={setProceduralWorldEnabled}
        proceduralBridge={proceduralBridge}
      />
    </>
  );
};
