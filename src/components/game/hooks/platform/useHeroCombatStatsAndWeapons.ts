import { useState, useMemo, useEffect } from 'react';
import { CombatEntity, CombatLog } from '../../../../game/types';
import { parseAttacks } from '../../../../lib/mechanics/inventoryParser';
import { parseEquipmentToList } from '../../../../lib/mechanics/xpAndLootManager';
import { calculateAC } from '../../../../lib/mechanics/acCalculator';
import { isLightWeapon } from '../../../../game/combatEngine';
import { XP_BUDGET_BY_LEVEL, getActionMultiplier } from '../../../../game/encounterOrchestrator';

export interface UseHeroCombatStatsAndWeaponsProps {
  character: any;
  entities: CombatEntity[];
  setEntities: (val: CombatEntity[] | ((prev: CombatEntity[]) => CombatEntity[])) => void;
  activeEntityIndex: number;
  versatileTwoHandedWeapons: Record<string, boolean>;
  getActiveFeats: () => string[];
  shouldHideEntityDetails: (ent: CombatEntity) => boolean;
  addCombatLog: (actorName: string, title: string, detail: string, type?: CombatLog['type'] | 'spell') => void;
  isVersatileWeapon: (atkName: string, properties?: string) => boolean;
  getVersatileDamage: (atkName: string, properties?: string) => string;
}

export function useHeroCombatStatsAndWeapons({
  character,
  entities,
  setEntities,
  activeEntityIndex,
  versatileTwoHandedWeapons,
  getActiveFeats,
  shouldHideEntityDetails,
  addCombatLog,
  isVersatileWeapon,
  getVersatileDamage
}: UseHeroCombatStatsAndWeaponsProps) {
  const [selectedAttackIndex, setSelectedAttackIndex] = useState<number>(0);
  const [hasChangedWeaponThisTurn, setHasChangedWeaponThisTurn] = useState<boolean>(false);

  // Parse e extração de itens usáveis do inventário do personagem
  const usableInventoryItems = useMemo(() => {
    if (!character?.equipment) return [];
    let rawStrings: string[] = [];
    if (Array.isArray(character.equipment)) {
      rawStrings = character.equipment;
    } else if (typeof character.equipment === 'string') {
      try {
        const parsed = JSON.parse(character.equipment);
        if (Array.isArray(parsed)) rawStrings = parsed;
        else rawStrings = [character.equipment];
      } catch {
        rawStrings = [character.equipment];
      }
    }

    const items: Array<{ name: string; qty: number }> = [];
    rawStrings.forEach(raw => {
      if (!raw || typeof raw !== 'string') return;
      const parts = raw.split(/,\s*|\s+e\s+|\n/);
      parts.forEach(part => {
        const trimmed = part.trim();
        if (!trimmed) return;
        const match = trimmed.match(/^(\d+)\s*x?\s+(.+)$/i) || trimmed.match(/^(.+?)\s*\((\d+)\)$/i);
        if (match) {
          const qty = parseInt(match[1].match(/^\d+$/) ? match[1] : match[2], 10);
          const name = match[1].match(/^\d+$/) ? match[2] : match[1];
          items.push({ name: name.trim(), qty: isNaN(qty) ? 1 : qty });
        } else {
          items.push({ name: trimmed, qty: 1 });
        }
      });
    });

    const mapped = items.map(item => {
      const itemName = item.name;
      const qty = item.qty;
      const lower = itemName.toLowerCase();
      const baseName = itemName.replace(/\s*\(\d+\)$/, '').trim();

      if (lower.includes('poção de cura maior') || lower.includes('pocao de cura maior') || lower.includes('poção maior') || lower.includes('pocao maior')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '🏺',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Restaura 4d4+4 Pontos de Vida no combate.',
          effectType: 'heal_major' as const,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          btnColor: 'bg-rose-600 hover:bg-rose-500'
        };
      }

      if (lower.includes('poção') || lower.includes('pocao') || lower.includes('potion') || lower.includes('cura') || lower.includes('vida')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '🧪',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Restaura 2d4+2 Pontos de Vida no combate.',
          effectType: 'heal_minor' as const,
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          btnColor: 'bg-rose-600 hover:bg-rose-500'
        };
      }

      if (lower.includes('antídoto') || lower.includes('antidoto')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '🌿',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Neutraliza envenenamento e concede resistência a veneno por 1 hora.',
          effectType: 'antidote' as const,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          btnColor: 'bg-emerald-600 hover:bg-emerald-500'
        };
      }

      if (lower.includes('elixir') || lower.includes('agilidade') || lower.includes('velocidade') || lower.includes('speed')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '⚡',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Ganha +4.5m (+3 cel) de deslocamento livre.',
          effectType: 'speed' as const,
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
          btnColor: 'bg-blue-600 hover:bg-blue-500'
        };
      }

      if (lower.includes('força') || lower.includes('forca') || lower.includes('strength')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '💪',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Concede +2 de bônus em jogadas de ataque e dano corpo a corpo.',
          effectType: 'strength' as const,
          badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
          btnColor: 'bg-red-600 hover:bg-red-500'
        };
      }

      if (lower.includes('pergaminho') || lower.includes('scroll') || lower.includes('proteção') || lower.includes('protecao')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '📜',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Concede +3 na CA até seu próximo turno.',
          effectType: 'ac' as const,
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          btnColor: 'bg-purple-600 hover:bg-purple-500'
        };
      }

      if (lower.includes('fogo') || lower.includes('bomba') || lower.includes('ácido') || lower.includes('acido') || lower.includes('alquímico') || lower.includes('alquimico')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '💣',
          actionCost: 'action' as const,
          actionCostLabel: 'Ação Principal',
          description: 'Arremessa contra o inimigo mais próximo causando 2d6 Dano de Fogo.',
          effectType: 'bomb' as const,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          btnColor: 'bg-orange-600 hover:bg-orange-500'
        };
      }

      if (lower.includes('curandeiro') || lower.includes('primeiros socorros') || lower.includes('bandagem') || lower.includes('curativo')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '🩹',
          actionCost: 'bonus' as const,
          actionCostLabel: 'Ação Bônus',
          description: 'Trata ferimentos restaurando 5 PV fixos.',
          effectType: 'kit' as const,
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          btnColor: 'bg-emerald-600 hover:bg-emerald-500'
        };
      }

      if (lower.includes('saco de dormir') || lower.includes('sleeping bag')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '🛌',
          actionCost: 'action' as const,
          actionCostLabel: 'Ação Principal',
          description: 'Descanso Curto rápido no saco de dormir (recupera PV e recursos). 50% de chance de atrair monstros!',
          effectType: 'sleeping_bag' as const,
          badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          btnColor: 'bg-orange-600 hover:bg-orange-500'
        };
      }

      if (lower.includes('tenda') || lower.includes('barraca') || lower.includes('tent') || lower.includes('acampamento')) {
        return {
          id: baseName,
          name: baseName,
          baseQty: qty,
          icon: '⛺',
          actionCost: 'action' as const,
          actionCostLabel: 'Ação Principal',
          description: 'Arma a tenda para realizar um Descanso Curto (recupera PV e recursos). Requer 1 Ração no inventário (20% de chance de atração).',
          effectType: 'tent' as const,
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          btnColor: 'bg-amber-600 hover:bg-amber-500'
        };
      }

      const isWeaponOrArmorOnly = /^(Armadura|Cota|Gibão|Escudo|Elmo|Manopla|Machado|Machadinha|Adaga|Maça|Foice|Espada|Mangual|Azagaia|Cimitarra|Arco|Lança|Bordão)\b/i.test(itemName);
      if (isWeaponOrArmorOnly) {
        return null;
      }

      return null;
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    const uniqueMap = new Map<string, typeof mapped[0]>();
    mapped.forEach(item => {
      const canonicalId = item.id.toLowerCase();
      if (uniqueMap.has(canonicalId)) {
        uniqueMap.get(canonicalId)!.baseQty += item.baseQty;
      } else {
        uniqueMap.set(canonicalId, { ...item, id: canonicalId });
      }
    });

    return Array.from(uniqueMap.values());
  }, [character?.equipment]);

  // Contagem de Rações no Inventário
  const totalRationsCount = useMemo(() => {
    if (!character?.equipment) return 0;
    let rawStrings: string[] = [];
    if (Array.isArray(character.equipment)) {
      rawStrings = character.equipment;
    } else if (typeof character.equipment === 'string') {
      try {
        const parsed = JSON.parse(character.equipment);
        if (Array.isArray(parsed)) rawStrings = parsed;
        else rawStrings = [character.equipment];
      } catch {
        rawStrings = [character.equipment];
      }
    }

    let total = 0;
    rawStrings.forEach(raw => {
      if (!raw || typeof raw !== 'string') return;
      const parts = raw.split(/,\s*|\s+e\s+|\n/);
      parts.forEach(part => {
        const trimmed = part.trim();
        if (!trimmed) return;
        const lower = trimmed.toLowerCase();
        if (lower.includes('ração') || lower.includes('racao') || lower.includes('ration') || lower.includes('marmita') || lower.includes('comida')) {
          const match = trimmed.match(/\b(\d+)\s*x?\b/i);
          total += match ? parseInt(match[1], 10) : 1;
        }
      });
    });
    return total;
  }, [character?.equipment]);

  // Extrair lista de ataques cadastrados na ficha
  const characterAttacks: any[] = useMemo(() => {
    if (!character) return [];

    const equipmentList = parseEquipmentToList(character.equipment);
    const stats = {
      str: character.strength || 10,
      dex: character.dexterity || 10,
      con: character.constitution || 10,
      int: character.intelligence || 10,
      wis: character.wisdom || 10,
      cha: character.charisma || 10,
    };

    const className = (character.class_name || character.charClass || '').toLowerCase();
    let attackStat: 'str' | 'dex' | 'int' | 'wis' | 'cha' = 'str';
    if (className.includes('mago') || className.includes('wizard')) attackStat = 'int';
    else if (className.includes('clérigo') || className.includes('cleric') || className.includes('druida') || className.includes('druid') || className.includes('patrulheiro') || className.includes('ranger')) attackStat = 'wis';
    else if (className.includes('bardo') || className.includes('bard') || className.includes('feiticeiro') || className.includes('sorcerer') || className.includes('bruxo') || className.includes('warlock') || className.includes('paladino') || className.includes('paladin')) attackStat = 'cha';
    else if (className.includes('ladino') || className.includes('rogue') || className.includes('monge') || className.includes('monk')) attackStat = 'dex';

    const pb = 2 + Math.floor(((character.level || 1) - 1) / 4);

    let spellsList: string[] = [];
    if (Array.isArray(character.spells)) {
      spellsList = character.spells.map((s: any) => typeof s === 'string' ? s : s.name);
    } else if (typeof character.spells === 'string') {
      try {
        const parsed = JSON.parse(character.spells);
        if (Array.isArray(parsed)) spellsList = parsed.map((s: any) => typeof s === 'string' ? s : s.name);
      } catch {}
    }

    const weaponItems = equipmentList.map(name => ({ name, equipped: true, category: 'Arma' }));
    const parsedAttacks = parseAttacks(weaponItems, spellsList, stats, attackStat, pb, getActiveFeats());

    const formattedParsedAttacks: (typeof parsedAttacks[0] & { damage_type: string; attack_bonus: number; isVersatileTwoHanded?: boolean })[] = parsedAttacks.map(a => ({
      name: a.name,
      attack_bonus: a.bonus,
      bonus: a.bonus,
      damage: a.damage,
      type: a.type,
      damage_type: a.type,
      range: a.range,
      mastery: a.mastery,
      properties: a.properties
    }));
    const finalAttacksList = [...formattedParsedAttacks];

    let slots: Record<string, string | null> = {};
    if (character.equipment_slots) {
      if (typeof character.equipment_slots === 'string') {
        try { slots = JSON.parse(character.equipment_slots); } catch {}
      } else {
        slots = character.equipment_slots;
      }
    } else if (character.equipmentSlots) {
      slots = character.equipmentSlots;
    }

    const equippedWeaponName = (
      slots['empunhadura_1'] ||
      slots['empunhadura_2'] ||
      character.equipped_weapon ||
      character.equippedWeapon ||
      character.equipped_main_weapon ||
      ''
    ).trim();

    if (equippedWeaponName) {
      const reqLower = equippedWeaponName.toLowerCase();
      const equippedIdx = finalAttacksList.findIndex(atk => {
        const atkLower = (atk.name || '').toLowerCase().trim();
        return atkLower === reqLower || atkLower.includes(reqLower) || reqLower.includes(atkLower);
      });

      if (equippedIdx > 0) {
        const [equippedAtk] = finalAttacksList.splice(equippedIdx, 1);
        finalAttacksList.unshift(equippedAtk);
      }
    }

    const processedAttacks = finalAttacksList.map(atk => {
      let modifiedAtk = { ...atk };
      const isVersatile = isVersatileWeapon(modifiedAtk.name, modifiedAtk.properties);
      const isTwoHandedMode = isVersatile && Boolean(versatileTwoHandedWeapons[modifiedAtk.name]);

      if (isTwoHandedMode) {
        const versatileDie = getVersatileDamage(modifiedAtk.name, modifiedAtk.properties);
        modifiedAtk.damage = modifiedAtk.damage.replace(/^\d+d\d+/, versatileDie);
        modifiedAtk.properties = modifiedAtk.properties ? `${modifiedAtk.properties}, 2 Mãos` : '2 Mãos';
        modifiedAtk.isVersatileTwoHanded = true;

        if (modifiedAtk.properties && modifiedAtk.properties.toLowerCase().includes('duelismo')) {
          modifiedAtk.attack_bonus = (Number(modifiedAtk.attack_bonus) || 0) - 2;
          modifiedAtk.properties = modifiedAtk.properties
            .split(',')
            .map(p => p.trim())
            .filter(p => !p.toLowerCase().includes('duelismo'))
            .join(', ');
        }
      }
      return modifiedAtk;
    });

    return processedAttacks;
  }, [character, versatileTwoHandedWeapons, getActiveFeats, isVersatileWeapon, getVersatileDamage]);

  const currentSelectedAttack = characterAttacks[selectedAttackIndex] || characterAttacks[0] || null;

  // Cálculo de CA dinâmico
  const heroACDetails = useMemo(() => {
    if (!character) return { ac: 14, shieldActive: false, twoHandedWeaponBlockedShield: false, shieldPenalty: false };
    const equipmentList = parseEquipmentToList(character.equipment);

    const res = calculateAC({
      charClass: character.class_name || character.charClass || '',
      stats: {
        dex: character.dexterity || 10,
        con: character.constitution || 10,
        wis: character.wisdom || 10,
      },
      equippedArmor: character.equipped_armor,
      equippedShield: character.equipped_shield,
      equippedRing: character.equipped_ring,
      fightingStyle: character.fighting_style,
      inventoryItems: equipmentList,
      selectedWeaponName: currentSelectedAttack?.name || null,
      equipmentSlots: character.equipment_slots || character.equipmentSlots || {},
      feats: getActiveFeats(),
      versatileTwoHanded: currentSelectedAttack ? Boolean(versatileTwoHandedWeapons[currentSelectedAttack.name]) : false
    });

    let slots: Record<string, string | null> = {};
    if (character.equipment_slots) {
      if (typeof character.equipment_slots === 'string') {
        try { slots = JSON.parse(character.equipment_slots); } catch {}
      } else {
        slots = character.equipment_slots;
      }
    } else if (character.equipmentSlots) {
      slots = character.equipmentSlots;
    }
    const rawW2 = slots['empunhadura_2'] || character?.equipped_shield || '';
    const hasShield = Boolean(rawW2 && (rawW2.toLowerCase().includes('escudo') || rawW2.toLowerCase().includes('shield')));

    const heroEntity = entities.find(e => e.type === 'hero');
    const offHandUsed = Boolean(heroEntity?.offHandAttackUsedThisTurn);
    if (hasShield && offHandUsed) {
      const shieldVal = res.shieldBonus || 2;
      return {
        ...res,
        ac: Math.max(10, res.armor_class - shieldVal),
        shieldActive: false,
        shieldPenalty: true
      };
    }

    return { ...res, shieldPenalty: false };
  }, [character, currentSelectedAttack, entities, getActiveFeats, versatileTwoHandedWeapons]);

  // Combat Summary
  const combatSummary = useMemo(() => {
    const monsters = entities.filter(e => e.type === 'monster');
    const totalMonsters = monsters.length;
    const aliveMonsters = monsters.filter(m => !m.isDead && m.currentHp > 0).length;
    const defeatedMonsters = totalMonsters - aliveMonsters;
    const hasHiddenMonsters = monsters.some(m => shouldHideEntityDetails(m));
    const totalXp = monsters.reduce((acc, m) => acc + (shouldHideEntityDetails(m) ? 0 : (m.xpValue || 0)), 0);

    const crCountMap: Record<string, number> = {};
    monsters.forEach(m => {
      const cr = shouldHideEntityDetails(m) ? '??' : (m.cr || '1/4');
      crCountMap[cr] = (crCountMap[cr] || 0) + 1;
    });

    const crFormatted = Object.entries(crCountMap)
      .map(([cr, count]) => count > 1 ? `ND ${cr} (x${count})` : `ND ${cr}`)
      .join(', ');

    const heroLvl = character?.level || 1;
    const levelBudget = XP_BUDGET_BY_LEVEL[heroLvl] || XP_BUDGET_BY_LEVEL[1];
    const { finalMultiplier } = getActionMultiplier(totalMonsters, 1);
    const adjustedXp = Math.round(totalXp * finalMultiplier);

    let diffLabel = 'Média';
    let diffColor = 'text-amber-400 bg-amber-950/40 border-amber-800/40';
    if (adjustedXp >= levelBudget.deadly) {
      diffLabel = 'Mortal 💀';
      diffColor = 'text-rose-400 bg-rose-950/40 border-rose-800/40';
    } else if (adjustedXp >= levelBudget.hard) {
      diffLabel = 'Difícil ⚠️';
      diffColor = 'text-orange-400 bg-orange-950/40 border-orange-800/40';
    } else if (adjustedXp <= levelBudget.easy) {
      diffLabel = 'Fácil 🛡️';
      diffColor = 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
    }

    return {
      totalMonsters,
      aliveMonsters,
      defeatedMonsters,
      totalXp,
      hasHiddenMonsters,
      crFormatted: crFormatted || 'ND 1/4',
      diffLabel,
      diffColor,
      monsters
    };
  }, [entities, character, shouldHideEntityDetails]);

  // Reset weapon change state on new turn
  useEffect(() => {
    if (entities[activeEntityIndex]?.type === 'hero') {
      setHasChangedWeaponThisTurn(false);
    }
  }, [activeEntityIndex, entities]);

  const handleSelectWeapon = (idx: number) => {
    const currentWeapon = characterAttacks[selectedAttackIndex] || characterAttacks[0];
    const targetWeapon = characterAttacks[idx];

    const isCurrentLight = currentWeapon ? isLightWeapon(currentWeapon.name, currentWeapon.properties) : false;
    const isTargetLight = targetWeapon ? isLightWeapon(targetWeapon.name, targetWeapon.properties) : false;

    const isDualWieldingSwitch = isCurrentLight && isTargetLight;

    if (hasChangedWeaponThisTurn && !isDualWieldingSwitch) {
      addCombatLog('Sistema', 'Ação Inválida', 'Você já interagiu com seu inventário de armas neste turno. Só é permitido trocar de arma uma vez por turno.', 'system');
      return;
    }
    setSelectedAttackIndex(idx);
    if (!isDualWieldingSwitch) {
      setHasChangedWeaponThisTurn(true);
    }
    const heroEntity = entities.find(e => e.type === 'hero');
    if (heroEntity) {
      addCombatLog(heroEntity.name, 'Trocou de Arma', `Equipou ${characterAttacks[idx]?.name || 'Arma'}.`, 'system');
    }
  };

  // Sincronizar o estado da entidade do herói no combate quando a arma ou a CA mudar
  useEffect(() => {
    if (!entities || entities.length === 0) return;
    setEntities(prev => {
      let changed = false;
      const next = prev.map(e => {
        if (e.type === 'hero') {
          const newAc = heroACDetails.ac;
          const newDamage = currentSelectedAttack?.damage || e.damageDice;
          const newBonus = currentSelectedAttack?.attack_bonus !== undefined ? Number(currentSelectedAttack.attack_bonus) : e.attackBonus;
          if (e.armor_class !== newAc || e.damageDice !== newDamage || e.attackBonus !== newBonus) {
            changed = true;
            return {
              ...e,
              armor_class: newAc,
              ac: newAc,
              damageDice: newDamage,
              attackBonus: newBonus
            };
          }
        }
        return e;
      });
      return changed ? next : prev;
    });
  }, [heroACDetails.ac, currentSelectedAttack?.name, currentSelectedAttack?.damage, currentSelectedAttack?.attack_bonus, setEntities]);

  // Informações da Maestria em Arma
  const weaponMasteryInfo = useMemo(() => {
    if (!currentSelectedAttack) return null;

    const charLevel = Number(character?.level || 1);
    if (charLevel < 2) {
      return null;
    }

    const className = (character?.class_name || character?.charClass || '').toLowerCase();
    const characterFeatures = JSON.stringify(character?.features || []).toLowerCase();
    
    const martialClasses = ['guerreiro', 'fighter', 'bárbaro', 'barbarian', 'paladino', 'paladin', 'patrulheiro', 'ranger', 'ladino', 'rogue', 'monge', 'monk'];
    const hasMasteryFeature = martialClasses.some(c => className.includes(c)) || characterFeatures.includes('maestria') || characterFeatures.includes('mastery');

    if (!hasMasteryFeature) {
      return null;
    }

    const atkMastery = currentSelectedAttack.mastery || '';
    const atkName = currentSelectedAttack.name || '';

    if (atkMastery) return { name: atkMastery, source: 'weapon' };

    const lowerName = atkName.toLowerCase();
    if (lowerName.includes('machado grande') || lowerName.includes('glaive') || lowerName.includes('alabarda')) return { name: 'Cleave (Fender)', source: 'derived' };
    if (lowerName.includes('espada grande') || lowerName.includes('espada longa')) return { name: 'Graze (Rozar)', source: 'derived' };
    if (lowerName.includes('machadinha') || lowerName.includes('espada curta') || lowerName.includes('rapieira') || lowerName.includes('arco curto')) return { name: 'Vex (Vexar)', source: 'derived' };
    if (lowerName.includes('adaga') || lowerName.includes('cimitarra') || lowerName.includes('foice')) return { name: 'Nick (Corte Rápido)', source: 'derived' };
    if (lowerName.includes('maça') || lowerName.includes('mangual') || lowerName.includes('lança')) return { name: 'Sap (Enfraquecer)', source: 'derived' };
    if (lowerName.includes('azagaia') || lowerName.includes('arco longo') || lowerName.includes('besta leve') || lowerName.includes('chicote')) return { name: 'Slow (Lentidão)', source: 'derived' };
    if (lowerName.includes('machado de batalha') || lowerName.includes('bordão') || lowerName.includes('malho') || lowerName.includes('tridente')) return { name: 'Topple (Derrubar)', source: 'derived' };
    if (lowerName.includes('besta pesada') || lowerName.includes('martelo de guerra') || lowerName.includes('clava grande')) return { name: 'Push (Empurrar)', source: 'derived' };

    return { name: 'Golpe Tático de Maestria', source: 'class' };
  }, [currentSelectedAttack, character]);

  return {
    usableInventoryItems,
    totalRationsCount,
    characterAttacks,
    selectedAttackIndex,
    setSelectedAttackIndex,
    hasChangedWeaponThisTurn,
    setHasChangedWeaponThisTurn,
    currentSelectedAttack,
    heroACDetails,
    combatSummary,
    handleSelectWeapon,
    weaponMasteryInfo
  };
}
