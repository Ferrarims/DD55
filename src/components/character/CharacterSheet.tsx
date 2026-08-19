import React, { useState, useMemo, useEffect } from 'react';
import { calculateTotalMaxHp, getMod } from '../../lib/mechanics/hpCalculator';
import { parseAttacks } from '../../lib/mechanics/inventoryParser';
import {
  getFighterFeaturesForLevel,
  getClassFeaturesGainedAtLevel,
  DRACONIC_ANCESTRIES,
  GIANT_ANCESTRIES,
  BACKGROUNDS_REFERENCE,
} from '../../lib/api/references';
import { isTwoHandedWeapon } from '../../lib/mechanics/acCalculator';
import { BestiaryModal } from './BestiaryModal';
import { getBestiaryStats } from './sheet/utils';

import { OverviewSection } from './sheet/sections/OverviewSection';
import { ProficienciesSection } from './sheet/sections/ProficienciesSection';
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

import { useCharacterSheetState } from './sheet/hooks/useCharacterSheetState';
import { useEquipmentSlots } from './sheet/hooks/useEquipmentSlots';
import { useInventoryTrade } from './sheet/hooks/useInventoryTrade';
import { useCharacterClassActions } from './sheet/hooks/useCharacterClassActions';
import { useLevelUpEngine } from './sheet/hooks/useLevelUpEngine';

import { SubclassModal } from './sheet/modals/SubclassModal';
import { EquipmentSlotsModal } from './sheet/modals/EquipmentSlotsModal';
import { AcCalculatorModal } from './sheet/modals/AcCalculatorModal';
import { ShortRestModal } from './sheet/modals/ShortRestModal';
import { HpAuditModal } from './sheet/modals/HpAuditModal';
import { LevelUpModal } from './sheet/modals/LevelUpModal';
import { EditFeatsModal } from './sheet/modals/EditFeatsModal';
import { DeleteCharacterModal } from './sheet/modals/DeleteCharacterModal';
import { TradeModals } from './sheet/modals/TradeModals';

import { CLASS_ICONS, CLASS_NAME_MAP } from './sheet/constants';

interface CharacterSheetProps {
  character: any;
  onBack: () => void;
  onDelete?: (id: string) => void;
  onCharacterUpdated?: () => void;
  onEnterGame?: (character: any) => void;
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
}) => {
  // 1. Estado Base da Ficha
  const {
    currentHp,
    setCurrentHp,
    currentExhaustion,
    setCurrentExhaustion,
    showHpAudit,
    setShowHpAudit,
    showShortRestModal,
    setShowShortRestModal,
    hitDiceToSpend,
    setHitDiceToSpend,
    isSaving,
    showDeleteConfirm,
    setShowDeleteConfirm,
    showEditFeatsModal,
    setShowEditFeatsModal,
    saveMessage,
    setSaveMessage,
    showXpManager,
    setShowXpManager,
    customXpInput,
    setCustomXpInput,
    showBestiary,
    setShowBestiary,
  } = useCharacterSheetState(character);

  // 2. Subclasse
  const [selectedSubclass, setSelectedSubclass] = useState<string>(
    character.subclass || character.subclass_name || 'Champion'
  );
  const [showSubclassModal, setShowSubclassModal] = useState(false);

  // Função utilitária de Talentos Ativos
  const getCharacterActiveFeats = (char: any): string[] => {
    const feats = Array.isArray(char.feats) ? [...char.feats] : [];
    if (char.background) {
      const bgKey = Object.keys(BACKGROUNDS_REFERENCE).find(
        k => k.toLowerCase() === String(char.background).trim().toLowerCase()
      );
      if (bgKey && BACKGROUNDS_REFERENCE[bgKey]?.feat) {
        const bgFeat = BACKGROUNDS_REFERENCE[bgKey].feat;
        if (!feats.includes(bgFeat)) feats.push(bgFeat);
      }
    }
    return feats;
  };

  // 3. Hook de Equipamentos e Slots
  const {
    showSlotsModal,
    setShowSlotsModal,
    showAcModal,
    setShowAcModal,
    setEquippedArmor,
    setEquippedShield,
    setEquippedRing,
    equipmentSlots,
    setEquipmentSlots,
    currentAc,
    setCurrentAc,
    acDetails,
    calculateTotalAc,
    handleAssignSlot,
    handleToggleEquipInInventory,
    canItemBeEquipped,
    isItemEquippedAnywhere,
    getEquipmentType,
    getItemCategory,
    getAvailableItemsForSlot,
  } = useEquipmentSlots(
    character,
    getCharacterActiveFeats,
    msg => {
      if (msg) {
        setSaveMessage(msg.text);
        setTimeout(() => setSaveMessage(null), 4000);
      }
    },
    onCharacterUpdated,
    currentHp,
    setCurrentHp
  );

  // 4. Hook de Comércio e Inventário
  const {
    inventoryTab,
    setInventoryTab,
    itemToSellConfirm,
    setItemToSellConfirm,
    sellQuantity,
    setSellQuantity,
    itemToBuyConfirm,
    setItemToBuyConfirm,
    buyQuantity,
    setBuyQuantity,
    showCustomItemModal,
    setShowCustomItemModal,
    customItemInput,
    setCustomItemInput,
    showGoldModal,
    setShowGoldModal,
    goldInput,
    setGoldInput,
    currentGoldNumber,
    totalInventoryWeight,
    maxWeightCapacity,
    isOverburdened,
    categorizedInventory,
    formatGold,
    handleSellItem,
    confirmSellItem,
    handleBuyItem,
    handleBuyItemConfirmed,
    handleAddCustomItem,
    handleSaveGold,
    handleConsumeItem,
  } = useInventoryTrade(
    character,
    equipmentSlots,
    setEquipmentSlots,
    setEquippedArmor,
    setEquippedShield,
    setEquippedRing,
    calculateTotalAc,
    setCurrentAc,
    currentHp,
    setCurrentHp,
    setShowShortRestModal,
    msg => {
      if (msg) {
        setSaveMessage(msg.text);
        setTimeout(() => setSaveMessage(null), 4000);
      }
    },
    getItemCategory,
    character.fighting_style || 'Arquearia',
    onCharacterUpdated
  );

  // 5. Hook de Ações de Classe e Descansos
  const {
    classResources,
    handleShortRest,
    handleLongRest,
    handleUseManeuver,
    handleUsePsiPower,
  } = useCharacterClassActions(
    character,
    currentHp,
    setCurrentHp,
    setCurrentExhaustion,
    setSaveMessage,
    onCharacterUpdated,
    selectedSubclass
  );

  // Realizar Descanso Longo Automático ao abrir ou voltar para a Ficha
  useEffect(() => {
    handleLongRest();
  }, [character?.id]);

  // 6. Hook de Nivelamento
  const {
    showLevelUpModal,
    setShowLevelUpModal,
    hpGainMode,
    setHpGainMode,
    rolledValue,
    isRolling,
    isLevelingUp,
    levelUpSubclass,
    setLevelUpSubclass,
    levelUpFightingStyle,
    setLevelUpFightingStyle,
    levelUpAsiChoice,
    setLevelUpAsiChoice,
    asiMode,
    setAsiMode,
    asiStat1,
    setAsiStat1,
    asiStat2,
    setAsiStat2,
    selectedFeatName,
    setSelectedFeatName,
    pendingFightingStyle,
    setPendingFightingStyle,
    pendingSubclass,
    setPendingSubclass,
    isSavingPendingChoices,
    effectiveLevel,
    nextLevel,
    isDwarf,
    hitDieStr,
    hitDieVal,
    currentConMod,
    isCurrentLevelAsi,
    needsSubclassChoice,
    needsFightingStyleChoice,
    hasPendingFightingStyle,
    hasPendingSubclass,
    hasPendingLevelChoices,
    canLevelUp,
    xpProgress,
    handleRollHitDie,
    handleConfirmLevelUp,
    handleSavePendingChoices,
    handleModifyXp,
    handleSelectSubclass,
  } = useLevelUpEngine(
    character,
    selectedSubclass,
    setSelectedSubclass,
    setCurrentHp,
    setSaveMessage,
    getCharacterActiveFeats,
    calculateTotalAc,
    setCurrentAc,
    equipmentSlots.corpo_torso,
    equipmentSlots.empunhadura_2,
    equipmentSlots.dedo_anel_1,
    onCharacterUpdated
  );

  const bestiaryStats = useMemo(() => getBestiaryStats(character), [character]);

  // Resistências e Ancestralidades
  const displayResistances = useMemo(() => {
    const res = character.resistances ? [...character.resistances] : [];
    const raceName = (character.race || '').toLowerCase();

    if (/anão|dwarf/i.test(raceName) && !res.includes('Veneno')) res.push('Veneno');
    if (/aasimar/i.test(raceName)) {
      if (!res.includes('Necrótico')) res.push('Necrótico');
      if (!res.includes('Radiante')) res.push('Radiante');
    }
    if (/tiferino|tiefling/i.test(raceName) && !res.includes('Fogo')) res.push('Fogo');

    if (/draconato|dragonborn/i.test(raceName) && character.draconic_ancestry) {
      const ancestry = DRACONIC_ANCESTRIES.find(a => a.name === character.draconic_ancestry);
      if (ancestry && !res.includes(ancestry.damageType)) {
        res.push(ancestry.damageType);
      }
    }
    if (/golias|goliath/i.test(raceName) && character.giant_ancestry) {
      const ancestry = GIANT_ANCESTRIES.find(g => g.name === character.giant_ancestry);
      if (ancestry && !res.includes(ancestry.benefitName)) {
        res.push(ancestry.benefitName);
      }
    }
    return res;
  }, [character.resistances, character.race, character.draconic_ancestry, character.giant_ancestry]);

  // Detalhes do Sopro (Draconatos)
  const breathWeaponDetails = useMemo(() => {
    const isDragonborn = /draconato|dragonborn/i.test(character.race || '');
    if (!isDragonborn) return null;

    const level = character.level || 1;
    const conMod = getMod(character.constitution || 10);
    const pbBonus = 2 + Math.floor((level - 1) / 4);
    const dc = 8 + conMod + pbBonus;

    let diceCount = 1;
    if (level >= 17) diceCount = 4;
    else if (level >= 11) diceCount = 3;
    else if (level >= 5) diceCount = 2;

    const ancestry = DRACONIC_ANCESTRIES.find(a => a.name === character.draconic_ancestry);
    const damageType = ancestry?.damageType || 'Energia';

    return {
      dc,
      conMod,
      pb: pbBonus,
      damage: `${diceCount}d10`,
      damageType,
    };
  }, [character.level, character.constitution, character.draconic_ancestry, character.race]);

  // Auditoria de PV
  const hpBreakdown = useMemo(() => {
    const activeFeats = getCharacterActiveFeats(character);
    const level = character.level || 1;
    const conMod = getMod(character.constitution || 10);
    const isDwarfRace = ['Anão', 'Dwarf'].includes(character.race);
    const hasTough = activeFeats.some(f => /vigoroso|tough/i.test(f || ''));
    const fortitudeBonus = activeFeats.some(f => /dádiva da fortitude/i.test(f || '')) ? 40 : 0;

    const baseDieVal = hitDieVal;
    const choices = Array.isArray(character.level_choices) ? character.level_choices : [];

    const levelsBreakdown: {
      level: number;
      method: string;
      baseHp: number;
      conMod: number;
      dwarfBonusAtLevel: number;
      toughBonusAtLevel: number;
      totalLevelHp: number;
    }[] = [];

    for (let lvl = 1; lvl <= level; lvl++) {
      const dwarfBonusAtLevel = isDwarfRace ? 1 : 0;
      const toughBonusAtLevel = hasTough ? 2 : 0;

      if (lvl === 1) {
        const baseHp = baseDieVal;
        const totalLevelHp = baseHp + conMod + dwarfBonusAtLevel + toughBonusAtLevel;
        levelsBreakdown.push({
          level: 1,
          method: 'Dado Máximo',
          baseHp,
          conMod,
          dwarfBonusAtLevel,
          toughBonusAtLevel,
          totalLevelHp,
        });
      } else {
        const choice = choices.find((c: any) => c.level === lvl);
        let baseHp = Math.floor(baseDieVal / 2) + 1;
        let method = 'Média';

        if (choice) {
          if (typeof choice.baseHp === 'number' && choice.baseHp > 0) {
            baseHp = choice.baseHp;
            method = choice.hpGainMode === 'roll' ? 'Dado Rolado' : 'Média';
          } else if (choice.hpGain) {
            const match = String(choice.hpGain).match(/\+(\d+)/);
            if (match) {
              const totalGain = parseInt(match[1], 10);
              baseHp = Math.max(1, totalGain - conMod);
              method = String(choice.hpGain).toLowerCase().includes('dado') ? 'Dado Rolado' : 'Média';
            }
          }
        }

        const totalLevelHp = baseHp + conMod + dwarfBonusAtLevel + toughBonusAtLevel;
        levelsBreakdown.push({
          level: lvl,
          method,
          baseHp,
          conMod,
          dwarfBonusAtLevel,
          toughBonusAtLevel,
          totalLevelHp,
        });
      }
    }

    const sumBaseHp = levelsBreakdown.reduce((acc, curr) => acc + curr.baseHp, 0);
    const conBonusTotal = conMod * level;
    const dwarfBonus = isDwarfRace ? level : 0;
    const toughBonus = hasTough ? level * 2 : 0;
    const calculatedTotal = sumBaseHp + conBonusTotal + dwarfBonus + toughBonus + fortitudeBonus;
    const totalMaxHp = calculatedTotal;

    return {
      base: sumBaseHp,
      baseHp: sumBaseHp,
      conBonusTotal,
      conModBonus: conBonusTotal,
      dwarfBonus,
      toughBonus,
      fortitudeBonus,
      totalMaxHp,
      total: totalMaxHp,
      levelsBreakdown,
    };
  }, [character, hitDieVal]);

  const rawClassKey = (character.class_name || character.className || 'Fighter').toLowerCase();
  const matchedClassKey = CLASS_NAME_MAP[rawClassKey] || 'Fighter';
  const icon = CLASS_ICONS[matchedClassKey] || '⚔️';
  const pb = 2 + Math.floor(((character.level || 1) - 1) / 4);

  const avgHpGain = Math.floor(hitDieVal / 2) + 1 + currentConMod;
  const rolledHpGain = (rolledValue !== null ? rolledValue : Math.floor(hitDieVal / 2) + 1) + currentConMod;
  const activeHpGain = hpGainMode === 'avg' ? avgHpGain : rolledHpGain;

  const nextProgression = useMemo(() => {
    const fighterFeats = getFighterFeaturesForLevel(nextLevel, levelUpSubclass)
      .filter(f => f.level === nextLevel)
      .map(f => f.name);
    const genericFeats = getClassFeaturesGainedAtLevel(character.class_name || 'Guerreiro', nextLevel, levelUpSubclass);
    
    const featureNames = Array.from(
      new Set([
        ...fighterFeats,
        ...(Array.isArray(genericFeats)
          ? genericFeats.map(f => (typeof f === 'string' ? f : (f as any)?.name || String(f)))
          : [])
      ])
    ).filter(Boolean);

    return {
      features: featureNames,
    };
  }, [character.class_name, nextLevel, levelUpSubclass]);

  const newFeaturesText = useMemo(() => {
    const list = nextProgression.features;
    if (!list || list.length === 0) return 'Recursos de classe atualizados para o novo nível.';
    return list.join(', ');
  }, [nextProgression]);

  const spellsList = useMemo(() => {
    const raw = character.spells || character.character_spells || [];
    return Array.isArray(raw) ? raw : [];
  }, [character.spells, character.character_spells]);

  const attacks = useMemo(() => {
    const rawInv = character.character_inventory || [];
    const weaponItems = rawInv.map((inv: any) => ({
      name: inv.items?.name || inv.name || '',
      equipped: true,
      category: inv.items?.category || inv.category || 'Armas'
    }));

    const stats = {
      str: character.strength ?? character.str ?? 15,
      dex: character.dexterity ?? character.dex ?? 14,
      con: character.constitution ?? character.con ?? 13,
      int: character.intelligence ?? character.int ?? 14,
      wis: character.wisdom ?? character.wis ?? 11,
      cha: character.charisma ?? character.cha ?? 8,
    };

    const className = (character.class_name || character.charClass || 'Fighter').toLowerCase();
    let attackStat: 'str' | 'dex' | 'int' | 'wis' | 'cha' = 'str';
    if (className.includes('mago') || className.includes('wizard')) attackStat = 'int';
    else if (className.includes('clérigo') || className.includes('cleric') || className.includes('druida') || className.includes('druid')) attackStat = 'wis';
    else if (className.includes('bardo') || className.includes('bard') || className.includes('feiticeiro') || className.includes('sorcerer') || className.includes('bruxo') || className.includes('warlock') || className.includes('paladino') || className.includes('paladin')) attackStat = 'cha';
    else if (className.includes('ladino') || className.includes('rogue') || className.includes('monge') || className.includes('monk')) attackStat = 'dex';

    const parsed = parseAttacks(
      weaponItems,
      spellsList,
      stats,
      attackStat,
      pb,
      getCharacterActiveFeats(character)
    );

    const existingAttacks = Array.isArray(character.attacks) ? character.attacks : [];
    const combined = [...parsed];
    existingAttacks.forEach((ex: any) => {
      if (!combined.some(c => c.name.toLowerCase() === ex.name.toLowerCase())) {
        combined.push({
          name: ex.name,
          bonus: ex.attack_bonus ?? ex.bonus ?? 0,
          damage: ex.damage || '1d6',
          type: ex.damage_type || ex.type || 'Contundente',
          mastery: ex.mastery,
          range: ex.range,
          properties: ex.properties
        });
      }
    });

    return combined.map(a => ({
      ...a,
      attack_bonus: a.bonus ?? (a as any).attack_bonus ?? 0,
      damage_type: a.type ?? (a as any).damage_type ?? 'Cortante'
    }));
  }, [character.character_inventory, character.attacks, character.strength, character.str, character.dexterity, character.dex, character.class_name, pb, spellsList]);

  const hasMasteryFeature = useMemo(() => {
    const lvl = character.level || 1;
    return (character.class_name || '').toLowerCase().includes('guerreiro') && lvl >= 1;
  }, [character.class_name, character.level]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 px-2 sm:px-4">
      {/* Notificação Flutuante / Ícone Voador de Mensagens (Zero Layout Shift) */}
      {saveMessage && (
        <div className="fixed top-5 right-5 z-[9999] max-w-md w-[calc(100vw-2.5rem)] sm:w-auto bg-slate-950/95 backdrop-blur-md border-2 border-emerald-500/80 text-emerald-100 text-xs font-bold rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.85)] p-3.5 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300 ring-1 ring-emerald-400/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-base flex-shrink-0 animate-bounce">
              ✨
            </div>
            <span className="leading-snug text-emerald-200 font-semibold">{saveMessage}</span>
          </div>
          <button
            onClick={() => setSaveMessage(null)}
            className="text-emerald-400 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 rounded-lg px-2 py-1 transition flex-shrink-0 text-xs"
            title="Fechar Notificação"
          >
            ✕
          </button>
        </div>
      )}

      {/* Barra Superior com Controles Rápidos e Navegação */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg border border-slate-700 transition text-xs flex items-center gap-1.5"
          >
            <span>←</span> Voltar
          </button>

          {onEnterGame && (
            <button
              onClick={() => onEnterGame(character)}
              className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-lg text-xs shadow-lg transition flex items-center gap-1.5 border border-amber-300"
            >
              <span>⚔️</span> Jogar Aventura
            </button>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <div 
              className="flex items-center gap-1.5 bg-slate-900/90 border border-purple-800/60 rounded-lg px-2.5 py-1.5 text-xs shadow-inner"
              title={`Criaturas Derrotadas: ${bestiaryStats.uniqueCount} espécie(s) diferente(s), ${bestiaryStats.totalCount} no total`}
            >
              <span className="text-purple-300 font-medium whitespace-nowrap">
                👾 <strong className="text-purple-200 font-bold">{bestiaryStats.uniqueCount}</strong> dif.
              </span>
              <span className="text-slate-600 font-bold">•</span>
              <span className="text-amber-300 font-medium whitespace-nowrap">
                💀 <strong className="text-amber-200 font-bold">{bestiaryStats.totalCount}</strong> total
              </span>
            </div>

            <button
              onClick={() => setShowBestiary(true)}
              className="px-3.5 py-1.5 bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-700/60 font-bold rounded-lg transition text-xs flex items-center gap-1.5"
            >
              <span>📖</span> Bestiário
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-700/50 font-bold rounded-lg transition text-xs"
            >
              🗑️ Excluir
            </button>
          )}
        </div>
      </div>

      {/* Banner de Evolução de Nível */}
      <LevelUpBanner
        canLevelUp={canLevelUp}
        effectiveLevel={effectiveLevel}
        nextLevel={nextLevel}
        xp={character.xp || 0}
        onOpenLevelUpModal={() => setShowLevelUpModal(true)}
      />

      {/* Visão Geral: Identidade, Nível, XP e Inspiração */}
      <OverviewSection
        character={character}
        xpInfo={xpProgress}
        pb={pb}
        showXpManager={showXpManager}
        setShowXpManager={setShowXpManager}
        handleModifyXp={handleModifyXp}
        customXpInput={customXpInput}
        setCustomXpInput={setCustomXpInput}
        getMod={getMod}
        icon={icon}
      />

      {/* Proficiências e Salvaguardas */}
      <ProficienciesSection character={character} />

      {/* Painel de Escolhas Pendentes do Nível */}
      <PendingLevelChoicesSection
        hasPendingLevelChoices={hasPendingLevelChoices}
        hasPendingFightingStyle={hasPendingFightingStyle}
        hasPendingSubclass={hasPendingSubclass}
        pendingFightingStyle={pendingFightingStyle}
        setPendingFightingStyle={setPendingFightingStyle}
        pendingSubclass={pendingSubclass}
        setPendingSubclass={setPendingSubclass}
        handleSavePendingChoices={handleSavePendingChoices}
        isSavingPendingChoices={isSavingPendingChoices}
        character={character}
      />

      {/* Estatísticas de Combate: PV, CA, Iniciativa, Resistências e Exaustão */}
      <CombatStatsSection
        character={character}
        currentHp={currentHp}
        hpBreakdown={hpBreakdown}
        currentAc={currentAc}
        displayResistances={displayResistances}
        currentExhaustion={currentExhaustion}
        pb={pb}
        setShowHpAudit={setShowHpAudit}
        setShowAcModal={setShowAcModal}
        getCharacterActiveFeats={getCharacterActiveFeats}
        getMod={getMod}
        formatMod={formatMod}
      />

      {/* Modal de Auditoria de PV */}
      <HpAuditModal
        showHpAudit={showHpAudit}
        setShowHpAudit={setShowHpAudit}
        hpBreakdown={hpBreakdown}
      />

      {/* Painel Principal: Ataques & Equipamento */}
      <div className="grid grid-cols-1 lg:col-span-2 gap-6">
        <AttacksSection
          attacks={attacks}
          breathWeaponDetails={breathWeaponDetails}
          hasMasteryFeature={hasMasteryFeature}
        />

        <EquipmentAndInventorySection
          character={character}
          currentGoldNumber={currentGoldNumber}
          formatGold={formatGold}
          inventoryTab={inventoryTab}
          setInventoryTab={setInventoryTab}
          setGoldInput={setGoldInput}
          setShowGoldModal={setShowGoldModal}
          setShowSlotsModal={setShowSlotsModal}
          categorizedInventory={categorizedInventory}
          totalInventoryWeight={totalInventoryWeight}
          maxWeightCapacity={maxWeightCapacity}
          isOverburdened={isOverburdened}
          isItemEquippedAnywhere={isItemEquippedAnywhere}
          canItemBeEquipped={canItemBeEquipped}
          getEquipmentType={getEquipmentType}
          handleToggleEquipInInventory={handleToggleEquipInInventory}
          handleConsumeItem={handleConsumeItem}
          handleSellItem={handleSellItem}
          handleBuyItem={handleBuyItem}
        />
      </div>

      {/* Magias */}
      <SpellsSection spellsList={spellsList} />

      {/* Recursos de Classe */}
      {classResources.filter((res: any) => res.name !== 'Cantil de Água').length > 0 && (
        <ClassResourcesSection
          character={character}
          classResources={classResources}
        />
      )}

      {/* Antecedente / Histórico de Origem (Background) */}
      <BackgroundSection character={character} />

      {/* Habilidades de Raça */}
      <RaceTraitsSection
        character={character}
        getCharacterActiveFeats={getCharacterActiveFeats}
        breathWeaponDetails={breathWeaponDetails}
      />

      {/* Habilidades e Características de Classe/Subclasse */}
      <ClassTraitsSection
        character={character}
        selectedSubclass={selectedSubclass}
        handleUseManeuver={handleUseManeuver}
        handleUsePsiPower={handleUsePsiPower}
      />

      {/* Histórico de Talentos */}
      <FeatsHistorySection
        character={character}
        activeFeatsList={getCharacterActiveFeats(character)}
        hpBreakdown={hpBreakdown}
      />

      {/* Modais */}
      <SubclassModal
        showSubclassModal={showSubclassModal}
        setShowSubclassModal={setShowSubclassModal}
        selectedSubclass={selectedSubclass}
        handleSelectSubclass={(key: string) => handleSelectSubclass(key, setShowSubclassModal)}
      />

      {showShortRestModal && (
        <ShortRestModal
          character={character}
          hitDiceToSpend={hitDiceToSpend}
          setHitDiceToSpend={setHitDiceToSpend}
          currentHp={currentHp}
          onClose={() => setShowShortRestModal(false)}
          handleShortRest={handleShortRest}
        />
      )}

      {showBestiary && (
        <BestiaryModal
          characterId={character.id}
          defeatedMonsters={character.defeated_monsters || character.defeatedMonsters}
          onClose={() => setShowBestiary(false)}
        />
      )}

      <LevelUpModal
        showLevelUpModal={showLevelUpModal}
        setShowLevelUpModal={setShowLevelUpModal}
        icon={icon}
        currentLevel={effectiveLevel}
        nextLevel={nextLevel}
        character={character}
        needsSubclassChoice={needsSubclassChoice}
        subclassLevel={3}
        levelUpSubclass={levelUpSubclass}
        setLevelUpSubclass={setLevelUpSubclass}
        needsFightingStyleChoice={needsFightingStyleChoice}
        levelUpFightingStyle={levelUpFightingStyle}
        setLevelUpFightingStyle={setLevelUpFightingStyle}
        isCurrentLevelAsi={isCurrentLevelAsi}
        levelUpAsiChoice={levelUpAsiChoice}
        setLevelUpAsiChoice={setLevelUpAsiChoice}
        asiMode={asiMode}
        setAsiMode={setAsiMode}
        asiStat1={asiStat1 as any}
        setAsiStat1={setAsiStat1 as any}
        asiStat2={asiStat2 as any}
        setAsiStat2={setAsiStat2 as any}
        selectedFeatName={selectedFeatName}
        setSelectedFeatName={setSelectedFeatName}
        hitDieStr={hitDieStr}
        hpGainMode={hpGainMode}
        setHpGainMode={setHpGainMode}
        avgHpGain={avgHpGain}
        rolledValue={rolledValue}
        rolledHpGain={rolledHpGain}
        handleRollHitDie={handleRollHitDie}
        isRolling={isRolling}
        getCharacterActiveFeats={getCharacterActiveFeats}
        calculateTotalMaxHp={calculateTotalMaxHp}
        hpBreakdown={hpBreakdown}
        activeHpGain={activeHpGain}
        hitDieVal={hitDieVal}
        conMod={currentConMod}
        isDwarf={isDwarf}
        newFeaturesText={newFeaturesText}
        nextProgression={nextProgression}
        handleConfirmLevelUp={handleConfirmLevelUp}
        isLevelingUp={isLevelingUp}
      />

      <EditFeatsModal
        showEditFeatsModal={showEditFeatsModal}
        setShowEditFeatsModal={setShowEditFeatsModal}
        character={character}
        getCharacterActiveFeats={getCharacterActiveFeats}
        onCharacterUpdated={onCharacterUpdated}
      />

      <DeleteCharacterModal
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        character={character}
        onDelete={onDelete}
      />

      <TradeModals
        itemToSellConfirm={itemToSellConfirm}
        setItemToSellConfirm={setItemToSellConfirm}
        sellQuantity={sellQuantity}
        setSellQuantity={setSellQuantity}
        confirmSellItem={confirmSellItem}
        itemToBuyConfirm={itemToBuyConfirm}
        setItemToBuyConfirm={setItemToBuyConfirm}
        buyQuantity={buyQuantity}
        setBuyQuantity={setBuyQuantity}
        currentGoldNumber={currentGoldNumber}
        formatGold={formatGold}
        handleBuyItemConfirmed={handleBuyItemConfirmed}
        showGoldModal={showGoldModal}
        setShowGoldModal={setShowGoldModal}
        goldInput={goldInput}
        setGoldInput={setGoldInput}
        handleSaveGold={handleSaveGold}
        showCustomItemModal={showCustomItemModal}
        setShowCustomItemModal={setShowCustomItemModal}
        customItemInput={customItemInput}
        setCustomItemInput={setCustomItemInput}
        handleAddCustomItem={handleAddCustomItem}
      />

      {showSlotsModal && (
        <EquipmentSlotsModal
          character={character}
          equipmentSlots={equipmentSlots}
          currentAc={currentAc}
          onClose={() => setShowSlotsModal(false)}
          handleAssignSlot={handleAssignSlot}
          getAvailableItemsForSlot={getAvailableItemsForSlot}
          isTwoHandedWeapon={isTwoHandedWeapon}
        />
      )}

      {showAcModal && (
        <AcCalculatorModal
          acDetails={acDetails}
          onClose={() => setShowAcModal(false)}
        />
      )}
    </div>
  );
};
