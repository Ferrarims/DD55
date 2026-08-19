import React from 'react';
import { BiomeType, WeatherType } from '../../../game/types';
import { WEATHER_CONFIGS } from '../../../game/weatherEffects';

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
}

export const FullscreenMapOverlay: React.FC<FullscreenMapOverlayProps> = ({
  isFullscreenMap,
  setIsFullscreenMap,
  setZoomLevel,
  zoomLevel,
  handleZoomIn,
  handleZoomOut,
  handleZoomReset,
  isShowZoomControls = true,
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

      {/* CONTROLE SUPERIOR: Minimizar, Zoom, 3D/2D, Mapa e Clima em Duas Linhas */}
      <div className="absolute top-4 left-[390px] z-50 flex flex-col gap-2 max-w-[calc(100vw-530px)]">
        {/* Linha 1: Minimizar, Zoom e Modo 3D/2D */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Botão Minimizar Mapa */}
          <button
            id="fullscreen-minimize-map-btn"
            onClick={() => {
              setIsFullscreenMap(false);
              setZoomLevel(0);
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-2xl transition border border-rose-500 flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider shrink-0 active:scale-95"
            title="Minimizar tela cheia e voltar para visualização padrão (ESC)"
          >
            <span>📴</span>
            <span>Minimizar Mapa</span>
          </button>

          {/* Botões de Zoom + e - no Mapa em Tela Cheia */}
          <div className="flex items-center gap-1 bg-slate-900/95 border-2 border-amber-500/80 rounded-xl p-1 shadow-2xl backdrop-blur-md shrink-0">
            <button
              id="fullscreen-zoom-out-btn"
              onClick={handleZoomOut}
              disabled={zoomLevel <= -6}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-amber-400 font-black text-xs rounded-lg border border-slate-700 transition flex items-center gap-1 shadow cursor-pointer active:scale-95"
              title="Reduzir Zoom do Mapa (-)"
            >
              <span className="text-sm leading-none font-extrabold">🔍 -</span>
            </button>
            <button
              id="fullscreen-zoom-reset-btn"
              onClick={handleZoomReset}
              className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-amber-300 font-mono text-[11px] font-bold rounded-lg border border-slate-800 transition shadow cursor-pointer active:scale-95"
              title="Clique para Redefinir o Zoom para o Padrão (Zoom 0)"
            >
              {zoomLevel === 0 ? 'Zoom 0 (Padrão)' : zoomLevel > 0 ? `Zoom +${zoomLevel}` : `Zoom ${zoomLevel}`}
            </button>
            <button
              id="fullscreen-zoom-in-btn"
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-amber-400 font-black text-xs rounded-lg border border-slate-700 transition flex items-center gap-1 shadow cursor-pointer active:scale-95"
              title="Aumentar Zoom do Mapa (+)"
            >
              <span className="text-sm leading-none font-extrabold">🔍 +</span>
            </button>
          </div>

          {/* Botão 3D / 2D */}
          <button
            id="fullscreen-toggle-3d-btn"
            onClick={() => setIs3dMode(!is3dMode)}
            className={`px-3.5 py-2 font-black text-xs uppercase tracking-wider rounded-xl border transition flex items-center gap-1.5 shadow cursor-pointer active:scale-95 ${
              is3dMode
                ? 'bg-purple-600 hover:bg-purple-500 text-white border-purple-400 shadow-purple-900/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="Alternar entre Visão 3D Pixel Art e Visão 2D Clássica"
          >
            <span>{is3dMode ? '🧊 3D' : '📐 2D'}</span>
          </button>
        </div>

        {/* Linha 2: Seletor de Mapa, Dia/Noite, Relógio e Clima */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2 shadow-2xl backdrop-blur-md">
          {/* Seletor de Mapa / Bioma */}
          <div className="flex items-center gap-1.5 bg-slate-950/90 border border-indigo-500/60 rounded-lg px-2.5 py-1 shadow-inner">
            <label htmlFor="fullscreen-map-select" className="text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer">
              <span>🗺️</span>
              <span>Mapa:</span>
            </label>
            <select
              id="fullscreen-map-select"
              value={biome}
              onChange={(e) => {
                const newBiome = e.target.value as BiomeType;
                if (newBiome !== biome && initNewCombat) {
                  initNewCombat(newBiome, true);
                }
              }}
              className="bg-transparent text-xs font-bold text-amber-300 focus:outline-none cursor-pointer"
              title="Escolher Mapa (Bioma)"
            >
              <option value="Caverna" className="bg-slate-900 text-slate-100">🏔️ Caverna</option>
              <option value="Masmorra" className="bg-slate-900 text-slate-100">🏰 Masmorra</option>
              <option value="Floresta" className="bg-slate-900 text-slate-100">🌲 Floresta</option>
              <option value="Pântano" className="bg-slate-900 text-slate-100">🐊 Pântano</option>
              <option value="Deserto" className="bg-slate-900 text-slate-100">🏜️ Deserto</option>
              <option value="Arena de Testes" className="bg-slate-900 text-slate-100">🧪 Arena de Testes</option>
            </select>
          </div>

          <div className="h-5 w-[1px] bg-slate-700/80" />

          {/* Seletor de Dia / Noite */}
          <div
            className={`flex items-center gap-1.5 bg-slate-950/90 border border-indigo-500/60 rounded-lg px-2.5 py-1 shadow-inner transition ${
              isIndoor ? 'opacity-65' : ''
            }`}
            title={
              isIndoor
                ? 'Cavernas e Masmorras são sempre escuras (iluminação fixa)'
                : 'Alternar entre Dia (Claro) e Noite (Escuro)'
            }
          >
            <label
              htmlFor="fullscreen-daynight-select"
              className="text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer"
            >
              <span>{timePhaseIcon}</span>
              <span>Luz:</span>
            </label>
            <select
              id="fullscreen-daynight-select"
              value={isNight ? 'night' : 'day'}
              disabled={isIndoor}
              onChange={(e) => {
                if (!isIndoor) {
                  const isTargetNight = e.target.value === 'night';
                  setIsNight(isTargetNight);
                }
              }}
              className={`bg-transparent text-xs font-bold ${timePhaseColor} cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
              title={
                isIndoor
                  ? 'Cavernas e Masmorras são sempre escuras'
                  : `Fase atual: ${timePhaseLabel} (${timeFormatted})`
              }
            >
              <option value="day" className="bg-slate-900 text-amber-300">
                ☀️ Dia / Amanhecer
              </option>
              <option value="night" className="bg-slate-900 text-indigo-300">
                🌙 Noite / Entardecer
              </option>
            </select>
          </div>

          <div className="h-5 w-[1px] bg-slate-700/80" />

          {/* Relógio / Contador de Horas e Turnos de Luz em Tela Cheia */}
          <div
            className="flex items-center gap-1.5 bg-slate-950/90 border border-amber-500/50 rounded-lg px-2.5 py-1 shadow-inner text-xs font-bold text-amber-300"
            title={`Hora Proporcional: ${timeFormatted} • Fase: ${timePhaseLabel} (${safePhaseTurn + 1}/200r) • Total: ${safeTotalTurns} turnos`}
          >
            <span>🕒</span>
            <span className="text-white">{timeFormatted}</span>
            <span className="text-slate-500">•</span>
            <span className={timePhaseColor}>
              {timePhaseLabel} ({safePhaseTurn + 1}/200r)
            </span>
          </div>

          <div className="h-5 w-[1px] bg-slate-700/80" />

          {/* Seletor de Clima */}
          <div
            className={`flex items-center gap-1.5 bg-slate-950/90 border ${
              isIndoor ? 'border-slate-700/50' : (WEATHER_CONFIGS[weather]?.badgeBorder || 'border-slate-700')
            } rounded-lg px-2.5 py-1 shadow-inner transition ${isIndoor ? 'opacity-65' : ''}`}
            title={
              isIndoor
                ? 'Cavernas e Masmorras não possuem clima externo'
                : `Clima Atual: ${WEATHER_CONFIGS[weather]?.label || weather} - ${WEATHER_CONFIGS[weather]?.description || ''}`
            }
          >
            <label
              htmlFor="fullscreen-weather-select"
              className="text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer"
            >
              <span>{isIndoor ? '🔒' : (WEATHER_CONFIGS[weather]?.icon || '⛅')}</span>
              <span>Clima:</span>
            </label>
            <select
              id="fullscreen-weather-select"
              value={weather}
              disabled={isIndoor}
              onChange={(e) => {
                if (!isIndoor) setWeather(e.target.value as WeatherType);
              }}
              className={`bg-transparent text-xs font-bold ${WEATHER_CONFIGS[weather]?.color || 'text-amber-300'} cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
              title={
                isIndoor
                  ? 'Clima indisponível em Cavernas e Masmorras'
                  : `Clima Atual: ${WEATHER_CONFIGS[weather]?.label || weather}`
              }
            >
              <option value="clear" className="bg-slate-900 text-amber-300">
                ☀️ Limpo (Normal)
              </option>
              <option value="rain" className="bg-slate-900 text-sky-300" disabled={isDesert}>
                🌧️ Chuva
              </option>
              <option value="snow" className="bg-slate-900 text-cyan-200" disabled={isDesert}>
                ❄️ Neve
              </option>
              <option value="wind" className="bg-slate-900 text-teal-300">
                💨 Vento Forte
              </option>
              <option value="storm" className="bg-slate-900 text-indigo-300" disabled={isDesert}>
                ⛈️ Tempestade
              </option>
              <option value="fog" className="bg-slate-900 text-slate-300" disabled={isDesert}>
                🌫️ Neblina
              </option>
            </select>
          </div>
        </div>
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
