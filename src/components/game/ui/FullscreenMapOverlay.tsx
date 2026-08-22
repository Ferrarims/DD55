import React from 'react';
import { BiomeType, WeatherType } from '../../../game/types';
import { ProceduralWorldDebugPanel } from './ProceduralWorldDebugPanel';
import { FullscreenMapControlsRow } from './fullscreenMap/FullscreenMapControlsRow';
import { FullscreenMapEnvironmentRow } from './fullscreenMap/FullscreenMapEnvironmentRow';

interface FullscreenMapOverlayProps {
  isFullscreenMap: boolean;
  setIsFullscreenMap: (val: boolean) => void;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  zoomLevel: number;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
  isShowZoomControls?: boolean;
  is3dMode: boolean;
  setIs3dMode: (val: boolean) => void;
  biome?: BiomeType;
  initNewCombat?: (biome: BiomeType, forceNew?: boolean) => void;
  isIndoor?: boolean;
  isNight: boolean;
  setIsNight: (val: boolean) => void;
  timePhaseIcon?: string;
  timePhaseLabel?: string;
  timePhaseColor?: string;
  timeFormatted?: string;
  phaseTurn?: number;
  totalGameTurns?: number;
  weather: WeatherType;
  setWeather: (w: WeatherType) => void;
  isDesert?: boolean;
  isShowMinimap?: boolean;
  renderMinimapElement: (className?: string) => React.ReactNode;
  renderCanvasElement: () => React.ReactNode;
  handleFinishExploration: () => void;
  entities: any[];
  proceduralWorldEnabled?: boolean;
  setProceduralWorldEnabled?: (val: boolean) => void;
  proceduralBridge?: any;
}

export const FullscreenMapOverlay: React.FC<FullscreenMapOverlayProps> = ({
  isFullscreenMap,
  setIsFullscreenMap,
  setZoomLevel,
  zoomLevel,
  handleZoomIn,
  handleZoomOut,
  handleZoomReset,
  is3dMode,
  setIs3dMode,
  biome = 'Caverna',
  initNewCombat,
  isIndoor = false,
  isNight,
  setIsNight,
  timePhaseIcon = '☀️',
  timePhaseLabel = 'Dia',
  timePhaseColor = 'text-amber-300',
  timeFormatted = '12:00',
  phaseTurn = 0,
  totalGameTurns = 0,
  weather,
  setWeather,
  isDesert = false,
  isShowMinimap = true,
  renderMinimapElement,
  renderCanvasElement,
  handleFinishExploration,
  entities,
  proceduralWorldEnabled,
  setProceduralWorldEnabled,
  proceduralBridge,
}) => {
  React.useEffect(() => {
    if (!isFullscreenMap) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreenMap(false);
        setZoomLevel(0);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenMap, setIsFullscreenMap, setZoomLevel]);

  if (!isFullscreenMap) return null;

  const safePhaseTurn = isNaN(phaseTurn) ? 0 : phaseTurn;
  const safeTotalTurns = isNaN(totalGameTurns) ? 0 : totalGameTurns;

  return (
    <div
      id="fullscreen-map-overlay"
      className="fixed inset-0 z-50 bg-slate-950/98 backdrop-blur-md flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-200"
    >
      {/* Fundo Atmosférico de Bioma */}
      <div className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950" />
        <div className="w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Canvas Centralizado do Jogo */}
      <div className="relative flex items-center justify-center w-full h-full px-[390px] p-0">
        {renderCanvasElement()}
      </div>

      {/* CONTROLE SUPERIOR: Minimizar, Zoom, 3D/2D, Mapa e Clima */}
      <div className="absolute top-4 left-[390px] z-50 flex flex-col gap-2 max-w-[calc(100vw-530px)]">
        <FullscreenMapControlsRow
          onMinimize={() => {
            setIsFullscreenMap(false);
            setZoomLevel(0);
          }}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          handleZoomReset={handleZoomReset}
          zoomLevel={zoomLevel}
          is3dMode={is3dMode}
          setIs3dMode={setIs3dMode}
        />

        <FullscreenMapEnvironmentRow
          biome={biome}
          initNewCombat={initNewCombat}
          isIndoor={isIndoor}
          isNight={isNight}
          setIsNight={setIsNight}
          timePhaseIcon={timePhaseIcon}
          timePhaseLabel={timePhaseLabel}
          timePhaseColor={timePhaseColor}
          timeFormatted={timeFormatted}
          safePhaseTurn={safePhaseTurn}
          safeTotalTurns={safeTotalTurns}
          weather={weather}
          setWeather={setWeather}
          isDesert={isDesert}
        />
      </div>

      {/* CONTROLE SUPERIOR DIREITO: Minimapa Compacto */}
      {isShowMinimap && (
        <div className="absolute top-4 right-[390px] z-50 border border-slate-700/80 rounded-xl shadow-2xl bg-slate-900/90 backdrop-blur-md overflow-hidden hidden xl:flex flex-col">
          <div className="bg-slate-950 px-2 py-1 border-b border-slate-800 flex justify-between items-center">
            <span className="text-[9px] font-black text-amber-400 uppercase tracking-widest">
              Mini Mapa
            </span>
          </div>
          <div className="p-1">
            {renderMinimapElement('block w-[110px] h-auto pointer-events-none rounded')}
          </div>
        </div>
      )}

      {/* CONTROLE INFERIOR ESQUERDO: Debug do Mundo Procedural em Tela Cheia */}
      {proceduralWorldEnabled && (
        <div className="absolute bottom-4 left-4 z-50 max-w-[240px]">
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

      {/* CONTROLE INFERIOR DIREITO: Finalizar Mapa */}
      <div className="absolute bottom-4 right-[390px] z-50 hidden sm:block">
        <button
          id="fullscreen-finish-exploration-btn"
          onClick={handleFinishExploration}
          disabled={entities.some((e) => e.type === 'monster' && !e.isDead)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-2xl transition border border-emerald-500 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          title={
            entities.some((e) => e.type === 'monster' && !e.isDead)
              ? 'Derrote todos os monstros para finalizar'
              : 'Finalizar exploração do mapa atual'
          }
        >
          <span>🚪</span>
          <span>Finalizar Mapa</span>
        </button>
      </div>
    </div>
  );
};
