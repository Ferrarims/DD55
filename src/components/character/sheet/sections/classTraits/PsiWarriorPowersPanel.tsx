import React from 'react';
import { FIGHTER_SUBCLASSES } from '../../../../../lib/api/references';

interface PsiWarriorPowersPanelProps {
  selectedSubclass: string;
  handleUsePsiPower?: (power: string, desc: string) => void;
}

export const PsiWarriorPowersPanel: React.FC<PsiWarriorPowersPanelProps> = ({
  selectedSubclass,
  handleUsePsiPower,
}) => {
  const isPsiWarrior = selectedSubclass === 'PsiWarrior' ||
    (FIGHTER_SUBCLASSES[selectedSubclass]?.name || '').includes('Psíquico');

  if (!isPsiWarrior) return null;

  return (
    <div className="bg-slate-900 border border-purple-500/30 p-4 rounded-xl space-y-3 mt-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-purple-400 text-lg">🧠</span>
          <div>
            <h4 className="font-black text-xs text-purple-300 uppercase tracking-wider">
              Poderes Psiônicos (Combatente Psíquico)
            </h4>
            <p className="text-[11px] text-slate-400">
              Utilize a energia psiônica para potencializar seus golpes, mover aliados e absorver dano.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between gap-2">
          <div>
            <span className="font-bold text-xs text-purple-200">Golpe Psiônico</span>
            <p className="text-[10px] text-slate-400 mt-1">
              Causa dano Energético adicional igual ao Dado Psiônico + mod. Inteligência.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              handleUsePsiPower?.(
                'Golpe Psiônico',
                'Infunde seu ataque com dano Energético psíquico extra!'
              )
            }
            className="w-full py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/40 font-bold text-[10px] rounded transition active:scale-95"
          >
            🧠 Aplicar Golpe Psiônico
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between gap-2">
          <div>
            <span className="font-bold text-xs text-purple-200">Vínculo Protetivo</span>
            <p className="text-[10px] text-slate-400 mt-1">
              Reação para reduzir o dano sofrido por você ou aliado a até 9m.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              handleUsePsiPower?.(
                'Vínculo Protetivo',
                'Ergue uma barreira de força psíquica reduzindo o dano sofrido!'
              )
            }
            className="w-full py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/40 font-bold text-[10px] rounded transition active:scale-95"
          >
            🛡️ Ativar Vínculo Protetivo
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between gap-2">
          <div>
            <span className="font-bold text-xs text-purple-200">Movimento Telecinético</span>
            <p className="text-[10px] text-slate-400 mt-1">
              Move telecineticamente uma criatura voluntária ou objeto a até 9m.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              handleUsePsiPower?.(
                'Movimento Telecinético',
                'Mexe telecineticamente um alvo até 9 metros!'
              )
            }
            className="w-full py-1 bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-500/40 font-bold text-[10px] rounded transition active:scale-95"
          >
            ✨ Mover Telecineticamente
          </button>
        </div>
      </div>
    </div>
  );
};
