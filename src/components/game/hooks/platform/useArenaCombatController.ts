import { useGameLifecycle } from '../useGameLifecycle';
import { useArenaRenderingController } from './arenaController/useArenaRenderingController';
import { useArenaTurnAndAIController } from './arenaController/useArenaTurnAndAIController';
import { useArenaActionsAndMovementController } from './arenaController/useArenaActionsAndMovementController';

export interface UseArenaCombatControllerProps {
  character: any;
  onCharacterUpdated?: () => Promise<void> | void;
  gamePlatformState: any;
  handleExecuteCelestialRevelation: (type: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica') => void;
  isHeroTurn: boolean;
  activeEntity: any;
}

export function useArenaCombatController({
  character,
  onCharacterUpdated,
  gamePlatformState,
  handleExecuteCelestialRevelation,
  isHeroTurn,
  activeEntity
}: UseArenaCombatControllerProps) {
  // Ações de Combate e Movimentação
  const {
    heroCombatActions,
    moveHeroDirection,
    handleCellClick,
    checkGridTriggers,
  } = useArenaActionsAndMovementController({
    ...gamePlatformState,
    character,
    activeEntity,
    isHeroTurn,
    isBattleOver: gamePlatformState.isBattleOver,
    activeAdvantageMode: gamePlatformState.rollAdvantageState,
    handleExecuteCelestialRevelation,
  });

  // Turnos, Oportunidades, IA e Teclado
  const {
    advanceTurn,
    handleResolveOpportunityAttack,
  } = useArenaTurnAndAIController({
    ...gamePlatformState,
    character,
    activeEntity,
    isHeroTurn,
    checkGridTriggers,
    moveHeroDirection,
  });

  // Ciclo de Vida do Jogo
  useGameLifecycle({
    ...gamePlatformState,
    character,
    onCharacterUpdated,
    advanceTurn,
  });

  // Renderizadores Canvas e Minimapa
  useArenaRenderingController({
    ...gamePlatformState,
    character,
    activeEntity,
    isGoliath: gamePlatformState.isGoliath || false,
    isIndoor: gamePlatformState.isIndoor || false,
  });

  return {
    heroCombatActions,
    moveHeroDirection,
    handleCellClick,
    checkGridTriggers,
    advanceTurn,
    handleResolveOpportunityAttack
  };
}
