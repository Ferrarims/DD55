import React from 'react';
import { CellData } from '../../../game/types';
import { UseGoliathInteractionsProps, useGoliathInteractions } from './arenaInteractions/useGoliathInteractions';
import { UseAasimarAndDragonInteractionsProps, useAasimarAndDragonInteractions } from './arenaInteractions/useAasimarAndDragonInteractions';
import { UseTacticalInteractionsProps, useTacticalInteractions } from './arenaInteractions/useTacticalInteractions';
import { UseShortRestInteractionProps, useShortRestInteraction } from './arenaInteractions/useShortRestInteraction';
import { UseClassFeaturesInteractionProps, useClassFeaturesInteraction } from './arenaInteractions/useClassFeaturesInteraction';

export type UseArenaInteractionsProps = UseGoliathInteractionsProps &
  UseAasimarAndDragonInteractionsProps &
  UseTacticalInteractionsProps &
  UseShortRestInteractionProps &
  UseClassFeaturesInteractionProps & {
    setGrid?: React.Dispatch<React.SetStateAction<CellData[][]>>;
    activeEntityIndex?: number;
    setIsBattleOver?: (val: boolean) => void;
    spellSlots?: number;
    channelDivinityUses?: number;
    focusPointsUses?: number;
    victoryLogged?: React.MutableRefObject<boolean>;
    prevHadVisibleMonstersRef?: React.MutableRefObject<boolean>;
  };

/**
 * Hook orquestrador de interações e ações táticas da arena.
 * Delega responsabilidades para sub-hooks especialistas:
 * - useGoliathInteractions (Golias: acerto, reação a dano, forma grande)
 * - useAasimarAndDragonInteractions (Aasimar: revelações, Draconato: voo)
 * - useTacticalInteractions (ações táticas universais de combate)
 * - useShortRestInteraction (descanso curto e acampamentos)
 * - useClassFeaturesInteraction (recuperar fôlego, surto de ação, fúria)
 */
export function useArenaInteractions(props: UseArenaInteractionsProps) {
  const goliathHandlers = useGoliathInteractions(props);
  const aasimarAndDragonHandlers = useAasimarAndDragonInteractions(props);
  const tacticalHandlers = useTacticalInteractions(props);
  const shortRestHandlers = useShortRestInteraction(props);
  const classFeatureHandlers = useClassFeaturesInteraction(props);

  return {
    ...goliathHandlers,
    ...aasimarAndDragonHandlers,
    ...tacticalHandlers,
    ...shortRestHandlers,
    ...classFeatureHandlers,
  };
}