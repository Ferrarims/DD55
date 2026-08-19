import { describe, it, expect } from 'vitest';
import { applyShortRest, applyLongRest } from '../src/lib/mechanics/restManager';
import {
  getLevelFromXp,
  getXpProgress,
  parseCostToGold,
  getItemPriceInfo,
  normalizeEquipmentList,
  parseEquipmentToList,
} from '../src/lib/mechanics/xpAndLootManager';
import { PlayerStats } from '../src/types/character';

describe('ETAPA 6 — Descanso, Recursos, XP e Loot', () => {
  describe('Mecânica de Descanso (Short & Long Rest D&D 2024)', () => {
    const mockHero: PlayerStats = {
      name: 'Valeros',
      charClass: 'Guerreiro',
      race: 'Humano',
      background: 'Soldado',
      originFeat: 'Alerta',
      icon: '⚔️',
      hp: 12,
      maxHp: 30,
      armor_class: 16,
      initiative: 1,
      attackBonus: 5,
      damageDiceSides: 8,
      damageDiceCount: 1,
      damageBonus: 3,
      str: 16,
      dex: 12,
      con: 14, // Modificador +2
      int: 10,
      wis: 10,
      cha: 10,
      speed: '9m',
      savingThrows: ['str', 'con'],
      level: 4,
      proficiencyBonus: 2,
      passivePerception: 10,
      hitDice: 'd10',
      hitDiceCount: 3,
      exhaustionLevel: 2,
      resources: [
        { name: 'Retomar o Fôlego', max: 1, reset: 'Descanso Curto' },
        { name: 'Surto de Ação', max: 1, reset: 'Descanso Curto' },
        { name: 'Indomável', max: 1, reset: 'Descanso Longo' },
      ],
    };

    it('deve aplicar Descanso Curto gastando dados de vida e curando com bônus de CON', () => {
      // Mock RNG fixo para retornar 6 no d10 (0.55 * 10 = 5.5 + 1 = 6)
      const mockRng = () => 0.55;
      const result = applyShortRest(mockHero, 2, mockRng);

      // 2 dados com face 6 + CON mod (+2) = 8 por dado -> 16 de cura total
      expect(result.diceSpent).toBe(2);
      expect(result.remainingHitDice).toBe(1); // 3 - 2 = 1
      expect(result.hpHealed).toBe(16);
      expect(result.updatedHp).toBe(28); // 12 + 16 = 28 (<= maxHp 30)
      expect(result.resourcesRestored).toContain('Retomar o Fôlego');
      expect(result.resourcesRestored).toContain('Surto de Ação');
    });

    it('não deve permitir gastar mais Dados de Vida do que o disponível', () => {
      const result = applyShortRest(mockHero, 10);
      expect(result.diceSpent).toBe(3); // tinha apenas 3
      expect(result.remainingHitDice).toBe(0);
    });

    it('deve aplicar Descanso Longo recuperando 100% dos PV, dados de vida e reduzindo exaustão', () => {
      const heroWithLowHp = {
        ...mockHero,
        hp: 5,
        hitDiceCount: 1, // 1 de 4
        exhaustionLevel: 2,
      };

      const result = applyLongRest(heroWithLowHp);

      expect(result.updatedHp).toBe(30); // 100% de maxHp
      expect(result.hitDiceRecovered).toBe(2); // recupera metade do nível 4 = 2
      expect(result.updatedHitDice).toBe(3); // 1 + 2 = 3 (<= total 4)
      expect(result.exhaustionReduced).toBe(1);
      expect(result.newExhaustionLevel).toBe(1); // 2 - 1 = 1
      expect(result.resourcesRestored).toContain('Indomável');
    });
  });

  describe('Progressão de Experiência (XP) e Nível', () => {
    it('deve converter XP para Nível correto de acordo com a tabela D&D', () => {
      expect(getLevelFromXp(0)).toBe(1);
      expect(getLevelFromXp(299)).toBe(1);
      expect(getLevelFromXp(300)).toBe(2);
      expect(getLevelFromXp(900)).toBe(3);
      expect(getLevelFromXp(2700)).toBe(4);
      expect(getLevelFromXp(6500)).toBe(5);
      expect(getLevelFromXp(85000)).toBe(11);
      expect(getLevelFromXp(355000)).toBe(20);
    });

    it('deve calcular progresso percentual e XP restante para o próximo nível', () => {
      // Nível 1: 0 a 300 XP. 150 XP é 50%
      const prog1 = getXpProgress(150);
      expect(prog1.level).toBe(1);
      expect(prog1.percent).toBe(50);
      expect(prog1.xpInCurrentLevel).toBe(150);
      expect(prog1.xpNeededForNextLevel).toBe(300);

      // Nível 20: 100%
      const prog20 = getXpProgress(400000);
      expect(prog20.level).toBe(20);
      expect(prog20.percent).toBe(100);
    });
  });

  describe('Preços de Itens, Loot e Normalização de Equipamentos', () => {
    it('deve converter strings de custo para moedas de ouro (PO) com precisão', () => {
      expect(parseCostToGold('50 PO')).toBe(50);
      expect(parseCostToGold('10 PP')).toBe(1);
      expect(parseCostToGold('100 PC')).toBe(1);
      expect(parseCostToGold('2 PL')).toBe(20);
      expect(parseCostToGold('4 PE')).toBe(2);
    });

    it('deve extrair informações de preço e revenda (50% do valor base)', () => {
      const priceInfo = getItemPriceInfo('Espada Longa');
      expect(priceInfo.basePricePO).toBe(15);
      expect(priceInfo.sellPricePO).toBe(7.5);
    });

    it('deve normalizar pilhas de munição e itens de inventário', () => {
      const raw = ['20 Flechas', '10 Flechas', '2 Adagas', 'Poção de Cura'];
      const normalized = normalizeEquipmentList(raw);

      // Flechas somam 30: 1 pilha de 10 (primeiro) e 1 de 20
      expect(normalized).toContain('Flechas (10)');
      expect(normalized).toContain('Flechas (20)');
      expect(normalized.filter(i => i === 'Adaga').length).toBe(2);
      expect(normalized).toContain('Poção de Cura');
    });

    it('deve fazer parse de equipamentos a partir de string JSON ou array ignorando moedas soltas', () => {
      const parsed = parseEquipmentToList(['Espada Curta', '10 PO', 'Escudo']);
      expect(parsed).toEqual(['Espada Curta', 'Escudo']);
    });
  });
});
