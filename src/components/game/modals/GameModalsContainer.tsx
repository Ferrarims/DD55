import React from 'react';
import { OpportunityAttackModal } from './OpportunityAttackModal';
import { RelentlessModal } from './RelentlessModal';
import { SettingsModal } from './SettingsModal';
import { LootModal } from './LootModal';
import { VictorySummaryModal } from './VictorySummaryModal';
import { TacticalMindAlertModal } from './TacticalMindAlertModal';
import { AttackChoiceModal } from './AttackChoiceModal';
import { TargetSelectionModal } from './TargetSelectionModal';
import { BreathWeaponModal } from './BreathWeaponModal';
import { ShortRestArenaModal } from './ShortRestArenaModal';
import { CombatItemModal } from './CombatItemModal';
import { InitiativeDetailsModal } from './InitiativeDetailsModal';
import { GoliathHitReactionModal } from './GoliathHitReactionModal';
import { GoliathDamageReactionModal } from './GoliathDamageReactionModal';
import { CampRestModal } from './CampRestModal';
import { HalflingLuckModal } from './HalflingLuckModal';
import { HeroicInspirationModal } from './HeroicInspirationModal';
import { AttackRollHud } from '../ui/AttackRollHud';
import { InitiativeRollHud } from '../ui/InitiativeRollHud';
import { CombatEntity } from '../../../game/types';
import { CoverResult } from '../../../game/coverMechanics';

export interface GameModalsContainerProps {
  // Attack Modal
  showAttackModal: boolean;
  setShowAttackModal: (val: boolean) => void;
  pendingAttackInfo: any;
  characterAttacks: any[];
  checkAmmunitionRequirement: (atk: any) => any;
  getCharacterAmmoCount: (req: any) => number;
  getActiveFeats: () => string[];
  activeEntity: any;
  handleSelectWeapon: (weapon: any) => void;
  handleHeroAttack: (target: any) => void;

  // Target Selection Modal
  showTargetModal: boolean;
  setShowTargetModal: (val: boolean) => void;
  targetCandidates: CombatEntity[];
  setPendingAttackInfo: (info: any) => void;
  character: any;
  activeLargeForm: boolean;
  getDistanceBetweenEntities: (e1: any, e2: any, race?: string, largeForm?: boolean) => number;
  shouldHideEntityDetails: (e: CombatEntity) => boolean;
  shouldHideMonsterStats: (e: CombatEntity) => boolean;
  getEntityCover: (target: CombatEntity) => CoverResult;
  handleHeroOffHandAttack: (target: any) => void;
  handleHeroCleaveAttack: (target: any) => void;
  handleHeroMagicSpell: (target: any) => void;
  handleUseItem: (item: any, target: any) => void;

  // Breath Weapon Modal
  showBreathWeaponModal: boolean;
  setShowBreathWeaponModal: (val: boolean) => void;
  breathWeaponDetails: any;
  breathWeaponUses: number;
  breathWeaponMaxUses: number;
  breathWeaponShape: 'cone' | 'line';
  setBreathWeaponShape: (shape: 'cone' | 'line') => void;
  selectedBreathTargets: string[];
  setSelectedBreathTargets: React.Dispatch<React.SetStateAction<string[]>>;
  entities: CombatEntity[];
  activeEntityIndex: number;
  isEntityVisible: (e: CombatEntity) => boolean;
  isTargetInLine: (ox: number, oy: number, tx: number, ty: number, length?: number) => boolean;
  isTargetInCone: (ox: number, oy: number, tx: number, ty: number, coneRange?: number) => boolean;
  handleExecuteBreathWeapon: () => void;

  // Short Rest Arena Modal
  showShortRestModal: boolean;
  setShowShortRestModal: (val: boolean) => void;
  pendingShortRestItem: any;
  hitDiceToSpend: number;
  setHitDiceToSpend: React.Dispatch<React.SetStateAction<number>>;
  confirmGameShortRest: () => void;

  // Combat Item Modal
  showItemModal: boolean;
  setShowItemModal: (val: boolean) => void;
  usableInventoryItems: any[];
  itemQuantities: Record<string, number>;
  totalRationsCount: number;
  onCharacterUpdated?: () => Promise<void> | void;
  forceUpdate: () => void;

  // Initiative Details Modal
  selectedEntityForPopup: CombatEntity | null;
  setSelectedEntityForPopup: (e: CombatEntity | null) => void;

  // Loot Modal
  showLootModal: boolean;
  setShowLootModal: (val: boolean) => void;
  showVictorySummaryModal?: boolean;
  setShowVictorySummaryModal?: (val: boolean) => void;
  initNewCombat?: (enemyCount?: number, incrementMapStreak?: boolean) => void;
  victoryData: any;
  mapStreak: number;
  handleClaimLootAndSave: () => void;
  isSaving: boolean;

  // HUDs
  latestRoll: any;
  setLatestRoll: (roll: any) => void;
  latestInitiativeRoll: any;
  setLatestInitiativeRoll: (roll: any) => void;

  // Tactical Mind Modal
  showTacticalMindAlertModal: boolean;
  setShowTacticalMindAlertModal: (val: boolean) => void;
  pendingTacticalMindInfo: any;
  setPendingTacticalMindInfo: (info: any) => void;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setHasHeroicInspiration: (val: boolean) => void;
  handleDeclineTacticalMindAlert: () => void;
  handleAcceptTacticalMindAlert: () => void;
  secondWindUses: number;
  secondWindMaxUses: number;

  // Relentless Modal
  showRelentlessModal: boolean;
  setShowRelentlessModal: (val: boolean) => void;
  pendingRelentlessInfo: any;
  setPendingRelentlessInfo: (info: any) => void;

  // Goliath Modals
  pendingGoliathHitInfo: any;
  setPendingGoliathHitInfo: (info: any) => void;
  goliathAncestryUses: number;
  goliathAncestryMaxUses: number;
  getEntitySizeInSquares: (size: string) => number;
  handleExecuteGoliathHit: (ancestryName: string) => void;
  pendingGoliathDamageInfo: any;
  setPendingGoliathDamageInfo: (info: any) => void;
  handleExecuteGoliathDamage: () => void;

  // Camp Rest Modal
  pendingRestPointId: string | null;
  setPendingRestPointId: (id: string | null) => void;
  useShortRestPoint: (id: string) => void;
  useRestPoint: (id: string) => void;

  // Halfling Luck & Heroic Inspiration
  pendingHalflingLuckInfo: any;
  setPendingHalflingLuckInfo: (info: any) => void;
  pendingHeroicInspirationInfo: any;
  setPendingHeroicInspirationInfo: (info: any) => void;

  // Settings Modal
  showSettingsModal: boolean;
  setShowSettingsModal: (val: boolean) => void;
  isAmbientSoundEnabled: boolean;
  setIsAmbientSoundEnabled: (val: boolean) => void;
  isSfxEnabled: boolean;
  setIsSfxEnabled: (val: boolean) => void;
  isShowMinimap: boolean;
  setIsShowMinimap: (val: boolean) => void;
  isShowZoomControls: boolean;
  setIsShowZoomControls: (val: boolean) => void;
  proceduralWorldEnabled?: boolean;
  setProceduralWorldEnabled?: (val: boolean) => void;

  // Opportunity Attack Modal
  pendingOpportunityAttack: any;
  setPendingOpportunityAttack: (v: any) => void;
  handleResolveOpportunityAttack: (accepted: boolean) => void;
}

export const GameModalsContainer: React.FC<GameModalsContainerProps> = ({
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
  showShortRestModal,
  setShowShortRestModal,
  pendingShortRestItem,
  hitDiceToSpend,
  setHitDiceToSpend,
  confirmGameShortRest,
  showItemModal,
  setShowItemModal,
  usableInventoryItems,
  itemQuantities,
  totalRationsCount,
  onCharacterUpdated,
  forceUpdate,
  selectedEntityForPopup,
  setSelectedEntityForPopup,
  showLootModal,
  setShowLootModal,
  showVictorySummaryModal = false,
  setShowVictorySummaryModal = () => {},
  initNewCombat,
  victoryData,
  mapStreak,
  handleClaimLootAndSave,
  isSaving,
  latestRoll,
  setLatestRoll,
  latestInitiativeRoll,
  setLatestInitiativeRoll,
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
  goliathAncestryUses,
  goliathAncestryMaxUses,
  getEntitySizeInSquares,
  handleExecuteGoliathHit,
  pendingGoliathDamageInfo,
  setPendingGoliathDamageInfo,
  handleExecuteGoliathDamage,
  pendingRestPointId,
  setPendingRestPointId,
  useShortRestPoint,
  useRestPoint,
  pendingHalflingLuckInfo,
  setPendingHalflingLuckInfo,
  pendingHeroicInspirationInfo,
  setPendingHeroicInspirationInfo,
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
  pendingOpportunityAttack,
  setPendingOpportunityAttack,
  handleResolveOpportunityAttack,
}) => {
  return (
    <>
      {/* Modal de Escolha de Ataque da Ficha */}
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

      {/* Modal de Seleção de Alvo */}
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

      {/* Modal de Sopro Dracônico */}
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

      {/* Modal de Descanso Curto da Arena */}
      <ShortRestArenaModal
        showShortRestModal={showShortRestModal}
        setShowShortRestModal={setShowShortRestModal}
        character={character}
        pendingShortRestItem={pendingShortRestItem}
        hitDiceToSpend={hitDiceToSpend}
        setHitDiceToSpend={setHitDiceToSpend}
        confirmGameShortRest={confirmGameShortRest}
      />

      {/* Modal de Itens e Inventário de Combate */}
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

      {/* Modal de Detalhes da Ficha / Iniciativa */}
      <InitiativeDetailsModal
        selectedEntityForPopup={selectedEntityForPopup}
        setSelectedEntityForPopup={setSelectedEntityForPopup}
        shouldHideEntityDetails={shouldHideEntityDetails}
        shouldHideMonsterStats={shouldHideMonsterStats}
        character={character}
      />

      {/* Modal de Recompensas e Tesouros Acumulados */}
      <LootModal
        showLootModal={showLootModal}
        setShowLootModal={setShowLootModal}
        victoryData={victoryData}
        mapStreak={mapStreak}
        handleClaimLootAndSave={handleClaimLootAndSave}
        isSaving={isSaving}
      />

      {/* Modal de Resumo de Vitória */}
      <VictorySummaryModal
        showVictorySummaryModal={showVictorySummaryModal}
        setShowVictorySummaryModal={setShowVictorySummaryModal}
        victoryData={victoryData}
        mapStreak={mapStreak}
        initNewCombat={initNewCombat}
        handleClaimLootAndSave={handleClaimLootAndSave}
        isSaving={isSaving}
      />

      {/* Card Flutuante de Rolagem de Dados */}
      <AttackRollHud latestRoll={latestRoll} onClose={() => setLatestRoll(null)} />

      {/* Card Flutuante de Rolagem de Iniciativa */}
      <InitiativeRollHud latestInitiativeRoll={latestInitiativeRoll} onClose={() => setLatestInitiativeRoll(null)} />

      {/* Modal de Alerta de Mente Tática */}
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

      {/* Modal de Popup da Resistência Implacável */}
      <RelentlessModal
        showRelentlessModal={showRelentlessModal}
        setShowRelentlessModal={setShowRelentlessModal}
        pendingRelentlessInfo={pendingRelentlessInfo}
        setPendingRelentlessInfo={setPendingRelentlessInfo}
      />

      {/* Modal de Reação de Acerto do Golias */}
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

      {/* Modal de Reação de Dano Recebido do Golias */}
      <GoliathDamageReactionModal
        pendingGoliathDamageInfo={pendingGoliathDamageInfo}
        setPendingGoliathDamageInfo={setPendingGoliathDamageInfo}
        entities={entities}
        character={character}
        goliathAncestryUses={goliathAncestryUses}
        goliathAncestryMaxUses={goliathAncestryMaxUses}
        handleExecuteGoliathDamage={handleExecuteGoliathDamage}
      />

      {/* Modal de Escolha de Descanso no Acampamento */}
      <CampRestModal
        pendingRestPointId={pendingRestPointId}
        setPendingRestPointId={setPendingRestPointId}
        useShortRestPoint={useShortRestPoint}
        useRestPoint={useRestPoint}
      />

      {/* Modal de Sorte de Pequenino */}
      <HalflingLuckModal
        pendingHalflingLuckInfo={pendingHalflingLuckInfo}
        setPendingHalflingLuckInfo={setPendingHalflingLuckInfo}
        addCombatLog={addCombatLog}
      />

      {/* Modal de Inspiração Heroica */}
      <HeroicInspirationModal
        pendingHeroicInspirationInfo={pendingHeroicInspirationInfo}
        setPendingHeroicInspirationInfo={setPendingHeroicInspirationInfo}
        setHasHeroicInspiration={setHasHeroicInspiration}
        addCombatLog={addCombatLog}
      />

      {/* Modal de Configurações */}
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

      {/* Modal de Ataque de Oportunidade */}
      <OpportunityAttackModal
        pendingOpportunityAttack={pendingOpportunityAttack}
        setPendingOpportunityAttack={setPendingOpportunityAttack}
        handleResolveOpportunityAttack={handleResolveOpportunityAttack}
      />
    </>
  );
};
