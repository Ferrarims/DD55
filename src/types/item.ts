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
  type: 'weapon' | 'armor' | 'potion' | 'gold' | 'scroll';
  rarity: 'comum' | 'incomum' | 'raro' | 'lendário';
  value: number; // valor em PO
  description: string;
  bonusHp?: number;
  bonusAc?: number;
  bonusAttack?: number;
  icon: string;
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
