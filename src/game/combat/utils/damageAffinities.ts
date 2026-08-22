import { CombatEntity } from '../../types';

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

export interface DamageAffinityResult {
  multiplier: number;
  type: 'none' | 'immune' | 'resistant' | 'vulnerable';
  message?: string;
}

export function getDamageTypeColor(damageType?: string) {
  const dt = (damageType || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let res = { primary: '#f97316', secondary: '#f59e0b', glow: 'rgba(249, 115, 22, 0.8)', particle: '#fde047' };
  if (dt.includes('fogo') || dt.includes('fire')) {
    res = { primary: '#ef4444', secondary: '#f97316', glow: 'rgba(239, 68, 68, 0.8)', particle: '#fde047' };
  } else if (dt.includes('veneno') || dt.includes('poison')) {
    res = { primary: '#22c55e', secondary: '#10b981', glow: 'rgba(34, 197, 94, 0.8)', particle: '#86efac' };
  } else if (dt.includes('acido') || dt.includes('acid')) {
    res = { primary: '#84cc16', secondary: '#a3e635', glow: 'rgba(132, 204, 22, 0.8)', particle: '#d9f99d' };
  } else if (dt.includes('frio') || dt.includes('cold') || dt.includes('gelo')) {
    res = { primary: '#38bdf8', secondary: '#06b6d4', glow: 'rgba(56, 189, 248, 0.8)', particle: '#bae6fd' };
  } else if (dt.includes('eletrico') || dt.includes('lightning') || dt.includes('trovao') || dt.includes('thunder') || dt.includes('relampago')) {
    res = { primary: '#facc15', secondary: '#3b82f6', glow: 'rgba(250, 204, 21, 0.8)', particle: '#ffffff' };
  } else if (dt.includes('necrotico') || dt.includes('necrotic')) {
    res = { primary: '#a855f7', secondary: '#7e22ce', glow: 'rgba(168, 85, 247, 0.8)', particle: '#e9d5ff' };
  } else if (dt.includes('radiante') || dt.includes('radiant')) {
    res = { primary: '#fde047', secondary: '#ffffff', glow: 'rgba(253, 224, 71, 0.8)', particle: '#fef08a' };
  } else if (dt.includes('psiquico') || dt.includes('psychic')) {
    res = { primary: '#ec4899', secondary: '#f43f5e', glow: 'rgba(236, 72, 153, 0.8)', particle: '#fbcfe8' };
  }
  return {
    ...res,
    main: res.primary,
    light: res.secondary,
    dark: res.glow,
  };
}

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
  const isPetrified = target.conditions?.some(c => c === 'Petrificado' || c === 'Petrified');
  if (isPetrified) {
    isResistant = true;
  } else if (target.resistances && target.resistances.length > 0) {
    isResistant = target.resistances.some(res => checkMatchesCategory(res));
  }
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
