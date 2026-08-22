import React from 'react';

export const OverviewSection: React.FC<{
  character: any;
  xpInfo: any;
  pb: number;
  showXpManager: boolean;
  setShowXpManager: (val: boolean) => void;
  handleModifyXp: (amount: number, reset?: boolean) => void;
  customXpInput: string;
  setCustomXpInput: (val: string) => void;
  getMod: (val: number) => number;
  icon: React.ReactNode;
}> = ({
  character,
  xpInfo,
  pb,
  showXpManager,
  setShowXpManager,
  handleModifyXp,
  customXpInput,
  setCustomXpInput,
  getMod,
  icon,
}) => {
  return (
    <div className="bg-slate-950 p-6 rounded-xl border border-amber-500/30 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
      <div className="text-6xl bg-slate-900 p-4 rounded-2xl border border-slate-700 shadow-inner">
        {icon}
      </div>
      <div className="flex-1 text-center md:text-left space-y-1">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          <h1 className="text-3xl font-black text-amber-500" style={{ fontFamily: 'Georgia, serif' }}>
            {character.name || 'Sem Nome'}
          </h1>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-2.5 py-1 rounded-full font-bold">
            Nível {character.level || 1}
          </span>
        </div>
        <p className="text-slate-300 text-sm font-semibold">
          {character.race || 'Raça'} {character.draconic_ancestry && <span className="text-amber-500/80">({character.draconic_ancestry})</span>}{character.giant_ancestry && <span className="text-amber-500/80">({character.giant_ancestry})</span>} • {character.class_name || 'Classe'} • Antecedente: {character.background || 'Nenhum'}
        </p>
        <p className="text-slate-400 text-xs">
          Alinhamento: <span className="text-slate-200 font-medium">{character.alignment || 'Neutro'}</span>
        </p>

        {/* Barra de Experiência (XP) do Livro */}
        <div className="pt-2 max-w-md">
          <div className="flex justify-between items-center text-[11px] mb-1">
            <span className="text-amber-400 font-bold flex items-center gap-1">
              ⭐ Experiência: {character.xp || 0} XP
            </span>
            <span className="text-slate-400 font-semibold">
              Próximo Nível: {xpInfo.nextLevelXp} XP ({xpInfo.percent}%)
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2.5 rounded-full border border-amber-500/30 overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${xpInfo.percent}%` }}
            />
          </div>

          {/* Botão Temporário para Gerenciar XP (Subida / Regressão) */}
          <div className="pt-2.5">
            <button
              onClick={() => setShowXpManager(!showXpManager)}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 shadow"
            >
              <span>⭐</span> {showXpManager ? 'Fechar Gerenciador de XP' : 'Gerenciar XP (Adicionar / Remover)'}
            </button>

            {showXpManager && (
              <div className="mt-2 p-2.5 bg-slate-900 border border-amber-500/40 rounded-xl space-y-2 max-w-sm shadow-xl">
                <div className="text-[11px] font-bold text-amber-400 flex items-center justify-between">
                  <span>⚡ Ajuste de XP (Nível: {character.level || 1})</span>
                  <span className="text-slate-400 font-normal">XP: {character.xp || 0}</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <button onClick={() => handleModifyXp(300)} className="px-1.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded text-[10px] font-bold transition">+300</button>
                  <button onClick={() => handleModifyXp(1000)} className="px-1.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded text-[10px] font-bold transition">+1.000</button>
                  <button onClick={() => handleModifyXp(5000)} className="px-1.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded text-[10px] font-bold transition">+5.000</button>
                  <button onClick={() => handleModifyXp(15000)} className="px-1.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded text-[10px] font-bold transition">+15k</button>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  <button onClick={() => handleModifyXp(-300)} className="px-1.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded text-[10px] font-bold transition">-300</button>
                  <button onClick={() => handleModifyXp(-1000)} className="px-1.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded text-[10px] font-bold transition">-1.000</button>
                  <button onClick={() => handleModifyXp(-5000)} className="px-1.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded text-[10px] font-bold transition">-5.000</button>
                  <button onClick={() => handleModifyXp(0, true)} className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded text-[10px] font-bold transition">Zerar</button>
                </div>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <input
                    type="number"
                    value={customXpInput}
                    onChange={(e) => setCustomXpInput(e.target.value)}
                    placeholder="XP exato..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => {
                      const val = parseInt(customXpInput, 10);
                      if (!isNaN(val)) {
                        handleModifyXp(val, true);
                        setCustomXpInput('');
                      }
                    }}
                    className="px-2.5 py-0.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded text-[11px] transition"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bônus de Proficiência & Percepção Passiva */}
      <div className="flex gap-4 text-center">
        <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg">
          <div className="text-xs text-slate-400 uppercase font-bold">Proficiência</div>
          <div className="text-xl font-extrabold text-amber-400">+{pb}</div>
        </div>
        <div className="bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg">
          <div className="text-xs text-slate-400 uppercase font-bold">Percepção Passiva</div>
          <div className="text-xl font-extrabold text-amber-400">
            {(() => {
              const wisMod = getMod(character.wisdom || character.wis || 10);
              const skills = character.skillProficiencies || character.skill_proficiencies || character.skills || [];
              const hasPerception = skills.some((s: string) => String(s).toLowerCase().includes('percep'));
              return 10 + wisMod + (hasPerception ? pb : 0);
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};
