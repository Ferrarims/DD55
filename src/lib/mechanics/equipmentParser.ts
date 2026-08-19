import { getItemNameById } from '../api/itemsService';

const KNOWN_PLURALS: Record<string, string> = {
  'Adaga': 'Adagas',
  'Machadinha': 'Machadinhas',
  'Azagaia': 'Azagaias',
  'Machado Grande': 'Machados Grandes',
  'Machado de Batalha': 'Machados de Batalha',
  'Espada Curta': 'Espadas Curtas',
  'Espada Longa': 'Espadas Longas',
  'Espada Grande': 'Espadas Grandes',
  'Arco Curto': 'Arcos Curtos',
  'Arco Longo': 'Arcos Longos',
  'Besta Leve': 'Bestas Leves',
  'Besta Pesada': 'Bestas Pesadas',
  'Besta de Mão': 'Bestas de Mão',
  'Cimitarra': 'Cimitarras',
  'Foice': 'Foices',
  'Foice Curta': 'Foices Curtas',
  'Lança': 'Lanças',
  'Maça': 'Maças',
  'Maça Estrela': 'Maças Estrela',
  'Mangual': 'Manguais',
  'Cajado': 'Cajados',
  'Escudo': 'Escudos',
  'Flecha': 'Flechas',
  'Virote de Besta': 'Virotes de Besta',
  'Poção de Cura': 'Poções de Cura',
  'Pergaminho': 'Pergaminhos',
  'Túnica': 'Túnicas',
  'Livro': 'Livros',
  'Símbolo Sagrado': 'Símbolos Sagrados',
  'Instrumento Musical': 'Instrumentos Musicais',
  'Equipamento de Aventura': 'Equipamentos de Aventura',
  'Pacote de Aventureiro': 'Pacotes de Aventureiro',
  'Pacote de Explorador': 'Pacotes de Explorador',
  'Pacote de Ladrão': 'Pacotes de Ladrão',
  'Pacote de Sacerdote': 'Pacotes de Sacerdote',
  'Pacote de Estudioso': 'Pacotes de Estudioso',
  'Kit de Ferramentas': 'Kits de Ferramentas',
  'Kit de Artista': 'Kits de Artista',
  'Kit de Herbalismo': 'Kits de Herbalismo',
  'Kit de Falsificação': 'Kits de Falsificação',
  'Ferramentas de Artesão': 'Ferramentas de Artesão',
  'Ferramentas de Ladrão': 'Ferramentas de Ladrão',
  'Suprimentos de Calígrafo': 'Suprimentos de Calígrafo',
  'Roupas de Viagem': 'Roupas de Viagem',
  'Roupas de Frio': 'Roupas de Frio',
  'Roupas Finas': 'Roupas Finas',
  'Roupas Comuns': 'Roupas Comuns',
  'Roupas Escuras': 'Roupas Escuras',
  'Ração de Viagem': 'Rações de Viagem',
};

export function singularizeItemName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();
  if (trimmed.includes('(') || trimmed.includes(')')) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();
  
  if (lower.startsWith('roupa ') || lower.startsWith('roupas ')) {
    if (lower.includes('viagem') || lower.includes('viajante')) return 'Roupas de Viagem';
    if (lower.includes('frio') || lower.includes('inverno')) return 'Roupas de Frio';
    if (lower.includes('fina')) return 'Roupas Finas';
    if (lower.includes('comum') || lower.includes('comuns')) return 'Roupas Comuns';
    if (lower.includes('escura') || lower.includes('escuras')) return 'Roupas Escuras';
    return trimmed;
  }

  if (lower === 'rações' || lower === 'racoes' || lower === 'ração' || lower === 'racao' || lower === 'rações de viagem' || lower === 'racoes de viagem') {
    return 'Ração de Viagem';
  }

  if (lower === 'virote' || lower === 'virotes' || lower === 'virote de besta' || lower === 'virotes de besta') {
    return 'Virote de Besta';
  }

  const foundKey = Object.keys(KNOWN_PLURALS).find(
    k => KNOWN_PLURALS[k].toLowerCase() === trimmed.toLowerCase()
  );
  if (foundKey) {
    return foundKey;
  }

  const words = trimmed.split(' ');
  const singularWords = words.map((word, index) => {
    const wLower = word.toLowerCase();
    if (index > 0 && ['de', 'da', 'do', 'dos', 'das', 'com', 'para', 'e', 'em'].includes(wLower)) {
      return word;
    }
    if (wLower.endsWith('ões')) {
      return word.slice(0, -3) + 'ão';
    }
    if (wLower.endsWith('ais') || wLower.endsWith('eis') || wLower.endsWith('ois') || wLower.endsWith('uis')) {
      return word.slice(0, -2) + 'l';
    }
    if (wLower.endsWith('ns')) {
      return word.slice(0, -2) + 'm';
    }
    if (wLower.endsWith('es') && word.length > 3) {
      return word.slice(0, -2);
    }
    if (wLower.endsWith('s') && !wLower.endsWith('ss')) {
      return word.slice(0, -1);
    }
    return word;
  });

  return singularWords.join(' ');
}

export function pluralizeItemName(name: string): string {
  if (!name) return '';
  const trimmed = name.trim();

  // If already contains parentheses or digits or is currency, return as is
  if (trimmed.includes('(') || trimmed.includes(')')) {
    return trimmed;
  }

  // Exact match in KNOWN_PLURALS
  if (KNOWN_PLURALS[trimmed]) {
    return KNOWN_PLURALS[trimmed];
  }

  // Case insensitive check
  const lower = trimmed.toLowerCase();
  const foundKey = Object.keys(KNOWN_PLURALS).find(k => k.toLowerCase() === lower);
  if (foundKey) {
    return KNOWN_PLURALS[foundKey];
  }

  // Generic multi-word / single-word Portuguese plural logic
  const words = trimmed.split(' ');
  const pluralizedWords = words.map((word, index) => {
    const wLower = word.toLowerCase();

    // Prepositions/conjunctions stay unchanged
    if (index > 0 && ['de', 'da', 'do', 'dos', 'das', 'com', 'para', 'e', 'em'].includes(wLower)) {
      return word;
    }

    if (wLower.endsWith('s')) {
      return word;
    }

    if (wLower.endsWith('al') || wLower.endsWith('el') || wLower.endsWith('ol') || wLower.endsWith('ul')) {
      return word.slice(0, -1) + 'is';
    }
    if (wLower.endsWith('m')) {
      return word.slice(0, -1) + 'ns';
    }
    if (wLower.endsWith('r') || wLower.endsWith('z')) {
      return word + 'es';
    }
    if (wLower.endsWith('ão')) {
      return word.slice(0, -2) + 'ões';
    }
    if (/[aeiouãéêáóôíú]$/i.test(word)) {
      return word + 's';
    }

    return word;
  });

  return pluralizedWords.join(' ');
}

export function formatItemWithQuantity(name: string, quantity: number): string {
  if (!name) return '';
  const trimmed = name.trim();
  const qty = quantity || 1;

  if (['PO', 'PP', 'PC', 'PE', 'PL'].includes(trimmed.toUpperCase())) {
    return `${qty} ${trimmed.toUpperCase()}`;
  }

  if (qty <= 1) {
    return trimmed;
  }

  const pluralName = pluralizeItemName(trimmed);
  return `${qty} ${pluralName}`;
}

export function parseItemStringWithQuantity(str: string): string {
  if (!str || typeof str !== 'string') return '';
  const trimmed = str.trim();

  // Check if string starts with number e.g. "2 Adaga" or "4 Machadinha"
  const match = trimmed.match(/^(\d+)\s+(.+)$/);
  if (match) {
    const qty = parseInt(match[1], 10);
    const itemName = match[2].trim();
    if (['PO', 'PP', 'PC', 'PE', 'PL'].includes(itemName.toUpperCase())) {
      return `${qty} ${itemName.toUpperCase()}`;
    }
    return formatItemWithQuantity(itemName, qty);
  }

  return trimmed;
}

export function extractEquipmentChoiceItems(equipmentData: any, choice: string): string[] {
  if (!equipmentData) return [];

  let parsed = equipmentData;
  if (typeof equipmentData === 'string') {
    try {
      parsed = JSON.parse(equipmentData);
    } catch {
      return [parseItemStringWithQuantity(equipmentData)];
    }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return [parseItemStringWithQuantity(String(parsed))];
  }

  const resolveItemString = (item: any): string => {
    if (typeof item === 'string') return parseItemStringWithQuantity(item);
    if (item && typeof item === 'object') {
      let resolvedName = item.id ? getItemNameById(item.id) : undefined;
      if (!resolvedName && item.name) {
        resolvedName = item.name;
      }
      if (resolvedName) {
        return formatItemWithQuantity(resolvedName, item.quantity || 1);
      }
    }
    return String(item || '');
  };

  // If parsed is an array directly
  if (Array.isArray(parsed)) {
    return parsed.map(resolveItemString);
  }

  const itemsList: any[] = [];
  if (parsed[choice] && Array.isArray(parsed[choice])) {
    itemsList.push(...parsed[choice]);
  } else if (typeof parsed[choice] === 'string') {
    return [parseItemStringWithQuantity(parsed[choice])];
  }

  if (parsed.default && Array.isArray(parsed.default)) {
    itemsList.push(...parsed.default);
  }

  if (itemsList.length === 0) {
    if (typeof parsed[choice] === 'string') return [parseItemStringWithQuantity(parsed[choice])];
    return [];
  }

  return itemsList.map(resolveItemString);
}

export function formatEquipmentChoiceDescription(equipmentData: any, choice: string): string {
  if (!equipmentData) return '';
  if (typeof equipmentData === 'string') return parseItemStringWithQuantity(equipmentData);

  const extracted = extractEquipmentChoiceItems(equipmentData, choice);
  if (extracted.length === 0) {
    if (typeof equipmentData[choice] === 'string') return parseItemStringWithQuantity(equipmentData[choice]);
    return choice === 'B' ? '50 PO' : 'Equipamento Padrão';
  }

  if (extracted.length === 1) return extracted[0];
  if (extracted.length === 2) return `${extracted[0]} e ${extracted[1]}`;

  const last = extracted[extracted.length - 1];
  const initial = extracted.slice(0, extracted.length - 1).join(', ');
  return `${initial} e ${last}`;
}
