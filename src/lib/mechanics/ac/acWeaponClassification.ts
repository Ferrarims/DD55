import { getCachedEquipmentReference } from '../../api/itemsService';

const EQUIPMENT_REFERENCE = getCachedEquipmentReference();

export const isTwoHandedWeapon = (itemName: string): boolean => {
  if (!itemName || typeof itemName !== 'string') return false;
  const normalized = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Besta de mão (hand crossbow) é de uma mão
  if (normalized.includes('besta de mao') || normalized.includes('hand crossbow')) {
    return false;
  }

  // Armas versáteis (como Espada Longa, Lança) podem ser usadas com uma mão e permitem escudo
  const versatileKeywords = ['espada longa', 'lanca', 'longsword', 'spear'];
  if (versatileKeywords.some(kw => normalized.includes(kw))) {
    return false;
  }

  const twoHandedKeywords = [
    'machado grande', 'espada grande', 'malho', 'alabarda', 'glaive',
    'lanca longa', 'lanca de montaria', 'arco longo', 'arco curto', 'arco',
    'besta leve', 'besta pesada', 'besta', 'clava grande', 'mosquete', 'zarabatana',
    'marreta', 'pique', 'cajado', 'greatsword', 'greataxe', 'maul', 'halberd',
    'heavy crossbow', 'light crossbow', 'longbow', 'shortbow', 'greatclub', 'pike',
    'staff', 'quarterstaff', 'bow', 'crossbow', 'duas maos', 'two-handed', '2 maos'
  ];

  if (twoHandedKeywords.some(kw => normalized.includes(kw))) return true;

  const trimmed = itemName.trim();
  const ref = EQUIPMENT_REFERENCE[trimmed] || Object.values(EQUIPMENT_REFERENCE).find(e => e.name.toLowerCase() === trimmed.toLowerCase());
  if (ref && ref.properties) {
    const props = ref.properties.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (props.includes('versatil') || props.includes('versatile')) {
      return false;
    }
    if (props.includes('duas maos') || props.includes('two-handed') || props.includes('2 maos')) {
      return true;
    }
  }

  return false;
};

export const isCrossbow = (itemName: string): boolean => {
  if (!itemName || typeof itemName !== 'string') return false;
  const normalized = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  return normalized.includes('besta') || normalized.includes('crossbow');
};

export const blocksShield = (itemName: string): boolean => {
  if (!itemName || typeof itemName !== 'string') return false;
  return isTwoHandedWeapon(itemName) || isCrossbow(itemName);
};

export const isArmorNotShield = (itemName: string): boolean => {
  if (!itemName || typeof itemName !== 'string') return false;
  const name = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (/escudo|shield/.test(name)) return false;
  return /armadura|tunica|cota|couraca|peitoral|vestimenta|traje|gibao|placas|couro|camisa|robe|veste|loriga|brigandina|cuirass|breastplate|tunic|chainmail|plate|leather|padded|armor|corselete|peles/.test(name);
};
