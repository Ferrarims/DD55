export function getResourceMaxUses(
  character: any,
  keywords: string[],
  defaultMax: number
): number {
  if (!character || !Array.isArray(character.class_resources)) {
    return defaultMax;
  }
  const res = character.class_resources.find((r: any) => {
    if (!r) return false;
    const name = (r.name || '').toLowerCase();
    return keywords.some(k => name.includes(k.toLowerCase()));
  });
  if (res && typeof res === 'object' && typeof res.max === 'number') {
    return res.max;
  }
  return defaultMax;
}

export function getInitialResourceUses(
  character: any,
  keywords: string[],
  maxUses: number
): number {
  if (!character || !Array.isArray(character.class_resources)) {
    return maxUses;
  }
  const res = character.class_resources.find((r: any) => {
    if (!r) return false;
    const name = (r.name || '').toLowerCase();
    return keywords.some(k => name.includes(k.toLowerCase()));
  });
  if (res && typeof res === 'object') {
    if (typeof res.used === 'number' && typeof res.max === 'number') {
      return Math.max(0, res.max - res.used);
    } else if (typeof res.used === 'number') {
        return Math.max(0, maxUses - res.used);
    }
  }
  return maxUses;
}
