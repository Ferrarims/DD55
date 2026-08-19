import { CombatEntity, CombatLog, LootItem } from './types';
import { getCachedEquipmentReference } from '../lib/api/itemsService';
import { getRandomItemFromDatabase } from '../lib/mechanics/xpAndLootManager';
import { calculateCover } from './coverMechanics';

// Rolar dados com notação string (ex: '1d6+2', '2d8+3', ou fórmulas compostas como '1d8+1d6+4')
export function rollDiceString(diceStr: string): { total: number; rollDetails: string } {
  try {
    const sanitized = diceStr.replace(/\s+/g, '').toLowerCase();
    
    // Divide a string por '+' ou '-' mantendo os sinais para podermos processá-los individualmente
    const parts = sanitized
      .replace(/\+/g, ' +')
      .replace(/-/g, ' -')
      .trim()
      .split(/\s+/);

    let total = 0;
    const detailsList: string[] = [];
    
    for (const part of parts) {
      if (!part) continue;
      
      // Verificar se é um termo de dado, ex: "+2d6", "-1d4", "2d6", "1d8", etc.
      const diceRegex = /^([+-]?)(\d+)d(\d+)$/;
      const diceMatch = part.match(diceRegex);
      
      if (diceMatch) {
        const sign = diceMatch[1] || '+';
        const count = parseInt(diceMatch[2], 10);
        const sides = parseInt(diceMatch[3], 10);
        
        let termSum = 0;
        const rolls: number[] = [];
        for (let i = 0; i < count; i++) {
          const r = Math.floor(Math.random() * sides) + 1;
          rolls.push(r);
          termSum += r;
        }
        
        if (sign === '-') {
          total -= termSum;
          detailsList.push(`-(${rolls.join('+')})`);
        } else {
          total += termSum;
          // Se for o primeiro termo e positivo, não precisa de prefixo '+', senão adicionamos '+'
          const prefix = detailsList.length > 0 ? '+' : '';
          detailsList.push(`${prefix}(${rolls.join('+')})`);
        }
      } else {
        // É um modificador numérico fixo, ex: "+3", "-2", "4"
        const numRegex = /^([+-]?)(\d+)$/;
        const numMatch = part.match(numRegex);
        
        if (numMatch) {
          const sign = numMatch[1] || '+';
          const value = parseInt(numMatch[2], 10);
          
          if (sign === '-') {
            total -= value;
            detailsList.push(`-${value}`);
          } else {
            const prefix = detailsList.length > 0 ? '+' : '';
            total += value;
            detailsList.push(`${prefix}${value}`);
          }
        }
      }
    }
    
    const finalTotal = Math.max(1, total);
    const rollDetails = `${detailsList.join(' ')} = ${finalTotal}`;
    
    return { total: finalTotal, rollDetails };
  } catch {
    return { total: 4, rollDetails: '4' };
  }
}

// Rolar dados de dano considerando talentos (Feats) do combatente
export function rollDamageDiceWithFeats(
  diceStr: string,
  attacker: CombatEntity,
  isCritical: boolean,
  damageType?: string,
  weaponName?: string,
  weaponProperties?: string,
  isMeleeAttack?: boolean
): { total: number; rollDetails: string } {
  try {
    const sanitized = diceStr.replace(/\s+/g, '').toLowerCase();
    
    const hasGWF = attacker.feats?.includes('Combate com Armas Grandes') || 
                   attacker.feats?.includes('Great Weapon Fighting') ||
                   (attacker as any).fightingStyle === 'Combate com Armas Grandes' ||
                   (attacker as any).fighting_style === 'Combate com Armas Grandes';

    const hasPiercer = attacker.feats?.includes('Perfurador') || attacker.feats?.includes('Piercer');
    const hasTavernBrawler = attacker.feats?.includes('Valentão de Taverna') || attacker.feats?.includes('Tavern Brawler');
    const hasIrresistible = attacker.feats?.includes('Dádiva do Ataque Irresistível') || attacker.feats?.includes('Epic Boon of Irresistible Offense');

    const wName = (weaponName || '').toLowerCase();
    const wProps = (weaponProperties || '').toLowerCase();

    // Determina se a arma é de ataque à distância (Ranged)
    const isRangedWeapon = wProps.includes('munição') || wProps.includes('ammunition') || wProps.includes('distância') || wProps.includes('ranged') ||
      wName.includes('arco') || wName.includes('besta') || wName.includes('funda') || wName.includes('bow') || 
      wName.includes('crossbow') || wName.includes('sling') || wName.includes('dardo') || wName.includes('cerbatana') || wName.includes('shuriken');

    // Somente armas/ataques corpo a corpo qualificam-se para Combate com Armas Grandes
    const isMelee = (isMeleeAttack !== false) && !isRangedWeapon;

    // Verificar se a arma é empunhada com duas mãos
    const isExplicitTwoHanded = wProps.includes('duas mãos') || wProps.includes('two-handed') || wProps.includes('2 mãos') ||
      wName.includes('duas mãos') || wName.includes('two-handed') || wName.includes('bastarda') || 
      wName.includes('alabarda') || wName.includes('montante') || wName.includes('glaive') || 
      wName.includes('pique') || wName.includes('malho') || wName.includes('machado grande') || 
      wName.includes('espada grande') || wName.includes('greatsword') || wName.includes('greataxe') || 
      wName.includes('maul') || wName.includes('halberd') || wName.includes('marreta');

    const isVersatile = wProps.includes('versátil') || wProps.includes('versatile') || 
      wName.includes('espada longa') || wName.includes('longsword') || 
      wName.includes('machado de batalha') || wName.includes('battleaxe') || 
      wName.includes('martelo de guerra') || wName.includes('warhammer') || 
      wName.includes('tridente') || wName.includes('cajado');

    // Arma versátil é empunhada em 2 mãos se não houver escudo no equipamento
    let isVersatileTwoHanded = false;
    if (isVersatile) {
      let slots: Record<string, string | null> = {};
      if (attacker.equipment_slots) {
        if (typeof attacker.equipment_slots === 'string') {
          try { slots = JSON.parse(attacker.equipment_slots); } catch {}
        } else {
          slots = attacker.equipment_slots as any;
        }
      }
      const shieldEquipped = slots['empunhadura_2'] || slots['empunhadura_1'];
      const hasShield = shieldEquipped && (shieldEquipped.toLowerCase().includes('escudo') || shieldEquipped.toLowerCase().includes('shield'));
      if (!hasShield) {
        isVersatileTwoHanded = true;
      }
    }

    const isTwoHandedMelee = isMelee && (isExplicitTwoHanded || isVersatileTwoHanded);

    const parts = sanitized
      .replace(/\+/g, ' +')
      .replace(/-/g, ' -')
      .trim()
      .split(/\s+/);

    let total = 0;
    const detailsList: string[] = [];
    let piercerUsed = false;

    for (const part of parts) {
      if (!part) continue;
      
      const diceRegex = /^([+-]?)(\d+)d(\d+)$/;
      const diceMatch = part.match(diceRegex);
      
      if (diceMatch) {
        const sign = diceMatch[1] || '+';
        const count = parseInt(diceMatch[2], 10);
        const sides = parseInt(diceMatch[3], 10);
        
        let termSum = 0;
        const rolls: number[] = [];
        
        for (let i = 0; i < count; i++) {
          let r = Math.floor(Math.random() * sides) + 1;
          let rerolledText = '';

          // 1. Combate com Armas Grandes (GWF): re-rola 1 ou 2 somente em armas corpo a corpo empunhadas com duas mãos
          if (hasGWF && isTwoHandedMelee && (r === 1 || r === 2)) {
            const oldR = r;
            r = Math.floor(Math.random() * sides) + 1;
            rerolledText = `⚡[GWF:${oldR}→${r}]`;
          }

          // 2. Valentão de Taverna: re-rola 1 em ataques desarmados
          const isUnarmed = weaponName?.toLowerCase().includes('desarmado') || diceStr.includes('unarmed');
          if (hasTavernBrawler && isUnarmed && r === 1) {
            const oldR = r;
            r = Math.floor(Math.random() * sides) + 1;
            rerolledText = `👊[Valentão:${oldR}→${r}]`;
          }

          // 3. Perfurador: re-rola 1 ou 2 em dano perfurante (uma vez por ataque)
          const isPiercing = damageType?.toLowerCase().includes('perfurante') || damageType?.toLowerCase().includes('piercing');
          if (hasPiercer && isPiercing && !piercerUsed && (r === 1 || r === 2)) {
            const oldR = r;
            r = Math.floor(Math.random() * sides) + 1;
            piercerUsed = true;
            rerolledText = `🎯[Perfurador:${oldR}→${r}]`;
          }

          rolls.push(r);
          termSum += r;
        }
        
        if (sign === '-') {
          total -= termSum;
          detailsList.push(`-(${rolls.join('+')})`);
        } else {
          total += termSum;
          const prefix = detailsList.length > 0 ? '+' : '';
          detailsList.push(`${prefix}(${rolls.join('+')})`);
        }
      } else {
        const numRegex = /^([+-]?)(\d+)$/;
        const numMatch = part.match(numRegex);
        
        if (numMatch) {
          const sign = numMatch[1] || '+';
          const value = parseInt(numMatch[2], 10);
          
          if (sign === '-') {
            total -= value;
            detailsList.push(`-${value}`);
          } else {
            const prefix = detailsList.length > 0 ? '+' : '';
            total += value;
            detailsList.push(`${prefix}${value}`);
          }
        }
      }
    }

    // 4. Dádiva do Ataque Irresistível: dano crítico causa dano destrutivo a mais (+2d10)
    if (isCritical && hasIrresistible) {
      const extraD10 = Math.floor(Math.random() * 10) + 1 + Math.floor(Math.random() * 10) + 1;
      total += extraD10;
      detailsList.push(`+(${extraD10}) [Dádiva Destrutiva]`);
    }
    
    const finalTotal = Math.max(1, total);
    const rollDetails = `${detailsList.join(' ')} = ${finalTotal}`;
    
    return { total: finalTotal, rollDetails };
  } catch {
    return rollDiceString(diceStr);
  }
}

// Resolução de Ataque D&D 5.5e
export interface AttackResult {
  hit: boolean;
  attackRollHit: boolean;
  isGraze?: boolean;
  isCritical: boolean;
  isFumble: boolean;
  totalAttack: number;
  damage: number;
  logTitle: string;
  logDetail: string;
  isTotalCover?: boolean;
}

// Converte uma string de dados para a sua versão crítica (dobrando a quantidade de todos os dados e mantendo os bônus fixos)
export function getCriticalDiceString(diceStr: string): string {
  try {
    const sanitized = diceStr.replace(/\s+/g, '');
    
    // Dobrar o número de dados de cada expressão <quantidade>d<lados> encontrada na string
    return sanitized.replace(/(\d+)d(\d+)/gi, (match, countStr, sidesStr) => {
      const count = parseInt(countStr, 10);
      const sides = parseInt(sidesStr, 10);
      return `${count * 2}d${sides}`;
    });
  } catch {
    return diceStr;
  }
}

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

function getEntitySizeInSquares(sizeStr?: string): number {
  if (!sizeStr) return 1;
  const s = sizeStr.toLowerCase();
  if (s.includes('large') || s.includes('grande')) return 2;
  if (s.includes('huge') || s.includes('enorme')) return 3;
  if (s.includes('gargantuan') || s.includes('gargantueco') || s.includes('colossal') || s.includes('imenso')) return 4;
  return 1;
}

export function executeAttack(
  attacker: CombatEntity,
  defender: CombatEntity,
  advantage: 'normal' | 'advantage' | 'disadvantage' = 'normal',
  weaponOverride?: { 
    name?: string; 
    attackBonus?: number; 
    damageDice?: string; 
    damageType?: string; 
    mastery?: string; 
    properties?: string; 
    range?: string;
    gwmToggled?: boolean;
    sharpshooterToggled?: boolean;
  },
  lightingContext?: {
    isDarkEnvironment: boolean;
    torches: { x: number; y: number }[];
    heroLightRadius?: number;
    heroX?: number;
    heroY?: number;
  },
  allEntities?: CombatEntity[],
  grid?: any[][]
): AttackResult {
  const advantageSources: string[] = [];
  const disadvantageSources: string[] = [];

  const hero = attacker.type === 'hero' ? attacker : (defender.type === 'hero' ? defender : null);

  const getIsHidden = (ent: CombatEntity): boolean => {
    if (ent.type !== 'monster') return false;
    if (ent.isDead) return false;
    if (!lightingContext || !lightingContext.isDarkEnvironment) return false;

    // Check if illuminated by standard torches
    const list = lightingContext.torches;
    const isPosIlluminated = list && list.length > 0 && list.some(t => Math.max(Math.abs(ent.x - t.x), Math.abs(ent.y - t.y)) <= 4);
    if (isPosIlluminated) return false;

    const heroX = lightingContext.heroX !== undefined ? lightingContext.heroX : (hero ? hero.x : ent.x);
    const heroY = lightingContext.heroY !== undefined ? lightingContext.heroY : (hero ? hero.y : ent.y);
    const distToHero = Math.max(Math.abs(ent.x - heroX), Math.abs(ent.y - heroY));

    // Check hero light radius
    if (lightingContext.heroLightRadius !== undefined && lightingContext.heroLightRadius > 0) {
      if (distToHero <= lightingContext.heroLightRadius) return false;
    }

    // Check darkvision
    if (hero && hero.hasDarkvision) {
      const dvCells = (hero.darkvisionRange || 18) / 1.5;
      if (distToHero <= dvCells) return false;
    }

    return true;
  };

  const isAttackerHidden = getIsHidden(attacker);
  const isDefenderHidden = getIsHidden(defender);

  const attackerDisplayName = isAttackerHidden ? 'Inimigo Oculto' : attacker.name;
  const defenderDisplayName = isDefenderHidden ? 'Inimigo Oculto' : defender.name;

  // Regra da Condição Enfeitiçado (Charmed): Uma criatura enfeitiçada não pode atacar o seu encantar (charmer) nem alvejá-lo com habilidades danosas.
  if (attacker.charmedById === defender.id || (attacker.conditions.some(c => c === 'Enfeitiçado' || c === 'Charmed') && (!attacker.charmedById || attacker.charmedById === defender.id))) {
    return {
      hit: false,
      attackRollHit: false,
      isCritical: false,
      isFumble: false,
      totalAttack: 0,
      damage: 0,
      logTitle: '💖 Enfeitiçado (Charmed)',
      logDetail: `${attacker.name} está enfeitiçado por ${defender.name} e não pode atacá-lo!`
    };
  }

  // Regra da Condição Incapacitado (Incapacitated): Uma criatura incapacitada não pode realizar ações ou ataques.
  if (attacker.conditions.some(c => c === 'Incapacitado' || c === 'Incapacitated')) {
    return {
      hit: false,
      attackRollHit: false,
      isCritical: false,
      isFumble: false,
      totalAttack: 0,
      damage: 0,
      logTitle: '🌀 Incapacitado (Incapacitated)',
      logDetail: `${attacker.name} está Incapacitado e não pode realizar ações ou ataques!`
    };
  }

  // Calcular distância de Chebyshev no grid (considerando o tamanho de atacante e defensor)
  const attackerSize = getEntitySizeInSquares(attacker.size);
  const defenderSize = getEntitySizeInSquares(defender.size);

  let dx = 0;
  if (attacker.x + attackerSize <= defender.x) {
    dx = defender.x - (attacker.x + attackerSize - 1);
  } else if (defender.x + defenderSize <= attacker.x) {
    dx = attacker.x - (defender.x + defenderSize - 1);
  } else {
    dx = 0;
  }

  let dy = 0;
  if (attacker.y + attackerSize <= defender.y) {
    dy = defender.y - (attacker.y + attackerSize - 1);
  } else if (defender.y + defenderSize <= attacker.y) {
    dy = attacker.y - (defender.y + defenderSize - 1);
  } else {
    dy = 0;
  }

  const distance = Math.max(dx, dy);

  // Parse weapon range info for normal and long range
  const weaponRangeStr = weaponOverride?.range || (attacker.type === 'hero' ? (attacker as any).range : `${attacker.range * 1.5}m`);
  const weaponProps = weaponOverride?.properties || '';
  const weaponName = weaponOverride?.name || '';

  let normalCells = 1;
  let longCells = 1;
  const rStr = String(weaponRangeStr || '').toLowerCase();
  const pStr = String(weaponProps || '').toLowerCase();
  const nStr = String(weaponName || '').toLowerCase();

  const isPureRangedName = nStr.includes('arco') || nStr.includes('besta') || nStr.includes('funda') || 
    nStr.includes('bow') || nStr.includes('crossbow') || nStr.includes('sling') || nStr.includes('dardo') || nStr.includes('dart');

  const hasThrown = rStr.includes('arremesso') || pStr.includes('arremesso') || pStr.includes('thrown') || isPureRangedName;

  const hasMeleeBase = rStr.startsWith('1,5m') || rStr.startsWith('1.5m') || rStr.startsWith('3m') || rStr.startsWith('3.0m') || rStr.includes('toque') || rStr.includes('touch');

  const isPureRanged = isPureRangedName || (
    (rStr.includes('/') || rStr.includes('munição') || pStr.includes('munição') || pStr.includes('ammunition')) && 
    !hasMeleeBase && 
    !hasThrown
  );

  const slashMatch = rStr.match(/([0-9]+[\.,]?[0-9]*)\s*m?\s*\/\s*([0-9]+[\.,]?[0-9]*)\s*m?/i);
  if (slashMatch) {
    const normalMeters = parseFloat(slashMatch[1].replace(',', '.'));
    const longMeters = parseFloat(slashMatch[2].replace(',', '.'));
    normalCells = Math.max(1, Math.round(normalMeters / 1.5));
    longCells = Math.max(normalCells, Math.round(longMeters / 1.5));
    if (distance <= 1 && rStr.startsWith('1,5m')) {
      normalCells = 1;
      longCells = 1;
    }
  } else {
    const singleMatch = rStr.match(/([0-9]+[\.,]?[0-9]*)\s*m/i);
    if (singleMatch) {
      const meters = parseFloat(singleMatch[1].replace(',', '.'));
      normalCells = Math.max(1, Math.round(meters / 1.5));
    } else {
      const parsed = parseFloat(rStr);
      if (!isNaN(parsed)) {
        normalCells = Math.max(1, Math.round(parsed / 1.5));
      }
    }
    
    longCells = normalCells;

    if (hasThrown || pStr.includes('arremesso')) {
      if (distance > normalCells) {
        normalCells = 4;
        longCells = 12;
      }
    }
  }

  // Se for arma corpo a corpo com a propriedade Extensão (Reach / Alcance)
  const isReachMelee = pStr.includes('extensão') || pStr.includes('extensao') || pStr.includes('reach') || pStr.includes('alcance');
  if (isReachMelee && !isPureRanged) {
    normalCells = Math.max(normalCells, 2);
    longCells = Math.max(longCells, 2);
  }

  if (distance > longCells) {
    return {
      hit: false,
      attackRollHit: false,
      isCritical: false,
      isFumble: false,
      totalAttack: 0,
      damage: 0,
      logTitle: '⚠️ Fora de Alcance',
      logDetail: `O alvo está a ${distance * 1.5}m, mas o alcance máximo da arma é ${longCells * 1.5}m.`
    };
  }

  // Regra Oficial de Cobertura (D&D 5e / 5.5e)
  const coverResult = calculateCover(attacker, defender, grid, allEntities);
  if (coverResult.degree === 'total') {
    return {
      hit: false,
      attackRollHit: false,
      isCritical: false,
      isFumble: false,
      totalAttack: 0,
      damage: 0,
      logTitle: '🛡️ Cobertura Total (Total Cover)',
      logDetail: `${defenderDisplayName} está em Cobertura Total em relação a ${attackerDisplayName} e não pode ser alvejado diretamente!`,
      isTotalCover: true
    };
  }

  const effectiveArmorClass = defender.armor_class + coverResult.acBonus;
  const coverLogText = coverResult.acBonus > 0 ? ` [🛡️ Cobertura Aplicada: +${coverResult.acBonus} CA - ${coverResult.description}]` : '';

  // Identifica se o ataque atual é à distância (Ranged Attack)
  // Se for uma arma de arremesso (melee + ranged), ela é considerada corpo a corpo se usada contra um alvo adjacente.
  const isRangedAttack = !isReachMelee && (isPureRanged || 
    (hasThrown && distance > (isReachMelee ? 2 : 1)) ||
    (pStr.includes('munição') || pStr.includes('ammunition') || pStr.includes('distância') || pStr.includes('ranged') || pStr.includes('distancia')) ||
    (attacker.type !== 'hero' && attacker.range > 1 && !attacker.name.toLowerCase().includes('glaive') && !attacker.name.toLowerCase().includes('alabarda')) ||
    (weaponOverride?.range && !weaponOverride.range.toLowerCase().includes('toque') && !weaponOverride.range.toLowerCase().includes('touch') && !weaponOverride.range.toLowerCase().includes('1.5') && !weaponOverride.range.toLowerCase().includes('1,5') && !hasThrown));

  // Regra de voo: Alvos voando a 3m de altura (condição 'Voando') não podem ser atingidos por ataques corpo a corpo.
  const isTargetFlying = defender.conditions.includes('Voando');
  if (!isRangedAttack && isTargetFlying) {
    return {
      hit: false,
      attackRollHit: false,
      isCritical: false,
      isFumble: false,
      totalAttack: 0,
      damage: 0,
      logTitle: '🕊️ Alvo Voando',
      logDetail: `O alvo está voando a 3m de altura e não pode ser atingido por ataques corpo a corpo!`
    };
  }

  // Aplicar Desvantagem se for ataque além do alcance normal
  if (distance > normalCells && distance <= longCells) {
    disadvantageSources.push(`Alcance Longo (${distance * 1.5}m)`);
  }

  // Regra de Ranged Attacks in Close Combat: Desvantagem se houver inimigo ativo não incapacitado a até 1.5m (1 célula)
  if (isRangedAttack) {
    let potentialEnemies: CombatEntity[] = [];
    if (allEntities && allEntities.length > 0) {
      potentialEnemies = allEntities;
    } else {
      potentialEnemies = [defender];
    }

    const hasAdjacentThreat = potentialEnemies.some(enemy => {
      // Deve ser um inimigo do tipo oposto
      const isEnemyType = (attacker.type === 'hero' && enemy.type === 'monster') ||
                          (attacker.type === 'monster' && enemy.type === 'hero');
      if (!isEnemyType || enemy.isDead) return false;

      // Deve estar adjacente (distância Chebyshev <= 1)
      const s1 = getEntitySizeInSquares(attacker.size);
      const s2 = getEntitySizeInSquares(enemy.size);
      let minDist = Infinity;
      for (let x1 = attacker.x; x1 < attacker.x + s1; x1++) {
        for (let y1 = attacker.y; y1 < attacker.y + s1; y1++) {
          for (let x2 = enemy.x; x2 < enemy.x + s2; x2++) {
            for (let y2 = enemy.y; y2 < enemy.y + s2; y2++) {
              const d = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
              if (d < minDist) minDist = d;
            }
          }
        }
      }

      if (minDist > 1) return false;

      // O inimigo não deve estar Incapacitado
      const enemyIncapacitated = enemy.conditions.some(c => 
        c === 'Incapacitado' || c === 'Incapacitated' ||
        c === 'Paralisado' || c === 'Paralyzed' ||
        c === 'Inconsciente' || c === 'Unconscious' ||
        c === 'Atordoado' || c === 'Stunned' ||
        c === 'Petrificado' || c === 'Petrified'
      );
      if (enemyIncapacitated) return false;

      // O inimigo deve ser capaz de ver o atacante
      const enemyCanSee = !enemy.conditions.some(c => c === 'Cego' || c === 'Blinded') &&
                          !attacker.conditions.some(c => c === 'Invisível' || c === 'Invisible');
      
      return enemyCanSee;
    });

    if (hasAdjacentThreat) {
      disadvantageSources.push('Combate Próximo (Inimigo adjacente ativo que pode ver o atacante)');
    }
  }

  // Vantagem ou Desvantagem fornecidas manualmente ou por decisões da interface (ex: Ataque Imprudente)
  if (advantage === 'advantage') {
    advantageSources.push('Habilidade Ativa/Seleção');
  } else if (advantage === 'disadvantage') {
    disadvantageSources.push('Imposição de Efeito/Seleção');
  }

  // Regras de Escuridão e Visão no Escuro (Darkvision)
  if (lightingContext?.isDarkEnvironment) {
    const isPosIlluminated = (px: number, py: number, list: { x: number; y: number }[]): boolean => {
      // Verificar tochas do mapa (raio 4)
      const nearStaticTorch = list && list.length > 0 && list.some(t => Math.max(Math.abs(px - t.x), Math.abs(py - t.y)) <= 4);
      if (nearStaticTorch) return true;

      // Verificar foco de iluminação do herói (tocha, lanternas e outros)
      if (lightingContext.heroLightRadius !== undefined && lightingContext.heroLightRadius > 0 &&
          lightingContext.heroX !== undefined && lightingContext.heroY !== undefined) {
        const distToHero = Math.max(Math.abs(px - lightingContext.heroX), Math.abs(py - lightingContext.heroY));
        if (distToHero <= lightingContext.heroLightRadius) {
          return true;
        }
      }

      // Verificar se a posição possui tocha/luz própria (está na lista de tochas ou próxima)
      if (list && list.some(t => Math.max(Math.abs(px - t.x), Math.abs(py - t.y)) <= 4)) {
        return true;
      }

      return false;
    };

    const isAttackerInLight = isPosIlluminated(attacker.x, attacker.y, lightingContext.torches);
    const isDefenderInLight = isPosIlluminated(defender.x, defender.y, lightingContext.torches);

    // Verificar se o atacante possui Blind Sense / Blindsight ou Luta às Cegas
    const hasBlindFighting = attacker.feats?.some(f => {
      const n = (f || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      return n.includes('luta as cegas') || n.includes('blind fighting');
    }) || false;

    // Verificar se o atacante possui Blindsight / Sentido Cegante nas traits/senses ou se é herói com blind sense
    let attackerBlindsightRangeCells = 0;
    if (attacker.senses) {
      const sensesLower = attacker.senses.toLowerCase();
      if (sensesLower.includes('blindsight') || sensesLower.includes('sentido cegante') || sensesLower.includes('blind sense')) {
        const match = sensesLower.match(/(\d+)\s*(ft|pés|m)/i);
        if (match) {
          const val = parseInt(match[1], 10);
          attackerBlindsightRangeCells = match[2].includes('m') ? val / 1.5 : val / 5;
        } else {
          attackerBlindsightRangeCells = 6; // padrão 30ft / 9m
        }
      }
    }
    if (attacker.traits) {
      for (const t of attacker.traits) {
        const text = `${t.name} ${t.text || ''}`.toLowerCase();
        if (text.includes('blindsight') || text.includes('sentido cegante') || text.includes('blind sense')) {
          const match = text.match(/(\d+)\s*(ft|pés|m)/i);
          if (match) {
            const val = parseInt(match[1], 10);
            attackerBlindsightRangeCells = match[2].includes('m') ? val / 1.5 : val / 5;
          } else {
            attackerBlindsightRangeCells = 6;
          }
        }
      }
    }
    if (hasBlindFighting) {
      attackerBlindsightRangeCells = Math.max(attackerBlindsightRangeCells, 2); // 3 metros / 2 células
    }

    const isWithinBlindsight = distance <= attackerBlindsightRangeCells;

    // Se o atacante for um monstro, ele só ataca o que consegue ver (iluminação, visão no escuro ou blindsense)
    if (attacker.type === 'monster') {
      let canMonsterSeeDefender = isDefenderInLight || isWithinBlindsight;
      if (!canMonsterSeeDefender && attacker.hasDarkvision) {
        const dvCells = (attacker.darkvisionRange || 18) / 1.5;
        if (distance <= dvCells) {
          canMonsterSeeDefender = true;
        }
      }

      if (!canMonsterSeeDefender) {
        return {
          hit: false,
          attackRollHit: false,
          isCritical: false,
          isFumble: false,
          totalAttack: 0,
          damage: 0,
          logTitle: '🌑 Ataque Falhou na Escuridão',
          logDetail: `${attacker.name} não consegue ver ${defender.name} na escuridão (fora da iluminação, visão no escuro e sentido cegante)!`
        };
      }
    }

    const isTargetWithinBlindFightingRange = isWithinBlindsight;

    if (!isAttackerInLight && !attacker.hasDarkvision) {
      if (!(hasBlindFighting && isTargetWithinBlindFightingRange)) {
        disadvantageSources.push('Atacante na Escuridão (Sem Visão no Escuro)');
      }
    }
    if (!isDefenderInLight && !attacker.hasDarkvision) {
      if (!(hasBlindFighting && isTargetWithinBlindFightingRange)) {
        disadvantageSources.push('Alvo na Escuridão (Sem Visão no Escuro)');
      }
    }
  }

  // 1. Condições de Drenado (Sap) e Afligido (Vex) - Consome-se no ataque
  if (attacker.conditions.includes('Drenado') || attacker.conditions.includes('Sapped')) {
    disadvantageSources.push('Drenado (Sap)');
    attacker.conditions = attacker.conditions.filter(c => c !== 'Drenado' && c !== 'Sapped');
  }
  if (defender.conditions.includes('Afligido') || defender.conditions.includes('Vexed') || defender.conditions.includes('Vex')) {
    advantageSources.push('Afligido (Vex)');
    defender.conditions = defender.conditions.filter(c => c !== 'Afligido' && c !== 'Vexed' && c !== 'Vex');
  }

  // 2. Condições Ativas no ATACANTE que afetam o rolar de dados
  const attExhaustion = attacker.exhaustionLevel || 0;
  if (attacker.conditions.some(c => c === 'Amedrontado' || c === 'Amedrontado_New' || c === 'Frightened')) {
    disadvantageSources.push('Atacante Amedrontado');
  }
  if (attacker.conditions.some(c => c === 'Envenenado' || c === 'Poisoned')) {
    disadvantageSources.push('Atacante Envenenado');
  }
  if (attacker.conditions.some(c => c === 'Cego' || c === 'Blinded')) {
    disadvantageSources.push('Atacante Cego');
  }
  if (attacker.conditions.some(c => c === 'Contido' || c === 'Restringido' || c === 'Restrained')) {
    disadvantageSources.push('Atacante Restringido');
  }
  if (attacker.conditions.some(c => c === 'Caído' || c === 'Prone')) {
    disadvantageSources.push('Atacante Caído');
  }
  if (attacker.conditions.some(c => c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled')) {
    if (attacker.grappledById && attacker.grappledById !== defender.id) {
      disadvantageSources.push('Agarrado (Alvo não é o Agarrador)');
    } else if (!attacker.grappledById) {
      disadvantageSources.push('Agarrado (Desvantagem contra alvos sob agarrão geral)');
    }
  }
  if (attacker.conditions.some(c => c === 'Invisível' || c === 'Invisible')) {
    advantageSources.push('Atacante Invisível');
  }

  // 2.1. Regra de Arma Pesada (Heavy / Pesada) - D&D 5.5e (2024):
  // Desvantagem se for arma corpo a corpo e Força < 13, ou se for arma à distância e Destreza < 13.
  const isHeavyWeapon = pStr.includes('heavy') || pStr.includes('pesada') || nStr.includes('machado grande') || nStr.includes('espada grande') || nStr.includes('arco longo') || nStr.includes('besta pesada') || nStr.includes('malho') || nStr.includes('alabarda') || nStr.includes('glaive');
  if (isHeavyWeapon) {
    const isMeleeHeavy = !isPureRanged;
    const strScore = attacker.stats?.str !== undefined ? attacker.stats.str : 10;
    const dexScore = attacker.stats?.dex !== undefined ? attacker.stats.dex : 10;
    if (attacker.type === 'hero') {
      if (isMeleeHeavy && strScore < 13) {
        disadvantageSources.push(`Arma Pesada (Força ${strScore} < 13)`);
      } else if (!isMeleeHeavy && dexScore < 13) {
        disadvantageSources.push(`Arma Pesada À Distância (Destreza ${dexScore} < 13)`);
      }
    }
  }

  // 3. Condições Ativas no DEFENSOR que afetam o rolar de dados do atacante
  if (defender.conditions.some(c => c === 'Caído' || c === 'Prone')) {
    if (distance <= 1) {
      advantageSources.push('Alvo Caído (Corpo a Corpo)');
    } else {
      disadvantageSources.push('Alvo Caído (À Distância)');
    }
  }
  if (defender.conditions.some(c => c === 'Cego' || c === 'Blinded')) {
    advantageSources.push('Alvo Cego');
  }
  if (defender.conditions.some(c => c === 'Paralisado' || c === 'Paralyzed')) {
    advantageSources.push('Alvo Paralisado');
  }
  if (defender.conditions.some(c => c === 'Inconsciente' || c === 'Unconscious')) {
    advantageSources.push('Alvo Inconsciente');
  }
  if (defender.conditions.some(c => c === 'Contido' || c === 'Restringido' || c === 'Restrained')) {
    advantageSources.push('Alvo Restringido');
  }
  if (defender.conditions.some(c => c === 'Atordoado' || c === 'Stunned')) {
    advantageSources.push('Alvo Atordoado');
  }
  if (defender.conditions.some(c => c === 'Petrificado' || c === 'Petrified')) {
    advantageSources.push('Alvo Petrificado');
  }
  if (defender.conditions.some(c => c === 'Invisível' || c === 'Invisible')) {
    disadvantageSources.push('Alvo Invisível');
  }
  if (defender.conditions.some(c => c === 'Esquivando' || c === 'Dodge')) {
    disadvantageSources.push('Alvo Esquivando (Dodge)');
  }

  // Resolver Vantagem e Desvantagem (regras de D&D 5.5e: se houver ambos, eles se cancelam e vira normal)
  let finalAdvantage: 'normal' | 'advantage' | 'disadvantage' = 'normal';
  let advReason = '';

  if (advantageSources.length > 0 && disadvantageSources.length > 0) {
    finalAdvantage = 'normal';
    advReason = ` [Normal - Fontes se Anulam: Vantagem (${advantageSources.join(', ')}) vs Desvantagem (${disadvantageSources.join(', ')})]`;
  } else if (advantageSources.length > 0) {
    finalAdvantage = 'advantage';
    advReason = ` [Vantagem de: ${advantageSources.join(', ')}]`;
  } else if (disadvantageSources.length > 0) {
    finalAdvantage = 'disadvantage';
    advReason = ` [Desvantagem de: ${disadvantageSources.join(', ')}]`;
  }

  let d1 = Math.floor(Math.random() * 20) + 1;
  let d2 = Math.floor(Math.random() * 20) + 1;
  let d20 = d1;
  let advText = '';

  if (finalAdvantage === 'advantage') {
    d20 = Math.max(d1, d2);
    advText = `${advReason} (Dados: ${d1}, ${d2})`;
  } else if (finalAdvantage === 'disadvantage') {
    d20 = Math.min(d1, d2);
    advText = `${advReason} (Dados: ${d1}, ${d2})`;
  } else if (advReason) {
    advText = advReason;
  }

  // Margem de acerto crítico: 20 por padrão, 19 ou 20 para Guerreiro (Fighter) de Nível >= 3
  let criticalThreshold = 20;
  if (attacker.type === 'hero' && attacker.charClass) {
    const clsLower = attacker.charClass.toLowerCase().trim();
    const lvl = attacker.level || 1;
    if ((clsLower.includes('guerreiro') || clsLower.includes('fighter')) && lvl >= 3) {
      criticalThreshold = 19;
    }
  }

  let isCritical = d20 >= criticalThreshold;
  const isFumble = d20 === 1;

  // Em D&D 5.5e, qualquer ataque que atinge uma criatura Paralisada ou Inconsciente a até 1.5m (1 célula) é um acerto Crítico automático!
  const hasAutoCritCondition = defender.conditions.some(c => 
    c === 'Paralisado' || c === 'Paralyzed' || c === 'Inconsciente' || c === 'Unconscious'
  );
  const autoCritMelee = hasAutoCritCondition && distance <= 1;

  let baseAttackBonus = weaponOverride?.attackBonus !== undefined ? weaponOverride.attackBonus : attacker.attackBonus;
  
  // Apenas aplica bônus dinâmicos se o attackBonus não foi fornecido pré-calculado
  if (weaponOverride?.attackBonus === undefined) {
    // Arquearia Feat / Fighting Style
    const isRangedWeapon = weaponOverride?.properties?.toLowerCase().includes('munição') ||
                           (weaponOverride?.name && (
                             weaponOverride.name.toLowerCase().includes('arco') ||
                             weaponOverride.name.toLowerCase().includes('besta') ||
                             weaponOverride.name.toLowerCase().includes('funda') ||
                             weaponOverride.name.toLowerCase().includes('dardo') ||
                             weaponOverride.name.toLowerCase().includes('bow') ||
                             weaponOverride.name.toLowerCase().includes('crossbow') ||
                             weaponOverride.name.toLowerCase().includes('sling') ||
                             weaponOverride.name.toLowerCase().includes('dart')
                           ));
    const isRanged = isRangedWeapon || (weaponOverride === undefined && (distance > 1 || (weaponOverride?.range && parseFloat(weaponOverride.range) > 1.5)));
    const hasArchery = attacker.feats?.includes('Arquearia') || attacker.feats?.includes('Archery') || (attacker as any).fightingStyle === 'Arquearia';
    if (isRanged && hasArchery && !weaponOverride?.properties?.toLowerCase().includes('arquearia')) {
      baseAttackBonus += 2;
    }

    // Duelismo Feat / Fighting Style (+2 de bônus no acerto ao empunhar 1 arma de uma mão)
    const isMeleeCombat = distance <= 1;
    const isTwoHandedWeapon = weaponOverride?.properties?.toLowerCase().includes('duas mãos') || 
                              weaponOverride?.properties?.toLowerCase().includes('two-handed') || 
                              (weaponOverride?.name && isTwoHandedWeaponLocal(weaponOverride.name));
    const hasDuelistFeat = attacker.feats?.some((f: string) => typeof f === 'string' && (f.toLowerCase().includes('duelismo') || f.toLowerCase().includes('duelist'))) || (attacker as any).fightingStyle === 'Duelismo' || (attacker as any).fighting_style === 'Duelismo';
    const isMeleeOneHandedCombat = isMeleeCombat && !isTwoHandedWeapon && !isRanged && weaponOverride?.name !== 'Ataque Desarmado';
    const alreadyHasDuelistInProps = weaponOverride?.properties?.toLowerCase().includes('duelismo');

    if (isMeleeOneHandedCombat && hasDuelistFeat && !alreadyHasDuelistInProps) {
      baseAttackBonus += 2;
    }
  }

  // Penalidade de -5 de Acerto para GWM ou Sharpshooter (toggled)
  if (weaponOverride?.gwmToggled) {
    baseAttackBonus -= 5;
  }
  if (weaponOverride?.sharpshooterToggled) {
    baseAttackBonus -= 5;
  }

  const attackBonus = baseAttackBonus;
  const damageDice = weaponOverride?.damageDice || attacker.damageDice;
  const weaponLabel = weaponOverride?.name ? ` com ${weaponOverride.name}` : '';
  const damageTypeLabel = weaponOverride?.damageType ? ` (${weaponOverride.damageType})` : '';

  let totalAttack = d20 + attackBonus - (attExhaustion * 2);
  let hit = isCritical || (!isFumble && totalAttack >= effectiveArmorClass);
  let isGraze = false;

  // Sortudo (Lucky) re-roll
  let hasLuckyFeat = attacker.feats?.includes('Sortudo') || attacker.feats?.includes('Lucky');
  if (!hit && hasLuckyFeat) {
    const luckyD20 = Math.floor(Math.random() * 20) + 1;
    if (luckyD20 > d20) {
      d20 = luckyD20;
      const newTotalAttack = d20 + attackBonus - (attExhaustion * 2);
      const newHit = d20 >= criticalThreshold || (d20 !== 1 && newTotalAttack >= effectiveArmorClass);
      if (newHit) {
        hit = true;
        totalAttack = newTotalAttack;
        if (d20 >= criticalThreshold) {
          isCritical = true;
        }
        advText += ` 🍀 [TALENTO SORTUDO] Re-rolou d20 de falha: Novo D20 ${d20}! (Total: ${totalAttack})`;
      } else {
        advText += ` 🍀 [TALENTO SORTUDO] Re-rolou falha para ${luckyD20}, mas ainda errou.`;
      }
    }
  }

  // Dádiva da Proeza em Combate (Epic Boon of Combat Prowess)
  const hasCombatProwess = attacker.feats?.includes('Dádiva da Proeza em Combate') || attacker.feats?.includes('Epic Boon of Combat Prowess');
  if (!hit && hasCombatProwess) {
    hit = true;
    totalAttack = effectiveArmorClass; // Força o acerto na CA exata do inimigo
    advText += ` 🛡️ [DÁDIVA DA PROEZA EM COMBATE] Transformou um erro em acerto automático!`;
  }

  const attackRollHit = hit;

  if (hit && autoCritMelee) {
    isCritical = true;
  }

  let damage = 0;
  let damageDetails = '';
  let masteryEffectLog = '';

  const activeMastery = weaponOverride?.mastery || '';
  const mLower = activeMastery.toLowerCase();

  if (hit) {
    let rolled: { total: number; rollDetails: string };
    const dType = weaponOverride?.damageType || 'Cortante';
    const wName = weaponOverride?.name || 'Ataque Desarmado';
    const isSavageAttacker = (attacker.feats?.includes('Atacante Selvagem') || attacker.feats?.includes('Savage Attacker')) && !attacker.usedSavageAttackerThisTurn;

    const isMeleeAttack = distance <= 1 && !(
      (weaponOverride?.properties || '').toLowerCase().includes('munição') ||
      (weaponOverride?.properties || '').toLowerCase().includes('distância') ||
      wName.toLowerCase().includes('arco') || wName.toLowerCase().includes('besta') || wName.toLowerCase().includes('funda')
    );

    if (isSavageAttacker) {
      attacker.usedSavageAttackerThisTurn = true;
      const diceToRoll = isCritical ? getCriticalDiceString(damageDice) : damageDice;
      const rolled1 = rollDamageDiceWithFeats(diceToRoll, attacker, isCritical, dType, wName, weaponOverride?.properties, isMeleeAttack);
      const rolled2 = rollDamageDiceWithFeats(diceToRoll, attacker, isCritical, dType, wName, weaponOverride?.properties, isMeleeAttack);
      if (rolled2.total > rolled1.total) {
        rolled = rolled2;
        damage = rolled2.total;
        damageDetails = `${rolled2.rollDetails} (Talento Atacante Selvagem - maior entre ${rolled1.total} e ${rolled2.total})`;
      } else {
        rolled = rolled1;
        damage = rolled1.total;
        damageDetails = `${rolled1.rollDetails} (Talento Atacante Selvagem - maior entre ${rolled1.total} e ${rolled2.total})`;
      }
    } else {
      if (isCritical) {
        // Dano crítico: dobra a quantidade de dados mantendo o modificador estático
        const critDiceStr = getCriticalDiceString(damageDice);
        rolled = rollDamageDiceWithFeats(critDiceStr, attacker, isCritical, dType, wName, weaponOverride?.properties, isMeleeAttack);
        damage = rolled.total;
        damageDetails = rolled.rollDetails;
      } else {
        rolled = rollDamageDiceWithFeats(damageDice, attacker, isCritical, dType, wName, weaponOverride?.properties, isMeleeAttack);
        damage = rolled.total;
        damageDetails = rolled.rollDetails;
      }
    }

    // Dado extra no Acerto Crítico para o Talento Perfurador
    const hasPiercer = attacker.feats?.includes('Perfurador') || attacker.feats?.includes('Piercer');
    const isPiercingType = dType.toLowerCase().includes('perfurante') || dType.toLowerCase().includes('piercing');
    if (isCritical && hasPiercer && isPiercingType) {
      const match = damageDice.match(/(\d+)d(\d+)/i);
      const sides = match ? parseInt(match[2], 10) : 8;
      const extraDieRoll = Math.floor(Math.random() * sides) + 1;
      damage += extraDieRoll;
      damageDetails += ` + ${extraDieRoll} (Crítico Perfurador: +1d${sides})`;
    }

    // Mestre em Armas Grandes
    const isMelee = distance <= 1;
    const isTwoHanded = weaponOverride?.properties?.toLowerCase().includes('duas mãos') || 
                       weaponOverride?.properties?.toLowerCase().includes('two-handed') || 
                       (weaponOverride?.name && isTwoHandedWeaponLocal(weaponOverride.name));

    const hasGWM = attacker.feats?.includes('Mestre em Armas Grandes') || attacker.feats?.includes('Great Weapon Master');
    if (isMelee && isTwoHanded && hasGWM) {
      const bp = attacker.level ? Math.floor((attacker.level - 1) / 4) + 2 : 2;
      damage += bp;
      damageDetails += ` + ${bp} (Mestre em Armas Grandes)`;
    }

    // Bônus de +10 de Dano para GWM ou Sharpshooter (toggled)
    if (weaponOverride?.gwmToggled) {
      damage += 10;
      damageDetails += ` + 10 (Mestre em Armas Grandes - Ataque Poderoso)`;
    }
    if (weaponOverride?.sharpshooterToggled) {
      damage += 10;
      damageDetails += ` + 10 (Mestre-Atirador - Disparo Preciso)`;
    }

    // Resistência a dano por Petrificado (Resist to all damage)
    if (defender.conditions.some(c => c === 'Petrificado' || c === 'Petrified') && damage > 0) {
      damage = Math.floor(damage / 2);
      damageDetails += ` (Resistência a dano por Petrificado)`;
    }

    // Empurrão do Valentão de Taverna (1q para trás em ataque desarmado, 1x por turno ao causar dano)
    const hasTavernBrawler = attacker.feats?.includes('Valentão de Taverna') || attacker.feats?.includes('Tavern Brawler');
    const isUnarmed = wName.toLowerCase().includes('desarmado') || wName.toLowerCase().includes('unarmed') || damageDice.includes('unarmed');
    if (hasTavernBrawler && isUnarmed && damage > 0 && !attacker.usedTavernBrawlerPushThisTurn) {
      attacker.usedTavernBrawlerPushThisTurn = true;
      const dx = defender.x - attacker.x;
      const dy = defender.y - attacker.y;
      const stepX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
      const stepY = dy > 0 ? 1 : dy < 0 ? -1 : 0;
      const newX = defender.x + stepX;
      const newY = defender.y + stepY;
      if (newX >= 0 && newX < 150 && newY >= 0 && newY < 150) {
        defender.x = newX;
        defender.y = newY;
        masteryEffectLog += ` 👊 [VALENTÃO DE TAVERNA] Empurrou ${defenderDisplayName} 1 quadrado para trás!`;
      }
    }

    // Resolvendo efeitos de maestria ao acertar (Hit)
    if (mLower) {
      const strMod = attacker.stats ? Math.floor((attacker.stats.str - 10) / 2) : 0;
      const dexMod = attacker.stats ? Math.floor((attacker.stats.dex - 10) / 2) : 0;
      const abilityMod = Math.max(1, Math.max(strMod, dexMod));
      const pb = attacker.pb || 2;
      const dc = 8 + pb + abilityMod;

      if (mLower.includes('topple') || mLower.includes('derrubar')) {
        // Rolar salvaguarda de CON para o defensor
        const conMod = defender.stats ? Math.floor((defender.stats.con - 10) / 2) : 1;
        const conRoll = Math.floor(Math.random() * 20) + 1;
        const conSave = conRoll + conMod;
        const success = conSave >= dc;

        if (!success) {
          if (!defender.conditions.includes('Caído')) {
            defender.conditions.push('Caído');
          }
          masteryEffectLog = ` 💥 [DERRUBAR] ${defenderDisplayName} falhou na salvaguarda de CON (Rolou ${conSave} vs CD ${dc}) e ficou CAÍDO (Prone)!`;
        } else {
          masteryEffectLog = ` 🛡️ [DERRUBAR] ${defenderDisplayName} resistiu ao efeito (CON ${conSave} vs CD ${dc}).`;
        }
      } else if (mLower.includes('sap') || mLower.includes('drenar') || mLower.includes('enfraquecer')) {
        if (!defender.conditions.includes('Drenado')) {
          defender.conditions.push('Drenado');
        }
        masteryEffectLog = ` 🛡️ [DRENAR] Impôs a condição Drenado a ${defenderDisplayName}! A próxima jogada de ataque dele terá Desvantagem.`;
      } else if (mLower.includes('vex') || mLower.includes('afligir') || mLower.includes('vexar')) {
        if (!defender.conditions.includes('Afligido')) {
          defender.conditions.push('Afligido');
        }
        masteryEffectLog = ` 🎯 [AFLIGIR] Marcou ${defenderDisplayName}! Concede VANTAGEM na sua próxima jogada de ataque contra este alvo.`;
      } else if (mLower.includes('slow') || mLower.includes('lentidão') || mLower.includes('lentidao')) {
        if (!defender.conditions.includes('Lento')) {
          defender.conditions.push('Lento');
        }
        masteryEffectLog = ` 🐢 [LENTIDÃO] Reduziu o deslocamento de ${defenderDisplayName} em 3 metros (2 células) até seu próximo turno!`;
      } else if (mLower.includes('push') || mLower.includes('empurrar')) {
        if (!defender.conditions.includes('Empurrado')) {
          defender.conditions.push('Empurrado');
        }
        
        const dx = defender.x - attacker.x;
        const dy = defender.y - attacker.y;
        const stepX = dx > 0 ? 1 : dx < 0 ? -1 : 0;
        const stepY = dy > 0 ? 1 : dy < 0 ? -1 : 0;
        
        let actualPushDistance = 0;
        let currentX = defender.x;
        let currentY = defender.y;
        
        for (let step = 0; step < 2; step++) {
          const nextX = currentX + stepX;
          const nextY = currentY + stepY;
          
          // Verificar limites do grid
          if (nextX < 0 || nextY < 0) {
            break;
          }
          if (grid && (nextY >= grid.length || nextX >= grid[0].length)) {
            break;
          }
          if (grid && grid[nextY] && grid[nextY][nextX]) {
            const cell = grid[nextY][nextX];
            if (cell.terrain === 'wall' || cell.movementCost === Infinity) {
              break;
            }
          }
          
          // Verificar colisões com outras criaturas vivas
          if (allEntities) {
            const collision = allEntities.some(ent => 
              !ent.isDead && 
              ent.id !== defender.id && 
              ent.id !== attacker.id && 
              ent.x === nextX && 
              ent.y === nextY
            );
            if (collision) {
              break;
            }
          }
          
          currentX = nextX;
          currentY = nextY;
          actualPushDistance++;
        }
        
        if (actualPushDistance > 0) {
          defender.x = currentX;
          defender.y = currentY;
          const meters = actualPushDistance * 1.5;
          masteryEffectLog = ` 💥 [EMPURRAR] Empurrou ${defenderDisplayName} ${meters} metros (${actualPushDistance} células) para trás!`;
        } else {
          masteryEffectLog = ` 💥 [EMPURRAR] Tentou empurrar ${defenderDisplayName}, mas ele foi bloqueado por um obstáculo ou criatura!`;
        }
      } else if (mLower.includes('grapple') || mLower.includes('agarrar')) {
        const strMod = defender.stats ? Math.floor((defender.stats.str - 10) / 2) : 1;
        const dexMod = defender.stats ? Math.floor((defender.stats.dex - 10) / 2) : 1;
        const defenseMod = Math.max(strMod, dexMod);
        const defExhaustion = defender.exhaustionLevel || 0;
        const saveRoll = Math.floor(Math.random() * 20) + 1;
        const saveTotal = saveRoll + defenseMod - (defExhaustion * 2);
        const success = saveTotal >= dc;

        if (!success) {
          if (!defender.conditions.includes('Agarrado')) {
            defender.conditions.push('Agarrado');
          }
          defender.grappledById = attacker.id;
          masteryEffectLog = ` ✊ [AGARRAR] ${defenderDisplayName} falhou em resistir (FOR/DEX ${saveTotal} vs CD ${dc}) e ficou AGARRADO por ${attackerDisplayName}!`;
        } else {
          masteryEffectLog = ` 🛡️ [AGARRAR] ${defenderDisplayName} evitou ser agarrado (FOR/DEX ${saveTotal} vs CD ${dc}).`;
        }
      } else if (mLower.includes('cleave') || mLower.includes('trespassar') || mLower.includes('fender')) {
        masteryEffectLog = ` 🪓 [TRESPASSAR] Você pode realizar um ataque corporal extra contra outro alvo a até 1.5m!`;
      } else if (mLower.includes('nick') || mLower.includes('ágil') || mLower.includes('agil') || mLower.includes('golpe rápido')) {
        masteryEffectLog = ` ⚡ [ÁGIL] Você pode desferir o ataque adicional da propriedade Leve como parte da sua ação Atacar!`;
      }
    }
  } else {
    // Resolvendo efeitos de maestria ao errar (Miss)
    if (mLower.includes('graze') || mLower.includes('garantido') || mLower.includes('rozar') || mLower.includes('arranhar')) {
      const strMod = attacker.stats ? Math.floor((attacker.stats.str - 10) / 2) : 0;
      const dexMod = attacker.stats ? Math.floor((attacker.stats.dex - 10) / 2) : 0;
      const abilityMod = Math.max(1, Math.max(strMod, dexMod));
      
      damage = abilityMod;
      damageDetails = `${abilityMod} (mod. de atributo)`;
      hit = true; // Forçar o processamento de dano pelo chamador
      isGraze = true;
      masteryEffectLog = ` 💥 [GARANTIDO] Mesmo errando o golpe, causou ${damage} de Dano de Raspão (Graze) em ${defenderDisplayName}!`;
    }
  }

  let logTitle = '';
  if (isCritical) {
    logTitle = `🎯 CRÍTICO! ${attackerDisplayName}${weaponLabel} acertou ${defenderDisplayName} causando ${damage} de Dano${damageTypeLabel}!`;
  } else if (isFumble) {
    logTitle = `💀 ERRO CRÍTICO! ${attackerDisplayName}${weaponLabel} errou completamente ${defenderDisplayName}.`;
  } else if (isGraze) {
    logTitle = `💥 ${attackerDisplayName}${weaponLabel} ERROU ${defenderDisplayName} (${totalAttack} vs CA ${effectiveArmorClass}${coverLogText}), mas causou ${damage} Dano de Raspão (Graze/Garantido)!`;
  } else if (hit) {
    logTitle = `⚔️ ${attackerDisplayName}${weaponLabel} ACERTOU ${defenderDisplayName}! (${totalAttack} vs CA ${effectiveArmorClass}${coverLogText}) -> ${damage} Dano${damageTypeLabel}`;
  } else {
    logTitle = `🛡️ ${attackerDisplayName}${weaponLabel} errou ${defenderDisplayName} (${totalAttack} vs CA ${effectiveArmorClass}${coverLogText})`;
  }

  const displayDice = isCritical ? `${getCriticalDiceString(damageDice)} [CRÍTICO: Dados Dobrados!]` : damageDice;
  const logDetail = `D20: ${d20}${advText} + Bônus (${attackBonus >= 0 ? '+' : ''}${attackBonus}) = ${totalAttack}. Dano (${displayDice}): ${damageDetails}.${masteryEffectLog}`;

  return {
    hit,
    attackRollHit,
    isGraze,
    isCritical,
    isFumble,
    totalAttack,
    damage,
    logTitle,
    logDetail
  };
}

// Gerador de Loot / Recompensas por Vitória
export function generateVictoryLoot(enemiesDefeated: CombatEntity[]): { totalXp: number; loot: LootItem[] } {
  let totalXp = 0;
  const loot: LootItem[] = [];

  for (const enemy of enemiesDefeated) {
    totalXp += enemy.xpValue || 50;
  }

  // Ouro garantido
  const goldAmount = Math.floor(Math.random() * 30) + 15 * enemiesDefeated.length;
  loot.push({
    id: 'gold-' + Date.now(),
    name: `${goldAmount} Peças de Ouro (PO)`,
    type: 'gold',
    rarity: 'comum',
    value: goldAmount,
    description: 'Moedas reluzentes coletadas dos inimigos derrotados.',
    icon: '💰'
  });

  // Chance de Poção de Cura / Consumível
  if (Math.random() < 0.7) {
    const potionItem = getRandomItemFromDatabase({ category: 'potion' });
    loot.push({
      ...potionItem,
      id: 'potion-' + Date.now()
    });
  }

  // Chance de Equipamento (Arma ou Armadura do Banco de Dados)
  if (Math.random() < 0.4) {
    const equipType = Math.random() < 0.5 ? 'weapon' : 'armor';
    const equipItem = getRandomItemFromDatabase({ category: equipType });
    loot.push({
      ...equipItem,
      id: 'equip-' + Date.now()
    });
  }

  return { totalXp, loot };
}
