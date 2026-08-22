import React from 'react';

interface MonsterTraitsAndActionsProps {
  entity: any;
}

export const MonsterTraitsAndActions: React.FC<MonsterTraitsAndActionsProps> = ({ entity }) => {
  return (
    <>
      {/* Sentidos, Resistências e Imunidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sentidos e Perícias */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <h5 className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider border-b border-slate-800 pb-1">
            👁️ Sentidos e Perícias
          </h5>
          <div className="text-[11px] text-slate-300 leading-relaxed space-y-1">
            <div>
              <strong className="text-slate-400">Senses:</strong> {entity.senses || 'Percepção Passiva 10'}
            </div>
            {entity.skills && entity.skills.length > 0 && (
              <div>
                <strong className="text-slate-400">Skills:</strong> {entity.skills.join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Resistências e Imunidades */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <h5 className="text-[10px] font-bold text-rose-400 uppercase tracking-wider border-b border-slate-800 pb-1">
            🛡️ Resistências e Vulnerabilidades
          </h5>
          <div className="text-[11px] text-slate-300 space-y-1.5">
            {entity.resistances && entity.resistances.length > 0 && (
              <div>
                <strong className="text-slate-400">Resistências:</strong> <span className="text-emerald-400 font-semibold">{entity.resistances.join(', ')}</span>
              </div>
            )}
            {entity.vulnerabilities && entity.vulnerabilities.length > 0 && (
              <div>
                <strong className="text-slate-400">Vulnerabilidades:</strong> <span className="text-red-400 font-semibold">{entity.vulnerabilities.join(', ')}</span>
              </div>
            )}
            {entity.immunities && entity.immunities.length > 0 && (
              <div>
                <strong className="text-slate-400">Imunidades a Dano:</strong> <span className="text-teal-400 font-semibold">{entity.immunities.join(', ')}</span>
              </div>
            )}
            {entity.condition_immunities && entity.condition_immunities.length > 0 && (
              <div>
                <strong className="text-slate-400">Imunidades a Condições:</strong> <span className="text-purple-400 font-semibold">{entity.condition_immunities.join(', ')}</span>
              </div>
            )}
            {(!entity.resistances?.length && !entity.vulnerabilities?.length && !entity.immunities?.length && !entity.condition_immunities?.length) && (
              <div className="text-slate-500 italic">Nenhuma resistência, imunidade ou vulnerabilidade especial listada.</div>
            )}
          </div>
        </div>
      </div>

      {/* Traços / Características do Monstro */}
      {entity.traits && entity.traits.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-black text-amber-400/90 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center gap-1">
            <span>⚡</span> Traços de Combate
          </h4>
          <div className="space-y-2">
            {entity.traits.map((trait: any, idx: number) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                <div className="font-bold text-xs text-slate-200">{trait.name}</div>
                <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{trait.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações (Ações de Combate / Ataques) */}
      {entity.actions && entity.actions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-black text-amber-400/90 uppercase tracking-wider border-b border-slate-800 pb-1 flex items-center gap-1">
            <span>⚔️</span> Ações do Turno
          </h4>
          <div className="space-y-2">
            {entity.actions.map((act: any, idx: number) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <span className="font-bold text-xs text-amber-300">{act.name}</span>
                  <div className="flex gap-1.5">
                    {act.to_hit !== undefined && (
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-md text-amber-400 font-extrabold border border-amber-500/25">
                        Atk: +{act.to_hit}
                      </span>
                    )}
                    {act.damage && (
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-md text-emerald-400 font-black border border-emerald-500/25">
                        Dano: {act.damage}
                      </span>
                    )}
                  </div>
                </div>
                {act.text && (
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">{act.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outras Ações (Bônus, Reações, Lendárias) */}
      {entity.bonus_actions && entity.bonus_actions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-black text-amber-400/90 uppercase tracking-wider border-b border-slate-800 pb-1">
            ⚡ Ações Bônus
          </h4>
          <div className="space-y-2">
            {entity.bonus_actions.map((act: any, idx: number) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                <span className="font-bold text-xs text-slate-200">{act.name}</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{act.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {entity.reactions && entity.reactions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-black text-amber-400/90 uppercase tracking-wider border-b border-slate-800 pb-1">
            ↩️ Reações
          </h4>
          <div className="space-y-2">
            {entity.reactions.map((act: any, idx: number) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                <span className="font-bold text-xs text-slate-200">{act.name}</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{act.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {entity.legendary_actions && entity.legendary_actions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-black text-amber-400/90 uppercase tracking-wider border-b border-slate-800 pb-1">
            👑 Ações Lendárias
          </h4>
          <div className="space-y-2">
            {entity.legendary_actions.map((act: any, idx: number) => (
              <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                <span className="font-bold text-xs text-slate-200">{act.name}</span>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{act.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
