import React from 'react';
import { BACKGROUNDS_REFERENCE, FEATS_REFERENCE } from '../../../../lib/api/references';
import { formatEquipmentChoiceDescription } from '../../../../lib/mechanics/equipmentParser';

export const BackgroundSection: React.FC<{
  character: any;
}> = ({ character }) => {
  const bgName = character.background || character.backgrounds?.name;
  if (!bgName) return null;

  const bgKey = Object.keys(BACKGROUNDS_REFERENCE).find(
    k => k.toLowerCase() === String(bgName).trim().toLowerCase()
  ) || String(bgName).trim();

  const bgInfo = BACKGROUNDS_REFERENCE[bgKey];
  const featInfo = bgInfo?.feat ? FEATS_REFERENCE[bgInfo.feat] : null;

  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-4 shadow-xl">
      <div className="border-b border-slate-800/80 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span>📜</span> Antecedente: {bgInfo?.name || bgName}
          </h3>
          <span className="text-[11px] font-medium bg-amber-950/60 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
            Benefícios de Origem
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Perícias, atributos, talentos e equipamentos concedidos pela sua história de origem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Talento de Origem */}
        {bgInfo?.feat && (
          <div className="bg-slate-900/90 border border-amber-500/20 hover:border-amber-500/40 p-3.5 rounded-xl space-y-2 transition flex flex-col justify-between md:col-span-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                  <span className="text-amber-400">✨</span>
                  <span>Talento de Origem: <strong className="text-amber-300">{bgInfo.feat}</strong></span>
                </div>
                <span className="text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded whitespace-nowrap">
                  Talento de Antecedente
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {featInfo?.description || 'Fornece habilidades e bônus especiais do antecedente.'}
              </p>
            </div>
          </div>
        )}

        {/* Atributos Aumentados */}
        {bgInfo?.abilityScores && bgInfo.abilityScores.length > 0 && (
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
              <span className="text-amber-400">💪</span>
              <span>Atributos Aumentados</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {bgInfo.abilityScores.map((attr, idx) => (
                <span key={idx} className="text-[11px] font-semibold bg-amber-950/40 text-amber-200 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                  {attr}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              O antecedente permite distribuir aumentos nesses atributos (+2/+1 ou +1/+1/+1).
            </p>
          </div>
        )}

        {/* Proficiência com Ferramenta */}
        {bgInfo?.toolProficiency && (!character.toolProficiencies || character.toolProficiencies.length === 0) && (
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
              <span className="text-emerald-400">🛠️</span>
              <span>Proficiência com Ferramentas</span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 p-2 rounded-md">
              {bgInfo.toolProficiency}
            </p>
          </div>
        )}

        {/* Equipamento Concedido */}
        {bgInfo?.equipment && (
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2">
            <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
              <span className="text-purple-400">🎒</span>
              <span>Equipamento do Antecedente</span>
            </div>
            <div className="text-[11px] text-slate-300 space-y-1">
              <div><strong className="text-purple-300">Opção A (Itens):</strong> {formatEquipmentChoiceDescription(bgInfo.equipment, 'A')}</div>
              <div><strong className="text-purple-300">Opção B (Ouro):</strong> {formatEquipmentChoiceDescription(bgInfo.equipment, 'B')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
