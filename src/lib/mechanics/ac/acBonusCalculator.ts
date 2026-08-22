import { blocksShield } from './acWeaponClassification';
import { BaseCandidate } from './acBaseCandidates';

interface ComputeShieldAndBonusesParams {
  shieldName: string | null;
  chosenBase: BaseCandidate;
  selectedWeaponName?: string | null;
  slots: Record<string, string | null>;
  items: any[];
  versatileTwoHanded?: boolean;
  equippedRing?: string | null;
  fightingStyle?: string | null;
  dualWieldingActive?: boolean;
  feats: string[];
  coverType?: 'none' | 'half' | 'threeQuarters';
}

export interface ShieldAndBonusesResult {
  hasShield: boolean;
  shieldActive: boolean;
  shieldBonus: number;
  twoHandedWeaponBlockedShield: boolean;
  otherBonuses: number;
  aditivosConstantes: string[];
  conflictAlerts: string[];
}

export function computeShieldAndBonuses({
  shieldName,
  chosenBase,
  selectedWeaponName,
  slots,
  items,
  versatileTwoHanded,
  equippedRing,
  fightingStyle,
  dualWieldingActive,
  feats,
  coverType = 'none',
}: ComputeShieldAndBonusesParams): ShieldAndBonusesResult {
  const conflictAlerts: string[] = [];
  const aditivosConstantes: string[] = [];

  const hasShield = Boolean(shieldName);
  let shieldActive = false;
  let shieldBonus = 0;
  let twoHandedWeaponBlockedShield = false;

  let weaponBlocksShield = false;
  const checkBlocksShield = (wName: string | null | undefined) => {
    if (!wName) return false;
    return blocksShield(wName);
  };

  const getItemName = (item: any): string => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.name || item.items?.name || '';
  };

  if (selectedWeaponName) {
    weaponBlocksShield = checkBlocksShield(selectedWeaponName);
  } else if (slots['empunhadura_1'] && checkBlocksShield(slots['empunhadura_1'])) {
    weaponBlocksShield = true;
  } else if (slots['empunhadura_2'] && checkBlocksShield(slots['empunhadura_2'])) {
    weaponBlocksShield = true;
  } else if (Array.isArray(items)) {
    weaponBlocksShield = items.some(item => {
      if (typeof item === 'string') return false;
      if (!item || item.equipped !== true) return false;
      const n = getItemName(item);
      return checkBlocksShield(n);
    });
  }

  if (versatileTwoHanded) {
    weaponBlocksShield = true;
  }

  if (hasShield) {
    if (!chosenBase.allowsShield) {
      conflictAlerts.push(`Escudo ignorado: A fórmula base "${chosenBase.name}" não permite o uso de escudos (ex: Monge).`);
    } else if (weaponBlocksShield) {
      twoHandedWeaponBlockedShield = true;
      conflictAlerts.push(`Escudo inativo (+0): Bestas (mão, leve, pesada) e armas de duas mãos não podem ser usadas com escudos.`);
    } else {
      shieldActive = true;
      shieldBonus = 2;
      const lowerS = (shieldName || '').toLowerCase();
      if (lowerS.includes('+3')) shieldBonus = 5;
      else if (lowerS.includes('+2')) shieldBonus = 4;
      else if (lowerS.includes('+1')) shieldBonus = 3;
      aditivosConstantes.push(`Escudo (${shieldName}): +${shieldBonus} na CA`);
    }
  }

  let otherBonuses = 0;
  const isDecorativeOrTest = (name: string): boolean => {
    const n = name.toLowerCase();
    return n.includes('teste') || n.includes('decorativo') || n.includes('comum') || n.includes('pano') || n.includes('lã') || n.includes('lenco');
  };

  const ringsToCheck = [slots['dedo_anel_1'], slots['dedo_anel_2'], equippedRing].filter(Boolean);
  ringsToCheck.forEach(ring => {
    if (!ring || isDecorativeOrTest(ring)) return;
    const lowerR = ring.toLowerCase();
    if (lowerR.includes('proteção') || lowerR.includes('protecao') || lowerR.includes('protection') || lowerR.includes('+1') || lowerR.includes('+2') || lowerR.includes('+3')) {
      const bonus = lowerR.includes('+3') ? 3 : lowerR.includes('+2') ? 2 : 1;
      otherBonuses += bonus;
      aditivosConstantes.push(`Item Maravilhoso (${ring}): +${bonus} na CA`);
    }
  });

  const cloakToCheck = slots['ombros_costas'];
  if (cloakToCheck && !isDecorativeOrTest(cloakToCheck)) {
    const lowerC = cloakToCheck.toLowerCase();
    if (lowerC.includes('proteção') || lowerC.includes('protecao') || lowerC.includes('protection') || lowerC.includes('manto de proteção') || lowerC.includes('+1') || lowerC.includes('+2') || lowerC.includes('+3')) {
      const bonus = lowerC.includes('+3') ? 3 : lowerC.includes('+2') ? 2 : 1;
      otherBonuses += bonus;
      aditivosConstantes.push(`Item Maravilhoso (${cloakToCheck}): +${bonus} na CA`);
    }
  }

  const bracersToCheck = slots['bracos_pulsos'];
  if (bracersToCheck && !isDecorativeOrTest(bracersToCheck)) {
    const lowerB = bracersToCheck.toLowerCase();
    if (lowerB.includes('defesa') || lowerB.includes('bracadeiras de defesa') || lowerB.includes('bracadeira de defesa')) {
      if (chosenBase.armorType === 'none') {
        const bonus = 2;
        otherBonuses += bonus;
        aditivosConstantes.push(`Braçadeiras de Defesa (${bracersToCheck}): +${bonus} na CA`);
      } else {
        conflictAlerts.push(`Braçadeiras de Defesa ignoradas: Exigem que o personagem não vista armadura.`);
      }
    }
  }

  const style = (fightingStyle || '').toLowerCase();
  if (style.includes('defensivo') || style.includes('defense') || style.includes('defesa')) {
    if (chosenBase.armorType !== 'none') {
      otherBonuses += 1;
      aditivosConstantes.push(`Estilo de Luta (Defesa): +1 na CA`);
    } else {
      conflictAlerts.push(`Estilo de Luta Defesa ignorado pois o personagem não veste armadura.`);
    }
  }

  if (dualWieldingActive || feats.includes('Dual Wielder') || feats.includes('Empunhadura Dupla')) {
    otherBonuses += 1;
    aditivosConstantes.push(`Talento Empunhadura Dupla (Dual Wielder): +1 na CA`);
  }

  if (coverType === 'half') {
    otherBonuses += 2;
    aditivosConstantes.push(`Cobertura (Meia-cobertura): +2 na CA`);
  } else if (coverType === 'threeQuarters') {
    otherBonuses += 5;
    aditivosConstantes.push(`Cobertura (Cobertura 3/4): +5 na CA`);
  }

  return {
    hasShield,
    shieldActive,
    shieldBonus,
    twoHandedWeaponBlockedShield,
    otherBonuses,
    aditivosConstantes,
    conflictAlerts,
  };
}
