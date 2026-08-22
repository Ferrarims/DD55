import React from 'react';

interface CombatDifficultyPromptProps {
  pendingCharacter: any;
  selectedDifficulty: 'easy' | 'medium' | 'hard';
  setSelectedDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onBack: () => void;
  onConfirm: () => void;
}

export const CombatDifficultyPrompt: React.FC<CombatDifficultyPromptProps> = ({
  pendingCharacter,
  selectedDifficulty,
  setSelectedDifficulty,
  onBack,
  onConfirm,
}) => {
  return (
    <div className="max-w-2xl mx-auto my-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-2xl animate-fade-in text-center">
      <h3 className="text-2xl font-black text-amber-500 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
        🛡️ Selecione a Dificuldade do Combate
      </h3>
      <p className="text-slate-300 text-sm mb-6">
        Seu personagem <strong className="text-amber-400">{pendingCharacter.name}</strong> (Nível {pendingCharacter.level} • {pendingCharacter.class_name || pendingCharacter.charClass || 'Aventureiro'}) está prestes a entrar na arena.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* FÁCIL */}
        <button
          type="button"
          onClick={() => setSelectedDifficulty('easy')}
          className={`flex flex-col items-center justify-between p-5 rounded-xl border text-center transition-all ${
            selectedDifficulty === 'easy'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500'
              : 'bg-slate-850 border-slate-700 hover:border-slate-600'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">🟢</span>
            <h4 className={`font-black text-base ${selectedDifficulty === 'easy' ? 'text-emerald-400' : 'text-slate-200'}`}>
              FÁCIL
            </h4>
            <p className="text-slate-450 text-xs mt-2 leading-relaxed">
              Inimigos com CR reduzido e encontros menores. Ideal para testar habilidades e mecânicas com segurança.
            </p>
          </div>
          <span className={`text-[10px] uppercase tracking-wider font-bold mt-4 px-2 py-0.5 rounded ${
            selectedDifficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
          }`}>
            Treinar &amp; Explorar
          </span>
        </button>

        {/* MÉDIO */}
        <button
          type="button"
          onClick={() => setSelectedDifficulty('medium')}
          className={`flex flex-col items-center justify-between p-5 rounded-xl border text-center transition-all ${
            selectedDifficulty === 'medium'
              ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500'
              : 'bg-slate-850 border-slate-700 hover:border-slate-600'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">🟡</span>
            <h4 className={`font-black text-base ${selectedDifficulty === 'medium' ? 'text-amber-400' : 'text-slate-200'}`}>
              MÉDIO
            </h4>
            <p className="text-slate-450 text-xs mt-2 leading-relaxed">
              A autêntica aventura. Combates equilibrados com perigo estratégico e recompensas ideais.
            </p>
          </div>
          <span className={`text-[10px] uppercase tracking-wider font-bold mt-4 px-2 py-0.5 rounded ${
            selectedDifficulty === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-400'
          }`}>
            Experiência Padrão
          </span>
        </button>

        {/* DIFÍCIL */}
        <button
          type="button"
          onClick={() => setSelectedDifficulty('hard')}
          className={`flex flex-col items-center justify-between p-5 rounded-xl border text-center transition-all ${
            selectedDifficulty === 'hard'
              ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-rose-500'
              : 'bg-slate-850 border-slate-700 hover:border-slate-600'
          }`}
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-2">🔴</span>
            <h4 className={`font-black text-base ${selectedDifficulty === 'hard' ? 'text-rose-400' : 'text-slate-200'}`}>
              DIFÍCIL
            </h4>
            <p className="text-slate-450 text-xs mt-2 leading-relaxed">
              Inimigos brutais e agressivos. Exige domínio de maestrias de arma, magias e recursos máximos para sobreviver.
            </p>
          </div>
          <span className={`text-[10px] uppercase tracking-wider font-bold mt-4 px-2 py-0.5 rounded ${
            selectedDifficulty === 'hard' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700 text-slate-400'
          }`}>
            Glória ou Morte
          </span>
        </button>
      </div>

      <div className="flex gap-4 justify-center">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-xl border border-amber-400 shadow-lg shadow-amber-500/10 transition-all flex items-center gap-2"
        >
          <span>⚔️</span> Entrar em Combate
        </button>
      </div>
    </div>
  );
};
