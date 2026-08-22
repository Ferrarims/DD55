export type ArmorCategory = 'light' | 'medium' | 'heavy' | 'shield' | 'none';

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

  if (/armadura|cota|couraca|peitoral/.test(name)) {
    return 'medium';
  }

  return 'none';
}

export function isProficientWithArmor(character: any, armorOrShieldName: string): boolean {
  if (!character || !armorOrShieldName) return true;
  const category = getArmorCategory(armorOrShieldName);
  if (category === 'none') return true;

  const cls = (character.charClass || character.class_name || character.class || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const feats = (character.feats || []).map((f: string) => f.toLowerCase());

  if (category === 'light' && feats.some((f: string) => f.includes('lightly armored') || f.includes('armadura leve'))) return true;
  if (category === 'medium' && feats.some((f: string) => f.includes('moderately armored') || f.includes('armadura media'))) return true;
  if (category === 'heavy' && feats.some((f: string) => f.includes('heavily armored') || f.includes('armadura pesada'))) return true;

  if (cls.includes('guerreiro') || cls.includes('fighter') || cls.includes('paladino') || cls.includes('paladin')) {
    return true;
  }

  if (cls.includes('barbaro') || cls.includes('barbarian') || cls.includes('patrulheiro') || cls.includes('ranger') || cls.includes('clerigo') || cls.includes('cleric') || cls.includes('druida') || cls.includes('druid')) {
    if (category === 'light' || category === 'medium' || category === 'shield') return true;
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

export function getNonProficientArmorPenalties(character: any) {
  if (!character) return { isWearingNonProficientArmorOrShield: false, causesDisadvantageOnStrDex: false, blocksSpellcasting: false, nonProficientItems: [] };

  const equippedArmor = character.equipped_armor || character.equippedArmor || null;
  const equippedShield = character.equipped_shield || character.equippedShield || null;
  const inventory = character.character_inventory || character.inventory || [];

  const nonProficientItems: string[] = [];

  if (equippedArmor && !isProficientWithArmor(character, equippedArmor)) {
    nonProficientItems.push(equippedArmor);
  }

  if (equippedShield && !isProficientWithArmor(character, equippedShield)) {
    nonProficientItems.push(equippedShield);
  }

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
    causesDisadvantageOnStrDex: isWearing,
    blocksSpellcasting: isWearing,
    nonProficientItems
  };
}

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
