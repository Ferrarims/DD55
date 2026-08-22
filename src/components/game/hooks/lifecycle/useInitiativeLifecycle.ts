import React, { useEffect } from 'react';
import { CombatEntity, BiomeType } from '../../../../game/types';
import { calculateHeroInitiativeBonus, calculateStatModifier } from '../../utils/platformUtils';
import { getRaceIcon } from '../../../../lib/api/references';

export interface UseInitiativeLifecycleProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  setActiveEntityIndex: React.Dispatch<React.SetStateAction<number>>;
  character: any;
  getActiveFeats: () => string[];
  addCombatLog: (actorName: string, title: string, detail: string, type: any) => void;
  setLatestInitiativeRoll: (roll: any) => void;
  isBattleOver: boolean;
  setIsBattleOver: (over: boolean) => void;
  prevHadVisibleMonstersRef: React.MutableRefObject<boolean>;
  torches: any[];
  isNight: boolean;
  biome: BiomeType;
  isEntityVisible: (ent: CombatEntity) => boolean;
  shouldHideEntityDetails: (ent: CombatEntity) => boolean;
}

export function useInitiativeLifecycle({
  entities,
  setEntities,
  setActiveEntityIndex,
  character,
  getActiveFeats,
  addCombatLog,
  setLatestInitiativeRoll,
  isBattleOver,
  setIsBattleOver,
  prevHadVisibleMonstersRef,
  torches,
  isNight,
  biome,
  isEntityVisible,
  shouldHideEntityDetails,
}: UseInitiativeLifecycleProps) {
  useEffect(() => {
    if (entities.length === 0) return;

    const visibleMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
    const hasVisibleMonsters = visibleMonsters.length > 0;

    if (hasVisibleMonsters && !prevHadVisibleMonstersRef.current) {
      prevHadVisibleMonstersRef.current = true;
      setIsBattleOver(false);

      const logRolls: string[] = [];
      const rollDetails: Array<{ id: string; name: string; icon: string; d20: number; mod: number; total: number; isHero: boolean }> = [];

      const updatedEntities = entities.map(ent => {
        if (ent.isDead) return ent;

        let totalMod = 0;
        if (ent.type === 'hero') {
          totalMod = calculateHeroInitiativeBonus(character, getActiveFeats()).totalMod;
        } else if (ent.stats?.dex !== undefined) {
          totalMod = calculateStatModifier(ent.stats.dex);
        }

        const isInvisible = ent.conditions?.some(c => c === 'Invisível' || c === 'Invisible');
        const isIncapacitated = ent.conditions?.some(c => 
          c === 'Incapacitado' || c === 'Incapacitated' ||
          c === 'Paralisado' || c === 'Paralyzed' ||
          c === 'Petrificado' || c === 'Petrified' ||
          c === 'Atordoado' || c === 'Stunned' ||
          c === 'Inconsciente' || c === 'Unconscious'
        );

        let d1 = Math.floor(Math.random() * 20) + 1;
        let d2 = Math.floor(Math.random() * 20) + 1;
        let d20 = d1;
        let rollTag = '';
        if (isInvisible && !isIncapacitated) {
          d20 = Math.max(d1, d2);
          rollTag = ' (Vantagem - Invisível)';
        } else if (isIncapacitated && !isInvisible) {
          d20 = Math.min(d1, d2);
          rollTag = ' (Desvantagem - Incapacitado)';
        }

        const exhaustion = ent.exhaustionLevel || 0;
        const exPenalty = exhaustion * 2;
        const newInit = d20 + totalMod - exPenalty;

        const modStr = totalMod >= 0 ? `+${totalMod}` : `${totalMod}`;
        const isEntHidden = shouldHideEntityDetails(ent);
        const entName = isEntHidden ? 'Inimigo Oculto' : ent.name;
        const exLog = exPenalty > 0 ? `-${exPenalty}(Exaustão)` : '';
        logRolls.push(`• ${entName}: d20(${d20})${rollTag} ${modStr}${exLog} = ${newInit}`);

        rollDetails.push({
          id: ent.id,
          name: entName,
          icon: isEntHidden ? '❓' : (ent.icon || (ent.type === 'hero' ? getRaceIcon(character?.race || character?.charRace) : '🧟')),
          d20,
          mod: totalMod - exPenalty,
          total: newInit,
          isHero: ent.type === 'hero'
        });

        return {
          ...ent,
          initiative: newInit,
          hasAction: true,
          hasBonusAction: true,
          hasReaction: true,
          remainingMovement: ent.speed,
          attacksRemaining: 0
        };
      });

      const sorted = [...updatedEntities].sort((a, b) => b.initiative - a.initiative);
      const sortedRollDetails = [...rollDetails].sort((a, b) => b.total - a.total);

      setEntities(sorted);
      setActiveEntityIndex(0);

      setLatestInitiativeRoll({
        id: Date.now().toString(),
        rolls: sortedRollDetails,
        firstToActName: sorted[0]?.name || 'Herói'
      });

      const sorted0Name = shouldHideEntityDetails(sorted[0]) ? 'Inimigo Oculto' : (sorted[0]?.name || 'Herói');
      addCombatLog(
        'Mestre do Jogo',
        '⚔️ INIMIGOS REVELADOS! (Iniciativa Rolada)',
        `Inimigo(s) detectado(s) no campo de visão! O movimento de exploração foi encerrado para o combate.\n\n🎲 ROLAGENS DE INICIATIVA:\n${logRolls.join('\n')}\n\n👑 Primeiro a agir: ${sorted0Name} (Inic ${sorted[0]?.initiative})!`,
        'system'
      );
    } else if (!hasVisibleMonsters && prevHadVisibleMonstersRef.current) {
      prevHadVisibleMonstersRef.current = false;
      setIsBattleOver(true);
    }
  }, [entities, torches, isNight, biome, isBattleOver, isEntityVisible, shouldHideEntityDetails, character, getActiveFeats]);
}
