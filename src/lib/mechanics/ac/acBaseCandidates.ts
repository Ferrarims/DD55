export interface BaseCandidate {
  name: string;
  calcStr: string;
  acValue: number;
  armorType: 'none' | 'light' | 'medium' | 'heavy';
  allowsShield: boolean;
  requiresNoArmor: boolean;
  armorDexBonus?: number;
}

interface ComputeBaseCandidatesParams {
  charClass: string;
  dexMod: number;
  conMod: number;
  wisMod: number;
  hasArmorWorn: boolean;
  armorName: string | null;
  activeSpells: string[];
  slots: Record<string, string | null>;
  feats: string[];
}

export function computeBaseCandidates({
  charClass,
  dexMod,
  conMod,
  wisMod,
  hasArmorWorn,
  armorName,
  activeSpells,
  slots,
  feats,
}: ComputeBaseCandidatesParams): { candidates: BaseCandidate[]; chosenBase: BaseCandidate; armorDexBonus: number } {
  const cls = (charClass || '').toLowerCase();
  const candidates: BaseCandidate[] = [];

  // 1. Sem Armadura (Padrão)
  candidates.push({
    name: 'Sem Armadura (Padrão)',
    calcStr: `10 + Mod. Destreza (${dexMod >= 0 ? '+' : ''}${dexMod})`,
    acValue: 10 + dexMod,
    armorType: 'none',
    allowsShield: true,
    requiresNoArmor: false,
    armorDexBonus: dexMod,
  });

  // 2. Bárbaro: Defesa Sem Armadura
  if (cls.includes('bárbaro') || cls.includes('barbarian')) {
    candidates.push({
      name: 'Defesa Sem Armadura (Bárbaro)',
      calcStr: `10 + Mod. Destreza (${dexMod >= 0 ? '+' : ''}${dexMod}) + Mod. Constituição (${conMod >= 0 ? '+' : ''}${conMod})`,
      acValue: 10 + dexMod + conMod,
      armorType: 'none',
      allowsShield: true,
      requiresNoArmor: true,
      armorDexBonus: dexMod,
    });
  }

  // 3. Monge: Defesa Sem Armadura
  if (cls.includes('monge') || cls.includes('monk')) {
    candidates.push({
      name: 'Defesa Sem Armadura (Monge)',
      calcStr: `10 + Mod. Destreza (${dexMod >= 0 ? '+' : ''}${dexMod}) + Mod. Sabedoria (${wisMod >= 0 ? '+' : ''}${wisMod})`,
      acValue: 10 + dexMod + wisMod,
      armorType: 'none',
      allowsShield: false,
      requiresNoArmor: true,
      armorDexBonus: dexMod,
    });
  }

  // 4. Magia (ex: Armadura Arcana / Mage Armor)
  const hasMageArmor = activeSpells.some(s => s.toLowerCase().includes('armadura arcana') || s.toLowerCase().includes('mage armor')) ||
    (slots['efeito_magico'] || '').toLowerCase().includes('armadura arcana');
  if (hasMageArmor) {
    candidates.push({
      name: 'Magia: Armadura Arcana (Mage Armor)',
      calcStr: `13 + Mod. Destreza (${dexMod >= 0 ? '+' : ''}${dexMod})`,
      acValue: 13 + dexMod,
      armorType: 'none',
      allowsShield: true,
      requiresNoArmor: true,
      armorDexBonus: dexMod,
    });
  }

  // 5. Armaduras Equipadas
  let armorDexBonus = dexMod;

  if (hasArmorWorn && armorName) {
    const lowerArmor = armorName.toLowerCase();
    let magicEnhancement = 0;
    if (lowerArmor.includes('+3')) magicEnhancement = 3;
    else if (lowerArmor.includes('+2')) magicEnhancement = 2;
    else if (lowerArmor.includes('+1')) magicEnhancement = 1;

    let armorBaseAc = 10;

    if (lowerArmor.includes('acolchoada') || lowerArmor.includes('couro') || lowerArmor.includes('couro batido')) {
      if (lowerArmor.includes('couro batido')) armorBaseAc = 12;
      else armorBaseAc = 11;
      armorBaseAc += magicEnhancement;
      armorDexBonus = dexMod;

      candidates.push({
        name: `Armadura Leve (${armorName})`,
        calcStr: `CA Base da Armadura (${armorBaseAc - magicEnhancement}${magicEnhancement ? ` +${magicEnhancement} mágica` : ''}) + Mod. Destreza total (${dexMod >= 0 ? '+' : ''}${dexMod})`,
        acValue: armorBaseAc + dexMod,
        armorType: 'light',
        allowsShield: true,
        requiresNoArmor: false,
        armorDexBonus,
      });
    } else if (
      lowerArmor.includes('peles') || lowerArmor.includes('gibão') || lowerArmor.includes('gibao') ||
      lowerArmor.includes('malha parcial') || lowerArmor.includes('loriga') || lowerArmor.includes('escamas') ||
      lowerArmor.includes('couraça') || lowerArmor.includes('couraca') || lowerArmor.includes('placas parcial') ||
      lowerArmor.includes('meia-armadura')
    ) {
      if (lowerArmor.includes('peles') || lowerArmor.includes('gibão') || lowerArmor.includes('gibao')) armorBaseAc = 12;
      else if (lowerArmor.includes('malha parcial')) armorBaseAc = 13;
      else if (lowerArmor.includes('loriga') || lowerArmor.includes('escamas') || lowerArmor.includes('couraça') || lowerArmor.includes('couraca')) armorBaseAc = 14;
      else armorBaseAc = 15;

      armorBaseAc += magicEnhancement;
      const hasMediumMaster = feats.includes('Medium Armor Master') || feats.includes('Mestre em Armadura Média');
      const maxDex = hasMediumMaster ? 3 : 2;
      armorDexBonus = Math.min(maxDex, dexMod);

      candidates.push({
        name: `Armadura Média (${armorName})`,
        calcStr: `CA Base da Armadura (${armorBaseAc - magicEnhancement}${magicEnhancement ? ` +${magicEnhancement} mágica` : ''}) + Mod. Destreza (máx +${maxDex}, obtido: ${dexMod >= 0 ? '+' : ''}${dexMod} -> usará ${armorDexBonus >= 0 ? '+' : ''}${armorDexBonus})`,
        acValue: armorBaseAc + armorDexBonus,
        armorType: 'medium',
        allowsShield: true,
        requiresNoArmor: false,
        armorDexBonus,
      });
    } else {
      if (lowerArmor.includes('anéis') || lowerArmor.includes('aneis')) armorBaseAc = 14;
      else if (lowerArmor.includes('cota de malha')) armorBaseAc = 16;
      else if (lowerArmor.includes('talas')) armorBaseAc = 17;
      else armorBaseAc = 18;

      armorBaseAc += magicEnhancement;
      armorDexBonus = 0;

      candidates.push({
        name: `Armadura Pesada (${armorName})`,
        calcStr: `CA Base da Armadura (${armorBaseAc - magicEnhancement}${magicEnhancement ? ` +${magicEnhancement} mágica` : ''}) [Ignora Modificador de Destreza]`,
        acValue: armorBaseAc,
        armorType: 'heavy',
        allowsShield: true,
        requiresNoArmor: false,
        armorDexBonus: 0,
      });
    }
  }

  candidates.sort((a, b) => b.acValue - a.acValue);
  const chosenBase = candidates[0] || {
    name: 'Sem Armadura (Padrão)',
    calcStr: `10 + Mod. Destreza (${dexMod >= 0 ? '+' : ''}${dexMod})`,
    acValue: 10 + dexMod,
    armorType: 'none',
    allowsShield: true,
    requiresNoArmor: false,
    armorDexBonus: dexMod,
  };

  return { candidates, chosenBase, armorDexBonus };
}
