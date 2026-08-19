import { BACKGROUNDS_REFERENCE, RACES_REFERENCE, CLASS_REFERENCE } from '../../../lib/api/references';

const iconMap: Record<string, string> = { "Aasimar": "👼", "Anão": "🧔", "Draconato": "🐉", "Elfo": "🧝", "Gnomo": "🧙‍♂️", "Golias": "🪨", "Humano": "👤", "Orc": "👹", "Pequenino": "🧒", "Tiferino": "😈" };
export const RACES = Object.entries(RACES_REFERENCE).map(([id, race]) => ({
  id,
  name: race.name,
  icon: race.icon || iconMap[race.name] || "👤",
  desc: race.traits.slice(0, 3).map(t => t.name).join(", ") + "..."
}));

export const statMap: Record<string, string> = { "Força": "str", "Destreza": "dex", "Constituição": "con", "Inteligência": "int", "Sabedoria": "wis", "Carisma": "cha" };
export const BACKGROUNDS = Object.entries(BACKGROUNDS_REFERENCE).map(([id, bg]) => ({
  id,
  name: bg.name,
  feat: bg.feat,
  stats: bg.abilityScores.map(s => statMap[s] || "str"),
  equipment: bg.equipment,
  skillProficiencies: bg.skillProficiencies
}));

export const CLASSES = {
  Barbarian: { id: 'Barbarian', name: 'Bárbaro', icon: '🪓', hpBase: 12, mainStats: ['str'] },
  Bard: { id: 'Bard', name: 'Bardo', icon: '🧝', hpBase: 8, mainStats: ['cha'] },
  Cleric: { id: 'Cleric', name: 'Clérigo', icon: '⚕️', hpBase: 8, mainStats: ['wis'] },
  Druid: { id: 'Druid', name: 'Druida', icon: '🌿', hpBase: 8, mainStats: ['wis'] },
  Fighter: { id: 'Fighter', name: 'Guerreiro', icon: '⚔️', hpBase: 10, mainStats: ['str', 'dex'] },
  Monk: { id: 'Monk', name: 'Monge', icon: '👊', hpBase: 8, mainStats: ['dex', 'wis'] },
  Paladin: { id: 'Paladin', name: 'Paladino', icon: '🛡️', hpBase: 10, mainStats: ['str', 'cha'] },
  Ranger: { id: 'Ranger', name: 'Patrulheiro', icon: '🏹', hpBase: 10, mainStats: ['dex', 'wis'] },
  Rogue: { id: 'Rogue', name: 'Ladino', icon: '🥷', hpBase: 8, mainStats: ['dex'] },
  Sorcerer: { id: 'Sorcerer', name: 'Feiticeiro', icon: '✨', hpBase: 6, mainStats: ['cha'] },
  Warlock: { id: 'Warlock', name: 'Bruxo', icon: '🔮', hpBase: 8, mainStats: ['cha'] },
  Wizard: { id: 'Wizard', name: 'Mago', icon: '🧙‍♂️', hpBase: 6, mainStats: ['int'] }
};

export type StatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export const STAT_NAMES: Record<StatKey, string> = { str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
export const POINT_COSTS: Record<number, number> = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

export const DRACONIC_DAMAGE_TYPES: Record<string, string> = {
  'Preto': 'Ácido',
  'Azul': 'Eletricidade',
  'Latão': 'Fogo',
  'Bronze': 'Eletricidade',
  'Cobre': 'Ácido',
  'Ouro': 'Fogo',
  'Verde': 'Veneno',
  'Vermelho': 'Fogo',
  'Prata': 'Frio',
  'Branco': 'Frio'
};

export const GIANT_ANCESTRIES_INFO: Record<string, { benefit: string; description: string }> = {
  'Colina': { benefit: 'Robustez de Colina', description: 'Você ganha pontos de vida temporários iguais ao seu nível + modificador de Constituição.' },
  'Fogo': { benefit: 'Manto de Fogo', description: 'Você pode conjurar Fogo das Fadas ou causar dano de fogo adicional em seus ataques.' },
  'Geada': { benefit: 'Aura de Geada', description: 'Você pode reduzir a velocidade de criaturas próximas e causar dano de frio.' },
  'Nuvem': { benefit: 'Passo de Nuvem', description: 'Você pode se teletransportar uma curta distância e ficar invisível brevemente.' },
  'Pedra': { benefit: 'Resistência de Pedra', description: 'Você pode reduzir o dano sofrido com sua reação.' },
  'Tempestade': { benefit: 'Poder da Tempestade', description: 'Seus ataques podem causar dano de trovão e você pode voar brevemente.' }
};

export const getSpellSlotsForClass = (cls: string) => {
  switch (cls) {
    case 'Bard': return { cantrips: 2, spells: 4 };
    case 'Cleric': return { cantrips: 3, spells: 4 };
    case 'Druid': return { cantrips: 2, spells: 4 };
    case 'Paladin': return { cantrips: 0, spells: 2 };
    case 'Ranger': return { cantrips: 0, spells: 2 };
    case 'Sorcerer': return { cantrips: 4, spells: 2 };
    case 'Warlock': return { cantrips: 2, spells: 2 };
    case 'Wizard': return { cantrips: 3, spells: 4 };
    default: return null;
  }
};
