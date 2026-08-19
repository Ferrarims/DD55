import { CombatEntity, CellData, DiceRoll } from './types';
import { RACES_REFERENCE } from '../lib/api/references';

export function rollDice(
  count: number,
  sides: number,
  modifier: number = 0,
  rng: () => number = Math.random
): DiceRoll {
  const safeCount = Math.max(1, count);
  const safeSides = Math.max(1, sides);
  const rolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < safeCount; i++) {
    const val = Math.floor(rng() * safeSides) + 1;
    rolls.push(val);
    sum += val;
  }
  return {
    count: safeCount,
    sides: safeSides,
    modifier,
    rolls,
    total: Math.max(0, sum + modifier),
    isCritical: safeCount === 1 && safeSides === 20 && rolls[0] === 20,
    isFumble: safeCount === 1 && safeSides === 20 && rolls[0] === 1,
  };
}

export function rollD20(
  modifier: number = 0,
  advantageType: 'normal' | 'advantage' | 'disadvantage' = 'normal',
  rng: () => number = Math.random
): { total: number; naturalRoll: number; droppedRoll?: number; isCritical: boolean; isFumble: boolean } {
  const r1 = Math.floor(rng() * 20) + 1;
  if (advantageType === 'normal') {
    return {
      total: r1 + modifier,
      naturalRoll: r1,
      isCritical: r1 === 20,
      isFumble: r1 === 1,
    };
  }
  const r2 = Math.floor(rng() * 20) + 1;
  let chosen = r1;
  let dropped = r2;
  if (advantageType === 'advantage') {
    chosen = Math.max(r1, r2);
    dropped = Math.min(r1, r2);
  } else if (advantageType === 'disadvantage') {
    chosen = Math.min(r1, r2);
    dropped = Math.max(r1, r2);
  }
  return {
    total: chosen + modifier,
    naturalRoll: chosen,
    droppedRoll: dropped,
    isCritical: chosen === 20,
    isFumble: chosen === 1,
  };
}

export function resolveAttackRoll(params: {
  attackBonus: number;
  targetAC: number;
  advantageType?: 'normal' | 'advantage' | 'disadvantage';
  rng?: () => number;
}): { isHit: boolean; isCritical: boolean; isFumble: boolean; total: number; naturalRoll: number } {
  const { attackBonus, targetAC, advantageType = 'normal', rng = Math.random } = params;
  const d20 = rollD20(attackBonus, advantageType, rng);

  if (d20.isCritical) {
    return { isHit: true, isCritical: true, isFumble: false, total: d20.total, naturalRoll: d20.naturalRoll };
  }
  if (d20.isFumble) {
    return { isHit: false, isCritical: false, isFumble: true, total: d20.total, naturalRoll: d20.naturalRoll };
  }

  const isHit = d20.total >= targetAC;
  return { isHit, isCritical: false, isFumble: false, total: d20.total, naturalRoll: d20.naturalRoll };
}

export function sortInitiativeOrder<T extends { id: string; initiative: number; stats?: { dex: number } }>(
  entities: T[]
): T[] {
  return [...entities].sort((a, b) => {
    if (b.initiative !== a.initiative) {
      return b.initiative - a.initiative;
    }
    const aDex = a.stats?.dex ?? 10;
    const bDex = b.stats?.dex ?? 10;
    return bDex - aDex;
  });
}

export const getEntitySizeInSquares = (sizeStr?: string): number => {
  if (!sizeStr) return 1;
  const s = sizeStr.toLowerCase();
  if (s.includes('tiny') || s.includes('miudo') || s.includes('miúdo') || s.includes('diminuto')) return 1;
  if (s.includes('small') || s.includes('pequeno')) return 1;
  if (s.includes('medium') || s.includes('médio') || s.includes('medio')) return 1;
  if (s.includes('large') || s.includes('grande')) return 2;
  if (s.includes('huge') || s.includes('enorme')) return 3;
  if (s.includes('gargantuan') || s.includes('imenso') || s.includes('colossal')) return 4;
  return 1;
};

export const determineMonsterSize = (name: string, traits?: { name: string; text: string }[]): string => {
  const n = name.toLowerCase();
  if (n.includes('ancião') || n.includes('anciao') || n.includes('ancient') || n.includes('tarrasque') || n.includes('kraken') || n.includes('colossal') || n.includes('imenso') || n.includes('gargantuan')) {
    return 'Gargantuan';
  }
  if (n.includes('adulto') || n.includes('adult') || n.includes('gigante') || n.includes('giant') || n.includes('enorme') || n.includes('huge') || n.includes('treant') || n.includes('hydra') || n.includes('behir') || n.includes('remorhaz') || n.includes('mamute') || n.includes('mammoth')) {
    return 'Huge';
  }
  if (n.includes('jovem') || n.includes('young') || n.includes('ogro') || n.includes('ogre') || n.includes('troll') || n.includes('minotaur') || n.includes('minotauro') || n.includes('owlbear') || n.includes('urso coruja') || n.includes('manticora') || n.includes('manticore') || n.includes('quimera') || n.includes('chimera') || n.includes('grifo') || n.includes('griffin') || n.includes('pegaso') || n.includes('pegasus') || n.includes('centauro') || n.includes('centaur') || n.includes('gorgon') || n.includes('wyvern') || n.includes('bulette') || n.includes('golem') || n.includes('lobo atroz') || n.includes('dire wolf') || n.includes('aranha gigante') || n.includes('giant spider') || n.includes('unicorn') || n.includes('unicórnio') || n.includes('beholder') || n.includes('grande') || n.includes('large')) {
    return 'Large';
  }
  if (n.includes('goblin') || n.includes('kobold') || n.includes('halfling') || n.includes('gnomo') || n.includes('gnome') || n.includes('pixie') || n.includes('sprite') || n.includes('imp') || n.includes('pequeno') || n.includes('small')) {
    return 'Small';
  }
  if (n.includes('rato') || n.includes('rat') || n.includes('morcego') || n.includes('bat') || n.includes('homunculus') || n.includes('homúnculo') || n.includes('pseudodragon') || n.includes('pseudodragão') || n.includes('miúdo') || n.includes('miudo') || n.includes('tiny')) {
    return 'Tiny';
  }
  if (traits && traits.length > 0) {
    for (const t of traits) {
      const txt = (t.name + ' ' + t.text).toLowerCase();
      if (txt.includes('gargantuan') || txt.includes('imenso') || txt.includes('colossal')) return 'Gargantuan';
      if (txt.includes('huge') || txt.includes('enorme')) return 'Huge';
      if (txt.includes('large') || txt.includes('grande')) return 'Large';
      if (txt.includes('small') || txt.includes('pequeno')) return 'Small';
      if (txt.includes('tiny') || txt.includes('miúdo') || txt.includes('miudo')) return 'Tiny';
    }
  }
  return 'Medium';
};

export const getDistanceBetweenEntities = (
  e1: CombatEntity,
  e2: CombatEntity,
  charRace?: string,
  isLargeForm?: boolean
): number => {
  const getSizeStr = (e: CombatEntity) => {
    if (e.type === 'hero' && isLargeForm) return 'Grande';
    if (e.size) return e.size;
    if (e.type === 'hero') {
      return (charRace ? RACES_REFERENCE[charRace]?.size : 'Médio');
    }
    return 'Médio';
  };
  const s1 = getEntitySizeInSquares(getSizeStr(e1));
  const s2 = getEntitySizeInSquares(getSizeStr(e2));
  
  let minDist = Infinity;
  for (let x1 = e1.x; x1 < e1.x + s1; x1++) {
    for (let y1 = e1.y; y1 < e1.y + s1; y1++) {
      for (let x2 = e2.x; x2 < e2.x + s2; x2++) {
        for (let y2 = e2.y; y2 < e2.y + s2; y2++) {
          const d = Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
          if (d < minDist) {
            minDist = d;
          }
        }
      }
    }
  }
  return minDist;
};

export function getAttacksPerAction(character: any): number {
  if (!character) return 1;
  const level = Number(character.level || character.charLevel || character.lvl || 1);
  const className = (character.class_name || character.charClass || character.class || '').toLowerCase().trim();
  
  if (className.includes('guerreiro') || className.includes('fighter')) {
    if (level >= 20) return 4;
    if (level >= 11) return 3;
    if (level >= 5) return 2;
  } else if (
    className.includes('bárbaro') || className.includes('barbarian') ||
    className.includes('paladino') || className.includes('paladin') ||
    className.includes('patrulheiro') || className.includes('ranger') ||
    className.includes('monge') || className.includes('monk') ||
    className.includes('bardo') || className.includes('bard')
  ) {
    if (level >= 5) return 2;
  }
  return 1;
}

export function getWeaponMasteryDescription(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('cleave') || n.includes('trespassar')) {
    return "Cleave (Trespassar): Se você acertar uma criatura com um ataque corpo a corpo usando esta arma, você pode fazer um segundo ataque contra uma segunda criatura adjacente ao primeiro alvo e dentro do seu alcance.";
  }
  if (n.includes('graze') || n.includes('raspar') || n.includes('arranhão')) {
    return "Graze (Arranhão): Se a sua jogada de ataque com esta arma errar a criatura, você ainda causa dano igual ao modificador do seu atributo de ataque (mínimo de 1) ao alvo.";
  }
  if (n.includes('vex') || n.includes('vexar')) {
    return "Vex (Vexar): Se você acertar um ataque com esta arma, você ganha Vantagem na sua próxima jogada de ataque contra o mesmo alvo antes do final do seu próximo turno.";
  }
  if (n.includes('nick') || n.includes('corte rápido')) {
    return "Nick (Corte Rápido): Quando você faz um ataque com uma arma Leve como parte de sua Ação, você pode fazer o ataque adicional da arma leve como parte da mesma ação em vez de usar sua Ação Bônus.";
  }
  if (n.includes('sap') || n.includes('enfraquecer')) {
    return "Sap (Enfraquecer): Se você acertar uma criatura com esta arma, o alvo sofre Desvantagem na próxima jogada de ataque que ele fizer antes do início do seu próximo turno.";
  }
  if (n.includes('slow') || n.includes('lentidão')) {
    return "Slow (Lentidão): Se você acertar uma criatura com esta arma, o deslocamento dela é reduzido em 3 metros até o início do seu próximo turno.";
  }
  if (n.includes('topple') || n.includes('derrubar')) {
    return "Topple (Derrubar): Se você acertar uma criatura com esta arma, você pode forçar o alvo a fazer um Teste de Resistência de Constituição. Se falhar, o alvo cai Caído (Prone).";
  }
  if (n.includes('push') || n.includes('empurrar')) {
    return "Push (Empurrar): Se você acertar uma criatura com esta arma, você pode empurrá-la até 3 metros de distância em linha reta.";
  }
  return `Maestria de Arma (${name}): Propriedade especial da arma aplicada automaticamente ao acertar ataques.`;
}

export function getDamageTypeColor(damageType?: string) {
  const dt = (damageType || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let res = { primary: '#f97316', secondary: '#f59e0b', glow: 'rgba(249, 115, 22, 0.8)', particle: '#fde047' };
  if (dt.includes('fogo') || dt.includes('fire')) {
    res = { primary: '#ef4444', secondary: '#f97316', glow: 'rgba(239, 68, 68, 0.8)', particle: '#fde047' }; // Vermelho
  } else if (dt.includes('veneno') || dt.includes('poison')) {
    res = { primary: '#22c55e', secondary: '#10b981', glow: 'rgba(34, 197, 94, 0.8)', particle: '#86efac' }; // Verde
  } else if (dt.includes('acido') || dt.includes('acid')) {
    res = { primary: '#84cc16', secondary: '#a3e635', glow: 'rgba(132, 204, 22, 0.8)', particle: '#d9f99d' }; // Lime / Verde Ácido
  } else if (dt.includes('frio') || dt.includes('cold') || dt.includes('gelo')) {
    res = { primary: '#38bdf8', secondary: '#06b6d4', glow: 'rgba(56, 189, 248, 0.8)', particle: '#bae6fd' }; // Ciano/Azul
  } else if (dt.includes('eletrico') || dt.includes('lightning') || dt.includes('trovao') || dt.includes('thunder') || dt.includes('relampago')) {
    res = { primary: '#facc15', secondary: '#3b82f6', glow: 'rgba(250, 204, 21, 0.8)', particle: '#ffffff' }; // Amarelo/Azul
  } else if (dt.includes('necrotico') || dt.includes('necrotic')) {
    res = { primary: '#a855f7', secondary: '#7e22ce', glow: 'rgba(168, 85, 247, 0.8)', particle: '#e9d5ff' }; // Roxo
  } else if (dt.includes('radiante') || dt.includes('radiant')) {
    res = { primary: '#fde047', secondary: '#ffffff', glow: 'rgba(253, 224, 71, 0.8)', particle: '#fef08a' }; // Dourado
  } else if (dt.includes('psiquico') || dt.includes('psychic')) {
    res = { primary: '#ec4899', secondary: '#f43f5e', glow: 'rgba(236, 72, 153, 0.8)', particle: '#fbcfe8' }; // Rosa
  }
  return {
    ...res,
    main: res.primary,
    light: res.secondary,
    dark: res.glow,
  };
}

export function adjustDamageForDex(damageDice: string, strMod: number, dexMod: number): string {
  if (!damageDice) return damageDice;
  const match = damageDice.match(/^([0-9]+d[0-9]+(?:\s*[+-]\s*[0-9]+d[0-9]+)*)/i);
  if (match) {
    const baseDice = match[1];
    const totalMod = dexMod;
    if (totalMod === 0) return baseDice;
    return `${baseDice} ${totalMod >= 0 ? '+' : ''}${totalMod}`;
  }
  return damageDice;
}

export function hasThrownProperty(atk: any): boolean {
  if (!atk) return false;
  const rangeStr = String(atk.range || '').toLowerCase();
  const props = String(atk.properties || '').toLowerCase();
  const name = String(atk.name || '').toLowerCase();

  // Armas à distância puras que usam munição JAMAIS são consideradas armas de arremesso
  const isAmmunitionRanged = props.includes('munição') || props.includes('municao') ||
    name.includes('arco') || name.includes('besta') || name.includes('funda') ||
    name.includes('pistola') || name.includes('mosquete') || name.includes('blowgun') ||
    name.includes('zarabatana') || name.includes('bow') || name.includes('crossbow') ||
    name.includes('sling');

  if (isAmmunitionRanged) {
    return false;
  }

  // Verificar explicitamente a propriedade de arremesso
  if (props.includes('arremesso') || props.includes('thrown') || rangeStr.includes('arremesso') || rangeStr.includes('thrown')) {
    return true;
  }

  // Armas conhecidas com propriedade de arremesso em D&D 5e / 5.5e
  const knownThrown = [
    'adaga', 'dagger',
    'machadinha', 'handaxe',
    'azagaia', 'javelin',
    'lança', 'spear',
    'dardo', 'dart',
    'martelo leve', 'light hammer',
    'tridente', 'trident',
    'rede', 'net'
  ];

  return knownThrown.some(t => name.includes(t));
}

export function parseWeaponRange(atk: any, distance: number = 1): { normalCells: number; longCells: number; isRangedOrThrown: boolean } {
  if (!atk || !atk.range) {
    return { normalCells: 1, longCells: 1, isRangedOrThrown: false };
  }

  const rangeStr = String(atk.range || '').toLowerCase();
  const props = String(atk.properties || '').toLowerCase();
  const name = String(atk.name || '').toLowerCase();

  const isPureRanged = props.includes('munição') || props.includes('municao') || rangeStr.includes('m/') || rangeStr.includes('m /') || 
    name.includes('arco') || name.includes('besta') || name.includes('funda') || 
    name.includes('bow') || name.includes('crossbow') || name.includes('sling') || name.includes('dardo');

  const hasThrown = hasThrownProperty(atk);

  const slashMatch = rangeStr.match(/([0-9]+[\.,]?[0-9]*)\s*m?\s*\/\s*([0-9]+[\.,]?[0-9]*)\s*m?/i);
  if (slashMatch) {
    const normalMeters = parseFloat(slashMatch[1].replace(',', '.'));
    const longMeters = parseFloat(slashMatch[2].replace(',', '.'));
    const normalCells = Math.max(1, Math.round(normalMeters / 1.5));
    const longCells = Math.max(normalCells, Math.round(longMeters / 1.5));
    
    if (distance <= 1 && rangeStr.startsWith('1,5m')) {
      return { normalCells: 1, longCells: 1, isRangedOrThrown: false };
    }
    return { normalCells, longCells, isRangedOrThrown: true };
  }

  const singleMatch = rangeStr.match(/([0-9]+[\.,]?[0-9]*)\s*m/i);
  let normalCells = 1;
  let longCells = 1;

  if (singleMatch) {
    const meters = parseFloat(singleMatch[1].replace(',', '.'));
    normalCells = Math.max(1, Math.round(meters / 1.5));
  } else {
    const parsed = parseFloat(rangeStr);
    if (!isNaN(parsed)) {
      normalCells = Math.max(1, Math.round(parsed / 1.5));
    }
  }

  longCells = normalCells;

  if (hasThrown || props.includes('arremesso')) {
    if (distance <= 1 && (rangeStr.startsWith('1,5m') || !rangeStr.includes('/'))) {
      return { normalCells: 1, longCells: 1, isRangedOrThrown: false };
    }
    if (distance > normalCells) {
      return { normalCells: 4, longCells: 12, isRangedOrThrown: true };
    }
    return { normalCells, longCells, isRangedOrThrown: false };
  }

  const isReachMelee = props.includes('extensão') || props.includes('extensao') || props.includes('reach') || props.includes('alcance');
  if (isReachMelee && !isPureRanged) {
    normalCells = Math.max(normalCells, 2);
    longCells = Math.max(longCells, 2);
  }

  return { normalCells, longCells, isRangedOrThrown: isPureRanged };
}

export function getWeaponMaxRangeCells(atk: any): number {
  if (!atk || !atk.range) return 1;
  return parseWeaponRange(atk, 999).longCells;
}

export function getWeaponNormalRangeCells(atk: any, distance: number = 1): number {
  if (!atk || !atk.range) return 1;
  return parseWeaponRange(atk, distance).normalCells;
}

export type DamageCategory =
  | 'slashing'
  | 'piercing'
  | 'bludgeoning'
  | 'fire'
  | 'cold'
  | 'poison'
  | 'acid'
  | 'lightning'
  | 'thunder'
  | 'radiant'
  | 'necrotic'
  | 'psychic'
  | 'force'
  | 'other';

export function normalizeDamageType(damageType?: string): DamageCategory {
  if (!damageType) return 'slashing';
  const dt = damageType.toLowerCase().trim();
  if (dt.includes('corta') || dt.includes('slash') || dt.includes('corte')) return 'slashing';
  if (dt.includes('perfur') || dt.includes('pierc')) return 'piercing';
  if (dt.includes('concuss') || dt.includes('bludgeon') || dt.includes('impact') || dt.includes('esmagam')) return 'bludgeoning';
  if (dt.includes('fogo') || dt.includes('fire') || dt.includes('chama')) return 'fire';
  if (dt.includes('frio') || dt.includes('cold') || dt.includes('gelo') || dt.includes('frost')) return 'cold';
  if (dt.includes('veneno') || dt.includes('poison') || dt.includes('peçonh') || dt.includes('peconh')) return 'poison';
  if (dt.includes('ácid') || dt.includes('acid')) return 'acid';
  if (dt.includes('relâmp') || dt.includes('relamp') || dt.includes('lightn') || dt.includes('elétr') || dt.includes('eletr') || dt.includes('raio')) return 'lightning';
  if (dt.includes('trov') || dt.includes('thund') || dt.includes('sônic') || dt.includes('sonic')) return 'thunder';
  if (dt.includes('radian') || dt.includes('sagrad') || dt.includes('luz')) return 'radiant';
  if (dt.includes('necrót') || dt.includes('necrot') || dt.includes('necro')) return 'necrotic';
  if (dt.includes('psíqui') || dt.includes('psiqui') || dt.includes('psych') || dt.includes('mental')) return 'psychic';
  if (dt.includes('força') || dt.includes('forca') || dt.includes('force') || dt.includes('energia')) return 'force';
  return 'other';
}

export interface DamageAffinityResult {
  multiplier: number;
  type: 'none' | 'immune' | 'resistant' | 'vulnerable';
  message?: string;
}

export function evaluateDamageAffinity(params: {
  target: CombatEntity;
  damageAmount: number;
  damageType?: string;
  attackerId?: string;
  heroFeats?: string[];
  isHeroAttacking?: boolean;
}): DamageAffinityResult {
  const { target, damageAmount, damageType, heroFeats = [], isHeroAttacking } = params;
  if (!damageType || damageAmount <= 0) {
    return { multiplier: 1, type: 'none' };
  }

  const category = normalizeDamageType(damageType);
  const isPhysical = category === 'slashing' || category === 'piercing' || category === 'bludgeoning';
  const targetName = target.name || 'Alvo';

  const checkMatchesCategory = (entry: string): boolean => {
    const e = entry.toLowerCase().trim();
    if (category === 'slashing' && (e.includes('cortante') || e.includes('slashing') || e.includes('corte'))) return true;
    if (category === 'piercing' && (e.includes('perfurante') || e.includes('piercing'))) return true;
    if (category === 'bludgeoning' && (e.includes('concussão') || e.includes('concussao') || e.includes('concussivo') || e.includes('bludgeoning') || e.includes('impacto'))) return true;
    if (category === 'fire' && (e.includes('fogo') || e.includes('fire') || e.includes('chama'))) return true;
    if (category === 'cold' && (e.includes('frio') || e.includes('cold') || e.includes('gelo') || e.includes('frost'))) return true;
    if (category === 'poison' && (e.includes('veneno') || e.includes('poison') || e.includes('peçonha') || e.includes('peconha'))) return true;
    if (category === 'acid' && (e.includes('ácido') || e.includes('acido') || e.includes('acid'))) return true;
    if (category === 'lightning' && (e.includes('relâmpago') || e.includes('relampago') || e.includes('lightning') || e.includes('elétrico') || e.includes('eletrico') || e.includes('raio'))) return true;
    if (category === 'thunder' && (e.includes('trovão') || e.includes('trovao') || e.includes('thunder') || e.includes('sônico') || e.includes('sonic'))) return true;
    if (category === 'radiant' && (e.includes('radiante') || e.includes('radiant') || e.includes('sagrado') || e.includes('luz'))) return true;
    if (category === 'necrotic' && (e.includes('necrótico') || e.includes('necrotico') || e.includes('necrotic') || e.includes('trevas'))) return true;
    if (category === 'psychic' && (e.includes('psíquico') || e.includes('psiquico') || e.includes('psychic') || e.includes('mental'))) return true;
    if (category === 'force' && (e.includes('força') || e.includes('forca') || e.includes('force'))) return true;
    return false;
  };

  // 1. Checar Imunidades
  if (target.immunities && target.immunities.length > 0) {
    for (const imm of target.immunities) {
      const immLower = imm.toLowerCase();
      if (checkMatchesCategory(imm)) {
        // Se for dano físico e o texto de imunidade for condicional ("não-mágico", "não prateado", "nonmagical", "silvered", "prata", "adamant")
        const isConditionalPhysical = isPhysical && (
          immLower.includes('não mágico') ||
          immLower.includes('não-mágico') ||
          immLower.includes('nao magico') ||
          immLower.includes('nonmagical') ||
          immLower.includes('non-magical') ||
          immLower.includes('prata') ||
          immLower.includes('silver') ||
          immLower.includes('adamant')
        );

        if (isConditionalPhysical) {
          // No D&D 5.5e / Arena Digital, armas de aventureiros causam dano resistido (50%) para não travar a jogabilidade
          if (isHeroAttacking && heroFeats.includes('Dádiva do Ataque Irresistível')) {
            return {
              multiplier: 1,
              type: 'none',
              message: `⚡ [DÁDIVA DO ATAQUE IRRESISTÍVEL] Ignorou a resistência e imunidade física de ${targetName}!`
            };
          }
          return {
            multiplier: 0.5,
            type: 'resistant',
            message: `🛡️ ${targetName} possui Couro Resistente a ataques não-mágicos/prateados! (Dano reduzido de ${damageAmount} para ${Math.floor(damageAmount / 2)})`
          };
        }

        // Imunidade Elemental ou Total Incondicional (Ex: Fogo puro contra Elemental de Fogo, Veneno puro contra Esqueleto)
        return {
          multiplier: 0,
          type: 'immune',
          message: `🛡️ ${targetName} é Imune a dano de ${damageType}! (Dano: 0)`
        };
      }
    }
  }

  // 2. Checar Resistências
  let isResistant = false;
  if (target.resistances && target.resistances.length > 0) {
    isResistant = target.resistances.some(res => checkMatchesCategory(res));
  }
  // Anão com resistência inata a veneno
  if ((target as any).race === 'Anão' && category === 'poison') {
    isResistant = true;
  }

  if (isResistant) {
    if (isHeroAttacking) {
      if (heroFeats.includes('Dádiva do Ataque Irresistível') && isPhysical) {
        return {
          multiplier: 1,
          type: 'none',
          message: `⚡ [DÁDIVA DO ATAQUE IRRESISTÍVEL] Ignorou a resistência física de ${targetName}!`
        };
      }
      if (heroFeats.includes('Adepto Elemental') && ['fire', 'cold', 'acid', 'lightning', 'thunder'].includes(category)) {
        return {
          multiplier: 1,
          type: 'none',
          message: `🔥 [ADEPTO ELEMENTAL] Ignorou a resistência de ${targetName} a ${damageType}!`
        };
      }
      if (heroFeats.includes('Envenenador') && category === 'poison') {
        return {
          multiplier: 1,
          type: 'none',
          message: `🧪 [ENVENENADOR] Ignorou a resistência a veneno de ${targetName}!`
        };
      }
    }

    const halfDmg = Math.floor(damageAmount / 2);
    return {
      multiplier: 0.5,
      type: 'resistant',
      message: `🛡️ ${targetName} possui Resistência a ${damageType}! (Dano reduzido de ${damageAmount} para ${halfDmg})`
    };
  }

  // 3. Checar Vulnerabilidades
  let isVulnerable = false;
  if (target.vulnerabilities && target.vulnerabilities.length > 0) {
    isVulnerable = target.vulnerabilities.some(vul => checkMatchesCategory(vul));
  }

  if (isVulnerable) {
    const doubleDmg = damageAmount * 2;
    return {
      multiplier: 2,
      type: 'vulnerable',
      message: `💥 ${targetName} possui Vulnerabilidade a ${damageType}! (Dano dobrado de ${damageAmount} para ${doubleDmg})`
    };
  }

  return { multiplier: 1, type: 'none' };
}

export interface SafeSpawnOptions {
  grid: CellData[][];
  monsterSize: number;
  heroPos: { x: number; y: number };
  heroSize?: number;
  usedPositions: Set<string>;
  minDistanceToHero?: number;
  maxDistanceToHero?: number;
  preferredAngle?: number;
}

export function findSafeMonsterSpawnPosition(options: SafeSpawnOptions): { x: number; y: number } {
  const {
    grid,
    monsterSize,
    heroPos,
    heroSize = 1,
    usedPositions,
    minDistanceToHero = 6,
    maxDistanceToHero = 14,
    preferredAngle = Math.random() * Math.PI * 2
  } = options;

  const rows = grid.length;
  const cols = grid[0]?.length || 0;

  const isCellAvailable = (x: number, y: number): boolean => {
    if (x < 2 || x >= cols - 2 || y < 2 || y >= rows - 2) return false;
    const cell = grid[y]?.[x];
    if (!cell) return false;
    if (cell.terrain === 'wall' || cell.terrain === 'water') return false;
    if (cell.movementCost === Infinity) return false;
    if (cell.obstacleType !== undefined) return false;
    if (usedPositions.has(`${x},${y}`)) return false;
    return true;
  };

  const isPositionSafeAndClear = (x: number, y: number, size: number, checkHeroDist: boolean = true): boolean => {
    // 1. Checar se todas as células do monstro estão livres de paredes, água e obstáculos
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!isCellAvailable(x + c, y + r)) {
          return false;
        }
      }
    }

    // 2. Checar colisão e distância com o herói
    if (checkHeroDist) {
      for (let hr = 0; hr < heroSize; hr++) {
        for (let hc = 0; hc < heroSize; hc++) {
          const hx = heroPos.x + hc;
          const hy = heroPos.y + hr;
          for (let mr = 0; mr < size; mr++) {
            for (let mc = 0; mc < size; mc++) {
              const mx = x + mc;
              const my = y + mr;
              const dist = Math.max(Math.abs(mx - hx), Math.abs(my - hy));
              if (dist < minDistanceToHero) {
                return false;
              }
            }
          }
        }
      }
    }

    return true;
  };

  // Estratégia 1: Varredura angular ao redor do herói na faixa de distância ideal
  const angleSteps = 24;
  for (let dist = minDistanceToHero; dist <= maxDistanceToHero; dist++) {
    for (let step = 0; step < angleSteps; step++) {
      const angle = preferredAngle + (step % 2 === 0 ? (step / 2) : -(step + 1) / 2) * ((Math.PI * 2) / angleSteps);
      const testX = Math.round(heroPos.x + Math.cos(angle) * dist);
      const testY = Math.round(heroPos.y + Math.sin(angle) * dist);

      if (isPositionSafeAndClear(testX, testY, monsterSize, true)) {
        // Reservar posições
        for (let r = 0; r < monsterSize; r++) {
          for (let c = 0; c < monsterSize; c++) {
            usedPositions.add(`${testX + c},${testY + r}`);
            if (grid[testY + r]?.[testX + c]) {
              grid[testY + r][testX + c] = {
                ...grid[testY + r][testX + c],
                terrain: 'normal',
                movementCost: 1,
                obstacleType: undefined
              };
            }
          }
        }
        return { x: testX, y: testY };
      }
    }
  }

  // Estratégia 2: Expandir raio de busca até 28 blocos do herói
  for (let dist = maxDistanceToHero + 1; dist <= 28; dist++) {
    for (let dy = -dist; dy <= dist; dy++) {
      for (let dx = -dist; dx <= dist; dx++) {
        if (Math.abs(dx) !== dist && Math.abs(dy) !== dist) continue;
        const testX = heroPos.x + dx;
        const testY = heroPos.y + dy;
        if (isPositionSafeAndClear(testX, testY, monsterSize, true)) {
          for (let r = 0; r < monsterSize; r++) {
            for (let c = 0; c < monsterSize; c++) {
              usedPositions.add(`${testX + c},${testY + r}`);
              if (grid[testY + r]?.[testX + c]) {
                grid[testY + r][testX + c] = {
                  ...grid[testY + r][testX + c],
                  terrain: 'normal',
                  movementCost: 1,
                  obstacleType: undefined
                };
              }
            }
          }
          return { x: testX, y: testY };
        }
      }
    }
  }

  // Estratégia 3: Buscar qualquer célula 100% desobstruída no mapa fora do herói
  for (let r = 3; r < rows - monsterSize - 3; r++) {
    for (let c = 3; c < cols - monsterSize - 3; c++) {
      if (isPositionSafeAndClear(c, r, monsterSize, true)) {
        for (let mr = 0; mr < monsterSize; mr++) {
          for (let mc = 0; mc < monsterSize; mc++) {
            usedPositions.add(`${c + mc},${r + mr}`);
            if (grid[r + mr]?.[c + mc]) {
              grid[r + mr][c + mc] = {
                ...grid[r + mr][c + mc],
                terrain: 'normal',
                movementCost: 1,
                obstacleType: undefined
              };
            }
          }
        }
        return { x: c, y: r };
      }
    }
  }

  // Fallback seguro: tamanho 1x1 em célula aberta
  if (monsterSize > 1) {
    return findSafeMonsterSpawnPosition({
      ...options,
      monsterSize: 1
    });
  }

  const fallbackX = Math.min(cols - 4, Math.max(4, heroPos.x + 6));
  const fallbackY = Math.min(rows - 4, Math.max(4, heroPos.y + 6));
  usedPositions.add(`${fallbackX},${fallbackY}`);
  if (grid[fallbackY]?.[fallbackX]) {
    grid[fallbackY][fallbackX] = {
      ...grid[fallbackY][fallbackX],
      terrain: 'normal',
      movementCost: 1,
      obstacleType: undefined
    };
  }
  return { x: fallbackX, y: fallbackY };
}

