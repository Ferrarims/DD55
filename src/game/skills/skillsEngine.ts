import {
  SKILLS_REFERENCE,
  SkillKey,
  SkillReferenceItem,
  ALL_SKILL_KEYS,
  PT_SKILL_NAME_TO_KEY,
  AbilityKey,
} from '../../lib/api/references';

/**
 * Retorna o Bônus de Proficiência oficial de D&D 2024 baseado no nível
 */
export function getProficiencyBonusByLevel(level: number = 1): number {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  if (level <= 20) return 6;
  if (level <= 24) return 7;
  if (level <= 28) return 8;
  return 9;
}

/**
 * Normaliza e identifica se o personagem tem proficiência em uma perícia
 */
export function getCharacterSkillProficiencies(character: any): Set<SkillKey> {
  const result = new Set<SkillKey>();
  if (!character) return result;

  const rawList: any[] = [
    ...(Array.isArray(character.skills) ? character.skills : []),
    ...(Array.isArray(character.skillProficiencies) ? character.skillProficiencies : []),
    ...(Array.isArray(character.skill_proficiencies) ? character.skill_proficiencies : []),
  ];

  for (const item of rawList) {
    if (!item) continue;
    const str = String(item).trim().toLowerCase();
    const mappedKey = PT_SKILL_NAME_TO_KEY[str];
    if (mappedKey) {
      result.add(mappedKey);
    } else if (ALL_SKILL_KEYS.includes(str as SkillKey)) {
      result.add(str as SkillKey);
    }
  }

  return result;
}

/**
 * Obtém o modificador de atributo base do personagem
 */
export function getAbilityModifier(character: any, ability: AbilityKey): number {
  if (!character) return 0;

  let score = 10;
  switch (ability) {
    case 'str':
      score = character.str ?? character.strength ?? 10;
      break;
    case 'dex':
      score = character.dex ?? character.dexterity ?? 10;
      break;
    case 'con':
      score = character.con ?? character.constitution ?? 10;
      break;
    case 'int':
      score = character.int ?? character.intelligence ?? 10;
      break;
    case 'wis':
      score = character.wis ?? character.wisdom ?? 10;
      break;
    case 'cha':
      score = character.cha ?? character.charisma ?? 10;
      break;
  }

  return Math.floor((score - 10) / 2);
}

export interface SkillBonusCalculation {
  skill: SkillReferenceItem;
  abilityMod: number;
  pb: number;
  isProficient: boolean;
  totalBonus: number;
  passiveScore: number;
  exhaustionPenalty: number;
}

/**
 * Calcula o bônus final de uma perícia específica para um personagem
 */
export function calculateSkillBonus(character: any, skillKey: SkillKey): SkillBonusCalculation {
  const skill = SKILLS_REFERENCE[skillKey];
  const abilityMod = getAbilityModifier(character, skill.ability);
  const pb = character?.proficiencyBonus ?? getProficiencyBonusByLevel(character?.level || 1);
  const proficientSkills = getCharacterSkillProficiencies(character);
  const isProficient = proficientSkills.has(skillKey);
  const exhaustionLevel = character?.exhaustion_level ?? character?.exhaustionLevel ?? 0;
  const exhaustionPenalty = exhaustionLevel * 2;

  const totalBonus = abilityMod + (isProficient ? pb : 0);
  const passiveScore = 10 + totalBonus - exhaustionPenalty;

  return {
    skill,
    abilityMod,
    pb,
    isProficient,
    totalBonus,
    passiveScore,
    exhaustionPenalty,
  };
}

/**
 * Retorna todos os cálculos de perícias do personagem
 */
export function getAllSkillsCalculations(character: any): SkillBonusCalculation[] {
  return ALL_SKILL_KEYS.map(key => calculateSkillBonus(character, key));
}

export interface SkillRollResult {
  skill: SkillReferenceItem;
  d20: number;
  d20Alt?: number;
  rollType: 'normal' | 'advantage' | 'disadvantage';
  abilityMod: number;
  isProficient: boolean;
  pbBonus: number;
  exhaustionPenalty: number;
  total: number;
  isCrit20: boolean;
  isCrit1: boolean;
  dc?: number;
  passed?: boolean;
  logText: string;
}

/**
 * Rola um teste d20 de Perícia completo com cálculo discriminado
 */
export function rollSkillCheck(
  character: any,
  skillKey: SkillKey,
  options?: {
    dc?: number;
    advantage?: boolean;
    disadvantage?: boolean;
    reason?: string;
  }
): SkillRollResult {
  const calc = calculateSkillBonus(character, skillKey);
  const isAdv = Boolean(options?.advantage && !options?.disadvantage);
  const isDisadv = Boolean(options?.disadvantage && !options?.advantage);

  const roll1 = Math.floor(Math.random() * 20) + 1;
  let chosenD20 = roll1;
  let altD20: number | undefined = undefined;
  let rollType: 'normal' | 'advantage' | 'disadvantage' = 'normal';

  if (isAdv) {
    const roll2 = Math.floor(Math.random() * 20) + 1;
    chosenD20 = Math.max(roll1, roll2);
    altD20 = Math.min(roll1, roll2);
    rollType = 'advantage';
  } else if (isDisadv) {
    const roll2 = Math.floor(Math.random() * 20) + 1;
    chosenD20 = Math.min(roll1, roll2);
    altD20 = Math.max(roll1, roll2);
    rollType = 'disadvantage';
  }

  // Sorte de Pequenino (Halfling Luck): Re-rola 1 natural
  const isHalfling =
    character?.race === 'Pequenino' ||
    character?.race?.toLowerCase().includes('pequenino') ||
    character?.race?.toLowerCase().includes('halfling');
  if (isHalfling && chosenD20 === 1) {
    chosenD20 = Math.floor(Math.random() * 20) + 1;
  }

  const isCrit20 = chosenD20 === 20;
  const isCrit1 = chosenD20 === 1;

  const pbBonus = calc.isProficient ? calc.pb : 0;
  const total = chosenD20 + calc.abilityMod + pbBonus - calc.exhaustionPenalty;

  const dc = options?.dc;
  const passed = dc !== undefined ? total >= dc : undefined;

  let rollLabel = `d20(${chosenD20})`;
  if (rollType === 'advantage') rollLabel = `d20(${chosenD20} com Vantagem [${roll1}, ${altD20}])`;
  if (rollType === 'disadvantage') rollLabel = `d20(${chosenD20} com Desvantagem [${roll1}, ${altD20}])`;

  const modStr = calc.abilityMod >= 0 ? `+${calc.abilityMod}` : `${calc.abilityMod}`;
  const pbStr = calc.isProficient ? `+${calc.pb}(Prof)` : '';
  const exStr = calc.exhaustionPenalty > 0 ? `-${calc.exhaustionPenalty}(Exaustão)` : '';
  const reasonStr = options?.reason ? ` (${options.reason})` : '';

  let outcomeStr = '';
  if (dc !== undefined) {
    outcomeStr = passed ? ` vs CD ${dc} (SUCESSO!)` : ` vs CD ${dc} (FALHA)`;
  }

  const logText = `${calc.skill.icon} Teste de ${calc.skill.namePt} [${calc.skill.abilityNamePt}]${reasonStr}: ${rollLabel} ${modStr} ${pbStr} ${exStr} = ${total}${outcomeStr}`;

  return {
    skill: calc.skill,
    d20: chosenD20,
    d20Alt: altD20,
    rollType,
    abilityMod: calc.abilityMod,
    isProficient: calc.isProficient,
    pbBonus,
    exhaustionPenalty: calc.exhaustionPenalty,
    total,
    isCrit20,
    isCrit1,
    dc,
    passed,
    logText,
  };
}
