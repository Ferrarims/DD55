import React from 'react';
import { BiomeType, WeatherType } from '../../../game/types';
import { WEATHER_CONFIGS } from '../../../game/weatherEffects';

interface MapControlsOverlayProps {
  is3dMode: boolean;
  setIs3dMode: (val: boolean) => void;
  isIndoor: boolean;
  isNight: boolean;
  setIsNight: (val: boolean) => void;
  isDesert: boolean;
  weather: WeatherType;
  setWeather: (w: WeatherType) => void;
  setIsFullscreenMap: (val: boolean) => void;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  isShowZoomControls: boolean;
  zoomLevel: number;
  isFullscreenMap: boolean;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
}

export const MapControlsOverlay: React.FC<MapControlsOverlayProps> = ({
  is3dMode,
  setIs3dMode,
  isIndoor,
  isNight,
  setIsNight,
  isDesert,
  weather,
  setWeather,
  setIsFullscreenMap,
  setZoomLevel,
  isShowZoomControls,
  zoomLevel,
  isFullscreenMap,
  handleZoomIn,
  handleZoomOut,
  handleZoomReset,
}) => {
  return (
    <div
      id="map-controls-overlay"
      className="absolute top-2 left-2 z-10 flex flex-col gap-1.5 bg-slate-950/95 border border-slate-700/80 rounded-xl p-1.5 shadow-2xl backdrop-blur-md max-w-[calc(100%-80px)]"
    >
      {/* Linha 1: 3D/2D, Dia/Noite, Clima, Tela Cheia */}
      <div className="flex flex-wrap items-center gap-1">
        <button
          onClick={() => setIs3dMode(!is3dMode)}
          className={`px-2 py-1 font-black text-[10px] uppercase tracking-wider rounded-lg border transition flex items-center gap-1 shadow cursor-pointer ${
            is3dMode
              ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 shadow-purple-900/40'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
          title="Alternar entre Visão 3D Pixel Art Isométrica e Visão 2D Clássica"
        >
          <span>{is3dMode ? '🧊 3D Pixel Art' : '📐 2D Top-Down'}</span>
        </button>
        <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5" />
        <button
          disabled={isIndoor}
          onClick={() => {
            if (isIndoor) return;
            setIsNight(!isNight);
          }}
          className={`px-2 py-1 font-black text-[10px] uppercase tracking-wider rounded-lg border transition flex items-center gap-1 shadow ${
            isIndoor
              ? 'bg-slate-900/70 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
              : isNight
              ? 'bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border-indigo-600 shadow-indigo-950/60 cursor-pointer'
              : 'bg-amber-600 hover:bg-amber-500 text-amber-100 border-amber-400 shadow-amber-950/60 cursor-pointer'
          }`}
          title={
            isIndoor
              ? 'Cavernas e Masmorras são subterrâneas (sempre Noite / Escuro)'
              : isNight
              ? 'Alternar para Dia (Claro)'
              : 'Alternar para Noite (Escuro)'
          }
        >
          <span>{isIndoor ? '🔒 Escuro' : isNight ? '🌙 Noite' : '☀️ Dia'}</span>
        </button>
        <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5" />
        <button
          disabled={isIndoor}
          onClick={() => {
            if (isIndoor) return;
            const list: WeatherType[] = isDesert
              ? ['clear', 'wind']
              : ['clear', 'rain', 'snow', 'wind', 'storm', 'fog'];
            const currentIdx = list.indexOf(weather);
            const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % list.length;
            setWeather(list[nextIdx]);
          }}
          className={`px-2 py-1 font-black text-[10px] uppercase tracking-wider rounded-lg border transition flex items-center gap-1 shadow ${
            isIndoor
              ? 'bg-slate-900/70 border-slate-800 text-slate-500 opacity-60 cursor-not-allowed'
              : `${WEATHER_CONFIGS[weather].badgeBg} ${WEATHER_CONFIGS[weather].badgeBorder} ${WEATHER_CONFIGS[weather].color} hover:brightness-125 cursor-pointer`
          }`}
          title={
            isIndoor
              ? 'Cavernas e Masmorras são subterrâneas (não sofrem alterações climáticas)'
              : isDesert
              ? `Clima no Deserto: ${WEATHER_CONFIGS[weather].label} (${WEATHER_CONFIGS[weather].tagline}). No deserto apenas Céu Limpo ou Ventania de Areia ocorrem.`
              : `Clima: ${WEATHER_CONFIGS[weather].label} (${WEATHER_CONFIGS[weather].tagline}). Clique para alternar.`
          }
        >
          <span>
            {isIndoor
              ? '🔒 Subterrâneo'
              : `${WEATHER_CONFIGS[weather].icon} ${WEATHER_CONFIGS[weather].label}`}
          </span>
        </button>
        <div className="h-4 w-[1px] bg-slate-700/80 mx-0.5" />
        <button
          onClick={() => {
            setIsFullscreenMap(true);
            setZoomLevel(-3);
          }}
          className="px-2 py-1 bg-amber-600 hover:bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider rounded-lg border border-amber-500 transition flex items-center gap-1 shadow cursor-pointer"
          title="Ativar Mapa em Tela Cheia (Modo Imersivo)"
        >
          <span>🖥️ Tela Cheia</span>
        </button>
      </div>

      {/* Linha 2: Controles de Zoom */}
      {isShowZoomControls && (
        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-slate-800">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Zoom:
          </span>
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= (isFullscreenMap ? -6 : -3)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-amber-400 font-black text-xs rounded-lg border border-slate-700/80 transition flex items-center gap-1 shadow cursor-pointer disabled:cursor-not-allowed"
            title="Reduzir Zoom (-) [Visão mais ampla do mapa]"
          >
            <span>🔍 -</span>
          </button>
          <button
            onClick={handleZoomReset}
            className="px-2 py-1 bg-slate-900/90 hover:bg-slate-800 text-amber-300 font-mono text-[10px] font-bold rounded-lg border border-slate-800 transition shadow cursor-pointer"
            title="Clique para voltar ao Zoom Padrão (Nível 0)"
          >
            {zoomLevel === 0 ? 'Padrão (0)' : zoomLevel > 0 ? `Zoom +${zoomLevel}` : `Zoom ${zoomLevel}`}
          </button>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-amber-400 font-black text-xs rounded-lg border border-slate-700/80 transition flex items-center gap-1 shadow cursor-pointer disabled:cursor-not-allowed"
            title="Aumentar Zoom (+) [Ampliar visualização do mapa]"
          >
            <span>🔍 +</span>
          </button>
        </div>
      )}
    </div>
  );
};
