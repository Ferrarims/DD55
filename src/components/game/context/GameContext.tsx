import React, { createContext, useContext } from 'react';
import { GamePlatformState } from '../hooks/useGamePlatformState';

export interface GameContextType extends GamePlatformState {
  renderCanvasElement: () => React.ReactNode;
  renderMinimapElement: (customClass?: string) => React.ReactNode;
  handleExitGame: () => Promise<void>;
  handleHeroAttack: () => void;
  handleTriggerHeroOffHandAttack: () => void;
  handleHeroDash: () => void;
  handleAdrenalineRush: () => void;
  handleCelestialRevelation: (type: 'Alma Radiante' | 'Consumo Radiante' | 'Mortalha Necrótica') => void;
  handleHeroChannelDivinity: () => void;
  handleOpenBreathWeaponModal: () => void;
  handleHeroMagicSpell: () => void;
  handleHeroIndomitable: () => void;
  handleHeroRecklessAttack: () => void;
  handleHeroBardicInspiration: () => void;
  handleHeroLayOnHands: () => void;
  handleHeroFlurryOfBlows: () => void;
  handleHeroWildShape: () => void;
  handleHeroManeuver: () => void;
  handleDraconicFlight: () => void;
  handleLargeForm: () => void;
  handleHeroDodge: () => void;
  handleHeroHide: () => void;
  handleHeroSecondWind: () => void;
  handleHeroActionSurge: () => void;
  handleHeroRage: () => void;
  handleHeroDisengage: () => void;
  handleHeroStandUp: () => void;
  handleHeroEscapeGrapple: () => void;
  handleHeroSearchArea?: () => void;
  handleHeroFirstAid?: () => void;
  advanceTurn: () => void;
  [key: string]: any;
}

// Um contexto com tipagem estrita para armazenar todo o estado do GamePlatform.
export const GameContext = createContext<GameContextType | null>(null);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameContext deve ser usado dentro de um GameProvider');
  }
  return context;
};
