import React from 'react';
import { CombatEntity, PowerUp } from '../../../../game/types';

export interface UseGridPowerupsAndRestProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  powerups: PowerUp[];
  setPowerUps: React.Dispatch<React.SetStateAction<PowerUp[]>>;
  restPoints: any[];
  setRestPoints: React.Dispatch<React.SetStateAction<any[]>>;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
  setPendingRestPointId: (id: string | null) => void;
}

export function useGridPowerupsAndRest({
  entities,
  setEntities,
  powerups,
  setPowerUps,
  restPoints,
  setRestPoints,
  addCombatLog,
  setFloatingTexts,
  setPendingRestPointId,
}: UseGridPowerupsAndRestProps) {
  const checkPowerupsAndRest = (entityId: string, tx: number, ty: number) => {
    // 1. Verificar Power-Ups
    setPowerUps(prevPowerups => {
      const powerup = prevPowerups.find(p => p.x === tx && p.y === ty && !p.isCollected);
      if (!powerup) return prevPowerups;

      setTimeout(() => {
        setEntities(prevEntities => {
          const entity = prevEntities.find(e => e.id === entityId && !e.isDead);
          if (!entity) return prevEntities;

          let title = '';
          let details = '';

          if (powerup.type === 'heal') {
            const healVal = Math.floor(Math.random() * 8) + Math.floor(Math.random() * 8) + 6;
            title = '💚 Bênção de Cura!';
            details = `${entity.name} absorveu a runa e restaurou ${healVal} PV!`;
            addCombatLog('Mestre da Arena', title, details, 'heal');

            return prevEntities.map(e => {
              if (e.id === entityId) {
                return {
                  ...e,
                  currentHp: Math.min(e.maxHp, e.currentHp + healVal),
                };
              }
              return e;
            });
          } else if (powerup.type === 'energy') {
            title = '⚡ Runa de Energia!';
            details = `${entity.name} absorveu a runa: Ações restauradas e +6m (+4 cel) de deslocamento livre!`;
            addCombatLog('Mestre da Arena', title, details, 'system');

            return prevEntities.map(e => {
              if (e.id === entityId) {
                return {
                  ...e,
                  hasAction: true,
                  hasBonusAction: true,
                  remainingMovement: e.remainingMovement + 4,
                };
              }
              return e;
            });
          } else if (powerup.type === 'shield') {
            title = '🔷 Runas de Escudo!';
            details = `${entity.name} absorveu a runa e ganhou +8 PV Temporários e +2 de CA!`;
            addCombatLog('Mestre da Arena', title, details, 'system');

            return prevEntities.map(e => {
              if (e.id === entityId) {
                return {
                  ...e,
                  tempHp: Math.max(e.tempHp, 8),
                  ac: e.ac + 2,
                };
              }
              return e;
            });
          } else if (powerup.type === 'might') {
            title = '🔥 Fúria dos Titãs!';
            details = `${entity.name} absorveu a runa: +4 de Bônus de Ataque e +4 de Dano Físico!`;
            addCombatLog('Mestre da Arena', title, details, 'system');

            return prevEntities.map(e => {
              if (e.id === entityId) {
                return {
                  ...e,
                  attackBonus: e.attackBonus + 4,
                  damageDice: e.damageDice.includes('+') ? e.damageDice + '+4' : e.damageDice + '+4',
                };
              }
              return e;
            });
          }

          return prevEntities;
        });
      }, 50);

      return prevPowerups.map(p => (p.id === powerup.id ? { ...p, isCollected: true } : p));
    });

    // 2. Verificar Pontos de Descanso Longo
    setRestPoints(prevRestPoints => {
      const restPoint = prevRestPoints.find(rp => {
        const size = rp.size || 2;
        return tx >= rp.x && tx < rp.x + size && ty >= rp.y && ty < rp.y + size && !rp.isUsed;
      });
      if (!restPoint) return prevRestPoints;

      const hasLivingMonsters = entities.some(e => e.type === 'monster' && e.currentHp > 0 && !e.isDead);
      if (hasLivingMonsters) {
        addCombatLog(
          'Mestre da Arena',
          '⚠️ Inimigos na área',
          'Você não pode realizar um Descanso Longo no acampamento enquanto houver monstros vivos na área!',
          'system'
        );
        setFloatingTexts(prev => [
          ...prev,
          {
            id: Math.random().toString(),
            x: tx,
            y: ty,
            text: '⚠️ Inimigos na área',
            color: '#f87171',
            progress: 0,
          },
        ]);
        return prevRestPoints;
      }

      setTimeout(() => {
        setPendingRestPointId(restPoint.id);
      }, 50);

      return prevRestPoints;
    });
  };

  return { checkPowerupsAndRest };
}
