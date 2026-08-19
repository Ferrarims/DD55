import React from 'react';
import { AttackItem } from '../constants';

interface AttacksSectionProps {
  attacks: AttackItem[];
  breathWeaponDetails: any;
  hasMasteryFeature: boolean;
}

export const AttacksSection: React.FC<AttacksSectionProps> = ({
  attacks,
  breathWeaponDetails,
  hasMasteryFeature,
}) => {
  return (
    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between col-span-1 lg:col-span-2">
      <div>
        <div className="border-b border-slate-800 pb-2 mb-3">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <span>⚔️</span> Ataques e Armas
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Armas equipadas, bônus de ataque e rolagens de dano para o combate.
          </p>
        </div>
        {attacks.length > 0 || breathWeaponDetails ? (
          <div className="space-y-2">
            {/* Ação Especial: Baforada (Draconato) */}
            {breathWeaponDetails && (
              <div className="bg-gradient-to-r from-amber-900/40 to-slate-900 border border-amber-500/30 rounded-lg p-3 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-amber-100 flex items-center gap-2">
                      <span className="text-lg">🔥</span> Arma de Sopro (Baforada)
                    </div>
                    <div className="text-xs text-amber-400/80">
                      {breathWeaponDetails.damageType} • CD {breathWeaponDetails.dc} (DEX) [8 + PB (+
                      {breathWeaponDetails.pb}) + CON (
                      {breathWeaponDetails.conMod >= 0
                        ? `+${breathWeaponDetails.conMod}`
                        : breathWeaponDetails.conMod}
                      )] • {breathWeaponDetails.pb} Usos/Desc. Longo
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Área: Cone de 4,5m (15ft) ou Linha de 9m (30ft)
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className="bg-amber-600 text-slate-950 font-black px-2.5 py-1 rounded text-xs shadow">
                      Dano: {breathWeaponDetails.damage}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {attacks.map((atk, i) => (
              <div
                key={atk.id || `${atk.name}-${i}`}
                className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2"
              >
                <div>
                  <div className="font-bold text-slate-100">{atk.name}</div>
                  <div className="text-xs text-slate-400">
                    {atk.damage_type && <span>Tipo: {atk.damage_type} • </span>}
                    {atk.range && <span>Alcance: {atk.range} • </span>}
                    {hasMasteryFeature && atk.mastery && (
                      <span className="text-amber-400 font-semibold">Domínio: {atk.mastery}</span>
                    )}
                  </div>
                  {atk.properties && (
                    <div className="text-[11px] text-slate-500 italic">{atk.properties}</div>
                  )}
                </div>
                <div className="flex gap-2 items-center text-right">
                  <span className="bg-slate-800 border border-slate-700 text-amber-400 font-bold px-2 py-1 rounded text-xs">
                    Bônus: {atk.attack_bonus >= 0 ? `+${atk.attack_bonus}` : atk.attack_bonus}
                  </span>
                  <span className="bg-amber-600 text-slate-950 font-black px-2.5 py-1 rounded text-xs shadow">
                    Dano: {atk.damage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Nenhum ataque cadastrado para este personagem.</p>
        )}
      </div>
    </div>
  );
};
