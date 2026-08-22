import { updateCharacter } from '../../../../../lib/api/characterService';
import { UseArenaRestPointsProps } from '../useArenaRestPoints';

export function executeShortRest(
  props: UseArenaRestPointsProps,
  restPointId: string
): void {
  const {
    character,
    onCharacterUpdated,
    addCombatLog,
    setFloatingTexts,
    entities,
    setEntities,
    restPoints,
    setRestPoints,
    totalGameTurns,
    setTotalGameTurns,
    setMovementStepsCount,
    lastShortRestTurn,
    prevTurns,
    activeRevelation,
    setActiveRevelation,
    setActiveDraconicFlight,

    secondWindMaxUses,
    actionSurgeMaxUses,
    channelDivinityMaxUses,
    spellSlotsMax,
    focusPointsMaxUses,
    adrenalineRushMaxUses,

    setSecondWindUses,
    setActionSurgeUses,
    setChannelDivinityUses,
    setSpellSlots,
    setFocusPointsUses,
    setAdrenalineRushUses,
  } = props;

  const rp = restPoints.find(r => r.id === restPointId && !r.isUsed);
  if (!rp) return;

  const hasLivingMonsters = entities.some(e => e.type === 'monster' && e.currentHp > 0 && !e.isDead);
  if (hasLivingMonsters) {
    addCombatLog('Mestre da Arena', '⚠️ Inimigos na área', 'Você não pode realizar um Descanso Curto enquanto houver monstros vivos na área!', 'system');
    return;
  }

  const hero = entities.find(e => e.type === 'hero');
  if (!hero) return;

  if (hero.currentHp < 1) {
    addCombatLog('Mestre da Arena', '⚠️ Inconsciente', 'Você precisa ter pelo menos 1 Ponto de Vida para iniciar um Descanso Curto!', 'system');
    return;
  }

  setActiveDraconicFlight(false);
  if (activeRevelation === 'Alma Radiante') {
    setActiveRevelation(null);
  }

  const className = (character.class_name || character.charClass || '').toLowerCase();
  
  setSecondWindUses(prev => Math.min(secondWindMaxUses, prev + 1));
  setActionSurgeUses(actionSurgeMaxUses);
  setChannelDivinityUses(prev => Math.min(channelDivinityMaxUses, prev + 1));
  setAdrenalineRushUses(adrenalineRushMaxUses);
  if (className.includes('bruxo') || className.includes('warlock')) {
    setSpellSlots(spellSlotsMax);
  }
  setFocusPointsUses(prev => Math.min(focusPointsMaxUses, prev + 1));

  const currentHitDice = character.hit_dice_current ?? character.level ?? 1;
  let hitDieSides = 8;
  if (className.includes('bárbaro') || className.includes('barbarian')) hitDieSides = 12;
  else if (className.includes('guerreiro') || className.includes('fighter') || className.includes('paladino') || className.includes('paladin') || className.includes('patrulheiro') || className.includes('ranger')) hitDieSides = 10;
  else if (className.includes('mago') || className.includes('wizard') || className.includes('feiticeiro') || className.includes('sorcerer')) hitDieSides = 6;

  const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
  let rollHp = 0;
  let diceSpent = Math.min(currentHitDice, 1);
  if (currentHitDice > 0) {
    const dieRoll = Math.floor(Math.random() * hitDieSides) + 1;
    rollHp = Math.max(1, dieRoll + conMod);
  }

  const newHp = Math.min(hero.maxHp, hero.currentHp + rollHp);
  const recovered = newHp - hero.currentHp;
  const newHitDice = Math.max(0, currentHitDice - diceSpent);

  if (character) {
    character.current_hp = newHp;
    character.hit_dice_current = newHitDice;
    if (character.id) {
      updateCharacter(character.id, {
        current_hp: newHp,
        hit_dice_current: newHitDice
      }).catch(err => console.error("Error updating short rest in DB:", err));
    }
  }

  setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, currentHp: newHp, hasAction: false } : e));

  if (onCharacterUpdated) {
    onCharacterUpdated();
  }

  const newTurns = totalGameTurns + 17;
  prevTurns.current = newTurns;
  lastShortRestTurn.current = newTurns;
  setTotalGameTurns(newTurns);
  setMovementStepsCount(0);

  setFloatingTexts(prev => [...prev, {
    id: Math.random().toString(),
    x: hero.x,
    y: hero.y,
    text: '☕ DESCANSO CURTO (1h)!',
    color: '#34d399',
    progress: 0
  }]);

  addCombatLog(
    'Mestre da Arena',
    '☕ DESCANSO CURTO REALIZADO (1 Hora)',
    `Seu herói realizou um Descanso Curto de 1 hora no Acampamento. Gastou ${diceSpent} Dado(s) de Vida, recuperou +${recovered} PV e recarregou habilidades de Descanso Curto.`,
    'heal'
  );

  setRestPoints(prev => prev.filter(r => r.id !== restPointId));
}
