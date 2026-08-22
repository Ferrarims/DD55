import React from 'react';
import { BiomeType, WeatherType } from '../../../../game/types';
import { WEATHER_CONFIGS } from '../../../../game/weatherEffects';

interface FullscreenMapEnvironmentRowProps {
  biome: BiomeType;
  initNewCombat?: (biome: BiomeType, forceNew?: boolean) => void;
  isIndoor?: boolean;
  isNight: boolean;
  setIsNight: (val: boolean) => void;
  timePhaseIcon?: string;
  timePhaseLabel?: string;
  timePhaseColor?: string;
  timeFormatted?: string;
  safePhaseTurn: number;
  safeTotalTurns: number;
  weather: WeatherType;
  setWeather: (w: WeatherType) => void;
  isDesert?: boolean;
}

export const FullscreenMapEnvironmentRow: React.FC<FullscreenMapEnvironmentRowProps> = ({
  biome,
  initNewCombat,
  isIndoor = false,
  isNight,
  setIsNight,
  timePhaseIcon = '☀️',
  timePhaseLabel = 'Dia',
  timePhaseColor = 'text-amber-300',
  timeFormatted = '12:00',
  safePhaseTurn,
  safeTotalTurns,
  weather,
  setWeather,
  isDesert = false,
}) => {
  return (
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
          <option value="Arena de Testes" className="bg-slate-900 text-slate-100">🧪 Arena de Testes (Sem Monstros)</option>
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

      {/* Relógio / Contador de Horas e Turnos */}
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
  );
};
