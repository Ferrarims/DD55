export function getWeaponMasteryDescription(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('cleave') || n.includes('trespassar') || n.includes('fender')) {
    return "Trespassar: Se você acertar uma criatura com um ataque corpo a corpo usando esta arma, você pode fazer um segundo ataque contra uma segunda criatura adjacente ao primeiro alvo e dentro do seu alcance.";
  }
  if (n.includes('graze') || n.includes('raspar') || n.includes('arranhão') || n.includes('arranhao')) {
    return "Arranhão (Garantido): Se a sua jogada de ataque com esta arma errar a criatura, você ainda causa dano igual ao modificador do seu atributo de ataque (mínimo de 1) ao alvo.";
  }
  if (n.includes('vex') || n.includes('vexar') || n.includes('afligir')) {
    return "Afligir: Se você acertar um ataque com esta arma, você ganha Vantagem na sua próxima jogada de ataque contra o mesmo alvo antes do final do seu próximo turno.";
  }
  if (n.includes('nick') || n.includes('corte rápido') || n.includes('ágil') || n.includes('agil')) {
    return "Ágil: Quando você faz um ataque com uma arma Leve como parte de sua Ação, você pode fazer o ataque adicional da arma leve como parte da mesma ação em vez de usar sua Ação Bônus.";
  }
  if (n.includes('sap') || n.includes('enfraquecer')) {
    return "Enfraquecer: Se você acertar uma criatura com esta arma, o alvo sofre Desvantagem na próxima jogada de ataque que ele fizer antes do início do seu próximo turno.";
  }
  if (n.includes('slow') || n.includes('lentidão') || n.includes('lentidao')) {
    return "Lentidão: Se você acertar uma criatura com esta arma, o deslocamento dela é reduzido em 3 metros até o início do seu próximo turno.";
  }
  if (n.includes('topple') || n.includes('derrubar')) {
    return "Derrubar: Se você acertar uma criatura com esta arma, você pode forçar o alvo a fazer um Teste de Resistência de Constituição. Se falhar, o alvo cai Caído.";
  }
  if (n.includes('push') || n.includes('empurrar')) {
    return "Empurrar: Se você acertar uma criatura com esta arma, você pode empurrá-la até 3 metros de distância em linha reta.";
  }
  return `Maestria de Arma (${name}): Propriedade especial da arma aplicada automaticamente ao acertar ataques.`;
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

  if (props.includes('arremesso') || props.includes('thrown') || rangeStr.includes('arremesso') || rangeStr.includes('thrown')) {
    return true;
  }

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
