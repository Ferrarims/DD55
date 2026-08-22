import React from 'react';
import { getFighterFeaturesForLevel } from '../../../../lib/api/references';
import { ClassFeatureCard } from './classTraits/ClassFeatureCard';
import { BattleMasterManeuversPanel } from './classTraits/BattleMasterManeuversPanel';
import { PsiWarriorPowersPanel } from './classTraits/PsiWarriorPowersPanel';

interface ClassTraitsSectionProps {
  character: any;
  selectedSubclass: string;
  handleUseManeuver: (name: string, desc: string) => void;
  handleUsePsiPower?: (power: string, desc: string) => void;
}

export const ClassTraitsSection: React.FC<ClassTraitsSectionProps> = ({
  character,
  selectedSubclass,
  handleUseManeuver,
  handleUsePsiPower,
}) => {
  const isFighter =
    (character.class_name || '').toLowerCase().includes('guerreiro') ||
    (character.class_name || '').toLowerCase().includes('fighter');

  if (!isFighter) return null;

  return (
    <div className="bg-slate-950 p-4.5 rounded-xl border border-slate-800 space-y-4 shadow-xl">
      {/* Header e Seleção de Subclasse */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3
            className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            <span>⚔️</span> Habilidades de Classe &amp; Subclasse
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Todas as características marciais e escolhas permanentes desbloqueadas.
          </p>
        </div>
      </div>

      {/* Grid de Habilidades da Classe Obtidas por Nível */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {getFighterFeaturesForLevel(character.level || 1, selectedSubclass).map((feat, idx) => (
          <ClassFeatureCard
            key={(feat as any).id || `${feat.name}-${feat.level}-${idx}`}
            feat={feat}
            character={character}
            selectedSubclass={selectedSubclass}
          />
        ))}
      </div>

      {/* Painel de Manobras Táticas (se Mestre da Batalha estiver selecionado) */}
      <BattleMasterManeuversPanel
        selectedSubclass={selectedSubclass}
        handleUseManeuver={handleUseManeuver}
      />

      {/* Painel de Poderes Psiônicos (se Combatente Psíquico estiver selecionado) */}
      <PsiWarriorPowersPanel
        selectedSubclass={selectedSubclass}
        handleUsePsiPower={handleUsePsiPower}
      />
    </div>
  );
};
