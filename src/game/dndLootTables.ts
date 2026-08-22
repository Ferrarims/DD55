import { CombatEntity, LootItem } from './types';
import { getXpForCr, HEALING_POTION_TEMPLATE, COMMON_MUNDANE_ITEMS } from './loot/lootConstants';
import { rollCr0To4Loot, rollCr5PlusLoot } from './loot/rollMonsterLootByCr';

export { getXpForCr, HEALING_POTION_TEMPLATE, COMMON_MUNDANE_ITEMS };

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

// Rolagem de Tesouro Individual do Livro do Mestre (Apenas Ouro, Poções de Cura Leve e Itens Comuns)
export function rollMonsterLootAndXp(monster: CombatEntity, multiplier: number = 1): MonsterLootRollResult {
  const cr = monster.cr ?? 0.25;
  const baseXp = monster.xpValue || getXpForCr(cr);
  const xpEarned = baseXp * multiplier;
  const d100Roll = Math.floor(Math.random() * 100) + 1;
  const timestamp = Date.now() + Math.floor(Math.random() * 1000);

  const { tableRange, lootDescription, lootItems } =
    cr <= 4
      ? rollCr0To4Loot(monster, d100Roll, timestamp)
      : rollCr5PlusLoot(monster, d100Roll, timestamp, cr);

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
