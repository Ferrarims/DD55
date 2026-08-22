import React from 'react';
import { CombatEntity } from '../../../../../game/types';
import { getDistanceBetweenEntities } from '../../../../../game/combatUtils';

interface UseGrappleAndMovementActionsProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  character: any;
  activeEntity: CombatEntity | undefined;
  isHeroTurn: boolean;
  isBattleOver: boolean;
  activeLargeForm: boolean;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
}

export function useGrappleAndMovementActions({
  entities,
  setEntities,
  character,
  activeEntity,
  isHeroTurn,
  isBattleOver,
  activeLargeForm,
  addCombatLog,
  setFloatingTexts,
}: UseGrappleAndMovementActionsProps) {
  // 1. Esquivar (Dodge)
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

  // 2. Desengajar (Disengage)
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

  // 3. Levantar-se (Stand Up)
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
      `Gastou ${costToStandUp * 1.5}m de movimento para se levantar, encerrando a condição Caído.`,
      'system'
    );
  };

  // 4. Escapar do Agarrão (Escape Grapple)
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
    const exhaustionLevel = character?.exhaustion_level ?? hero.exhaustionLevel ?? 0;

    const d20 = Math.floor(Math.random() * 20) + 1;
    const totalCheck = d20 + bestMod - (exhaustionLevel * 2);
    const passed = totalCheck >= escapeDc;
    const exDetail = exhaustionLevel > 0 ? ` - Exaustão (${exhaustionLevel * 2})` : '';

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
        `Teste de ${statName}: d20(${d20}) + ${bestMod}${exDetail} = ${totalCheck} vs CD ${escapeDc} de ${grapplerName} (PASSOU!). Livrou-se do agarrão e recuperou seu movimento.`,
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
        `Teste de ${statName}: d20(${d20}) + ${bestMod}${exDetail} = ${totalCheck} vs CD ${escapeDc} de ${grapplerName} (FALHOU). Continua agarrado.`,
        'system'
      );
    }
  };

  return {
    handleHeroDodge,
    handleHeroDisengage,
    handleHeroStandUp,
    handleHeroEscapeGrapple,
  };
}
