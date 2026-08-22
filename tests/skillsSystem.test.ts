import { describe, it, expect } from 'vitest';
import {
  SKILLS_REFERENCE,
  ALL_SKILL_KEYS,
} from '../src/lib/api/references';
import {
  getProficiencyBonusByLevel,
  getCharacterSkillProficiencies,
  getAbilityModifier,
  calculateSkillBonus,
  getAllSkillsCalculations,
  rollSkillCheck,
} from '../src/game/skills/skillsEngine';

describe('D&D 2024 / 5.5e Skills System', () => {
  it('should include all 18 official D&D 2024 skills with correct abilities', () => {
    expect(ALL_SKILL_KEYS.length).toBe(18);

    expect(SKILLS_REFERENCE.acrobatics.ability).toBe('dex');
    expect(SKILLS_REFERENCE.animal_handling.ability).toBe('wis');
    expect(SKILLS_REFERENCE.arcana.ability).toBe('int');
    expect(SKILLS_REFERENCE.athletics.ability).toBe('str');
    expect(SKILLS_REFERENCE.deception.ability).toBe('cha');
    expect(SKILLS_REFERENCE.history.ability).toBe('int');
    expect(SKILLS_REFERENCE.insight.ability).toBe('wis');
    expect(SKILLS_REFERENCE.intimidation.ability).toBe('cha');
    expect(SKILLS_REFERENCE.investigation.ability).toBe('int');
    expect(SKILLS_REFERENCE.medicine.ability).toBe('wis');
    expect(SKILLS_REFERENCE.nature.ability).toBe('int');
    expect(SKILLS_REFERENCE.perception.ability).toBe('wis');
    expect(SKILLS_REFERENCE.performance.ability).toBe('cha');
    expect(SKILLS_REFERENCE.persuasion.ability).toBe('cha');
    expect(SKILLS_REFERENCE.religion.ability).toBe('int');
    expect(SKILLS_REFERENCE.sleight_of_hand.ability).toBe('dex');
    expect(SKILLS_REFERENCE.stealth.ability).toBe('dex');
    expect(SKILLS_REFERENCE.survival.ability).toBe('wis');
  });

  it('should calculate Proficiency Bonus according to official table', () => {
    expect(getProficiencyBonusByLevel(1)).toBe(2);
    expect(getProficiencyBonusByLevel(4)).toBe(2);
    expect(getProficiencyBonusByLevel(5)).toBe(3);
    expect(getProficiencyBonusByLevel(8)).toBe(3);
    expect(getProficiencyBonusByLevel(9)).toBe(4);
    expect(getProficiencyBonusByLevel(12)).toBe(4);
    expect(getProficiencyBonusByLevel(13)).toBe(5);
    expect(getProficiencyBonusByLevel(16)).toBe(5);
    expect(getProficiencyBonusByLevel(17)).toBe(6);
    expect(getProficiencyBonusByLevel(20)).toBe(6);
    expect(getProficiencyBonusByLevel(21)).toBe(7);
  });

  it('should parse skill proficiencies from PT-BR names and character fields', () => {
    const char = {
      skillProficiencies: ['Percepção', 'Furtividade', 'Atletismo'],
      skills: ['Acrobacia']
    };

    const profs = getCharacterSkillProficiencies(char);
    expect(profs.has('perception')).toBe(true);
    expect(profs.has('stealth')).toBe(true);
    expect(profs.has('athletics')).toBe(true);
    expect(profs.has('acrobatics')).toBe(true);
    expect(profs.has('arcana')).toBe(false);
  });

  it('should accurately calculate skill bonuses and passive scores', () => {
    const char = {
      level: 1,
      proficiencyBonus: 2,
      dexterity: 16, // Mod: +3
      wisdom: 14,    // Mod: +2
      strength: 10,  // Mod: +0
      skillProficiencies: ['Percepção', 'Furtividade']
    };

    // Stealth: DEX +3 + Prof +2 = +5, Passive = 15
    const stealthCalc = calculateSkillBonus(char, 'stealth');
    expect(stealthCalc.abilityMod).toBe(3);
    expect(stealthCalc.isProficient).toBe(true);
    expect(stealthCalc.totalBonus).toBe(5);
    expect(stealthCalc.passiveScore).toBe(15);

    // Acrobatics: DEX +3 + Non-prof = +3, Passive = 13
    const acroCalc = calculateSkillBonus(char, 'acrobatics');
    expect(acroCalc.abilityMod).toBe(3);
    expect(acroCalc.isProficient).toBe(false);
    expect(acroCalc.totalBonus).toBe(3);
    expect(acroCalc.passiveScore).toBe(13);

    // Perception: WIS +2 + Prof +2 = +4, Passive Perception = 14
    const percCalc = calculateSkillBonus(char, 'perception');
    expect(percCalc.totalBonus).toBe(4);
    expect(percCalc.passiveScore).toBe(14);
  });

  it('should apply exhaustion penalty correctly to skill rolls and passives', () => {
    const char = {
      level: 1,
      dexterity: 14, // Mod: +2
      exhaustion_level: 2, // -4 penalty
      skillProficiencies: ['Acrobacia'] // +2 PB
    };

    const calc = calculateSkillBonus(char, 'acrobatics');
    expect(calc.totalBonus).toBe(4);
    expect(calc.exhaustionPenalty).toBe(4);
    expect(calc.passiveScore).toBe(10); // 10 + 4 - 4
  });

  it('should execute rollSkillCheck and test against DC', () => {
    const char = {
      level: 1,
      wisdom: 16, // +3
      skillProficiencies: ['Percepção'] // +2
    };

    const roll = rollSkillCheck(char, 'perception', { dc: 15 });
    expect(roll.skill.id).toBe('perception');
    expect(roll.abilityMod).toBe(3);
    expect(roll.pbBonus).toBe(2);
    expect(roll.total).toBe(roll.d20 + 3 + 2);
    expect(typeof roll.passed).toBe('boolean');
    expect(roll.passed).toBe(roll.total >= 15);
    expect(roll.logText).toContain('Percepção');
  });

  it('should return calculations for all 18 skills', () => {
    const char = { level: 1 };
    const all = getAllSkillsCalculations(char);
    expect(all.length).toBe(18);
  });
});
