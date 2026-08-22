import React from 'react';
import { CombatEntity, CombatLog } from '../../../../../game/types';
import { rollMonsterLootAndXp } from '../../../../../game/dndLootTables';
import { calculateIncomingDamage, absorbDamageWithTempHp } from './damageCalculator';

export interface UseDamageProcessorExecutorProps {
  character: any;
  entities: CombatEntity[];
  setEntities: (val: CombatEntity[] | ((prev: CombatEntity[]) => CombatEntity[])) => void;
  entitiesRef: React.MutableRefObject<CombatEntity[]>;
  shouldHideEntityDetails: (ent: CombatEntity) => boolean;
  getActiveFeats: () => string[];
  addCombatLog: (actorName: string, title: string, detail: string, type?: CombatLog['type'] | 'spell') => void;
  setFloatingTexts: (val: any[] | ((prev: any[]) => any[])) => void;
  processedDeathIdsRef: React.MutableRefObject<Set<string>>;
  mapStreak: number;
  isOrc: boolean;
  relentlessEnduranceUses: number;
  setRelentlessEnduranceUses: (val: number | ((prev: number) => number)) => void;
  setShowRelentlessModal: (val: boolean) => void;
  isGoliath: boolean;
  goliathAncestryUses: number;
  setPendingGoliathDamageInfo: (info: any) => void;
  setVictoryData: (val: any | ((prev: any) => any)) => void;
  setDroppedLoot: (val: any[] | ((prev: any[]) => any[])) => void;
}

export function useDamageProcessorExecutor({
  character,
  entities,
  setEntities,
  entitiesRef,
  shouldHideEntityDetails,
  getActiveFeats,
  addCombatLog,
  setFloatingTexts,
  processedDeathIdsRef,
  mapStreak,
  isOrc,
  relentlessEnduranceUses,
  setRelentlessEnduranceUses,
  setShowRelentlessModal,
  isGoliath,
  goliathAncestryUses,
  setPendingGoliathDamageInfo,
  setVictoryData,
  setDroppedLoot
}: UseDamageProcessorExecutorProps) {
  const processDamageAndCheckKill = (
    targetId: string,
    damageAmount: number,
    attackerName: string,
    damageType?: string,
    attackerId?: string
  ) => {
    const target = entities.find(e => e.id === targetId);
    if (!target) return;

    const isTargetHidden = shouldHideEntityDetails(target);
    const targetName = isTargetHidden ? 'Inimigo Oculto' : target.name;
    const heroFeats = getActiveFeats();

    const { finalDamage, resistanceMsg, isSlashed, heavyArmorReducedBp } = calculateIncomingDamage({
      target,
      targetId,
      targetName,
      damageAmount,
      damageType,
      attackerId,
      character,
      heroFeats,
    });

    if (heavyArmorReducedBp > 0) {
      setTimeout(() => {
        addCombatLog('Especialista em Armaduras Pesadas', '🛡️ Redução de Dano!', `Reduziu ${heavyArmorReducedBp} de dano físico recebido devido à sua Especialização em Armaduras Pesadas! (De ${damageAmount} para ${finalDamage})`, 'system');
      }, 50);
    }

    if (resistanceMsg) {
      setTimeout(() => {
        addCombatLog('Mestre do Jogo', '🛡️ Afetadores de Dano', resistanceMsg.trim(), 'system');
      }, 70);
    }

    // Absorver Dano com Pontos de Vida Temporários (tempHp)
    const { damageRemaining, newTempHp } = absorbDamageWithTempHp(target.tempHp || 0, finalDamage);

    const isAlreadyDead = processedDeathIdsRef.current.has(targetId);
    let newHp = Math.max(0, target.currentHp - damageRemaining);
    const wasAlive = !target.isDead && !isAlreadyDead;

    // Checar Resistência Implacável (Relentless Endurance - Orc)
    let relentlessTriggered = false;
    if (targetId === 'hero' && newHp <= 0 && wasAlive && isOrc && relentlessEnduranceUses > 0) {
      const damageExcess = damageRemaining - Math.max(0, target.currentHp);
      const isKilledOutright = damageExcess >= target.maxHp;
      if (!isKilledOutright) {
        newHp = 1;
        relentlessTriggered = true;
      }
    }

    const isDeadNow = newHp <= 0;

    if (relentlessTriggered) {
      setRelentlessEnduranceUses(prev => Math.max(0, prev - 1));
      setShowRelentlessModal(true);
      setTimeout(() => {
        addCombatLog(
          targetName,
          '💪 RESISTÊNCIA IMPLACÁVEL (RELENTLESS ENDURANCE)!',
          'Quando foi reduzido a 0 Pontos de Vida, usou sua determinação orc para se recusar a cair e permaneceu consciente com 1 Ponto de Vida!',
          'system'
        );
      }, 80);

      setFloatingTexts(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          x: target.x,
          y: target.y,
          text: `💪 1 PV! (Resistência Implacável)`,
          color: '#ef4444',
          progress: 0
        }
      ]);
    }

    let lootRoll: ReturnType<typeof rollMonsterLootAndXp> | null = null;
    if (target.type === 'monster' && wasAlive && isDeadNow) {
      processedDeathIdsRef.current.add(targetId);
      const multiplier = Math.max(1, mapStreak);
      lootRoll = rollMonsterLootAndXp(target, multiplier);
    }

    const gType = (character?.giant_ancestry || character?.giantAncestry || '').toLowerCase();
    const hasDamageAncestry = gType === '' || 
                             gType.includes('pedra') || gType.includes('stone') ||
                             gType.includes('tempestade') || gType.includes('storm');

    if (targetId === 'hero' && finalDamage > 0 && isGoliath && goliathAncestryUses > 0 && hasDamageAncestry) {
      const heroEntity = entitiesRef.current.find(e => e.type === 'hero');
      if (heroEntity && heroEntity.hasReaction) {
        const attacker = entities.find(e => e.id === attackerId);
        const dist = attacker ? Math.max(Math.abs(target.x - attacker.x), Math.abs(target.y - attacker.y)) : 999;
        const isWithin60Ft = dist <= 12;

        setPendingGoliathDamageInfo({
          damageDealt: finalDamage,
          attackerId: attackerId || null,
          attackerName: attackerName || 'Inimigo',
          isWithin60Ft
        });
      }
    }

    setEntities(prevEntities => {
      return prevEntities.map(ent => {
        if (ent.id === targetId) {
          const nextSpeed = isSlashed ? Math.max(1, ent.speed - 2) : ent.speed;
          const nextMovement = isSlashed ? Math.max(0, ent.remainingMovement - 2) : ent.remainingMovement;
          return {
            ...ent,
            currentHp: newHp,
            tempHp: newTempHp,
            isDead: isDeadNow,
            speed: nextSpeed,
            remainingMovement: nextMovement
          };
        }
        return ent;
      });
    });

    if (target.type === 'monster' && finalDamage > 0) {
      setVictoryData(prev => {
        const prevXp = prev?.totalXp || 0;
        const prevLoot = prev?.loot || [];
        const prevDefeated = prev?.defeatedMonsters || {};
        const prevDmg = prev?.totalDamageDealt || 0;
        return {
          totalXp: prevXp,
          loot: prevLoot,
          defeatedMonsters: prevDefeated,
          totalDamageDealt: prevDmg + finalDamage
        };
      });
    }

    if (lootRoll) {
      addCombatLog(
        attackerName,
        `💀 Derrotou ${targetName} (+${lootRoll.xpEarned} XP)`,
        `O inimigo caiu em batalha! Suas recompensas caíram no chão na posição (${target.x}, ${target.y}). Caminhe até lá ou clique no quadrado para recolher!`,
        'kill'
      );

      if (lootRoll.lootItems.length > 0) {
        addCombatLog(
          'Mestre do Jogo',
          `💎 Espólios no Chão!`,
          `Itens derrubados: ${lootRoll.lootItems.map(i => `${i.icon} ${i.name}`).join(', ')}`,
          'loot'
        );
      }

      setVictoryData(prev => {
        const prevXp = prev?.totalXp || 0;
        const prevLoot = prev?.loot || [];
        const prevDefeated = prev?.defeatedMonsters || {};
        const prevDmg = prev?.totalDamageDealt || 0;
        const monsterName = target.name.replace(/ #?\d+$/, '').trim();
        const nextDefeated = { ...prevDefeated };
        nextDefeated[monsterName] = (nextDefeated[monsterName] || 0) + 1;
        return {
          totalXp: prevXp + lootRoll!.xpEarned,
          loot: prevLoot,
          defeatedMonsters: nextDefeated,
          totalDamageDealt: prevDmg
        };
      });

      if (lootRoll.lootItems.length > 0) {
        const newDrops = lootRoll.lootItems.map((item, index) => ({
          id: `${item.id}-${index}-${Date.now()}`,
          x: target.x,
          y: target.y,
          item,
          isCollected: false
        }));
        setDroppedLoot(prev => [...prev, ...newDrops]);
      }
    }
  };

  return { processDamageAndCheckKill };
}
