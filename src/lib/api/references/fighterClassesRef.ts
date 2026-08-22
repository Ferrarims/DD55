export interface ClassFeatureDetail {
  level: number;
  name: string;
  actionType?: string;
  description?: string;
  usageLimit?: string;
  [key: string]: any;
}

export interface SubclassDetail {
  id: string;
  name: string;
  description?: string;
  features: ClassFeatureDetail[];
  maneuvers?: any[];
  [key: string]: any;
}

export const CLASS_REFERENCE: Record<string, any> = {};

export const FIGHTER_LEVEL_FEATURES: ClassFeatureDetail[] = [
  { level: 1, name: 'Estilo de Luta', actionType: 'Passiva', description: 'Especialização em combate com armas.' },
  { level: 1, name: 'Retomar Fôlego', actionType: 'Ação Bônus', description: 'Recupera 1d10 + Nível de PV. Usos recarregam em descansos.' },
  { level: 1, name: 'Maestria em Armas', actionType: 'Passiva', description: 'Desbloqueia propriedades especiais de maestria nas armas.' },
  { level: 2, name: 'Surto de Ação', actionType: 'Ação', description: 'Ganha uma ação adicional no seu turno. 1x por descanso curto/longo.' },
  { level: 2, name: 'Mente Tática', actionType: 'Reação', description: 'Gasta 1 uso de Retomar Fôlego para somar 1d10 em teste de habilidade que falhou.' },
  { level: 3, name: 'Subclasse de Guerreiro', actionType: 'Especial', description: 'Escolha de especialização marcial com características únicas.' },
  { level: 4, name: 'Aumento no Valor de Habilidade', actionType: 'Passiva', description: 'Aumente um atributo em +2, dois em +1 ou escolha um Talento.' },
  { level: 5, name: 'Ataque Adicional', actionType: 'Passiva', description: 'Você pode atacar duas vezes ao realizar a ação de Ataque.' },
  { level: 5, name: 'Mudança Tática', actionType: 'Ação Bônus', description: 'Ao usar Retomar Fôlego, pode se mover até metade do deslocamento sem provocar oportunidade.' },
  { level: 6, name: 'Aumento no Valor de Habilidade', actionType: 'Passiva', description: 'Aumento de Atributo ou Talento adicional.' },
  { level: 7, name: 'Característica de Subclasse', actionType: 'Especial', description: 'Novo poder marcial concedido pela subclasse.' },
  { level: 8, name: 'Aumento no Valor de Habilidade', actionType: 'Passiva', description: 'Aumento de Atributo ou Talento.' },
  { level: 9, name: 'Indomável', actionType: 'Reação', description: 'Rerrola uma salvaguarda que falhou com bônus igual ao nível de guerreiro.' },
  { level: 9, name: 'Mestre Tático', actionType: 'Passiva', description: 'Pode substituir propriedades de maestria de armas versáteis em combate.' },
  { level: 10, name: 'Característica de Subclasse', actionType: 'Especial', description: 'Poder avançado concedido pela subclasse.' },
  { level: 11, name: 'Dois Ataques Adicionais', actionType: 'Passiva', description: 'Você pode atacar três vezes ao realizar a ação de Ataque.' },
  { level: 12, name: 'Aumento no Valor de Habilidade', actionType: 'Passiva', description: 'Aumento de Atributo ou Talento.' },
  { level: 13, name: 'Indomável (2 Usos)', actionType: 'Passiva', description: 'Segundo uso de Indomável por descanso longo.' },
  { level: 13, name: 'Ataques Estudados', actionType: 'Passiva', description: 'Se errar um ataque, ganha Vantagem no próximo ataque contra o mesmo alvo.' },
  { level: 14, name: 'Aumento no Valor de Habilidade', actionType: 'Passiva', description: 'Aumento de Atributo ou Talento adicional.' },
  { level: 15, name: 'Característica de Subclasse', actionType: 'Especial', description: 'Habilidade de elite concedida pela subclasse.' },
  { level: 16, name: 'Aumento no Valor de Habilidade', actionType: 'Passiva', description: 'Aumento de Atributo ou Talento.' },
  { level: 17, name: 'Surto de Ação (2 Usos)', actionType: 'Passiva', description: 'Dois usos de Surto de Ação por descanso.' },
  { level: 17, name: 'Indomável (3 Usos)', actionType: 'Passiva', description: 'Três usos de Indomável por descanso longo.' },
  { level: 18, name: 'Característica de Subclasse', actionType: 'Especial', description: 'Poder supremo concedido pela subclasse.' },
  { level: 19, name: 'Dádiva Épica', actionType: 'Passiva', description: 'Escolha uma Dádiva Épica ou Aumento de Atributo.' },
  { level: 20, name: 'Três Ataques Adicionais', actionType: 'Passiva', description: 'Você pode atacar quatro vezes ao realizar a ação de Ataque.' }
];

export const FIGHTER_SUBCLASSES: Record<string, SubclassDetail> = {
  BattleMaster: {
    id: 'BattleMaster',
    name: 'Mestre da Batalha',
    description: 'Especialista em táticas militares e controle de campo com Dados de Superioridade e 20 Manobras Táticas.',
    features: [
      {
        level: 3,
        name: 'Superioridade Marcial',
        actionType: 'Especial',
        description: 'Ganha 4 Dados de Superioridade (d8) para executar Manobras Táticas. Recupera em descansos curtos ou longos.'
      },
      {
        level: 3,
        name: 'Estudioso da Guerra',
        actionType: 'Passiva',
        description: 'Ganha proficiência com um tipo de ferramenta de artesão à sua escolha.'
      },
      {
        level: 7,
        name: 'Conhecer o Inimigo',
        actionType: 'Ação Bônus',
        description: 'Avalia resistências, armadura e características vitais de uma criatura ao observá-la.'
      },
      {
        level: 10,
        name: 'Superioridade Aprimorada',
        actionType: 'Passiva',
        description: 'Seus dados de superioridade aumentam para d10.'
      },
      {
        level: 15,
        name: 'Implacável',
        actionType: 'Reação',
        description: 'Se rolar iniciativa sem nenhum dado de superioridade restante, recupera 1 dado imediatamente.'
      },
      {
        level: 18,
        name: 'Superioridade Suprema',
        actionType: 'Passiva',
        description: 'Seus dados de superioridade aumentam para d12.'
      }
    ],
    maneuvers: [
      { id: 'aparar', name: 'Aparar', actionType: 'Reação', description: 'Reduz o dano de um ataque corpo a corpo recebido em 1d8 + Mod. Destreza.' },
      { id: 'ataque-ameacador', name: 'Ataque Ameaçador', actionType: 'No Acerto', description: 'Adiciona 1d8 ao dano e o alvo deve passar em teste de Sabedoria ou fica Amedrontado até o fim do próximo turno.' },
      { id: 'ataque-de-precisao', name: 'Ataque de Precisão', actionType: 'No Ataque', description: 'Adiciona 1d8 na jogada de ataque para garantir o acerto do golpe.' },
      { id: 'ataque-de-prostracao', name: 'Ataque de Prostração', actionType: 'No Acerto', description: 'Adiciona 1d8 ao dano e derruba o alvo no chão (Caído) se falhar em teste de Força.' },
      { id: 'contra-ataque', name: 'Contra-ataque', actionType: 'Reação', description: 'Quando um inimigo erra um ataque contra você, gaste a reação para contra-atacar com +1d8 de dano.' },
      { id: 'ataque-de-desarme', name: 'Ataque de Desarme', actionType: 'No Acerto', description: 'Adiciona 1d8 ao dano e força o alvo a largar uma arma ou objeto.' },
      { id: 'ataque-de-finta', name: 'Ataque de Finta', actionType: 'Ação Bônus', description: 'Garante Vantagem no próximo ataque contra o alvo neste turno e soma +1d8 ao dano.' },
      { id: 'ataque-distrativo', name: 'Ataque Distrativo', actionType: 'No Acerto', description: 'Adiciona 1d8 ao dano e concede Vantagem no próximo ataque de um aliado contra o alvo.' },
      { id: 'ataque-de-manobra', name: 'Ataque de Manobra', actionType: 'No Acerto', description: 'Adiciona 1d8 ao dano e comanda um aliado a se mover metade do deslocamento sem provocar oportunidade.' },
      { id: 'ataque-em-arco', name: 'Ataque em Arco', actionType: 'No Acerto', description: 'Causa o dano do dado de superioridade a uma criatura adjacente ao alvo atingido.' },
      { id: 'ataque-encorajador', name: 'Ataque Encorajador', actionType: 'Ação Bônus', description: 'Concede Pontos de Vida Temporários iguais a 1d8 + Modificador de Carisma a um aliado.' },
      { id: 'esquiva-tatica', name: 'Esquiva Tática', actionType: 'No Movimento', description: 'Adiciona 1d8 à sua CA contra ataques de oportunidade durante seu movimento.' },
      { id: 'passo-tatico', name: 'Passo Tático', actionType: 'Ação Bônus', description: 'Move metade do seu deslocamento sem provocar ataques de oportunidade.' },
      { id: 'emboscada', name: 'Emboscada', actionType: 'Especial', description: 'Adiciona 1d8 ao seu teste de Iniciativa ou Furtividade.' }
    ]
  },
  Champion: {
    id: 'Champion',
    name: 'Campeão',
    description: 'Poder marcial bruto e físico impecável, focado em acertos críticos devastadores e regeneração contínua.',
    features: [
      {
        level: 3,
        name: 'Crítico Aprimorado',
        actionType: 'Passiva',
        description: 'Seus ataques com armas obtêm Acerto Crítico com uma rolagem de 19 ou 20 no d20.'
      },
      {
        level: 3,
        name: 'Atleta Notável',
        actionType: 'Passiva',
        description: 'Garante Vantagem em testes de Iniciativa e Atletismo, além de maior alcance em saltos.'
      },
      {
        level: 7,
        name: 'Estilo de Luta Adicional',
        actionType: 'Passiva',
        description: 'Você pode adotar um segundo Estilo de Luta da lista de Guerreiro.'
      },
      {
        level: 10,
        name: 'Vigor Heroico',
        actionType: 'Passiva',
        description: 'Ganha Inspiração Heroica no início do combate se ainda não tiver uma.'
      },
      {
        level: 15,
        name: 'Crítico Superior',
        actionType: 'Passiva',
        description: 'Seus ataques obtêm Acerto Crítico com 18, 19 ou 20 no d20.'
      },
      {
        level: 18,
        name: 'Sobrevivente',
        actionType: 'Passiva',
        description: 'No início do seu turno em combate com menos da metade da vida, recupera 5 + Mod. Constituição PV.'
      }
    ]
  },
  EldritchKnight: {
    id: 'EldritchKnight',
    name: 'Cavaleiro Arcano',
    description: 'Combina maestria marcial com magia arcana protetora e ofensiva de Mago, empunhando feitiços ao lado de lâminas.',
    features: [
      {
        level: 3,
        name: 'Conjuração Arcana',
        actionType: 'Especial',
        description: 'Aprende truques e magias da lista de Mago usando Inteligência para conjuração.'
      },
      {
        level: 3,
        name: 'Vínculo com Arma',
        actionType: 'Ação Bônus',
        description: 'Cria um elo mágico com até duas armas: não pode ser desarmado e pode invocá-las diretamente para a mão.'
      },
      {
        level: 7,
        name: 'Magia de Guerra',
        actionType: 'Passiva',
        description: 'Ao usar a ação de Ataque, pode substituir um dos seus ataques por um Truque de dano.'
      },
      {
        level: 10,
        name: 'Golpe Arcano',
        actionType: 'No Acerto',
        description: 'Ao acertar um inimigo com arma, ele sofre Desvantagem na próxima salvaguarda contra suas magias.'
      },
      {
        level: 15,
        name: 'Investida Arcana',
        actionType: 'No Surto de Ação',
        description: 'Ao ativar o Surto de Ação, você pode se teletransportar até 9 metros para um espaço livre.'
      },
      {
        level: 18,
        name: 'Magia de Guerra Aprimorada',
        actionType: 'Passiva',
        description: 'Ao usar a ação de Ataque, pode substituir dois ataques pela conjuração de uma magia de 1º ou 2º círculo.'
      }
    ]
  },
  PsiWarrior: {
    id: 'PsiWarrior',
    name: 'Combatente Psíquico',
    description: 'Canaliza o poder psiônico e telecinético latente da mente para golpear inimigos e proteger aliados.',
    features: [
      {
        level: 3,
        name: 'Poder Psiônico',
        actionType: 'Especial',
        description: 'Ganha Dados de Energia Psiônica para Campo Protetor (reduzir dano), Golpe Psiônico (dano extra) e Salto Telecinético.'
      },
      {
        level: 7,
        name: 'Salto & Impulso Psiônico',
        actionType: 'Ação Bônus',
        description: 'Propulsão telecinética para voar temporariamente ou derrubar/empurrar inimigos ao atingi-los.'
      },
      {
        level: 10,
        name: 'Mente Blindada',
        actionType: 'Passiva',
        description: 'Resistência a dano psíquico e pode encerrar condições de Enfeitiçado ou Amedrontado com uma ação.'
      },
      {
        level: 15,
        name: 'Baluarte de Força',
        actionType: 'Ação Bônus',
        description: 'Cria uma redoma telecinética que concede Meia Cobertura (+2 CA e Destreza) a você e aliados próximos.'
      },
      {
        level: 18,
        name: 'Mestre Telecinético',
        actionType: 'Ação',
        description: 'Pode conjurar Telecinésia livremente e desferir um ataque com arma como ação bônus.'
      }
    ]
  }
};

export const SUBCLASSES_REFERENCE: Record<string, SubclassDetail> = {};
