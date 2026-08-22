export const LOCAL_STORAGE_CHARS_KEY = 'dnd_local_characters';

export const CHAR_SELECT_SAFE = '*, character_inventory(*, items(*)), character_feats(*, feats(*)), character_spells(*, spells(*)), character_choices(*), character_classes(*, classes(*)), races(name), classes(name), backgrounds(name)';
export const CHAR_SELECT_WITH_ATTACKS = CHAR_SELECT_SAFE;

export const classTranslation: Record<string, string> = {
  'Barbarian': 'Bárbaro',
  'Bard': 'Bardo',
  'Cleric': 'Clérigo',
  'Druid': 'Druida',
  'Fighter': 'Guerreiro',
  'Monk': 'Monge',
  'Paladin': 'Paladino',
  'Ranger': 'Patrulheiro',
  'Rogue': 'Ladino',
  'Sorcerer': 'Feiticeiro',
  'Warlock': 'Bruxo',
  'Wizard': 'Mago'
};

export const raceTranslation: Record<string, string> = {
  'Aasimar': 'Aasimar',
  'Dragonborn': 'Draconato',
  'Dwarf': 'Anão',
  'Elf': 'Elfo',
  'Gnome': 'Gnomo',
  'Goliath': 'Golias',
  'Human': 'Humano',
  'Orc': 'Orc',
  'Halfling': 'Pequenino',
  'Tiefling': 'Tiferino'
};
