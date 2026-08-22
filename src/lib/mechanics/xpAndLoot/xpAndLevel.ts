export const XP_LEVEL_TABLE: Record<number, number> = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000
};

export function getLevelFromXp(xp: number): number {
  if (!xp || xp <= 0) return 1;
  for (let lvl = 20; lvl >= 1; lvl--) {
    if (xp >= XP_LEVEL_TABLE[lvl]) {
      return lvl;
    }
  }
  return 1;
}

export function getXpProgress(xp: number) {
  const level = getLevelFromXp(xp);
  const currentLevelMinXp = XP_LEVEL_TABLE[level] || 0;
  const nextLevelXp = XP_LEVEL_TABLE[level + 1] || currentLevelMinXp;
  const xpInCurrentLevel = Math.max(0, xp - currentLevelMinXp);
  const xpNeededForNextLevel = Math.max(1, nextLevelXp - currentLevelMinXp);
  const percent = level >= 20 ? 100 : Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100));

  return {
    level,
    xp,
    currentLevelMinXp,
    nextLevelXp,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    percent
  };
}
