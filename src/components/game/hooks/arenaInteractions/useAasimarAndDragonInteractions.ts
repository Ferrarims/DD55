import React from 'react';
import { CombatEntity, CellData } from '../../../../game/types';
import { getDistanceBetweenEntities } from '../../../../game/combatUtils';
import { executeAttack } from '../../../../game/combatEngine';
import { DRACONIC_ANCESTRIES } from '../../../../lib/api/references';
import { formatRoundsToTime } from './interactionUtils';

export interface UseAasimarAndDragonInteractionsProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  grid: CellData[][];
  character: any;
  activeEntity: CombatEntity | undefined;
  isHeroTurn: boolean;
  isBattleOver: boolean;
  draconicFlightUses: number;
  setDraconicFlightUses: React.Dispatch<React.SetStateAction<number>>;
  activeDraconicFlight: boolean;
  setActiveDraconicFlight: (val: boolean) => void;
  draconicFlightRoundsLeft: number;
  setDraconicFlightRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  activeRevelation: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica' | null;
  setActiveRevelation: (val: any) => void;
  setRadiantSoulRoundsLeft: React.Dispatch<React.SetStateAction<number>>;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
}

export function useAasimarAndDragonInteractions({
  entities,
  setEntities,
  grid,
  character,
  activeEntity,
  isHeroTurn,
  isBattleOver,
  draconicFlightUses,
  setDraconicFlightUses,
  activeDraconicFlight,
  setActiveDraconicFlight,
  draconicFlightRoundsLeft,
  setDraconicFlightRoundsLeft,
  activeRevelation,
  setActiveRevelation,
  setRadiantSoulRoundsLeft,
  addCombatLog,
}: UseAasimarAndDragonInteractionsProps) {

  // Revelação Celestial (Aasimar)
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

  // Draconato: Voo Dracônico
  const handleDraconicFlight = () => {
    if (!isBattleOver && !isHeroTurn) return;
    const hero = isBattleOver ? entities.find(e => e.type === 'hero') : activeEntity;

    if (!hero || hero.type !== 'hero' || hero.isDead) return;

    if (activeDraconicFlight) {
      setActiveDraconicFlight(false);
      addCombatLog(hero.name, '🐉 Voo Dracônico Recolhido', `Você recolheu suas asas espectrais e pousou. A contagem foi pausada (${Math.ceil(draconicFlightRoundsLeft)}r restantes).`, 'system');
      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, conditions: e.conditions.filter(c => c !== 'Voando') } : e));
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

    addCombatLog(hero.name, draconicFlightRoundsLeft < 100 && draconicFlightRoundsLeft > 0 ? '🐉 VOO DRACÔNICO RETOMADO!' : '🐉 VOO DRACÔNICO ATIVADO!', `Asas espectrais de energia de ${damageType} brotam nas suas costas (${formatRoundsToTime(draconicFlightRoundsLeft)} restantes).`, 'system');

    entities.filter(ent => ent.type === 'monster' && !ent.isDead && ent.hasReaction && !ent.conditions.includes('Incapacitado') && getDistanceBetweenEntities(hero, ent, character?.race, undefined) <= 1).forEach(monster => {
      const atkRes = executeAttack(monster, hero, 'normal', undefined, { isDarkEnvironment: true, torches: [], heroLightRadius: 0, heroX: hero.x, heroY: hero.y }, entities, grid);
      addCombatLog(monster.name, '[Ataque de Oportunidade] ' + atkRes.logTitle, atkRes.logDetail, 'attack');
      setEntities(prev => prev.map(e => e.id === monster.id ? { ...e, hasReaction: false } : e));
    });

    setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, hasBonusAction: !isBattleOver ? false : e.hasBonusAction, conditions: e.conditions.includes('Voando') ? e.conditions : [...e.conditions, 'Voando'] } : e));
  };

  return {
    handleExecuteCelestialRevelation,
    handleDraconicFlight
  };
}
