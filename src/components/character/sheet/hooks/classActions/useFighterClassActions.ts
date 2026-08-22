import { updateCharacter } from '../../../../../lib/api/characterService';
import { getMod } from '../../../../../lib/mechanics/hpCalculator';

interface UseFighterClassActionsProps {
  character: any;
  effectiveLevel: number;
  pb: number;
  currentHp: number;
  setCurrentHp: (hp: number) => void;
  setSaveMessage: (msg: string | null) => void;
  onCharacterUpdated?: () => void;
  classResources: any[];
}

export const useFighterClassActions = ({
  character,
  effectiveLevel,
  pb,
  currentHp,
  setCurrentHp,
  setSaveMessage,
  onCharacterUpdated,
  classResources,
}: UseFighterClassActionsProps) => {
  // Segundo Fôlego / Recuperar Fôlego
  const handleUseSecondWind = async () => {
    const res = classResources.find((r: any) => {
      const name = (r?.name || '').toLowerCase();
      return name.includes('segundo fôlego') || name.includes('recuperar fôlego') || name.includes('retomar o fôlego') || name.includes('second wind');
    });
    if (!res || (res.used || 0) >= res.max) {
      alert('Você não tem mais usos de Recuperar Fôlego disponíveis!');
      return;
    }

    const maxHp = character.max_hp || 10;
    if (currentHp >= maxHp) {
      alert('Seus pontos de vida já estão em 100%! Não é possível usar o Recuperar Fôlego com a vida cheia.');
      return;
    }

    const roll = Math.floor(Math.random() * 10) + 1;
    const lvl = effectiveLevel;
    const totalHealed = roll + lvl;
    const newHp = Math.min(maxHp, currentHp + totalHealed);
    const actualHeal = newHp - currentHp;

    const updatedResources = classResources.map((r: any) => {
      const name = (r?.name || '').toLowerCase();
      if (name.includes('segundo fôlego') || name.includes('recuperar fôlego') || name.includes('retomar o fôlego') || name.includes('second wind')) {
        return { ...r, used: (r.used || 0) + 1 };
      }
      return r;
    });

    character.current_hp = newHp;
    character.class_resources = updatedResources;
    setCurrentHp(newHp);

    if (character.id) {
      await updateCharacter(character.id, {
        current_hp: newHp,
        class_resources: updatedResources,
      });
      if (onCharacterUpdated) onCharacterUpdated();
    }

    setSaveMessage(`🌬️ [RECUPERAR FÔLEGO]: Curou ${actualHeal} PV (1d10 [${roll}] + Nível [${lvl}])!`);
    setTimeout(() => setSaveMessage(null), 6000);
  };

  // Surto de Ação
  const handleUseActionSurge = async () => {
    alert('⚡ [SURTO DE AÇÃO]: Esta habilidade só pode ser ativada durante um combate na arena!');
  };

  // Indomável
  const handleUseIndomitable = async () => {
    const res = classResources.find((r: any) => r.name.toLowerCase().includes('indomável'));
    if (!res || (res.used || 0) >= res.max) {
      alert('Você não tem mais usos de Indomável disponíveis!');
      return;
    }

    const lvl = effectiveLevel;
    const updatedResources = classResources.map((r: any) => {
      if (r.name.toLowerCase().includes('indomável')) {
        return { ...r, used: (r.used || 0) + 1 };
      }
      return r;
    });
    character.class_resources = updatedResources;

    if (character.id) {
      await updateCharacter(character.id, {
        class_resources: updatedResources,
      });
      if (onCharacterUpdated) onCharacterUpdated();
    }

    setSaveMessage(`🛡️ [INDOMÁVEL]: Rorrole a Salvaguarda que falhou com um bônus adicional de +${lvl} no novo teste!`);
    setTimeout(() => setSaveMessage(null), 6000);
  };

  // Intercepção
  const handleUseInterception = () => {
    const roll = Math.floor(Math.random() * 10) + 1;
    const totalReduced = roll + pb;
    setSaveMessage(
      `🛡️ [INTERCEPÇÃO]: Reação ativada! Reduziu o dano sofrido pelo aliado próximo em ${totalReduced} (1d10 [${roll}] + PB [+${pb}]).`
    );
    setTimeout(() => setSaveMessage(null), 6000);
  };

  // Proteção
  const handleUseProtection = () => {
    setSaveMessage(
      '🛡️ [PROTEÇÃO]: Reação ativada! O ataque do inimigo contra seu aliado adjacente foi feito com DESVANTAGEM.'
    );
    setTimeout(() => setSaveMessage(null), 5000);
  };

  // Luta Desarmada
  const handleUseUnarmedGrappleDamage = () => {
    const roll = Math.floor(Math.random() * 4) + 1;
    setSaveMessage(
      `👊 [LUTA DESARMADA]: Início de turno! Causou automaticamente ${roll} de dano contundente (1d4) à criatura agarrada por você.`
    );
    setTimeout(() => setSaveMessage(null), 5000);
  };

  // Manobra de Mestre de Batalha
  const handleUseManeuver = async (maneuverName: string) => {
    const res = classResources.find(
      (r: any) => r.name.toLowerCase().includes('superioridade') || r.name.toLowerCase().includes('manobra')
    );
    if (!res || (res.used || 0) >= res.max) {
      alert('Você não possui mais Dados de Superioridade disponíveis!');
      return;
    }

    const dieSize = effectiveLevel >= 18 ? 12 : effectiveLevel >= 10 ? 10 : 8;
    const roll = Math.floor(Math.random() * dieSize) + 1;

    const updatedResources = classResources.map((r: any) => {
      if (r.name.toLowerCase().includes('superioridade') || r.name.toLowerCase().includes('manobra')) {
        return { ...r, used: (r.used || 0) + 1 };
      }
      return r;
    });
    character.class_resources = updatedResources;

    if (character.id) {
      await updateCharacter(character.id, {
        class_resources: updatedResources,
      });
      if (onCharacterUpdated) onCharacterUpdated();
    }

    setSaveMessage(
      `⚔️ [MANOBRA: ${maneuverName.toUpperCase()}]: Dado de Superioridade rolado: d${dieSize} [${roll}] adicionado ao efeito!`
    );
    setTimeout(() => setSaveMessage(null), 6000);
  };

  // Poder Psiônico (Guerreiro Psíquico)
  const handleUsePsiPower = async (powerName: string) => {
    const res = classResources.find(
      (r: any) => r.name.toLowerCase().includes('energia psiônica') || r.name.toLowerCase().includes('psionic')
    );
    if (!res || (res.used || 0) >= res.max) {
      alert('Você não possui mais Dados de Energia Psiônica disponíveis!');
      return;
    }

    const dieSize = effectiveLevel >= 17 ? 12 : effectiveLevel >= 11 ? 10 : effectiveLevel >= 5 ? 8 : 6;
    const roll = Math.floor(Math.random() * dieSize) + 1;
    const intMod = getMod(character.intelligence || 10);

    const updatedResources = classResources.map((r: any) => {
      if (r.name.toLowerCase().includes('energia psiônica') || r.name.toLowerCase().includes('psionic')) {
        return { ...r, used: (r.used || 0) + 1 };
      }
      return r;
    });
    character.class_resources = updatedResources;

    if (character.id) {
      await updateCharacter(character.id, {
        class_resources: updatedResources,
      });
      if (onCharacterUpdated) onCharacterUpdated();
    }

    setSaveMessage(
      `🧠 [PODER PSIÔNICO: ${powerName.toUpperCase()}]: Dado de Energia Psiônica gasto: d${dieSize} [${roll}] + INT [+${intMod}] = ${
        roll + intMod
      }!`
    );
    setTimeout(() => setSaveMessage(null), 6000);
  };

  return {
    handleUseSecondWind,
    handleUseActionSurge,
    handleUseIndomitable,
    handleUseInterception,
    handleUseProtection,
    handleUseUnarmedGrappleDamage,
    handleUseManeuver,
    handleUsePsiPower,
  };
};
