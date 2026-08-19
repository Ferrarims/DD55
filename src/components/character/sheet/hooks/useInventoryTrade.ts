import { useState, useMemo, useEffect } from 'react';
import { updateCharacter, removeItemFromInventory, updateItemQuantity, addItemToInventory } from '../../../../lib/api/characterService';
import { getItemIdByName, getCachedEquipmentReference } from '../../../../lib/api/itemsService';
import { parseCoinsToGoldNumber, getItemPriceInfo, parseWeightToKg, getItemWeight } from '../../../../lib/mechanics/xpAndLootManager';
import { isConsumableItem } from '../utils';
import { ShopCatalogItem } from '../../../../types';

export const useInventoryTrade = (
  character: any,
  equipmentSlots: Record<string, string | null>,
  setEquipmentSlots: (slots: Record<string, string | null>) => void,
  setEquippedArmor: (armor: string | null) => void,
  setEquippedShield: (shield: string | null) => void,
  setEquippedRing: (ring: string | null) => void,
  calculateTotalAc: (char: any, armor: string | null, shield: string | null, ring: string | null, fStyle?: string | null, invItems?: any[]) => number,
  setCurrentAc: (ac: number) => void,
  currentHp: number,
  setCurrentHp: (hp: number) => void,
  setShowShortRestModal: (show: boolean) => void,
  setShopMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void,
  getItemCategory: (itemName: string) => 'armaduras' | 'armas' | 'municoes' | 'consumiveis' | 'outros' | 'teste',
  levelUpFightingStyle: string,
  onCharacterUpdated?: () => void
) => {
  const [inventoryTab, setInventoryTab] = useState<'inventory' | 'shop'>('inventory');

  const [itemToSellConfirm, setItemToSellConfirm] = useState<{
    id: string;
    name: string;
    sellPricePO: number;
    costStr: string;
    isEquipped: boolean;
    quantityAvailable: number;
  } | null>(null);
  const [sellQuantity, setSellQuantity] = useState<number>(1);

  const [itemToBuyConfirm, setItemToBuyConfirm] = useState<ShopCatalogItem | null>(null);
  const [buyQuantity, setBuyQuantity] = useState<number>(1);

  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [customItemInput, setCustomItemInput] = useState('');

  const [showGoldModal, setShowGoldModal] = useState(false);
  const [goldInput, setGoldInput] = useState('');

  const currentGoldNumber = parseCoinsToGoldNumber(character.coins);

  const formatGold = (num: number) => {
    if (num % 1 === 0) return `${num} PO`;
    return `${num.toFixed(2)} PO`;
  };

  useEffect(() => {
    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (itemToSellConfirm) {
          e.preventDefault();
          confirmSellItem();
        } else if (itemToBuyConfirm) {
          e.preventDefault();
          const totalPrice = itemToBuyConfirm.pricePO * buyQuantity;
          if (currentGoldNumber >= totalPrice) {
            handleBuyItemConfirmed(itemToBuyConfirm, buyQuantity);
            setItemToBuyConfirm(null);
          }
        }
      }
    };

    if (itemToSellConfirm || itemToBuyConfirm) {
      window.addEventListener('keydown', handleEnterKey);
    }
    return () => {
      window.removeEventListener('keydown', handleEnterKey);
    };
  }, [itemToSellConfirm, itemToBuyConfirm, sellQuantity, buyQuantity, currentGoldNumber]);

  const totalInventoryWeight = useMemo(() => {
    let sum = 0;
    const itemsRef = getCachedEquipmentReference();
    const rawInv = (character.character_inventory && character.character_inventory.length > 0)
      ? character.character_inventory
      : (Array.isArray(character.equipment) ? character.equipment : (Array.isArray(character.inventory) ? character.inventory : []));

    rawInv.forEach((inv: any) => {
      let itemName = typeof inv === 'string' ? inv : (inv.items?.name || inv.name || (inv.item_id && itemsRef[inv.item_id] ? itemsRef[inv.item_id].name : ''));
      let qty = typeof inv === 'object' && inv?.quantity ? inv.quantity : 1;
      if (typeof inv === 'string') {
        const match = inv.match(/^(\d+)x?\s+(.+)$/i);
        if (match) {
          qty = parseInt(match[1], 10);
          itemName = match[2];
        }
      }
      if (itemName) {
        const weightStr = getItemWeight(itemName);
        const weightKg = parseWeightToKg(weightStr);
        sum += weightKg * qty;
      }
    });
    return Math.round(sum * 100) / 100;
  }, [character.character_inventory, character.equipment, character.inventory]);

  const isGoliathOrPowerfulBuild =
    ['Golias', 'Goliath'].includes(character.race || character.race_name) ||
    character.traits?.some(
      (t: any) =>
        t.name?.includes('Porte Poderoso') ||
        t.name?.includes('Físico Poderoso') ||
        t.name?.includes('Powerful Build')
    );
  const weightMultiplier = isGoliathOrPowerfulBuild ? 30 : 15;
  const maxWeightCapacity = (character.strength || 10) * weightMultiplier;
  const isOverburdened = totalInventoryWeight > maxWeightCapacity;

  const categorizedInventory = useMemo(() => {
    const itemsRef = getCachedEquipmentReference();
    let rawInv = (character.character_inventory || []) as any[];

    // Fallback: se rawInv for vazio mas o personagem tiver equipment ou inventory
    if (rawInv.length === 0) {
      if (Array.isArray(character.equipment) && character.equipment.length > 0) {
        rawInv = character.equipment.map((eqStr: string, idx: number) => {
          let name = eqStr;
          let qty = 1;
          const match = eqStr.match(/^(\d+)x?\s+(.+)$/i);
          if (match) {
            qty = parseInt(match[1], 10);
            name = match[2];
          }
          const ref = itemsRef[name] || Object.values(itemsRef).find((i: any) => i.name?.toLowerCase() === name.toLowerCase());
          return {
            id: `equip-fallback-${idx}`,
            character_id: character.id,
            quantity: qty,
            items: {
              name,
              category: ref?.category || getItemCategory(name),
              cost: ref?.cost || '1 PO',
              weight: ref?.weight || '1 kg',
              properties: ref?.properties || ''
            }
          };
        });
      } else if (Array.isArray(character.inventory) && character.inventory.length > 0) {
        rawInv = character.inventory.map((invItem: any, idx: number) => ({
          id: invItem.id || `inv-fallback-${idx}`,
          character_id: character.id,
          quantity: invItem.quantity || 1,
          items: {
            name: invItem.name || 'Item',
            category: invItem.category || getItemCategory(invItem.name || ''),
            cost: invItem.cost || '1 PO',
            weight: invItem.weight || '1 kg',
            properties: invItem.properties || ''
          }
        }));
      }
    }

    const mapped = rawInv.map((inv, index) => {
      const itemName = typeof inv === 'string' ? inv : (inv.items?.name || inv.name || inv.item_name || (inv.item_id && itemsRef[inv.item_id] ? itemsRef[inv.item_id].name : 'Item Desconhecido'));
      const ref = itemsRef[itemName] || (inv.item_id ? itemsRef[inv.item_id] : null) || Object.values(itemsRef).find((i: any) => i.name?.toLowerCase() === itemName.toLowerCase());
      const rawCat = inv.items?.category || inv.category || ref?.category;
      let cat: 'armaduras' | 'armas' | 'municoes' | 'consumiveis' | 'outros' | 'teste' = 'outros';

      if (rawCat) {
        const norm = rawCat.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        if (norm.includes('consumivel') || norm.includes('consumiveis')) {
          cat = 'consumiveis';
        } else if (norm.includes('armadura') || norm.includes('protecao') || norm.includes('escudo')) {
          cat = 'armaduras';
        } else if (norm.includes('arma') && !norm.includes('armadura')) {
          cat = 'armas';
        } else if (norm.includes('municao') || norm.includes('municoes')) {
          cat = 'municoes';
        } else if (norm.includes('teste')) {
          cat = 'teste';
        } else if (
          norm === 'armaduras' ||
          norm === 'armas' ||
          norm === 'municoes' ||
          norm === 'consumiveis' ||
          norm === 'outros' ||
          norm === 'teste'
        ) {
          cat = norm as any;
        } else {
          cat = getItemCategory(itemName);
        }
      } else {
        cat = getItemCategory(itemName);
      }

      return {
        id: inv.id || `inv-${index}`,
        name: itemName,
        quantity: inv.quantity || 1,
        category: cat,
        dbItem: inv,
        originalIndex: index,
      };
    });

    // Grouping by name
    const groupedMap = new Map<string, any>();
    mapped.forEach(item => {
      const name = item.name;
      if (groupedMap.has(name)) {
        const existing = groupedMap.get(name);
        existing.quantity += item.quantity;
      } else {
        groupedMap.set(name, { ...item });
      }
    });
    const groupedMapped = Array.from(groupedMap.values());

    const sortAlpha = (a: any, b: any) => {
      const nameA = (a.name || '')
        .replace(/^[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{200D}\s]+/u, '')
        .trim();
      const nameB = (b.name || '')
        .replace(/^[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{200D}\s]+/u, '')
        .trim();
      return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
    };

    const armaduras = groupedMapped.filter(i => i.category === 'armaduras').sort(sortAlpha);
    const armas = groupedMapped.filter(i => i.category === 'armas').sort(sortAlpha);
    const municoes = groupedMapped.filter(i => i.category === 'municoes').sort(sortAlpha);
    const consumiveis = groupedMapped.filter(i => i.category === 'consumiveis').sort(sortAlpha);
    const outros = groupedMapped.filter(i => i.category === 'outros').sort(sortAlpha);
    const teste = groupedMapped.filter(i => i.category === 'teste').sort(sortAlpha);
    const all = [...groupedMapped].sort(sortAlpha);

    return {
      armaduras,
      armas,
      municoes,
      consumiveis,
      outros,
      teste,
      all,
      totalConsumiveis: consumiveis.reduce((acc, curr) => acc + curr.quantity, 0),
    };
  }, [character.character_inventory, character.equipment, character.inventory, getItemCategory]);

  const handleSellItem = (inventoryId: string) => {
    const itemObj = categorizedInventory.all.find((i: any) => i.id === inventoryId);
    if (!itemObj) return;

    const targetName = itemObj.name;
    const priceInfo = getItemPriceInfo(targetName);
    const isEquipped = Object.values(equipmentSlots).some(slotItem => slotItem === targetName);

    setSellQuantity(1);
    setItemToSellConfirm({
      id: inventoryId,
      name: targetName,
      sellPricePO: priceInfo.sellPricePO,
      costStr: priceInfo.costStr,
      isEquipped,
      quantityAvailable: itemObj.quantity,
    });
  };

  const confirmSellItem = async () => {
    if (!itemToSellConfirm) return;
    const { id, name: targetName, sellPricePO, costStr, quantityAvailable } = itemToSellConfirm;

    const quantity = sellQuantity;
    setItemToSellConfirm(null);

    const totalSellPrice = sellPricePO * quantity;
    const newGoldNum = currentGoldNumber + totalSellPrice;
    const newCoinsStr = formatGold(newGoldNum);

    let quantityToReduce = quantity;
    const rowsToDelete: string[] = [];
    const rowsToUpdate: { id: string; qty: number }[] = [];

    if (character.character_inventory) {
      const matchingRows = [...character.character_inventory].filter(
        (inv: any) => (inv.items?.name || inv.name || 'Item Desconhecido') === targetName
      );

      for (const row of matchingRows) {
        if (quantityToReduce <= 0) break;

        const rowQty = row.quantity || 1;
        if (rowQty <= quantityToReduce) {
          rowsToDelete.push(row.id);
          quantityToReduce -= rowQty;
          const idx = character.character_inventory.findIndex((inv: any) => inv.id === row.id);
          if (idx !== -1) {
            character.character_inventory.splice(idx, 1);
          }
        } else {
          const newQty = rowQty - quantityToReduce;
          rowsToUpdate.push({ id: row.id, qty: newQty });
          row.quantity = newQty;
          quantityToReduce = 0;
        }
      }
    }

    let updatedSlots = { ...equipmentSlots };
    const remainingCount =
      character.character_inventory
        ?.filter((inv: any) => inv.items?.name === targetName)
        .reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0) || 0;

    let equippedCount = 0;
    Object.keys(updatedSlots).forEach(slotKey => {
      if (updatedSlots[slotKey] === targetName) {
        equippedCount++;
      }
    });

    if (equippedCount > remainingCount) {
      let diff = equippedCount - remainingCount;
      for (const slotKey of Object.keys(updatedSlots)) {
        if (updatedSlots[slotKey] === targetName) {
          updatedSlots[slotKey] = null;
          diff--;
          if (diff <= 0) break;
        }
      }
    }

    let newArmor = updatedSlots.corpo_torso || null;
    let newShield =
      updatedSlots.empunhadura_2 && updatedSlots.empunhadura_2.toLowerCase().includes('escudo')
        ? updatedSlots.empunhadura_2
        : null;
    let newRing = updatedSlots.dedo_anel_1 || updatedSlots.dedo_anel_2 || null;

    setEquippedArmor(newArmor);
    setEquippedShield(newShield);
    setEquippedRing(newRing);
    setEquipmentSlots(updatedSlots);

    character.equipped_armor = newArmor;
    character.equipped_shield = newShield;
    character.equipped_ring = newRing;
    character.equipment_slots = updatedSlots;

    const newAc = calculateTotalAc(
      character,
      newArmor,
      newShield,
      newRing,
      levelUpFightingStyle,
      character.character_inventory
    );
    setCurrentAc(newAc);
    character.armor_class = newAc;

    try {
      if (character.id) {
        const updatePayload: any = {
          coins: newCoinsStr,
          equipment_slots: updatedSlots,
          armor_class: newAc,
          equipped_armor: newArmor,
          equipped_shield: newShield,
          equipped_ring: newRing,
        };
        await updateCharacter(character.id, updatePayload);

        try {
          for (const rowId of rowsToDelete) {
            await removeItemFromInventory(rowId);
          }
          for (const upd of rowsToUpdate) {
            await updateItemQuantity(upd.id, upd.qty);
          }
        } catch (dbErr) {
          console.error('Erro no dual write (venda):', dbErr);
        }
      }

      character.coins = newCoinsStr;

      setShopMessage({
        type: 'success',
        text: `💰 Vendeu "${targetName}" por +${sellPricePO} PO! (50% do valor de compra ${costStr})`,
      });
      setTimeout(() => setShopMessage(null), 4000);

      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      setShopMessage({ type: 'error', text: 'Erro ao vender item: ' + err.message });
    }
  };

  const handleConsumeItem = async (inventoryId: string) => {
    const itemObj = categorizedInventory.all.find((i: any) => i.id === inventoryId);
    if (!itemObj) return;

    const itemToConsume = itemObj.name;
    if (!itemToConsume) return;

    const lower = itemToConsume.toLowerCase();

    if (
      lower.includes('tenda') ||
      lower.includes('saco de dormir') ||
      lower.includes('bedroll') ||
      lower.includes('tent')
    ) {
      setShowShortRestModal(true);
      return;
    }

    let healAmount = 0;
    let effectText = '';

    if (
      lower.includes('poção de cura maior') ||
      lower.includes('pocao de cura maior') ||
      lower.includes('poção maior') ||
      lower.includes('pocao maior')
    ) {
      healAmount =
        Math.floor(Math.random() * 4) +
        1 +
        Math.floor(Math.random() * 4) +
        1 +
        Math.floor(Math.random() * 4) +
        1 +
        Math.floor(Math.random() * 4) +
        1 +
        4;
      effectText = `Recuperou ${healAmount} PV (4d4+4)!`;
    } else if (
      lower.includes('poção') ||
      lower.includes('pocao') ||
      lower.includes('potion') ||
      lower.includes('cura') ||
      lower.includes('vida')
    ) {
      healAmount =
        Math.floor(Math.random() * 4) + 1 + Math.floor(Math.random() * 4) + 1 + 2;
      effectText = `Recuperou ${healAmount} PV (2d4+2)!`;
    } else if (
      lower.includes('kit de curandeiro') ||
      lower.includes('bandagem') ||
      lower.includes('curativo') ||
      lower.includes('primeiros socorros')
    ) {
      healAmount = 5;
      effectText = `Restaurou 5 PV!`;
    } else if (
      lower.includes('ração') ||
      lower.includes('racao') ||
      lower.includes('ration') ||
      lower.includes('marmita') ||
      lower.includes('comida')
    ) {
      healAmount = 0;
      effectText = `Consumido 1x Ração de Viagem. (A ração é utilizada para nutrir o personagem ao acampar em Descansos Curtos na Tenda/Saco de Dormir).`;
    } else if (lower.includes('elixir') || lower.includes('antídoto') || lower.includes('antidoto')) {
      healAmount = 0;
      effectText = `Consumido com sucesso!`;
    } else {
      effectText = `Consumido com sucesso!`;
    }

    const maxHp = character.max_hp || 20;
    const oldHp = currentHp || character.current_hp || maxHp;
    const newHp = Math.min(maxHp, oldHp + healAmount);
    character.current_hp = newHp;
    setCurrentHp(newHp);

    let updatedSlots = { ...equipmentSlots };
    const remainingCount =
      (character.character_inventory
        ?.filter((inv: any) => inv.items?.name === itemToConsume)
        .reduce((acc: number, curr: any) => acc + (curr.quantity || 1), 0) || 0) - 1;
    let equippedCount = 0;
    Object.keys(updatedSlots).forEach(slotKey => {
      if (updatedSlots[slotKey] === itemToConsume) {
        equippedCount++;
      }
    });

    if (equippedCount > remainingCount) {
      let diff = equippedCount - remainingCount;
      for (const slotKey of Object.keys(updatedSlots)) {
        if (updatedSlots[slotKey] === itemToConsume) {
          updatedSlots[slotKey] = null;
          diff--;
          if (diff <= 0) break;
        }
      }
    }

    let newArmor = updatedSlots.corpo_torso || null;
    let newShield =
      updatedSlots.empunhadura_2 && updatedSlots.empunhadura_2.toLowerCase().includes('escudo')
        ? updatedSlots.empunhadura_2
        : null;
    let newRing = updatedSlots.dedo_anel_1 || updatedSlots.dedo_anel_2 || null;

    setEquippedArmor(newArmor);
    setEquippedShield(newShield);
    setEquippedRing(newRing);
    setEquipmentSlots(updatedSlots);

    character.equipped_armor = newArmor;
    character.equipped_shield = newShield;
    character.equipped_ring = newRing;
    character.equipment_slots = updatedSlots;

    const newAc = calculateTotalAc(
      character,
      newArmor,
      newShield,
      newRing,
      levelUpFightingStyle,
      character.character_inventory
    );
    setCurrentAc(newAc);
    character.armor_class = newAc;

    let quantityToReduce = 1;
    const rowsToDelete: string[] = [];
    const rowsToUpdate: { id: string; qty: number }[] = [];

    if (character.character_inventory) {
      const matchingRows = [...character.character_inventory].filter(
        (inv: any) => (inv.items?.name || inv.name || 'Item Desconhecido') === itemToConsume
      );

      for (const row of matchingRows) {
        if (quantityToReduce <= 0) break;

        const rowQty = row.quantity || 1;
        if (rowQty <= quantityToReduce) {
          rowsToDelete.push(row.id);
          quantityToReduce -= rowQty;
          const idx = character.character_inventory.findIndex((inv: any) => inv.id === row.id);
          if (idx !== -1) {
            character.character_inventory.splice(idx, 1);
          }
        } else {
          const newQty = rowQty - quantityToReduce;
          rowsToUpdate.push({ id: row.id, qty: newQty });
          row.quantity = newQty;
          quantityToReduce = 0;
        }
      }
    }

    try {
      if (character.id) {
        await updateCharacter(character.id, {
          equipment_slots: updatedSlots,
          armor_class: newAc,
          current_hp: newHp,
        });

        try {
          for (const rowId of rowsToDelete) {
            await removeItemFromInventory(rowId);
          }
          for (const upd of rowsToUpdate) {
            await updateItemQuantity(upd.id, upd.qty);
          }
        } catch (dbErr) {
          console.error('Erro no dual write (consumo):', dbErr);
        }
      }

      setShopMessage({
        type: 'success',
        text: `🧪 ${itemToConsume} consumido! ${effectText}`,
      });
      setTimeout(() => setShopMessage(null), 4000);

      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      console.error('Erro ao consumir item:', err);
      setShopMessage({
        type: 'error',
        text: 'Erro ao remover o item do inventário: ' + err.message,
      });
    }
  };

  const handleBuyItem = (item: ShopCatalogItem) => {
    setItemToBuyConfirm(item);
    setBuyQuantity(1);
  };

  const handleBuyItemConfirmed = async (item: ShopCatalogItem, quantity: number) => {
    const totalPrice = item.pricePO * quantity;
    if (currentGoldNumber < totalPrice) {
      setShopMessage({
        type: 'error',
        text: `⚠️ Moedas insuficientes! ${quantity}x "${item.name}" custam ${totalPrice} PO e você tem apenas ${formatGold(
          currentGoldNumber
        )}.`,
      });
      setTimeout(() => setShopMessage(null), 4000);
      return;
    }

    const newGoldNum = currentGoldNumber - totalPrice;
    const newCoinsStr = formatGold(newGoldNum);

    try {
      if (character.id) {
        await updateCharacter(character.id, {
          coins: newCoinsStr,
        });

        try {
          const itemId = getItemIdByName(item.name);
          if (itemId) {
            const addedItem = await addItemToInventory(character.id, itemId, quantity);
            if (addedItem) {
              if (!character.character_inventory) character.character_inventory = [];
              const existing = character.character_inventory.find((i: any) => i.id === addedItem.id);
              if (existing) {
                existing.quantity = addedItem.quantity;
              } else {
                character.character_inventory.push(addedItem);
              }
            }
          } else {
            console.warn(`Item ${item.name} não encontrado no banco de dados para inserção relacional.`);
          }
        } catch (dbErr) {
          console.error('Erro no dual write (compra):', dbErr);
        }
      }

      character.coins = newCoinsStr;

      setShopMessage({
        type: 'success',
        text: `🛒 Comprou ${quantity}x "${item.name}" por -${totalPrice} PO! Adicionado ao seu inventário.`,
      });
      setTimeout(() => setShopMessage(null), 4000);

      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      setShopMessage({ type: 'error', text: 'Erro ao comprar item: ' + err.message });
    }
  };

  const handleAddCustomItem = async () => {
    if (!customItemInput.trim()) return;
    const newItem = customItemInput.trim();

    try {
      if (character.id) {
        try {
          const itemId = getItemIdByName(newItem);
          if (itemId) {
            const addedItem = await addItemToInventory(character.id, itemId, 1);
            if (addedItem) {
              if (!character.character_inventory) character.character_inventory = [];
              const existing = character.character_inventory.find((i: any) => i.id === addedItem.id);
              if (existing) {
                existing.quantity = addedItem.quantity;
              } else {
                character.character_inventory.push(addedItem);
              }
            }
          } else {
            console.warn(`Item customizado ${newItem} não encontrado no BD para inserção.`);
          }
        } catch (dbErr) {
          console.error('Erro no dual write (add custom):', dbErr);
        }
      }
      setCustomItemInput('');
      setShowCustomItemModal(false);
      setShopMessage({ type: 'success', text: `✓ Item "${newItem}" adicionado ao inventário.` });
      setTimeout(() => setShopMessage(null), 3000);
      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      setShopMessage({ type: 'error', text: 'Erro ao adicionar item: ' + err.message });
    }
  };

  const handleSaveGold = async () => {
    const val = parseFloat(goldInput.replace(',', '.'));
    if (isNaN(val) || val < 0) return;
    const newCoinsStr = formatGold(val);

    try {
      if (character.id) {
        await updateCharacter(character.id, {
          coins: newCoinsStr,
        });
      }
      character.coins = newCoinsStr;
      setShowGoldModal(false);
      setShopMessage({ type: 'success', text: `✓ Saldo atualizado para ${newCoinsStr}.` });
      setTimeout(() => setShopMessage(null), 3000);
      if (onCharacterUpdated) onCharacterUpdated();
    } catch (err: any) {
      setShopMessage({ type: 'error', text: 'Erro ao atualizar moedas: ' + err.message });
    }
  };

  return {
    inventoryTab,
    setInventoryTab,
    itemToSellConfirm,
    setItemToSellConfirm,
    sellQuantity,
    setSellQuantity,
    itemToBuyConfirm,
    setItemToBuyConfirm,
    buyQuantity,
    setBuyQuantity,
    showCustomItemModal,
    setShowCustomItemModal,
    customItemInput,
    setCustomItemInput,
    showGoldModal,
    setShowGoldModal,
    goldInput,
    setGoldInput,
    currentGoldNumber,
    totalInventoryWeight,
    maxWeightCapacity,
    isOverburdened,
    categorizedInventory,
    formatGold,
    handleSellItem,
    confirmSellItem,
    handleBuyItem,
    handleBuyItemConfirmed,
    handleAddCustomItem,
    handleSaveGold,
    handleConsumeItem,
  };
};
