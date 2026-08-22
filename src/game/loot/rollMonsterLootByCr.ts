import { CombatEntity, LootItem } from '../types';
import { rollDiceString } from '../combatEngine';
import { getRandomItemFromDatabase } from '../../lib/mechanics/xpAndLootManager';

export function rollCr0To4Loot(
  monster: CombatEntity,
  d100Roll: number,
  timestamp: number
): {
  tableRange: string;
  lootDescription: string;
  lootItems: LootItem[];
} {
  const lootItems: LootItem[] = [];
  let tableRange = '';
  let lootDescription = '';

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

  return { tableRange, lootDescription, lootItems };
}

export function rollCr5PlusLoot(
  monster: CombatEntity,
  d100Roll: number,
  timestamp: number,
  cr: number
): {
  tableRange: string;
  lootDescription: string;
  lootItems: LootItem[];
} {
  const lootItems: LootItem[] = [];
  let tableRange = '';
  let lootDescription = '';

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

  return { tableRange, lootDescription, lootItems };
}
