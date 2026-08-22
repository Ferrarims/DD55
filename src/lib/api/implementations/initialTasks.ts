export interface ImplementationTask {
  id: string;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  started: boolean;
  display_order: number;
  created_at?: string;
}

// Lista inicial de fallback com as implementações prontas e pendentes
export const INITIAL_IMPLEMENTATIONS: ImplementationTask[] = [
  {
    id: "a1b2c3d4-0001-4000-a000-000000000001",
    title: "Raças Básicas",
    description: "Integração de raças oficiais (Anão, Elfo, Humano, Halfling, Draconato, Orc, Gnomo, Golias, Aasimar, Tiferino) com traços raciais mapeados.",
    category: "Raças",
    completed: true,
    started: true,
    display_order: 1
  },
  {
    id: "a1b2c3d4-0002-4000-a000-000000000002",
    title: "12 Classes do Livro do Jogador",
    description: "Suporte a Bárbaro, Bardo, Clérigo, Druida, Guerreiro, Monge, Paladino, Patrulheiro, Ladino, Feiticeiro, Bruxo e Mago com seus atributos primários, DV e proficiências de armas/armaduras.",
    category: "Classes",
    completed: true,
    started: true,
    display_order: 2
  },
  {
    id: "a1b2c3d4-0003-4000-a000-000000000003",
    title: "Talentos Básicos",
    description: "Banco de talentos para customização inicial do herói, incluindo talentos de Origem e Gerais.",
    category: "Talentos",
    completed: true,
    started: true,
    display_order: 3
  },
  {
    id: "a1b2c3d4-0004-4000-a000-000000000004",
    title: "Antecedentes",
    description: "Configuração de antecedentes que distribuem bônus de habilidades, perícias proficientes e vinculação de talentos iniciais.",
    category: "Antecedentes",
    completed: true,
    started: true,
    display_order: 4
  },
  {
    id: "a1b2c3d4-0005-4000-a000-000000000005",
    title: "Sistema de Magias & Preparação",
    description: "Painel interativo para busca de magias de nível 0 a 9, filtros por classe/nível e interface para preparar magias na ficha.",
    category: "Magias",
    completed: true,
    started: true,
    display_order: 5
  },
  {
    id: "a1b2c3d4-0006-4000-a000-000000000006",
    title: "Armas, Equipamentos & Maestria com Armas",
    description: "Catálogo completo de equipamentos, armas e armaduras com seus preços em PO, pesos e propriedades de maestria de arma aplicadas.",
    category: "Equipamentos",
    completed: true,
    started: true,
    display_order: 6
  },
  {
    id: "a1b2c3d4-0007-4000-a000-000000000007",
    title: "Ficha de Personagem Interativa",
    description: "Visualizador completo de atributos, modificadores, CA calculada, vida atual/máxima, perícias treinadas, lista de ataques rápidos e inventário equipado.",
    category: "Ficha",
    completed: true,
    started: true,
    display_order: 7
  },
  {
    id: "a1b2c3d4-0008-4000-a000-000000000008",
    title: "Plataforma de Arena & Gerador de Mapas",
    description: "Arena tática em grade com geração de biomas, movimentação fluida usando A* Pathfinding e motor de combate por turnos contra inimigos.",
    category: "Arena",
    completed: true,
    started: true,
    display_order: 8
  },
  {
    id: "a1b2c3d4-0009-4000-a000-000000000009",
    title: "Loja Dinâmica & Gestão de Inventário",
    description: "Aba de Loja para compra de armas e itens consumindo ouro do personagem, com limite de peso e ação de equipar/desequipar.",
    category: "Equipamentos",
    completed: true,
    started: true,
    display_order: 9
  },
  {
    id: "a1b2c3d4-0010-4000-a000-000000000010",
    title: "Bestiário Completo de Monstros",
    description: "Banco de dados de monstros oficiais, com níveis de desafio (CR), PVs, CAs, atributos, perícias, resistências e lista de ações de ataque prontas.",
    category: "Monstros",
    completed: true,
    started: true,
    display_order: 10
  },
  {
    id: "a1b2c3d4-0011-4000-a000-000000000011",
    title: "Regras de Descanso Curto & Longo",
    description: "Implementar ações para descanso curto (usar Dados de Vida para curar PV) e descanso longo (recuperar todos os PVs, espaços de magias e metade dos Dados de Vida).",
    category: "Sistemas",
    completed: false,
    started: false,
    display_order: 11
  },
  {
    id: "a1b2c3d4-0012-4000-a000-000000000012",
    title: "Efeitos Visuais & Sonoros de Magias",
    description: "Adicionar animações visuais (efeitos de partículas e projéteis) e áudios temáticos de magias, ataques e acertos críticos durante as rodadas de combate na Arena.",
    category: "Arena",
    completed: false,
    started: false,
    display_order: 12
  },
  {
    id: "a1b2c3d4-0013-4000-a000-000000000013",
    title: "Suporte Multiclasse Avançado",
    description: "Permitir aos jogadores escolherem uma nova classe durante o ganho de nível, combinando os dados de vida, proficiências e espaços de magias combinados.",
    category: "Ficha",
    completed: false,
    started: false,
    display_order: 13
  },
  {
    id: "a1b2c3d4-0014-4000-a000-000000000014",
    title: "Sistema de Campanha & IA Narrativa",
    description: "Integrar a API do Gemini para gerar textos de narração imersivos a cada golpe e evento na arena, além de uma jornada de RPG rica e ramificada.",
    category: "IA & Narrativa",
    completed: false,
    started: false,
    display_order: 14
  },
  {
    id: "a1b2c3d4-0015-4000-a000-000000000015",
    title: "Terreno Difícil & Regras de Cobertura",
    description: "Inserir obstáculos na grade da Arena que dobram o custo de movimento (terreno difícil) e concedem bônus de CA contra ataques à distância (meia cobertura +2 e 3/4 cobertura +5).",
    category: "Arena",
    completed: false,
    started: false,
    display_order: 15
  },
  {
    id: "a1b2c3d4-0016-4000-a000-000000000016",
    title: "Importação e Exportação de Fichas (JSON)",
    description: "Possibilidade de exportar os dados completos do herói para um arquivo local e importá-lo novamente diretamente na tela de seleção.",
    category: "Sistemas",
    completed: false,
    started: false,
    display_order: 16
  },
  {
    id: "a1b2c3d4-0017-4000-a000-000000000017",
    title: "Regras de Exaustão",
    description: "Adicionar mecânica de fadiga que impõe penalidade acumulada de -1 para cada nível de exaustão em jogadas de d20 (ataques, salvaguardas e testes de perícia).",
    category: "Regras",
    completed: false,
    started: false,
    display_order: 17
  },
  {
    id: "a1b2c3d4-0018-4000-a000-000000000018",
    title: "Fichas de Companheiros Animais & Invocação",
    description: "Aba dedicada para controlar e visualizar dados de criaturas invocadas (familiares, montarias, elementais ou feras de Druidas/Patrulheiros).",
    category: "Ficha",
    completed: false,
    started: false,
    display_order: 18
  }
];
