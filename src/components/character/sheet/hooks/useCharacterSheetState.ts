import { useState } from 'react';

export const useCharacterSheetState = (character: any) => {
  const [currentHp, setCurrentHp] = useState<number>(character.current_hp ?? character.max_hp ?? 10);
  const [currentExhaustion, setCurrentExhaustion] = useState<number>(character.exhaustion_level ?? 0);
  const [hpAuditLog, setHpAuditLog] = useState<{ date: string; delta: number; current: number }[]>([]);
  const [showHpAudit, setShowHpAudit] = useState(false);
  const [showShortRestModal, setShowShortRestModal] = useState(false);
  const [hitDiceToSpend, setHitDiceToSpend] = useState(1);
  const [tempHp, setTempHp] = useState<number>(character.temp_hp ?? 0);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditFeatsModal, setShowEditFeatsModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [showXpManager, setShowXpManager] = useState(false);
  const [customXpInput, setCustomXpInput] = useState('');
  const [showBestiary, setShowBestiary] = useState(false);
  const [showBreathShape, setShowBreathShape] = useState(false);

  return {
    currentHp, setCurrentHp,
    currentExhaustion, setCurrentExhaustion,
    hpAuditLog, setHpAuditLog,
    showHpAudit, setShowHpAudit,
    showShortRestModal, setShowShortRestModal,
    hitDiceToSpend, setHitDiceToSpend,
    tempHp, setTempHp,
    isSaving, setIsSaving,
    showDeleteConfirm, setShowDeleteConfirm,
    showEditFeatsModal, setShowEditFeatsModal,
    saveMessage, setSaveMessage,
    showXpManager, setShowXpManager,
    customXpInput, setCustomXpInput,
    showBestiary, setShowBestiary,
    showBreathShape, setShowBreathShape
  };
};
