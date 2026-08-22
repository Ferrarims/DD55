import React from 'react';
import { useGameContext } from '../../context/GameContext';
import { ShortRestArenaModal } from '../ShortRestArenaModal';
import { CombatItemModal } from '../CombatItemModal';
import { InitiativeDetailsModal } from '../InitiativeDetailsModal';
import { LootModal } from '../LootModal';
import { VictorySummaryModal } from '../VictorySummaryModal';
import { CampRestModal } from '../CampRestModal';
import { SettingsModal } from '../SettingsModal';
import { AttackRollHud } from '../../ui/AttackRollHud';
import { InitiativeRollHud } from '../../ui/InitiativeRollHud';

export const EnvironmentAndRestModalsGroup: React.FC = () => {
  const {
    showShortRestModal,
    setShowShortRestModal,
    character,
    pendingShortRestItem,
    hitDiceToSpend,
    setHitDiceToSpend,
    confirmGameShortRest,
    showItemModal,
    setShowItemModal,
    usableInventoryItems,
    itemQuantities,
    totalRationsCount,
    activeEntity,
    entities,
    handleUseItem,
    onCharacterUpdated,
    forceUpdate,
    selectedEntityForPopup,
    setSelectedEntityForPopup,
    shouldHideEntityDetails,
    shouldHideMonsterStats,
    showLootModal,
    setShowLootModal,
    showVictorySummaryModal = false,
    setShowVictorySummaryModal = () => {},
    initNewCombat,
    victoryData,
    mapStreak,
    handleClaimLootAndSave,
    isSaving,
    pendingRestPointId,
    setPendingRestPointId,
    useShortRestPoint,
    useRestPoint,
    showSettingsModal,
    setShowSettingsModal,
    isAmbientSoundEnabled,
    setIsAmbientSoundEnabled,
    isSfxEnabled,
    setIsSfxEnabled,
    isShowMinimap,
    setIsShowMinimap,
    isShowZoomControls,
    setIsShowZoomControls,
    proceduralWorldEnabled,
    setProceduralWorldEnabled,
    latestRoll,
    setLatestRoll,
    latestInitiativeRoll,
    setLatestInitiativeRoll,
  } = useGameContext();

  return (
    <>
      <ShortRestArenaModal
        showShortRestModal={showShortRestModal}
        setShowShortRestModal={setShowShortRestModal}
        character={character}
        pendingShortRestItem={pendingShortRestItem}
        hitDiceToSpend={hitDiceToSpend}
        setHitDiceToSpend={setHitDiceToSpend}
        confirmGameShortRest={confirmGameShortRest}
      />

      <CombatItemModal
        showItemModal={showItemModal}
        setShowItemModal={setShowItemModal}
        character={character}
        usableInventoryItems={usableInventoryItems}
        itemQuantities={itemQuantities}
        totalRationsCount={totalRationsCount}
        activeEntity={activeEntity}
        entities={entities}
        handleUseItem={handleUseItem}
        onCharacterUpdated={onCharacterUpdated}
        forceUpdate={forceUpdate}
      />

      <InitiativeDetailsModal
        selectedEntityForPopup={selectedEntityForPopup}
        setSelectedEntityForPopup={setSelectedEntityForPopup}
        shouldHideEntityDetails={shouldHideEntityDetails}
        shouldHideMonsterStats={shouldHideMonsterStats}
        character={character}
      />

      <LootModal
        showLootModal={showLootModal}
        setShowLootModal={setShowLootModal}
        victoryData={victoryData}
        mapStreak={mapStreak}
        handleClaimLootAndSave={handleClaimLootAndSave}
        isSaving={isSaving}
      />

      <VictorySummaryModal
        showVictorySummaryModal={showVictorySummaryModal}
        setShowVictorySummaryModal={setShowVictorySummaryModal}
        victoryData={victoryData}
        mapStreak={mapStreak}
        initNewCombat={initNewCombat}
        handleClaimLootAndSave={handleClaimLootAndSave}
        isSaving={isSaving}
      />

      <CampRestModal
        pendingRestPointId={pendingRestPointId}
        setPendingRestPointId={setPendingRestPointId}
        useShortRestPoint={useShortRestPoint}
        useRestPoint={useRestPoint}
      />

      <SettingsModal
        showSettingsModal={showSettingsModal}
        setShowSettingsModal={setShowSettingsModal}
        isAmbientSoundEnabled={isAmbientSoundEnabled}
        setIsAmbientSoundEnabled={setIsAmbientSoundEnabled}
        isSfxEnabled={isSfxEnabled}
        setIsSfxEnabled={setIsSfxEnabled}
        isShowMinimap={isShowMinimap}
        setIsShowMinimap={setIsShowMinimap}
        isShowZoomControls={isShowZoomControls}
        setIsShowZoomControls={setIsShowZoomControls}
        proceduralWorldEnabled={proceduralWorldEnabled}
        setProceduralWorldEnabled={setProceduralWorldEnabled}
      />

      <AttackRollHud latestRoll={latestRoll} onClose={() => setLatestRoll(null)} />
      <InitiativeRollHud latestInitiativeRoll={latestInitiativeRoll} onClose={() => setLatestInitiativeRoll(null)} />
    </>
  );
};
