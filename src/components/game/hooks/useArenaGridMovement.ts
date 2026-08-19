import React from 'react';
import { CombatEntity, CellData, PowerUp, BiomeType, WeatherType } from '../../../game/types';
import { getDistanceBetweenEntities, getEntitySizeInSquares, getWeaponMaxRangeCells, hasThrownProperty } from '../../../game/combatUtils';
import { executeAttack } from '../../../game/combatEngine';
import { RACES_REFERENCE } from '../../../lib/api/references';
import { playMoveSound } from '../../../lib/audio';

export interface UseArenaGridMovementProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  grid: CellData[][];
  activeEntityIndex: number;
  isHeroTurn: boolean;
  isBattleOver: boolean;
  character: any;
  activeLargeForm: boolean;
  isHalfling: boolean;
  secondWindUses: number;
  hasHeroicInspiration: boolean;
  isTeleportTargetMode: boolean;
  isGoliath: boolean;
  isSfxEnabled: boolean;
  biome: BiomeType;
  weather: WeatherType;
  isNight: boolean;
  torches: { x: number; y: number }[];
  currentSelectedAttack: any;
  hazards: any[];
  setHazards: React.Dispatch<React.SetStateAction<any[]>>;
  powerups: PowerUp[];
  setPowerUps: React.Dispatch<React.SetStateAction<PowerUp[]>>;
  restPoints: any[];
  setRestPoints: React.Dispatch<React.SetStateAction<any[]>>;
  droppedLoot: any[];
  chests: any[];
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
  triggerAttackVisualEffect: (source: { x: number; y: number }, target: { x: number; y: number }, isRanged: boolean, hit: boolean, damage: number, isCritical?: boolean) => void;
  setLatestRoll: (roll: any) => void;
  processDamageAndCheckKill: (targetId: string, dmg: number, attackerName: string, damageType: string, attackerId: string) => void;
  processHeroAttackExecution: (hero: CombatEntity, targetMonster: CombatEntity, atkToUse: any) => void;
  collectLootItem: (id: string) => void;
  openChest: (id: string) => void;
  setPendingHalflingLuckInfo: (info: any) => void;
  setPendingHeroicInspirationInfo: (info: any) => void;
  setPendingTacticalMindInfo: (info: any) => void;
  setShowTacticalMindAlertModal: (val: boolean) => void;
  setPendingRestPointId: (id: string | null) => void;
  setIsTeleportTargetMode: (val: boolean) => void;
  setGoliathAncestryUses: React.Dispatch<React.SetStateAction<number>>;
  setMovementStepsCount: React.Dispatch<React.SetStateAction<number>>;
  setTotalGameTurns: React.Dispatch<React.SetStateAction<number>>;
  isEntityVisible: (e: CombatEntity) => boolean;
  getHeroLightRadiusInCells: () => number;
  expandMapIfNeeded?: (x: number, y: number) => void;
}

export function useArenaGridMovement({
  entities,
  setEntities,
  grid,
  activeEntityIndex,
  isHeroTurn,
  isBattleOver,
  character,
  activeLargeForm,
  isHalfling,
  secondWindUses,
  hasHeroicInspiration,
  isTeleportTargetMode,
  isGoliath,
  isSfxEnabled,
  biome,
  weather,
  isNight,
  torches,
  currentSelectedAttack,
  hazards,
  setHazards,
  powerups,
  setPowerUps,
  restPoints,
  setRestPoints,
  droppedLoot,
  chests,
  addCombatLog,
  setFloatingTexts,
  triggerAttackVisualEffect,
  setLatestRoll,
  processDamageAndCheckKill,
  processHeroAttackExecution,
  collectLootItem,
  openChest,
  setPendingHalflingLuckInfo,
  setPendingHeroicInspirationInfo,
  setPendingTacticalMindInfo,
  setShowTacticalMindAlertModal,
  setPendingRestPointId,
  setIsTeleportTargetMode,
  setGoliathAncestryUses,
  setMovementStepsCount,
  setTotalGameTurns,
  isEntityVisible,
  getHeroLightRadiusInCells,
  expandMapIfNeeded,
}: UseArenaGridMovementProps) {

  // Função para checar gatilhos de armadilhas e runas no grid
  const checkGridTriggers = (entityId: string, tx: number, ty: number) => {
    // 1. Verificar Hazards (Armadilhas)
    setHazards(prevHazards => {
      const hazard = prevHazards.find(h => h.x === tx && h.y === ty && !h.isTriggered);
      if (!hazard) return prevHazards;

      setTimeout(() => {
        setEntities(prevEntities => {
          const entity = prevEntities.find(e => e.id === entityId && !e.isDead);
          if (!entity) return prevEntities;

          let rawDmg = 0;
          if (hazard.type === 'spikes') {
            rawDmg = Math.floor(Math.random() * 10) + 1; // 1d10
          } else if (hazard.type === 'mushrooms' || hazard.type === 'fire_vent') {
            rawDmg = Math.floor(Math.random() * 6) + Math.floor(Math.random() * 6) + 2; // 2d6
          } else if (hazard.type === 'mud' || hazard.type === 'web') {
            rawDmg = 0;
          }

          const isConSave = hazard.type === 'mushrooms';
          const isStrSave = hazard.type === 'mud' || hazard.type === 'web';
          const checkType = isConSave ? 'CON' : (isStrSave ? 'FOR' : 'DES');
          const checkNameFull = isConSave ? 'Constituição' : (isStrSave ? 'Força' : 'Destreza');
          const dc = hazard.type === 'spikes' ? 12 : (hazard.type === 'mud' ? 14 : 13);

          const statMod = isConSave
            ? (entity.type === 'hero' ? Math.floor(((character?.constitution || 10) - 10) / 2) : (entity.saves?.con ?? Math.floor(((entity.stats?.con || 10) - 10) / 2)))
            : isStrSave
            ? (entity.type === 'hero' ? Math.floor(((character?.strength || 10) - 10) / 2) : (entity.saves?.str ?? Math.floor(((entity.stats?.str || 10) - 10) / 2)))
            : (entity.type === 'hero' ? Math.floor(((character?.dexterity || 10) - 10) / 2) : (entity.saves?.dex ?? Math.floor(((entity.stats?.dex || 10) - 10) / 2)));

          let saveRollD20 = Math.floor(Math.random() * 20) + 1;
          let rollTextLabel = `d20(${saveRollD20})`;
          const isFearSave = checkNameFull.toLowerCase().includes('medo') || checkNameFull.toLowerCase().includes('amedrontado') || checkNameFull.toLowerCase().includes('frightened');
          if (isHalfling && isFearSave) {
            const d2 = Math.floor(Math.random() * 20) + 1;
            saveRollD20 = Math.max(saveRollD20, d2);
            rollTextLabel = `d20(${saveRollD20} com Vantagem de Corajoso)`;
          } else if (entity.type === 'hero' && isStrSave && activeLargeForm) {
            const d2 = Math.floor(Math.random() * 20) + 1;
            saveRollD20 = Math.max(saveRollD20, d2);
            rollTextLabel = `d20(${saveRollD20} com Vantagem de Forma Grande)`;
          } else if (!isConSave && (entity.conditions?.includes('Esquivando') || entity.conditions?.includes('Dodge'))) {
            const d2 = Math.floor(Math.random() * 20) + 1;
            saveRollD20 = Math.max(saveRollD20, d2);
            rollTextLabel = `d20(${saveRollD20} com Vantagem de Esquiva)`;
          }
          const exhaustionLevel = entity.type === 'hero' ? (character?.exhaustion_level || 0) : 0;
          const saveTotal = saveRollD20 + statMod - (exhaustionLevel * 2);
          const passedSave = saveTotal >= dc;

          const applyHazardFinal = (finalDmg: number, passed: boolean) => {
            let title = '';
            let details = '';

            if (hazard.type === 'spikes') {
              title = passed ? '⚙️ Armadilha de Espinhos (Resistiu!)' : '⚙️ Armadilha de Espinhos!';
              details = `${entity.name} acionou espinhos de ferro. Teste ${checkType} (CD ${dc}): ${rollTextLabel}+${statMod}=${saveTotal} (${passed ? 'Passou! Metade do dano' : 'Falhou'}). Sofreu ${finalDmg} de dano perfurante e perdeu o restante do movimento!`;
            } else if (hazard.type === 'mushrooms') {
              title = passed ? '🍄 Esporos Venenosos (Resistiu!)' : '🍄 Esporos Venenosos!';
              details = `${entity.name} pisou em cogumelos tóxicos. Teste ${checkType} (CD ${dc}): ${rollTextLabel}+${statMod}=${saveTotal} (${passed ? 'Passou! Metade do dano' : 'Falhou'}). Sofreu ${finalDmg} de dano de veneno e penalidade de -2 no ataque!`;
            } else if (hazard.type === 'fire_vent') {
              title = passed ? '🔥 Gêiser de Fogo (Resistiu!)' : '🔥 Gêiser de Fogo!';
              details = `${entity.name} acionou uma erupção de lava. Teste ${checkType} (CD ${dc}): ${rollTextLabel}+${statMod}=${saveTotal} (${passed ? 'Passou! Metade do dano' : 'Falhou'}). Sofreu ${finalDmg} de dano de fogo!`;
            } else if (hazard.type === 'mud') {
              title = passed ? '🟤 Poça de Lama (Resistiu!)' : '🟤 Poça de Lama Profunda!';
              details = `${entity.name} pisou em lama espessa. Teste ${checkType} (CD ${dc}): ${rollTextLabel}+${statMod}=${saveTotal} (${passed ? 'Passou! Livre' : 'Falhou'}). ${passed ? 'Conseguiu se soltar facilmente.' : 'Ficou atolado e perdeu o restante do movimento!'}`;
            } else if (hazard.type === 'web') {
              title = passed ? '🕸️ Teia Escondida (Resistiu!)' : '🕸️ Teia de Aranha!';
              details = `${entity.name} esbarrou numa teia pegajosa. Teste ${checkType} (CD ${dc}): ${rollTextLabel}+${statMod}=${saveTotal} (${passed ? 'Passou! Livre' : 'Falhou'}). ${passed ? 'Rasgou a teia a tempo.' : 'Ficou Preso e perdeu o movimento!'}`;
            }

            addCombatLog('Mestre da Arena', title, details, 'damage');

            if (hazard.type === 'mushrooms') {
              setTimeout(() => {
                setEntities(currentEnts =>
                  currentEnts.map(e => {
                    if (e.id !== entityId && !e.isDead && Math.max(Math.abs(e.x - tx), Math.abs(e.y - ty)) <= 1) {
                      const areaDmg = Math.floor(finalDmg / 2);
                      const newHp = Math.max(0, e.currentHp - areaDmg);
                      addCombatLog('Mestre da Arena', '🍄 Nuvem de Esporos', `${e.name} estava por perto e sofreu ${areaDmg} de dano colateral de veneno!`, 'damage');
                      return {
                        ...e,
                        currentHp: newHp,
                        isDead: newHp <= 0,
                        attackBonus: e.attackBonus - 2
                      };
                    }
                    return e;
                  })
                );
              }, 100);
            }

            setEntities(currentEnts =>
              currentEnts.map(e => {
                if (e.id === entityId) {
                  const newHp = Math.max(0, e.currentHp - finalDmg);
                  const isDead = newHp <= 0;
                  let updated = {
                    ...e,
                    currentHp: newHp,
                    isDead
                  };
                  if (hazard.type === 'spikes' || hazard.type === 'mud' || hazard.type === 'web') {
                    updated.remainingMovement = 0;
                  } else if (hazard.type === 'mushrooms') {
                    updated.attackBonus = e.attackBonus - 2;
                  }
                  return updated;
                }
                return e;
              })
            );
          };

          if (entity.type === 'hero' && isHalfling && saveRollD20 === 1) {
            setPendingHalflingLuckInfo({
              title: `Sorte de Pequenino: Teste de ${checkNameFull}`,
              description: `Você rolou um 1 natural no Teste de Resistência de ${checkNameFull} (${hazard.name})!`,
              rollDetails: `Teste ${checkType} (CD ${dc}): ${rollTextLabel} + ${statMod} = ${saveTotal} (Falha Crítica)`,
              onReroll: () => {
                let rerollD20 = Math.floor(Math.random() * 20) + 1;
                let newRollTextLabel = `d20(${rerollD20})`;
                const newSaveTotal = rerollD20 + statMod;
                const passedNow = newSaveTotal >= dc;
                const finalDmg = passedNow ? Math.floor(rawDmg / 2) : rawDmg;
                addCombatLog('Mestre da Arena', `🍀 [SORTE DE PEQUENINO] Re-rolou Teste de ${checkNameFull}!`, `Novo d20: ${newRollTextLabel} + ${statMod} = ${newSaveTotal} (${passedNow ? 'PASSOU!' : 'FALHOU'})`, 'system');
                applyHazardFinal(finalDmg, passedNow);
              },
              onDecline: () => {
                applyHazardFinal(rawDmg, false);
              }
            });
            return prevEntities;
          }

          const hero = entities.find(e => e.type === 'hero');
          const isHeroEntity = entity.type === 'hero' || entity.id === hero?.id;
          const isFighterLevel2Plus = character?.level >= 2 && (character?.class_name?.toLowerCase().includes('guerreiro') || character?.class_name?.toLowerCase().includes('fighter'));

          if (passedSave) {
            applyHazardFinal(Math.floor(rawDmg / 2), true);
          } else {
            const handleFailureFallback = () => {
              if (isHeroEntity && isFighterLevel2Plus && secondWindUses > 0) {
                setPendingTacticalMindInfo({
                  checkName: `Teste de ${checkNameFull} (${hazard.name})`,
                  rollTotal: saveTotal,
                  dc,
                  onApplyBonus: (bonusRoll: number) => {
                    const newTotal = saveTotal + bonusRoll;
                    const passedNow = newTotal >= dc;
                    const finalDmg = passedNow ? Math.floor(rawDmg / 2) : rawDmg;
                    applyHazardFinal(finalDmg, passedNow);
                  },
                  onDecline: () => {
                    applyHazardFinal(rawDmg, false);
                  }
                });
                setShowTacticalMindAlertModal(true);
              } else {
                applyHazardFinal(rawDmg, false);
              }
            };

            if (isHeroEntity && hasHeroicInspiration) {
              setPendingHeroicInspirationInfo({
                type: 'saving_throw',
                title: `Armadilha: Teste de ${checkNameFull}`,
                description: `Você falhou no Teste de Resistência de ${checkNameFull} contra a armadilha (${hazard.name})!`,
                rollDetails: `Teste ${checkType} (CD ${dc}): ${rollTextLabel} + ${statMod} = ${saveTotal} (Falhou)`,
                onReroll: () => {
                  let rerollD20 = Math.floor(Math.random() * 20) + 1;
                  let newRollTextLabel = `d20(${rerollD20})`;
                  if (isStrSave && activeLargeForm) {
                    const d2 = Math.floor(Math.random() * 20) + 1;
                    rerollD20 = Math.max(rerollD20, d2);
                    newRollTextLabel = `d20(${rerollD20} com Vantagem de Forma Grande)`;
                  } else if (!isConSave && (entity.conditions?.includes('Esquivando') || entity.conditions?.includes('Dodge'))) {
                    const d2 = Math.floor(Math.random() * 20) + 1;
                    rerollD20 = Math.max(rerollD20, d2);
                    newRollTextLabel = `d20(${rerollD20} com Vantagem de Esquiva)`;
                  }
                  const newSaveTotal = rerollD20 + statMod;
                  const passedNow = newSaveTotal >= dc;
                  const finalDmg = passedNow ? Math.floor(rawDmg / 2) : rawDmg;
                  addCombatLog('Mestre da Arena', `✨ [INSPIRAÇÃO] Re-rolou Teste de ${checkNameFull}!`, `Novo d20: ${newRollTextLabel} + ${statMod} = ${newSaveTotal} (${passedNow ? 'PASSOU!' : 'FALHOU NOVAMENTE'})`, 'system');
                  applyHazardFinal(finalDmg, passedNow);
                },
                onDecline: () => {
                  handleFailureFallback();
                }
              });
            } else {
              handleFailureFallback();
            }
          }

          return prevEntities;
        });
      }, 50);

      return prevHazards.map(h => h.id === hazard.id ? { ...h, isTriggered: true, isHidden: false } : h);
    });

    // 2. Verificar Power-Ups
    setPowerUps(prevPowerups => {
      const powerup = prevPowerups.find(p => p.x === tx && p.y === ty && !p.isCollected);
      if (!powerup) return prevPowerups;

      setTimeout(() => {
        setEntities(prevEntities => {
          const entity = prevEntities.find(e => e.id === entityId && !e.isDead);
          if (!entity) return prevEntities;

          let title = '';
          let details = '';

          if (powerup.type === 'heal') {
            const healVal = Math.floor(Math.random() * 8) + Math.floor(Math.random() * 8) + 6;
            title = '💚 Bênção de Cura!';
            details = `${entity.name} absorveu a runa e restaurou ${healVal} PV!`;
            addCombatLog('Mestre da Arena', title, details, 'heal');

            return prevEntities.map(e => {
              if (e.id === entityId) {
                return {
                  ...e,
                  currentHp: Math.min(e.maxHp, e.currentHp + healVal)
                };
              }
              return e;
            });
          } else if (powerup.type === 'energy') {
            title = '⚡ Runa de Energia!';
            details = `${entity.name} absorveu a runa: Ações restauradas e +6m (+4 cel) de deslocamento livre!`;
            addCombatLog('Mestre da Arena', title, details, 'system');

            return prevEntities.map(e => {
              if (e.id === entityId) {
                return {
                  ...e,
                  hasAction: true,
                  hasBonusAction: true,
                  remainingMovement: e.remainingMovement + 4
                };
              }
              return e;
            });
          } else if (powerup.type === 'shield') {
            title = '🔷 Runas de Escudo!';
            details = `${entity.name} absorveu a runa e ganhou +8 PV Temporários e +2 de CA!`;
            addCombatLog('Mestre da Arena', title, details, 'system');

            return prevEntities.map(e => {
              if (e.id === entityId) {
                return {
                  ...e,
                  tempHp: Math.max(e.tempHp, 8),
                  ac: e.ac + 2
                };
              }
              return e;
            });
          } else if (powerup.type === 'might') {
            title = '🔥 Fúria dos Titãs!';
            details = `${entity.name} absorveu a runa: +4 de Bônus de Ataque e +4 de Dano Físico!`;
            addCombatLog('Mestre da Arena', title, details, 'system');

            return prevEntities.map(e => {
              if (e.id === entityId) {
                return {
                  ...e,
                  attackBonus: e.attackBonus + 4,
                  damageDice: e.damageDice.includes('+') ? e.damageDice + '+4' : e.damageDice + '+4'
                };
              }
              return e;
            });
          }

          return prevEntities;
        });
      }, 50);

      return prevPowerups.map(p => p.id === powerup.id ? { ...p, isCollected: true } : p);
    });

    // 3. Verificar Pontos de Descanso Longo
    setRestPoints(prevRestPoints => {
      const restPoint = prevRestPoints.find(rp => {
        const size = rp.size || 2;
        return tx >= rp.x && tx < rp.x + size && ty >= rp.y && ty < rp.y + size && !rp.isUsed;
      });
      if (!restPoint) return prevRestPoints;

      const hasLivingMonsters = entities.some(e => e.type === 'monster' && e.currentHp > 0 && !e.isDead);
      if (hasLivingMonsters) {
        addCombatLog('Mestre da Arena', '⚠️ Inimigos na área', 'Você não pode realizar um Descanso Longo no acampamento enquanto houver monstros vivos na área!', 'system');
        setFloatingTexts(prev => [...prev, {
          id: Math.random().toString(),
          x: tx,
          y: ty,
          text: '⚠️ Inimigos na área',
          color: '#f87171',
          progress: 0
        }]);
        return prevRestPoints;
      }

      setTimeout(() => {
        setPendingRestPointId(restPoint.id);
      }, 50);

      return prevRestPoints;
    });
  };

  // Movimento Direcional com Setas (D-Pad / Teclado)
  const moveHeroDirection = (dx: number, dy: number) => {
    const activeEntity = entities[activeEntityIndex];
    const isHeroActive = activeEntity && activeEntity.type === 'hero' && !activeEntity.isDead;
    const hasLivingMonsters = entities.some(e => e.type === 'monster' && !e.isDead);
    if (hasLivingMonsters && !isBattleOver && !isHeroActive) {
      addCombatLog('Mestre do Jogo', '⚠️ Turno Inimigo', 'Aguarde o seu turno para se mover!', 'system');
      return;
    }

    const hero = entities.find(e => e.type === 'hero' && !e.isDead);
    if (!hero || hero.isDead) return;

    const isGrappled = hero.conditions?.some(c => c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled');
    if (isGrappled) {
      addCombatLog('Mestre do Jogo', '⚠️ Agarrado', 'Você está sob a condição Agarrado! Sua velocidade de movimento é 0.', 'system');
      return;
    }

    const isFrightened = hero.conditions?.some(c => c === 'Amedrontado' || c === 'Amedrontado_New' || c === 'Frightened');
    if (isFrightened && hasLivingMonsters) {
      const currentClosestDist = Math.min(999, ...entities.filter(e => e.type === 'monster' && !e.isDead).map(m => getDistanceBetweenEntities(hero, m, character?.race, activeLargeForm)));
      const newClosestDist = Math.min(999, ...entities.filter(e => e.type === 'monster' && !e.isDead).map(m => getDistanceBetweenEntities({ ...hero, x: hero.x + dx, y: hero.y + dy }, m, character?.race, activeLargeForm)));
      if (newClosestDist < currentClosestDist) {
        addCombatLog('Mestre do Jogo', '😱 Amedrontado', 'Você está Amedrontado e não pode se aproximar voluntariamente da fonte do medo!', 'system');
        return;
      }
    }

    const targetX = hero.x + dx;
    const targetY = hero.y + dy;

    const heroSize = getEntitySizeInSquares(
      hero.type === 'hero' 
        ? (hero.size || (activeLargeForm ? 'Grande' : (character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio'))) 
        : (hero.size || 'Médio')
    );

    // Validação de limites e obstáculos no grid para todas as células ocupadas pelo herói
    for (let r = 0; r < heroSize; r++) {
      for (let c = 0; c < heroSize; c++) {
        const tx = targetX + c;
        const ty = targetY + r;

        if (tx < 0 || tx >= (grid[0]?.length || 150) || ty < 0 || ty >= grid.length) {
          return;
        }

        const cell = grid[ty]?.[tx];
        if (!cell || cell.terrain === 'wall' || cell.movementCost === Infinity) {
          return;
        }

        const occupied = entities.find(e => {
          if (e.id === hero.id || e.isDead) return false;
          const eSize = getEntitySizeInSquares(
            e.type === 'hero' 
              ? (e.size || (activeLargeForm ? 'Grande' : (character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio'))) 
              : (e.size || 'Médio')
          );
          return tx >= e.x && tx < e.x + eSize && ty >= e.y && ty < e.y + eSize;
        });

        if (occupied) {
          return;
        }
      }
    }

    // Calcular custo de movimento
    let stepCost = 1;
    for (let r = 0; r < heroSize; r++) {
      for (let c = 0; c < heroSize; c++) {
        const cell = grid[targetY + r]?.[targetX + c];
        if (cell && cell.movementCost > stepCost) {
          stepCost = cell.movementCost;
        }
      }
    }

    if (hasLivingMonsters && !isBattleOver && (hero.remainingMovement <= 0 || hero.remainingMovement < stepCost)) {
      addCombatLog('Mestre do Jogo', '⚠️ Movimento Esgotado', 'Seu deslocamento acabou neste turno!', 'system');
      return;
    }

    // Ataque de oportunidade dos monstros adjacentes
    const isDisengaging = hero.conditions?.includes('Desengajando');
    const isFlying = hero.conditions?.includes('Voando');
    const adjacentMonsters = entities.filter(e => e.type === 'monster' && !e.isDead);

    let opportunityAttackExecuted = false;
    if (!isBattleOver && !isDisengaging && !isFlying) {
      adjacentMonsters.forEach(monster => {
        const canMonsterSeeHero = !monster.conditions?.some(c => c === 'Cego' || c === 'Blinded') &&
                                  !hero.conditions?.some(c => c === 'Invisível' || c === 'Invisible');
        const isMonsterIncapacitated = monster.conditions?.some(c => 
          c === 'Incapacitado' || c === 'Incapacitated' ||
          c === 'Paralisado' || c === 'Paralyzed' ||
          c === 'Inconsciente' || c === 'Unconscious' ||
          c === 'Atordoado' || c === 'Stunned' ||
          c === 'Petrificado' || c === 'Petrified'
        );

        if (monster.hasReaction && !isMonsterIncapacitated && canMonsterSeeHero) {
          const monsterReach = monster.range || 1;
          const wasInReach = getDistanceBetweenEntities(hero, monster, character?.race, activeLargeForm) <= monsterReach;
          const willBeInReach = getDistanceBetweenEntities({ ...hero, x: targetX, y: targetY }, monster, character?.race, activeLargeForm) <= monsterReach;

          if (wasInReach && !willBeInReach) {
            const isIndoor = biome === 'Caverna' || biome === 'Masmorra';
            const isDarkEnv = isIndoor || (isNight && (biome === 'Floresta' || biome === 'Pântano' || biome === 'Deserto'));

            const atkRes = executeAttack(monster, hero, 'normal', undefined, {
              isDarkEnvironment: isDarkEnv,
              torches,
              heroLightRadius: getHeroLightRadiusInCells(),
              heroX: hero.x,
              heroY: hero.y
            }, entities, grid);

            opportunityAttackExecuted = true;

            addCombatLog(
              monster.name,
              `⚔️ [Ataque de Oportunidade] ` + atkRes.logTitle,
              atkRes.logDetail,
              atkRes.hit ? 'damage' : 'attack'
            );

            triggerAttackVisualEffect(
              { x: monster.x, y: monster.y },
              { x: hero.x, y: hero.y },
              false,
              atkRes.hit,
              atkRes.damage,
              atkRes.isCritical
            );

            setLatestRoll({
              id: Math.random().toString(),
              attackerName: monster.name,
              defenderName: hero.name,
              logTitle: `[Ataque de Oportunidade] ` + atkRes.logTitle,
              logDetail: atkRes.logDetail,
              isCritical: atkRes.isCritical,
              isFumble: atkRes.isFumble,
              damage: atkRes.damage,
              hit: atkRes.hit
            });

            if (atkRes.hit && atkRes.damage > 0) {
              processDamageAndCheckKill(hero.id, atkRes.damage, monster.name, 'Cortante', monster.id);
            }

            setEntities(prev => prev.map(e => e.id === monster.id ? { ...e, hasReaction: false } : e));
          }
        }
      });
    }

    // Atualizar posição do herói
    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            x: targetX,
            y: targetY,
            remainingMovement: isBattleOver ? e.remainingMovement : Math.max(0, e.remainingMovement - stepCost)
          };
        }
        return e;
      })
    );

    if (isSfxEnabled) playMoveSound();
    setMovementStepsCount(prev => prev + 1);
    if (isBattleOver) {
      setTotalGameTurns(prev => prev + 1);
    }

    checkGridTriggers(hero.id, targetX, targetY);
    expandMapIfNeeded?.(targetX, targetY);
  };

  // Clique nas Células do Canvas/Grid (Movimento ou Ataque do Jogador)
  const handleCellClick = (x: number, y: number) => {
    const activeEntity = entities[activeEntityIndex];
    const isHeroActive = activeEntity && activeEntity.type === 'hero' && !activeEntity.isDead;
    const hasLivingMonsters = entities.some(e => e.type === 'monster' && !e.isDead);
    if (hasLivingMonsters && !isBattleOver && !isHeroActive) {
      addCombatLog('Mestre do Jogo', '⚠️ Turno Inimigo', 'Aguarde o seu turno para interagir!', 'system');
      return;
    }

    const hero = entities.find(e => e.type === 'hero' && !e.isDead);
    if (!hero || hero.isDead) return;

    if (isTeleportTargetMode && isGoliath) {
      const dist = Math.max(Math.abs(hero.x - x), Math.abs(hero.y - y));
      if (dist > 6) {
        addCombatLog('Mestre do Jogo', '⚠️ Fora de Alcance', 'O destino do teleporte deve ser até 9m (6 quadrados).', 'system');
        return;
      }

      const heroSize = getEntitySizeInSquares(hero.size || 'Médio');
      for (let dx = 0; dx < heroSize; dx++) {
        for (let dy = 0; dy < heroSize; dy++) {
          const cx = x + dx;
          const cy = y + dy;
          if (cx < 0 || cx >= (grid[0]?.length || 150) || cy < 0 || cy >= grid.length) {
            addCombatLog('Mestre do Jogo', '⚠️ Fora dos Limites', 'O espaço selecionado fica fora dos limites!', 'system');
            return;
          }
          const cCell = grid[cy]?.[cx];
          if (!cCell || cCell.terrain === 'wall' || cCell.movementCost === Infinity) {
            addCombatLog('Mestre do Jogo', '⚠️ Terreno Bloqueado', 'O espaço selecionado é obstruído por obstáculos!', 'system');
            return;
          }
          const cOccupied = entities.find(e => {
            if (e.isDead || e.id === hero.id) return false;
            const eSize = getEntitySizeInSquares(e.type === 'hero' ? (e.size || (activeLargeForm ? 'Grande' : (character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio'))) : (e.size || 'Médio'));
            return cx >= e.x && cx < e.x + eSize && cy >= e.y && cy < e.y + eSize;
          });
          if (cOccupied) {
            addCombatLog('Mestre do Jogo', '⚠️ Espaço Ocupado', `Espaço obstruído por ${cOccupied.name}!`, 'system');
            return;
          }
        }
      }

      const inCombat = !isBattleOver;
      setEntities(prev => prev.map(e => e.id === hero.id ? {
        ...e,
        x,
        y,
        hasBonusAction: inCombat ? false : e.hasBonusAction
      } : e));

      setGoliathAncestryUses(prev => Math.max(0, prev - 1));
      setIsTeleportTargetMode(false);

      setFloatingTexts(prev => [
        ...prev,
        { id: Math.random().toString(), x: hero.x, y: hero.y, text: '🌌', color: '#a855f7', progress: 0 },
        { id: Math.random().toString(), x: x, y: y, text: '🌌 Teleporte!', color: '#a855f7', progress: 0 }
      ]);

      addCombatLog(hero.name, '🌌 PASSO DAS NUVENS (TELEPORTE)', 'Você se desmaterializou e reapareceu instantaneamente em um piscar de olhos!', 'system');
      checkGridTriggers(hero.id, x, y);
      return;
    }

    const restPointOnCell = restPoints.find(rp => {
      const size = rp.size || 2;
      return x >= rp.x && x < rp.x + size && y >= rp.y && y < rp.y + size;
    });
    if (restPointOnCell) {
      const size = restPointOnCell.size || 2;
      let minDistance = Infinity;
      for (let dr = 0; dr < size; dr++) {
        for (let dc = 0; dc < size; dc++) {
          const cx = restPointOnCell.x + dc;
          const cy = restPointOnCell.y + dr;
          const d = Math.max(Math.abs(hero.x - cx), Math.abs(hero.y - cy));
          if (d < minDistance) minDistance = d;
        }
      }
      if (minDistance <= 1) {
        const hasLivingMonsters = entities.some(e => e.type === 'monster' && e.currentHp > 0 && !e.isDead);
        if (hasLivingMonsters) {
          addCombatLog('Mestre da Arena', '⚠️ Inimigos na área', 'Você não pode realizar um Descanso Longo no acampamento enquanto houver monstros vivos na área!', 'system');
          setFloatingTexts(prev => [...prev, {
            id: Math.random().toString(),
            x,
            y,
            text: '⚠️ Inimigos na área',
            color: '#f87171',
            progress: 0
          }]);
          return;
        }

        setPendingRestPointId(restPointOnCell.id);
        return;
      }
    }

    const targetMonster = entities.find(e => {
      if (e.type !== 'monster' || e.isDead || !isEntityVisible(e)) return false;
      const eSize = getEntitySizeInSquares(e.size || 'Médio');
      return x >= e.x && x < e.x + eSize && y >= e.y && y < e.y + eSize;
    });
    if (targetMonster && (hero.hasAction || (hero.attacksRemaining || 0) > 0)) {
      const dist = getDistanceBetweenEntities(hero, targetMonster, character?.race, activeLargeForm);
      const atkToUse = currentSelectedAttack;
      const maxRangeCells = getWeaponMaxRangeCells(atkToUse);
      if (dist <= maxRangeCells) {
        processHeroAttackExecution(hero, targetMonster, atkToUse);
        return;
      }
    }

    const uncollectedLootOnCell = droppedLoot.find(loot => loot.x === x && loot.y === y && !loot.isCollected);
    if (uncollectedLootOnCell) {
      const dist = Math.max(Math.abs(hero.x - x), Math.abs(hero.y - y));
      if (dist <= 1) {
        collectLootItem(uncollectedLootOnCell.id);
        return;
      }
    }

    const closedChestOnCell = chests.find(c => c.x === x && c.y === y && !c.isOpened);
    if (closedChestOnCell) {
      const dist = Math.max(Math.abs(hero.x - x), Math.abs(hero.y - y));
      if (dist <= 1) {
        openChest(closedChestOnCell.id);
        return;
      }
    }

    const dx = x - hero.x;
    const dy = y - hero.y;

    if (dx === 0 && dy === 0) return;

    let dirX = 0;
    let dirY = 0;

    if (dx > 0) dirX = 1;
    else if (dx < 0) dirX = -1;

    if (dy > 0) dirY = 1;
    else if (dy < 0) dirY = -1;

    moveHeroDirection(dirX, dirY);
  };

  return {
    checkGridTriggers,
    moveHeroDirection,
    handleCellClick,
  };
}
