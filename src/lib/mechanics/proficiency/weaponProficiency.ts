export function getProficiencyBonus(level: number = 1): number {
  const validLevel = Math.max(1, Math.min(20, Math.floor(level) || 1));
  return Math.floor((validLevel - 1) / 4) + 2;
}

export type WeaponCategory = 'simple_melee' | 'simple_ranged' | 'martial_melee' | 'martial_ranged' | 'unknown';

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

export function isProficientWithWeapon(character: any, weaponName: string): boolean {
  if (!character || !weaponName) return true;
  const nameLower = weaponName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const cls = (character.charClass || character.class_name || character.class || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const race = (character.race || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const category = getWeaponCategory(weaponName);

  const explicitProfs = (character.weaponProficiencies || character.weapon_proficiencies || character.equipment || []).map((p: any) =>
    String(p).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  );
  if (explicitProfs.some((p: string) => nameLower.includes(p) || p.includes(nameLower))) {
    return true;
  }

  if (
    cls.includes('barbaro') || cls.includes('barbarian') ||
    cls.includes('guerreiro') || cls.includes('fighter') ||
    cls.includes('paladino') || cls.includes('paladin') ||
    cls.includes('patrulheiro') || cls.includes('ranger')
  ) {
    return true;
  }

  if (cls.includes('bardo') || cls.includes('bard')) {
    if (category === 'simple_melee' || category === 'simple_ranged') return true;
    if (nameLower.includes('espada curta') || nameLower.includes('shortsword') ||
        nameLower.includes('rapieira') || nameLower.includes('rapier') ||
        nameLower.includes('besta de mao') || nameLower.includes('hand crossbow') ||
        nameLower.includes('espada longa') || nameLower.includes('longsword')) {
      return true;
    }
  }

  if (cls.includes('ladino') || cls.includes('rogue')) {
    if (category === 'simple_melee' || category === 'simple_ranged') return true;
    if (nameLower.includes('besta de mao') || nameLower.includes('hand crossbow') ||
        nameLower.includes('espada longa') || nameLower.includes('longsword') ||
        nameLower.includes('rapieira') || nameLower.includes('rapier') ||
        nameLower.includes('espada curta') || nameLower.includes('shortsword')) {
      return true;
    }
  }

  if (cls.includes('monge') || cls.includes('monk')) {
    if (category === 'simple_melee' || category === 'simple_ranged') return true;
    if (nameLower.includes('espada curta') || nameLower.includes('shortsword')) return true;
  }

  if (
    cls.includes('clerigo') || cls.includes('cleric') ||
    cls.includes('druida') || cls.includes('druid') ||
    cls.includes('bruxo') || cls.includes('warlock')
  ) {
    if (category === 'simple_melee' || category === 'simple_ranged') return true;
    if (cls.includes('druid') && (nameLower.includes('cimitarra') || nameLower.includes('scimitar'))) return true;
  }

  if (cls.includes('feiticeiro') || cls.includes('sorcerer') || cls.includes('mago') || cls.includes('wizard')) {
    if (category === 'simple_melee' || category === 'simple_ranged') return true;
  }

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

  if (category === 'simple_melee' || category === 'simple_ranged') {
    return true;
  }

  return false;
}
