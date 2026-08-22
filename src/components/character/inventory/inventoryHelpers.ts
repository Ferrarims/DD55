import { getCachedEquipmentReference } from '../../../lib/api/itemsService';

export const stripLeadingEmoji = (name: string): string => {
  if (!name || typeof name !== 'string') return '';
  return name.replace(/^[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{200D}\s]+/u, '').trim();
};

export const getWeaponMastery = (name: string): string | null => {
  const lowerName = name.toLowerCase();

  // 1. Cleave (Fender)
  if (
    lowerName.includes('machado grande') ||
    lowerName.includes('glaive') ||
    lowerName.includes('alabarda')
  ) {
    return 'Cleave (Fender)';
  }

  // 2. Graze (Rozar)
  if (
    lowerName.includes('espada grande') ||
    lowerName.includes('espada longa')
  ) {
    return 'Graze (Rozar)';
  }

  // 3. Topple (Derrubar)
  if (
    lowerName.includes('machado de batalha') ||
    lowerName.includes('bordão') ||
    lowerName.includes('cajado') ||
    lowerName.includes('malho') ||
    lowerName.includes('tridente') ||
    lowerName.includes('lança de montaria') ||
    lowerName.includes('lanca de montaria')
  ) {
    return 'Topple (Derrubar)';
  }

  // 4. Push (Empurrar)
  if (
    lowerName.includes('besta pesada') ||
    lowerName.includes('martelo de guerra') ||
    lowerName.includes('clava grande') ||
    lowerName.includes('lança longa') ||
    lowerName.includes('lanca longa')
  ) {
    return 'Push (Empurrar)';
  }

  // 5. Nick (Corte Rápido)
  if (
    lowerName.includes('adaga') ||
    lowerName.includes('cimitarra') ||
    lowerName.includes('foice') ||
    lowerName.includes('martelo leve')
  ) {
    return 'Nick (Corte Rápido)';
  }

  // 6. Sap (Enfraquecer)
  if (
    lowerName.includes('maça estrela') ||
    lowerName.includes('maca estrela') ||
    lowerName.includes('maça') ||
    lowerName.includes('maca') ||
    lowerName.includes('mangual') ||
    lowerName.includes('lança') ||
    lowerName.includes('lanca') ||
    lowerName.includes('picareta de guerra')
  ) {
    return 'Sap (Enfraquecer)';
  }

  // 7. Slow (Lentidão)
  if (
    lowerName.includes('azagaia') ||
    lowerName.includes('arco longo') ||
    lowerName.includes('besta leve') ||
    lowerName.includes('chicote') ||
    lowerName.includes('clava') ||
    lowerName.includes('funda') ||
    lowerName.includes('mosquete')
  ) {
    return 'Slow (Lentidão)';
  }

  // 8. Vex (Vexar)
  if (
    lowerName.includes('machadinha') ||
    lowerName.includes('espada curta') ||
    lowerName.includes('rapieira') ||
    lowerName.includes('arco curto') ||
    lowerName.includes('dardo') ||
    lowerName.includes('besta de mão') ||
    lowerName.includes('besta de mao') ||
    lowerName.includes('pistola') ||
    lowerName.includes('zarabatana')
  ) {
    return 'Vex (Vexar)';
  }

  return null;
};

export const getWeaponMasteryDescription = (name: string): string => {
  const n = (name || '').toLowerCase();
  if (n.includes('cleave') || n.includes('trespassar') || n.includes('fender')) {
    return "Trespassar: Ao acertar um ataque corpo a corpo, você pode realizar um ataque adicional contra outra criatura adjacente no alcance de 1,5m que ainda não tenha sido atingida neste turno (causa dano do dado da arma sem modificador).";
  }
  if (n.includes('graze') || n.includes('rozar') || n.includes('arranhão') || n.includes('arranhao')) {
    return "Arranhão (Garantido): Se você errar um ataque corpo a corpo com esta arma, você ainda causa dano igual ao modificador do seu atributo de ataque (mínimo de 1) ao alvo.";
  }
  if (n.includes('vex') || n.includes('vexar') || n.includes('afligir')) {
    return "Afligir: Se você acertar um ataque com esta arma, você ganha Vantagem na sua próxima jogada de ataque contra o mesmo alvo antes do final do seu próximo turno.";
  }
  if (n.includes('nick') || n.includes('corte rápido') || n.includes('ágil') || n.includes('agil')) {
    return "Ágil: Quando você realiza um ataque com uma arma Leve como parte de sua Ação, você pode fazer o ataque adicional da arma leve como parte da mesma ação em vez de usar sua Ação Bônus.";
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
};

export const getRefInfo = (cleanName: string) => {
  const EQUIPMENT_REFERENCE = getCachedEquipmentReference();
  const stackMatch = cleanName.match(/^(.*?) \((\d+)\)$/);
  let baseName = cleanName;
  let hasStack = false;
  if (stackMatch) {
    baseName = stackMatch[1].trim();
    hasStack = true;
  }
  let matchedKey = Object.keys(EQUIPMENT_REFERENCE).find(
    key => key.toLowerCase() === cleanName.toLowerCase()
  );
  if (!matchedKey && hasStack) {
    matchedKey = Object.keys(EQUIPMENT_REFERENCE).find(key => {
      const keyStackMatch = key.match(/^(.*?) \((\d+)\)$/);
      if (keyStackMatch) {
        return keyStackMatch[1].trim().toLowerCase() === baseName.toLowerCase();
      }
      return key.toLowerCase() === baseName.toLowerCase();
    });
  }
  if (!matchedKey) {
    matchedKey = Object.keys(EQUIPMENT_REFERENCE).find(
      key => key !== 'Equipamento de Aventura' && (cleanName.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(cleanName.toLowerCase()))
    );
  }
  return matchedKey ? EQUIPMENT_REFERENCE[matchedKey] : null;
};

export const shortenCategory = (category: string): string => {
  if (!category) return '';
  let cat = category;
  cat = cat.replace('Armas Marciais Corpo a Corpo', 'Marcial Corpo a Corpo');
  cat = cat.replace('Armas Simples Corpo a Corpo', 'Simples Corpo a Corpo');
  cat = cat.replace('Armas Marciais de Longo Alcance', 'Marcial Dist.');
  cat = cat.replace('Armas Simples de Longo Alcance', 'Simples Dist.');
  cat = cat.replace('Armadura Pesada', 'Pesada');
  cat = cat.replace('Armadura Média', 'Média');
  cat = cat.replace('Armadura Leve', 'Leve');
  cat = cat.replace('Equipamento de Aventura', 'Aventura');
  return cat;
};
