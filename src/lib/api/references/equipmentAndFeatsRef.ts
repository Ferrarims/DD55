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

export const EQUIPMENT_REFERENCE: Record<string, EquipmentInfo> = {
  Adaga: { name: 'Adaga', category: 'Armas Simples', cost: '2 PO', damage: '1d4 Perfurante', weight: '0.5 kg', properties: 'Acuidade, Leve, Arremesso (distância 6/18)' },
  'Espada Curta': { name: 'Espada Curta', category: 'Armas Marciais', cost: '10 PO', damage: '1d6 Perfurante', weight: '1 kg', properties: 'Acuidade, Leve' },
  'Espada Longa': { name: 'Espada Longa', category: 'Armas Marciais', cost: '15 PO', damage: '1d8 Cortante', weight: '1.5 kg', properties: 'Versátil (1d10)' },
  'Machado Grande': { name: 'Machado Grande', category: 'Armas Marciais', cost: '30 PO', damage: '1d12 Cortante', weight: '3 kg', properties: 'Pesada, Duas Mãos' },
  'Arco Curto': { name: 'Arco Curto', category: 'Armas Simples', cost: '25 PO', damage: '1d6 Perfurante', weight: '1 kg', properties: 'Munição (distância 24/96), Duas Mãos' },
  'Arco Longo': { name: 'Arco Longo', category: 'Armas Marciais', cost: '50 PO', damage: '1d8 Perfurante', weight: '1 kg', properties: 'Munição (distância 45/180), Pesada, Duas Mãos' },
  'Besta Leve': { name: 'Besta Leve', category: 'Armas Simples', cost: '25 PO', damage: '1d8 Perfurante', weight: '2.5 kg', properties: 'Munição (distância 24/96), Recarga, Duas Mãos' },
  Escudo: { name: 'Escudo', category: 'Escudos', cost: '10 PO', armor_class: '+2', weight: '3 kg', properties: '—' },
  'Armadura de Couro': { name: 'Armadura de Couro', category: 'Armaduras Leves', cost: '10 PO', armor_class: '11 + Mod. Des', weight: '5 kg', properties: '—' },
  'Gibão de Couro': { name: 'Gibão de Couro', category: 'Armaduras Leves', cost: '45 PO', armor_class: '12 + Mod. Des', weight: '6.5 kg', properties: '—' },
  'Cota de Malha': { name: 'Cota de Malha', category: 'Armaduras Pesadas', cost: '75 PO', armor_class: '16', weight: '27.5 kg', properties: 'Força 13, Desvantagem em Furtividade' },
  Placas: { name: 'Placas', category: 'Armaduras Pesadas', cost: '1.500 PO', armor_class: '18', weight: '32.5 kg', properties: 'Força 15, Desvantagem em Furtividade' },
  'Poção de Cura': { name: 'Poção de Cura', category: 'Poções', cost: '50 PO', weight: '0.25 kg', properties: 'Restaura 2d4 + 2 PV' },
  'Poção de Cura Maior': { name: 'Poção de Cura Maior', category: 'Poções', cost: '150 PO', weight: '0.25 kg', properties: 'Restaura 4d4 + 4 PV' },
  'Flechas (20)': { name: 'Flechas (20)', category: 'Munições', cost: '1 PO', weight: '0.75 kg', properties: 'Munição para arco' },
  'Virotes de Besta (20)': { name: 'Virotes de Besta (20)', category: 'Munições', cost: '1 PO', weight: '0.75 kg', properties: 'Munição para besta' },
  'Ração de Viagem': { name: 'Ração de Viagem', category: 'Equipamento de Aventura', cost: '5 PP', weight: '1 kg', properties: 'Sustento para 1 dia' },
  Tocha: { name: 'Tocha', category: 'Equipamento de Aventura', cost: '1 PC', weight: '0.5 kg', properties: 'Ilumina 6m de raio' },
};

export interface FeatInfo {
  name: string;
  category: string;
  description: string;
}

export const FEATS_REFERENCE: Record<string, FeatInfo> = {
  'Mestre-Atirador': {
    name: 'Mestre-Atirador',
    category: 'Geral',
    description:
      '[Geral] Pré-requisito: Nível 4+, Destreza 13+. +1 em Destreza (máx 20). Seus ataques à distância com armas ignoram Meia Cobertura (+2 CA) e Três Quartos de Cobertura (+5 CA). Estar a 1,5m de um inimigo não impõe desvantagem em suas jogadas de ataque com armas à distância. Atacar em alcance longo não impõe desvantagem em suas jogadas de ataque com armas à distância.',
  },
  Sharpshooter: {
    name: 'Mestre-Atirador',
    category: 'Geral',
    description:
      '[Geral] Pré-requisito: Nível 4+, Destreza 13+. +1 em Destreza (máx 20). Seus ataques à distância com armas ignoram Meia Cobertura (+2 CA) e Três Quartos de Cobertura (+5 CA). Estar a 1,5m de um inimigo não impõe desvantagem em suas jogadas de ataque com armas à distância. Atacar em alcance longo não impõe desvantagem em suas jogadas de ataque com armas à distância.',
  },
  'Mestre em Armas Grandes': {
    name: 'Mestre em Armas Grandes',
    category: 'Geral',
    description:
      '[Geral] Pré-requisito: Nível 4+, Força 13+. +1 em Força (máx 20). Ao acertar um ataque corpo a corpo com uma arma Pesada, adiciona o seu Bônus de Proficiência ao dano. Ao acertar um Crítico ou reduzir um inimigo a 0 PV, pode realizar um ataque corpo a corpo extra como Ação Bônus.',
  },
  'Great Weapon Master': {
    name: 'Mestre em Armas Grandes',
    category: 'Geral',
    description:
      '[Geral] Pré-requisito: Nível 4+, Força 13+. +1 em Força (máx 20). Ao acertar um ataque corpo a corpo com uma arma Pesada, adiciona o seu Bônus de Proficiência ao dano. Ao acertar um Crítico ou reduzir um inimigo a 0 PV, pode realizar um ataque corpo a corpo extra como Ação Bônus.',
  },
};

export interface DraconicAncestry {
  name: string;
  damageType: string;
}

export const DRACONIC_ANCESTRIES: DraconicAncestry[] = [];

export interface GiantAncestry {
  name: string;
  giantType: string;
  benefitName: string;
  description: string;
  icon: string;
  actionType: string;
}

export const GIANT_ANCESTRIES: GiantAncestry[] = [];
