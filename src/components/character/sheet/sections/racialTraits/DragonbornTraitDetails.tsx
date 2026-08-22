import React from 'react';

interface DragonbornTraitDetailsProps {
  isAncestryTrait: boolean;
  isBreathTrait: boolean;
  isResistanceTrait: boolean;
  isFlightTrait: boolean;
  ancestry: any;
  draconicAncestryName: string | undefined;
  breathWeaponDetails: any;
}

export const DragonbornTraitDetails: React.FC<DragonbornTraitDetailsProps> = ({
  isAncestryTrait,
  isBreathTrait,
  isResistanceTrait,
  isFlightTrait,
  ancestry,
  draconicAncestryName,
  breathWeaponDetails,
}) => {
  return (
    <>
      {/* Informações detalhadas da Herança Dracônica */}
      {isAncestryTrait && (
        <div className="mt-2 p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[11px] space-y-1">
          <div className="flex justify-between items-center text-amber-200 font-bold">
            <span>🐉 Herança Escolhida:</span>
            <span className="text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/40">
              {ancestry ? `Dragão ${ancestry.name}` : draconicAncestryName || 'Não Selecionada'}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Elemento / Dano:</span>
            <span className="font-semibold text-amber-400">{ancestry?.damageType || 'Elemento Elemental'}</span>
          </div>
        </div>
      )}

      {/* Informações detalhadas do Ataque de Sopro / Baforada */}
      {isBreathTrait && (
        <div className="mt-2 p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[11px] space-y-1">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-200">
            <div>
              🔥 Dano:{' '}
              <strong className="text-amber-300">
                {breathWeaponDetails?.damage || '1d10'} (
                {breathWeaponDetails?.damageType || ancestry?.damageType || 'Elemento'})
              </strong>
            </div>
            <div>
              🎯 CD Resistência:{' '}
              <strong className="text-amber-300">
                CD {breathWeaponDetails?.dc} Destreza (8 + PB + CON)
              </strong>
            </div>
            <div>
              📐 Formas: <strong className="text-amber-300">Cone 4,5m / Linha 9m</strong>
            </div>
            <div>
              ⚡ Usos Restantes:{' '}
              <strong className="text-amber-300">
                {breathWeaponDetails?.pb || 2} / Descanso Longo
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Informações detalhadas da Resistência a Dano */}
      {isResistanceTrait && (
        <div className="mt-2 p-2 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-[11px]">
          <div className="flex justify-between items-center text-emerald-200">
            <span>🛡️ Resistência Ativa:</span>
            <strong className="text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded border border-emerald-500/40">
              Dano de {ancestry?.damageType || 'Elemento da Herança'}
            </strong>
          </div>
        </div>
      )}

      {/* Informações detalhadas do Voo Dracônico */}
      {isFlightTrait && (
        <div className="mt-2 p-2 bg-sky-950/40 border border-sky-500/30 rounded-lg text-[11px] space-y-1">
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-200">
            <div>
              ⏳ Duração: <strong className="text-sky-300">100 turnos (10 min)</strong>
            </div>
            <div>
              🕊️ Velocidade: <strong className="text-sky-300">Deslocamento de Voo</strong>
            </div>
            <div className="col-span-2">
              🔄 Cargas: <strong className="text-sky-300">1 uso / Descanso Longo</strong>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
