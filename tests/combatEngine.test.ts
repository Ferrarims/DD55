import { describe, it, expect } from 'vitest';
import {
  rollDice,
  rollD20,
  resolveAttackRoll,
  sortInitiativeOrder,
  evaluateDamageAffinity,
  parseWeaponRange,
  hasThrownProperty,
  normalizeDamageType,
} from '../src/game/combatUtils';
import { calculateCover } from '../src/game/coverMechanics';
import { findPathAStar } from '../src/game/aStarPathfinding';
import { getWeatherRollModifiers } from '../src/game/weatherEffects';
import { CellData, CombatEntity } from '../src/types/game';

describe('ETAPA 4 — Estabilização do Motor de Combate', () => {
  describe('Rolagem de Dados e Ataques D&D 5.5e', () => {
    it('deve rolar dados dentro dos limites válidos e somar modificadores', () => {
      // Usando mock rng que retorna 0.5 => Math.floor(0.5 * 6) + 1 = 4
      const mockRng = () => 0.5;
      const roll = rollDice(2, 6, 3, mockRng);
      expect(roll.count).toBe(2);
      expect(roll.sides).toBe(6);
      expect(roll.rolls).toEqual([4, 4]);
      expect(roll.total).toBe(11); // 4 + 4 + 3
    });

    it('deve rolar D20 com Vantagem escolhendo o maior valor', () => {
      let callCount = 0;
      // Primeira rolagem dá 5 (rng = 0.2), segunda dá 18 (rng = 0.85)
      const mockRng = () => {
        callCount++;
        return callCount === 1 ? 0.2 : 0.85;
      };
      const result = rollD20(3, 'advantage', mockRng);
      expect(result.naturalRoll).toBe(18);
      expect(result.droppedRoll).toBe(5);
      expect(result.total).toBe(21); // 18 + 3
    });

    it('deve rolar D20 com Desvantagem escolhendo o menor valor', () => {
      let callCount = 0;
      // Primeira rolagem dá 16 (rng = 0.75), segunda dá 7 (rng = 0.3)
      const mockRng = () => {
        callCount++;
        return callCount === 1 ? 0.75 : 0.3;
      };
      const result = rollD20(2, 'disadvantage', mockRng);
      expect(result.naturalRoll).toBe(7);
      expect(result.droppedRoll).toBe(16);
      expect(result.total).toBe(9); // 7 + 2
    });

    it('deve reconhecer 20 natural como Crítico e acerto automático', () => {
      const mockRng = () => 0.99; // dá 20
      const res = resolveAttackRoll({
        attackBonus: 0,
        targetAC: 30, // CA muito alta
        rng: mockRng,
      });
      expect(res.isHit).toBe(true);
      expect(res.isCritical).toBe(true);
      expect(res.naturalRoll).toBe(20);
    });

    it('deve reconhecer 1 natural como Falha Crítica (Fumble) e erro automático', () => {
      const mockRng = () => 0.01; // dá 1
      const res = resolveAttackRoll({
        attackBonus: 15,
        targetAC: 10,
        rng: mockRng,
      });
      expect(res.isHit).toBe(false);
      expect(res.isFumble).toBe(true);
      expect(res.naturalRoll).toBe(1);
    });

    it('deve acertar quando total >= CA e errar quando total < CA', () => {
      const mockHitRng = () => 0.65; // d20 = 14. 14 + 4 = 18 >= 16
      const hit = resolveAttackRoll({ attackBonus: 4, targetAC: 16, rng: mockHitRng });
      expect(hit.isHit).toBe(true);

      const mockMissRng = () => 0.45; // d20 = 10. 10 + 4 = 14 < 16
      const miss = resolveAttackRoll({ attackBonus: 4, targetAC: 16, rng: mockMissRng });
      expect(miss.isHit).toBe(false);
    });
  });

  describe('Afinidades de Dano (Resistência, Vulnerabilidade e Imunidade)', () => {
    const dummyTarget: CombatEntity = {
      id: 'target-1',
      name: 'Monstro de Teste',
      type: 'monster',
      x: 5,
      y: 5,
      maxHp: 50,
      currentHp: 50,
      tempHp: 0,
      armor_class: 14,
      speed: 6,
      remainingMovement: 6,
      initiative: 10,
      icon: '👾',
      color: '#ff0000',
      attackBonus: 4,
      damageDice: '1d6+2',
      range: 1,
      hasAction: true,
      hasBonusAction: true,
      hasReaction: true,
      isDead: false,
      conditions: [],
      resistances: ['Fogo'],
      vulnerabilities: ['Frio'],
      immunities: ['Veneno'],
    };

    it('deve reduzir dano pela metade quando o alvo possui Resistência', () => {
      const result = evaluateDamageAffinity({
        target: dummyTarget,
        damageAmount: 20,
        damageType: 'Fogo',
      });
      expect(result.type).toBe('resistant');
      expect(result.multiplier).toBe(0.5);
    });

    it('deve dobrar o dano quando o alvo possui Vulnerabilidade', () => {
      const result = evaluateDamageAffinity({
        target: dummyTarget,
        damageAmount: 15,
        damageType: 'Frio',
      });
      expect(result.type).toBe('vulnerable');
      expect(result.multiplier).toBe(2);
    });

    it('deve zerar o dano quando o alvo possui Imunidade', () => {
      const result = evaluateDamageAffinity({
        target: dummyTarget,
        damageAmount: 30,
        damageType: 'Veneno',
      });
      expect(result.type).toBe('immune');
      expect(result.multiplier).toBe(0);
    });

    it('deve ignorar resistência a fogo com talento Adepto Elemental', () => {
      const result = evaluateDamageAffinity({
        target: dummyTarget,
        damageAmount: 20,
        damageType: 'Fogo',
        isHeroAttacking: true,
        heroFeats: ['Adepto Elemental'],
      });
      expect(result.type).toBe('none');
      expect(result.multiplier).toBe(1);
    });
  });

  describe('Sistema de Cobertura (Cover Mechanics)', () => {
    const createEmptyGrid = (w: number, h: number): CellData[][] => {
      const grid: CellData[][] = [];
      for (let y = 0; y < h; y++) {
        const row: CellData[] = [];
        for (let x = 0; x < w; x++) {
          row.push({ x, y, terrain: 'normal', movementCost: 1 });
        }
        grid.push(row);
      }
      return grid;
    };

    const attacker: CombatEntity = {
      id: 'att-1',
      name: 'Arqueiro',
      type: 'hero',
      x: 0,
      y: 0,
      maxHp: 20,
      currentHp: 20,
      tempHp: 0,
      armor_class: 12,
      speed: 6,
      remainingMovement: 6,
      initiative: 12,
      icon: '🏹',
      color: '#fff',
      attackBonus: 5,
      damageDice: '1d8+3',
      range: 10,
      hasAction: true,
      hasBonusAction: true,
      hasReaction: true,
      isDead: false,
      conditions: [],
    };

    const defender: CombatEntity = {
      id: 'def-1',
      name: 'Goblin',
      type: 'monster',
      x: 5,
      y: 0,
      maxHp: 10,
      currentHp: 10,
      tempHp: 0,
      armor_class: 12,
      speed: 6,
      remainingMovement: 6,
      initiative: 10,
      icon: '👺',
      color: '#f00',
      attackBonus: 3,
      damageDice: '1d6+1',
      range: 1,
      hasAction: true,
      hasBonusAction: true,
      hasReaction: true,
      isDead: false,
      conditions: [],
    };

    it('deve retornar Sem Cobertura em campo aberto', () => {
      const grid = createEmptyGrid(10, 10);
      const cover = calculateCover(attacker, defender, grid, [attacker, defender]);
      expect(cover.degree).toBe('none');
      expect(cover.acBonus).toBe(0);
    });

    it('deve retornar Cobertura Total quando há uma parede espessa no caminho', () => {
      const grid = createEmptyGrid(10, 10);
      grid[0][2].terrain = 'wall';
      grid[0][2].obstacleType = 'brick_wall';

      const cover = calculateCover(attacker, defender, grid, [attacker, defender]);
      expect(cover.degree).toBe('total');
    });

    it('deve retornar Três Quartos de Cobertura (+5 CA) com árvore ou rocha entre eles', () => {
      const grid = createEmptyGrid(10, 10);
      grid[0][4].terrain = 'wall';
      grid[0][4].obstacleType = 'tree';

      const cover = calculateCover(attacker, defender, grid, [attacker, defender]);
      expect(cover.degree).toBe('three_quarters');
      expect(cover.acBonus).toBe(5);
    });
  });

  describe('Navegação e Pathfinding (A*)', () => {
    it('deve encontrar caminho direto em terreno livre', () => {
      const grid: CellData[][] = [
        [{ x: 0, y: 0, terrain: 'normal', movementCost: 1 }, { x: 1, y: 0, terrain: 'normal', movementCost: 1 }, { x: 2, y: 0, terrain: 'normal', movementCost: 1 }],
      ];
      const path = findPathAStar(grid, { x: 0, y: 0 }, { x: 2, y: 0 });
      expect(path).toEqual([{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }]);
    });

    it('deve desviar de obstáculos intransponíveis', () => {
      const grid: CellData[][] = [
        [{ x: 0, y: 0, terrain: 'normal', movementCost: 1 }, { x: 1, y: 0, terrain: 'wall', movementCost: Infinity }, { x: 2, y: 0, terrain: 'normal', movementCost: 1 }],
        [{ x: 0, y: 1, terrain: 'normal', movementCost: 1 }, { x: 1, y: 1, terrain: 'normal', movementCost: 1 }, { x: 2, y: 1, terrain: 'normal', movementCost: 1 }],
      ];
      const path = findPathAStar(grid, { x: 0, y: 0 }, { x: 2, y: 0 });
      expect(path.length).toBeGreaterThan(0);
      expect(path.some(p => p.x === 1 && p.y === 0)).toBe(false); // Não passa pela parede
    });

    it('deve retornar array vazio se o destino for inacessível', () => {
      const grid: CellData[][] = [
        [{ x: 0, y: 0, terrain: 'normal', movementCost: 1 }, { x: 1, y: 0, terrain: 'wall', movementCost: Infinity }, { x: 2, y: 0, terrain: 'wall', movementCost: Infinity }],
        [{ x: 0, y: 1, terrain: 'wall', movementCost: Infinity }, { x: 1, y: 1, terrain: 'wall', movementCost: Infinity }, { x: 2, y: 1, terrain: 'normal', movementCost: 1 }],
      ];
      const path = findPathAStar(grid, { x: 0, y: 0 }, { x: 2, y: 1 });
      expect(path).toEqual([]);
    });
  });

  describe('Efeitos Climáticos e Ordem de Iniciativa', () => {
    it('deve aplicar desvantagem para projéteis em vento forte e tempestade', () => {
      const windRanged = getWeatherRollModifiers('wind', true, 6, 'Floresta', true);
      expect(windRanged.hasDisadvantage).toBe(true);

      const clearRanged = getWeatherRollModifiers('clear', true, 10, 'Floresta');
      expect(clearRanged.hasDisadvantage).toBe(false);

      // Ambientes subterrâneos (Caverna/Masmorra) são imunes a clima externo
      const caveStorm = getWeatherRollModifiers('storm', true, 8, 'Caverna');
      expect(caveStorm.hasDisadvantage).toBe(false);
    });

    it('deve ordenar iniciativa do maior para o menor com desempate por Destreza', () => {
      const combatants = [
        { id: '1', initiative: 15, stats: { dex: 12 } },
        { id: '2', initiative: 20, stats: { dex: 10 } },
        { id: '3', initiative: 15, stats: { dex: 16 } }, // Mesmo 15, mas maior DEX
      ];
      const ordered = sortInitiativeOrder(combatants);
      expect(ordered.map(c => c.id)).toEqual(['2', '3', '1']);
    });
  });

  describe('Sincronização de CA entre Ficha e Batalha', () => {
    it('createHeroEntity deve usar armor_class da ficha do personagem (ex: CA 18)', async () => {
      const { createHeroEntity } = await import('../src/components/game/core/mapInitialization');
      const mockChar = {
        name: 'Charles',
        race: 'Humano',
        level: 1,
        armor_class: 18,
        dexterity: 17,
        constitution: 14
      };
      const entity = createHeroEntity(mockChar, { x: 5, y: 5 }, 34, 34, 0, 6);
      expect(entity.armor_class).toBe(18);
      expect(entity.ac).toBe(18);
    });

    it('executeAttack deve usar CA correta do defensor', async () => {
      const { executeAttack } = await import('../src/game/combatEngine');
      const attacker: CombatEntity = {
        id: 'monster-1',
        name: 'Svirfneblin #2',
        type: 'monster',
        x: 5,
        y: 6,
        maxHp: 20,
        currentHp: 20,
        tempHp: 0,
        armor_class: 12,
        speed: 6,
        remainingMovement: 6,
        initiative: 10,
        icon: '👺',
        color: '#ff0000',
        attackBonus: 4,
        damageDice: '1d8+2',
        range: 1,
        hasAction: true,
        hasBonusAction: false,
        hasReaction: false,
        isDead: false,
        conditions: []
      };

      const heroTarget: CombatEntity = {
        id: 'hero',
        name: 'Charles',
        type: 'hero',
        x: 5,
        y: 5,
        maxHp: 34,
        currentHp: 34,
        tempHp: 0,
        armor_class: 18,
        ac: 18,
        speed: 6,
        remainingMovement: 6,
        initiative: 12,
        icon: '🛡️',
        color: '#0000ff',
        attackBonus: 5,
        damageDice: '1d8+3',
        range: 1,
        hasAction: true,
        hasBonusAction: false,
        hasReaction: false,
        isDead: false,
        conditions: []
      };

      // Ataque executado contra o herói com CA 18
      const res = executeAttack(attacker, heroTarget, 'normal');
      expect(res.logTitle).toMatch(/CA 18/);
    });
  });
});

