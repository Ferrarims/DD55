import { LootItem } from '../types';

// Tabela Oficial de Experiência (XP) por CR do Livro D&D 5.5e
export function getXpForCr(cr: number): number {
  if (cr <= 0) return 10;
  if (cr <= 0.125) return 25;
  if (cr <= 0.25) return 50;
  if (cr <= 0.5) return 100;
  if (cr <= 1) return 200;
  if (cr <= 2) return 450;
  if (cr <= 3) return 700;
  if (cr <= 4) return 1100;
  if (cr <= 5) return 1800;
  if (cr <= 6) return 2300;
  if (cr <= 7) return 2900;
  if (cr <= 8) return 3900;
  if (cr <= 9) return 5000;
  return 5900;
}

// Poção de Cura Leve Padrão (2d4+2)
export const HEALING_POTION_TEMPLATE: Omit<LootItem, 'id'> = {
  name: 'Poção de Cura',
  type: 'potion',
  rarity: 'comum',
  value: 50,
  description: 'Recupera 2d4+2 Pontos de Vida durante o combate.',
  bonusHp: 7,
  icon: '🧪'
};

// Pool de Itens Comuns e Utensílios de Aventura (Sem bônus mágicos)
export const COMMON_MUNDANE_ITEMS: Omit<LootItem, 'id'>[] = [
  {
    name: 'Adaga',
    type: 'weapon',
    rarity: 'comum',
    value: 2,
    description: 'Adaga afiada de ferro fundido sem encantamentos.',
    icon: '🗡️'
  },
  {
    name: 'Tocha',
    type: 'weapon',
    rarity: 'comum',
    value: 1,
    description: 'Fornece iluminação de 6 metros (4 quadrados) de luz brilhante quando equipada na mão.',
    icon: '🔥'
  },
  {
    name: 'Rações',
    type: 'potion',
    rarity: 'comum',
    value: 1,
    description: 'Provisões secas ideais para aventuras prolongadas.',
    icon: '🍞'
  },
  {
    name: 'Corda',
    type: 'weapon',
    rarity: 'comum',
    value: 1,
    description: 'Corda firme de 15 metros para amarras e travessias.',
    icon: '🪢'
  },
  {
    name: 'Óleo',
    type: 'potion',
    rarity: 'comum',
    value: 1,
    description: 'Frasco de óleo combustível usado para lâmpadas.',
    icon: '🛢️'
  },
  {
    name: 'Mochila',
    type: 'armor',
    rarity: 'comum',
    value: 2,
    description: 'Mochila utilitária para transporte de cargas.',
    icon: '🎒'
  },
  {
    name: 'Cantil',
    type: 'potion',
    rarity: 'comum',
    value: 1,
    description: 'Odre higiênico para hidratação durante o percurso.',
    icon: '💧'
  },
  {
    name: 'Escudo',
    type: 'armor',
    rarity: 'comum',
    value: 10,
    description: 'Escudo básico de madeira e tiras de couro.',
    icon: '🛡️'
  },
  {
    name: 'Espada Curta',
    type: 'weapon',
    rarity: 'comum',
    value: 10,
    description: 'Espada de lâmina reta ideal para combate corporal rápido.',
    icon: '⚔️'
  },
  {
    name: 'Couro',
    type: 'armor',
    rarity: 'comum',
    value: 10,
    description: 'Armadura leve feita de couro curtido resistente.',
    icon: '🧥'
  }
];
