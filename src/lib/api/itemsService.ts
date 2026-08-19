import { supabase, isSupabaseConfigured } from './supabase';
import { EQUIPMENT_REFERENCE, EquipmentInfo } from '../../lib/api/references';
import { singularizeItemName } from '../mechanics/equipmentParser';

export interface DbItem extends EquipmentInfo {
  id?: string;
  usable_location?: string;
}

let cachedEquipmentMap: Record<string, DbItem> = {};
let cachedEquipmentByIdMap: Record<string, DbItem> = {};

// Initialize with local reference so it is always available immediately
Object.entries(EQUIPMENT_REFERENCE).forEach(([key, info]) => {
  cachedEquipmentMap[key] = {
    ...info,
    usable_location: getUsableLocation(info.name || key, info.category || '')
  };
});

let isLoadedFromDb = false;

export function getUsableLocation(name: string, category: string): string {
  const lowerName = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const lowerCat = category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const baseName = lowerName.split(/[-:(]/)[0].trim();
  if (!lowerName.includes('oleo') && !lowerName.includes('oil') && (lowerCat.includes('ilumina') || /tocha|lanterna|lampada|vela/.test(baseName))) return 'Uma das Mãos (Iluminação)';
  if (lowerName.includes('capacete') || lowerName.includes('elmo')) return 'Cabeça';
  if (lowerName.includes('óculos') || lowerName.includes('oculos')) return 'Olhos';
  if (lowerName.includes('colar') || lowerName.includes('amuleto')) return 'Pescoço';
  if (lowerName.includes('capa') || lowerName.includes('manto')) return 'Costas';
  if (lowerName.includes('túnica') || lowerName.includes('tunica') || lowerName.includes('roupa')) return 'Corpo / Vestimenta';
  if (lowerName.includes('braçadeira') || lowerName.includes('bracadeira')) return 'Braços';
  if (lowerName.includes('luva')) return 'Mãos / Luvas';
  if (lowerName.includes('cinto')) return 'Cinturão';
  if (lowerName.includes('bota') || lowerName.includes('sapato')) return 'Pés';
  if (lowerName.includes('anel 1')) return 'Anel Esquerdo';
  if (lowerName.includes('anel 2')) return 'Anel Direito';
  if (lowerCat.includes('armadura')) return 'Torso (Armadura)';
  if (lowerCat.includes('escudo')) return 'Mão Secundária (Escudo)';
  if (lowerCat.includes('arma') || lowerName.includes('espada') || lowerName.includes('adaga') || lowerName.includes('arco') || lowerName.includes('besta') || lowerName.includes('machado') || lowerName.includes('martelo') || lowerName.includes('lança') || lowerName.includes('maça') || lowerName.includes('alabarda') || lowerName.includes('clava') || lowerName.includes('foice') || lowerName.includes('funda') || lowerName.includes('glaive') || lowerName.includes('malho') || lowerName.includes('mangual') || lowerName.includes('mosquete') || lowerName.includes('picareta') || lowerName.includes('pistola') || lowerName.includes('rapieira') || lowerName.includes('tridente') || lowerName.includes('zarabatana')) return 'Mão Principal / Duas Mãos (Arma)';
  if (lowerCat.includes('teste')) return 'Decorativo / Geral';
  return 'Inventário Geral / Mochila';
}

export async function fetchItemsFromDb(alreadyTriedSeeding = false): Promise<Record<string, DbItem>> {
  if (!isSupabaseConfigured) {
    return cachedEquipmentMap;
  }
  try {
    const { data, error } = await supabase.from('items').select('*');
    if (error) {
      console.warn('Aviso: Não foi possível carregar itens do banco, usando fallback local:', error.message);
      return cachedEquipmentMap;
    }
    if (data && data.length > 0) {
      // Banco de dados é a fonte da verdade: constrói o mapa APENAS com os itens do banco de dados!
      const map: Record<string, DbItem> = {};
      const byIdMap: Record<string, DbItem> = {};
      data.forEach((item: any) => {
        const localRef = EQUIPMENT_REFERENCE[item.name];
        const dbItem: DbItem = {
          id: item.id,
          name: item.name,
          category: item.category,
          cost: item.cost,
          weight: item.weight,
          properties: item.properties,
          damage: item.damage,
          armor_class: item.armor_class,
          stealth: item.stealth,
          items: localRef?.items,
          usable_location: item.usable_location || getUsableLocation(item.name, item.category || '')
        };
        map[item.name] = dbItem;
        if (item.id) {
          byIdMap[item.id] = dbItem;
        }
      });
      cachedEquipmentMap = map;
      cachedEquipmentByIdMap = byIdMap;
      isLoadedFromDb = true;

      return map;
    } else {
      console.warn('Aviso: A tabela public.items está vazia no banco de dados.');
      return cachedEquipmentMap;
    }
  } catch (err) {
    console.warn('Erro ao conectar ao banco de itens:', err);
    return cachedEquipmentMap;
  }
}

export function getCachedEquipmentReference(): Record<string, DbItem> {
  return cachedEquipmentMap;
}

export function getItemById(id: string): DbItem | undefined {
  if (!id) return undefined;
  return cachedEquipmentByIdMap[id];
}

export function getItemNameById(id: string): string | undefined {
  if (!id) return undefined;
  return cachedEquipmentByIdMap[id]?.name;
}

export function getItemIdByName(name: string): string | undefined {
  if (!name) return undefined;
  
  const trimmed = name.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trimmed);
  if (isUuid) {
    if (cachedEquipmentByIdMap[trimmed]?.id) return cachedEquipmentByIdMap[trimmed].id;
    return trimmed;
  }

  // Clean leading emojis and quantity markers
  const cleanName = trimmed
    .replace(/^[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{200D}\s]+/u, '')
    .replace(/^\d+x?\s*/i, '')
    .replace(/\s*\(\d+\)$/, '')
    .trim();

  // 1. Direct match or case-insensitive match on cached keys
  let key = Object.keys(cachedEquipmentMap).find(k => k.toLowerCase() === cleanName.toLowerCase());
  if (key && cachedEquipmentMap[key]?.id) {
    return cachedEquipmentMap[key].id;
  }

  // 2. Try singularized name
  const singular = singularizeItemName(cleanName);
  if (singular && singular.toLowerCase() !== cleanName.toLowerCase()) {
    key = Object.keys(cachedEquipmentMap).find(k => k.toLowerCase() === singular.toLowerCase());
    if (key && cachedEquipmentMap[key]?.id) {
      return cachedEquipmentMap[key].id;
    }
  }

  // 3. Partial match fallback
  const partialKey = Object.keys(cachedEquipmentMap).find(k => 
    k.toLowerCase().includes(cleanName.toLowerCase()) || cleanName.toLowerCase().includes(k.toLowerCase()) ||
    (singular && (k.toLowerCase().includes(singular.toLowerCase()) || singular.toLowerCase().includes(k.toLowerCase())))
  );
  return partialKey ? cachedEquipmentMap[partialKey]?.id : undefined;
}

export async function findOrFetchItemIdByName(name: string): Promise<string | null> {
  if (!name) return null;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(name.trim());
  if (isUuid) return name.trim();

  // Try cached lookup first
  const cachedId = getItemIdByName(name);
  if (cachedId) return cachedId;

  if (!isSupabaseConfigured) return null;

  const cleanName = name
    .replace(/^[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE0F}\u{200D}\s]+/u, '')
    .replace(/^\d+x?\s*/i, '')
    .replace(/\s*\(\d+\)$/, '')
    .trim();

  if (!cleanName) return null;
  const singular = singularizeItemName(cleanName);

  try {
    // Query Supabase items table directly with cleanName or singular
    const { data } = await supabase
      .from('items')
      .select('id, name')
      .or(`name.ilike.${cleanName}${singular && singular !== cleanName ? `,name.ilike.${singular}` : ''}`)
      .limit(1);

    const itemsData = data as any[];
    if (itemsData && itemsData.length > 0) {
      return itemsData[0].id;
    }

    // Try substring search in database
    const searchTerm = singular || cleanName;
    const { data: subData } = await supabase
      .from('items')
      .select('id, name')
      .ilike('name', `%${searchTerm}%`)
      .limit(1);

    const subItemsData = subData as any[];
    if (subItemsData && subItemsData.length > 0) {
      return subItemsData[0].id;
    }
  } catch (e) {
    console.warn("Erro ao buscar item_id no Supabase para:", name, e);
  }

  return null;
}

