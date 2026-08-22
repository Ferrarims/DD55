import { CombatEntity } from '../../../../game/types';
import { updateCharacter } from '../../../../lib/api/characterService';
import { UseArenaCombatInitializerProps } from './useArenaCombatInitializer';

export function resetResourcesOnLongRest(props: UseArenaCombatInitializerProps) {
  const {
    character,
    secondWindMaxUses,
    healingHandsMaxUses,
    celestialRevelationMaxUses,
    draconicFlightMaxUses,
    largeFormMaxUses,
    goliathAncestryMaxUses,
    adrenalineRushMaxUses,
    relentlessEnduranceMaxUses,
    isHuman,
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

    setSecondWindUses,
    setHealingHandsUses,
    setCelestialRevelationUses,
    setDraconicFlightUses,
    setActiveDraconicFlight,
    setDraconicFlightRoundsLeft,
    setLargeFormUses,
    setActiveLargeForm,
    setLargeFormRoundsLeft,
    setGoliathAncestryUses,
    setAdrenalineRushUses,
    setRelentlessEnduranceUses,
    setHasHeroicInspiration,
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
  } = props;

  setSecondWindUses(secondWindMaxUses);
  setHealingHandsUses(healingHandsMaxUses);

  if (character) {
    const newExhaustion = Math.max(0, (character.exhaustion_level || 0) - 1);
    character.exhaustion_level = newExhaustion;
    
    const resources = character.class_resources ? [...character.class_resources] : [];
    const resetRes = resources.map((r: any) => r ? { ...r, used: 0 } : r);
    character.class_resources = resetRes;

    if (character.id) {
      updateCharacter(character.id, { exhaustion_level: newExhaustion, class_resources: resetRes }).catch(err => console.warn(err));
    }
  }

  setCelestialRevelationUses(celestialRevelationMaxUses);
  setDraconicFlightUses(draconicFlightMaxUses);
  setActiveDraconicFlight(false);
  setDraconicFlightRoundsLeft(100);
  setLargeFormUses(largeFormMaxUses);
  setActiveLargeForm(false);
  setLargeFormRoundsLeft(100);
  setGoliathAncestryUses(goliathAncestryMaxUses);
  setAdrenalineRushUses(adrenalineRushMaxUses);
  setRelentlessEnduranceUses(relentlessEnduranceMaxUses);
  setHasHeroicInspiration(isHuman);
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
}

export function restoreResourcesOnShortRest(
  props: UseArenaCombatInitializerProps,
  entities: CombatEntity[],
  heroMaxHp: number
): { heroCurrentHp: number; heroTempHp: number } {
  const {
    character,
    secondWindMaxUses,
    actionSurgeMaxUses,
    channelDivinityMaxUses,
    adrenalineRushMaxUses,
    spellSlotsMax,
    setAdrenalineRushUses,
    setSecondWindUses,
    setActionSurgeUses,
    setChannelDivinityUses,
    setSpellSlots,
  } = props;

  const className = (character.class_name || character.charClass || '').toLowerCase();

  setAdrenalineRushUses(adrenalineRushMaxUses);
  setSecondWindUses(prev => Math.min(secondWindMaxUses, prev + 1));
  setActionSurgeUses(actionSurgeMaxUses);
  setChannelDivinityUses(prev => Math.min(channelDivinityMaxUses, prev + 1));

  if (className.includes('bruxo') || className.includes('warlock')) {
    setSpellSlots(spellSlotsMax);
  }

  if (character && Array.isArray(character.class_resources)) {
    const updatedResources = character.class_resources.map((r: any) => {
      if (!r) return r;
      const name = (r.name || '').toLowerCase();
      if (name.includes('fôlego') || name.includes('folego') || name.includes('second wind')) {
        const currentUsed = typeof r.used === 'number' ? r.used : 0;
        return { ...r, used: Math.max(0, currentUsed - 1) };
      }
      if (r.reset === 'short' || r.reset === 'short/long') {
        return { ...r, used: 0 };
      }
      return r;
    });
    character.class_resources = updatedResources;
    if (character.id) {
      updateCharacter(character.id, { class_resources: updatedResources }).catch(err => console.warn(err));
    }
  }

  const currentHero = entities.find(e => e.type === 'hero');
  const prevHp = (currentHero && currentHero.currentHp > 0) ? currentHero.currentHp : (character.current_hp ?? heroMaxHp);

  let hitDieSides = 8;
  if (className.includes('bárbaro') || className.includes('barbarian')) hitDieSides = 12;
  else if (className.includes('guerreiro') || className.includes('fighter') || className.includes('paladino') || className.includes('paladin') || className.includes('patrulheiro') || className.includes('ranger')) hitDieSides = 10;
  else if (className.includes('mago') || className.includes('wizard') || className.includes('feiticeiro') || className.includes('sorcerer')) hitDieSides = 6;

  const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
  const heroLevel = Number(character.level) || 1;

  let totalHealRoll = 0;
  for (let i = 0; i < heroLevel; i++) {
    const dieRoll = Math.floor(Math.random() * hitDieSides) + 1;
    totalHealRoll += Math.max(1, dieRoll + conMod);
  }

  const heroCurrentHp = Math.min(heroMaxHp, prevHp + totalHealRoll);
  const heroTempHp = currentHero ? currentHero.tempHp : 0;

  return { heroCurrentHp, heroTempHp };
}
