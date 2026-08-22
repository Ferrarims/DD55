import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { TacticalMindAlertModal } from '../TacticalMindAlertModal';
import { RelentlessModal } from '../RelentlessModal';
import { GoliathHitReactionModal } from '../GoliathHitReactionModal';
import { GoliathDamageReactionModal } from '../GoliathDamageReactionModal';
import { HalflingLuckModal } from '../HalflingLuckModal';
import { HeroicInspirationModal } from '../HeroicInspirationModal';

export const ReactionAndTraitModalsGroup: React.FC = () => {
  const {
    showTacticalMindAlertModal,
    setShowTacticalMindAlertModal,
    pendingTacticalMindInfo,
    setPendingTacticalMindInfo,
    addCombatLog,
    setHasHeroicInspiration,
    handleDeclineTacticalMindAlert,
    handleAcceptTacticalMindAlert,
    secondWindUses,
    secondWindMaxUses,
    showRelentlessModal,
    setShowRelentlessModal,
    pendingRelentlessInfo,
    setPendingRelentlessInfo,
    pendingGoliathHitInfo,
    setPendingGoliathHitInfo,
    entities,
    character,
    goliathAncestryUses,
    goliathAncestryMaxUses,
    getEntitySizeInSquares,
    handleExecuteGoliathHit,
    pendingGoliathDamageInfo,
    setPendingGoliathDamageInfo,
    handleExecuteGoliathDamage,
    pendingHalflingLuckInfo,
    setPendingHalflingLuckInfo,
    pendingHeroicInspirationInfo,
    setPendingHeroicInspirationInfo,
  } = useGameContext();

  return (
    <>
      <TacticalMindAlertModal
        showTacticalMindAlertModal={showTacticalMindAlertModal}
        setShowTacticalMindAlertModal={setShowTacticalMindAlertModal}
        pendingTacticalMindInfo={pendingTacticalMindInfo}
        setPendingTacticalMindInfo={setPendingTacticalMindInfo}
        addCombatLog={addCombatLog}
        setHasHeroicInspiration={setHasHeroicInspiration}
        handleDeclineTacticalMindAlert={handleDeclineTacticalMindAlert}
        handleAcceptTacticalMindAlert={handleAcceptTacticalMindAlert}
        secondWindUses={secondWindUses}
        secondWindMaxUses={secondWindMaxUses}
      />

      <RelentlessModal
        showRelentlessModal={showRelentlessModal}
        setShowRelentlessModal={setShowRelentlessModal}
        pendingRelentlessInfo={pendingRelentlessInfo}
        setPendingRelentlessInfo={setPendingRelentlessInfo}
      />

      <GoliathHitReactionModal
        pendingGoliathHitInfo={pendingGoliathHitInfo}
        setPendingGoliathHitInfo={setPendingGoliathHitInfo}
        entities={entities}
        character={character}
        goliathAncestryUses={goliathAncestryUses}
        goliathAncestryMaxUses={goliathAncestryMaxUses}
        getEntitySizeInSquares={getEntitySizeInSquares}
        handleExecuteGoliathHit={handleExecuteGoliathHit}
      />

      <GoliathDamageReactionModal
        pendingGoliathDamageInfo={pendingGoliathDamageInfo}
        setPendingGoliathDamageInfo={setPendingGoliathDamageInfo}
        entities={entities}
        character={character}
        goliathAncestryUses={goliathAncestryUses}
        goliathAncestryMaxUses={goliathAncestryMaxUses}
        handleExecuteGoliathDamage={handleExecuteGoliathDamage}
      />

      <HalflingLuckModal
        pendingHalflingLuckInfo={pendingHalflingLuckInfo}
        setPendingHalflingLuckInfo={setPendingHalflingLuckInfo}
        addCombatLog={addCombatLog}
      />

      <HeroicInspirationModal
        pendingHeroicInspirationInfo={pendingHeroicInspirationInfo}
        setPendingHeroicInspirationInfo={setPendingHeroicInspirationInfo}
        setHasHeroicInspiration={setHasHeroicInspiration}
        addCombatLog={addCombatLog}
      />
    </>
  );
};
