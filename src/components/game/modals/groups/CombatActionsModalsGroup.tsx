import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { AttackChoiceModal } from '../AttackChoiceModal';
import { TargetSelectionModal } from '../TargetSelectionModal';
import { BreathWeaponModal } from '../BreathWeaponModal';
import { OpportunityAttackModal } from '../OpportunityAttackModal';

export const CombatActionsModalsGroup: React.FC = () => {
  const {
    showAttackModal,
    setShowAttackModal,
    pendingAttackInfo,
    characterAttacks,
    checkAmmunitionRequirement,
    getCharacterAmmoCount,
    getActiveFeats,
    activeEntity,
    handleSelectWeapon,
    handleHeroAttack,
    showTargetModal,
    setShowTargetModal,
    targetCandidates,
    setPendingAttackInfo,
    character,
    activeLargeForm,
    getDistanceBetweenEntities,
    shouldHideEntityDetails,
    shouldHideMonsterStats,
    getEntityCover,
    handleHeroOffHandAttack,
    handleHeroCleaveAttack,
    handleHeroMagicSpell,
    handleUseItem,
    showBreathWeaponModal,
    setShowBreathWeaponModal,
    breathWeaponDetails,
    breathWeaponUses,
    breathWeaponMaxUses,
    breathWeaponShape,
    setBreathWeaponShape,
    selectedBreathTargets,
    setSelectedBreathTargets,
    entities,
    activeEntityIndex,
    isEntityVisible,
    isTargetInLine,
    isTargetInCone,
    handleExecuteBreathWeapon,
    pendingOpportunityAttack,
    setPendingOpportunityAttack,
    handleResolveOpportunityAttack,
  } = useGameContext();

  return (
    <>
      <AttackChoiceModal
        showAttackModal={showAttackModal}
        setShowAttackModal={setShowAttackModal}
        pendingAttackInfo={pendingAttackInfo}
        characterAttacks={characterAttacks}
        checkAmmunitionRequirement={checkAmmunitionRequirement}
        getCharacterAmmoCount={getCharacterAmmoCount}
        getActiveFeats={getActiveFeats}
        activeEntity={activeEntity}
        handleSelectWeapon={handleSelectWeapon}
        handleHeroAttack={handleHeroAttack}
      />

      <TargetSelectionModal
        showTargetModal={showTargetModal}
        setShowTargetModal={setShowTargetModal}
        targetCandidates={targetCandidates}
        pendingAttackInfo={pendingAttackInfo}
        setPendingAttackInfo={setPendingAttackInfo}
        activeEntity={activeEntity}
        character={character}
        activeLargeForm={activeLargeForm}
        getDistanceBetweenEntities={getDistanceBetweenEntities}
        shouldHideEntityDetails={shouldHideEntityDetails}
        shouldHideMonsterStats={shouldHideMonsterStats}
        getEntityCover={getEntityCover}
        handleHeroAttack={handleHeroAttack}
        handleHeroOffHandAttack={handleHeroOffHandAttack}
        handleHeroCleaveAttack={handleHeroCleaveAttack}
        handleHeroMagicSpell={handleHeroMagicSpell}
        handleUseItem={handleUseItem}
      />

      <BreathWeaponModal
        showBreathWeaponModal={showBreathWeaponModal}
        setShowBreathWeaponModal={setShowBreathWeaponModal}
        pendingAttackInfo={pendingAttackInfo}
        breathWeaponDetails={breathWeaponDetails}
        breathWeaponUses={breathWeaponUses}
        breathWeaponMaxUses={breathWeaponMaxUses}
        breathWeaponShape={breathWeaponShape}
        setBreathWeaponShape={setBreathWeaponShape}
        selectedBreathTargets={selectedBreathTargets}
        setSelectedBreathTargets={setSelectedBreathTargets}
        entities={entities}
        activeEntity={activeEntity}
        activeEntityIndex={activeEntityIndex}
        character={character}
        activeLargeForm={activeLargeForm}
        isEntityVisible={isEntityVisible}
        getDistanceBetweenEntities={getDistanceBetweenEntities}
        shouldHideEntityDetails={shouldHideEntityDetails}
        isTargetInLine={isTargetInLine}
        isTargetInCone={isTargetInCone}
        handleExecuteBreathWeapon={handleExecuteBreathWeapon}
      />

      <OpportunityAttackModal
        pendingOpportunityAttack={pendingOpportunityAttack}
        setPendingOpportunityAttack={setPendingOpportunityAttack}
        handleResolveOpportunityAttack={handleResolveOpportunityAttack}
      />
    </>
  );
};
