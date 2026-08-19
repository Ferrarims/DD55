import React from 'react';
import { useGameContext } from '../../context/GameContext';

export const HeroVictoryDefeatScreen: React.FC = () => {
  const {
    isHeroDead,
    victoryData,
    mapStreak,
    isSaving,
    initNewCombat,
    handleExitGame,
    handleClaimLootAndSave,
    setShowVictorySummaryModal
  } = useGameContext();

  return (
    <>
      {/* TELA DE DERROTA / HERÓI MORTO */}
      {isHeroDead ? (
        <div className="bg-gradient-to-br from-slate-900 via-rose-950/70 to-slate-950 border border-rose-500/60 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300 shadow-2xl">
          <div className="flex items-center gap-3 text-rose-400 border-b border-rose-900/50 pb-2">
            <span className="text-3xl">💀</span>
            <div>
              <h2 className="text-base font-black text-rose-200" style={{ fontFamily: 'Georgia, serif' }}>
                Seu Herói Tombou em Batalha!
              </h2>
              <p className="text-[11px] text-rose-300/80">
                Sua vida chegou a 0 PV nesta arena.
              </p>
            </div>
          </div>

          <div className="bg-slate-950/90 p-3 rounded-xl border border-rose-900/50 space-y-2">
            <div className="text-[11px] font-bold text-rose-300 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>Perda de Progresso Não Salvo:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Como o seu personagem foi derrotado, <strong className="text-rose-400 font-bold">todos os itens e pontos de experiência (XP)</strong> obtidos durante este combate foram <strong>perdidos</strong>.
            </p>

            {victoryData && (victoryData.totalXp > 0 || (victoryData.loot?.length || 0) > 0) && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="bg-rose-950/40 p-2 rounded-lg border border-rose-800/40 text-center">
                  <span className="text-[10px] text-slate-400 block">XP Perdido</span>
                  <span className="text-xs font-black text-rose-400">- {victoryData.totalXp} XP</span>
                </div>
                <div className="bg-rose-950/40 p-2 rounded-lg border border-rose-800/40 text-center">
                  <span className="text-[10px] text-slate-400 block">Itens Perdidos</span>
                  <span className="text-xs font-black text-rose-400">{victoryData.loot?.length || 0} item(ns)</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col w-full gap-2 pt-1">
            <button
              onClick={() => initNewCombat()}
              className="w-full py-2.5 px-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xl transition flex items-center justify-center gap-1.5 border border-amber-300 cursor-pointer"
            >
              <span>⚔️ Voltar a Entrar na Batalha (Nova Tentativa)</span>
            </button>

            <button
              onClick={handleExitGame}
              className="w-full py-2.5 px-3 bg-rose-950/80 hover:bg-rose-900 text-rose-200 font-black text-xs rounded-xl transition border border-rose-500/50 flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>🚪 Finalizar Mapa (Sair sem Recompensas)</span>
            </button>
          </div>
        </div>
      ) : (
        /* TELA DE VITÓRIA & LOOT */
        victoryData && (
          <div className="bg-gradient-to-br from-slate-900 to-amber-950/40 border border-amber-500/50 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-amber-900/40 pb-2">
              <div className="flex items-center gap-2.5 text-amber-400">
                <span className="text-2xl">🏆</span>
                <div>
                  <h2 className="text-base font-black" style={{ fontFamily: 'Georgia, serif' }}>
                    Vitória Gloriosa! (Mapa #{mapStreak})
                  </h2>
                  <p className="text-[11px] text-slate-300">
                    Área limpa! XP e tesouros preservados. <br/><strong>Continue andando pelo mapa</strong> para encontrar mais inimigos, ou salve os tesouros na sua Ficha!
                  </p>
                </div>
              </div>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded-lg text-[10px] font-black animate-pulse hidden sm:inline-block">
                🔥 Próxima Arena: Bônus {mapStreak + 1}x Ativo!
              </span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2.5">
              {/* Cards de Resumo Rápidos */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-900/90 p-2 rounded-lg border border-emerald-500/30 text-center">
                  <span className="text-[10px] text-emerald-400 font-bold block uppercase">XP Ganho</span>
                  <span className="text-xs font-black text-emerald-300">+{victoryData.totalXp}</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-rose-500/30 text-center">
                  <span className="text-[10px] text-rose-400 font-bold block uppercase">Dano Total</span>
                  <span className="text-xs font-black text-rose-300">{victoryData.totalDamageDealt || 0}</span>
                </div>
                <div className="bg-slate-900/90 p-2 rounded-lg border border-purple-500/30 text-center">
                  <span className="text-[10px] text-purple-400 font-bold block uppercase">Derrotados</span>
                  <span className="text-xs font-black text-purple-300">
                    {Object.values(victoryData.defeatedMonsters || {}).reduce((a: number, b: any) => a + Number(b), 0)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-bold pt-1">
                <span className="text-emerald-400 flex items-center gap-1">
                  ⭐ + {victoryData.totalXp} XP Acumulado
                </span>
                {mapStreak >= 2 && (
                  <span className="text-amber-400 text-[10px]">
                    🔥 (Com multiplicador até {mapStreak}x)
                  </span>
                )}
              </div>

              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                💰 Tesouros Acumulados ({victoryData.loot?.length || 0} itens/moedas):
              </div>
              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
                {victoryData.loot.map((item) => (
                  <div key={item.id} className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <div className="font-bold text-xs text-amber-300">{item.name}</div>
                      <div className="text-[10px] text-slate-400">{item.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col w-full gap-2 pt-1">
              {setShowVictorySummaryModal && (
                <button
                  onClick={() => setShowVictorySummaryModal(true)}
                  className="w-full py-2.5 px-3 bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 font-black text-xs rounded-xl shadow-xl transition flex items-center justify-center gap-1.5 border border-purple-500/50 cursor-pointer"
                  title="Abrir Modal de Resumo de Vitória"
                >
                  <span>📊 Ver Resumo</span>
                </button>
              )}

              <button
                onClick={handleClaimLootAndSave}
                disabled={isSaving}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-xl transition flex items-center justify-center gap-1.5 border border-amber-300 cursor-pointer disabled:opacity-50"
              >
                <span>{isSaving ? 'Salvando...' : '📥 Salvar na Ficha'}</span>
              </button>
            </div>
          </div>
        )
      )}
    </>
  );
};
