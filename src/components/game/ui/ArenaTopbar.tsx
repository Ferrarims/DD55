import React from 'react';
import { useGameContext } from '../context/GameContext';
import { BiomeType, WeatherType } from '../../../game/types';
import { WEATHER_CONFIGS } from '../../../game/weatherEffects';


export const ArenaTopbar: React.FC = () => {
  const {
    handleExitGame,
    setShowSettingsModal,
    biome,
    setIsNight,
    isNight,
    weather,
    setWeather,
    victoryData,
    isIndoor,
    timePhaseIcon,
    timePhaseColor,
    timePhaseLabel,
    timeFormatted,
    totalGameTurns,
    phaseTurn,
    isDesert,
    mapStreak,
    currentTurnRound,
    activeEntity,
    setShowLootModal,
    handleFinishExploration,
    entities,
    initNewCombat,
  } = useGameContext();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-2.5 md:p-3 rounded-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={handleExitGame}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-lg border border-slate-700 transition text-xs flex items-center gap-1.5"
              >
                <span>← Sair</span>
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border border-slate-700 transition text-xs flex items-center gap-1.5"
                title="Configurações do Jogo"
              >
                <span>⚙️ Config</span>
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-base md:text-lg font-black text-amber-400" style={{ fontFamily: 'Georgia, serif' }}>
                    Arena D&D 5.5e
                  </h1>
    
                  {/* Caixas de Seleção Diretas para Mapa (Bioma), Horário (Dia/Noite) e Clima Atmosférico */}
                  <div className="flex items-center gap-1.5 bg-slate-950 border border-indigo-500/60 rounded-lg px-2 py-1 shadow-sm">
                    <label htmlFor="header-select-map" className="text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer">
                      <span>🗺️</span>
                      <span className="hidden sm:inline">Mapa:</span>
                    </label>
                    <select
                      id="header-select-map"
                      value={biome}
                      onChange={(e) => {
                        const newBiome = e.target.value as BiomeType;
                        if (newBiome !== biome) {
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
    
                  {/* Seletor de Dia / Noite */}
                  <div
                    className={`flex items-center gap-1.5 bg-slate-950 border border-indigo-500/60 rounded-lg px-2 py-1 shadow-sm transition ${isIndoor ? 'opacity-65' : ''}`}
                    title={isIndoor ? "Cavernas e Masmorras são sempre escuras (iluminação fixa)" : "Alternar entre Dia (Claro) e Noite (Escuro)"}
                  >
                    <label
                      htmlFor="header-select-daynight"
                      className="text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{timePhaseIcon}</span>
                      <span className="hidden sm:inline">Luz:</span>
                    </label>
                    <select
                      id="header-select-daynight"
                      value={isNight ? 'night' : 'day'}
                      disabled={isIndoor}
                      onChange={(e) => {
                        if (!isIndoor) {
                          const isTargetNight = e.target.value === 'night';
                          setIsNight(isTargetNight);
                        }
                      }}
                      className={`bg-transparent text-xs font-bold ${
                        timePhaseColor
                      } cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={isIndoor ? "Cavernas e Masmorras são sempre escuras" : `Fase atual: ${timePhaseLabel} (${timeFormatted})`}
                    >
                      <option value="day" className="bg-slate-900 text-amber-300">☀️ Dia / Amanhecer</option>
                      <option value="night" className="bg-slate-900 text-indigo-300">🌙 Noite / Entardecer</option>
                    </select>
                  </div>
    
                  {/* Relógio / Contador de Horas e Turnos de Luz */}
                  <div
                    className="flex items-center gap-1.5 bg-slate-950 border border-amber-500/50 rounded-lg px-2.5 py-1 shadow-sm text-xs font-bold text-amber-300"
                    title={`Hora Proporcional: ${timeFormatted} • Fase: ${timePhaseLabel} (${phaseTurn + 1}/100r) • Total: ${totalGameTurns} turnos`}
                  >
                    <span>🕒</span>
                    <span className="text-white">{timeFormatted}</span>
                    <span className="text-slate-500">•</span>
                    <span className={timePhaseColor}>
                      {timePhaseLabel} ({phaseTurn + 1}/100r)
                    </span>
                  </div>
    
                  {/* Seletor de Clima */}
                  <div
                    className={`flex items-center gap-1.5 bg-slate-950 border ${isIndoor ? 'border-slate-700/50' : WEATHER_CONFIGS[weather].badgeBorder} rounded-lg px-2 py-1 shadow-sm transition ${isIndoor ? 'opacity-65' : ''}`}
                    title={isIndoor ? "Cavernas e Masmorras não possuem clima externo" : `Clima Atual: ${WEATHER_CONFIGS[weather].label} - ${WEATHER_CONFIGS[weather].description}`}
                  >
                    <label
                      htmlFor="header-select-weather"
                      className="text-xs font-bold text-slate-400 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isIndoor ? '🔒' : WEATHER_CONFIGS[weather].icon}</span>
                      <span className="hidden sm:inline">Clima:</span>
                    </label>
                    <select
                      id="header-select-weather"
                      value={weather}
                      disabled={isIndoor}
                      onChange={(e) => {
                        if (!isIndoor) setWeather(e.target.value as WeatherType);
                      }}
                      className={`bg-transparent text-xs font-bold ${WEATHER_CONFIGS[weather].color} cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={isIndoor ? "Clima indisponível em Cavernas e Masmorras" : `Clima Atual: ${WEATHER_CONFIGS[weather].label}`}
                    >
                      <option value="clear" className="bg-slate-900 text-amber-300">☀️ Limpo (Normal)</option>
                      <option value="rain" className="bg-slate-900 text-sky-300" disabled={isDesert}>🌧️ Chuva</option>
                      <option value="snow" className="bg-slate-900 text-cyan-200" disabled={isDesert}>❄️ Neve</option>
                      <option value="wind" className="bg-slate-900 text-teal-300">💨 Vento Forte</option>
                      <option value="storm" className="bg-slate-900 text-indigo-300" disabled={isDesert}>⛈️ Tempestade</option>
                      <option value="fog" className="bg-slate-900 text-slate-300" disabled={isDesert}>🌫️ Neblina</option>
                    </select>
                  </div>
    
                  {mapStreak >= 2 ? (
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded-full text-[10px] font-black animate-pulse flex items-center gap-1">
                      🔥 Mapa #{mapStreak} ({mapStreak}x)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-[10px] font-semibold">
                      🗺️ Mapa #{mapStreak}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                  Rodada <strong className="text-white">{currentTurnRound}</strong> • Turno:{' '}
                  <strong className={activeEntity?.type === 'hero' ? 'text-amber-400' : 'text-red-400'}>
                    {activeEntity?.name}
                  </strong>
                  {activeEntity?.hasDarkvision && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo-950/50 text-indigo-300 border border-indigo-500/30 text-[9px] font-bold">
                      👁️ Visão no Escuro ({activeEntity.darkvisionRange}m)
                    </span>
                  )}
                </p>
              </div>
            </div>
    
            {/* Seleção de Biomas, Recompensas Acumuladas e Reiniciar Batalha */}
            <div className="flex flex-wrap items-center gap-2">
              {victoryData && (victoryData.totalXp > 0 || victoryData.loot.length > 0) && (
                <button
                  onClick={() => setShowLootModal(true)}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-emerald-500/30 text-amber-300 border border-amber-500/50 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition animate-pulse"
                  title="Ver tesouros e XP acumulados"
                >
                  <span>🎁</span>
                  <span>Premiação {mapStreak > 1 ? `x${mapStreak}` : '1x'}:</span>
                  <span className="text-emerald-400 font-black">+{victoryData.totalXp} XP</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-amber-300 font-black">{victoryData.loot.length} item(ns)</span>
                </button>
              )}
    
              <button
                onClick={handleFinishExploration}
                disabled={entities.some(e => e.type === 'monster' && !e.isDead)}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-lg transition shadow flex items-center gap-1.5 border border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                title={entities.some(e => e.type === 'monster' && !e.isDead) ? "Derrote todos os monstros para finalizar" : "Finalizar exploração do mapa atual"}
              >
                <span>🚪</span>
                <span>Finalizar Mapa</span>
              </button>
            </div>
          </div>
  );
};
