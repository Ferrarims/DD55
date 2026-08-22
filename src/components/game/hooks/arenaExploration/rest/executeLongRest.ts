import { RACES_REFERENCE } from '../../../../../lib/api/references';
import { updateCharacter } from '../../../../../lib/api/characterService';
import { UseArenaRestPointsProps } from '../useArenaRestPoints';

export function executeLongRest(
  props: UseArenaRestPointsProps,
  restPointId: string
): void {
  const {
    character,
    addCombatLog,
    setFloatingTexts,
    entities,
    setEntities,
    restPoints,
    setRestPoints,
    totalGameTurns,
    setTotalGameTurns,
    setMovementStepsCount,
    lastMealTurn,
    lastShortRestTurn,
    lastLongRestTurn,
    prevTurns,
    activeRevelation,
    setActiveRevelation,
    setActiveDraconicFlight,
    setActiveLargeForm,

    secondWindMaxUses,
    healingHandsMaxUses,
    actionSurgeMaxUses,
    rageMaxUses,
    channelDivinityMaxUses,
    spellSlotsMax,
    indomitableMaxUses,
    superiorityDiceMaxUses,
    bardicInspirationMaxUses,
    layOnHandsMaxPool,
    focusPointsMaxUses,
    wildShapeMaxUses,
    luckyMaxPoints,
    draconicFlightMaxUses,
    largeFormMaxUses,
    goliathAncestryMaxUses,
    adrenalineRushMaxUses,
    relentlessEnduranceMaxUses,
    isHuman,

    setSecondWindUses,
    setHealingHandsUses,
    setActionSurgeUses,
    setRageUses,
    setChannelDivinityUses,
    setSpellSlots,
    setIndomitableUses,
    setSuperiorityDiceUses,
    setBardicInspirationUses,
    setLayOnHandsPool,
    setFocusPointsUses,
    setWildShapeUses,
    setLuckyPoints,
    setDraconicFlightUses,
    setDraconicFlightRoundsLeft,
    setLargeFormUses,
    setLargeFormRoundsLeft,
    setGoliathAncestryUses,
    setAdrenalineRushUses,
    setRelentlessEnduranceUses,
    setHasHeroicInspiration,
  } = props;

  const rp = restPoints.find(r => r.id === restPointId && !r.isUsed);
  if (!rp) return;

  const hasLivingMonsters = entities.some(e => e.type === 'monster' && e.currentHp > 0 && !e.isDead);
  if (hasLivingMonsters) {
    addCombatLog('Mestre da Arena', '⚠️ Inimigos na área', 'Você não pode realizar um Descanso Longo enquanto houver monstros vivos na área!', 'system');
    return;
  }

  const hero = entities.find(e => e.type === 'hero');
  if (!hero) return;

  if (hero.currentHp < 1) {
    addCombatLog('Mestre da Arena', '⚠️ Inconsciente', 'Você precisa ter pelo menos 1 Ponto de Vida para iniciar um Descanso Longo!', 'system');
    return;
  }

  setActiveDraconicFlight(false);
  setActiveLargeForm(false);
  if (activeRevelation === 'Alma Radiante') {
    setActiveRevelation(null);
  }

  const charLevel = character?.level || 1;
  const currentExhaustion = character?.exhaustion_level ?? hero.exhaustionLevel ?? 0;
  const newExhaustion = Math.max(0, currentExhaustion - 1);

  setEntities(prevEntities =>
    prevEntities.map(e => {
      if (e.id === hero.id) {
        let updatedConditions = e.conditions.filter(c => c !== 'Voando');
        if (newExhaustion === 0) {
          updatedConditions = updatedConditions.filter(c => c !== 'Exaustão' && c !== 'Exhaustion');
        } else if (!updatedConditions.includes('Exaustão')) {
          updatedConditions.push('Exaustão');
        }

        return {
          ...e,
          currentHp: e.maxHp,
          tempHp: 0,
          hasAction: true,
          hasBonusAction: true,
          hasReaction: true,
          size: character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio',
          exhaustionLevel: newExhaustion,
          conditions: updatedConditions
        };
      }
      return e;
    })
  );

  if (character) {
    character.hit_dice_current = charLevel;
    character.exhaustion_level = newExhaustion;
    
    const resources = character.class_resources ? [...character.class_resources] : [];
    const waterResource = resources.find((r: any) => r.name === "Cantil de Água");
    if (waterResource) {
      waterResource.used = 0;
    }
    character.class_resources = resources;

    if (character.id) {
      updateCharacter(character.id, {
        current_hp: hero.maxHp,
        hit_dice_current: charLevel,
        exhaustion_level: newExhaustion,
        class_resources: resources
      }).catch(err => console.warn('Erro ao atualizar descanso longo no Supabase:', err));
    }
  }

  setSecondWindUses(secondWindMaxUses);
  setHealingHandsUses(healingHandsMaxUses);
  setActionSurgeUses(actionSurgeMaxUses);
  setRageUses(rageMaxUses);
  setChannelDivinityUses(channelDivinityMaxUses);
  setSpellSlots(spellSlotsMax);
  setIndomitableUses(indomitableMaxUses);
  setSuperiorityDiceUses(superiorityDiceMaxUses);
  setBardicInspirationUses(bardicInspirationMaxUses);
  setLayOnHandsPool(layOnHandsMaxPool);
  setFocusPointsUses(focusPointsMaxUses);
  setWildShapeUses(wildShapeMaxUses);
  setLuckyPoints(luckyMaxPoints);
  setDraconicFlightUses(draconicFlightMaxUses);
  setDraconicFlightRoundsLeft(100);
  setLargeFormUses(largeFormMaxUses);
  setLargeFormRoundsLeft(100);
  setGoliathAncestryUses(goliathAncestryMaxUses);
  setAdrenalineRushUses(adrenalineRushMaxUses);
  setRelentlessEnduranceUses(relentlessEnduranceMaxUses);
  setHasHeroicInspiration(isHuman);

  setFloatingTexts(prev => [...prev, {
    id: Math.random().toString(),
    x: hero.x,
    y: hero.y,
    text: '🏕️ DESCANSO LONGO!',
    color: '#fbbf24',
    progress: 0
  }]);

  addCombatLog(
    'Mestre da Arena',
    '🏕️ DESCANSO LONGO REALIZADO!',
    `Seu herói descansou no Acampamento! Pontos de Vida (100%), Espaços de Magia, Fúrias, Surtos e todas as habilidades foram completamente restaurados!`,
    'heal'
  );

  setRestPoints(prev => prev.filter(r => r.id !== restPointId));

  const newTurns = totalGameTurns + 133;
  prevTurns.current = newTurns;
  lastLongRestTurn.current = newTurns;
  lastShortRestTurn.current = newTurns;
  lastMealTurn.current = newTurns;
  setTotalGameTurns(newTurns);
  setMovementStepsCount(0);
}
