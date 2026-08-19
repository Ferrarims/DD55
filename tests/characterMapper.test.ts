import { describe, it, expect } from 'vitest';
import { mapDatabaseRowToPlayerStats, mapPlayerStatsToDatabaseUpdate } from '../src/lib/mechanics/characterMapper';

describe('ETAPA 5 — Saneamento do Fluxo de Sincronização do Personagem', () => {
  it('deve converter registro de banco de dados para PlayerStats sem perda de campos vitais', () => {
    const dbRecord = {
      id: 'char-123',
      name: 'Ragnar',
      alignment: 'Caótico e Bom',
      level: 3,
      strength: 16,
      dexterity: 14,
      constitution: 16,
      intelligence: 10,
      wisdom: 12,
      charisma: 8,
      armor_class: 16,
      speed: '9m',
      max_hp: 32,
      current_hp: 28,
      temp_hp: 5,
      exhaustion_level: 1,
      gp: 45,
      sp: 20,
      cp: 50,
      ep: 0,
      pp: 1,
      race: 'Anão da Colina',
      class_name: 'Bárbaro',
      background: 'Soldado',
      character_classes: [
        { class_name: 'Bárbaro', subclass: 'Berserker', hit_dice: 'd12', hit_dice_current: 2 },
      ],
      character_choices: [
        { feature_name: 'draconic_ancestry', choice_value: 'Fogo' },
      ],
      character_feats: [
        { feats: { name: 'Vigoroso' } },
      ],
      character_inventory: [
        { quantity: 1, items: { name: 'Machado Grande' } },
        { quantity: 2, items: { name: 'Poção de Cura' } },
      ],
    };

    const stats = mapDatabaseRowToPlayerStats(dbRecord);

    expect(stats.id).toBe('char-123');
    expect(stats.name).toBe('Ragnar');
    expect(stats.level).toBe(3);
    expect(stats.str).toBe(16);
    expect(stats.dex).toBe(14);
    expect(stats.con).toBe(16);
    expect(stats.charClass).toBe('Bárbaro');
    expect(stats.subclass).toBe('Berserker');
    expect(stats.hitDice).toBe('d12');
    expect(stats.hitDiceCount).toBe(2);
    expect(stats.draconicAncestry).toBe('Fogo');
    expect(stats.feats).toContain('Vigoroso');
    expect(stats.equipment).toEqual(['Machado Grande', '2x Poção de Cura']);
    expect(stats.gp).toBe(45);
    expect(stats.sp).toBe(20);
    expect(stats.coins).toBe('57.50 PO'); // 45 + 2 + 0.5 + 10 = 57.5
    expect(stats.exhaustionLevel).toBe(1);
    expect(stats.proficiencyBonus).toBe(2);
  });

  it('deve gerar payload de atualização de banco de dados seguro a partir de PlayerStats', () => {
    const updatedStats = {
      name: 'Ragnar o Forte',
      hp: 15,
      maxHp: 35,
      tempHP: 0,
      exhaustionLevel: 2,
      gp: 100,
      sp: 50,
      str: 18,
    };

    const updatePayload = mapPlayerStatsToDatabaseUpdate(updatedStats);

    expect(updatePayload.name).toBe('Ragnar o Forte');
    expect(updatePayload.current_hp).toBe(15);
    expect(updatePayload.max_hp).toBe(35);
    expect(updatePayload.temp_hp).toBe(0);
    expect(updatePayload.exhaustion_level).toBe(2);
    expect(updatePayload.gp).toBe(100);
    expect(updatePayload.sp).toBe(50);
    expect(updatePayload.strength).toBe(18);
    expect(updatePayload.updated_at).toBeDefined();
  });
});
