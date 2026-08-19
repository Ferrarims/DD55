export function isConsumableItem(itemName: string): boolean {
  if (!itemName || typeof itemName !== 'string') return false;
  const lower = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const baseName = lower.split(/[-:(]/)[0].trim();

  // Se o nome base do item for óleo, poção, pergaminho, etc., é consumível!
  const isConsumableName = (
    baseName.includes('pocao') ||
    baseName.includes('potion') ||
    baseName.includes('elixir') ||
    baseName.includes('pergaminho') ||
    baseName.includes('scroll') ||
    baseName.includes('racao') ||
    baseName.includes('ration') ||
    baseName.includes('antidoto') ||
    baseName.includes('curandeiro') ||
    baseName.includes('bandagem') ||
    baseName.includes('curativo') ||
    baseName.includes('bomba') ||
    baseName.includes('fogo alquimico') ||
    baseName.includes('acido') ||
    baseName.includes('acid') ||
    baseName.includes('oleo') ||
    baseName.includes('oil') ||
    baseName.includes('veneno') ||
    baseName.includes('poison') ||
    lower.startsWith('oleo') ||
    lower.startsWith('oil') ||
    lower.includes('frasco de oleo') ||
    lower.includes('fogo alquimico')
  );

  if (isConsumableName) return true;

  // Tochas, lanternas, velas NO NOME BASE não são consumíveis
  if (/tocha|torch|lanterna|lantern|lampada|lamp|vela|candle/.test(baseName)) {
    return false;
  }

  return (
    lower.includes('pocao') ||
    lower.includes('potion') ||
    lower.includes('elixir') ||
    lower.includes('pergaminho') ||
    lower.includes('scroll') ||
    ((lower.includes('racao') || lower.includes('ration')) && !lower.includes('exploracao')) ||
    lower.includes('antidoto') ||
    lower.includes('curandeiro') ||
    lower.includes('bandagem') ||
    lower.includes('curativo') ||
    lower.includes('bomba') ||
    lower.includes('fogo alquimico') ||
    lower.includes('acido') ||
    lower.includes('oleo') ||
    lower.includes('oil') ||
    lower.includes('veneno') ||
    lower.includes('poison')
  );
}

export interface BestiaryStats {
  uniqueCount: number;
  totalCount: number;
}

export function getBestiaryStats(char: any): BestiaryStats {
  if (!char) return { uniqueCount: 0, totalCount: 0 };

  let rawDefeated = char.defeated_monsters || char.defeatedMonsters || {};
  if (typeof rawDefeated === 'string') {
    try {
      rawDefeated = JSON.parse(rawDefeated);
    } catch {
      rawDefeated = {};
    }
  }

  const merged: Record<string, number> = { ...(rawDefeated || {}) };

  if (char.id) {
    try {
      const stored = localStorage.getItem(`bestiary_${char.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          Object.keys(parsed).forEach(k => {
            if (!merged[k] || parsed[k] > merged[k]) {
              merged[k] = parsed[k];
            }
          });
        }
      }
    } catch {
      // ignore
    }
  }

  const normalizedMonsters: Record<string, number> = {};
  Object.entries(merged).forEach(([name, count]) => {
    if (!name) return;
    const cleanName = name.replace(/ #?\d+$/, '').trim();
    const numericCount = Number(count) || 0;
    if (cleanName && numericCount > 0) {
      normalizedMonsters[cleanName] = (normalizedMonsters[cleanName] || 0) + numericCount;
    }
  });

  const uniqueCount = Object.keys(normalizedMonsters).length;
  const totalCount = Object.values(normalizedMonsters).reduce((acc, c) => acc + c, 0);

  return { uniqueCount, totalCount };
}

