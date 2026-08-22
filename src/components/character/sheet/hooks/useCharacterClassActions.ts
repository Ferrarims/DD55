import { useMergedClassResources } from './classActions/useMergedClassResources';
import { useRestActions } from './classActions/useRestActions';
import { useFighterClassActions } from './classActions/useFighterClassActions';

export const useCharacterClassActions = (
  character: any,
  currentHp: number,
  setCurrentHp: (hp: number) => void,
  setCurrentExhaustion: (ex: number) => void,
  setSaveMessage: (msg: string | null) => void,
  onCharacterUpdated?: () => void,
  selectedSubclass?: string
) => {
  const effectiveLevel = character.level || 1;
  const pb = 2 + Math.floor((effectiveLevel - 1) / 4);

  // 1. Obter recursos calculados da classe e raça
  const classResources = useMergedClassResources(character, effectiveLevel, selectedSubclass);

  // 2. Ações de descanso curto e longo
  const { handleShortRest, handleLongRest } = useRestActions({
    character,
    effectiveLevel,
    currentHp,
    setCurrentHp,
    setCurrentExhaustion,
    setSaveMessage,
    onCharacterUpdated,
    selectedSubclass,
    classResources,
  });

  // 3. Ações específicas do guerreiro e estilos de luta
  const fighterActions = useFighterClassActions({
    character,
    effectiveLevel,
    pb,
    currentHp,
    setCurrentHp,
    setSaveMessage,
    onCharacterUpdated,
    classResources,
  });

  return {
    classResources,
    handleShortRest,
    handleLongRest,
    ...fighterActions,
  };
};
