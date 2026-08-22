import { Resource } from '../../../types';
import { DRACONIC_ANCESTRIES, GIANT_ANCESTRIES } from '../../../lib/api/references';

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

    const searchTarget = (giantAncestryName || ancestryName || '').toLowerCase();
    const giant = GIANT_ANCESTRIES.find(g => 
      g.name.toLowerCase() === searchTarget ||
      g.giantType.toLowerCase() === searchTarget ||
      searchTarget.includes(g.name.toLowerCase()) ||
      searchTarget.includes(g.giantType.toLowerCase())
    ) || GIANT_ANCESTRIES.find(g => g.name === 'Gigante da Pedra');

    if (giant) {
      resources.push({
        name: giant.benefitName,
        max: pb,
        reset: 'long',
        action: giant.actionType || (giant.benefitName.includes('Resistência') || giant.benefitName.includes('Trovão') ? 'Reação' : giant.benefitName.includes('Salto') ? 'Ação Bônus' : 'No Acerto'),
        description: giant.description
      });
    }

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
