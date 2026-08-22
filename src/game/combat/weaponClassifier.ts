import { getCachedEquipmentReference } from '../../lib/api/itemsService';

export function isTwoHandedWeaponLocal(name: string, properties?: string): boolean {
  const n = (name || '').toLowerCase();
  const p = (properties || '').toLowerCase();

  const isOneHandedRanged = n.includes('besta de mão') || n.includes('hand crossbow') || n.includes('funda') || n.includes('sling') || n.includes('dardo') || n.includes('dart') || n.includes('zarabatana');
  if (isOneHandedRanged) return false;

  const isRanged = p.includes('munição') || p.includes('ammunition') || p.includes('distância') || p.includes('ranged') ||
    n.includes('arco') || n.includes('besta') || n.includes('bow') || 
    n.includes('crossbow') || n.includes('mosquete') || n.includes('musket');

  if (isRanged) return true;

  const isTwoHandedProp = p.includes('duas mãos') || p.includes('two-handed') || p.includes('2 mãos');
  const isTwoHandedName = n.includes('duas mãos') || n.includes('two-handed') || n.includes('bastarda') || 
    n.includes('alabarda') || n.includes('montante') || n.includes('glaive') || n.includes('pique') || 
    n.includes('malho') || n.includes('machado grande') || n.includes('espada grande') || n.includes('greatsword') || 
    n.includes('greataxe') || n.includes('maul') || n.includes('halberd') || n.includes('marreta');

  return isTwoHandedProp || isTwoHandedName;
}

export function isLightWeapon(name: string, properties?: string): boolean {
  if (!name) return false;
  const n = name.trim().toLowerCase();

  const checkProps = (propStr?: string) => {
    if (!propStr) return false;
    const parts = propStr.toLowerCase().split(/[,;\/]/);
    return parts.some(part => {
      const clean = part.trim();
      return clean === 'leve' || clean === 'light' || clean.startsWith('leve') || clean.startsWith('light');
    });
  };

  if (checkProps(properties)) return true;

  try {
    const ref = getCachedEquipmentReference();
    if (ref) {
      const key = Object.keys(ref).find(k => k.toLowerCase() === n || n.includes(k.toLowerCase()) || k.toLowerCase().includes(n));
      if (key && ref[key]?.properties) {
        if (checkProps(ref[key].properties)) {
          return true;
        }
      }
    }
  } catch (err) {
    // ignora falhas no ref
  }

  return n.includes('adaga') || n.includes('dagger') ||
         n.includes('espada curta') || n.includes('shortsword') ||
         n.includes('cimitarra') || n.includes('scimitar') ||
         n.includes('machadinha') || n.includes('handaxe') ||
         n.includes('foice') || n.includes('sickle') ||
         n.includes('martelo leve') || n.includes('light hammer') ||
         n.includes('clava') || n.includes('club') ||
         n.includes('besta de mão') || n.includes('hand crossbow');
}

export function getOffHandDamageDice(baseDamageDice: string, hasTWF: boolean): { diceStr: string; modifierRemoved: boolean } {
  if (hasTWF) {
    return { diceStr: baseDamageDice, modifierRemoved: false };
  }

  const posModRegex = /^(\d+d\d+)\s*\+\s*\d+$/i;
  const match = (baseDamageDice || '').trim().match(posModRegex);
  if (match) {
    return { diceStr: match[1].trim(), modifierRemoved: true };
  }

  return { diceStr: baseDamageDice, modifierRemoved: false };
}

export function getEntitySizeInSquares(sizeStr?: string): number {
  if (!sizeStr) return 1;
  const s = sizeStr.toLowerCase();
  if (s.includes('large') || s.includes('grande')) return 2;
  if (s.includes('huge') || s.includes('enorme')) return 3;
  if (s.includes('gargantuan') || s.includes('gargantueco') || s.includes('colossal') || s.includes('imenso')) return 4;
  return 1;
}
