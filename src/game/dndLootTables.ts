import { CombatEntity, LootItem } from './types';
import { rollDiceString } from './combatEngine';
import { getRandomItemFromDatabase } from '../lib/mechanics/xpAndLootManager';

export interface MonsterLootRollResult {
  monsterName: string;
  cr: number;
  xpEarned: number;
  d100Roll: number;
  tableRange: string;
  lootItems: LootItem[];
  logTitle: string;
  logDetail: string;
}

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
const HEALING_POTION_TEMPLATE: Omit<LootItem, 'id'> = {
  name: 'Poção de Cura',
  type: 'potion',
  rarity: 'comum',
  value: 50,
  description: 'Recupera 2d4+2 Pontos de Vida durante o combate.',
  bonusHp: 7,
  icon: '🧪'
};

// Pool de Itens Comuns e Utensílios de Aventura (Sem bônus mágicos)
const COMMON_MUNDANE_ITEMS: Omit<LootItem, 'id'>[] = [
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

// Rolagem de Tesouro Individual do Livro do Mestre (Apenas Ouro, Poções de Cura Leve e Itens Comuns)
export function rollMonsterLootAndXp(monster: CombatEntity, multiplier: number = 1): MonsterLootRollResult {
  const cr = monster.cr ?? 0.25;
  const baseXp = monster.xpValue || getXpForCr(cr);
  const xpEarned = baseXp * multiplier;
  const d100Roll = Math.floor(Math.random() * 100) + 1;
  const timestamp = Date.now() + Math.floor(Math.random() * 1000);

  const lootItems: LootItem[] = [];
  let tableRange = '';
  let lootDescription = '';

  if (cr <= 4) {
    // TABELA CR 0 a 4 (Moedas, Poções de Cura Leve, Itens Comuns)
    if (d100Roll <= 35) {
      tableRange = '01-35 (Moedas de Ouro)';
      const goldRoll = rollDiceString('3d6+5').total;
      const amount = Math.max(5, goldRoll);
      lootDescription = `${amount} Peças de Ouro (PO)`;

      lootItems.push({
        id: `gold-${timestamp}`,
        name: `${amount} Peças de Ouro (PO)`,
        type: 'gold',
        rarity: 'comum',
        value: amount,
        description: `Moedas encontradas nos pertences de ${monster.name}.`,
        icon: '💰'
      });
    } else if (d100Roll <= 65) {
      tableRange = '36-65 (Ouro & Item Comum)';
      const goldRoll = rollDiceString('2d6+10').total;

      lootItems.push({
        id: `gold-${timestamp}`,
        name: `${goldRoll} Peças de Ouro (PO)`,
        type: 'gold',
        rarity: 'comum',
        value: goldRoll,
        description: `Bolsa de moedas pilhada de ${monster.name}.`,
        icon: '💰'
      });

      const randomMundane = getRandomItemFromDatabase({ category: 'mundane', maxCostPO: 30 });
      lootItems.push({
        ...randomMundane,
        id: `mundane-${timestamp}`
      });

      lootDescription = `${goldRoll} PO + ${randomMundane.name}`;
    } else if (d100Roll <= 85) {
      tableRange = '66-85 (Ouro & Poção de Cura)';
      const goldRoll = rollDiceString('3d6+10').total;

      lootItems.push({
        id: `gold-${timestamp}`,
        name: `${goldRoll} Peças de Ouro (PO)`,
        type: 'gold',
        rarity: 'comum',
        value: goldRoll,
        description: `Moedas recolhidas do inimigo.`,
        icon: '💰'
      });

      const potionItem = getRandomItemFromDatabase({ category: 'potion' });
      lootItems.push({
        ...potionItem,
        id: `potion-${timestamp}`
      });

      lootDescription = `${goldRoll} PO + ${potionItem.name}`;
    } else {
      tableRange = '86-100 (Ouro Farto, Poção de Cura & Item Comum)';
      const goldRoll = rollDiceString('4d6+15').total;

      lootItems.push({
        id: `gold-${timestamp}`,
        name: `${goldRoll} Peças de Ouro (PO)`,
        type: 'gold',
        rarity: 'comum',
        value: goldRoll,
        description: `Tesouro volumoso recuperado de ${monster.name}.`,
        icon: '💰'
      });

      const potionItem = getRandomItemFromDatabase({ category: 'potion' });
      lootItems.push({
        ...potionItem,
        id: `potion-${timestamp}`
      });

      const randomMundane = getRandomItemFromDatabase({ category: 'mundane', maxCostPO: 30 });
      lootItems.push({
        ...randomMundane,
        id: `mundane-${timestamp}-2`
      });

      lootDescription = `${goldRoll} PO + ${potionItem.name} + ${randomMundane.name}`;
    }
  } else {
    // TABELA CR >= 5 (Tesouro Maior em Ouro, Poção de Cura e Itens Comuns)
    if (d100Roll <= 35) {
      tableRange = '01-35 (Tesouro em Ouro Farto)';
      const goldRoll = rollDiceString('2d6x10').total;
      lootDescription = `${goldRoll} Peças de Ouro (PO)`;

      lootItems.push({
        id: `gold-${timestamp}`,
        name: `${goldRoll} Peças de Ouro (PO)`,
        type: 'gold',
        rarity: 'comum',
        value: goldRoll,
        description: `Arca de ouro do monstro de CR ${cr}.`,
        icon: '💰'
      });
    } else if (d100Roll <= 70) {
      tableRange = '36-70 (Ouro & Poção de Cura)';
      const goldRoll = rollDiceString('3d6x10').total;

      lootItems.push({
        id: `gold-${timestamp}`,
        name: `${goldRoll} Peças de Ouro (PO)`,
        type: 'gold',
        rarity: 'comum',
        value: goldRoll,
        description: `Tesouro acumulado por ${monster.name}.`,
        icon: '💰'
      });

      const potionItem = getRandomItemFromDatabase({ category: 'potion' });
      lootItems.push({
        ...potionItem,
        id: `potion-${timestamp}`
      });

      lootDescription = `${goldRoll} PO + ${potionItem.name}`;
    } else {
      tableRange = '71-100 (Ouro Farto, Poções de Cura & Equipamento Comum)';
      const goldRoll = rollDiceString('5d6x10').total;

      lootItems.push({
        id: `gold-${timestamp}`,
        name: `${goldRoll} Peças de Ouro (PO)`,
        type: 'gold',
        rarity: 'comum',
        value: goldRoll,
        description: `Báu precioso conquistado de ${monster.name}.`,
        icon: '💰'
      });

      const potionItem = getRandomItemFromDatabase({ category: 'potion' });
      lootItems.push({
        ...potionItem,
        id: `potion-${timestamp}-1`
      });

      const randomMundane = getRandomItemFromDatabase({ category: 'mundane' });
      lootItems.push({
        ...randomMundane,
        id: `mundane-${timestamp}`
      });

      lootDescription = `${goldRoll} PO + ${potionItem.name} + ${randomMundane.name}`;
    }
  }

  const logTitle = `💀 MONSTRO DERROTADO! ${monster.name} foi morto!`;
  const logDetail = `⭐ +${xpEarned} XP Ganho! ${multiplier > 1 ? `🔥 (BÔNUS ${multiplier}X APLICADO!)` : ''} 🎲 Tabela do Livro (CR ${cr}) d100: ${d100Roll} [${tableRange}] -> Loot: ${lootDescription}`;

  return {
    monsterName: monster.name,
    cr,
    xpEarned,
    d100Roll,
    tableRange,
    lootItems,
    logTitle,
    logDetail
  };
}

