export const getMod = (val: number): number => Math.floor((val - 10) / 2);

export const normalizeHitDice = (
  rawHitDice?: string,
  level: number = 1,
  className: string = 'Guerreiro'
): { sides: number; unitStr: string; poolStr: string } => {
  const match = String(rawHitDice || '').match(/d(\d+)/i);
  let sides = 8;
  if (match && match[1]) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val > 0) sides = val;
  } else {
    const cls = (className || '').toLowerCase();
    if (cls.includes('bárbaro') || cls.includes('barbarian')) sides = 12;
    else if (
      cls.includes('guerreiro') ||
      cls.includes('fighter') ||
      cls.includes('paladino') ||
      cls.includes('paladin') ||
      cls.includes('patrulheiro') ||
      cls.includes('ranger')
    )
      sides = 10;
    else if (
      cls.includes('mago') ||
      cls.includes('wizard') ||
      cls.includes('feiticeiro') ||
      cls.includes('sorcerer')
    )
      sides = 6;
    else sides = 8;
  }

  const validLevel = Math.max(1, Number(level) || 1);
  return {
    sides,
    unitStr: `d${sides}`,
    poolStr: `${validLevel}d${sides}`,
  };
};

export const calculateBaseHp = (hitDiceSides: number, conMod: number, level: number = 1): number => {
  const lvl = Math.max(1, Math.floor(level) || 1);
  const lvl1Hp = Math.max(1, hitDiceSides + conMod);
  if (lvl === 1) return lvl1Hp;
  const hpPerLevelAfter1 = Math.max(1, Math.floor(hitDiceSides / 2) + 1 + conMod);
  return lvl1Hp + (lvl - 1) * hpPerLevelAfter1;
};

export const calculateTotalMaxHp = (maxHpBase: number, race: string, level: number, featStr?: string | string[]): number => {
  const isDwarf = /anão|dwarf/i.test(race || '');
  const dwarfBonus = isDwarf ? level : 0;
  const featList = Array.isArray(featStr) ? featStr : (featStr ? featStr.split(',') : []);
  const hasTough = featList.some(f => /vigoroso|tough/i.test(f || ''));
  const toughBonus = hasTough ? level * 2 : 0;
  const hasFortitude = featList.some(f => /dádiva da fortitude/i.test(f || ''));
  const fortitudeBonus = hasFortitude ? 40 : 0;
  return maxHpBase + dwarfBonus + toughBonus + fortitudeBonus;
};

