import React from 'react';
import { getMod } from '../../lib/mechanics/hpCalculator';
import { OverviewSection } from './sheet/sections/OverviewSection';
import { ProficienciesSection } from './sheet/sections/ProficienciesSection';
import { SkillsSection } from './sheet/sections/SkillsSection';
import { ClassResourcesSection } from './sheet/sections/ClassResourcesSection';
import { BackgroundSection } from './sheet/sections/BackgroundSection';
import { RaceTraitsSection } from './sheet/sections/RaceTraitsSection';
import { PendingLevelChoicesSection } from './sheet/sections/PendingLevelChoicesSection';
import { LevelUpBanner } from './sheet/sections/LevelUpBanner';
import { EquipmentAndInventorySection } from './sheet/sections/EquipmentAndInventorySection';
import { SpellsSection } from './sheet/sections/SpellsSection';
import { CombatStatsSection } from './sheet/sections/CombatStatsSection';
import { AttacksSection } from './sheet/sections/AttacksSection';
import { ClassTraitsSection } from './sheet/sections/ClassTraitsSection';
import { FeatsHistorySection } from './sheet/sections/FeatsHistorySection';
import { CharacterSheetNavbar } from './sheet/sections/CharacterSheetNavbar';
import { CharacterSheetModals } from './sheet/modals/CharacterSheetModals';
import { useCharacterSheetFacade } from './sheet/hooks/useCharacterSheetFacade';
import { getCharacterActiveFeats } from './sheet/utils/characterSheetCalculations';

interface CharacterSheetProps {
  character: any;
  onBack: () => void;
  onDelete?: (id: string) => void;
  onCharacterUpdated?: () => void;
  onEnterGame?: (character: any) => void;
  isAdminView?: boolean;
}

const formatMod = (val: number) => {
  const mod = getMod(val);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};

export const CharacterSheet: React.FC<CharacterSheetProps> = ({
  character,
  onBack,
  onDelete,
  onCharacterUpdated,
  onEnterGame,
  isAdminView = false,
}) => {
  const facade = useCharacterSheetFacade({
    character,
    onCharacterUpdated,
    isAdminView,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 px-2 sm:px-4">
      {/* Barra de Navegação e Notificações */}
      <CharacterSheetNavbar
        character={character}
        onBack={onBack}
        onEnterGame={onEnterGame}
        onDelete={onDelete}
        setShowDeleteConfirm={facade.setShowDeleteConfirm}
        setShowBestiary={facade.setShowBestiary}
        bestiaryStats={facade.bestiaryStats}
        saveMessage={facade.saveMessage}
        setSaveMessage={facade.setSaveMessage}
      />

      {/* Banner de Evolução de Nível */}
      <LevelUpBanner
        canLevelUp={facade.canLevelUp}
        effectiveLevel={facade.effectiveLevel}
        nextLevel={facade.nextLevel}
        xp={character.xp || 0}
        onOpenLevelUpModal={() => facade.setShowLevelUpModal(true)}
      />

      {/* Visão Geral */}
      <OverviewSection
        character={character}
        xpInfo={facade.xpProgress}
        pb={facade.pb}
        showXpManager={facade.showXpManager}
        setShowXpManager={facade.setShowXpManager}
        handleModifyXp={facade.handleModifyXp}
        customXpInput={facade.customXpInput}
        setCustomXpInput={facade.setCustomXpInput}
        getMod={getMod}
        icon={facade.icon}
      />

      {/* Proficiências e Salvaguardas */}
      <ProficienciesSection character={character} />

      {/* Perícias Oficiais (D&D 2024 / 5.5e) */}
      <SkillsSection character={character} />

      {/* Painel de Escolhas Pendentes */}
      {!isAdminView && (
        <PendingLevelChoicesSection
          hasPendingLevelChoices={facade.hasPendingLevelChoices}
          hasPendingFightingStyle={facade.hasPendingFightingStyle}
          hasPendingSubclass={facade.hasPendingSubclass}
          pendingFightingStyle={facade.pendingFightingStyle}
          setPendingFightingStyle={facade.setPendingFightingStyle}
          pendingSubclass={facade.pendingSubclass}
          setPendingSubclass={facade.setPendingSubclass}
          handleSavePendingChoices={facade.handleSavePendingChoices}
          isSavingPendingChoices={facade.isSavingPendingChoices}
          character={character}
        />
      )}

      {/* Estatísticas de Combate */}
      <CombatStatsSection
        character={character}
        currentHp={facade.currentHp}
        hpBreakdown={facade.hpBreakdown}
        currentAc={facade.currentAc}
        displayResistances={facade.displayResistances}
        currentExhaustion={facade.currentExhaustion}
        pb={facade.pb}
        setShowHpAudit={facade.setShowHpAudit}
        setShowAcModal={facade.setShowAcModal}
        getCharacterActiveFeats={getCharacterActiveFeats}
        getMod={getMod}
        formatMod={formatMod}
      />

      {/* Painel Principal: Ataques & Equipamento */}
      <div className="grid grid-cols-1 lg:col-span-2 gap-6">
        <AttacksSection
          attacks={facade.attacks}
          breathWeaponDetails={facade.breathWeaponDetails}
          hasMasteryFeature={facade.hasMasteryFeature}
        />

        <EquipmentAndInventorySection
          character={character}
          currentGoldNumber={facade.currentGoldNumber}
          formatGold={facade.formatGold}
          inventoryTab={facade.inventoryTab}
          setInventoryTab={facade.setInventoryTab}
          setGoldInput={facade.setGoldInput}
          setShowGoldModal={facade.setShowGoldModal}
          setShowSlotsModal={facade.setShowSlotsModal}
          categorizedInventory={facade.categorizedInventory}
          totalInventoryWeight={facade.totalInventoryWeight}
          maxWeightCapacity={facade.maxWeightCapacity}
          isOverburdened={facade.isOverburdened}
          isItemEquippedAnywhere={facade.isItemEquippedAnywhere}
          canItemBeEquipped={facade.canItemBeEquipped}
          getEquipmentType={facade.getEquipmentType}
          handleToggleEquipInInventory={facade.handleToggleEquipInInventory}
          handleConsumeItem={facade.handleConsumeItem}
          handleSellItem={facade.handleSellItem}
          handleBuyItem={facade.handleBuyItem}
        />
      </div>

      {/* Magias */}
      <SpellsSection spellsList={facade.spellsList} />

      {/* Recursos de Classe */}
      {(() => {
        const isRacialResource = (resName: string) => {
          const n = (resName || '').toLowerCase();
          return (
            n.includes('sopro') ||
            n.includes('dracônico') ||
            n.includes('draconico') ||
            n.includes('golias') ||
            n.includes('gigante') ||
            n.includes('forma grande') ||
            n.includes('adrenalina') ||
            n.includes('mãos curativas') ||
            n.includes('revelação celestial') ||
            n.includes('resistência implacável') ||
            n.includes('resistencia implacavel') ||
            n.includes('fogo das fadas') ||
            n.includes('aumentar/reduzir') ||
            n.includes('repreensão infernal') ||
            n.includes('escuridão')
          );
        };

        const classOnlyResources = (facade.classResources || []).filter(
          (res: any) => res.name !== 'Cantil de Água' && !isRacialResource(res.name)
        );
        const racialResources = (facade.classResources || []).filter(
          (res: any) => res.name !== 'Cantil de Água' && isRacialResource(res.name)
        );

        return (
          <>
            {classOnlyResources.length > 0 && (
              <ClassResourcesSection
                character={character}
                classResources={classOnlyResources}
              />
            )}

            {/* Habilidades de Classe & Subclasse */}
            <ClassTraitsSection
              character={character}
              selectedSubclass={facade.selectedSubclass}
              handleUseManeuver={facade.handleUseManeuver}
              handleUsePsiPower={facade.handleUsePsiPower}
            />

            {/* Raça & Habilidades de Raça Unificadas */}
            <RaceTraitsSection
              character={character}
              getCharacterActiveFeats={getCharacterActiveFeats}
              breathWeaponDetails={facade.breathWeaponDetails}
              racialResources={racialResources}
            />
          </>
        );
      })()}

      {/* Antecedente */}
      <BackgroundSection character={character} />

      {/* Histórico de Talentos */}
      <FeatsHistorySection
        character={character}
        activeFeatsList={getCharacterActiveFeats(character)}
        hpBreakdown={facade.hpBreakdown}
      />

      {/* Modais */}
      <CharacterSheetModals
        {...facade}
        character={character}
        onCharacterUpdated={onCharacterUpdated}
        onDelete={onDelete}
        handleSelectSubclass={(key: string) =>
          facade.handleSelectSubclass(key, facade.setShowSubclassModal)
        }
      />
    </div>
  );
};
