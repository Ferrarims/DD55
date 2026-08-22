import { Resource } from '../../../../types';

export function appendMartialClassResources({
  classKey,
  level,
  subclass,
  prog,
  resources,
}: {
  classKey: string;
  level: number;
  subclass?: string;
  prog: any;
  resources: Resource[];
}): void {
  if (classKey === 'Barbarian') {
    const rages = prog?.rages || (level >= 17 ? 6 : level >= 12 ? 5 : level >= 6 ? 4 : level >= 3 ? 3 : 2);
    resources.push({
      name: 'Fúria',
      max: rages,
      reset: 'long',
      action: 'Ação Bônus',
      description: 'Entra em Fúria: causa +2 de dano em ataques de Força e reduz o dano físico recebido pela metade.'
    });
  } else if (classKey === 'Fighter') {
    const secondWind = prog?.secondWind || (level >= 10 ? 4 : level >= 4 ? 3 : 2);
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
  }
}
