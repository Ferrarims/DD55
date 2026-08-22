import { useMemo } from 'react';
import { CombatEntity } from '../../../../../game/types';
import { XP_BUDGET_BY_LEVEL, getActionMultiplier } from '../../../../../game/encounterOrchestrator';

export interface UseCombatSummaryProps {
  entities: CombatEntity[];
  character: any;
  shouldHideEntityDetails: (ent: CombatEntity) => boolean;
}

export function useCombatSummary({
  entities,
  character,
  shouldHideEntityDetails,
}: UseCombatSummaryProps) {
  const combatSummary = useMemo(() => {
    const monsters = entities.filter(e => e.type === 'monster');
    const totalMonsters = monsters.length;
    const aliveMonsters = monsters.filter(m => !m.isDead && m.currentHp > 0).length;
    const defeatedMonsters = totalMonsters - aliveMonsters;
    const hasHiddenMonsters = monsters.some(m => shouldHideEntityDetails(m));
    const totalXp = monsters.reduce((acc, m) => acc + (shouldHideEntityDetails(m) ? 0 : (m.xpValue || 0)), 0);

    const crCountMap: Record<string, number> = {};
    monsters.forEach(m => {
      const cr = shouldHideEntityDetails(m) ? '??' : (m.cr || '1/4');
      crCountMap[cr] = (crCountMap[cr] || 0) + 1;
    });

    const crFormatted = Object.entries(crCountMap)
      .map(([cr, count]) => count > 1 ? `ND ${cr} (x${count})` : `ND ${cr}`)
      .join(', ');

    const heroLvl = character?.level || 1;
    const levelBudget = XP_BUDGET_BY_LEVEL[heroLvl] || XP_BUDGET_BY_LEVEL[1];
    const { finalMultiplier } = getActionMultiplier(totalMonsters, 1);
    const adjustedXp = Math.round(totalXp * finalMultiplier);

    let diffLabel = 'Média';
    let diffColor = 'text-amber-400 bg-amber-950/40 border-amber-800/40';
    if (adjustedXp >= levelBudget.deadly) {
      diffLabel = 'Mortal 💀';
      diffColor = 'text-rose-400 bg-rose-950/40 border-rose-800/40';
    } else if (adjustedXp >= levelBudget.hard) {
      diffLabel = 'Difícil ⚠️';
      diffColor = 'text-orange-400 bg-orange-950/40 border-orange-800/40';
    } else if (adjustedXp <= levelBudget.easy) {
      diffLabel = 'Fácil 🛡️';
      diffColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
    }

    return {
      totalMonsters,
      aliveMonsters,
      defeatedMonsters,
      totalXp,
      hasHiddenMonsters,
      crFormatted: crFormatted || 'ND 1/4',
      diffLabel,
      diffColor,
      monsters
    };
  }, [entities, character, shouldHideEntityDetails]);

  return { combatSummary };
}
