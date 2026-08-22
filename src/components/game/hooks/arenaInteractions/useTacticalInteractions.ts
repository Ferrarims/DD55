import React from 'react';
import { CombatEntity, CellData, BiomeType } from '../../../../game/types';
import { useStealthAndHiding } from './tactical/useStealthAndHiding';
import { useGrappleAndMovementActions } from './tactical/useGrappleAndMovementActions';
import { useSkillFieldActions } from './tactical/useSkillFieldActions';

export interface UseTacticalInteractionsProps {
  entities: CombatEntity[];
  setEntities: React.Dispatch<React.SetStateAction<CombatEntity[]>>;
  grid: CellData[][];
  character: any;
  activeEntity: CombatEntity | undefined;
  isHeroTurn: boolean;
  isBattleOver: boolean;
  biome: BiomeType;
  isNight: boolean;
  torches: { x: number; y: number }[];
  activeLargeForm: boolean;
  addCombatLog: (speaker: string, title: string, detail: string, type?: any) => void;
  setFloatingTexts: React.Dispatch<React.SetStateAction<any[]>>;
  handleActiveSearch?: (heroX: number, heroY: number) => void;
}

export function useTacticalInteractions(props: UseTacticalInteractionsProps) {
  const { handleHeroHide } = useStealthAndHiding(props);
  const {
    handleHeroDodge,
    handleHeroDisengage,
    handleHeroStandUp,
    handleHeroEscapeGrapple,
  } = useGrappleAndMovementActions(props);
  const { handleHeroSearchArea, handleHeroFirstAid } = useSkillFieldActions(props);

  return {
    handleHeroDodge,
    handleHeroHide,
    handleHeroDisengage,
    handleHeroStandUp,
    handleHeroEscapeGrapple,
    handleHeroSearchArea,
    handleHeroFirstAid,
  };
}
