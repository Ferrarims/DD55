import { CombatEntity, LootItem } from '../types';
import { getRandomItemFromDatabase } from '../../lib/mechanics/xpAndLootManager';

// Gerador de Loot / Recompensas por Vitória
export function generateVictoryLoot(enemiesDefeated: CombatEntity[]): { totalXp: number; loot: LootItem[] } {
  let totalXp = 0;
  const loot: LootItem[] = [];

  for (const enemy of enemiesDefeated) {
    totalXp += enemy.xpValue || 50;
  }

  // Ouro garantido
  const goldAmount = Math.floor(Math.random() * 30) + 15 * enemiesDefeated.length;
  loot.push({
    id: 'gold-' + Date.now(),
    name: `${goldAmount} Peças de Ouro (PO)`,
    type: 'gold',
    rarity: 'comum',
    value: goldAmount,
    description: 'Moedas reluzentes coletadas dos inimigos derrotados.',
    icon: '💰'
  });

  // Chance de Poção de Cura / Consumível
  if (Math.random() < 0.7) {
    const potionItem = getRandomItemFromDatabase({ category: 'potion' });
    loot.push({
      ...potionItem,
      id: 'potion-' + Date.now()
    });
  }

  // Chance de Equipamento (Arma ou Armadura do Banco de Dados)
  if (Math.random() < 0.4) {
    const equipType = Math.random() < 0.5 ? 'weapon' : 'armor';
    const equipItem = getRandomItemFromDatabase({ category: equipType });
    loot.push({
      ...equipItem,
      id: 'equip-' + Date.now()
    });
  }

  return { totalXp, loot };
}
