import { Attack, InventoryItem } from '../../types';
import { singularizeItemName } from './equipmentParser';

export function calculateTotalCoinsFromEquipment(equipmentStrings: string[]): string {
  let totalGoldPO = 0;

  (equipmentStrings || []).forEach(str => {
    if (!str || typeof str !== 'string') return;

    // Split by comma or " e "
    const parts = str.split(/,\s*|\s+e\s+/);
    parts.forEach(part => {
      const trimmed = part.trim();
      if (!trimmed) return;

      const match = trimmed.match(/\b(\d+(?:[,\.]\d+)?)\s*(PO|PP|PC|PE|PL)\b/i);
      if (match) {
        const val = parseFloat(match[1].replace(',', '.'));
        const unit = match[2].toUpperCase();

        if (unit === 'PL') totalGoldPO += val * 10;
        else if (unit === 'PO') totalGoldPO += val;
        else if (unit === 'PE') totalGoldPO += val * 0.5;
        else if (unit === 'PP') totalGoldPO += val * 0.1;
        else if (unit === 'PC') totalGoldPO += val * 0.01;
      }
    });
  });

  return `${Math.floor(totalGoldPO)} PO`;
}

export function convertCoinsToGold(coins: { cp?: number; sp?: number; ep?: number; gp?: number; pp?: number }): number {
  let total = Number(coins.gp || 0);
  if (coins.cp) total += Number(coins.cp) * 0.01;
  if (coins.sp) total += Number(coins.sp) * 0.1;
  if (coins.ep) total += Number(coins.ep) * 0.5;
  if (coins.pp) total += Number(coins.pp) * 10;
  return Math.round(total * 100) / 100;
}

export function parseWeightValue(rawWeight?: string | number | null): number {
  if (rawWeight === undefined || rawWeight === null) return 0;
  if (typeof rawWeight === 'number') return isNaN(rawWeight) ? 0 : rawWeight;
  const match = String(rawWeight).replace(',', '.').match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

export function calculateInventoryWeight(items: { name: string; quantity?: number; weight?: string | number }[]): number {
  if (!Array.isArray(items)) return 0;
  let total = 0;
  items.forEach(item => {
    const qty = Math.max(1, Number(item.quantity) || 1);
    const w = parseWeightValue(item.weight);
    total += w * qty;
  });
  return Math.round(total * 100) / 100;
}

export const parseInventory = (equipmentStrings: string[]): { items: InventoryItem[], coins: string } => {
  const items: InventoryItem[] = [];
  const coins = calculateTotalCoinsFromEquipment(equipmentStrings);

  equipmentStrings.forEach(str => {
    // Some lines might just be "50 PO"
    if (str.match(/^\d+\s*(PO|PP|PC|PE|PL)\b(\s*\(.*\))?$/i)) {
      return;
    }

    // Split by comma or " e "
    const parts = str.split(/,\s*|\s+e\s+/);
    parts.forEach(part => {
      let partTrimmed = part.trim();
      if (!partTrimmed) return;

      // Skip coins if present inside parts
      if (partTrimmed.match(/^\d+\s*(PO|PP|PC|PE|PL)\b(\s*\(.*\))?$/i)) {
        return;
      }

      // Check for quantity
      const quantityMatch = partTrimmed.match(/^(\d+)\s+(.+)$/);
      let quantity = 1;
      let itemName = partTrimmed;

      if (quantityMatch) {
        quantity = parseInt(quantityMatch[1], 10);
        itemName = quantityMatch[2];
      }

      // Attempt singularization for better matching
      itemName = singularizeItemName(itemName);

      // Check if it's armor, weapon, shield, or lighting item for equipped status
      const isEquippable = /Armadura|Cota|Escudo|Machado|Machadinha|Adaga|Maça|Foice|Espada|Mangual|Azagaia|Cimitarra|Arco|Lança|Bordão|Foco Arcano|Símbolo Sagrado|Tocha|Torch|Lanterna|Lantern|Lâmpada|Lamp|Vela|Candle/i.test(itemName);
      
      const existingItem = items.find(i => i.name === itemName);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        items.push({ name: itemName, equipped: isEquippable, quantity });
      }
    });
  });

  return { items, coins };
};

export const parseAttacks = (
  items: InventoryItem[],
  cantrips: string[],
  stats: { str: number; dex: number; con: number; int: number; wis: number; cha: number },
  attackStat: 'str' | 'dex' | 'int' | 'wis' | 'cha',
  profBonus: number,
  feats?: string[]
): Attack[] => {
  const attacks: Attack[] = [];

  const hasDuelist = feats?.some(f => typeof f === 'string' && (f.toLowerCase().includes('duelismo') || f.toLowerCase().includes('duelist')));
  const hasArchery = feats?.some(f => typeof f === 'string' && (f.toLowerCase().includes('arquearia') || f.toLowerCase().includes('archery')));

  const addAttack = (name: string, statKey: keyof typeof stats, damage: string, type: string, mastery?: string, range: string = '1,5m', properties?: string) => {
    const mod = Math.floor((stats[statKey] - 10) / 2);
    let hit = mod + profBonus;

    const isTwoHanded = properties?.includes('Duas Mãos') || properties?.includes('Pesada');
    const isRanged = properties?.includes('Munição') || 
                     name.toLowerCase().includes('arco') || 
                     name.toLowerCase().includes('besta') || 
                     name.toLowerCase().includes('funda') || 
                     name.toLowerCase().includes('dardo') ||
                     name.toLowerCase().includes('bow') ||
                     name.toLowerCase().includes('crossbow') ||
                     name.toLowerCase().includes('sling') ||
                     name.toLowerCase().includes('dart');
    const isMeleeOneHanded = !isTwoHanded && !isRanged && name !== 'Ataque Desarmado';

    let featProps = properties || '';

    if (isRanged && hasArchery) {
      hit += 2;
      featProps = featProps ? `${featProps}, +2 Arquearia` : '+2 Arquearia';
    }

    if (isMeleeOneHanded && hasDuelist) {
      hit += 2;
      featProps = featProps ? `${featProps}, +2 Duelismo` : '+2 Duelismo';
    }

    let damageMod = mod;

    attacks.push({
      name,
      bonus: hit,
      damage: `${damage} ${damageMod >= 0 ? '+' : ''}${damageMod}`,
      type,
      mastery,
      range,
      properties: featProps
    });
  };

  items.forEach(item => {
    const name = item.name.toLowerCase();
    
    const strMod = Math.floor((stats.str - 10) / 2);
    const dexMod = Math.floor((stats.dex - 10) / 2);
    const useFinesse = dexMod > strMod ? 'dex' : 'str';

    if (name.includes('machado grande')) addAttack('Machado Grande', 'str', '1d12', 'Cortante', 'Cleave (Fender)', '1,5m', 'Pesada, Duas Mãos');
    else if (name.includes('machadinha')) addAttack('Machadinha', 'str', '1d6', 'Cortante', 'Vex (Vexar)', '1,5m (Arremesso 6m/18m)', 'Leve, Arremesso');
    else if (name.includes('machado de batalha')) addAttack('Machado de Batalha', 'str', '1d8', 'Cortante', 'Topple (Derrubar)', '1,5m', 'Versátil (1d10)');
    else if (name.includes('adaga')) addAttack('Adaga', useFinesse, '1d4', 'Perfurante', 'Nick (Golpe Rápido)', '1,5m (Arremesso 6m/18m)', 'Acuidade, Leve, Arremesso');
    else if (name.includes('maça estrela')) addAttack('Maça Estrela', 'str', '1d8', 'Perfurante', 'Sap (Enfraquecer)', '1,5m', '');
    else if (name.includes('maça')) addAttack('Maça', 'str', '1d6', 'Concussão', 'Sap (Enfraquecer)', '1,5m', '');
    else if (name.includes('foice')) addAttack('Foice', useFinesse, '1d4', 'Cortante', 'Nick (Golpe Rápido)', '1,5m', 'Leve');
    else if (name.includes('espada grande') || name.includes('greatsword') || name.includes('espda grande')) addAttack('Espada Grande', 'str', '2d6', 'Cortante', 'Graze (Roçar)', '1,5m', 'Pesada, Duas Mãos');
    else if (name.includes('espada curta') || name.includes('shortsword') || name.includes('espda curta')) addAttack('Espada Curta', useFinesse, '1d6', 'Perfurante', 'Vex (Vexar)', '1,5m', 'Acuidade, Leve');
    else if (name.includes('espada longa') || name.includes('espda longa') || name.includes('longsword') || name === 'espada' || name === 'espda') addAttack('Espada Longa', 'str', '1d8', 'Cortante', 'Sap (Enfraquecer)', '1,5m', 'Versátil (1d10)');
    else if (name.includes('rapieira')) addAttack('Rapieira', useFinesse, '1d8', 'Perfurante', 'Vex (Vexar)', '1,5m', 'Acuidade');
    else if (name.includes('mangual')) addAttack('Mangual', 'str', '1d8', 'Concussão', 'Sap (Enfraquecer)', '1,5m', '');
    else if (name.includes('azagaia')) addAttack('Azagaia', 'str', '1d6', 'Perfurante', 'Slow (Lentidão)', '1,5m (Arremesso 9m/36m)', 'Arremesso');
    else if (name.includes('cimitarra')) addAttack('Cimitarra', useFinesse, '1d6', 'Cortante', 'Nick (Golpe Rápido)', '1,5m', 'Acuidade, Leve');
    else if (name.includes('arco longo')) addAttack('Arco Longo', 'dex', '1d8', 'Perfurante', 'Slow (Lentidão)', '45m/180m', 'Pesada, Duas Mãos, Munição');
    else if (name.includes('arco curto')) addAttack('Arco Curto', 'dex', '1d6', 'Perfurante', 'Vex (Vexar)', '24m/96m', 'Duas Mãos, Munição');
    else if (name.includes('besta leve')) addAttack('Besta Leve', 'dex', '1d8', 'Perfurante', 'Slow (Lentidão)', '24m/96m', 'Duas Mãos, Munição, Recarga');
    else if (name.includes('besta pesada')) addAttack('Besta Pesada', 'dex', '1d10', 'Perfurante', 'Push (Empurrar)', '30m/120m', 'Pesada, Duas Mãos, Munição, Recarga');
    else if (name.includes('besta de mão')) addAttack('Besta de Mão', 'dex', '1d6', 'Perfurante', 'Vex (Vexar)', '9m/36m', 'Leve, Munição, Recarga');
    else if (name.includes('lança')) addAttack('Lança', 'str', '1d6', 'Perfurante', 'Sap (Enfraquecer)', '1,5m (Arremesso 6m/18m)', 'Arremesso, Versátil (1d8)');
    else if (name.includes('bordão') || name.includes('foco arcano (bordão)') || name.includes('cajado')) addAttack('Bordão', 'str', '1d6', 'Concussão', 'Topple (Derrubar)', '1,5m', 'Versátil (1d8)');
    else if (name.includes('malho')) addAttack('Malho', 'str', '2d6', 'Concussão', 'Topple (Derrubar)', '1,5m', 'Pesada, Duas Mãos');
    else if (name.includes('martelo de guerra')) addAttack('Martelo de Guerra', 'str', '1d8', 'Concussão', 'Push (Empurrar)', '1,5m', 'Versátil (1d10)');
    else if (name.includes('martelo leve')) addAttack('Martelo Leve', 'str', '1d4', 'Concussão', 'Nick (Golpe Rápido)', '1,5m (Arremesso 6m/18m)', 'Leve, Arremesso');
    else if (name.includes('alabarda') || name.includes('glaive')) addAttack(item.name, 'str', '1d10', 'Cortante', 'Cleave (Fender)', '3m', 'Pesada, Duas Mãos, Extensão');
    else if (name.includes('chicote')) addAttack('Chicote', useFinesse, '1d4', 'Cortante', 'Slow (Lentidão)', '3m', 'Acuidade, Extensão');
    else if (name.includes('clava grande')) addAttack('Clava Grande', 'str', '1d8', 'Concussão', 'Push (Empurrar)', '1,5m', 'Duas Mãos');
    else if (name.includes('clava')) addAttack('Clava', 'str', '1d4', 'Concussão', 'Slow (Lentidão)', '1,5m', 'Leve');
    else if (name.includes('dardo')) addAttack('Dardo', useFinesse, '1d4', 'Perfurante', 'Vex (Vexar)', '6m/18m', 'Acuidade, Arremesso');
    else if (name.includes('funda')) addAttack('Funda', 'dex', '1d4', 'Concussão', 'Slow (Lentidão)', '9m/36m', 'Munição');
    else if (name.includes('tridente')) addAttack('Tridente', 'str', '1d6', 'Perfurante', 'Topple (Derrubar)', '1,5m (Arremesso 6m/18m)', 'Arremesso, Versátil (1d8)');
  });

  // Spell Attacks
  cantrips.forEach(cantrip => {
    if (cantrip === 'Raio de Fogo') {
      const mod = Math.floor((stats[attackStat] - 10) / 2);
      attacks.push({
        name: 'Raio de Fogo',
        bonus: mod + profBonus,
        damage: '1d10',
        type: 'Fogo',
        range: '36m'
      });
    }
  });

  // Default unarmed strike
  const strMod = Math.floor((stats.str - 10) / 2);
  const dexMod = Math.floor((stats.dex - 10) / 2);
  const maneuverDC = 8 + profBonus + Math.max(strMod, dexMod);

  let baseUnarmedDamage = '1';
  let unarmedProps = `CD ${maneuverDC} (Agarrar/Empurrar)`;

  const hasShield = items.some(i => i.equipped && ((i as any).type === 'shield' || (i as any).category === 'escudo' || i.name.toLowerCase().includes('escudo')));
  const hasWeapon = items.some(i => i.equipped && ((i as any).type === 'weapon' || (i as any).category === 'arma' || i.name.toLowerCase().includes('espada') || i.name.toLowerCase().includes('machado') || i.name.toLowerCase().includes('adaga') || i.name.toLowerCase().includes('arco') || i.name.toLowerCase().includes('besta') || i.name.toLowerCase().includes('maça') || i.name.toLowerCase().includes('martelo') || i.name.toLowerCase().includes('lança') || i.name.toLowerCase().includes('foice') || i.name.toLowerCase().includes('bordão') || i.name.toLowerCase().includes('rapier') || i.name.toLowerCase().includes('rapieira') || i.name.toLowerCase().includes('cimitarra') || i.name.toLowerCase().includes('tridente') || i.name.toLowerCase().includes('alabarda') || i.name.toLowerCase().includes('glaive') || i.name.toLowerCase().includes('malho')));

  if (feats?.includes('Valentão de Taverna') || feats?.includes('Tavern Brawler')) {
    baseUnarmedDamage = '1d4';
  } else if (feats?.includes('Combate Desarmado') || feats?.includes('Unarmed Fighting')) {
    baseUnarmedDamage = (!hasShield && !hasWeapon) ? '1d8' : '1d6';
    unarmedProps = `CD ${maneuverDC} (Agarrar/Empurrar). Versátil (1d8). 1d4 dano contundente auto 1x/turno em criatura agarrada`;
  }

  addAttack('Ataque Desarmado', 'str', baseUnarmedDamage, 'Concussão', '', '1,5m', unarmedProps);

  // Deduplicate attacks by name
  return attacks.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
};
