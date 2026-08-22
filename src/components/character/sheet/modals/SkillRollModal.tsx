import React, { useState } from 'react';
import { SkillReferenceItem } from '../../../../lib/api/references';
import { rollSkillCheck, SkillRollResult } from '../../../../game/skills/skillsEngine';

interface SkillRollModalProps {
  skill: SkillReferenceItem | null;
  character: any;
  onClose: () => void;
}

export const SkillRollModal: React.FC<SkillRollModalProps> = ({
  skill,
  character,
  onClose,
}) => {
  if (!skill) return null;

  const [advantage, setAdvantage] = useState<boolean>(false);
  const [disadvantage, setDisadvantage] = useState<boolean>(false);
  const [dcInput, setDcInput] = useState<string>('');
  const [lastResult, setLastResult] = useState<SkillRollResult | null>(null);
  const [isRolling, setIsRolling] = useState<boolean>(false);

  const handleRoll = () => {
    setIsRolling(true);
    setTimeout(() => {
      const dcVal = dcInput.trim() !== '' ? parseInt(dcInput, 10) : undefined;
      const res = rollSkillCheck(character, skill.id, {
        advantage,
        disadvantage,
        dc: !isNaN(dcVal as number) ? dcVal : undefined,
      });
      setLastResult(res);
      setIsRolling(false);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 p-4 border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 bg-slate-800 border border-amber-500/30 rounded-xl shadow-inner">
              {skill.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-amber-400" style={{ fontFamily: 'Georgia, serif' }}>
                  {skill.namePt}
                </h3>
                <span className="text-xs text-slate-400 font-medium">({skill.nameEn})</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-md inline-block mt-0.5">
                Atributo: {skill.abilityNamePt} ({skill.ability.toUpperCase()})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center font-bold border border-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Corpo */}
        <div className="p-5 space-y-4 text-sm max-h-[75vh] overflow-y-auto custom-scrollbar">
          <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            {skill.description}
          </p>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">Exemplos de Uso:</span>
            <p className="text-slate-400 text-xs italic">{skill.exampleUses}</p>
            {skill.inGameUtility && (
              <div className="pt-2 border-t border-slate-800 mt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block">Efeito no Jogo:</span>
                <p className="text-slate-300 text-xs">{skill.inGameUtility}</p>
              </div>
            )}
          </div>

          {/* Configurações de Rolagem */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAdvantage(!advantage);
                if (!advantage) setDisadvantage(false);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                advantage
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span>🎲</span> Vantagem (2d20)
            </button>

            <button
              type="button"
              onClick={() => {
                setDisadvantage(!disadvantage);
                if (!disadvantage) setAdvantage(false);
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition flex items-center justify-center gap-1.5 ${
                disadvantage
                  ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span>🎲</span> Desvantagem (2d20)
            </button>

            <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5">
              <input
                type="number"
                value={dcInput}
                onChange={e => setDcInput(e.target.value)}
                placeholder="CD Alvo (Ex: 15)"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-center"
              />
            </div>
          </div>

          {/* Resultado da Rolagem */}
          {lastResult && (
            <div
              className={`p-4 rounded-xl border animate-in zoom-in-95 duration-200 ${
                lastResult.passed === true
                  ? 'bg-emerald-950/30 border-emerald-500/50'
                  : lastResult.passed === false
                  ? 'bg-rose-950/30 border-rose-500/50'
                  : 'bg-slate-950 border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Resultado da Rolagem
                </span>
                {lastResult.dc !== undefined && (
                  <span
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                      lastResult.passed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {lastResult.passed ? '✓ SUCESSO' : '✕ FALHA'} (CD {lastResult.dc})
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center gap-4 my-2">
                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">d20</div>
                  <div
                    className={`text-2xl font-black ${
                      lastResult.isCrit20
                        ? 'text-amber-400 animate-bounce'
                        : lastResult.isCrit1
                        ? 'text-rose-500'
                        : 'text-slate-200'
                    }`}
                  >
                    {lastResult.d20}
                  </div>
                </div>

                <span className="text-slate-500 text-lg font-bold">+</span>

                <div className="text-center">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Mod</div>
                  <div className="text-xl font-bold text-amber-300">
                    {lastResult.abilityMod >= 0 ? `+${lastResult.abilityMod}` : lastResult.abilityMod}
                  </div>
                </div>

                {lastResult.isProficient && (
                  <>
                    <span className="text-slate-500 text-lg font-bold">+</span>
                    <div className="text-center">
                      <div className="text-[10px] text-sky-400 font-bold uppercase">Prof</div>
                      <div className="text-xl font-bold text-sky-300">+{lastResult.pbBonus}</div>
                    </div>
                  </>
                )}

                {lastResult.exhaustionPenalty > 0 && (
                  <>
                    <span className="text-slate-500 text-lg font-bold">-</span>
                    <div className="text-center">
                      <div className="text-[10px] text-rose-400 font-bold uppercase">Exaustão</div>
                      <div className="text-xl font-bold text-rose-400">-{lastResult.exhaustionPenalty}</div>
                    </div>
                  </>
                )}

                <span className="text-slate-500 text-xl font-black">=</span>

                <div className="text-center">
                  <div className="text-[10px] text-amber-400 font-bold uppercase">Total</div>
                  <div className="text-3xl font-black text-amber-400">{lastResult.total}</div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 text-center font-mono">
                {lastResult.logText}
              </div>
            </div>
          )}
        </div>

        {/* Botão de Rolagem */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs border border-slate-700 transition"
          >
            Fechar
          </button>
          <button
            type="button"
            disabled={isRolling}
            onClick={handleRoll}
            className="px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
          >
            <span>🎲</span> {isRolling ? 'Rolando...' : 'Rolar Teste de d20'}
          </button>
        </div>
      </div>
    </div>
  );
};
