import { CombatEntity, GridPosition } from '../../../../game/types';
import { getRaceInfo, getRaceIcon, RACES_REFERENCE } from '../../../../lib/api/references';

/**
 * Cria a entidade combatente do herói a partir do perfil do personagem.
 */
export function createHeroEntity(
  character: any,
  spawnPos: GridPosition,
  heroMaxHp: number,
  heroCurrentHp: number,
  heroTempHp: number,
  heroSpeedGridCells: number
): CombatEntity {
  const raceInfo = character?.race ? getRaceInfo(character.race) : null;
  let heroHasDarkvision = false;
  let heroDarkvisionRange = 0;
  if (raceInfo) {
    const trait = raceInfo.traits.find(t => t.name.toLowerCase().includes('visão no escuro'));
    if (trait) {
      heroHasDarkvision = true;
      heroDarkvisionRange = trait.name.includes('36') || trait.description.toLowerCase().includes('36') ? 36 : 18;
    }
  }

  const heroDexMod = Math.floor(((character?.dexterity || 10) - 10) / 2);
  const heroInit = Math.floor(Math.random() * 20) + 1 + heroDexMod;
  const heroAc = character?.armor_class ?? character?.armorClass ?? character?.ac ?? (10 + heroDexMod);

  return {
    id: 'hero',
    name: character?.name || 'Herói',
    type: 'hero',
    x: spawnPos.x,
    y: spawnPos.y,
    maxHp: heroMaxHp,
    currentHp: heroCurrentHp,
    tempHp: heroTempHp,
    armor_class: heroAc,
    ac: heroAc,
    speed: heroSpeedGridCells,
    remainingMovement: 0,
    initiative: heroInit,
    icon: character?.avatar_url || getRaceIcon(character?.race || character?.charRace || character?.species, character?.icon),
    color: '#3b82f6',
    attackBonus: 0,
    damageDice: '1d8',
    range: 1.5,
    hasAction: false,
    hasBonusAction: false,
    hasReaction: false,
    isDead: (character?.exhaustion_level || 0) >= 6 || heroCurrentHp <= 0,
    attacksRemaining: 0,
    conditions: (character?.exhaustion_level || 0) > 0 ? ['Exaustão'] : [],
    exhaustionLevel: character?.exhaustion_level || 0,
    hasDarkvision: heroHasDarkvision,
    darkvisionRange: heroDarkvisionRange,
    size: character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio',
    level: character?.level || 1,
    charClass: character?.class_name || character?.charClass || character?.class || '',
    stats: {
      str: character?.strength ?? character?.str ?? 10,
      dex: character?.dexterity ?? character?.dex ?? 10,
      con: character?.constitution ?? character?.con ?? 10,
      int: character?.intelligence ?? character?.int ?? 10,
      wis: character?.wisdom ?? character?.wis ?? 10,
      cha: character?.charisma ?? character?.cha ?? 10
    },
    feats: character?.feats ? (Array.isArray(character.feats) ? [...character.feats] : [character.feats]) : [],
    fightingStyle: character?.fighting_style || character?.fightingStyle || undefined
  };
}
