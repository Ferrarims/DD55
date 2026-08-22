import { CombatEntity } from '../../../../game/types';
import { getAttacksPerAction } from '../../../../game/combatUtils';

export interface AttackOptions {
  isOffHand?: boolean;
  isMastery?: boolean;
  masteryName?: string;
  customDamageDice?: string;
  isCleave?: boolean;
  canUseNick?: boolean;
}

export function updateHeroPostAttack(
  hero: CombatEntity,
  atkToUse: any,
  character: any,
  activeFeatsList: string[],
  options: AttackOptions | undefined,
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void
): CombatEntity {
  const newConditions = hero.conditions.filter(c => c !== 'Invisível' && c !== 'Invisible');
  if (hero.conditions.includes('Invisível') || hero.conditions.includes('Invisible')) {
    addCombatLog(
      hero.name,
      '👁️ REVELADO AO ATACAR!',
      'Ao desferir um ataque, você revelou sua posição e perdeu a condição Invisível!',
      'system'
    );
  }

  const props = (atkToUse?.properties || '').toLowerCase();
  const hasLoading = props.includes('recarga') || props.includes('loading') || props.includes('carregar');
  const hasCrossbowExpert = activeFeatsList.some((f: string) => f.toLowerCase().includes('bestas') || f.toLowerCase().includes('crossbow'));
  const baseMaxAtks = (hasLoading && !hasCrossbowExpert) ? 1 : getAttacksPerAction(character || hero);
  const effectiveMaxAtks = baseMaxAtks;

  const currentWeapons = hero.attackedWeaponNamesThisTurn || [];
  const updatedWeapons = atkToUse?.name ? [...currentWeapons, atkToUse.name] : currentWeapons;

  const currentWeaponsAction = hero.attackedWeaponNamesThisAction || [];
  const updatedWeaponsAction = atkToUse?.name ? [...currentWeaponsAction, atkToUse.name] : currentWeaponsAction;

  if (options?.isCleave) {
    return {
      ...hero,
      hasAttackedThisTurn: true,
      usedCleaveThisTurn: true,
      conditions: newConditions,
      attackedWeaponNamesThisTurn: updatedWeapons
    };
  }

  if (options?.isOffHand) {
    return {
      ...hero,
      hasBonusAction: options.canUseNick ? hero.hasBonusAction : false,
      hasAttackedThisTurn: true,
      offHandAttackUsedThisTurn: true,
      conditions: newConditions,
      attackedWeaponNamesThisTurn: updatedWeapons
    };
  }

  const forceZeroAttacks = hasLoading && !hasCrossbowExpert;

  if (forceZeroAttacks) {
    addCombatLog(
      'Mestre do Jogo',
      '🏹 Propriedade Recarga (Loading)',
      'Você só pode disparar uma peça de munição por ação com esta arma (Propriedade Carregamento)! Ela consumiu todos os ataques deste turno.',
      'system'
    );
    return {
      ...hero,
      hasAction: false,
      isActionSurgeActive: false,
      hasAttackedThisTurn: true,
      attacksRemaining: 0,
      conditions: newConditions,
      attackedWeaponNamesThisTurn: updatedWeapons,
      attackedWeaponNamesThisAction: updatedWeaponsAction
    };
  }

  const currentAttacksLeft = hero.attacksRemaining || 0;
  if (currentAttacksLeft > 1) {
    const nextLeft = currentAttacksLeft - 1;
    addCombatLog('Mestre do Jogo', '⚔️ Ataque Extra!', `Você ainda tem ${nextLeft} ataque(s) nesta Ação!`, 'system');
    return {
      ...hero,
      hasAction: false,
      isActionSurgeActive: false,
      hasAttackedThisTurn: true,
      attacksRemaining: nextLeft,
      conditions: newConditions,
      attackedWeaponNamesThisTurn: updatedWeapons,
      attackedWeaponNamesThisAction: updatedWeaponsAction
    };
  } else if (currentAttacksLeft === 1) {
    return {
      ...hero,
      hasAction: false,
      isActionSurgeActive: false,
      hasAttackedThisTurn: true,
      attacksRemaining: 0,
      conditions: newConditions,
      attackedWeaponNamesThisTurn: updatedWeapons,
      attackedWeaponNamesThisAction: updatedWeaponsAction
    };
  } else {
    const maxAtks = effectiveMaxAtks;
    if (maxAtks > 1) {
      const nextLeft = maxAtks - 1;
      addCombatLog('Mestre do Jogo', '⚔️ Ataque Extra!', `Você ainda tem ${nextLeft} ataque(s) nesta Ação!`, 'system');
      return {
        ...hero,
        hasAction: false,
        isActionSurgeActive: false,
        hasAttackedThisTurn: true,
        attacksRemaining: nextLeft,
        conditions: newConditions,
        attackedWeaponNamesThisTurn: updatedWeapons,
        attackedWeaponNamesThisAction: updatedWeaponsAction
      };
    } else {
      return {
        ...hero,
        hasAction: false,
        isActionSurgeActive: false,
        hasAttackedThisTurn: true,
        attacksRemaining: 0,
        conditions: newConditions,
        attackedWeaponNamesThisTurn: updatedWeapons,
        attackedWeaponNamesThisAction: updatedWeaponsAction
      };
    }
  }
}
