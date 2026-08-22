import { InventoryItem } from '../../../types/item';
import { CharacterInventoryItem } from '../../../types/character';

export type ACCalculationInventoryItem =
  | string
  | InventoryItem
  | CharacterInventoryItem
  | {
      name?: string;
      equipped?: boolean;
      equip_slot?: string | null;
      items?: { name?: string } | null;
      [key: string]: any;
    };

export interface ACCalculationParams {
  charClass: string;
  stats: {
    str?: number;
    dex: number;
    con?: number;
    int?: number;
    wis?: number;
    cha?: number;
  };
  equippedArmor?: string | null;
  equippedShield?: string | null;
  equippedRing?: string | null;
  fightingStyle?: string | null;
  inventoryItems?: ACCalculationInventoryItem[];
  selectedWeaponName?: string | null;
  equipmentSlots?: Record<string, string | null>;
  feats?: string[];
  activeSpells?: string[];
  coverType?: 'none' | 'half' | 'threeQuarters';
  dualWieldingActive?: boolean;
  versatileTwoHanded?: boolean;
}

export interface ACCalculationResult {
  armor_class: number;
  ac: number;
  finalAc: number;
  baseAc: number;
  dexBonus: number;
  armorName: string | null;
  armorType: 'none' | 'light' | 'medium' | 'heavy';
  hasShield: boolean;
  shieldActive: boolean;
  shieldBonus: number;
  twoHandedWeaponBlockedShield: boolean;
  otherBonuses: number;
  
  formulaBaseEscolhida: string;
  aditivosConstantes: string[];
  alertasDeConflito: string[];
  explanation: string;
}
