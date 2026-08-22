import React from 'react';
import { getItemWeight, parseWeightToKg, getItemPriceInfo } from '../../../lib/mechanics/xpAndLootManager';
import { 
  isProficientWithWeapon, 
  isProficientWithArmor, 
  checkHeavyArmorStrengthReq 
} from '../../../lib/mechanics/proficiencyUtils';
import { 
  getWeaponMastery, 
  getRefInfo 
} from './inventoryHelpers';
import { ItemCardHeader } from './card/ItemCardHeader';
import { ItemCardStats } from './card/ItemCardStats';
import { ItemCardActions } from './card/ItemCardActions';

interface InventoryItemCardProps {
  itemObj: any;
  category: 'armaduras' | 'armas' | 'municoes' | 'consumiveis' | 'outros' | 'teste';
  character: any;
  isItemEquippedAnywhere: (itemName: string) => boolean;
  canItemBeEquipped: (itemName: string) => boolean;
  isConsumableItem: (itemName: string) => boolean;
  getEquipmentType: (itemName: string) => 'armor' | 'shield' | 'ring' | null;
  handleToggleEquipInInventory: (itemName: string) => void;
  handleConsumeItem: (inventoryId: string) => void;
  handleSellItem: (index: number) => void;
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  itemObj,
  category,
  character,
  isItemEquippedAnywhere,
  canItemBeEquipped,
  isConsumableItem,
  handleToggleEquipInInventory,
  handleConsumeItem,
  handleSellItem
}) => {
  const itemName = itemObj.name;
  const quantity = itemObj.quantity || 1;
  const isEquipped = isItemEquippedAnywhere(itemName);
  const isEquippable = canItemBeEquipped(itemName);
  const priceInfo = getItemPriceInfo(itemName);
  const refInfo = getRefInfo(itemName);

  const isArmor = category === 'armaduras';
  const isWeapon = category === 'armas';
  const isArmorProf = isArmor ? isProficientWithArmor(character, itemName) : true;
  const isWeaponProf = isWeapon ? isProficientWithWeapon(character, itemName) : true;
  const heavyReq = isArmor ? checkHeavyArmorStrengthReq(character, itemName) : { requiresMinStr: false, met: true, minStr: 0 };
  const weaponMastery = isWeapon ? getWeaponMastery(itemName) : null;

  let borderStyle = 'border-slate-800 bg-slate-900/50 hover:border-slate-700/60 hover:bg-slate-900/85';
  if (isEquipped) {
    if ((isArmor && !isArmorProf) || (isWeapon && !isWeaponProf)) {
      borderStyle = 'border-rose-600/80 bg-gradient-to-br from-rose-950/30 via-slate-900/95 to-slate-950 ring-1 ring-rose-500/30';
    } else {
      borderStyle = 'border-amber-500 bg-gradient-to-br from-amber-500/10 via-slate-900/95 to-slate-950 ring-1 ring-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.12)]';
    }
  }

  const calculatedWeightKg = (parseWeightToKg(getItemWeight(itemName)) * quantity).toFixed(2).replace('.', ',').replace(',00', '');

  return (
    <div className={`p-3.5 rounded-xl flex flex-col justify-between gap-2.5 transition-all duration-200 shadow-sm border ${borderStyle}`}>
      <div>
        <ItemCardHeader
          itemName={itemName}
          quantity={quantity}
          category={category}
          isEquipped={isEquipped}
          isEquippable={isEquippable}
          isArmor={isArmor}
          isWeapon={isWeapon}
          isArmorProf={isArmorProf}
          isWeaponProf={isWeaponProf}
          heavyReq={heavyReq}
          character={character}
          priceInfo={priceInfo}
        />

        <ItemCardStats
          category={category}
          priceInfo={priceInfo}
          calculatedWeightKg={calculatedWeightKg}
          refInfo={refInfo}
          weaponMastery={weaponMastery}
          isWeaponProf={isWeaponProf}
          isArmorProf={isArmorProf}
          isEquipped={isEquipped}
          isArmor={isArmor}
          heavyReq={heavyReq}
          character={character}
        />
      </div>

      <ItemCardActions
        isEquippable={isEquippable}
        isEquipped={isEquipped}
        itemName={itemName}
        category={category}
        priceInfo={priceInfo}
        itemObj={itemObj}
        isConsumableItem={isConsumableItem}
        handleToggleEquipInInventory={handleToggleEquipInInventory}
        handleConsumeItem={handleConsumeItem}
        handleSellItem={handleSellItem}
      />
    </div>
  );
};
