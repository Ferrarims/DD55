import React from 'react';
import { SubclassModal } from './SubclassModal';
import { ShortRestModal } from './ShortRestModal';
import { BestiaryModal } from '../../BestiaryModal';
import { EditFeatsModal } from './EditFeatsModal';
import { DeleteCharacterModal } from './DeleteCharacterModal';
import { HpAuditModal } from './HpAuditModal';
import { getCharacterActiveFeats } from '../utils/characterSheetCalculations';

export interface SheetRestAndSubclassModalsProps {
  character: any;
  onCharacterUpdated?: () => void;
  onDelete?: (id: string) => void;
  showSubclassModal: boolean;
  setShowSubclassModal: (val: boolean) => void;
  selectedSubclass: string;
  handleSelectSubclass: (key: string) => void;
  showShortRestModal: boolean;
  setShowShortRestModal: (val: boolean) => void;
  hitDiceToSpend: number;
  setHitDiceToSpend: (val: number) => void;
  currentHp: number;
  handleShortRest: () => void;
  showBestiary: boolean;
  setShowBestiary: (val: boolean) => void;
  showEditFeatsModal: boolean;
  setShowEditFeatsModal: (val: boolean) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (val: boolean) => void;
  showHpAudit: boolean;
  setShowHpAudit: (val: boolean) => void;
  hpBreakdown: any;
}

export const SheetRestAndSubclassModals: React.FC<SheetRestAndSubclassModalsProps> = ({
  character,
  onCharacterUpdated,
  onDelete,
  showSubclassModal,
  setShowSubclassModal,
  selectedSubclass,
  handleSelectSubclass,
  showShortRestModal,
  setShowShortRestModal,
  hitDiceToSpend,
  setHitDiceToSpend,
  currentHp,
  handleShortRest,
  showBestiary,
  setShowBestiary,
  showEditFeatsModal,
  setShowEditFeatsModal,
  showDeleteConfirm,
  setShowDeleteConfirm,
  showHpAudit,
  setShowHpAudit,
  hpBreakdown,
}) => {
  return (
    <>
      <SubclassModal
        showSubclassModal={showSubclassModal}
        setShowSubclassModal={setShowSubclassModal}
        selectedSubclass={selectedSubclass}
        handleSelectSubclass={handleSelectSubclass}
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

      {showHpAudit && (
        <HpAuditModal
          showHpAudit={showHpAudit}
          setShowHpAudit={setShowHpAudit}
          hpBreakdown={hpBreakdown}
          character={character}
          currentHp={currentHp}
        />
      )}
    </>
  );
};
