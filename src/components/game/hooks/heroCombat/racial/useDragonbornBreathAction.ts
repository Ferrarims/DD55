import { useCallback } from 'react';
import { UseHeroCombatActionsProps } from '../types';
import { CombatEntity } from '../../../../../game/types';
import { playAttackSound } from '../../../../../lib/audio';
import { getDamageTypeColor } from '../../../../../game/combatUtils';
import { isTargetInLine, isTargetInCone } from '../../../../../lib/mechanics/breathWeaponCalculator';

export function useDragonbornBreathAction(props: UseHeroCombatActionsProps) {
  const {
    entities,
    setEntities,
    activeEntity,
    isHeroTurn,
    isBattleOver,
    breathWeaponUses,
    breathWeaponDetails,
    isSfxEnabled,
    addCombatLog,
    processDamageAndCheckKill,
    setFloatingTexts,
    setSelectedBreathTargets,
    setBreathWeaponShape,
    setShowBreathWeaponModal,
    setBreathWeaponUses,
    setActiveEffects,
  } = props;

  const handleExecuteBreathWeapon = useCallback((shape: 'cone' | 'line', selectedTargets: CombatEntity[], primaryTarget?: CombatEntity) => {
    const inCombat = !isBattleOver;
    const hero = inCombat ? activeEntity : entities.find(e => e.type === 'hero');
    if (!hero || hero.isDead) return;

    if (inCombat && !isHeroTurn) return;

    if (breathWeaponUses <= 0) {
      addCombatLog('Mestre do Jogo', '⚠️ Usos Esgotados', 'Você já usou todas as baforadas para este descanso!', 'system');
      return;
    }
    if (inCombat && !hero.hasAction) {
      addCombatLog('Mestre do Jogo', '⚠️ Ação Já Utilizada', 'Sua Ação Principal já foi gasta neste turno!', 'system');
      return;
    }

    if (!breathWeaponDetails) return;

    const maxDist = shape === 'cone' ? 3 : 6;
    const shapeLabel = shape === 'cone' ? 'Cone de 4.5m (15ft)' : 'Linha de 9m (30ft)';

    if (primaryTarget) {
      const invalidTarget = selectedTargets.find(t => {
        if (t.id === primaryTarget.id) return false;
        if (shape === 'line') return !isTargetInLine(hero, t, primaryTarget, maxDist);
        if (shape === 'cone') return !isTargetInCone(hero, t, primaryTarget, maxDist);
        return false;
      });

      if (invalidTarget) {
        const msg = `O alvo ${invalidTarget.name} não está na trajetória da baforada!`;
        alert(msg);
        addCombatLog('Mestre do Jogo', '⚠️ Alvo Fora da Área', msg, 'system');
        return;
      }
    }

    let totalDamageRoll = 0;
    const rolls: number[] = [];
    for (let i = 0; i < breathWeaponDetails.diceCount; i++) {
      const r = Math.floor(Math.random() * 10) + 1;
      rolls.push(r);
      totalDamageRoll += r;
    }

    selectedTargets.forEach(target => {
      const targetDexMod = target.saves?.dex ?? Math.floor(((target.stats?.dex || 10) - 10) / 2);
      const isAutoFail = target.conditions?.some(c => 
        c === 'Paralisado' || c === 'Paralyzed' ||
        c === 'Inconsciente' || c === 'Unconscious' ||
        c === 'Atordoado' || c === 'Stunned' ||
        c === 'Petrificado' || c === 'Petrified'
      );
      const isRestrained = target.conditions?.some(c => 
        c === 'Contido' || c === 'Restringido' || c === 'Restrained'
      );

      let saveRollD20 = Math.floor(Math.random() * 20) + 1;
      if (target.conditions?.includes('Esquivando') || target.conditions?.includes('Dodge')) {
        const d2 = Math.floor(Math.random() * 20) + 1;
        saveRollD20 = Math.max(saveRollD20, d2);
      } else if (isRestrained) {
        const d2 = Math.floor(Math.random() * 20) + 1;
        saveRollD20 = Math.min(saveRollD20, d2);
      }

      const targetExhaustion = target.exhaustionLevel || 0;
      const saveTotal = saveRollD20 + targetDexMod - (targetExhaustion * 2);
      const passedSave = !isAutoFail && saveTotal >= breathWeaponDetails.dc;

      const finalDamage = passedSave ? Math.floor(totalDamageRoll / 2) : totalDamageRoll;

      const exInfo = targetExhaustion > 0 ? `-${targetExhaustion * 2}` : '';
      const saveMsg = isAutoFail
        ? `🎲 Teste DEX: Falha Automática por Condição (Dano total: ${finalDamage})`
        : passedSave
        ? `🎲 Teste DEX (CD ${breathWeaponDetails.dc}): d20(${saveRollD20})+${targetDexMod}${exInfo}=${saveTotal} (Passou! Metade do dano: ${finalDamage})`
        : `🎲 Teste DEX (CD ${breathWeaponDetails.dc}): d20(${saveRollD20})+${targetDexMod}${exInfo}=${saveTotal} (Falhou! Dano total: ${finalDamage})`;

      addCombatLog(
        hero.name,
        `🔥 BAFORADA (${shapeLabel}) em ${target.name}!`,
        `Exalou energia de ${breathWeaponDetails.damageType} [Dano rolado: ${totalDamageRoll} (${rolls.join('+')})]. ${saveMsg}`,
        'attack'
      );

      processDamageAndCheckKill(target.id, finalDamage, hero.name, breathWeaponDetails.damageType, 'hero');

      const dtColor = getDamageTypeColor(breathWeaponDetails.damageType);
      setFloatingTexts(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          x: target.x,
          y: target.y,
          text: `-${finalDamage}`,
          color: dtColor.primary,
          progress: 0
        }
      ]);
    });

    let avgTargetX = hero.x + 3;
    let avgTargetY = hero.y;
    if (selectedTargets.length > 0) {
      avgTargetX = selectedTargets.reduce((sum, t) => sum + t.x, 0) / selectedTargets.length;
      avgTargetY = selectedTargets.reduce((sum, t) => sum + t.y, 0) / selectedTargets.length;
      if (avgTargetX === hero.x && avgTargetY === hero.y) {
        avgTargetX += 3;
      }
    }

    setActiveEffects(prev => [
      ...prev,
      {
        id: Math.random().toString(),
        type: shape === 'cone' ? 'breath_cone' : 'breath_line',
        startX: hero.x,
        startY: hero.y,
        endX: avgTargetX,
        endY: avgTargetY,
        progress: 0,
        hit: true,
        damageType: breathWeaponDetails.damageType
      }
    ]);

    if (isSfxEnabled) playAttackSound();

    setBreathWeaponUses(prev => Math.max(0, prev - 1));
    if (inCombat) {
      setEntities(prev => prev.map(e => e.id === hero.id ? { ...e, hasAction: false } : e));
    }
    setShowBreathWeaponModal(false);
  }, [activeEntity, addCombatLog, breathWeaponDetails, breathWeaponUses, isBattleOver, isHeroTurn, isSfxEnabled, processDamageAndCheckKill, setActiveEffects, setBreathWeaponUses, setEntities, setFloatingTexts, setShowBreathWeaponModal]);

  const handleOpenBreathWeaponModal = useCallback(() => {
    setSelectedBreathTargets([]);
    setBreathWeaponShape('cone');
    setShowBreathWeaponModal(true);
  }, [setBreathWeaponShape, setShowBreathWeaponModal, setSelectedBreathTargets]);

  return {
    handleExecuteBreathWeapon,
    handleOpenBreathWeaponModal,
  };
}
