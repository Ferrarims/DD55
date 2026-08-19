// Utilitário de Proficiências de Armas, Armaduras e Escudos (Regras D&D 5.5e 2024)

export function getProficiencyBonus(level: number = 1): number {
  const validLevel = Math.max(1, Math.min(20, Math.floor(level) || 1));
  return Math.floor((validLevel - 1) / 4) + 2;
}

export type WeaponCategory = 'simple_melee' | 'simple_ranged' | 'martial_melee' | 'martial_ranged' | 'unknown';
export type ArmorCategory = 'light' | 'medium' | 'heavy' | 'shield' | 'none';

// Classificação de Armas
export function getWeaponCategory(weaponName: string): WeaponCategory {
  if (!weaponName || typeof weaponName !== 'string') return 'unknown';
  const name = weaponName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  // Armas Simples Corpo a Corpo
  if (
    name.includes('adaga') || name.includes('dagger') ||
    name.includes('borda') || name.includes('bordao') || name.includes('cajado') || name.includes('quarterstaff') ||
    name.includes('clava grande') || name.includes('greatclub') ||
    name.includes('clava') || name.includes('club') ||
    name.includes('foice') || name.includes('sickle') ||
    name.includes('lanca') || name.includes('spear') ||
    name.includes('maca') || name.includes('mace') ||
    name.includes('machadinha') || name.includes('handaxe') ||
    name.includes('martelo leve') || name.includes('light hammer') ||
    name.includes('desarmado') || name.includes('unarmed')
  ) {
    return 'simple_melee';
  }

  // Armas Simples à Distância
  if (
    name.includes('besta leve') || name.includes('light crossbow') ||
    name.includes('arco curto') || name.includes('shortbow') ||
    name.includes('funda') || name.includes('sling') ||
    name.includes('azagaia') || name.includes('javelin') ||
    name.includes('dardo') || name.includes('dart')
  ) {
    return 'simple_ranged';
  }

  // Armas Marciais à Distância
  if (
    name.includes('arco longo') || name.includes('longbow') ||
    name.includes('besta pesada') || name.includes('heavy crossbow') ||
    name.includes('besta de mao') || name.includes('hand crossbow') ||
    name.includes('mosquete') || name.includes('musket') ||
    name.includes('pistola') || name.includes('pistol') ||
    name.includes('zarabatana') || name.includes('blowgun')
  ) {
    return 'martial_ranged';
  }

  // Armas Marciais Corpo a Corpo
  if (
    name.includes('alabarda') || name.includes('halberd') ||
    name.includes('glaive') ||
    name.includes('cimitarra') || name.includes('scimitar') ||
    name.includes('chicote') || name.includes('whip') ||
    name.includes('espada curta') || name.includes('shortsword') ||
    name.includes('espada grande') || name.includes('greatsword') ||
    name.includes('espada longa') || name.includes('longsword') ||
    name.includes('lanca de montaria') || name.includes('lanca longa') || name.includes('lance') ||
    name.includes('maca estrela') || name.includes('morningstar') ||
    name.includes('machado de batalha') || name.includes('battleaxe') ||
    name.includes('machado grande') || name.includes('greataxe') ||
    name.includes('malho') || name.includes('maul') ||
    name.includes('mangual') || name.includes('flail') ||
    name.includes('martelo de guerra') || name.includes('warhammer') ||
    name.includes('picareta de guerra') || name.includes('war pick') ||
    name.includes('rapieira') || name.includes('rapier') ||
    name.includes('tridente') || name.includes('trident') ||
    name.includes('pique') || name.includes('pike')
  ) {
    return 'martial_melee';
  }

  // Fallback por palavra-chave genérica
  if (name.includes('arco') || name.includes('besta')) return 'simple_ranged';
  if (name.includes('espada') || name.includes('machado') || name.includes('martelo')) return 'simple_melee';

  return 'unknown';
}

// Classificação de Armaduras e Escudos
export function getArmorCategory(itemName: string): ArmorCategory {
  if (!itemName || typeof itemName !== 'string') return 'none';
  const name = itemName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  if (name.includes('escudo') || name.includes('shield')) {
    return 'shield';
  }

  // Armaduras Leves
  if (
    name.includes('acolchoada') || name.includes('padded') ||
    name.includes('couro batido') || name.includes('studded leather') ||
    name.includes('couro') || name.includes('leather') ||
    name.includes('corselete') || name.includes('tunica') || name.includes('traje')
  ) {
    return 'light';
  }

  // Armaduras Médias
  if (
    name.includes('peles') || name.includes('hide') ||
    name.includes('gibao') || name.includes('gibão') ||
    name.includes('malha parcial') || name.includes('scale mail') ||
    name.includes('loriga') || name.includes('escamas') ||
    name.includes('couraca') || name.includes('couraça') || name.includes('breastplate') ||
    name.includes('placas parcial') || name.includes('half plate') ||
    name.includes('meia-armadura')
  ) {
    return 'medium';
  }

  // Armaduras Pesadas
  if (
    name.includes('aneis') || name.includes('anéis') || name.includes('ring mail') ||
    name.includes('cota de malha') || name.includes('chain mail') ||
    name.includes('cota de talas') || name.includes('talas') || name.includes('splint') ||
    name.includes('placa') || name.includes('placas') || name.includes('plate')
  ) {
    return 'heavy';
  }

  // Fallback genérico se for item de armadura
  if (/armadura|cota|couraca|peitoral/.test(name)) {
    return 'medium';
  }

  return 'none';
}

/**
 * Verifica se o personagem é proficiente com uma arma específica.
 */
export function isProficientWithWeapon(character: any, weaponName: string): boolean {
  if (!character || !weaponName) return true;
  const nameLower = weaponName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const cls = (character.charClass || character.class_name || character.class || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const race = (character.race || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const category = getWeaponCategory(weaponName);

  // Lista explícita nas proficiências da ficha (se houver)
  const explicitProfs = (character.weaponProficiencies || character.weapon_proficiencies || character.equipment || []).map((p: any) =>
    String(p).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  );
  if (explicitProfs.some((p: string) => nameLower.includes(p) || p.includes(nameLower))) {
    return true;
  }

  // Proficiências por Classe (D&D 5e / 2024)
  // Classes com proficiência com TODAS as armas (Simples e Marciais)
  if (
    cls.includes('barbaro') || cls.includes('barbarian') ||
    cls.includes('guerreiro') || cls.includes('fighter') ||
    cls.includes('paladino') || cls.includes('paladin') ||
    cls.includes('patrulheiro') || cls.includes('ranger')
  ) {
    return true;
  }

  // Bardo (Bard): Armas Simples, mais Espada Curta, Rapieira, Besta de Mão, Espada Longa ou com propriedade Leve
  if (cls.includes('bardo') || cls.includes('bard')) {
    if (category === 'simple_melee' || category === 'simple_ranged') return true;
    if (nameLower.includes('espada curta') || nameLower.includes('shortsword') ||
        nameLower.includes('rapieira') || nameLower.includes('rapier') ||
        nameLower.includes('besta de mao') || nameLower.includes('hand crossbow') ||
        nameLower.includes('espada longa') || nameLower.includes('longsword')) {
      return true;
    }
  }

  // Ladino (Rogue): Armas Simples, mais Besta de Mão, Espada Longa, Rapieira, Espada Curta
  if (cls.includes('ladino') || cls.includes('rogue')) {
    if (category === 'simple_melee' || category === 'simple_ranged') return true;
    if (nameLower.includes('besta de mao') || nameLower.includes('hand crossbow') ||
        nameLower.includes('espada longa') || nameLower.includes('longsword') ||
        nameLower.includes('rapieira') || nameLower.includes('rapier') ||
        nameLower.includes('espada curta') || nameLower.includes('shortsword')) {
      return true;
    }
  }

  // Monge (Monk): Armas Simples, mais Espada Curta
  if (cls.includes('monge') || cls.includes('monk')) {
    if (category === 'simple_melee' || category === 'simple_ranged') return true;
    if (nameLower.includes('espada curta') || nameLower.includes('shortsword')) return true;
  }

  // Clérigo, Druida, Bruxo (Cleric, Druid, Warlock): Armas Simples
  if (
    cls.includes('clerigo') || cls.includes('cleric') ||
    cls.includes('druida') || cls.includes('druid') ||
    cls.includes('bruxo') || cls.includes('warlock')
  ) {
    if (category === 'simple_melee' || category === 'simple_ranged') return true;
    // Druida tem proficiência extra com Cimitarra
    if (cls.includes('druid') && (nameLower.includes('cimitarra') || nameLower.includes('scimitar'))) return true;
  }

  // Feiticeiro e Mago (Sorcerer, Wizard): Armas Simples (ou Adaga, Dardo, Funda, Bordão, Besta Leve)
  if (cls.includes('feiticeiro') || cls.includes('sorcerer') || cls.includes('mago') || cls.includes('wizard')) {
    if (category === 'simple_melee' || category === 'simple_ranged') return true;
  }

  // Proficiências Raciais
  if (race.includes('elfo') || race.includes('elf')) {
    if (nameLower.includes('espada longa') || nameLower.includes('longsword') ||
        nameLower.includes('espada curta') || nameLower.includes('shortsword') ||
        nameLower.includes('arco curto') || nameLower.includes('shortbow') ||
        nameLower.includes('arco longo') || nameLower.includes('longbow')) {
      return true;
    }
  }
  if (race.includes('anao') || race.includes('dwarf')) {
    if (nameLower.includes('machado de batalha') || nameLower.includes('battleaxe') ||
        nameLower.includes('machadinha') || nameLower.includes('handaxe') ||
        nameLower.includes('martelo leve') || nameLower.includes('light hammer') ||
        nameLower.includes('martelo de guerra') || nameLower.includes('warhammer')) {
      return true;
    }
  }

  // Se a categoria for simple, e nenhuma regra bloqueou, a maioria das classes tem proficiência em armas simples
  if (category === 'simple_melee' || category === 'simple_ranged') {
    return true;
  }

  return false;
}

/**
 * Verifica se o personagem é proficiente com uma armadura ou escudo.
 */
export function isProficientWithArmor(character: any, armorOrShieldName: string): boolean {
  if (!character || !armorOrShieldName) return true;
  const category = getArmorCategory(armorOrShieldName);
  if (category === 'none') return true;

  const cls = (character.charClass || character.class_name || character.class || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const feats = (character.feats || []).map((f: string) => f.toLowerCase());

  // Verificar talentos explicitamente
  if (category === 'light' && feats.some((f: string) => f.includes('lightly armored') || f.includes('armadura leve'))) return true;
  if (category === 'medium' && feats.some((f: string) => f.includes('moderately armored') || f.includes('armadura media'))) return true;
  if (category === 'heavy' && feats.some((f: string) => f.includes('heavily armored') || f.includes('armadura pesada'))) return true;

  // Proficiências por Classe
  if (cls.includes('guerreiro') || cls.includes('fighter') || cls.includes('paladino') || cls.includes('paladin')) {
    return true; // Leve, Média, Pesada, Escudo
  }

  if (cls.includes('barbaro') || cls.includes('barbarian') || cls.includes('patrulheiro') || cls.includes('ranger') || cls.includes('clerigo') || cls.includes('cleric') || cls.includes('druida') || cls.includes('druid')) {
    if (category === 'light' || category === 'medium' || category === 'shield') return true;
    // Subclasses de Clérigo que concedem Armadura Pesada
    if (cls.includes('clerigo') || cls.includes('cleric')) {
      const subclass = (character.subclass || '').toLowerCase();
      if (subclass.includes('vida') || subclass.includes('guerra') || subclass.includes('tempestade') || subclass.includes('forja')) {
        return true;
      }
    }
  }

  if (cls.includes('bardo') || cls.includes('bard') || cls.includes('ladino') || cls.includes('rogue') || cls.includes('bruxo') || cls.includes('warlock')) {
    if (category === 'light') return true;
  }

  return false;
}

/**
 * Retorna as penalidades sistêmicas caso o personagem esteja usando Armadura ou Escudo sem proficiência.
 */
export function getNonProficientArmorPenalties(character: any) {
  if (!character) return { isWearingNonProficientArmorOrShield: false, causesDisadvantageOnStrDex: false, blocksSpellcasting: false, nonProficientItems: [] };

  const equippedArmor = character.equipped_armor || character.equippedArmor || null;
  const equippedShield = character.equipped_shield || character.equippedShield || null;
  const inventory = character.character_inventory || character.inventory || [];

  const nonProficientItems: string[] = [];

  // Verificar armadura equipada
  if (equippedArmor && !isProficientWithArmor(character, equippedArmor)) {
    nonProficientItems.push(equippedArmor);
  }

  // Verificar escudo equipado
  if (equippedShield && !isProficientWithArmor(character, equippedShield)) {
    nonProficientItems.push(equippedShield);
  }

  // Verificar itens equipados no inventário caso os campos de topo não estejam populados
  if (Array.isArray(inventory)) {
    inventory.forEach((item: any) => {
      if (typeof item === 'object' && item && item.equipped) {
        const cat = getArmorCategory(item.name);
        if (cat !== 'none' && !isProficientWithArmor(character, item.name)) {
          if (!nonProficientItems.includes(item.name)) {
            nonProficientItems.push(item.name);
          }
        }
      }
    });
  }

  const isWearing = nonProficientItems.length > 0;

  return {
    isWearingNonProficientArmorOrShield: isWearing,
    causesDisadvantageOnStrDex: isWearing, // Desvantagem em testes, salvaguardas e ataques de FOR/DES
    blocksSpellcasting: isWearing,          // Bloqueio total da conjuração de magias
    nonProficientItems
  };
}

/**
 * Requisito de Força para Armaduras Pesadas (Regra 5.5e):
 * Se não atingir a Força mínima, sofre penalidade de -10 pés (-3m / -2 células) no deslocamento.
 */
export function checkHeavyArmorStrengthReq(character: any, armorName?: string) {
  const name = (armorName || character?.equipped_armor || character?.equippedArmor || '').toLowerCase();
  const str = Number(character?.str || character?.strength || 10);

  let minStr = 0;
  if (name.includes('aneis') || name.includes('anéis') || name.includes('ring mail')) minStr = 11;
  else if (name.includes('cota de malha') || name.includes('chain mail')) minStr = 13;
  else if (name.includes('cota de talas') || name.includes('talas') || name.includes('splint')) minStr = 15;
  else if (name.includes('placa') || name.includes('placas') || name.includes('plate')) minStr = 15;

  if (minStr > 0 && str < minStr) {
    return {
      requiresMinStr: true,
      minStr,
      met: false,
      speedPenaltyFeet: 10,
      speedPenaltyCells: 2
    };
  }

  return {
    requiresMinStr: minStr > 0,
    minStr,
    met: true,
    speedPenaltyFeet: 0,
    speedPenaltyCells: 0
  };
}
