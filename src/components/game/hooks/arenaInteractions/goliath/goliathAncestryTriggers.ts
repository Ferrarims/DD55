import React from 'react';
import { CombatEntity } from '../../../../../game/types';

export function createGoliathAncestryHandlers({
  entities,
  setEntities,
  character,
  pendingGoliathHitInfo,
  setPendingGoliathHitInfo,
  pendingGoliathDamageInfo,
  setPendingGoliathDamageInfo,
  setGoliathAncestryUses,
  setIsVictoryScreenVisible,
  addCombatLog,
  setFloatingTexts,
  processDamageAndCheckKill,
  entitiesRef,
}: {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  character: any;
  pendingGoliathHitInfo: { targetId: string; damage: number } | null;
  setPendingGoliathHitInfo: (val: any) => void;
  pendingGoliathDamageInfo: { damageDealt: number; attackerId: string | null; attackerName: string; isWithin60Ft: boolean } | null;
  setPendingGoliathDamageInfo: (val: any) => void;
  setGoliathAncestryUses: React.Dispatch<React.SetStateAction<number>>;
  setIsVictoryScreenVisible: (val: boolean) => void;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
  processDamageAndCheckKill: (targetId: string, dmg: number, attackerName: string, damageType: string, attackerId: string) => void;
  entitiesRef: React.MutableRefObject<CombatEntity[]>;
}) {
  // Ancestralidade Gigante do Golias - Acerto
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
      addCombatLog(hero.name, '🔥 QUEIMA DO FOGO', `Canalizou a fúria do Gigante do Fogo para causar +1d10 (${roll}) de dano de Fogo adicional a ${target.name}!`, 'damage');
      processDamageAndCheckKill(targetId, roll, hero.name, 'Fogo', 'hero');
      setFloatingTexts(prev => [...prev, { id: Math.random().toString(), x: target.x, y: target.y, text: `🔥 +${roll} Fogo!`, color: '#f97316', progress: 0 }]);
    } else if (option === 'frost') {
      const roll = Math.floor(Math.random() * 6) + 1;
      addCombatLog(hero.name, '❄️ FRIO DO GELO', `Canalizou a fúria do Gigante do Gelo! Causou +1d6 (${roll}) de dano de Frio adicional a ${target.name} e reduziu o deslocamento do inimigo em 3m!`, 'damage');
      processDamageAndCheckKill(targetId, roll, hero.name, 'Frio', 'hero');
      setEntities(prev => prev.map(e => e.id === targetId ? { ...e, speed: Math.max(1, e.speed - 2), remainingMovement: Math.max(0, e.remainingMovement - 2) } : e));
      setFloatingTexts(prev => [...prev, { id: Math.random().toString(), x: target.x, y: target.y, text: `❄️ +${roll} Frio!`, color: '#38bdf8', progress: 0 }]);
    } else if (option === 'hill') {
      addCombatLog(hero.name, '🪨 QUEDA DA COLINA', `Canalizou a fúria do Gigante da Colina para derrubar ${target.name} no chão!`, 'system');
      setEntities(prev => prev.map(e => e.id === targetId ? { ...e, conditions: [...e.conditions, 'Caído'] } : e));
      setFloatingTexts(prev => [...prev, { id: Math.random().toString(), x: target.x, y: target.y, text: `🪨 Caído!`, color: '#fbbf24', progress: 0 }]);
    }

    setPendingGoliathHitInfo(null);
  };

  // Ancestralidade Gigante do Golias - Reação a Dano
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
          return { ...e, currentHp: newHp, isDead: newHp <= 0 ? e.isDead : false };
        }
        return e;
      }));

      if (actualHeal > 0) {
        setIsVictoryScreenVisible(false);
      }

      setFloatingTexts(prev => [...prev, { id: Math.random().toString(), x: heroEntity.x, y: heroEntity.y, text: `🛡️ Reduziu -${actualHeal}`, color: '#a1a1aa', progress: 0 }]);
      addCombatLog(heroEntity.name, '🪨 RESISTÊNCIA DA PEDRA', `Usou sua Reação para canalizar o Gigante da Pedra! Rolou 1d12 + CON (${roll} + ${conMod} = ${totalReduction}) e reduziu o dano sofrido em ${actualHeal} pontos.`, 'system');
    } else if (option === 'storm') {
      const roll = Math.floor(Math.random() * 8) + 1;
      addCombatLog(heroEntity.name, '⚡ TROVÃO DA TEMPESTADE', `Usou sua Reação para revidar o dano com a fúria do Gigante da Tempestade! Causou ${roll} de dano de Trovão a ${attackerName}.`, 'damage');

      if (attackerId) {
        processDamageAndCheckKill(attackerId, roll, heroEntity.name, 'Trovão', 'hero');
        const attacker = entities.find(e => e.id === attackerId);
        if (attacker) {
          setFloatingTexts(prev => [...prev, { id: Math.random().toString(), x: attacker.x, y: attacker.y, text: `⚡ ${roll} Trovão!`, color: '#6366f1', progress: 0 }]);
        }
      }
    }

    setPendingGoliathDamageInfo(null);
  };

  return {
    handleExecuteGoliathHit,
    handleExecuteGoliathDamage,
  };
}
