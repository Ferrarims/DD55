import { Resource } from '../../../../types';

export function appendCasterAndFeatResources({
  classKey,
  level,
  stats,
  prog,
  resources,
  feats,
  fightingStyle,
}: {
  classKey: string;
  level: number;
  stats: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  prog: any;
  resources: Resource[];
  feats?: string[];
  fightingStyle?: string;
}): void {
  // Spell Slots
  const spellSlots = prog?.spellSlots;
  if (spellSlots) {
    if (Array.isArray(spellSlots)) {
      spellSlots.forEach((slots: number, idx: number) => {
        if (slots > 0) {
          resources.push({
            name: `Espaços de Magia (${idx + 1}º Círculo)`,
            max: slots,
            reset: 'long'
          });
        }
      });
    } else if (typeof spellSlots === 'number' && spellSlots > 0) {
      resources.push({
        name: `Espaços de Pacto (${prog.slotLevel || 1}º Círculo)`,
        max: spellSlots,
        reset: 'short'
      });
    }
  }

  if (classKey === 'Bard') {
    const chaMod = Math.max(1, Math.floor(((stats?.cha || 10) - 10) / 2));
    resources.push({
      name: 'Inspiração de Bardo',
      max: chaMod,
      reset: 'long',
      action: 'Ação Bônus',
      description: 'Concede um Dado de Inspiração de Bardo a um aliado a até 18m para adicionar a um teste ou ataque.'
    });
  } else if (classKey === 'Paladin') {
    resources.push({
      name: 'Imposição de Mãos (HP)',
      max: level * 5,
      reset: 'long',
      action: 'Ação Magia',
      description: 'Reservatório de cura mágica ao tocar uma criatura.'
    });
    if (level >= 3) {
      const channelDiv = prog?.channelDivinity || (level >= 11 ? 3 : 2);
      resources.push({
        name: 'Canalizar Divindade',
        max: channelDiv,
        reset: 'short',
        action: 'Ação Magia',
        description: 'Malignidade Sagrada, Cura Radiante ou Expulsar os Profanos.'
      });
    }
  } else if (classKey === 'Cleric') {
    if (level >= 2) {
      const channelDiv = prog?.channelDivinity || (level >= 18 ? 4 : level >= 6 ? 3 : 2);
      resources.push({
        name: 'Canalizar Divindade',
        max: channelDiv,
        reset: 'short',
        action: 'Ação Magia',
        description: 'Expulsar Mortos-Vivos ou Invocação de Poder Divino.'
      });
    }
  } else if (classKey === 'Druid') {
    if (level >= 2) {
      const wildShape = prog?.wildShape || (level >= 17 ? 4 : level >= 6 ? 3 : 2);
      resources.push({
        name: 'Forma Selvagem',
        max: wildShape,
        reset: 'short',
        action: 'Ação Bônus',
        description: 'Assume a Forma Bestial de combate recebendo PV temporários e bônus.'
      });
    }
  } else if (classKey === 'Sorcerer') {
    if (level >= 2) {
      resources.push({
        name: 'Pontos de Feitiçaria',
        max: level,
        reset: 'long',
        action: 'Ação Bônus',
        description: 'Alimenta Metamagia e conversão de espaços de magia.'
      });
    }
  }

  const activeFeats = feats || [];
  const style = fightingStyle || '';

  if (activeFeats.includes('Interceptação') || style === 'Interceptação') {
    resources.push({
      name: 'Interceptação (Reação)',
      max: 1,
      reset: 'turn',
      action: 'Reação',
      description: 'Permite usar sua Reação (empunhando arma/escudo) para reduzir em 1d10 + Proficiência o dano sofrido por aliado a até 1,5m. [ALERTA: Ativado ao aliado sofrer dano].'
    });
  }

  if (activeFeats.includes('Protetivo') || style === 'Protetivo') {
    resources.push({
      name: 'Protetivo (Reação)',
      max: 1,
      reset: 'turn',
      action: 'Reação',
      description: 'Permite usar sua Reação (empunhando escudo) para impor Desvantagem no ataque de um inimigo contra um aliado a até 1,5m. [ALERTA: Ativado com aliado próximo].'
    });
  }

  if (activeFeats.includes('Combate Desarmado') || style === 'Combate Desarmado') {
    resources.push({
      name: 'Combate Desarmado (Dano Agarrado)',
      max: 1,
      reset: 'turn',
      action: 'Sem Ação',
      description: 'Causa 1d4 de dano contundente automático uma vez por turno a uma criatura agarrada por você.'
    });
  }
}
