import { getItemNameById } from '../../api/itemsService';
import {
  formatItemWithQuantity,
  parseItemStringWithQuantity,
} from './itemNameInflector';

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
