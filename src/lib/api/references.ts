// Consolidated references and types from deleted data/dnd5e folder

// --- backgrounds.ts ---
export interface EquipmentItemChoice {
  id?: string;
  name: string;
  quantity: number;
}

export interface BackgroundInfo {
  name: string;
  abilityScores: string[];
  feat: string;
  featId?: string;
  featSubChoice?: string;
  skillProficiencies: string[];
  toolProficiency: string;
  icon?: string;
  equipment: {
    A: EquipmentItemChoice[];
    B: EquipmentItemChoice[];
    default?: EquipmentItemChoice[];
  } | { A: string; B: string };
}

export const BACKGROUNDS_REFERENCE: Record<string, BackgroundInfo> = {
  'acolyte': {
    name: 'Acólito',
    abilityScores: ['Inteligência', 'Sabedoria'],
    feat: 'Iniciado em Magia',
    skillProficiencies: ['Intuição', 'Religião'],
    toolProficiency: 'Nenhuma',
    equipment: {
      A: [{ name: 'Símbolo Sagrado', quantity: 1 }, { name: 'Livro de Orações', quantity: 1 }],
      B: [{ name: 'Roupas Comuns', quantity: 1 }, { name: 'Bolsa com 15 PO', quantity: 1 }]
    }
  },
  'criminal': {
    name: 'Criminoso',
    abilityScores: ['Destreza', 'Carisma'],
    feat: 'Sortudo',
    skillProficiencies: ['Enganação', 'Furtividade'],
    toolProficiency: 'Ferramentas de Ladino',
    equipment: {
      A: [{ name: 'Pé-de-cabra', quantity: 1 }, { name: 'Roupas Escuras', quantity: 1 }],
      B: [{ name: 'Bolsa com 15 PO', quantity: 1 }]
    }
  },
  'soldier': {
    name: 'Soldado',
    abilityScores: ['Força', 'Constituição'],
    feat: 'Atleta',
    skillProficiencies: ['Atletismo', 'Intimidação'],
    toolProficiency: 'Jogos de Dados',
    equipment: {
      A: [{ name: 'Insígnia de Patente', quantity: 1 }, { name: 'Troféu de Guerra', quantity: 1 }],
      B: [{ name: 'Roupas de Viagem', quantity: 1 }, { name: 'Bolsa com 10 PO', quantity: 1 }]
    }
  },
  'sage': {
    name: 'Sábio',
    abilityScores: ['Inteligência', 'Sabedoria'],
    feat: 'Erudito',
    skillProficiencies: ['Arcanismo', 'História'],
    toolProficiency: 'Nenhuma',
    equipment: {
      A: [{ name: 'Frasco de Tinta', quantity: 1 }, { name: 'Pena de Escrever', quantity: 1 }],
      B: [{ name: 'Roupas de Viagem', quantity: 1 }, { name: 'Bolsa com 10 PO', quantity: 1 }]
    }
  },
  'noble': {
    name: 'Nobre',
    abilityScores: ['Carisma', 'Inteligência'],
    feat: 'Líder Inspirador',
    skillProficiencies: ['Persuasão', 'História'],
    toolProficiency: 'Jogos de Cartas',
    equipment: {
      A: [{ name: 'Roupas Finas', quantity: 1 }, { name: 'Anel de Sinete', quantity: 1 }],
      B: [{ name: 'Bolsa com 25 PO', quantity: 1 }]
    }
  }
};


// --- classes.ts ---
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
  { level: 19, name: 'Dádiva Épica', actionType: 'Passiva', description: 'Escolha uma Dádiva Épica (Epic Boon) ou Aumento de Atributo.' },
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

export const getFighterSubclass = (subclassIdentifier?: string): SubclassDetail | undefined => {
  if (!subclassIdentifier) return undefined;
  if (FIGHTER_SUBCLASSES[subclassIdentifier]) return FIGHTER_SUBCLASSES[subclassIdentifier];
  if (SUBCLASSES_REFERENCE[subclassIdentifier]) return SUBCLASSES_REFERENCE[subclassIdentifier];
  
  const normalized = subclassIdentifier.toLowerCase().trim();
  const allSubclasses = { ...FIGHTER_SUBCLASSES, ...SUBCLASSES_REFERENCE };
  
  return Object.values(allSubclasses).find(
    sub =>
      sub.id.toLowerCase() === normalized ||
      sub.name.toLowerCase() === normalized ||
      (normalized.includes('batalha') && (sub.id === 'BattleMaster' || sub.name.includes('Batalha'))) ||
      (normalized.includes('battle') && (sub.id === 'BattleMaster' || sub.name.includes('Batalha'))) ||
      (normalized.includes('campe') && (sub.id === 'Champion' || sub.name.includes('Campeão'))) ||
      (normalized.includes('champion') && (sub.id === 'Champion' || sub.name.includes('Campeão'))) ||
      (normalized.includes('arcano') && (sub.id === 'EldritchKnight' || sub.name.includes('Arcano'))) ||
      (normalized.includes('eldritch') && (sub.id === 'EldritchKnight' || sub.name.includes('Arcano'))) ||
      (normalized.includes('psi') && (sub.id === 'PsiWarrior' || sub.name.includes('Psíquico'))) ||
      (normalized.includes('psíquico') && (sub.id === 'PsiWarrior' || sub.name.includes('Psíquico'))) ||
      (normalized.includes('psiquico') && (sub.id === 'PsiWarrior' || sub.name.includes('Psíquico')))
  );
};

export const formatSubclassName = (subclassName?: string): string => {
  if (!subclassName) return '';
  const sub = getFighterSubclass(subclassName);
  if (sub) return sub.name;
  return subclassName.replace(/\s*\([^)]*\)/g, '').trim();
};

export const getFighterFeaturesForLevel = (level: number, subclassId?: string): ClassFeatureDetail[] => {
  const baseFeatures = FIGHTER_LEVEL_FEATURES.filter(f => f.level <= level);
  let subFeatures: ClassFeatureDetail[] = [];

  const sub = getFighterSubclass(subclassId);
  if (sub && Array.isArray(sub.features)) {
    subFeatures = sub.features
      .filter(f => f.level <= level)
      .map(f => ({
        level: f.level,
        name: f.name,
        actionType: f.actionType,
        description: f.description,
        usageLimit: f.usageLimit,
        subclassName: sub.name
      }));
  }

  const all = [...baseFeatures, ...subFeatures];
  all.sort((a, b) => a.level - b.level);
  return all;
};

export const getClassFeaturesGainedAtLevel = (className: string, level: number, subclassId?: string): string[] => {
  const clsLower = (className || '').toLowerCase();

  if (clsLower.includes('guerreiro') || clsLower.includes('fighter')) {
    const levelFeatures = getFighterFeaturesForLevel(level, subclassId).filter(f => f.level === level);
    if (levelFeatures.length > 0) {
      return levelFeatures.map(f => f.name);
    }
  }

  const classMapping: Record<string, string> = {
    'bárbaro': 'Barbarian', 'barbarian': 'Barbarian',
    'bardo': 'Bard', 'bard': 'Bard',
    'clérigo': 'Cleric', 'cleric': 'Cleric',
    'druida': 'Druid', 'druid': 'Druid',
    'guerreiro': 'Fighter', 'fighter': 'Fighter',
    'monge': 'Monk', 'monk': 'Monk',
    'paladino': 'Paladin', 'paladin': 'Paladin',
    'patrulheiro': 'Ranger', 'ranger': 'Ranger',
    'ladino': 'Rogue', 'rogue': 'Rogue',
    'feiticeiro': 'Sorcerer', 'sorcerer': 'Sorcerer',
    'bruxo': 'Warlock', 'warlock': 'Warlock',
    'mago': 'Wizard', 'wizard': 'Wizard'
  };

  const key = classMapping[clsLower] || Object.keys(CLASS_REFERENCE).find(k => k.toLowerCase() === clsLower);
  let features: string[] = [];

  if (key && (CLASS_REFERENCE as any)[key]?.progression) {
    const prog = (CLASS_REFERENCE as any)[key].progression.find((p: any) => p.level === level);
    if (prog && prog.features && prog.features !== '—') {
      features = prog.features.split(',').map((f: string) => f.trim());
    }
  }

  // Também verificar se há características de subclasse para este nível
  const sub = getFighterSubclass(subclassId);
  if (sub && Array.isArray(sub.features)) {
    const subGains = sub.features.filter(f => f.level === level).map(f => f.name);
    if (subGains.length > 0) {
      features = Array.from(new Set([...features, ...subGains]));
    }
  }

  if (features.length > 0) {
    return features;
  }

  return ['Evolução de Classe'];
};


// --- draconicAncestry.ts ---
export interface DraconicAncestry {
  name: string;
  damageType: string;
}

export const DRACONIC_ANCESTRIES: DraconicAncestry[] = [];


// --- equipment.ts ---
export interface EquipmentInfo {
  name: string;
  category: string;
  cost: string;
  weight?: string;
  properties?: string;
  damage?: string;
  armor_class?: string;
  stealth?: string;
  items?: string;
}

export const EQUIPMENT_REFERENCE: Record<string, EquipmentInfo> = {};


// --- feats.ts ---
export interface FeatInfo {
  name: string;
  category: string;
  description: string;
}

export const FEATS_REFERENCE: Record<string, FeatInfo> = {};


// --- giantAncestry.ts ---
export interface GiantAncestry {
  name: string;
  giantType: string;
  benefitName: string;
  description: string;
  icon: string;
  actionType: string;
}

export const GIANT_ANCESTRIES: GiantAncestry[] = [];


// --- monsters5e.ts ---
export interface MonsterActionJSON {
  name: string;
  type?: string;
  to_hit?: number;
  reach?: string;
  range?: string;
  damage?: string;
  text?: string;
  effect?: string;
  condition?: string;
}

export interface MonsterTraitJSON {
  name: string;
  text: string;
}

export interface MonsterStatsJSON {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface Monster5eJSON {
  id: string;
  name: string;
  cr: number;
  pb: number;
  armor_class: number;
  ac?: number;
  hp: number;
  speed: string;
  stats: MonsterStatsJSON;
  senses?: string;
  vulnerabilities?: string[];
  resistances?: string[];
  immunities?: string[];
  condition_immunities?: string[];
  saves?: Record<string, number>;
  skills?: string[];
  traits?: MonsterTraitJSON[];
  actions?: MonsterActionJSON[];
  bonus_actions?: MonsterTraitJSON[];
  reactions?: MonsterTraitJSON[];
  legendary_actions?: MonsterTraitJSON[];
  
  // Visual e Bioma
  icon: string;
  color: string;
  size?: string;
  biomePreference?: string[];
}

export const MONSTER_XP_BY_CR: Record<number, number> = {
  0: 10,
  0.125: 25,
  0.25: 50,
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  13: 10000,
  16: 15000,
  17: 18000,
  19: 22000,
  20: 25000,
  21: 33000,
  30: 155000
};

export const MONSTERS_5E_DATA: Monster5eJSON[] = [];

/**
 * Converte a velocidade ou alcance em formato texto (ex: "9m", "10,5 metros", "0m, Voo 15m") para células no grid (1.5m = 1 célula)
 */
export function parseSpeedToGridCells(speedStr: string | number): number {
  if (typeof speedStr === 'number') {
    return Math.max(1, Math.round(speedStr));
  }
  if (!speedStr) return 6;

  let str = String(speedStr).replace(',', '.');
  if (str.includes('/')) {
    str = str.split('/')[0];
  }

  const matches = Array.from(str.matchAll(/(\d+(?:\.\d+)?)\s*(?:m\b|metros\b)?/gi));
  if (matches.length > 0) {
    const values = matches.map(m => parseFloat(m[1])).filter(v => !isNaN(v));
    if (values.length > 0) {
      const maxVal = Math.max(...values);
      const effective = maxVal > 0 ? maxVal : values[0];
      return Math.max(1, Math.round(effective / 1.5));
    }
  }

  return 6;
}

/**
 * Extrai o bônus de ataque, o dado de dano e o alcance da primeira ação ofensiva válida
 */
export function extractPrimaryAttack(monster: Monster5eJSON): {
  attackBonus: number;
  damageDice: string;
  range: number;
} {
  const defaultBonus = monster.pb + Math.floor(((monster.stats.str || 10) - 10) / 2);
  if (!monster.actions || monster.actions.length === 0) {
    return { attackBonus: defaultBonus, damageDice: "1d6+2", range: 1 };
  }

  // Tenta encontrar uma ação com to_hit e damage
  const attackAction = monster.actions.find(a => a.to_hit !== undefined || a.damage !== undefined) || monster.actions[0];

  const attackBonus = attackAction.to_hit !== undefined ? attackAction.to_hit : defaultBonus;
  const damageDice = attackAction.damage || "1d6+2";

  let range = 1; // 1 célula (corpo a corpo, 1.5m)
  if (attackAction.reach) {
    range = parseSpeedToGridCells(attackAction.reach);
  } else if (attackAction.range) {
    range = parseSpeedToGridCells(attackAction.range);
  } else if (attackAction.type === "Ranged") {
    range = 6;
  }

  return { attackBonus, damageDice, range };
}


// --- races.ts ---
export interface Trait {
  name: string;
  description: string;
  type?: string;
  usageLimit?: string;
}

export interface RaceInfo {
  name: string;
  creatureType: string;
  size: string;
  speed: string;
  traits: Trait[];
  icon?: string;
  variants?: { name: string; description: string; metadata: any }[];
}

export const RACES_REFERENCE: Record<string, RaceInfo> = {};

export function getRaceInfo(raceKey?: string): RaceInfo | undefined {
  if (!raceKey) return undefined;
  const key = raceKey.trim();
  if (RACES_REFERENCE[key]) return RACES_REFERENCE[key];
  const lower = key.toLowerCase();
  if (lower === 'human' || lower === 'humano') return RACES_REFERENCE['Humano'];
  if (lower === 'dwarf' || lower === 'anão' || lower === 'anao') return RACES_REFERENCE['Anão'];
  if (lower === 'elf' || lower === 'elfo') return RACES_REFERENCE['Elfo'];
  if (lower === 'gnome' || lower === 'gnomo') return RACES_REFERENCE['Gnomo'];
  if (lower === 'goliath' || lower === 'golias') return RACES_REFERENCE['Golias'];
  if (lower === 'halfling' || lower === 'pequenino') return RACES_REFERENCE['Pequenino'];
  if (lower === 'tiefling' || lower === 'tiferino') return RACES_REFERENCE['Tiferino'];
  if (lower === 'dragonborn' || lower === 'draconato') return RACES_REFERENCE['Draconato'];
  if (lower === 'aasimar') return RACES_REFERENCE['Aasimar'];
  if (lower === 'orc') return RACES_REFERENCE['Orc'];
  return undefined;
}

export function getRaceIcon(raceName?: string, fallbackIcon?: string): string {
  if (!raceName) return fallbackIcon || '👤';
  const raceInfo = getRaceInfo(raceName);
  if (raceInfo?.icon && raceInfo.icon !== '👤') return raceInfo.icon;

  const raceKey = raceName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (raceKey.includes('aasimar')) return '👼';
  if (raceKey.includes('anao') || raceKey.includes('dwarf')) return '🧔';
  if (raceKey.includes('draconato') || raceKey.includes('dragonborn') || raceKey.includes('dragao')) return '🐉';
  if (raceKey.includes('elfo') || raceKey.includes('elf')) return '🧝';
  if (raceKey.includes('gnomo') || raceKey.includes('gnome')) return '🧙‍♂️';
  if (raceKey.includes('golias') || raceKey.includes('goliath')) return '🪨';
  if (raceKey.includes('humano') || raceKey.includes('human')) return '👤';
  if (raceKey.includes('orc')) return '👹';
  if (raceKey.includes('pequenino') || raceKey.includes('halfling')) return '🧒';
  if (raceKey.includes('tiferino') || raceKey.includes('tiefling')) return '😈';

  return fallbackIcon || '👤';
}


// --- spells.ts ---
export interface SpellInfo {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  classes: string[];
  description: string;
}

export const SPELLS_REFERENCE: Record<string, SpellInfo> = {};


