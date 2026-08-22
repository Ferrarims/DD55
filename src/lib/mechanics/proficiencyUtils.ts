// Utilitário consolidado de Proficiências de Armas, Armaduras e Escudos (Regras D&D 5.5e 2024)

export {
  getProficiencyBonus,
  getWeaponCategory,
  isProficientWithWeapon,
} from './proficiency/weaponProficiency';
export type { WeaponCategory } from './proficiency/weaponProficiency';

export {
  getArmorCategory,
  isProficientWithArmor,
  getNonProficientArmorPenalties,
  checkHeavyArmorStrengthReq,
} from './proficiency/armorProficiency';
export type { ArmorCategory } from './proficiency/armorProficiency';
