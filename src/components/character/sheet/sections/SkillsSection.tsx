import React, { useState, useMemo } from 'react';
import {
  SkillReferenceItem,
  AbilityKey,
} from '../../../../lib/api/references';
import {
  getAllSkillsCalculations,
  SkillBonusCalculation,
} from '../../../../game/skills/skillsEngine';
import { SkillRollModal } from '../modals/SkillRollModal';

interface SkillsSectionProps {
  character: any;
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ character }) => {
  const [selectedSkillForRoll, setSelectedSkillForRoll] = useState<SkillReferenceItem | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [abilityFilter, setAbilityFilter] = useState<AbilityKey | 'all'>('all');
  const [onlyProficient, setOnlyProficient] = useState<boolean>(false);

  const skillCalculations = useMemo(() => {
    return getAllSkillsCalculations(character);
  }, [character]);

  const filteredSkills = useMemo(() => {
    return skillCalculations.filter(calc => {
      if (onlyProficient && !calc.isProficient) return false;
      if (abilityFilter !== 'all' && calc.skill.ability !== abilityFilter) return false;
      if (searchFilter.trim() !== '') {
        const query = searchFilter.toLowerCase();
        const matchesName = calc.skill.namePt.toLowerCase().includes(query) || calc.skill.nameEn.toLowerCase().includes(query);
        const matchesAbility = calc.skill.abilityNamePt.toLowerCase().includes(query);
        if (!matchesName && !matchesAbility) return false;
      }
      return true;
    });
  }, [skillCalculations, onlyProficient, abilityFilter, searchFilter]);

  const proficientCount = useMemo(() => {
    return skillCalculations.filter(c => c.isProficient).length;
  }, [skillCalculations]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl mb-4 animate-in fade-in duration-300">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <h2 className="text-base font-bold text-amber-400 uppercase tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
              Perícias & Testes (Skills - D&D 2024)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {proficientCount} de 18 perícias proficientes (+{character?.proficiencyBonus || 2} PB)
          </p>
        </div>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <input
            type="text"
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            placeholder="Buscar perícia..."
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 max-w-[140px]"
          />

          <select
            value={abilityFilter}
            onChange={e => setAbilityFilter(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Todos Atributos</option>
            <option value="str">Força (FOR)</option>
            <option value="dex">Destreza (DES)</option>
            <option value="int">Inteligência (INT)</option>
            <option value="wis">Sabedoria (SAB)</option>
            <option value="cha">Carisma (CAR)</option>
          </select>

          <button
            type="button"
            onClick={() => setOnlyProficient(!onlyProficient)}
            className={`px-2.5 py-1 rounded-lg font-semibold border transition ${
              onlyProficient
                ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⭐ Apenas Proficientes
          </button>
        </div>
      </div>

      {/* Grade de Perícias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredSkills.map((calc: SkillBonusCalculation) => {
          const modStr = calc.totalBonus >= 0 ? `+${calc.totalBonus}` : `${calc.totalBonus}`;
          return (
            <div
              key={calc.skill.id}
              onClick={() => setSelectedSkillForRoll(calc.skill)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group flex items-center justify-between gap-3 ${
                calc.isProficient
                  ? 'bg-sky-950/20 border-sky-500/30 hover:border-sky-400 hover:bg-sky-950/35 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800/90 hover:border-amber-500/40 hover:bg-slate-800/60'
              }`}
            >
              {/* Esquerda: Ícone & Nome & Atributo */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl p-1.5 bg-slate-950/80 rounded-lg border border-slate-800 group-hover:scale-110 transition-transform">
                  {calc.skill.icon}
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                      {calc.skill.namePt}
                    </span>
                    {calc.isProficient && (
                      <span className="text-[10px] text-sky-400" title="Proficiente">⭐</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <span className="font-semibold uppercase tracking-wider text-slate-500">
                      {calc.skill.abilityNamePt.substring(0, 3)}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">Passiva: {calc.passiveScore}</span>
                    {calc.skill.hasActiveFeature && (
                      <span className="text-[9px] px-1 bg-amber-500/10 text-amber-400/90 rounded border border-amber-500/20">
                        Ação
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Direita: Bônus Total & Botão de Dado */}
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`text-sm font-black px-2 py-1 rounded-lg border text-center min-w-[36px] ${
                    calc.isProficient
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'bg-slate-950 text-amber-400/90 border-slate-700'
                  }`}
                >
                  {modStr}
                </div>
                <button
                  type="button"
                  title={`Rolar teste de ${calc.skill.namePt}`}
                  className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-400 flex items-center justify-center font-bold border border-slate-700 transition shadow"
                >
                  🎲
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredSkills.length === 0 && (
        <div className="text-center py-6 text-slate-500 text-xs">
          Nenhuma perícia encontrada com os filtros selecionados.
        </div>
      )}

      {/* Modal de Rolagem de Perícia */}
      {selectedSkillForRoll && (
        <SkillRollModal
          skill={selectedSkillForRoll}
          character={character}
          onClose={() => setSelectedSkillForRoll(null)}
        />
      )}
    </div>
  );
};
