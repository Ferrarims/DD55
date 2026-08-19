import React, { useMemo } from 'react';
import { CombatEntity, CombatLog } from '../../../../game/types';
import { getDistanceBetweenEntities, evaluateDamageAffinity } from '../../../../game/combatUtils';
import { isHeavyArmor } from '../../utils/platformUtils';
import { rollMonsterLootAndXp } from '../../../../game/dndLootTables';

export interface UseCombatDamageProcessorProps {
  character: any;
  entities: CombatEntity[];
  setEntities: (val: CombatEntity[] | ((prev: CombatEntity[]) => CombatEntity[])) => void;
  entitiesRef: React.MutableRefObject<CombatEntity[]>;
  recklessAttackActive: boolean;
  rollAdvantageState: 'normal' | 'advantage' | 'disadvantage';
  currentSelectedAttack: any;
  activeLargeForm: boolean;
  weather: 'clear' | 'rain' | 'fog' | 'snow' | 'storm' | 'heatwave' | 'wind';
  isEntityVisible: (ent: CombatEntity) => boolean;
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

export function useCombatDamageProcessor({
  character,
  entities,
  setEntities,
  entitiesRef,
  recklessAttackActive,
  rollAdvantageState,
  currentSelectedAttack,
  activeLargeForm,
  weather,
  isEntityVisible,
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
}: UseCombatDamageProcessorProps) {
  const activeAdvantageMode = useMemo(() => {
    if (recklessAttackActive) return 'advantage';
    return rollAdvantageState;
  }, [recklessAttackActive, rollAdvantageState]);

  const impendingAttackDetails = useMemo(() => {
    const hero = entities.find(e => e.type === 'hero');
    if (!hero) return null;

    const aliveMonsters = entities.filter(e => e.type === 'monster' && !e.isDead && isEntityVisible(e));
    if (aliveMonsters.length === 0) return null;

    const primaryTarget = [...aliveMonsters].sort((a, b) => {
      const distA = getDistanceBetweenEntities(hero, a, character?.race, activeLargeForm);
      const distB = getDistanceBetweenEntities(hero, b, character?.race, activeLargeForm);
      return distA - distB;
    })[0];

    const advantageSources: string[] = [];
    const disadvantageSources: string[] = [];

    if (recklessAttackActive) {
      advantageSources.push('Ataque Imprudente Ativo');
    }

    const heroConditions = hero.conditions || [];
    if (heroConditions.includes('Drenado') || heroConditions.includes('Sapped')) {
      disadvantageSources.push('Drenado (Sap de Maestria)');
    }
    if (heroConditions.some(c => c === 'Envenenado' || c === 'Poisoned')) {
      disadvantageSources.push('Você está Envenenado');
    }
    if (heroConditions.some(c => c === 'Cego' || c === 'Blinded')) {
      disadvantageSources.push('Você está Cego');
    }
    if (heroConditions.some(c => c === 'Contido' || c === 'Restringido' || c === 'Restrained')) {
      disadvantageSources.push('Você está Restringido');
    }
    if (heroConditions.some(c => c === 'Caído' || c === 'Prone')) {
      disadvantageSources.push('Você está Caído');
    }
    if (heroConditions.some(c => c === 'Invisível' || c === 'Invisible')) {
      advantageSources.push('Você está Invisível');
    }
    if (heroConditions.some(c => c === 'Amedrontado' || c === 'Amedrontado_New' || c === 'Frightened')) {
      disadvantageSources.push('Você está Amedrontado');
    }

    if (currentSelectedAttack) {
      const pStr = String(currentSelectedAttack.properties || '').toLowerCase();
      const nStr = String(currentSelectedAttack.name || '').toLowerCase();
      const isHeavyWeapon = pStr.includes('heavy') || pStr.includes('pesada') || nStr.includes('machado grande') || nStr.includes('espada grande') || nStr.includes('arco longo') || nStr.includes('besta pesada') || nStr.includes('malho') || nStr.includes('alabarda') || nStr.includes('glaive');
      
      if (isHeavyWeapon) {
        const rStr = String(currentSelectedAttack.range || '').toLowerCase();
        const isPureRangedName = nStr.includes('arco') || nStr.includes('besta') || nStr.includes('funda') || 
          nStr.includes('bow') || nStr.includes('crossbow') || nStr.includes('sling') || nStr.includes('dardo') || nStr.includes('dart');
        const hasThrown = rStr.includes('arremesso') || pStr.includes('arremesso') || pStr.includes('thrown') || isPureRangedName;
        const hasMeleeBase = rStr.startsWith('1,5m') || rStr.startsWith('1.5m') || rStr.startsWith('3m') || rStr.startsWith('3.0m') || rStr.includes('toque') || rStr.includes('touch');
        const isPureRanged = isPureRangedName || (
          (rStr.includes('/') || rStr.includes('munição') || pStr.includes('munição') || pStr.includes('ammunition')) && 
          !hasMeleeBase && 
          !hasThrown
        );

        const isMeleeHeavy = !isPureRanged;
        const strScore = hero.stats?.str !== undefined ? hero.stats.str : (character?.strength !== undefined ? character.strength : 10);
        const dexScore = hero.stats?.dex !== undefined ? hero.stats.dex : (character?.dexterity !== undefined ? character.dexterity : 10);
        
        if (isMeleeHeavy && strScore < 13) {
          disadvantageSources.push(`Arma Pesada (Força ${strScore} < 13)`);
        } else if (!isMeleeHeavy && dexScore < 13) {
          disadvantageSources.push(`Arma Pesada À Distância (Destreza ${dexScore} < 13)`);
        }
      }
    }

    let targetName = primaryTarget.name;
    let distance = getDistanceBetweenEntities(hero, primaryTarget, character?.race, activeLargeForm);
    let autoCritPossible = false;

    const tgtConditions = primaryTarget.conditions || [];
    if (tgtConditions.includes('Afligido') || tgtConditions.includes('Vexed') || tgtConditions.includes('Vex')) {
      advantageSources.push(`Alvo Afligido (Vex de Maestria)`);
    }
    if (tgtConditions.some(c => c === 'Caído' || c === 'Prone')) {
      if (distance <= 1) {
        advantageSources.push('Alvo Caído (Corpo a Corpo)');
      } else {
        disadvantageSources.push('Alvo Caído (À Distância)');
      }
    }
    if (tgtConditions.some(c => c === 'Cego' || c === 'Blinded')) {
      advantageSources.push('Alvo está Cego');
    }
    if (tgtConditions.some(c => c === 'Paralisado' || c === 'Paralyzed')) {
      advantageSources.push('Alvo está Paralisado');
      if (distance <= 1) autoCritPossible = true;
    }
    if (tgtConditions.some(c => c === 'Inconsciente' || c === 'Unconscious')) {
      advantageSources.push('Alvo está Inconsciente');
      if (distance <= 1) autoCritPossible = true;
    }
    if (tgtConditions.some(c => c === 'Contido' || c === 'Restringido' || c === 'Restrained')) {
      advantageSources.push('Alvo está Restringido');
    }
    if (tgtConditions.some(c => c === 'Atordoado' || c === 'Stunned')) {
      advantageSources.push('Alvo está Atordoado');
    }
    if (tgtConditions.some(c => c === 'Invisível' || c === 'Invisible')) {
      disadvantageSources.push('Alvo está Invisível');
    }

    if (currentSelectedAttack) {
      const pStr = String(currentSelectedAttack.properties || '').toLowerCase();
      const nStr = String(currentSelectedAttack.name || '').toLowerCase();
      const rStr = String(currentSelectedAttack.range || '').toLowerCase();
      const isPureRanged = nStr.includes('arco') || nStr.includes('besta') || nStr.includes('funda') || 
        nStr.includes('bow') || nStr.includes('crossbow') || nStr.includes('sling') || nStr.includes('dardo') || 
        rStr.includes('munição') || rStr.includes('ammunition') || (!rStr.startsWith('1,5m') && !rStr.startsWith('1.5m') && (rStr.includes('m') || rStr.includes('/')));
      
      if (weather === 'wind' && isPureRanged) {
        disadvantageSources.push('Vento Forte (Desvantagem em projéteis)');
      } else if (weather === 'storm' && isPureRanged) {
        disadvantageSources.push('Tempestade Severa (Desvantagem em ataques à distância)');
      } else if (weather === 'fog' && distance > 6) {
        disadvantageSources.push('Neblina Densa (Alvo além de 9m fortemente obscurecido)');
      }
    }

    let state: 'normal' | 'advantage' | 'disadvantage' = 'normal';
    if (advantageSources.length > 0 && disadvantageSources.length > 0) {
      state = 'normal';
    } else if (advantageSources.length > 0) {
      state = 'advantage';
    } else if (disadvantageSources.length > 0) {
      state = 'disadvantage';
    }

    return {
      state,
      advantageSources,
      disadvantageSources,
      targetName,
      autoCritPossible
    };
  }, [entities, recklessAttackActive, currentSelectedAttack, character, activeLargeForm, weather, isEntityVisible]);

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

    let finalDamage = damageAmount;
    let resistanceMsg = '';
    let isSlashed = false;

    // Verificar imunidades, resistências e vulnerabilidades
    if (damageType && damageAmount > 0) {
      const heroFeats = getActiveFeats();
      const affinity = evaluateDamageAffinity({
        target,
        damageAmount,
        damageType,
        attackerId,
        heroFeats,
        isHeroAttacking: attackerId === 'hero'
      });

      if (affinity.multiplier === 0) {
        finalDamage = 0;
      } else if (affinity.multiplier === 0.5) {
        finalDamage = Math.floor(damageAmount / 2);
      } else if (affinity.multiplier === 2) {
        finalDamage = damageAmount * 2;
      }

      if (affinity.message) {
        resistanceMsg = affinity.message;
      }
    }

    // Especialista em Armaduras Pesadas
    if (targetId === 'hero' && getActiveFeats().includes('Especialista em Armaduras Pesadas')) {
      if (isHeavyArmor(character.equipped_armor)) {
        const bp = Math.max(2, Math.floor(((character.level || 1) - 1) / 4) + 2);
        finalDamage = Math.max(0, finalDamage - bp);
        setTimeout(() => {
          addCombatLog('Especialista em Armaduras Pesadas', '🛡️ Redução de Dano!', `Reduziu ${bp} de dano físico recebido devido à sua Especialização em Armaduras Pesadas! (De ${damageAmount} para ${finalDamage})`, 'system');
        }, 50);
      }
    }

    // Talhador (Slasher) debuff
    if (damageType && attackerId === 'hero' && getActiveFeats().includes('Talhador')) {
      const dtLower = damageType.toLowerCase();
      if (dtLower.includes('cortante') || dtLower.includes('slashing')) {
        isSlashed = true;
        resistanceMsg += ` ⚔️ [TALENTO TALHADOR] Debilitou ${targetName}, reduzindo seu deslocamento em 3m!`;
      }
    }

    if (resistanceMsg) {
      setTimeout(() => {
        addCombatLog('Mestre do Jogo', '🛡️ Afetadores de Dano', resistanceMsg.trim(), 'system');
      }, 70);
    }

    // Absorver Dano com Pontos de Vida Temporários (tempHp) primeiro
    let damageRemaining = finalDamage;
    let newTempHp = target.tempHp || 0;
    if (newTempHp > 0 && damageRemaining > 0) {
      if (damageRemaining <= newTempHp) {
        newTempHp -= damageRemaining;
        damageRemaining = 0;
      } else {
        damageRemaining -= newTempHp;
        newTempHp = 0;
      }
    }

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

  const heroEntity = entities.find(e => e.type === 'hero');
  const isHeroDead = heroEntity ? (heroEntity.isDead || heroEntity.currentHp <= 0) : false;

  return {
    activeAdvantageMode,
    impendingAttackDetails,
    processDamageAndCheckKill,
    isHeroDead
  };
}
