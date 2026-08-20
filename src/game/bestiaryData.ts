import { MonsterTemplate } from './types';
import {
  MONSTERS_5E_DATA,
  MONSTER_XP_BY_CR,
  parseSpeedToGridCells,
  extractPrimaryAttack
} from '../lib/api/references';

/**
 * Converte os monstros do JSON oficial do D&D 5.5e para o formato MonsterTemplate
 */
export let BESTIARY_TEMPLATES: MonsterTemplate[] = MONSTERS_5E_DATA.map(m => {
  const primaryAtk = extractPrimaryAttack(m);
  const xp = MONSTER_XP_BY_CR[m.cr] || Math.floor(m.cr * 1000) || 50;

  return {
    id: m.id,
    name: m.name,
    cr: m.cr,
    pb: m.pb,
    hp: m.hp,
    armor_class: m.armor_class || m.ac || 10,
    speed: parseSpeedToGridCells(m.speed),
    attackBonus: primaryAtk.attackBonus,
    damageDice: primaryAtk.damageDice,
    range: primaryAtk.range,
    xp,
    icon: m.icon,
    color: m.color,
    biomePreference: m.biomePreference,
    stats: m.stats,
    senses: m.senses,
    vulnerabilities: m.vulnerabilities,
    resistances: m.resistances,
    immunities: m.immunities,
    condition_immunities: m.condition_immunities,
    saves: m.saves,
    skills: m.skills,
    traits: m.traits,
    actions: m.actions,
    bonus_actions: m.bonus_actions,
    reactions: m.reactions,
    legendary_actions: m.legendary_actions
  };
});

export function updateBestiaryTemplates(newTemplates: MonsterTemplate[]): void {
  BESTIARY_TEMPLATES = newTemplates;
}

/**
 * Calcula um encontro aceitável, justo e equilibrado com base na Nível de Desafio (CR) do D&D 5.5e
 */
export function getBalancedEncounterForLevel(
  characterLevel: number = 1,
  biome: string = 'Caverna',
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): { monsters: MonsterTemplate[]; encounterDifficulty: string; totalCr: number } {
  if (biome === 'Arena de Testes') {
    return { monsters: [], encounterDifficulty: 'Arena de Testes (Sem Monstros)', totalCr: 0 };
  }

  const level = Math.max(1, characterLevel);

  // Definir limite máximo de CR individual e orçamento total com base no nível do jogador
  let maxSingleCR = 0.25;
  let minCR = 0.125;
  let targetTotalCR = 0.5;
  let difficultyName = 'Médio';

  if (level === 1) {
    maxSingleCR = 0.25;
    minCR = 0.125;
    targetTotalCR = 0.5;
    difficultyName = 'Desafio Nível 1 (Iniciante)';
  } else if (level === 2) {
    maxSingleCR = 0.5;
    minCR = 0.125;
    targetTotalCR = 1.0;
    difficultyName = 'Desafio Nível 2 (Equilibrado)';
  } else if (level === 3) {
    maxSingleCR = 1.0;
    minCR = 0.25;
    targetTotalCR = 1.5;
    difficultyName = 'Desafio Nível 3 (Moderado)';
  } else if (level === 4) {
    maxSingleCR = 2.0;
    minCR = 0.5;
    targetTotalCR = 2.5;
    difficultyName = 'Desafio Nível 4 (Desafiador)';
  } else if (level <= 6) {
    maxSingleCR = 3.0;
    minCR = 1.0;
    targetTotalCR = 3.5;
    difficultyName = `Desafio Nível ${level} (Heroico)`;
  } else if (level <= 9) {
    maxSingleCR = 5.0;
    minCR = 2.0;
    targetTotalCR = 6.0;
    difficultyName = `Desafio Nível ${level} (Veterano)`;
  } else if (level <= 12) {
    maxSingleCR = 8.0;
    minCR = 3.0;
    targetTotalCR = 10.0;
    difficultyName = `Desafio Nível ${level} (Mestre)`;
  } else if (level <= 16) {
    maxSingleCR = 13.0;
    minCR = 5.0;
    targetTotalCR = 15.0;
    difficultyName = `Desafio Nível ${level} (Lendário)`;
  } else {
    maxSingleCR = 30.0;
    minCR = 13.0;
    targetTotalCR = level * 1.5;
    difficultyName = `Desafio Épico Nível ${level}`;
  }

  // Ajustar multiplicadores com base na dificuldade selecionada
  let multiplier = 1.0;
  if (difficulty === 'easy') {
    multiplier = 0.5;
  } else if (difficulty === 'hard') {
    multiplier = 1.6;
  }

  targetTotalCR = targetTotalCR * multiplier;

  if (difficulty === 'easy') {
    maxSingleCR = Math.max(0.125, maxSingleCR * 0.5);
    difficultyName += ' (Fácil)';
  } else if (difficulty === 'hard') {
    maxSingleCR = maxSingleCR * 1.5;
    difficultyName += ' (Difícil)';
  } else {
    difficultyName += ' (Médio)';
  }

  // Filtrar monstros adequados ao bioma E dentro do intervalo de CR do nível
  let eligibleMonsters = BESTIARY_TEMPLATES.filter(
    m => m.cr <= maxSingleCR && (!m.biomePreference || m.biomePreference.includes(biome))
  );

  // Se não houver no bioma, busca em todo o bestiário
  if (eligibleMonsters.length === 0) {
    eligibleMonsters = BESTIARY_TEMPLATES.filter(m => m.cr <= maxSingleCR);
  }

  // Se ainda estiver vazio, pega todos com CR <= maxSingleCR ou os menores disponíveis
  if (eligibleMonsters.length === 0) {
    eligibleMonsters = BESTIARY_TEMPLATES.filter(m => m.cr <= 0.25);
  }

  const selected: MonsterTemplate[] = [];
  let currentTotalCR = 0;

  // Filtrar monstros fracos/horda (CR <= 0.5) para permitir grupos maiores (ex: 3 a 6 monstros, como 5 lobos/goblins)
  const weakPool = eligibleMonsters.filter(m => m.cr <= 0.5);
  const useHorde = weakPool.length > 0 && (level >= 2 || Math.random() < 0.6);

  if (useHorde && weakPool.length > 0) {
    const baseMonster = weakPool[Math.floor(Math.random() * weakPool.length)];
    let hordeCount = 3;
    if (baseMonster.cr <= 0.125) {
      hordeCount = Math.floor(Math.random() * 3) + 4; // 4 a 6
    } else if (baseMonster.cr <= 0.25) {
      hordeCount = Math.floor(Math.random() * 3) + 3; // 3 a 5
    } else {
      hordeCount = Math.floor(Math.random() * 2) + 2; // 2 a 3
    }

    if (level === 1) {
      hordeCount = Math.min(hordeCount, baseMonster.cr <= 0.125 ? 4 : 3);
    }

    for (let i = 0; i < hordeCount; i++) {
      selected.push(baseMonster);
      currentTotalCR += baseMonster.cr;
    }
  } else {
    // Abordagem padrão (1 a 3 monstros variados)
    const preferredMonsters = eligibleMonsters.filter(m => m.cr >= minCR);
    const pool = preferredMonsters.length > 0 ? preferredMonsters : eligibleMonsters;

    const maxCount = level === 1 ? (Math.random() < 0.6 ? 1 : 2) : Math.floor(Math.random() * 3) + 1; // 1 a 3

    for (let i = 0; i < maxCount; i++) {
      const candidate = pool[Math.floor(Math.random() * pool.length)];
      if (candidate) {
        selected.push(candidate);
        currentTotalCR += candidate.cr;
      }
      if (currentTotalCR >= targetTotalCR * 1.5) break;
    }
  }

  // Se nada foi selecionado, fallback para o primeiro
  if (selected.length === 0) {
    selected.push(BESTIARY_TEMPLATES[0]);
    currentTotalCR = BESTIARY_TEMPLATES[0].cr;
  }

  return {
    monsters: selected,
    encounterDifficulty: difficultyName,
    totalCr: currentTotalCR
  };
}
