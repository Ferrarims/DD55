import { useState, useMemo, useEffect } from 'react';
import { updateCharacter, updateItemEquipSlot, removeItemFromInventory, updateItemQuantity } from '../../../../lib/api/characterService';
import { calculateAC, isTwoHandedWeapon, isArmorNotShield, isCrossbow, blocksShield } from '../../../../lib/mechanics/acCalculator';
import { isConsumableItem } from '../utils';
import { getCachedEquipmentReference } from '../../../../lib/api/itemsService';

const EQUIPMENT_REFERENCE = getCachedEquipmentReference();

const ALL_SLOT_KEYS = [
  'cabeca',
  'rosto_olhos',
  'pescoco',
  'ombros_costas',
  'corpo_torso',
  'bracos_pulsos',
  'maos_vestuario',
  'cintura',
  'pes',
  'roupa_clima',
  'empunhadura_1',
  'empunhadura_2',
  'dedo_anel_1',
  'dedo_anel_2',
];

export const useEquipmentSlots = (
  character: any,
  getCharacterActiveFeats: (char: any) => string[],
  setShopMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void,
  onCharacterUpdated?: () => void,
  currentHp?: number,
  setCurrentHp?: (hp: number) => void
) => {
  const [showSlotsModal, setShowSlotsModal] = useState(false);
  const [showAcModal, setShowAcModal] = useState(false);

  const [equippedArmor, setEquippedArmor] = useState<string | null>(
    character.equipped_armor || character.equipment_slots?.corpo_torso || null
  );
  const [equippedShield, setEquippedShield] = useState<string | null>(
    character.equipped_shield ||
      (character.equipment_slots?.empunhadura_2 &&
      /escudo|shield/i.test(character.equipment_slots.empunhadura_2)
        ? character.equipment_slots.empunhadura_2
        : null)
  );
  const [equippedRing, setEquippedRing] = useState<string | null>(
    character.equipped_ring ||
      character.equipment_slots?.dedo_anel_1 ||
      character.equipment_slots?.dedo_anel_2 ||
      null
  );

  const [equipmentSlots, setEquipmentSlots] = useState<Record<string, string | null>>(() => {
    const defaultSlots: Record<string, string | null> = {
      cabeca: null,
      rosto_olhos: null,
      pescoco: null,
      ombros_costas: null,
      corpo_torso: character?.equipped_armor || null,
      bracos_pulsos: null,
      maos_vestuario: null,
      cintura: null,
      pes: null,
      roupa_clima: character?.equipment_slots?.roupa_clima || null,
      empunhadura_1: null,
      empunhadura_2: character?.equipped_shield || null,
      dedo_anel_1: character?.equipped_ring || null,
      dedo_anel_2: null,
    };

    let parsed = defaultSlots;
    if (character?.equipment_slots) {
      if (typeof character.equipment_slots === 'string') {
        try {
          parsed = { ...defaultSlots, ...JSON.parse(character.equipment_slots) };
        } catch (e) {
          parsed = defaultSlots;
        }
      } else {
        parsed = { ...defaultSlots, ...character.equipment_slots };
      }
    }

    if (parsed.empunhadura_1 && (isArmorNotShield(parsed.empunhadura_1) || isConsumableItem(parsed.empunhadura_1))) {
      parsed.empunhadura_1 = null;
    }
    if (parsed.empunhadura_2 && (isArmorNotShield(parsed.empunhadura_2) || isConsumableItem(parsed.empunhadura_2))) {
      parsed.empunhadura_2 = null;
    }

    if (parsed.empunhadura_1 && /escudo|shield/i.test(parsed.empunhadura_1)) {
      const shieldItem = parsed.empunhadura_1;
      parsed.empunhadura_1 = null;
      if (!parsed.empunhadura_2) {
        parsed.empunhadura_2 = shieldItem;
      }
    }

    if (parsed.empunhadura_1 && isTwoHandedWeapon(parsed.empunhadura_1)) {
      parsed.empunhadura_2 = parsed.empunhadura_1;
    } else if (parsed.empunhadura_2 && isTwoHandedWeapon(parsed.empunhadura_2)) {
      parsed.empunhadura_1 = parsed.empunhadura_2;
    }

    return parsed;
  });

  const getItemCategory = (itemName: string): 'armaduras' | 'armas' | 'municoes' | 'consumiveis' | 'outros' | 'teste' => {
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

  const calculateTotalAc = (
    char: any,
    armor: string | null,
    shield: string | null,
    ring: string | null,
    fStyle?: string | null,
    invItems?: any[]
  ) => {
    const res = calculateAC({
      charClass: char.class_name || char.charClass || '',
      stats: {
        dex: char.dexterity || char.dex || 10,
        con: char.constitution || char.con || 10,
        wis: char.wisdom || char.wis || 10,
      },
      equippedArmor: armor,
      equippedShield: shield,
      equippedRing: ring,
      fightingStyle: fStyle || char.fighting_style,
      inventoryItems: invItems || char.character_inventory,
      equipmentSlots,
      feats: getCharacterActiveFeats(char),
    });
    return res.armor_class;
  };

  const [currentAc, setCurrentAc] = useState<number>(() => {
    return calculateTotalAc(
      character,
      character.equipped_armor || null,
      character.equipped_shield || null,
      character.equipped_ring || null,
      character.fighting_style || null
    );
  });

  const acDetails = useMemo(() => {
    return calculateAC({
      charClass: character.class_name || character.charClass || '',
      stats: {
        dex: character.dexterity || character.dex || 10,
        con: character.constitution || character.con || 10,
        wis: character.wisdom || character.wis || 10,
      },
      equippedArmor,
      equippedShield,
      equippedRing,
      fightingStyle: character.fighting_style,
      inventoryItems: character.character_inventory,
      equipmentSlots,
      feats: getCharacterActiveFeats(character),
    });
  }, [character, equippedArmor, equippedShield, equippedRing, equipmentSlots]);

  useEffect(() => {
    if (acDetails.ac !== currentAc) {
      setCurrentAc(acDetails.ac);
      character.armor_class = acDetails.ac;
      if (character.id) {
        updateCharacter(character.id, { armor_class: acDetails.ac }).catch(err => {
          console.warn('Erro ao atualizar armor_class do personagem no DB:', err);
        });
      }
    }
  }, [acDetails.ac, currentAc, character]);

  const getInventoryMap = () => {
    const inventoryMap = new Map<string, number>();
    (character.character_inventory || []).forEach((inv: any) => {
      const itemName = inv.items?.name;
      if (itemName) {
        inventoryMap.set(itemName, (inventoryMap.get(itemName) || 0) + (inv.quantity || 1));
      }
    });
    return inventoryMap;
  };

  const getAvailableItemsForSlot = (slotKey: string, currentValue: string) => {
    const inventoryMap = getInventoryMap();
    const uniqueItems = Array.from(inventoryMap.keys());
    return uniqueItems
      .filter(item => {
        if (currentValue && item === currentValue) return true;
        if (!isItemCompatibleWithSlot(item, slotKey)) return false;

        const countInInventory = inventoryMap.get(item) || 0;
        const countEquippedElsewhere = Object.entries(equipmentSlots)
          .filter(([k]) => k !== slotKey)
          .filter(([_, v]) => v === item).length;

        return countInInventory > countEquippedElsewhere;
      })
      .sort((a, b) => a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }));
  };

  const handleAssignSlot = async (slotKey: string, itemName: string | null) => {
    const selectedItem = itemName && itemName.trim() !== '' ? itemName : null;

    if (selectedItem && !isItemCompatibleWithSlot(selectedItem, slotKey)) {
      const isArmor = isArmorNotShield(selectedItem);
      const isShield = /escudo|shield/i.test(selectedItem);
      setShopMessage({
        type: 'error',
        text:
          isArmor && (slotKey === 'empunhadura_1' || slotKey === 'empunhadura_2')
            ? `⚠️ Armaduras ("${selectedItem}") não podem ser colocadas na empunhadura, somente no Corpo/Torso!`
            : isShield && slotKey === 'empunhadura_1'
            ? `⚠️ Escudos ("${selectedItem}") devem ser equipados na Empunhadura 2 (Mão Secundária)!`
            : `⚠️ O item "${selectedItem}" não é compatível com este espaço anatômico!`,
      });
      setTimeout(() => setShopMessage(null), 3500);
      return;
    }

    let updatedSlots: Record<string, string | null> = {
      ...equipmentSlots,
      [slotKey]: selectedItem,
    };

    if (selectedItem) {
      const inventoryMap = getInventoryMap();
      const countInInventory = inventoryMap.get(selectedItem) || 0;
      const otherSlotsEquippedCount = Object.entries(equipmentSlots)
        .filter(([k]) => k !== slotKey)
        .filter(([_, v]) => v === selectedItem).length;

      if (otherSlotsEquippedCount >= countInInventory) {
        for (const [otherKey] of Object.entries(equipmentSlots)) {
          if (otherKey !== slotKey && equipmentSlots[otherKey] === selectedItem) {
            updatedSlots[otherKey] = null;
            break;
          }
        }
      }
    }

    let newArmor = equippedArmor;
    let newShield = equippedShield;
    let newRing = equippedRing;

    if (slotKey === 'empunhadura_1' || slotKey === 'empunhadura_2') {
      const otherSlotKey = slotKey === 'empunhadura_1' ? 'empunhadura_2' : 'empunhadura_1';
      const previousItemThisSlot = equipmentSlots[slotKey];
      const previousItemOtherSlot = equipmentSlots[otherSlotKey];

      if (selectedItem) {
        const isShieldItem = selectedItem.toLowerCase().includes('escudo');
        const is2H = isTwoHandedWeapon(selectedItem);
        const isCross = isCrossbow(selectedItem);

        if (is2H) {
          updatedSlots = {
            ...updatedSlots,
            empunhadura_1: selectedItem,
            empunhadura_2: selectedItem,
          };
          newShield = null;
          setEquippedShield(null);
          character.equipped_shield = null;
        } else if (isCross) {
          if (isTwoHandedWeapon(previousItemThisSlot) || isTwoHandedWeapon(previousItemOtherSlot)) {
            updatedSlots.empunhadura_1 = null;
            updatedSlots.empunhadura_2 = null;
          }
          updatedSlots = {
            ...updatedSlots,
            [slotKey]: selectedItem,
          };
          newShield = null;
          setEquippedShield(null);
          character.equipped_shield = null;
          if (
            slotKey === 'empunhadura_1' &&
            updatedSlots.empunhadura_2 &&
            updatedSlots.empunhadura_2.toLowerCase().includes('escudo')
          ) {
            updatedSlots.empunhadura_2 = null;
          }
          if (
            slotKey === 'empunhadura_2' &&
            updatedSlots.empunhadura_1 &&
            updatedSlots.empunhadura_1.toLowerCase().includes('escudo')
          ) {
            updatedSlots.empunhadura_1 = null;
          }
        } else if (isShieldItem) {
          newShield = selectedItem;
          setEquippedShield(selectedItem);
          character.equipped_shield = selectedItem;

          if (updatedSlots.empunhadura_1 && blocksShield(updatedSlots.empunhadura_1)) {
            updatedSlots.empunhadura_1 = null;
          }
          if (updatedSlots.empunhadura_2 && blocksShield(updatedSlots.empunhadura_2)) {
            updatedSlots.empunhadura_2 = null;
          }
          updatedSlots[slotKey] = selectedItem;
        } else {
          if (
            (previousItemOtherSlot && blocksShield(previousItemOtherSlot)) ||
            (previousItemThisSlot && blocksShield(previousItemThisSlot))
          ) {
            updatedSlots.empunhadura_1 = null;
            updatedSlots.empunhadura_2 = null;
            updatedSlots[slotKey] = selectedItem;
          }

          if (slotKey === 'empunhadura_2' && equippedShield && selectedItem !== equippedShield) {
            newShield = null;
            setEquippedShield(null);
            character.equipped_shield = null;
          }
        }
      } else {
        if (
          (previousItemThisSlot && isTwoHandedWeapon(previousItemThisSlot)) ||
          (previousItemOtherSlot &&
            isTwoHandedWeapon(previousItemOtherSlot) &&
            previousItemOtherSlot === previousItemThisSlot)
        ) {
          updatedSlots = {
            ...updatedSlots,
            empunhadura_1: null,
            empunhadura_2: null,
          };
        }

        if (slotKey === 'empunhadura_2' && equippedShield) {
          newShield = null;
          setEquippedShield(null);
          character.equipped_shield = null;
        }
      }
    } else if (slotKey === 'corpo_torso') {
      newArmor = selectedItem;
      setEquippedArmor(selectedItem);
      character.equipped_armor = selectedItem;
    } else if (slotKey === 'dedo_anel_1' || slotKey === 'dedo_anel_2') {
      const r1 = slotKey === 'dedo_anel_1' ? selectedItem : updatedSlots.dedo_anel_1;
      const r2 = slotKey === 'dedo_anel_2' ? selectedItem : updatedSlots.dedo_anel_2;
      newRing = r1 || r2 || null;
      setEquippedRing(newRing);
      character.equipped_ring = newRing;
    }

    setEquipmentSlots(updatedSlots);
    character.equipment_slots = updatedSlots;

    if (character.character_inventory && Array.isArray(character.character_inventory)) {
      const slotEntries = Object.entries(updatedSlots).filter(([_, v]) => Boolean(v));
      const assigned = new Set<string>();

      for (const [sKey, sItem] of slotEntries) {
        const sName = String(sItem).toLowerCase().trim();
        const invItem = character.character_inventory.find((inv: any) => {
          if (assigned.has(inv.id)) return false;
          const rowName = String(inv.items?.name || inv.name || '').toLowerCase().trim();
          return (
            rowName === sName ||
            (sName.length > 2 && rowName.includes(sName)) ||
            (rowName.length > 2 && sName.includes(rowName))
          );
        });

        if (invItem) {
          assigned.add(invItem.id);
          if (invItem.equip_slot !== sKey) {
            invItem.equip_slot = sKey;
            if (invItem.id) {
              updateItemEquipSlot(invItem.id, sKey).catch(err =>
                console.warn('Erro ao atualizar equip_slot no inventario:', err)
              );
            }
          }
        }
      }

      character.character_inventory.forEach((inv: any) => {
        if (!assigned.has(inv.id)) {
          if (inv.equip_slot !== null) {
            inv.equip_slot = null;
            if (inv.id) {
              updateItemEquipSlot(inv.id, null).catch(err =>
                console.warn('Erro ao desequipar item no inventario:', err)
              );
            }
          }
        }
      });
    }

    const newAc = calculateTotalAc(
      character,
      newArmor,
      newShield,
      newRing,
      character.fighting_style,
      character.character_inventory
    );
    setCurrentAc(newAc);

    try {
      if (character.id) {
        await updateCharacter(character.id, {
          equipment_slots: updatedSlots,
          equipped_armor: newArmor,
          equipped_shield: newShield,
          equipped_ring: newRing,
          armor_class: newAc,
          character_inventory: character.character_inventory,
        });
      }
      const is2H = selectedItem && isTwoHandedWeapon(selectedItem);
      setShopMessage({
        type: 'success',
        text: selectedItem
          ? is2H
            ? `⚔️ "${selectedItem}" (Arma de Duas Mãos) equipada! Ambos os slots de empunhadura foram ocupados.`
            : `🛡️ Item "${selectedItem}" equipado no espaço!`
          : `🧹 Espaço liberado com sucesso!`,
      });
      setTimeout(() => setShopMessage(null), 3500);
      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      console.warn('Erro ao atualizar slots de equipamentos:', err);
    }
  };

  const handleToggleEquipInInventory = async (itemName: string) => {
    const currentlyEquippedSlots = Object.entries(equipmentSlots)
      .filter(([_, val]) => val === itemName)
      .map(([slotKey]) => slotKey);

    if (currentlyEquippedSlots.length > 0) {
      for (const slotKey of currentlyEquippedSlots) {
        await handleAssignSlot(slotKey, null);
      }
      return;
    }

    const compatibleSlots = ALL_SLOT_KEYS.filter(slotKey => isItemCompatibleWithSlot(itemName, slotKey));
    if (compatibleSlots.length === 0) {
      setShopMessage({ type: 'error', text: `⚠️ O item "${itemName}" não pode ser equipado em nenhum espaço.` });
      setTimeout(() => setShopMessage(null), 3500);
      return;
    }

    const emptySlot = compatibleSlots.find(slotKey => !equipmentSlots[slotKey]);
    const targetSlot = emptySlot || compatibleSlots[0];

    await handleAssignSlot(targetSlot, itemName);
  };

  return {
    showSlotsModal,
    setShowSlotsModal,
    showAcModal,
    setShowAcModal,
    equippedArmor,
    setEquippedArmor,
    equippedShield,
    setEquippedShield,
    equippedRing,
    setEquippedRing,
    equipmentSlots,
    setEquipmentSlots,
    currentAc,
    setCurrentAc,
    acDetails,
    calculateTotalAc,
    handleAssignSlot,
    handleToggleEquipInInventory,
    isItemCompatibleWithSlot,
    canItemBeEquipped,
    isItemEquippedAnywhere,
    getEquipmentType,
    getItemCategory,
    getAvailableItemsForSlot,
  };
};
