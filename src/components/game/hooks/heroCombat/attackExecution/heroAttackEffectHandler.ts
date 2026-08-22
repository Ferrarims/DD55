import React from 'react';
import { CombatEntity } from '../../../../../game/types';
import { getWeaponMaxRangeCells, getDistanceBetweenEntities, getEntitySizeInSquares } from '../../../../../game/combatUtils';
import { updateHeroPostAttack } from '../heroAttackStateUpdater';

export function handlePostHeroAttackEffects({
  res,
  hero,
  targetEntity,
  atkToUse,
  character,
  activeFeatsList,
  options,
  isMelee,
  ammoRes,
  isGoliath,
  goliathAncestryUses,
  entities,
  activeLargeForm,
  weaponMasteryInfo,
  setRollAdvantageState,
  triggerAttackVisualEffect,
  setLatestRoll,
  addCombatLog,
  processDamageAndCheckKill,
  setPendingGoliathHitInfo,
  setEntities,
  setShowAttackModal,
  setShowTargetModal,
  setPendingAttackInfo,
  setTargetCandidates,
}: {
  res: any;
  hero: CombatEntity;
  targetEntity: CombatEntity;
  atkToUse: any;
  character: any;
  activeFeatsList: string[];
  options?: any;
  isMelee: boolean;
  ammoRes: any;
  isGoliath: boolean;
  goliathAncestryUses: number;
  entities: CombatEntity[];
  activeLargeForm: boolean;
  weaponMasteryInfo?: any;
  setRollAdvantageState: (state: any) => void;
  triggerAttackVisualEffect: (start: any, end: any, isRanged: boolean, hit: boolean, damage: number, isCritical: boolean) => void;
  setLatestRoll: (roll: any) => void;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  processDamageAndCheckKill: (targetId: string, rawDamage: number, attackerName: string, damageType: string, attackerId: string) => void;
  setPendingGoliathHitInfo: (info: any) => void;
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  setShowAttackModal: (show: boolean) => void;
  setShowTargetModal: (show: boolean) => void;
  setPendingAttackInfo: (info: any) => void;
  setTargetCandidates: (candidates: CombatEntity[]) => void;
}) {
  setRollAdvantageState('normal');
  triggerAttackVisualEffect(
    { x: hero.x, y: hero.y },
    { x: targetEntity.x, y: targetEntity.y },
    !isMelee || ammoRes.isThrownAttack,
    res.hit,
    res.damage,
    res.isCritical
  );

  setLatestRoll({
    id: Math.random().toString(),
    attackerName: hero.name,
    defenderName: targetEntity.name,
    logTitle: res.logTitle,
    logDetail: res.logDetail,
    isCritical: res.isCritical,
    isFumble: res.isFumble,
    damage: res.damage,
    hit: res.hit
  });

  addCombatLog(hero.name, res.logTitle, res.logDetail, 'attack');
  processDamageAndCheckKill(targetEntity.id, res.damage, hero.name, atkToUse?.damage_type || 'Cortante', 'hero');

  const gType = (character?.giant_ancestry || character?.giantAncestry || '').toLowerCase();
  const showFire = gType === '' || gType.includes('fogo') || gType.includes('fire');
  const showFrost = gType === '' || gType.includes('gelo') || gType.includes('frost');
  const showHill = gType === '' || gType.includes('colina') || gType.includes('hill');
  const isTargetAlreadyProne = targetEntity.conditions?.some((c: string) => c === 'Caído' || c === 'Prone' || c === 'Caido');
  const isLargeOrSmaller = getEntitySizeInSquares(targetEntity.size) <= 2;
  const canUseHill = showHill && isLargeOrSmaller && !isTargetAlreadyProne;
  const hasHitAncestry = showFire || showFrost || canUseHill;
  const didHitWithAttackRoll = res.attackRollHit ?? (res.hit && !res.isGraze);

  if (isGoliath && goliathAncestryUses > 0 && didHitWithAttackRoll && res.damage > 0 && hasHitAncestry) {
    setPendingGoliathHitInfo({ targetId: targetEntity.id, damage: res.damage });
  }

  setEntities(prev =>
    prev.map(e => (e.id === hero.id ? updateHeroPostAttack(e, atkToUse, character, activeFeatsList, options, addCombatLog) : e))
  );

  setShowAttackModal(false);
  setShowTargetModal(false);
  setPendingAttackInfo(null);

  const masteryName = options?.isMastery ? options.masteryName : (weaponMasteryInfo ? (atkToUse?.mastery || weaponMasteryInfo.name) : undefined);
  const isCleaveWeapon = masteryName && (masteryName.toLowerCase().includes('cleave') || masteryName.toLowerCase().includes('fender') || masteryName.toLowerCase().includes('varrer') || masteryName.toLowerCase().includes('trespassar'));
  const didCleaveHit = res.hit && !res.isGraze;

  if (hero.type === 'hero' && didCleaveHit && isCleaveWeapon && !hero.usedCleaveThisTurn && !options?.isCleave) {
    const rangeCells = getWeaponMaxRangeCells(atkToUse);
    const cleaveCandidates = entities.filter(m => {
      if (m.type !== 'monster' || m.isDead || m.id === targetEntity.id) return false;
      if (Math.max(Math.abs(m.x - targetEntity.x), Math.abs(m.y - targetEntity.y)) > 1) return false;
      return getDistanceBetweenEntities(hero, m, character?.race, activeLargeForm) <= rangeCells;
    });

    if (cleaveCandidates.length > 0) {
      setTimeout(() => {
        setTargetCandidates(cleaveCandidates);
        setPendingAttackInfo({ type: 'cleave', overrideAtk: atkToUse, originalTargetId: targetEntity.id });
        setShowTargetModal(true);
        addCombatLog('Mestre do Jogo', '🪓 Maestria Cleave (Fender) Ativada!', `Pode realizar um ataque extra sem bônus de atributo contra criatura adjacente!`, 'system');
      }, 600);
    }
  }
}
