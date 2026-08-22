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
  equipment:
    | {
        A: EquipmentItemChoice[];
        B: EquipmentItemChoice[];
        default?: EquipmentItemChoice[];
      }
    | { A: string; B: string };
}

export const BACKGROUNDS_REFERENCE: Record<string, BackgroundInfo> = {
  acolyte: {
    name: 'Acólito',
    abilityScores: ['Inteligência', 'Sabedoria'],
    feat: 'Iniciado em Magia',
    skillProficiencies: ['Intuição', 'Religião'],
    toolProficiency: 'Nenhuma',
    equipment: {
      A: [
        { name: 'Símbolo Sagrado', quantity: 1 },
        { name: 'Livro de Orações', quantity: 1 },
      ],
      B: [
        { name: 'Roupas Comuns', quantity: 1 },
        { name: 'Bolsa com 15 PO', quantity: 1 },
      ],
    },
  },
  criminal: {
    name: 'Criminoso',
    abilityScores: ['Destreza', 'Carisma'],
    feat: 'Sortudo',
    skillProficiencies: ['Enganação', 'Furtividade'],
    toolProficiency: 'Ferramentas de Ladino',
    equipment: {
      A: [
        { name: 'Pé-de-cabra', quantity: 1 },
        { name: 'Roupas Escuras', quantity: 1 },
      ],
      B: [{ name: 'Bolsa com 15 PO', quantity: 1 }],
    },
  },
  soldier: {
    name: 'Soldado',
    abilityScores: ['Força', 'Constituição'],
    feat: 'Atleta',
    skillProficiencies: ['Atletismo', 'Intimidação'],
    toolProficiency: 'Jogos de Dados',
    equipment: {
      A: [
        { name: 'Insígnia de Patente', quantity: 1 },
        { name: 'Troféu de Guerra', quantity: 1 },
      ],
      B: [
        { name: 'Roupas de Viagem', quantity: 1 },
        { name: 'Bolsa com 10 PO', quantity: 1 },
      ],
    },
  },
  sage: {
    name: 'Sábio',
    abilityScores: ['Inteligência', 'Sabedoria'],
    feat: 'Erudito',
    skillProficiencies: ['Arcanismo', 'História'],
    toolProficiency: 'Nenhuma',
    equipment: {
      A: [
        { name: 'Frasco de Tinta', quantity: 1 },
        { name: 'Pena de Escrever', quantity: 1 },
      ],
      B: [
        { name: 'Roupas de Viagem', quantity: 1 },
        { name: 'Bolsa com 10 PO', quantity: 1 },
      ],
    },
  },
  noble: {
    name: 'Nobre',
    abilityScores: ['Carisma', 'Inteligência'],
    feat: 'Líder Inspirador',
    skillProficiencies: ['Persuasão', 'História'],
    toolProficiency: 'Jogos de Cartas',
    equipment: {
      A: [
        { name: 'Roupas Finas', quantity: 1 },
        { name: 'Anel de Sinete', quantity: 1 },
      ],
      B: [{ name: 'Bolsa com 25 PO', quantity: 1 }],
    },
  },
};
