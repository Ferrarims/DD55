import React from 'react';
import { CombatEntity, CellData, BiomeType, WeatherType } from '../../../game/types';
import { getDistanceBetweenEntities, getEntitySizeInSquares, getAttacksPerAction } from '../../../game/combatUtils';
import { executeAttack } from '../../../game/combatEngine';
import { RACES_REFERENCE, DRACONIC_ANCESTRIES } from '../../../lib/api/references';
import { updateCharacter } from '../../../lib/api/characterService';

export interface UseArenaInteractionsProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  grid: CellData[][];
  setGrid: React.Dispatch<React.SetStateAction<CellData[][]>>;
  character: any;
  onCharacterUpdated?: () => Promise<void> | void;
  activeEntity: CombatEntity | undefined;
  activeEntityIndex: number;
  isHeroTurn: boolean;
  isBattleOver: boolean;
  setIsBattleOver: (val: boolean) => void;
  biome: BiomeType;
  isNight: boolean;
  torches: { x: number; y: number }[];
  secondWindUses: number;
  setSecondWindUses: React.Dispatch<React.SetStateAction<number>>;
  secondWindMaxUses: number;
  actionSurgeUses: number;
  setActionSurgeUses: React.Dispatch<React.SetStateAction<number>>;
  actionSurgeMaxUses: number;
  rageUses: number;
  setRageUses: React.Dispatch<React.SetStateAction<number>>;
  rageMaxUses: number;
  channelDivinityUses: number;
  setChannelDivinityUses: React.Dispatch<React.SetStateAction<number>>;
  channelDivinityMaxUses: number;
  spellSlots: number;
  setSpellSlots: React.Dispatch<React.SetStateAction<number>>;
  spellSlotsMax: number;
  focusPointsUses: number;
  setFocusPointsUses: React.Dispatch<React.SetStateAction<number>>;
  focusPointsMaxUses: number;
  goliathAncestryUses: number;
  setGoliathAncestryUses: React.Dispatch<React.SetStateAction<number>>;
  draconicFlightUses: number;
  setDraconicFlightUses: React.Dispatch<React.SetStateAction<number>>;
  activeDraconicFlight: boolean;
  setActiveDraconicFlight: (val: boolean) => void;
  draconicFlightRoundsLeft: number;
  setDraconicFlightRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  largeFormUses: number;
  setLargeFormUses: React.Dispatch<React.SetStateAction<number>>;
  activeLargeForm: boolean;
  setActiveLargeForm: (val: boolean) => void;
  largeFormRoundsLeft: number;
  setLargeFormRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  activeRevelation: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null;
  setActiveRevelation: (val: any) => void;
  setRadiantSoulRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  pendingGoliathHitInfo: { targetId: string; damage: number } | null;
  setPendingGoliathHitInfo: (val: any) => void;
  pendingGoliathDamageInfo: { damageDealt: number; attackerId: string | null; attackerName: string; isWithin60Ft: boolean } | null;
  setPendingGoliathDamageInfo: (val: any) => void;
  pendingShortRestItem: any;
  setPendingShortRestItem: (item: any) => void;
  setShowShortRestModal: (val: boolean) => void;
  totalGameTurns: number;
  setTotalGameTurns: React.Dispatch<React.SetStateAction<number>>;
  lastMealTurn: React.MutableRefObject<number>;
  lastShortRestTurn: React.MutableRefObject<number>;
  prevTurns: React.MutableRefObject<number>;
  setMovementStepsCount: React.Dispatch<React.SetStateAction<number>>;
  setIsVictoryScreenVisible: (val: boolean) => void;
  victoryLogged: React.MutableRefObject<boolean>;
  prevHadVisibleMonstersRef: React.MutableRefObject<boolean>;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
  setItemQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  processDamageAndCheckKill: (targetId: string, dmg: number, attackerName: string, damageType: string, attackerId: string) => void;
  removeConsumableFromCharacter: (itemName: string) => void;
  getActiveFeats: () => string[];
  entitiesRef: React.MutableRefObject<CombatEntity[]>;
}

function formatRoundsToTime(rounds: number): string {
  const totalSeconds = Math.round(rounds * 6);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const totalMinutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (totalMinutes < 60) {
    if (remainingSeconds === 0) {
      return `${totalMinutes}min`;
    }
    return `${totalMinutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export function useArenaInteractions({
  entities,
  setEntities,
  grid,
  setGrid,
  character,
  onCharacterUpdated,
  activeEntity,
  activeEntityIndex,
  isHeroTurn,
  isBattleOver,
  setIsBattleOver,
  biome,
  isNight,
  torches,
  secondWindUses,
  setSecondWindUses,
  secondWindMaxUses,
  actionSurgeUses,
  setActionSurgeUses,
  actionSurgeMaxUses,
  rageUses,
  setRageUses,
  rageMaxUses,
  channelDivinityUses,
  setChannelDivinityUses,
  channelDivinityMaxUses,
  spellSlots,
  setSpellSlots,
  spellSlotsMax,
  focusPointsUses,
  setFocusPointsUses,
  focusPointsMaxUses,
  goliathAncestryUses,
  setGoliathAncestryUses,
  draconicFlightUses,
  setDraconicFlightUses,
  activeDraconicFlight,
  setActiveDraconicFlight,
  draconicFlightRoundsLeft,
  setDraconicFlightRoundsLeft,
  largeFormUses,
  setLargeFormUses,
  activeLargeForm,
  setActiveLargeForm,
  largeFormRoundsLeft,
  setLargeFormRoundsLeft,
  activeRevelation,
  setActiveRevelation,
  setRadiantSoulRoundsLeft,
  pendingGoliathHitInfo,
  setPendingGoliathHitInfo,
  pendingGoliathDamageInfo,
  setPendingGoliathDamageInfo,
  pendingShortRestItem,
  setPendingShortRestItem,
  setShowShortRestModal,
  totalGameTurns,
  setTotalGameTurns,
  lastMealTurn,
  lastShortRestTurn,
  prevTurns,
  setMovementStepsCount,
  setIsVictoryScreenVisible,
  victoryLogged,
  prevHadVisibleMonstersRef,
  addCombatLog,
  setFloatingTexts,
  setItemQuantities,
  processDamageAndCheckKill,
  removeConsumableFromCharacter,
  getActiveFeats,
  entitiesRef,
}: UseArenaInteractionsProps) {

  // Executar efeito de Revelação Celestial (Aasimar)
  const handleExecuteCelestialRevelation = (type: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica') => {
    const hero = entities.find(e => e.type === 'hero' && !e.isDead);
    if (!hero) return;

    if (!isBattleOver && !hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Você já usou sua Ação Bônus neste turno!', 'system');
      return;
    }

    setActiveRevelation(type);

    if (type === 'Alma Radiante') {
      addCombatLog(hero.name, '🌟 ALMA RADIANTE (RADIANT SOUL)!', `Asas reluzentes de luz surgem. Ganhou Velocidade de Voo de 9m e 1x por turno causa dano Radiante extra igual ao seu Bônus de Proficiência ao atingir um ataque ou magia!`, 'system');
      setRadiantSoulRoundsLeft(10);
      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, hasBonusAction: !isBattleOver ? false : e.hasBonusAction, conditions: [...e.conditions, 'Voando'] } : e));
    } else if (type === 'Consumo Radiante') {
      addCombatLog(hero.name, '🌟 CONSUMO RADIANTE (INNER RADIANCE)!', `Luz ofuscante irradia de você. Luz plena em 3m e penumbra em +3m. No fim do seu turno, criaturas a até 3m sofrem dano Radiante igual ao seu Bônus de Proficiência.`, 'system');
      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, hasBonusAction: !isBattleOver ? false : e.hasBonusAction } : e));
    } else if (type === 'Mortalha Necrótica') {
      addCombatLog(hero.name, '💀 MORTALHA NECRÓTICA (NECROTIC SHROUD)!', `Seus olhos escurecem e asas sombrias surgem. Inimigos a até 3m devem passar em Teste de Resistência de Carisma ou ficarão Amedrontados!`, 'system');
      
      const chaMod = Math.floor(((character.charisma || 10) - 10) / 2);
      const pb = character.pb || Math.floor(((character.level || 1) - 1) / 4) + 2;
      const saveDC = 8 + chaMod + pb;
      
      const failedSavesIds = new Set<string>();
      entities.forEach(e => {
        if (e.type === 'monster' && !e.isDead && Math.max(Math.abs(e.x - hero.x), Math.abs(e.y - hero.y)) <= 2) {
          const monsterChaMod = e.saves?.cha || (e.stats ? Math.floor((e.stats.cha - 10) / 2) : 0);
          const roll = Math.floor(Math.random() * 20) + 1;
          const totalSave = roll + monsterChaMod;
          
          if (totalSave < saveDC) {
            failedSavesIds.add(e.id);
            addCombatLog('Mestre do Jogo', '💀 Amedrontado!', `O inimigo ${e.name} falhou na resistência (tirou ${totalSave} vs CD ${saveDC}) e está Amedrontado até o fim do seu próximo turno!`, 'system');
          } else {
            addCombatLog('Mestre do Jogo', '🛡️ Resistiu ao Medo', `O inimigo ${e.name} passou na resistência (tirou ${totalSave} vs CD ${saveDC}) e não foi amedrontado.`, 'system');
          }
        }
      });

      setEntities(prev => prev.map(e => {
        if (e.id === hero.id) {
           return { ...e, hasBonusAction: !isBattleOver ? false : e.hasBonusAction };
        }
        if (e.type === 'monster' && !e.isDead && Math.max(Math.abs(e.x - hero.x), Math.abs(e.y - hero.y)) <= 2) {
          if (failedSavesIds.has(e.id)) {
            return { ...e, conditions: [...e.conditions, 'Amedrontado_New'] };
          }
        }
        return e;
      }));
    }
  };

  // Ancestralidade Gigante do Golias - Executar Efeito no Acerto
  const handleExecuteGoliathHit = (option: 'fire' | 'frost' | 'hill') => {
    if (!pendingGoliathHitInfo) return;
    const { targetId } = pendingGoliathHitInfo;
    const hero = entities.find(e => e.type === 'hero');
    const target = entities.find(e => e.id === targetId);

    if (!hero || !target) {
      setPendingGoliathHitInfo(null);
      return;
    }

    setGoliathAncestryUses(prev => Math.max(0, prev - 1));

    if (option === 'fire') {
      const roll = Math.floor(Math.random() * 10) + 1;
      addCombatLog(
        hero.name,
        '🔥 QUEIMA DO FOGO',
        `Canalizou a fúria do Gigante do Fogo para causar +1d10 (${roll}) de dano de Fogo adicional a ${target.name}!`,
        'damage'
      );
      processDamageAndCheckKill(targetId, roll, hero.name, 'Fogo', 'hero');
      setFloatingTexts(prev => [...prev, {
        id: Math.random().toString(),
        x: target.x,
        y: target.y,
        text: `🔥 +${roll} Fogo!`,
        color: '#f97316',
        progress: 0
      }]);
    } else if (option === 'frost') {
      const roll = Math.floor(Math.random() * 6) + 1;
      addCombatLog(
        hero.name,
        '❄️ FRIO DO GELO',
        `Canalizou a fúria do Gigante do Gelo! Causou +1d6 (${roll}) de dano de Frio adicional a ${target.name} e reduziu o deslocamento do inimigo em 3m!`,
        'damage'
      );
      processDamageAndCheckKill(targetId, roll, hero.name, 'Frio', 'hero');
      
      setEntities(prev => prev.map(e => e.id === targetId ? {
        ...e,
        speed: Math.max(1, e.speed - 2),
        remainingMovement: Math.max(0, e.remainingMovement - 2)
      } : e));

      setFloatingTexts(prev => [...prev, {
        id: Math.random().toString(),
        x: target.x,
        y: target.y,
        text: `❄️ +${roll} Frio!`,
        color: '#38bdf8',
        progress: 0
      }]);
    } else if (option === 'hill') {
      addCombatLog(
        hero.name,
        '🪨 QUEDA DA COLINA',
        `Canalizou a fúria do Gigante da Colina para derrubar ${target.name} no chão!`,
        'system'
      );
      
      setEntities(prev => prev.map(e => e.id === targetId ? {
        ...e,
        conditions: [...e.conditions, 'Caído']
      } : e));

      setFloatingTexts(prev => [...prev, {
        id: Math.random().toString(),
        x: target.x,
        y: target.y,
        text: `🪨 Caído!`,
        color: '#fbbf24',
        progress: 0
      }]);
    }

    setPendingGoliathHitInfo(null);
  };

  // Ancestralidade Gigante do Golias - Executar Efeito de Reação a Dano
  const handleExecuteGoliathDamage = (option: 'stone' | 'storm') => {
    if (!pendingGoliathDamageInfo) return;
    
    const heroEntity = entitiesRef.current.find(e => e.type === 'hero');
    if (!heroEntity || !heroEntity.hasReaction) {
      addCombatLog('Mestre do Jogo', '⚠️ Reação Já Utilizada', 'Sua reação já foi usada neste turno!', 'system');
      setPendingGoliathDamageInfo(null);
      return;
    }

    const { damageDealt, attackerId, attackerName } = pendingGoliathDamageInfo;
    
    setGoliathAncestryUses(prev => Math.max(0, prev - 1));
    setEntities(prev => prev.map(e => e.id === heroEntity.id ? { ...e, hasReaction: false } : e));
    setPendingGoliathDamageInfo(null);

    if (option === 'stone') {
      const roll = Math.floor(Math.random() * 12) + 1;
      const conMod = Math.floor(((character?.constitution || 10) - 10) / 2);
      const totalReduction = roll + conMod;
      const actualHeal = Math.min(damageDealt, totalReduction);

      setEntities(prev => prev.map(e => {
        if (e.id === heroEntity.id) {
          const newHp = Math.min(e.maxHp, e.currentHp + actualHeal);
          return {
            ...e,
            currentHp: newHp,
            isDead: newHp <= 0 ? e.isDead : false
          };
        }
        return e;
      }));

      if (actualHeal > 0) {
        setIsVictoryScreenVisible(false);
      }

      setFloatingTexts(prev => [...prev, {
        id: Math.random().toString(),
        x: heroEntity.x,
        y: heroEntity.y,
        text: `🛡️ Reduziu -${actualHeal}`,
        color: '#a1a1aa',
        progress: 0
      }]);

      addCombatLog(
        heroEntity.name,
        '🪨 RESISTÊNCIA DA PEDRA',
        `Usou sua Reação para canalizar o Gigante da Pedra! Rolou 1d12 + CON (${roll} + ${conMod} = ${totalReduction}) e reduziu o dano sofrido em ${actualHeal} pontos.`,
        'system'
      );
    } else if (option === 'storm') {
      const roll = Math.floor(Math.random() * 8) + 1;
      addCombatLog(
        heroEntity.name,
        '⚡ TROVÃO DA TEMPESTADE',
        `Usou sua Reação para revidar o dano com a fúria do Gigante da Tempestade! Causou ${roll} de dano de Trovão a ${attackerName}.`,
        'damage'
      );

      if (attackerId) {
        processDamageAndCheckKill(attackerId, roll, heroEntity.name, 'Trovão', 'hero');
        const attacker = entities.find(e => e.id === attackerId);
        if (attacker) {
          setFloatingTexts(prev => [...prev, {
            id: Math.random().toString(),
            x: attacker.x,
            y: attacker.y,
            text: `⚡ ${roll} Trovão!`,
            color: '#6366f1',
            progress: 0
          }]);
        }
      }
    }

    setPendingGoliathDamageInfo(null);
  };

  // Draconato: Voo Dracônico
  const handleDraconicFlight = () => {
    if (!isBattleOver && !isHeroTurn) return;
    const hero = isBattleOver ? entities.find(e => e.type === 'hero') : activeEntity;

    if (!hero || hero.type !== 'hero' || hero.isDead) return;

    if (activeDraconicFlight) {
      setActiveDraconicFlight(false);
      addCombatLog(
        hero.name,
        '🐉 Voo Dracônico Recolhido',
        `Você recolheu suas asas espectrais e pousou. A contagem foi pausada (${Math.ceil(draconicFlightRoundsLeft)}r restantes).`,
        'system'
      );
      setEntities(prev => prev.map(e => e.id === hero.id ? {
        ...e,
        conditions: e.conditions.filter(c => c !== 'Voando')
      } : e));
      return;
    }

    if (draconicFlightRoundsLeft <= 0) {
      if (draconicFlightUses <= 0) {
        addCombatLog('Mestre do Jogo', '⚠️ Voo Dracônico Esgotado', 'Você já usou todas as cargas diárias e esgotou a duração total de 10 minutos até o próximo Descanso Longo!', 'system');
        return;
      }
      setDraconicFlightUses(prev => prev - 1);
      setDraconicFlightRoundsLeft(100);
    } else if (draconicFlightRoundsLeft === 100) {
      if (draconicFlightUses <= 0) {
        addCombatLog('Mestre do Jogo', '⚠️ Recurso Esgotado', 'Você já usou seu Voo Dracônico hoje!', 'system');
        return;
      }
      setDraconicFlightUses(prev => prev - 1);
    }

    if (!isBattleOver && !hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Você já usou sua Ação Bônus neste turno!', 'system');
      return;
    }

    setActiveDraconicFlight(true);

    const draconicAncestryStr = (character?.draconic_ancestry || character?.draconicAncestry || '').toLowerCase();
    const ancestry = DRACONIC_ANCESTRIES.find(a => 
      a.name.toLowerCase() === draconicAncestryStr ||
      draconicAncestryStr.includes(a.name.toLowerCase()) ||
      a.name.toLowerCase().includes(draconicAncestryStr)
    );
    const damageType = ancestry?.damageType || 'Energia';

    addCombatLog(
      hero.name,
      draconicFlightRoundsLeft < 100 && draconicFlightRoundsLeft > 0 ? '🐉 VOO DRACÔNICO RETOMADO!' : '🐉 VOO DRACÔNICO ATIVADO!',
      `Asas espectrais de energia de ${damageType} brotam nas suas costas (${formatRoundsToTime(draconicFlightRoundsLeft)} restantes).`,
      'system'
    );

    entities.filter(ent => ent.type === 'monster' && !ent.isDead && ent.hasReaction && !ent.conditions.includes('Incapacitado') && getDistanceBetweenEntities(hero, ent, character?.race, undefined) <= 1).forEach(monster => {
        const atkRes = executeAttack(monster, hero, 'normal', undefined, { isDarkEnvironment: true, torches: [], heroLightRadius: 0, heroX: hero.x, heroY: hero.y }, entities, grid);
        addCombatLog(monster.name, '[Ataque de Oportunidade] ' + atkRes.logTitle, atkRes.logDetail, 'attack');
        setEntities(prev => prev.map(e => e.id === monster.id ? { ...e, hasReaction: false } : e));
    });

    setEntities(prev => prev.map(e => e.id === hero.id ? {
      ...e,
      hasBonusAction: !isBattleOver ? false : e.hasBonusAction,
      conditions: e.conditions.includes('Voando') ? e.conditions : [...e.conditions, 'Voando']
    } : e));
  };

  // Golias: Forma Grande
  const handleLargeForm = () => {
    if (!isBattleOver && !isHeroTurn) return;
    const hero = isBattleOver ? entities.find(e => e.type === 'hero') : activeEntity;

    if (!hero || hero.type !== 'hero' || hero.isDead) return;

    if (activeLargeForm) {
      setActiveLargeForm(false);
      addCombatLog(
        hero.name,
        '🪨 Forma Grande Encerrada',
        `Você voltou ao seu tamanho normal. A contagem foi pausada (${formatRoundsToTime(largeFormRoundsLeft)} restantes).`,
        'system'
      );
      setEntities(prev => prev.map(e => e.id === hero.id ? {
        ...e,
        size: character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio',
        speed: Math.max(1, e.speed - 2),
        remainingMovement: Math.max(0, e.remainingMovement - 2)
      } : e));
      return;
    }

    if (!isBattleOver && !hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Você já usou sua Ação Bônus neste turno!', 'system');
      return;
    }

    if (largeFormUses <= 0 && (largeFormRoundsLeft <= 0 || largeFormRoundsLeft === 100)) {
      if (largeFormRoundsLeft <= 0) {
        addCombatLog('Mestre do Jogo', '⚠️ Forma Grande Esgotada', 'Você já usou todas as cargas diárias e esgotou a duração total de 10 minutos até o próximo Descanso Longo!', 'system');
      } else {
        addCombatLog('Mestre do Jogo', '⚠️ Recurso Esgotado', 'Você já usou seu crescimento diário hoje!', 'system');
      }
      return;
    }

    const pushedMonsterIds = new Set<string>();
    const monsterPushedPositions: { [id: string]: { x: number; y: number } } = {};
    const displacementLogs: string[] = [];

    const adjacentMonsters = entities.filter(e => {
      if (e.type !== 'monster' || e.isDead) return false;
      const mSize = getEntitySizeInSquares(e.size || 'Médio');
      
      const expandedCells = [
        { x: hero.x + 1, y: hero.y },
        { x: hero.x, y: hero.y + 1 },
        { x: hero.x + 1, y: hero.y + 1 }
      ];
      
      return expandedCells.some(cell => 
        cell.x >= e.x && cell.x < e.x + mSize &&
        cell.y >= e.y && cell.y < e.y + mSize
      );
    });

    adjacentMonsters.forEach(monster => {
      let dx = Math.sign(monster.x - hero.x);
      let dy = Math.sign(monster.y - hero.y);
      if (dx === 0 && dy === 0) dx = 1;

      const targetX = monster.x + dx;
      const targetY = monster.y + dy;

      if (targetY < 0 || targetY >= grid.length || targetX < 0 || targetX >= (grid[0]?.length || 150)) return;

      const targetCell = grid[targetY]?.[targetX];
      if (!targetCell || targetCell.terrain === 'wall' || targetCell.movementCost === Infinity) return;

      const occupied = entities.find(e => {
        if (e.isDead) return false;
        if (e.id === hero.id) {
          return targetX >= hero.x && targetX < hero.x + 2 && targetY >= hero.y && targetY < hero.y + 2;
        }
        const otherPushedPos = monsterPushedPositions[e.id];
        const ex = otherPushedPos ? otherPushedPos.x : e.x;
        const ey = otherPushedPos ? otherPushedPos.y : e.y;
        const eSize = getEntitySizeInSquares(e.type === 'hero' ? (e.size || (activeLargeForm ? 'Grande' : (character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio'))) : (e.size || 'Médio'));
        return targetX >= ex && targetX < ex + eSize && targetY >= ey && targetY < ey + eSize;
      });

      if (!occupied) {
        pushedMonsterIds.add(monster.id);
        monsterPushedPositions[monster.id] = { x: targetX, y: targetY };
        displacementLogs.push(`${monster.name} foi empurrado para trás pelo crescimento de ${hero.name}!`);
      }
    });

    const targetSize = 2;
    for (let dx = 0; dx < targetSize; dx++) {
      for (let dy = 0; dy < targetSize; dy++) {
        const cx = hero.x + dx;
        const cy = hero.y + dy;
        if (cx < 0 || cx >= 150 || cy < 0 || cy >= 150) {
          addCombatLog('Mestre do Jogo', '⚠️ Sem Espaço', 'Não há espaço suficiente perto das bordas do mundo para você crescer!', 'system');
          return;
        }
        const cell = grid[cy]?.[cx];
        if (!cell || cell.terrain === 'wall' || cell.movementCost === Infinity) {
          addCombatLog('Mestre do Jogo', '⚠️ Sem Espaço', 'Não há espaço suficiente (bloqueado por rocha ou parede) para você crescer!', 'system');
          return;
        }
        const occupied = entities.find(e => {
          if (e.isDead || e.id === hero.id) return false;
          if (pushedMonsterIds.has(e.id)) return false;
          const eSize = getEntitySizeInSquares(e.type === 'hero' ? (e.size || (activeLargeForm ? 'Grande' : (character?.race ? RACES_REFERENCE[character.race]?.size : 'Médio'))) : (e.size || 'Médio'));
          return cx >= e.x && cx < e.x + eSize && cy >= e.y && cy < e.y + eSize;
        });
        if (occupied) {
          addCombatLog('Mestre do Jogo', '⚠️ Sem Espaço', `Não há espaço suficiente (ocupado por ${occupied.name}) para você crescer!`, 'system');
          return;
        }
      }
    }

    if (largeFormRoundsLeft <= 0) {
      setLargeFormUses(prev => prev - 1);
      setLargeFormRoundsLeft(100);
    } else if (largeFormRoundsLeft === 100) {
      setLargeFormUses(prev => prev - 1);
    }

    setActiveLargeForm(true);

    addCombatLog(
      hero.name,
      largeFormRoundsLeft < 100 && largeFormRoundsLeft > 0 ? '🪨 FORMA GRANDE RETOMADA!' : '🪨 FORMA GRANDE ATIVADA!',
      `Seu corpo se expande para o tamanho de um gigante! Você tem Vantagem em testes de Força e seu Deslocamento aumenta em +3m (+2 cel) (${formatRoundsToTime(largeFormRoundsLeft)} restantes).`,
      'system'
    );

    displacementLogs.forEach(logText => {
      addCombatLog('Mestre do Jogo', '💨 Inimigo Deslocado', logText, 'system');
    });

    setEntities(prev => prev.map(e => {
      if (e.id === hero.id) {
        return {
          ...e,
          hasBonusAction: !isBattleOver ? false : e.hasBonusAction,
          size: 'Grande',
          speed: e.speed + 2,
          remainingMovement: e.remainingMovement + 2
        };
      }
      if (pushedMonsterIds.has(e.id)) {
        const newPos = monsterPushedPositions[e.id];
        return {
          ...e,
          x: newPos.x,
          y: newPos.y
        };
      }
      return e;
    }));
  };

  // Esquivar (Dodge)
  const handleHeroDodge = () => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;
    if (!hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          const newConditions = e.conditions.includes('Esquivando') ? e.conditions : [...e.conditions, 'Esquivando'];
          return {
            ...e,
            hasAction: false,
            conditions: newConditions
          };
        }
        return e;
      })
    );
    addCombatLog(hero.name, '🛡️ ESQUIVAR (DODGE)!', 'Assumiu postura defensiva. Ataques contra você têm Desvantagem e testes de resistência de Destreza têm Vantagem até o início do seu próximo turno.', 'system');
  };

  // Esconder (Hide)
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

    const isNearObstacle = (() => {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = hero.x + dx;
          const ny = hero.y + dy;
          const neighbor = grid[ny]?.[nx];
          if (neighbor && neighbor.terrain === 'wall') {
            return true;
          }
        }
      }
      return false;
    })();

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

    const d20 = Math.floor(Math.random() * 20) + 1;
    const totalCheck = d20 + totalBonus;
    const dc = 15;
    const passed = totalCheck >= dc;

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
        `Aproveitando cobertura de obstáculo, teste de Destreza (Furtividade): d20(${d20}) + ${totalBonus} = ${totalCheck} vs CD ${dc} (PASSOU!). Ganhou a condição Invisível.`,
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
        `Teste de Destreza (Furtividade): d20(${d20}) + ${totalBonus} = ${totalCheck} vs CD ${dc} (FALHOU). Seus movimentos denunciaram sua posição.`,
        'system'
      );
    }
  };

  // Confirmar Descanso Curto
  const confirmGameShortRest = (diceToSpend: number) => {
    setShowShortRestModal(false);
    const item = pendingShortRestItem;
    if (!item) return;

    const hero = entities.find(e => e.type === 'hero');
    if (!hero) return;

    const className = (character.class_name || character.charClass || '').toLowerCase();
    setActiveDraconicFlight(false);
    if (activeRevelation === 'Alma Radiante') {
      setActiveRevelation(null);
    }
    setEntities(prev => prev.map(e => e.type === 'hero' ? {
      ...e,
      conditions: e.conditions.filter(c => c !== 'Voando')
    } : e));

    const allInv = [...(character.inventory || []), ...(character.character_inventory || [])];
    const rationItem = allInv.find((inv: any) => {
      const name = (inv.item?.name || inv.items?.name || '').toLowerCase();
      return name.includes('ração') || name.includes('racao') || name.includes('ration');
    })?.item?.name || allInv.find((inv: any) => {
      const name = (inv.item?.name || inv.items?.name || '').toLowerCase();
      return name.includes('ração') || name.includes('racao') || name.includes('ration');
    })?.items?.name;

    if (rationItem) {
      removeConsumableFromCharacter(rationItem);
      lastMealTurn.current = totalGameTurns + 17;
      const match = rationItem.match(/\b(\d+)\s*x?\b/i);
      let rationBaseName = rationItem.replace(/\b\d+\s*x?\b/i, '').trim();
      if (rationBaseName.startsWith('x ')) rationBaseName = rationBaseName.substring(2);
      rationBaseName = rationBaseName.charAt(0).toUpperCase() + rationBaseName.slice(1);
      const canonicalRationId = rationBaseName.toLowerCase();
      setItemQuantities(prev => ({
        ...prev,
        [canonicalRationId]: Math.max(0, (prev[canonicalRationId] ?? 1) - 1)
      }));
    }

    const ambushChance = item.effectType === 'tent' ? 0.20 : 0.50;
    const isAmbushed = Math.random() < ambushChance;

    if (!isAmbushed) {
      const newSwUses = Math.min(secondWindMaxUses, secondWindUses + 1);
      setSecondWindUses(newSwUses);
      setActionSurgeUses(actionSurgeMaxUses);
      setChannelDivinityUses(prev => Math.min(channelDivinityMaxUses, prev + 1));
      if (className.includes('bruxo') || className.includes('warlock')) {
        setSpellSlots(spellSlotsMax);
      }
      setFocusPointsUses(prev => Math.min(focusPointsMaxUses, prev + 1));

      if (character && Array.isArray(character.class_resources)) {
        const updatedResources = character.class_resources.map((r: any) => {
          if (!r) return r;
          const name = (r.name || '').toLowerCase();
          if (name.includes('fôlego') || name.includes('folego') || name.includes('second wind')) {
            return { ...r, used: Math.max(0, (r.max || secondWindMaxUses) - newSwUses) };
          }
          if (r.reset === 'short' || r.reset === 'short/long') {
            return { ...r, used: 0 };
          }
          return r;
        });
        character.class_resources = updatedResources;
        if (character.id) {
          updateCharacter(character.id, { class_resources: updatedResources }).catch(err => console.warn(err));
        }
      }

      let hitDieSides = 8;
      if (className.includes('bárbaro') || className.includes('barbarian')) hitDieSides = 12;
      else if (className.includes('guerreiro') || className.includes('fighter') || className.includes('paladino') || className.includes('paladin') || className.includes('patrulheiro') || className.includes('ranger')) hitDieSides = 10;
      else if (className.includes('mago') || className.includes('wizard') || className.includes('feiticeiro') || className.includes('sorcerer')) hitDieSides = 6;

      const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
      let rollHp = 0;
      for (let i = 0; i < diceToSpend; i++) {
        const dieRoll = Math.floor(Math.random() * hitDieSides) + 1;
        rollHp += Math.max(1, dieRoll + conMod);
      }
      
      const activeFeatsList = getActiveFeats();
      const hasFortitude = activeFeatsList.includes('Dádiva da Fortitude');
      const extraHeal = Math.floor(((character.constitution || 10) - 10) / 2) + Math.max(1, Math.floor(((character.level || 1) - 1) / 4) + 2);
      if (hasFortitude) rollHp += extraHeal;

      const newHp = Math.min(hero.maxHp, hero.currentHp + rollHp);
      const recovered = newHp - hero.currentHp;
      const newHitDice = Math.max(0, (character.hit_dice_current ?? character.level ?? 1) - diceToSpend);

      if (character) {
        character.current_hp = newHp;
        character.hit_dice_current = newHitDice;
        if (character.id) {
          updateCharacter(character.id, {
            current_hp: newHp,
            hit_dice_current: newHitDice
          }).catch(err => console.error("Error updating short rest in DB:", err));
        }
      }

      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, currentHp: newHp, hasAction: false } : e));

      if (onCharacterUpdated) {
        onCharacterUpdated();
      }

      const newTurns = totalGameTurns + 17;
      prevTurns.current = newTurns;
      lastShortRestTurn.current = newTurns;
      setTotalGameTurns(newTurns);
      setMovementStepsCount(0);

      setFloatingTexts(prev => [...prev, {
        id: Math.random().toString(),
        x: hero.x,
        y: hero.y,
        text: `⛺ Descanso Curto (+${recovered} PV)`,
        color: '#10b981',
        progress: 0
      }]);

      addCombatLog(
        hero.name,
        item.effectType === 'tent' ? `⛺ DESCANSO CURTO NA TENDA` : `🛌 DESCANSO CURTO NO ACAMPAMENTO`,
        `Você descansou com segurança. Gastou ${diceToSpend} Dados de Vida, recuperou ${recovered} PV e renovou suas habilidades de combate (-1 Ração consumida, +2h de tempo de jogo decorrido).`,
        'heal'
      );
    }
    setPendingShortRestItem(null);
  };

  // Segundo Fôlego / Recuperar Fôlego (Second Wind)
  const handleHeroSecondWind = () => {
    const hero = entities.find(e => e.type === 'hero' && !e.isDead) || activeEntity;
    if (!hero || hero.isDead) return;

    if (!isBattleOver && !isHeroTurn) return;

    if (secondWindUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recursos Esgotados', 'Você já usou todas as cargas de Recuperar Fôlego!', 'system');
      return;
    }

    if (!isBattleOver && !hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Você já usou sua Ação Bônus neste turno!', 'system');
      return;
    }

    if (hero.currentHp >= hero.maxHp) {
      addCombatLog('Mestre do Jogo', '⚠️ Vida no Máximo (100%)', 'Seus pontos de vida já estão em 100% (máximo), não é possível usar o Recuperar Fôlego.', 'system');
      return;
    }

    const conMod = Math.floor(((character.constitution || 10) - 10) / 2);
    const hasFortitude = getActiveFeats().includes('Dádiva da Fortitude');
    const extraHeal = hasFortitude ? Math.max(0, conMod) : 0;

    let healAmount = Math.floor(Math.random() * 10) + 1 + (hero.level || 1);
    if (hasFortitude) healAmount += extraHeal;

    const newHp = Math.min(hero.maxHp, hero.currentHp + healAmount);
    const recovered = newHp - hero.currentHp;
    const remaining = secondWindUses - 1;

    setSecondWindUses(remaining);

    if (character && Array.isArray(character.class_resources)) {
      const updatedRes = character.class_resources.map((r: any) => {
        if (!r) return r;
        const name = (r.name || '').toLowerCase();
        if (name.includes('fôlego') || name.includes('folego') || name.includes('second wind')) {
          return { ...r, used: Math.max(0, (r.max || secondWindMaxUses) - remaining) };
        }
        return r;
      });
      character.class_resources = updatedRes;
      if (character.id) {
        updateCharacter(character.id, { class_resources: updatedRes }).catch(err => console.warn(err));
      }
    }

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            currentHp: newHp,
            hasBonusAction: isBattleOver ? e.hasBonusAction : false
          };
        }
        return e;
      })
    );
    addCombatLog(
      hero.name,
      '⚡ RECUPERAR FÔLEGO (SECOND WIND)!',
      `Invocou a resiliência de combate e recuperou ${recovered} PV!${hasFortitude ? ` (+ ${extraHeal} de Dádiva da Fortitude)` : ''} (Usos restantes: ${remaining}/${secondWindMaxUses})`,
      'heal'
    );
  };

  // Surto de Ação (Action Surge)
  const handleHeroActionSurge = () => {
    if (isBattleOver) {
      addCombatLog('Mestre do Jogo', '⚠️ Apenas em Combate', 'O Surto de Ação só pode ser utilizado durante um combate ativo!', 'system');
      return;
    }
    if (!isHeroTurn || !activeEntity) return;
    const hero = activeEntity;

    if (hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Necessária', 'Você precisa utilizar sua Ação Principal antes de usar o Surto de Ação!', 'system');
      return;
    }

    if ((hero.attacksRemaining || 0) > 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Ataques Pendentes', 'Você precisa realizar todos os seus ataques da Ação Principal (incluindo Ataque Extra) antes de usar o Surto de Ação!', 'system');
      return;
    }

    if (actionSurgeUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recursos Esgotados', 'Você já usou seu Surto de Ação neste descanso!', 'system');
      return;
    }

    const remaining = actionSurgeUses - 1;
    setActionSurgeUses(remaining);

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            hasAction: true,
            attacksRemaining: 0,
            isActionSurgeActive: true,
            attackedWeaponNamesThisAction: []
          };
        }
        return e;
      })
    );

    const atksPerAction = getAttacksPerAction(hero) || getAttacksPerAction(character);
    const attackDesc = atksPerAction > 1 ? ` (incluindo os ${atksPerAction} ataques do Ataque Extra)` : '';

    addCombatLog(
      hero.name,
      '⚡ SURTO DE AÇÃO (ACTION SURGE)!',
      `Superou os limites corporais e GANHOU UMA AÇÃO PRINCIPAL ADICIONAL COMPLETA${attackDesc}! (Usos restantes: ${remaining}/${actionSurgeMaxUses})`,
      'system'
    );
  };

  // Fúria (Rage)
  const handleHeroRage = () => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;

    if (rageUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Recursos Esgotados', 'Você já gastou todos os seus usos de Fúria!', 'system');
      return;
    }

    if (!hero.hasBonusAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Bônus Já Utilizada', 'Você já usou sua Ação Bônus neste turno!', 'system');
      return;
    }

    const remaining = rageUses - 1;
    setRageUses(remaining);

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            hasBonusAction: false,
            ac: e.armor_class + 1
          };
        }
        return e;
      })
    );

    addCombatLog(
      hero.name,
      '🔥 FÚRIA BÁRBARA ATIVADA!',
      `Entrou em estado selvagem de combate (+2 no Dano e +1 na CA)! (Usos restantes: ${remaining}/${rageMaxUses})`,
      'heal'
    );
  };

  // Desengajar (Disengage)
  const handleHeroDisengage = () => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;
    if (!hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    const isThreatened = entities.some(m => m.type === 'monster' && !m.isDead && getDistanceBetweenEntities(m, hero, character?.race, activeLargeForm) <= (m.range || 1));
    if (!isThreatened) {
      addCombatLog('Mestre do Jogo', '⚠️ Posição Segura', 'Você não está sob a área de alcance corpo a corpo de nenhum inimigo ativo para precisar desengajar!', 'system');
      return;
    }

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          const newConditions = e.conditions.includes('Desengajando') ? e.conditions : [...e.conditions, 'Desengajando'];
          return {
            ...e,
            hasAction: false,
            conditions: newConditions
          };
        }
        return e;
      })
    );
    addCombatLog(hero.name, '💨 DESENGAJAR!', 'Você recua taticamente. Seu movimento não provocará ataques de oportunidade pelo resto do turno.', 'system');
  };

  // Levantar-se (Stand Up)
  const handleHeroStandUp = () => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;
    const isProne = hero.conditions?.some(c => c === 'Caído' || c === 'Prone');
    if (!isProne) return;

    if (hero.speed === 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Velocidade é 0', 'Você não pode se levantar se sua velocidade for 0!', 'system');
      return;
    }

    const costToStandUp = Math.floor(hero.speed / 2);
    if (hero.remainingMovement < costToStandUp) {
      addCombatLog(
        'Mestre do Jogo',
        '⚠️ Movimento Insuficiente',
        `Você precisa de ${costToStandUp * 1.5}m de movimento para se levantar, mas só possui ${hero.remainingMovement * 1.5}m restantes!`,
        'system'
      );
      return;
    }

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          return {
            ...e,
            remainingMovement: e.remainingMovement - costToStandUp,
            conditions: e.conditions.filter(c => c !== 'Caído' && c !== 'Prone')
          };
        }
        return e;
      })
    );

    addCombatLog(
      hero.name,
      '💥 LEVANTAR-SE!',
      `Gastou ${costToStandUp * 1.5}m de movimento para se levantar, encerrando a condição Caído (Prone).`,
      'system'
    );
  };

  // Escapar do Agarrão (Escape Grapple)
  const handleHeroEscapeGrapple = () => {
    if (!isHeroTurn || isBattleOver || !activeEntity) return;
    const hero = activeEntity;
    const isGrappled = hero.conditions?.some(c => c === 'Agarrado' || c === 'Agarrada' || c === 'Grappled');
    if (!isGrappled) return;

    if (!hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    let grapplerName = 'Inimigo';
    let escapeDc = 12;
    if (hero.grappledById) {
      const grappler = entities.find(e => e.id === hero.grappledById);
      if (grappler) {
        grapplerName = grappler.name;
        const gStr = grappler.stats ? Math.floor((grappler.stats.str - 10) / 2) : 2;
        const gDex = grappler.stats ? Math.floor((grappler.stats.dex - 10) / 2) : 1;
        const gProf = grappler.cr ? Math.max(2, Math.floor((grappler.cr + 7) / 4)) : 2;
        escapeDc = 8 + gProf + Math.max(gStr, gDex);
      }
    }

    const strMod = Math.floor(((character?.strength || 10) - 10) / 2);
    const dexMod = Math.floor(((character?.dexterity || 10) - 10) / 2);
    const bestMod = Math.max(strMod, dexMod);
    const statName = strMod >= dexMod ? 'Força (Atletismo)' : 'Destreza (Acrobacia)';

    const d20 = Math.floor(Math.random() * 20) + 1;
    const totalCheck = d20 + bestMod;
    const passed = totalCheck >= escapeDc;

    setEntities(prev =>
      prev.map(e => {
        if (e.id === hero.id) {
          const newConditions = passed 
            ? e.conditions.filter(c => c !== 'Agarrado' && c !== 'Agarrada' && c !== 'Grappled')
            : e.conditions;
          return {
            ...e,
            hasAction: false,
            grappledById: passed ? undefined : e.grappledById,
            conditions: newConditions
          };
        }
        return e;
      })
    );

    if (passed) {
      setFloatingTexts(prev => [
        ...prev,
        { id: Math.random().toString(), x: hero.x, y: hero.y, text: '💥 Soltou-se!', color: '#10b981', progress: 0 }
      ]);
      addCombatLog(
        hero.name,
        '💥 ESCAPOU DO AGARRÃO - SUCESSO!',
        `Teste de ${statName}: d20(${d20}) + ${bestMod} = ${totalCheck} vs CD ${escapeDc} de ${grapplerName} (PASSOU!). Livrou-se do agarrão e recuperou seu movimento.`,
        'system'
      );
    } else {
      setFloatingTexts(prev => [
        ...prev,
        { id: Math.random().toString(), x: hero.x, y: hero.y, text: '❌ Falha ao Escapar', color: '#ef4444', progress: 0 }
      ]);
      addCombatLog(
        hero.name,
        '💥 ESCAPOU DO AGARRÃO - FALHA',
        `Teste de ${statName}: d20(${d20}) + ${bestMod} = ${totalCheck} vs CD ${escapeDc} de ${grapplerName} (FALHOU). Continua agarrado.`,
        'system'
      );
    }
  };

  return {
    handleExecuteCelestialRevelation,
    handleExecuteGoliathHit,
    handleExecuteGoliathDamage,
    handleDraconicFlight,
    handleLargeForm,
    handleHeroDodge,
    handleHeroHide,
    confirmGameShortRest,
    handleHeroSecondWind,
    handleHeroActionSurge,
    handleHeroRage,
    handleHeroDisengage,
    handleHeroStandUp,
    handleHeroEscapeGrapple,
  };
}