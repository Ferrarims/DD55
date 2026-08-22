import { getCachedEquipmentReference } from '../../../../../lib/api/itemsService';
import { isConsumableItem } from '../../utils';
import { isArmorNotShield, isTwoHandedWeapon } from '../../../../../lib/mechanics/acCalculator';

const EQUIPMENT_REFERENCE = getCachedEquipmentReference();

export interface UseSlotCompatibilityProps {
  equipmentSlots: Record<string, string | null>;
  ALL_SLOT_KEYS: string[];
}

export function useSlotCompatibility({ equipmentSlots, ALL_SLOT_KEYS }: UseSlotCompatibilityProps) {
  const getItemCategory = (
    itemName: string
  ): 'armaduras' | 'armas' | 'municoes' | 'consumiveis' | 'outros' | 'teste' => {
    if (!itemName || typeof itemName !== 'string') return 'outros';
    const name = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const baseName = name.split(/[-:(]/)[0].trim();

    if (name.includes('teste') || name.includes('decorativo')) {
      return 'teste';
    }

    if (
      isConsumableItem(itemName) ||
      /pocao|potion|elixir|pergaminho|scroll|antidoto|curandeiro|bandagem|curativo|bomba|fogo|acido|acid|balm|balsamo|remedio|oleo|oil|veneno|poison|racao|ration|marmita|comida/.test(
        baseName
      ) ||
      name.includes('racao') ||
      name.includes('ration') ||
      name.includes('marmita') ||
      name.includes('comida')
    ) {
      return 'consumiveis';
    }

    if (
      /flecha|flechas|virote|virotes|bala|balas|funda|aljava|quiver|municao|municoes|arrow|arrows|bolt|bolts|ammo|ammunition/.test(
        name
      )
    ) {
      return 'municoes';
    }

    const isGearOrBag =
      /mochila|backpack|bolsa|bag|saco|sack|pochete|porta-|kit|odre|waterskin|tocha|torch|corda|rope|pederneira|tinderbox|lanterna|lantern|caixa|box|bau|chest|tenda|tent|colchao|bedroll|ferramenta|tool|tools|utensil|caneca|prato|tinta|pena|papel|papiro|grimorio|tome|livro|organizador/.test(
        name
      );
    if (isGearOrBag) {
      return 'outros';
    }

    if (
      /armadura|escudo|shield|couro|cota|couraca|peitoral|gibao|loriga|placas|talas|acolchoada|brigandina|cuirass|breastplate|chainmail|plate|leather|padded|armor|corselete|capacete|elmo|tiara|coroa|capuz|chapeu|viseira|helm|helmet|crown|hood|visor|luva|manopla|glove|gauntlet|bota|sapato|greva|coturno|sandalia|boot|shoe|greaves|sandal|bracadeira|bracelete|pulseira|bracer|cinto|cinturao|faixa|belt|girdle|capa|manto|hombreira|cloak|mantle|cape|pauldron|anel|aneis|alianca|ring|amuleto|colar|gargantilha|pingente|amulet|necklace|pendant/.test(
        name
      )
    ) {
      return 'armaduras';
    }

    if (
      /espada|arco|machado|adaga|lanca|martelo|varinha|cajado|cetro|foice|clava|pique|tridente|bastao|chicote|mangual|cimitarra|alabarda|rapier|florete|azagaia|machadinha|maca|ponto|dagger|sword|bow|axe|spear|hammer|wand|staff|scepter|crossbow|scythe|mace|halberd|whip|javelin|trident|club|flail|besta|faca|marreta|greatsword|greataxe|maul|longbow|shortbow/.test(
        name
      )
    ) {
      return 'armas';
    }

    const ref = EQUIPMENT_REFERENCE[itemName] || Object.values(EQUIPMENT_REFERENCE).find(e => e.name?.toLowerCase() === name);
    const cat = (ref?.category || '').toLowerCase();
    if (cat.includes('arma')) return 'armas';
    if (cat.includes('armadura') || cat.includes('escudo')) return 'armaduras';

    return 'outros';
  };

  const isItemCompatibleWithSlot = (itemName: string, slotKey: string): boolean => {
    if (!itemName || typeof itemName !== 'string') return false;

    const name = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const baseName = name.split(/[-:(]/)[0].trim();

    if (isConsumableItem(itemName) || /oleo|oil/.test(baseName)) {
      return false;
    }

    const isLighting =
      /tocha|torch|lanterna|lantern|lampada|lamp|vela|candle/.test(baseName) ||
      /tocha|torch|lanterna|lantern|lampada|lamp|vela|candle/.test(name);

    const category = getItemCategory(itemName);
    if ((category === 'consumiveis' || category === 'outros' || category === 'municoes') && !isLighting) {
      if (slotKey === 'roupa_clima' && /roupa|roupas|veste|traje|manto/.test(name)) {
        return true;
      }
      return false;
    }

    const isWeapon =
      category === 'armas' ||
      /espada|arco|machado|adaga|lanca|martelo|varinha|cajado|cetro|foice|clava|pique|tridente|bastao|chicote|mangual|cimitarra|alabarda|rapier|florete|azagaia|machadinha|maca|ponto|dagger|sword|bow|axe|spear|hammer|wand|staff|scepter|crossbow|scythe|mace|halberd|whip|javelin|trident|club|flail|besta|faca|marreta|greatsword|greataxe|maul|longbow|shortbow/.test(
        name
      );

    if (isWeapon) {
      if (slotKey !== 'empunhadura_1' && slotKey !== 'empunhadura_2') {
        return false;
      }
    }

    const isTestItem = name.includes('teste') || name.includes('decorativo');
    if (isTestItem) {
      switch (slotKey) {
        case 'cabeca': return name.includes('capacete');
        case 'rosto_olhos': return name.includes('oculos');
        case 'pescoco': return name.includes('colar');
        case 'ombros_costas': return name.includes('capa') && !name.includes('capacete');
        case 'corpo_torso': return name.includes('tunica');
        case 'bracos_pulsos': return name.includes('bracadeira');
        case 'maos_vestuario': return name.includes('luva');
        case 'cintura': return name.includes('cinto');
        case 'pes': return name.includes('bota');
        case 'empunhadura_1': return name.includes('espada');
        case 'empunhadura_2': return name.includes('escudo');
        case 'dedo_anel_1':
        case 'dedo_anel_2': return name.includes('anel');
        default: return false;
      }
    }

    if ((slotKey === 'empunhadura_1' || slotKey === 'empunhadura_2') && isArmorNotShield(itemName)) {
      return false;
    }

    switch (slotKey) {
      case 'cabeca':
        return /capacete|tiara|coroa|elmo|capuz|chapeu|viseira|circulo|circlet|helmet|crown|hood|hat|visor|coif|yelmo|diadema/.test(name);
      case 'rosto_olhos':
        return /oculos|lente|mascara|monoculo|goggles|lens|mask|glasses/.test(name);
      case 'pescoco':
        return /amuleto|colar|gargantilha|pingente|simbolo|talisman|amulet|necklace|choker|pendant|reliquia/.test(name);
      case 'ombros_costas':
        if (/capacete|elmo|helm|coroa|tiara|chapeu|capuz/.test(name)) return false;
        return /capa|manto|asas|hombreira|xale|manteau|cloak|mantle|cape|wings|pauldron|shoulder/.test(name);
      case 'corpo_torso':
        return /armadura|tunica|cota|couraca|peitoral|vestimenta|traje|gibao|placas|couro|camisa|robe|veste|loriga|brigandina|cuirass|breastplate|tunic|chainmail|plate|leather|padded|armor|corselete/.test(name);
      case 'bracos_pulsos':
        return /bracadeira|bracelete|pulseira|bracer|armguard|wristguard|bracelet/.test(name);
      case 'maos_vestuario':
        return /luva|manopla|glove|gauntlet/.test(name);
      case 'cintura':
        return /cinto|cinturao|faixa|belt|girdle|sash/.test(name);
      case 'roupa_clima':
        return /roupa|roupas|veste|traje|manto/.test(name);
      case 'pes':
        return /bota|sapato|greva|coturno|sandalia|boot|shoe|greaves|sandal/.test(name);
      case 'empunhadura_1':
        if (isArmorNotShield(itemName)) return false;
        if (/escudo|shield/.test(baseName)) return false;
        return isWeapon || isLighting;
      case 'empunhadura_2':
        if (isArmorNotShield(itemName)) return false;
        return isWeapon || /escudo|shield|grimorio|tome|orb|orbe|simbolo/.test(baseName) || isLighting;
      case 'dedo_anel_1':
      case 'dedo_anel_2':
        return /anel|aneis|alianca|ring|band/.test(name);
      default:
        return false;
    }
  };

  const canItemBeEquipped = (itemName: string): boolean => {
    if (!itemName || typeof itemName !== 'string') return false;
    const lower = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    if (/mochila|backpack|saco|algibeira/.test(lower)) return false;
    if (getItemCategory(itemName) === 'municoes') return false;
    if (isConsumableItem(itemName)) return false;
    return ALL_SLOT_KEYS.some(slotKey => isItemCompatibleWithSlot(itemName, slotKey));
  };

  const isItemEquippedAnywhere = (itemName: string): boolean => {
    return Object.values(equipmentSlots).includes(itemName);
  };

  const getEquipmentType = (itemName: string): 'armor' | 'shield' | 'ring' | null => {
    const lower = itemName.toLowerCase();
    if (
      lower.includes('pergaminho') ||
      lower.includes('scroll') ||
      lower.includes('poção') ||
      lower.includes('potion') ||
      lower.includes('elixir') ||
      lower.includes('bomba') ||
      lower.includes('kit') ||
      lower.includes('ração') ||
      lower.includes('tocha')
    ) {
      return null;
    }
    if (lower.includes('escudo') || lower.includes('shield')) return 'shield';
    if (
      lower.includes('cota de anéis') ||
      lower.includes('cota de aneis') ||
      lower.includes('acolchoada') ||
      lower.includes('couro') ||
      lower.includes('malha') ||
      lower.includes('placas') ||
      lower.includes('talas') ||
      lower.includes('gibão') ||
      lower.includes('loriga') ||
      lower.includes('couraça') ||
      lower.includes('armadura')
    ) {
      return 'armor';
    }
    if (
      lower.includes('anel') ||
      lower.includes('ring') ||
      lower.includes('amuleto') ||
      lower.includes('manto') ||
      lower.includes('colar')
    ) {
      return 'ring';
    }
    const ref =
      EQUIPMENT_REFERENCE[itemName] ||
      Object.values(EQUIPMENT_REFERENCE).find(
        e => e.name.toLowerCase() === lower || lower.includes(e.name.toLowerCase())
      );
    if (ref) {
      if (ref.category?.includes('Escudo')) return 'shield';
      if (ref.category?.includes('Anel') || ref.category?.includes('Acessório')) return 'ring';
      if (ref.category?.includes('Armadura') || ref.armor_class) return 'armor';
    }
    return null;
  };

  return {
    getItemCategory,
    isItemCompatibleWithSlot,
    canItemBeEquipped,
    isItemEquippedAnywhere,
    getEquipmentType,
  };
}
