import React from 'react';
import { useModalKeyboard } from '../../shared/ModalKeyboardHandler';
import { isProficientWithWeapon } from '../../../lib/mechanics/proficiencyUtils';

interface AttackChoiceModalProps {
  showAttackModal: boolean;
  setShowAttackModal: (show: boolean) => void;
  pendingAttackInfo: any;
  characterAttacks: any[];
  checkAmmunitionRequirement: (atk: any) => string | null;
  getCharacterAmmoCount: (ammoType: string) => number;
  getActiveFeats: () => string[];
  activeEntity: any;
  character?: any;
  handleSelectWeapon: (idx: number) => void;
  handleHeroAttack: (atk: any) => void;
}

export const AttackChoiceModal: React.FC<AttackChoiceModalProps> = ({
  showAttackModal,
  setShowAttackModal,
  pendingAttackInfo,
  characterAttacks,
  checkAmmunitionRequirement,
  getCharacterAmmoCount,
  getActiveFeats,
  activeEntity,
  character,
  handleSelectWeapon,
  handleHeroAttack
}) => {
  useModalKeyboard({
    onCancel: () => setShowAttackModal(false),
    onClose: () => setShowAttackModal(false),
    onConfirm: () => {
      // Tenta selecionar o primeiro ataque disponível
      const firstAvailableIdx = characterAttacks.findIndex((atk: any) => {
        const ammoReq = checkAmmunitionRequirement(atk);
        const ammoCount = ammoReq ? getCharacterAmmoCount(ammoReq) : null;
        if (ammoCount !== null && ammoCount <= 0) return false;
        const props = (atk?.properties || '').toLowerCase();
        const hasLoading = props.includes('recarga') || props.includes('loading') || props.includes('carregar');
        const activeFeatsList = getActiveFeats();
        const hasCrossbowExpert = activeFeatsList.some((f: string) => f.toLowerCase().includes('bestas') || f.toLowerCase().includes('crossbow'));
        const attackedWeapons = activeEntity?.attackedWeaponNamesThisAction || [];
        const hasAttackedWithOther = attackedWeapons.length > 0 && attackedWeapons.some((name: string) => name !== atk?.name);
        if (hasLoading && !hasCrossbowExpert && hasAttackedWithOther) return false;
        return true;
      });

      if (firstAvailableIdx >= 0) {
        const atk = characterAttacks[firstAvailableIdx];
        handleSelectWeapon(firstAvailableIdx);
        setShowAttackModal(false);
        handleHeroAttack(atk);
      } else {
        setShowAttackModal(false);
      }
    },
    disabled: !showAttackModal || !pendingAttackInfo,
  });

  if (!showAttackModal || !pendingAttackInfo) return null;


  const charContext = character || activeEntity;
  const pb = charContext?.proficiencyBonus || charContext?.proficiency_bonus || 2;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999] animate-in fade-in cursor-pointer"
      onClick={() => setShowAttackModal(false)}
    >
      <div 
        className="bg-slate-900 border border-amber-500/50 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-lg font-black text-amber-400 flex items-center gap-2">
            <span>⚔️</span> Escolher Ataque da Ficha de Personagem
          </h3>
          <button
            onClick={() => setShowAttackModal(false)}
            className="text-slate-400 hover:text-white font-bold text-xl px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Escolha qual arma ou ataque da sua ficha de personagem você deseja utilizar neste turno:
        </p>

        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {characterAttacks.map((atk: any, idx: number) => {
            const ammoReq = checkAmmunitionRequirement(atk);
            const ammoCount = ammoReq ? getCharacterAmmoCount(ammoReq) : null;
            const isOutOfAmmo = ammoCount !== null && ammoCount <= 0;
            const props = (atk?.properties || '').toLowerCase();
            const hasLoading = props.includes('recarga') || props.includes('loading') || props.includes('carregar');
            const activeFeatsList = getActiveFeats();
            const hasCrossbowExpert = activeFeatsList.some((f: string) => f.toLowerCase().includes('bestas') || f.toLowerCase().includes('crossbow'));
            const hero = activeEntity;
            const attackedWeapons = hero?.attackedWeaponNamesThisAction || [];
            const hasAttackedWithOther = attackedWeapons.length > 0 && attackedWeapons.some((name: string) => name !== atk?.name);
            const isLoadingDisabled = hasLoading && !hasCrossbowExpert && hasAttackedWithOther;

            const isProficient = isProficientWithWeapon(charContext, atk.name);
            const rawBonus = atk.bonus || atk.attackBonus || 0;
            const effectiveBonus = isProficient ? rawBonus : Math.max(0, rawBonus - pb);

            return (
              <button
                key={idx}
                onClick={() => {
                  handleSelectWeapon(idx);
                  setShowAttackModal(false);
                  handleHeroAttack(atk);
                }}
                disabled={isOutOfAmmo || isLoadingDisabled}
                className={`w-full p-3.5 rounded-xl border text-left transition flex items-center justify-between gap-3 ${
                  isOutOfAmmo || isLoadingDisabled
                    ? 'border-slate-800 bg-slate-950/40 opacity-40 cursor-not-allowed text-slate-500'
                    : !isProficient
                    ? 'border-rose-800/80 bg-rose-950/20 hover:bg-rose-900/30 hover:border-rose-500/80 text-slate-200 cursor-pointer'
                    : 'border-slate-800 bg-slate-950 hover:bg-slate-800 hover:border-amber-500/50 text-slate-200 cursor-pointer'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-slate-100 flex items-center gap-2 flex-wrap">
                    <span>⚔️</span> {atk.name || `Ataque #${idx + 1}`}
                    {!isProficient && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        ⚠️ Sem Proficiência
                      </span>
                    )}
                    {ammoCount !== null && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        ammoCount > 0 ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {ammoCount > 0 ? `Munição: ${ammoCount}` : 'Sem Munição'}
                      </span>
                    )}
                    {isLoadingDisabled && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        Recarga Bloqueada
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Alcance: <span className="text-amber-300 font-semibold">{atk.range || 'Corpo a Corpo'}</span> | Bônus: <span className={`font-semibold ${isProficient ? 'text-amber-300' : 'text-rose-400'}`}>+{effectiveBonus}{!isProficient ? ' (Sem +PB)' : ''}</span> | Dano: <span className="text-amber-300 font-semibold">{atk.damage || '1d8'}</span> ({atk.damageType || 'Cortante'})
                  </div>
                  {!isProficient && (
                    <div className="text-[10px] text-rose-300/90 mt-1 italic font-mono">
                      (-PB +{pb} não aplicado no acerto • Recursos de Maestria Bloqueados)
                    </div>
                  )}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded border shrink-0 ${
                  !isProficient
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  Selecionar
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setShowAttackModal(false)}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
