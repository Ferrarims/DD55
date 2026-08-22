import React from 'react';
import { CombatEntity } from '../../../../game/types';
import { calculateSkillBonus, rollSkillCheck } from '../../../../game/skills/skillsEngine';

export interface UseGridHazardsProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  character: any;
  activeLargeForm: boolean;
  isHalfling: boolean;
  secondWindUses: number;
  hasHeroicInspiration: boolean;
  hazards: any[];
  setHazards: React.Dispatch<React.SetStateAction<any[]>>;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setPendingHalflingLuckInfo: (info: any) => void;
  setPendingHeroicInspirationInfo: (info: any) => void;
  setPendingTacticalMindInfo: (info: any) => void;
  setShowTacticalMindAlertModal: (val: boolean) => void;
  setFloatingTexts?: React.Dispatch<React.SetStateAction<any[]>>;
}

export function useGridHazards({
  entities,
  setEntities,
  character,
  activeLargeForm,
  isHalfling,
  secondWindUses,
  hasHeroicInspiration,
  hazards,
  setHazards,
  addCombatLog,
  setPendingHalflingLuckInfo,
  setPendingHeroicInspirationInfo,
  setPendingTacticalMindInfo,
  setShowTacticalMindAlertModal,
  setFloatingTexts,
}: UseGridHazardsProps) {
  const checkHazards = (entityId: string, tx: number, ty: number) => {
    setHazards(prevHazards => {
      const hazard = prevHazards.find(h => h.x === tx && h.y === ty && !h.isTriggered && !h.isDisarmed);
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

          // Auto-falha em salvaguardas de FOR e DES sob Paralisado, Inconsciente, Atordoado ou Petrificado
          const autoFailsStrDex = (isStrSave || !isConSave) && entity.conditions?.some(c => 
            c === 'Paralisado' || c === 'Paralyzed' ||
            c === 'Inconsciente' || c === 'Unconscious' ||
            c === 'Atordoado' || c === 'Stunned' ||
            c === 'Petrificado' || c === 'Petrified'
          );

          // Desvantagem em DES sob Contido
          const hasDexDisadvantage = !isConSave && !isStrSave && entity.conditions?.some(c => 
            c === 'Contido' || c === 'Restringido' || c === 'Restrained'
          );

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
          } else if (hasDexDisadvantage) {
            const d2 = Math.floor(Math.random() * 20) + 1;
            saveRollD20 = Math.min(saveRollD20, d2);
            rollTextLabel = `d20(${saveRollD20} com Desvantagem de Contido)`;
          }

          const exhaustionLevel = entity.type === 'hero' ? (character?.exhaustion_level || entity.exhaustionLevel || 0) : (entity.exhaustionLevel || 0);
          const saveTotal = saveRollD20 + statMod - (exhaustionLevel * 2);
          const passedSave = !autoFailsStrDex && saveTotal >= dc;

          const applyHazardFinal = (finalDmg: number, passed: boolean) => {
            let title = '';
            let details = '';

            if (hazard.type === 'spikes') {
              title = passed ? '⚙️ Armadilha de Espinhos (Resistiu!)' : '⚙️ Armadilha de Espinhos!';
              details = `${entity.name} acionou espinhos de ferro. Teste ${checkType} (CD ${dc}): ${autoFailsStrDex ? 'Falha Automática por Condição' : `${rollTextLabel}+${statMod}${exhaustionLevel > 0 ? `-${exhaustionLevel*2}` : ''}=${saveTotal}`} (${passed ? 'Passou! Metade do dano' : 'Falhou'}). Sofreu ${finalDmg} de dano perfurante e perdeu o restante do movimento!`;
            } else if (hazard.type === 'mushrooms') {
              title = passed ? '🍄 Esporos Venenosos (Resistiu!)' : '🍄 Esporos Venenosos!';
              details = `${entity.name} pisou em cogumelos tóxicos. Teste ${checkType} (CD ${dc}): ${rollTextLabel}+${statMod}${exhaustionLevel > 0 ? `-${exhaustionLevel*2}` : ''}=${saveTotal} (${passed ? 'Passou! Metade do dano' : 'Falhou'}). Sofreu ${finalDmg} de dano de veneno${!passed ? ' e ficou Envenenado (Poisoned)!' : '!'}`;
            } else if (hazard.type === 'fire_vent') {
              title = passed ? '🔥 Gêiser de Fogo (Resistiu!)' : '🔥 Gêiser de Fogo!';
              details = `${entity.name} acionou uma erupção de lava. Teste ${checkType} (CD ${dc}): ${autoFailsStrDex ? 'Falha Automática por Condição' : `${rollTextLabel}+${statMod}${exhaustionLevel > 0 ? `-${exhaustionLevel*2}` : ''}=${saveTotal}`} (${passed ? 'Passou! Metade do dano' : 'Falhou'}). Sofreu ${finalDmg} de dano de fogo!`;
            } else if (hazard.type === 'mud') {
              title = passed ? '🟤 Poça de Lama (Resistiu!)' : '🟤 Poça de Lama Profunda!';
              details = `${entity.name} pisou em lama espessa. Teste ${checkType} (CD ${dc}): ${autoFailsStrDex ? 'Falha Automática por Condição' : `${rollTextLabel}+${statMod}${exhaustionLevel > 0 ? `-${exhaustionLevel*2}` : ''}=${saveTotal}`} (${passed ? 'Passou! Livre' : 'Falhou'}). ${passed ? 'Conseguiu se soltar facilmente.' : 'Ficou atolado e perdeu o restante do movimento!'}`;
            } else if (hazard.type === 'web') {
              title = passed ? '🕸️ Teia Escondida (Resistiu!)' : '🕸️ Teia de Aranha!';
              details = `${entity.name} esbarrou numa teia pegajosa. Teste ${checkType} (CD ${dc}): ${autoFailsStrDex ? 'Falha Automática por Condição' : `${rollTextLabel}+${statMod}${exhaustionLevel > 0 ? `-${exhaustionLevel*2}` : ''}=${saveTotal}`} (${passed ? 'Passou! Livre' : 'Falhou'}). ${passed ? 'Rasgou a teia a tempo.' : 'Ficou Contido (Restrained) na teia!'}`;
            }

            addCombatLog('Mestre da Arena', title, details, 'damage');

            if (hazard.type === 'mushrooms') {
              setTimeout(() => {
                setEntities(currentEnts =>
                  currentEnts.map(e => {
                    if (e.id !== entityId && !e.isDead && Math.max(Math.abs(e.x - tx), Math.abs(e.y - ty)) <= 1) {
                      const areaDmg = Math.floor(finalDmg / 2);
                      const newHp = Math.max(0, e.currentHp - areaDmg);
                      const conds = (!passed && !e.conditions.includes('Envenenado')) ? [...e.conditions, 'Envenenado'] : e.conditions;
                      addCombatLog('Mestre da Arena', '🍄 Nuvem de Esporos', `${e.name} estava por perto e sofreu ${areaDmg} de dano colateral de veneno!`, 'damage');
                      return {
                        ...e,
                        currentHp: newHp,
                        isDead: newHp <= 0,
                        conditions: conds
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
                  let updatedConditions = [...e.conditions];
                  if (!passed && hazard.type === 'mushrooms' && !updatedConditions.includes('Envenenado')) {
                    updatedConditions.push('Envenenado');
                  }
                  if (!passed && hazard.type === 'web' && !updatedConditions.includes('Contido')) {
                    updatedConditions.push('Contido');
                  }

                  let updated = {
                    ...e,
                    currentHp: newHp,
                    isDead,
                    conditions: updatedConditions
                  };
                  if (hazard.type === 'spikes' || hazard.type === 'mud' || hazard.type === 'web') {
                    updated.remainingMovement = 0;
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
  };

  /**
   * Avalia a Percepção Passiva do herói ao se aproximar de armadilhas ocultas
   */
  const checkPassiveHazardDetection = (heroX: number, heroY: number) => {
    const perceptionCalc = calculateSkillBonus(character, 'perception');
    const passivePerception = perceptionCalc.passiveScore;

    setHazards(prevHazards => {
      let anyRevealed = false;
      const updated = prevHazards.map(h => {
        if (!h.isHidden || h.isTriggered || h.isDisarmed) return h;
        const dist = Math.max(Math.abs(h.x - heroX), Math.abs(h.y - heroY));
        const detectionDC = h.dc || 12;

        // Se estiver no raio sensorial de até 4 células e a percepção passiva superar a CD
        if (dist <= 4 && passivePerception >= detectionDC) {
          anyRevealed = true;
          addCombatLog(
            'Mestre da Arena',
            '👁️ [PERCEPÇÃO PASSIVA] Armadilha Avistada!',
            `Sua Percepção Passiva (${passivePerception}) revelou ${h.name} oculta no chão (${h.x}, ${h.y}) antes de pisar nela!`,
            'system'
          );
          if (setFloatingTexts) {
            setFloatingTexts(prev => [
              ...prev,
              { id: Math.random().toString(), x: h.x, y: h.y, text: '👁️ Armadilha Revelada!', color: '#38bdf8', progress: 0 }
            ]);
          }
          return { ...h, isHidden: false };
        }
        return h;
      });

      return anyRevealed ? updated : prevHazards;
    });
  };

  /**
   * Desarma uma armadilha revelada usando Prestidigitação (Sleight of Hand) ou Investigação (Investigation)
   */
  const handleDisarmHazard = (hazardId: string) => {
    const hero = entities.find(e => e.type === 'hero' && !e.isDead);
    if (!hero) return;

    const targetHazard = hazards.find(h => h.id === hazardId && !h.isTriggered && !h.isDisarmed);
    if (!targetHazard) {
      addCombatLog('Mestre do Jogo', '⚠️ Armadilha Indisponível', 'Esta armadilha já foi desarmada ou disparada.', 'system');
      return;
    }

    const dist = Math.max(Math.abs(targetHazard.x - hero.x), Math.abs(targetHazard.y - hero.y));
    if (dist > 1) {
      addCombatLog('Mestre do Jogo', '⚠️ Muito Distante', 'Você precisa estar adjacente à armadilha para desarmá-la!', 'system');
      return;
    }

    // Seleciona a melhor perícia entre Prestidigitação e Investigação
    const sleightCalc = calculateSkillBonus(character, 'sleight_of_hand');
    const investCalc = calculateSkillBonus(character, 'investigation');
    const bestSkillKey = sleightCalc.totalBonus >= investCalc.totalBonus ? 'sleight_of_hand' : 'investigation';

    const dc = targetHazard.dc || 13;
    const rollRes = rollSkillCheck(character, bestSkillKey, {
      dc,
      reason: `Desarmar ${targetHazard.name}`
    });

    if (rollRes.passed) {
      setHazards(prev =>
        prev.map(h => (h.id === hazardId ? { ...h, isDisarmed: true, isTriggered: true, isHidden: false } : h))
      );
      if (setFloatingTexts) {
        setFloatingTexts(prev => [
          ...prev,
          { id: Math.random().toString(), x: targetHazard.x, y: targetHazard.y, text: '🛠️ Desarmada! (+25 XP)', color: '#10b981', progress: 0 }
        ]);
      }
      addCombatLog(
        hero.name,
        `🛠️ DESARMOU ARMADILHA!`,
        `${rollRes.logText}. O mecanismo de ${targetHazard.name} foi travado e neutralizado com segurança! (+25 XP)`,
        'system'
      );
    } else {
      // Falha Crítica ou falha por 5+ dispara a armadilha
      const isCriticalDisaster = rollRes.isCrit1 || (rollRes.total <= dc - 5);
      if (isCriticalDisaster) {
        addCombatLog(
          hero.name,
          `💥 FALHA CRÍTICA AO DESARMAR!`,
          `${rollRes.logText}. Um deslize ao manipular os componentes acionou a armadilha instantaneamente!`,
          'damage'
        );
        checkHazards(hero.id, targetHazard.x, targetHazard.y);
      } else {
        addCombatLog(
          hero.name,
          `⚠️ Falha ao Desarmar`,
          `${rollRes.logText}. As engrenagens estão emperradas. Você não conseguiu desarmar, mas a armadilha não disparou.`,
          'system'
        );
      }
    }
  };

  /**
   * Ação ativa de Investigar Área / Procurar Perigos (Investigação ou Percepção ativa)
   */
  const handleActiveSearch = (heroX: number, heroY: number) => {
    const hero = entities.find(e => e.type === 'hero' && !e.isDead);
    if (!hero) return;

    const perceptionCalc = calculateSkillBonus(character, 'perception');
    const investCalc = calculateSkillBonus(character, 'investigation');
    const bestSkillKey = investCalc.totalBonus >= perceptionCalc.totalBonus ? 'investigation' : 'perception';

    const rollRes = rollSkillCheck(character, bestSkillKey, {
      reason: 'Investigar Área por Armadilhas e Mecanismos'
    });

    let foundCount = 0;
    setHazards(prevHazards => {
      return prevHazards.map(h => {
        if (!h.isHidden || h.isTriggered || h.isDisarmed) return h;
        const dist = Math.max(Math.abs(h.x - heroX), Math.abs(h.y - heroY));
        const dc = h.dc || 12;
        if (dist <= 6 && rollRes.total >= dc) {
          foundCount++;
          return { ...h, isHidden: false };
        }
        return h;
      });
    });

    if (foundCount > 0) {
      addCombatLog(
        hero.name,
        `🔍 INVESTIGAÇÃO DE ÁREA - SUCESSO!`,
        `${rollRes.logText}. Você examinou os arredores e descobriu ${foundCount} armadilha(s) oculta(s)!`,
        'system'
      );
      if (setFloatingTexts) {
        setFloatingTexts(prev => [
          ...prev,
          { id: Math.random().toString(), x: heroX, y: heroY, text: `🔍 ${foundCount} Armadilha(s) Revelada(s)!`, color: '#38bdf8', progress: 0 }
        ]);
      }
    } else {
      addCombatLog(
        hero.name,
        `🔍 INVESTIGAÇÃO DE ÁREA`,
        `${rollRes.logText}. Você analisou o solo e paredes ao redor mas não encontrou novas armadilhas ocultas.`,
        'system'
      );
    }
  };

  return {
    checkHazards,
    checkPassiveHazardDetection,
    handleDisarmHazard,
    handleActiveSearch,
  };
}
