import React from 'react';
import { CombatEntity, CellData, BiomeType } from '../../../../../game/types';

interface UseStealthAndHidingProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  grid: CellData[][];
  character: any;
  activeEntity: CombatEntity | undefined;
  isHeroTurn: boolean;
  isBattleOver: boolean;
  biome: BiomeType;
  isNight: boolean;
  torches: { x: number; y: number }[];
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
}

export function useStealthAndHiding({
  setEntities,
  grid,
  character,
  activeEntity,
  isHeroTurn,
  isBattleOver,
  biome,
  isNight,
  torches,
  addCombatLog,
  setFloatingTexts,
}: UseStealthAndHidingProps) {
  const handleHeroHide = () => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;
    if (!hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    const isIndoor = biome === 'Caverna' || biome === 'Masmorra';
    const isDarkEnv = isIndoor || (isNight && (biome === 'Floresta' || biome === 'Pântano' || biome === 'Deserto'));
    const isLitByTorch = torches.some(t => Math.max(Math.abs(hero.x - t.x), Math.abs(hero.y - t.y)) <= 4);
    const isInDarkness = isDarkEnv && !isLitByTorch;
    const isDay = !isInDarkness;

    const heroCell = grid[hero.y]?.[hero.x];
    const isOnVegetation = heroCell && heroCell.terrain === 'difficult';

    let isNearObstacle = false;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = hero.x + dx;
        const ny = hero.y + dy;
        const neighbor = grid[ny]?.[nx];
        if (neighbor && neighbor.terrain === 'wall') {
          isNearObstacle = true;
          break;
        }
      }
      if (isNearObstacle) break;
    }

    const isHalfling = character?.race === 'Pequenino' || character?.race?.toLowerCase().includes('pequenino') || character?.race?.toLowerCase().includes('halfling');
    const canHideGeneral = isInDarkness && isOnVegetation;
    const canHideHalflingDay = isHalfling && isDay && isOnVegetation && isNearObstacle;

    if (!canHideGeneral && !canHideHalflingDay) {
      addCombatLog(
        'Mestre do Jogo',
        '⚠️ Condições de Furtividade Insuficientes',
        !isOnVegetation
          ? 'Você precisa estar em cima de um quadrado de vegetação (terreno difícil) para se esconder.'
          : isDay && !isHalfling
          ? 'Personagens comuns não podem se esconder à luz do dia! É necessário estar no escuro e sobre vegetação.'
          : isDay && isHalfling && !isNearObstacle
          ? 'Pequeninos de dia precisam estar sobre vegetação e ao lado de um obstáculo, árvore ou rocha para se esconder.'
          : 'Você precisa estar no escuro e sobre vegetação para se esconder.',
        'system'
      );
      return;
    }

    const dexMod = Math.floor(((character?.dexterity || 10) - 10) / 2);
    const skillsList = character?.skills || [];
    const hasStealthProf = skillsList.some((s: string) => s.toLowerCase().includes('furtividade') || s.toLowerCase().includes('stealth'));
    const profBonus = hasStealthProf ? (character?.proficiencyBonus || 2) : 0;
    const totalBonus = dexMod + profBonus;
    const exhaustionLevel = character?.exhaustion_level ?? hero.exhaustionLevel ?? 0;

    const d20 = Math.floor(Math.random() * 20) + 1;
    const totalCheck = d20 + totalBonus - (exhaustionLevel * 2);
    const dc = 15;
    const passed = totalCheck >= dc;
    const exDetail = exhaustionLevel > 0 ? ` - Exaustão (${exhaustionLevel * 2})` : '';

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          const newConditions = passed 
            ? (e.conditions.includes('Invisível') ? e.conditions : [...e.conditions, 'Invisível'])
            : e.conditions;
          return {
            ...e,
            hasAction: false,
            conditions: newConditions
          };
        }
        return e;
      })
    );

    if (passed) {
      setFloatingTexts(prev => [
        ...prev,
        { id: Math.random().toString(), x: hero.x, y: hero.y, text: '👻 Invisível (Furtivo!)', color: '#10b981', progress: 0 }
      ]);
      addCombatLog(
        hero.name,
        '👻 ESCONDER (HIDE) - SUCESSO!',
        `Aproveitando cobertura de obstáculo, teste de Destreza (Furtividade): d20(${d20}) + ${totalBonus}${exDetail} = ${totalCheck} vs CD ${dc} (PASSOU!). Ganhou a condição Invisível.`,
        'system'
      );
    } else {
      setFloatingTexts(prev => [
        ...prev,
        { id: Math.random().toString(), x: hero.x, y: hero.y, text: '❌ Falha ao Esconder', color: '#ef4444', progress: 0 }
      ]);
      addCombatLog(
        hero.name,
        '👻 ESCONDER (HIDE) - FALHA',
        `Teste de Destreza (Furtividade): d20(${d20}) + ${totalBonus}${exDetail} = ${totalCheck} vs CD ${dc} (FALHOU). Seus movimentos denunciaram sua posição.`,
        'system'
      );
    }
  };

  return {
    handleHeroHide,
  };
}
