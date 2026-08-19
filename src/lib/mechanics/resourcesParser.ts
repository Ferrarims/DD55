import { Resource } from '../../types';
import { CLASS_REFERENCE } from '../../lib/api/references';
import { DRACONIC_ANCESTRIES } from '../../lib/api/references';
import { GIANT_ANCESTRIES } from '../../lib/api/references';

const CLASS_NAME_MAP: Record<string, string> = {
  'Bárbaro': 'Barbarian', 'Barbarian': 'Barbarian',
  'Bardo': 'Bard', 'Bard': 'Bard',
  'Clérigo': 'Cleric', 'Cleric': 'Cleric',
  'Druida': 'Druid', 'Druid': 'Druid',
  'Guerreiro': 'Fighter', 'Fighter': 'Fighter',
  'Monge': 'Monk', 'Monk': 'Monk',
  'Paladino': 'Paladin', 'Paladin': 'Paladin',
  'Patrulheiro': 'Ranger', 'Ranger': 'Ranger',
  'Ladino': 'Rogue', 'Rogue': 'Rogue',
  'Feiticeiro': 'Sorcerer', 'Sorcerer': 'Sorcerer',
  'Bruxo': 'Warlock', 'Warlock': 'Warlock',
  'Mago': 'Wizard', 'Wizard': 'Wizard'
};

export const calculateRaceResources = (race: string, level: number, ancestryName?: string, giantAncestryName?: string): Resource[] => {
  const resources: Resource[] = [];
  if (!race) return resources;
  
  const raceLower = race.toLowerCase();

  if (raceLower.includes('aasimar')) {
    resources.push({
      name: 'Revelação Celestial',
      max: 1,
      reset: 'long',
      action: 'Ação Bônus',
      description: 'Ativa Alma Radiante, Consumo Radiante ou Mortalha Necrótica até o fim do combate.'
    });
    resources.push({
      name: 'Mãos Curativas',
      max: 1,
      reset: 'long',
      action: 'Ação',
      description: `Cura ${Math.floor(((level || 1) - 1) / 4) + 2}d4 PV de uma criatura que você tocar.`
    });
  }

  if (raceLower.includes('meio-orc') || raceLower.includes('meio orc')) {
    resources.push({
      name: 'Resistência Implacável',
      max: 1,
      reset: 'long',
      action: 'Nenhuma',
      description: 'Quando você cai a 0 PV mas não é morto instantaneamente, pode cair a 1 PV.'
    });
  }
  
  if (raceLower.includes('dragonborn') || raceLower.includes('draconato')) {
    const ancestry = DRACONIC_ANCESTRIES.find(a => a.name === ancestryName);
    const pb = 2 + Math.floor((level - 1) / 4);
    resources.push({
      name: `Sopro (${ancestryName || 'Elemento Dracônico'})`,
      max: pb,
      reset: 'long',
      action: 'Ataque',
      description: ancestry 
        ? `Exala uma energia de ${ancestry.damageType} em um cone de 4,5m (15ft) ou uma linha de 9m (30ft). CD 8 + Mod. Con + PB. Dano: 1d10 (aumenta em níveis 5, 11 e 17). Substitui um ataque da Ação de Ataque.`
        : 'Exala energia destrutiva baseada em sua ancestralidade.'
    });

    if (level >= 5) {
      resources.push({
        name: 'Voo Dracônico',
        max: 1,
        reset: 'long',
        action: 'Ação Bônus',
        description: `Brota asas espectrais da cor do seu Sopro (${ancestry?.damageType || 'Energia'}). Consome Ação Bônus e concede 1 uso de 100 turnos (10 minutos) com Deslocamento de Voo por Descanso Longo.`
      });
    }
  }
  
  if (raceLower.includes('goliath') || raceLower.includes('golias')) {
    const pb = 2 + Math.floor((level - 1) / 4);

    // 1. Apenas a habilidade da Ancestralidade Gigante escolhida
    const searchTarget = (giantAncestryName || ancestryName || '').toLowerCase();
    const giant = GIANT_ANCESTRIES.find(g => 
      g.name.toLowerCase() === searchTarget ||
      g.giantType.toLowerCase() === searchTarget ||
      searchTarget.includes(g.name.toLowerCase()) ||
      searchTarget.includes(g.giantType.toLowerCase())
    ) || GIANT_ANCESTRIES.find(g => g.name === 'Gigante da Pedra'); // Fallback padrão

    if (giant) {
      resources.push({
        name: giant.benefitName,
        max: pb,
        reset: 'long',
        action: giant.actionType || (giant.benefitName.includes('Resistência') || giant.benefitName.includes('Trovão') ? 'Reação' : giant.benefitName.includes('Salto') ? 'Ação Bônus' : 'No Acerto'),
        description: giant.description
      });
    }

    // 2. Forma Grande (Ação Bônus) para todos os Golias no nível 5+
    if (level >= 5) {
      resources.push({
        name: 'Forma Grande',
        max: 1,
        reset: 'long',
        action: 'Ação Bônus',
        description: 'Como Ação Bônus, você altera seu tamanho para Grande por 10 minutos ou até encerrar. Concede Vantagem em testes de Força e seu deslocamento aumenta em +3m (+10 pés). 1 uso por Descanso Longo.'
      });
    }
  }

  if (raceLower.includes('orc')) {
    const pb = 2 + Math.floor((level - 1) / 4);
    resources.push({
      name: 'Pico de Adrenalina',
      max: pb,
      reset: 'short',
      action: 'Ação Bônus',
      description: 'Permite realizar a ação Disparada (Dash) como Ação Bônus e concede PV temporários iguais ao seu Bônus de Proficiência.'
    });
    resources.push({
      name: 'Resistência Implacável',
      max: 1,
      reset: 'long',
      action: 'Automática',
      description: 'Quando você é reduzido a 0 PV mas não é morto instantaneamente, pode cair a 1 PV.'
    });
  }

  if (raceLower.includes('fada') || raceLower.includes('fairy')) {
    resources.push({
      name: 'Fogo das Fadas',
      max: 1,
      reset: 'long',
      action: 'Ação',
      description: 'Pode lançar a magia Fogo das Fadas (se nível 3+).'
    });
    resources.push({
      name: 'Aumentar/Reduzir',
      max: 1,
      reset: 'long',
      action: 'Ação',
      description: 'Pode lançar a magia Aumentar/Reduzir (se nível 5+).'
    });
  }

  if (raceLower.includes('tiefling')) {
    resources.push({
      name: 'Repreensão Infernal',
      max: 1,
      reset: 'long',
      action: 'Reação',
      description: 'Lança Repreensão Infernal como magia de 2º círculo (Nível 3+).'
    });
    resources.push({
      name: 'Escuridão',
      max: 1,
      reset: 'long',
      action: 'Ação',
      description: 'Lança a magia Escuridão (Nível 5+).'
    });
  }

  return resources;
};

export const calculateResources = (
  charClass: string,
  level: number,
  stats: { str: number; dex: number; con: number; int: number; wis: number; cha: number },
  subclass?: string,
  feats?: string[],
  fightingStyle?: string
): Resource[] => {
  const resources: Resource[] = [];
  const classKey = CLASS_NAME_MAP[charClass] || charClass;
  const classData = CLASS_REFERENCE[classKey as keyof typeof CLASS_REFERENCE];
  const prog = classData?.progression[Math.min(20, Math.max(1, level)) - 1];

  // Spell Slots
  const spellSlots = (prog as any)?.spellSlots;
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
        name: `Espaços de Pacto (${(prog as any).slotLevel || 1}º Círculo)`,
        max: spellSlots,
        reset: 'short'
      });
    }
  }

  // Class Specific Resources
  if (classKey === 'Barbarian') {
    const rages = (prog as any)?.rages || (level >= 17 ? 6 : level >= 12 ? 5 : level >= 6 ? 4 : level >= 3 ? 3 : 2);
    resources.push({
      name: 'Fúria',
      max: rages,
      reset: 'long',
      action: 'Ação Bônus',
      description: 'Entra em Fúria: causa +2 de dano em ataques de Força e reduz o dano físico recebido pela metade.'
    });
  } else if (classKey === 'Bard') {
    const chaMod = Math.max(1, Math.floor(((stats?.cha || 10) - 10) / 2));
    resources.push({
      name: 'Inspiração de Bardo',
      max: chaMod,
      reset: 'long',
      action: 'Ação Bônus',
      description: 'Concede um Dado de Inspiração de Bardo a um aliado a até 18m para adicionar a um teste ou ataque.'
    });
  } else if (classKey === 'Fighter') {
    const secondWind = (prog as any)?.secondWind || (level >= 10 ? 4 : level >= 4 ? 3 : 2);
    resources.push({
      name: 'Retomar o Fôlego',
      max: secondWind,
      reset: 'short',
      action: 'Ação Bônus',
      description: 'Recupera 1d10 + Nível de PV como Ação Bônus.'
    });
    if (level >= 2) {
      const surgeCount = level >= 17 ? 2 : 1;
      resources.push({
        name: 'Surto de Ação',
        max: surgeCount,
        reset: 'short',
        action: 'Sem Ação',
        description: 'Ganha 1 Ação Principal extra imediatamente no seu turno.'
      });
    }
    if (level >= 9) {
      const indomitable = level >= 17 ? 3 : level >= 13 ? 2 : 1;
      resources.push({
        name: 'Indomável',
        max: indomitable,
        reset: 'long',
        action: 'Reação',
        description: 'Permite re-rolar um Teste de Resistência que tenha falhado somando o Nível de Guerreiro.'
      });
    }

    // Recursos de Subclasse do Guerreiro
    const subLower = (subclass || '').toLowerCase();
    if (level >= 3) {
      if (subLower.includes('battle') || subLower.includes('mestre da batalha') || subLower.includes('battlemaster')) {
        const dieType = level >= 18 ? '1d12' : level >= 10 ? '1d10' : '1d8';
        const diceCount = level >= 15 ? 6 : level >= 7 ? 5 : 4;
        resources.push({
          name: `Dados de Superioridade (${dieType})`,
          max: diceCount,
          reset: 'short',
          action: 'Manobra',
          description: `Gaste para executar Manobras Táticas de Mestre da Batalha (Aparar, Ataque Ameaçador, Prostrar, etc.).`
        });
      } else if (subLower.includes('psi') || subLower.includes('psíquico') || subLower.includes('psiquico')) {
        const dieType = level >= 17 ? '1d12' : level >= 11 ? '1d10' : level >= 5 ? '1d8' : '1d6';
        const diceCount = level >= 17 ? 12 : level >= 13 ? 10 : level >= 9 ? 8 : level >= 5 ? 6 : 4;
        resources.push({
          name: `Dados Psiônicos (${dieType})`,
          max: diceCount,
          reset: 'long',
          action: 'Poder Psiônico',
          description: `Gaste para Golpe Psiônico (+${dieType}+INT dano), Movimento Telecinético ou Vínculo Protetivo.`
        });
      } else if (subLower.includes('eldritch') || subLower.includes('cavaleiro místico') || subLower.includes('místico') || subLower.includes('mistico')) {
        resources.push({
          name: 'Vínculo com Arma',
          max: 2,
          reset: 'turn',
          action: 'Ação Bônus',
          description: 'Invoca a arma vinculada diretamente para sua mão.'
        });
      } else if (subLower.includes('champion') || subLower.includes('campeão') || subLower.includes('campeao')) {
        if (level >= 10) {
          resources.push({
            name: 'Inspiração Heroica',
            max: 1,
            reset: 'turn',
            action: 'Automática',
            description: 'Concede Inspiração Heroica no início do turno se não a possuir.'
          });
        }
      }
    }
  } else if (classKey === 'Rogue') {
    if (level >= 2) {
      resources.push({
        name: 'Ação Astuta',
        max: 99,
        reset: 'turn',
        action: 'Ação Bônus',
        description: 'Permite usar Disparar, Desengajar ou Esconder-se usando uma Ação Bônus.'
      });
    }
  } else if (classKey === 'Paladin') {
    resources.push({
      name: 'Imposição de Mãos (HP)',
      max: level * 5,
      reset: 'long',
      action: 'Ação Magia',
      description: 'Reservatório de cura mágica ao tocar uma criatura.'
    });
    if (level >= 3) {
      const channelDiv = (prog as any)?.channelDivinity || (level >= 11 ? 3 : 2);
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
      const channelDiv = (prog as any)?.channelDivinity || (level >= 18 ? 4 : level >= 6 ? 3 : 2);
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
      const wildShape = (prog as any)?.wildShape || (level >= 17 ? 4 : level >= 6 ? 3 : 2);
      resources.push({
        name: 'Forma Selvagem',
        max: wildShape,
        reset: 'short',
        action: 'Ação Bônus',
        description: 'Assume a Forma Bestial de combate recebendo PV temporários e bônus.'
      });
    }
  } else if (classKey === 'Monk') {
    if (level >= 2) {
      resources.push({
        name: 'Pontos de Foco (Ki)',
        max: level,
        reset: 'short',
        action: 'Várias',
        description: 'Alimenta Passo do Vento, Defesa Paciente e Golpe de Rajada.'
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

  // Estilos de Luta com Ações/Reações ativas
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

  return resources;
};

