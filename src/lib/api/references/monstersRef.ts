export interface MonsterActionJSON {
  name: string;
  type?: string;
  to_hit?: number;
  reach?: string;
  range?: string;
  damage?: string;
  text?: string;
  effect?: string;
  condition?: string;
}

export interface MonsterTraitJSON {
  name: string;
  text: string;
}

export interface MonsterStatsJSON {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface Monster5eJSON {
  id: string;
  name: string;
  cr: number;
  pb: number;
  armor_class: number;
  ac?: number;
  hp: number;
  speed: string;
  stats: MonsterStatsJSON;
  senses?: string;
  vulnerabilities?: string[];
  resistances?: string[];
  immunities?: string[];
  condition_immunities?: string[];
  saves?: Record<string, number>;
  skills?: string[];
  traits?: MonsterTraitJSON[];
  actions?: MonsterActionJSON[];
  bonus_actions?: MonsterTraitJSON[];
  reactions?: MonsterTraitJSON[];
  legendary_actions?: MonsterTraitJSON[];
  icon: string;
  color: string;
  size?: string;
  biomePreference?: string[];
}

export const MONSTER_XP_BY_CR: Record<number, number> = {
  0: 10,
  0.125: 25,
  0.25: 50,
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  13: 10000,
  16: 15000,
  17: 18000,
  19: 22000,
  20: 25000,
  21: 33000,
  30: 155000,
};

export const MONSTERS_5E_DATA: Monster5eJSON[] = [];

/**
 * Converte a velocidade ou alcance em formato texto (ex: "9m", "10,5 metros", "0m, Voo 15m") para células no grid (1.5m = 1 célula)
 */
export function parseSpeedToGridCells(speedStr: string | number): number {
  if (typeof speedStr === 'number') {
    return Math.max(1, Math.round(speedStr));
  }
  if (!speedStr) return 6;

  let str = String(speedStr).replace(',', '.');
  if (str.includes('/')) {
    str = str.split('/')[0];
  }

  const matches = Array.from(str.matchAll(/(\d+(?:\.\d+)?)\s*(?:m\b|metros\b)?/gi));
  if (matches.length > 0) {
    const values = matches.map(m => parseFloat(m[1])).filter(v => !isNaN(v));
    if (values.length > 0) {
      const maxVal = Math.max(...values);
      const effective = maxVal > 0 ? maxVal : values[0];
      return Math.max(1, Math.round(effective / 1.5));
    }
  }

  return 6;
}

/**
 * Extrai o bônus de ataque, o dado de dano e o alcance da primeira ação ofensiva válida
 */
export function extractPrimaryAttack(monster: Monster5eJSON): {
  attackBonus: number;
  damageDice: string;
  range: number;
} {
  const defaultBonus = monster.pb + Math.floor(((monster.stats.str || 10) - 10) / 2);
  if (!monster.actions || monster.actions.length === 0) {
    return { attackBonus: defaultBonus, damageDice: '1d6+2', range: 1 };
  }

  const attackAction =
    monster.actions.find(a => a.to_hit !== undefined || a.damage !== undefined) || monster.actions[0];

  const attackBonus = attackAction.to_hit !== undefined ? attackAction.to_hit : defaultBonus;
  const damageDice = attackAction.damage || '1d6+2';

  let range = 1;
  if (attackAction.reach) {
    range = parseSpeedToGridCells(attackAction.reach);
  } else if (attackAction.range) {
    range = parseSpeedToGridCells(attackAction.range);
  } else if (attackAction.type === 'Ranged') {
    range = 6;
  }

  return { attackBonus, damageDice, range };
}
