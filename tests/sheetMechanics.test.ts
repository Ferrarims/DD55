import { describe, it, expect } from 'vitest';
import { calculateAC } from '../src/lib/mechanics/acCalculator';
import { getMod, calculateBaseHp, calculateTotalMaxHp, normalizeHitDice } from '../src/lib/mechanics/hpCalculator';
import { getProficiencyBonus, isProficientWithWeapon, isProficientWithArmor, getWeaponCategory, getArmorCategory } from '../src/lib/mechanics/proficiencyUtils';
import { calculateTotalCoinsFromEquipment, convertCoinsToGold, calculateInventoryWeight, parseInventory } from '../src/lib/mechanics/inventoryParser';
import { singularizeItemName, pluralizeItemName, formatItemWithQuantity } from '../src/lib/mechanics/equipmentParser';

describe('ETAPA 3 — Isolamento e Cálculos Puros da Ficha', () => {
  describe('Cálculo de Classe de Armadura (CA)', () => {
    it('deve calcular CA padrão sem armadura como 10 + Modificador de Destreza', () => {
      const res = calculateAC({
        charClass: 'Guerreiro',
        stats: { dex: 14 },
      });
      expect(res.armor_class).toBe(12); // 10 + 2
      expect(res.armorType).toBe('none');
    });

    it('deve calcular Defesa sem Armadura do Bárbaro (10 + DES + CON)', () => {
      const res = calculateAC({
        charClass: 'Bárbaro',
        stats: { dex: 14, con: 16 }, // DES +2, CON +3
      });
      expect(res.armor_class).toBe(15); // 10 + 2 + 3
    });

    it('deve calcular Defesa sem Armadura do Monge (10 + DES + SAB)', () => {
      const res = calculateAC({
        charClass: 'Monge',
        stats: { dex: 16, wis: 14 }, // DES +3, SAB +2
      });
      expect(res.armor_class).toBe(15); // 10 + 3 + 2
    });

    it('deve calcular Armadura Leve (Couro Batido = 12 + DES total)', () => {
      const res = calculateAC({
        charClass: 'Ladino',
        stats: { dex: 18 }, // +4
        equippedArmor: 'Couro Batido',
      });
      expect(res.armor_class).toBe(16); // 12 + 4
      expect(res.armorType).toBe('light');
    });

    it('deve limitar bônus de Destreza em Armadura Média a no máximo +2 (ou +3 com talento)', () => {
      const resWithoutFeat = calculateAC({
        charClass: 'Guerreiro',
        stats: { dex: 18 }, // Modificador +4, mas limitado a +2
        equippedArmor: 'Cota de Escamas', // Base 14
      });
      expect(resWithoutFeat.armor_class).toBe(16); // 14 + 2
      expect(resWithoutFeat.dexBonus).toBe(2);

      const resWithFeat = calculateAC({
        charClass: 'Guerreiro',
        stats: { dex: 18 }, // Modificador +4, limitado a +3 pelo talento
        equippedArmor: 'Cota de Escamas', // Base 14
        feats: ['Medium Armor Master'],
      });
      expect(resWithFeat.armor_class).toBe(17); // 14 + 3
      expect(resWithFeat.dexBonus).toBe(3);
    });

    it('deve calcular Armadura Pesada ignorando modificador de Destreza', () => {
      const res = calculateAC({
        charClass: 'Paladino',
        stats: { dex: 16 }, // Modificador +3 não se aplica
        equippedArmor: 'Cota de Malha', // Base 16
      });
      expect(res.armor_class).toBe(16);
      expect(res.armorType).toBe('heavy');
      expect(res.dexBonus).toBe(0);
    });

    it('deve aplicar +2 de CA para escudo equipado com arma de uma mão', () => {
      const res = calculateAC({
        charClass: 'Guerreiro',
        stats: { dex: 10 },
        equippedArmor: 'Cota de Malha',
        equippedShield: 'Escudo',
        selectedWeaponName: 'Espada Longa',
      });
      expect(res.armor_class).toBe(18); // 16 + 2
      expect(res.shieldActive).toBe(true);
    });

    it('não deve ativar escudo com arma de duas mãos', () => {
      const res = calculateAC({
        charClass: 'Guerreiro',
        stats: { dex: 10 },
        equippedArmor: 'Cota de Malha',
        equippedShield: 'Escudo',
        selectedWeaponName: 'Machado Grande',
      });
      expect(res.armor_class).toBe(16); // Sem bônus de escudo
      expect(res.twoHandedWeaponBlockedShield).toBe(true);
    });

    it('deve calcular CA corretamente com equipmentSlots serializado em JSON string', () => {
      const res = calculateAC({
        charClass: 'Guerreiro',
        stats: { dex: 17 }, // +3
        equipmentSlots: JSON.stringify({
          corpo_torso: 'Cota de Malha',
          empunhadura_2: 'Escudo'
        }) as any
      });
      expect(res.armor_class).toBe(18); // 16 + 2
      expect(res.shieldActive).toBe(true);
      expect(res.armorType).toBe('heavy');
    });

    it('deve calcular CA corretamente com inventário relacional do Supabase (items: { name }) e equip_slot', () => {
      const res = calculateAC({
        charClass: 'Guerreiro',
        stats: { dex: 14 },
        inventoryItems: [
          { equip_slot: 'corpo_torso', items: { name: 'Cota de Malha' }, equipped: true } as any,
          { equip_slot: 'empunhadura_2', items: { name: 'Escudo' }, equipped: true } as any
        ]
      });
      expect(res.armor_class).toBe(18); // 16 + 2
      expect(res.shieldActive).toBe(true);
    });
  });

  describe('Cálculo de Pontos de Vida (PV) e Modificadores', () => {
    it('deve calcular modificador de atributo corretamente', () => {
      expect(getMod(10)).toBe(0);
      expect(getMod(11)).toBe(0);
      expect(getMod(12)).toBe(1);
      expect(getMod(14)).toBe(2);
      expect(getMod(18)).toBe(4);
      expect(getMod(8)).toBe(-1);
      expect(getMod(6)).toBe(-2);
    });

    it('deve calcular PV base por nível com modificador de Constituição', () => {
      // Nível 1 Guerreiro (d10) com CON 14 (+2) => 10 + 2 = 12
      expect(calculateBaseHp(10, 2, 1)).toBe(12);

      // Nível 2 Guerreiro (d10) com CON 14 (+2) => 12 + (6 + 2) = 20
      expect(calculateBaseHp(10, 2, 2)).toBe(20);

      // Nível 5 Mago (d6) com CON 10 (+0) => 6 + 4*(4) = 22
      expect(calculateBaseHp(6, 0, 5)).toBe(22);
    });

    it('deve aplicar bônus de PV de Anão e talentos (Vigoroso/Fortitude)', () => {
      const baseHp = 20; // nível 2
      const totalHpDwarf = calculateTotalMaxHp(baseHp, 'Anão da Colina', 2);
      expect(totalHpDwarf).toBe(22); // +2 por ser anão no nível 2

      const totalHpTough = calculateTotalMaxHp(baseHp, 'Humano', 2, ['Vigoroso']);
      expect(totalHpTough).toBe(24); // +4 por talento vigoroso (2 * nível)

      const totalHpFortitude = calculateTotalMaxHp(baseHp, 'Humano', 2, ['Dádiva da Fortitude']);
      expect(totalHpFortitude).toBe(60); // +40 bônus fixo de fortitude
    });

    it('deve normalizar os dados de vida para cada classe', () => {
      expect(normalizeHitDice('d12', 3, 'Bárbaro')).toEqual({ sides: 12, unitStr: 'd12', poolStr: '3d12' });
      expect(normalizeHitDice('', 1, 'Guerreiro')).toEqual({ sides: 10, unitStr: 'd10', poolStr: '1d10' });
      expect(normalizeHitDice('', 4, 'Mago')).toEqual({ sides: 6, unitStr: 'd6', poolStr: '4d6' });
    });
  });

  describe('Bônus de Proficiência e Categorização', () => {
    it('deve calcular bônus de proficiência por nível corretamente', () => {
      expect(getProficiencyBonus(1)).toBe(2);
      expect(getProficiencyBonus(4)).toBe(2);
      expect(getProficiencyBonus(5)).toBe(3);
      expect(getProficiencyBonus(8)).toBe(3);
      expect(getProficiencyBonus(9)).toBe(4);
      expect(getProficiencyBonus(12)).toBe(4);
      expect(getProficiencyBonus(13)).toBe(5);
      expect(getProficiencyBonus(16)).toBe(5);
      expect(getProficiencyBonus(17)).toBe(6);
      expect(getProficiencyBonus(20)).toBe(6);
    });

    it('deve categorizar armas corretamente', () => {
      expect(getWeaponCategory('Adaga')).toBe('simple_melee');
      expect(getWeaponCategory('Arco Curto')).toBe('simple_ranged');
      expect(getWeaponCategory('Espada Longa')).toBe('martial_melee');
      expect(getWeaponCategory('Arco Longo')).toBe('martial_ranged');
    });

    it('deve categorizar armaduras e escudos', () => {
      expect(getArmorCategory('Couro')).toBe('light');
      expect(getArmorCategory('Cota de Escamas')).toBe('medium');
      expect(getArmorCategory('Placas')).toBe('heavy');
      expect(getArmorCategory('Escudo')).toBe('shield');
    });

    it('deve validar proficiências de classe de Guerreiro e Mago', () => {
      const fighter = { charClass: 'Guerreiro' };
      const wizard = { charClass: 'Mago' };

      expect(isProficientWithWeapon(fighter, 'Espada Grande')).toBe(true);
      expect(isProficientWithArmor(fighter, 'Placas')).toBe(true);
      expect(isProficientWithArmor(fighter, 'Escudo')).toBe(true);

      expect(isProficientWithWeapon(wizard, 'Adaga')).toBe(true);
      expect(isProficientWithWeapon(wizard, 'Espada Grande')).toBe(false);
      expect(isProficientWithArmor(wizard, 'Placas')).toBe(false);
    });
  });

  describe('Inventário, Moedas, Pesos e Equipamentos', () => {
    it('deve converter moedas para PO com precisão', () => {
      expect(convertCoinsToGold({ gp: 50 })).toBe(50);
      expect(convertCoinsToGold({ cp: 100, sp: 10, gp: 5 })).toBe(7); // 1 + 1 + 5 = 7 PO
      expect(convertCoinsToGold({ pp: 2, ep: 4, gp: 10 })).toBe(32); // 20 + 2 + 10 = 32 PO
    });

    it('deve extrair moedas de lista de strings de equipamentos', () => {
      const coinsStr = calculateTotalCoinsFromEquipment(['50 PO', '10 PP e 100 PC']);
      expect(coinsStr).toBe('52 PO');
    });

    it('deve calcular peso total do inventário', () => {
      const items = [
        { name: 'Espada Longa', quantity: 1, weight: '1.5 kg' },
        { name: 'Poção de Cura', quantity: 3, weight: '0.2' },
        { name: 'Tocha', quantity: 2, weight: 1 },
      ];
      expect(calculateInventoryWeight(items)).toBe(4.1);
    });

    it('deve singularizar e pluralizar itens corretamente em português', () => {
      expect(singularizeItemName('Adagas')).toBe('Adaga');
      expect(singularizeItemName('Poções de Cura')).toBe('Poção de Cura');
      expect(pluralizeItemName('Adaga')).toBe('Adagas');
      expect(formatItemWithQuantity('Adaga', 2)).toBe('2 Adagas');
      expect(formatItemWithQuantity('Adaga', 1)).toBe('Adaga');
    });
  });
});
