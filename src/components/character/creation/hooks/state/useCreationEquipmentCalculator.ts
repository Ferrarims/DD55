import { useCallback } from 'react';
import { parseEquipmentToList } from '../../../../../lib/mechanics/xpAndLootManager';
import { extractEquipmentChoiceItems } from '../../../../../lib/mechanics/equipmentParser';
import { calculateAC } from '../../../../../lib/mechanics/acCalculator';
import { parseInventory } from '../../../../../lib/mechanics/inventoryParser';
import { CLASS_REFERENCE } from '../../../../../lib/api/references';
import { StatKey } from '../../constants';
import { getStandardClassEquipment } from '../../helpers/creationHelpers';

interface UseCreationEquipmentCalculatorProps {
  charClass: string;
  classEqChoice: 'A' | 'B' | 'C';
  bgEqChoice: 'A' | 'B' | 'C';
  currentBg: any;
  getFinalStat: (stat: StatKey) => number;
}

export function useCreationEquipmentCalculator({
  charClass,
  classEqChoice,
  bgEqChoice,
  currentBg,
  getFinalStat,
}: UseCreationEquipmentCalculatorProps) {
  const getEquipmentAndAC = useCallback(() => {
    let weaponDice = 6;
    let weaponCount = 1;
    const rawEquipmentList: string[] = [];

    const classData = (CLASS_REFERENCE as any)[charClass];
    if (classData && classData.equipmentOptions) {
      rawEquipmentList.push(...extractEquipmentChoiceItems(classData.equipmentOptions, classEqChoice));
    } else {
      rawEquipmentList.push(getStandardClassEquipment(charClass, classEqChoice));
    }

    if (currentBg && currentBg.equipment) {
      rawEquipmentList.push(...extractEquipmentChoiceItems(currentBg.equipment, bgEqChoice));
    } else {
      rawEquipmentList.push('50 PO');
    }

    const equipmentList = parseEquipmentToList(rawEquipmentList);
    const { items } = parseInventory(equipmentList);

    const acResult = calculateAC({
      charClass,
      stats: {
        dex: getFinalStat('dex'),
        con: getFinalStat('con'),
        wis: getFinalStat('wis')
      },
      inventoryItems: items
    });

    if (charClass === 'Barbarian') { weaponDice = 12; }
    if (charClass === 'Fighter') { weaponDice = classEqChoice === 'A' ? 12 : 8; }
    if (charClass === 'Paladin') { weaponDice = 8; }
    if (charClass === 'Ranger') { weaponDice = 8; }
    if (charClass === 'Bard') { weaponDice = 8; }
    if (charClass === 'Rogue') { weaponDice = 6; weaponCount = 2; }
    if (charClass === 'Warlock') { weaponDice = 6; }
    if (charClass === 'Sorcerer') { weaponDice = 6; }
    if (charClass === 'Wizard') { weaponDice = 4; weaponCount = 3; }
    if (charClass === 'Cleric') { weaponDice = 6; }
    if (charClass === 'Druid') { weaponDice = 4; }
    if (charClass === 'Monk') { weaponDice = 6; weaponCount = 2; }

    return { ac: acResult.ac, acResult, weaponDice, weaponCount, equipmentList, rawEquipmentList };
  }, [charClass, classEqChoice, bgEqChoice, currentBg, getFinalStat]);

  return { getEquipmentAndAC };
}
