export interface InventoryItem {
  id?: string;
  name: string;
  quantity?: number;
  equipped: boolean;
  charges?: number;
  maxCharges?: number;
  equip_slot?: string | null;
}

export interface LootItem {
  id: string;
  name: string;
  type: 'weapon' | 'armor' | 'potion' | 'gold' | 'scroll' | 'misc';
  rarity: 'comum' | 'incomum' | 'raro' | 'lendário';
  value: number; // valor em PO
  description: string;
  bonusHp?: number;
  bonusAc?: number;
  bonusAttack?: number;
  icon: string;
  quantity?: number;
}

export interface ItemPriceInfo {
  basePricePO: number;
  sellPricePO: number;
  costStr: string;
  category: string;
}

export interface ShopCatalogItem {
  id?: string;
  name: string;
  category: string;
  cost: string;
  pricePO: number;
  sellPricePO: number;
  weight?: string;
  damage?: string;
  armor_class?: string;
  properties?: string;
}

export interface ItemCatalogData {
  id: string;
  name: string;
  category: string | null;
  cost: string | null;
  weight: string | null;
  properties: string | null;
  damage: string | null;
  stealth: string | null;
  usable_location: string | null;
  ammunition_type: string | null;
  armor_class: string | null;
  created_at?: string | null;
}
