import React from 'react';
import { DragonbornTraitDetails } from './DragonbornTraitDetails';
import { GoliathAndHumanTraitDetails } from './GoliathAndHumanTraitDetails';

interface RaceTraitCardProps {
  trait: any;
  idx: number;
  raceKey: string;
  isDragonborn: boolean;
  isGoliath: boolean;
  character: any;
  ancestry: any;
  draconicAncestryName: string | undefined;
  breathWeaponDetails: any;
  getCharacterActiveFeats: (char: any) => string[];
}

export const RaceTraitCard: React.FC<RaceTraitCardProps> = ({
  trait,
  idx,
  raceKey,
  isDragonborn,
  isGoliath,
  character,
  ancestry,
  draconicAncestryName,
  breathWeaponDetails,
  getCharacterActiveFeats,
}) => {
  const traitNameLower = (trait.name || '').toLowerCase();
  const isAncestryTrait = isDragonborn && (traitNameLower.includes('herança') || traitNameLower.includes('ancestry'));
  const isGoliathAncestry = isGoliath && (traitNameLower.includes('ancestralidade') || traitNameLower.includes('ancestry'));
  const isBreathTrait = isDragonborn && (traitNameLower.includes('sopro') || traitNameLower.includes('breath'));
  const isResistanceTrait = isDragonborn && (traitNameLower.includes('resistência') || traitNameLower.includes('resistance'));
  const isFlightTrait = isDragonborn && (traitNameLower.includes('voo') || traitNameLower.includes('flight') || traitNameLower.includes('asas'));
  const isLargeFormTrait = isGoliath && (traitNameLower.includes('forma grande') || traitNameLower.includes('large form'));
  const isBonusActionTrait =
    isFlightTrait ||
    isLargeFormTrait ||
    (trait.type || '').toLowerCase().includes('ação bônus') ||
    (trait.type || '').toLowerCase().includes('bonus action');

  const isHuman = /humano|human/i.test(raceKey || '');
  const isVersatileTrait = isHuman && (traitNameLower.includes('versátil') || traitNameLower.includes('versatile'));

  return (
    <div
      key={`${trait.name}-${idx}`}
      className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/30 p-3.5 rounded-xl space-y-2 transition flex flex-col justify-between"
    >
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
            <span className="text-sky-400">🧬</span>
            <span>{trait.name || 'Sem nome'}</span>
          </div>
          <span className="text-[10px] font-semibold bg-slate-950 text-sky-400 border border-sky-900/40 px-2 py-0.5 rounded whitespace-nowrap">
            {isGoliathAncestry
              ? 'Automática'
              : isBreathTrait
              ? 'Ataque'
              : isBonusActionTrait
              ? 'Ação Bônus'
              : trait.type || 'Automática'}
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {trait.description || 'Sem descrição'}
        </p>

        <DragonbornTraitDetails
          isAncestryTrait={isAncestryTrait}
          isBreathTrait={isBreathTrait}
          isResistanceTrait={isResistanceTrait}
          isFlightTrait={isFlightTrait}
          ancestry={ancestry}
          draconicAncestryName={draconicAncestryName}
          breathWeaponDetails={breathWeaponDetails}
        />

        <GoliathAndHumanTraitDetails
          isVersatileTrait={isVersatileTrait}
          isGoliathAncestry={isGoliathAncestry}
          isLargeFormTrait={isLargeFormTrait}
          character={character}
          getCharacterActiveFeats={getCharacterActiveFeats}
        />
      </div>

      {trait.usageLimit && (
        <div className="text-[10px] text-sky-400/90 italic pt-2 border-t border-slate-800">
          💡 limite: {trait.usageLimit}
        </div>
      )}
    </div>
  );
};
