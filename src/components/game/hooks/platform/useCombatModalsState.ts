import { useState, useEffect } from 'react';
import { CombatEntity, GridPosition } from '../../../../game/types';

export function useCombatModalsState() {
  // Modais de Ação e Menu
  const [showAttackModal, setShowAttackModal] = useState<boolean>(false);
  const [showItemModal, setShowItemModal] = useState<boolean>(false);
  const [showShortRestModal, setShowShortRestModal] = useState<boolean>(false);
  const [pendingShortRestItem, setPendingShortRestItem] = useState<any>(null);
  const [hitDiceToSpend, setHitDiceToSpend] = useState<number>(1);
  const [showLootModal, setShowLootModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  // Estados para Mente Tática (Tactical Mind)
  const [showTacticalMindAlertModal, setShowTacticalMindAlertModal] = useState<boolean>(false);
  const [pendingTacticalMindInfo, setPendingTacticalMindInfo] = useState<{
    checkName: string;
    rollTotal: number;
    dc: number;
    onApplyBonus: (bonus: number) => void;
    onDecline: () => void;
  } | null>(null);

  // Estados para Resistência Implacável (Orc)
  const [showRelentlessModal, setShowRelentlessModal] = useState<boolean>(false);
  const [pendingRelentlessInfo, setPendingRelentlessInfo] = useState<any>(null);

  // Ataque de Oportunidade pendente
  const [pendingOpportunityAttack, setPendingOpportunityAttack] = useState<{
    monster: CombatEntity;
    triggerStep: GridPosition;
    decision: any;
    hero: CombatEntity;
    atkToUse: any;
    isDarkEnv: boolean;
  } | null>(null);

  // Pop-up de detalhes de personagem/monstro selecionado na iniciativa
  const [selectedEntityForPopup, setSelectedEntityForPopup] = useState<CombatEntity | null>(null);

  // Estados de Seleção de Alvo para Ataques (múltiplos inimigos)
  const [showTargetModal, setShowTargetModal] = useState<boolean>(false);
  const [targetCandidates, setTargetCandidates] = useState<CombatEntity[]>([]);
  const [pendingAttackInfo, setPendingAttackInfo] = useState<{
    type: 'weapon' | 'magic' | 'bomb' | 'cleave' | 'offhand';
    overrideAtk?: any;
    item?: any;
    originalTargetId?: string;
  } | null>(null);

  // HUDs de Rolagens Recentes
  const [latestRoll, setLatestRoll] = useState<{
    id: string;
    attackerName: string;
    defenderName: string;
    logTitle: string;
    logDetail: string;
    isCritical: boolean;
    isFumble: boolean;
    damage: number;
    hit: boolean;
  } | null>(null);

  const [latestInitiativeRoll, setLatestInitiativeRoll] = useState<{
    id: string;
    rolls: Array<{
      id: string;
      name: string;
      icon: string;
      d20: number;
      mod: number;
      total: number;
      isHero: boolean;
    }>;
    firstToActName?: string;
  } | null>(null);

  useEffect(() => {
    if (latestRoll) {
      const timer = setTimeout(() => {
        setLatestRoll(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [latestRoll]);

  useEffect(() => {
    if (latestInitiativeRoll) {
      const timer = setTimeout(() => {
        setLatestInitiativeRoll(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [latestInitiativeRoll]);

  // Estados do Sopro Dracônico (Dragonborn)
  const [showBreathWeaponModal, setShowBreathWeaponModal] = useState<boolean>(false);
  const [breathWeaponShape, setBreathWeaponShape] = useState<'cone' | 'line'>('cone');
  const [selectedBreathTargets, setSelectedBreathTargets] = useState<string[]>([]);

  // Estados de Revelação Celestial (Aasimar)
  const [showRevelationMenu, setShowRevelationMenu] = useState<boolean>(false);

  // Estados da Ancestralidade Golias
  const [isTeleportTargetMode, setIsTeleportTargetMode] = useState<boolean>(false);
  const [pendingGoliathHitInfo, setPendingGoliathHitInfo] = useState<{ targetId: string; damage: number } | null>(null);
  const [pendingGoliathDamageInfo, setPendingGoliathDamageInfo] = useState<{ 
    damageDealt: number; 
    attackerId: string | null; 
    attackerName: string; 
    isWithin60Ft: boolean;
  } | null>(null);

  // Estados de Sorte do Halfling
  const [pendingHalflingLuckInfo, setPendingHalflingLuckInfo] = useState<{
    title: string;
    description: string;
    rollDetails?: string;
    onReroll: () => void;
    onDecline: () => void;
  } | null>(null);

  // Estados de Inspiração Heroica
  const [pendingHeroicInspirationInfo, setPendingHeroicInspirationInfo] = useState<{
    type: 'attack' | 'saving_throw' | 'skill_check';
    title: string;
    description: string;
    rollDetails?: string;
    onReroll: () => void;
    onDecline: () => void;
  } | null>(null);

  return {
    showAttackModal,
    setShowAttackModal,
    showItemModal,
    setShowItemModal,
    showShortRestModal,
    setShowShortRestModal,
    pendingShortRestItem,
    setPendingShortRestItem,
    hitDiceToSpend,
    setHitDiceToSpend,
    showLootModal,
    setShowLootModal,
    showSettingsModal,
    setShowSettingsModal,
    showTacticalMindAlertModal,
    setShowTacticalMindAlertModal,
    pendingTacticalMindInfo,
    setPendingTacticalMindInfo,
    showRelentlessModal,
    setShowRelentlessModal,
    pendingRelentlessInfo,
    setPendingRelentlessInfo,
    pendingOpportunityAttack,
    setPendingOpportunityAttack,
    selectedEntityForPopup,
    setSelectedEntityForPopup,
    showTargetModal,
    setShowTargetModal,
    targetCandidates,
    setTargetCandidates,
    pendingAttackInfo,
    setPendingAttackInfo,
    latestRoll,
    setLatestRoll,
    latestInitiativeRoll,
    setLatestInitiativeRoll,
    showBreathWeaponModal,
    setShowBreathWeaponModal,
    breathWeaponShape,
    setBreathWeaponShape,
    selectedBreathTargets,
    setSelectedBreathTargets,
    showRevelationMenu,
    setShowRevelationMenu,
    isTeleportTargetMode,
    setIsTeleportTargetMode,
    pendingGoliathHitInfo,
    setPendingGoliathHitInfo,
    pendingGoliathDamageInfo,
    setPendingGoliathDamageInfo,
    pendingHalflingLuckInfo,
    setPendingHalflingLuckInfo,
    pendingHeroicInspirationInfo,
    setPendingHeroicInspirationInfo
  };
}
