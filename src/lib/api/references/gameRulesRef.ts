import { CONDITIONS_5E_REFERENCE } from './conditionsRef';

export interface GameRuleItem {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  icon: string;
  description: string; // Breve descrição da regra oficial (D&D 5.5e / 2024)
  appUsage: string; // Como funciona especificamente no aplicativo
  tags?: string[];
  effects?: { title: string; description: string }[];
  highlight?: string;
}

export const GAME_RULES_REFERENCE: GameRuleItem[] = [
  // ==========================================
  // 1. RAÇAS & ESPÉCIES
  // ==========================================
  {
    id: 'race-aasimar',
    title: 'Aasimar',
    subtitle: 'Humanoides tocados pela centelha celestial dos planos superiores',
    category: 'Raças & Espécies',
    icon: '👼',
    tags: ['Humanoide', 'Médio', 'Velocidade 9m', 'Luz & Cura'],
    description:
      'Os Aasimar são mortais que carregam a graça e o poder dos Planos Superiores em sua alma. Possuem traços divinos herdados de ancestrais celestiais.\n\n• **Tipo de Criatura**: Humanoide.\n• **Tamanho**: Médio (cerca de 1,5m a 1,9m).\n• **Deslocamento**: 9 metros (30 pés / 6 células).\n• **Visão no Escuro**: Enxerga na penumbra e escuridão até 18 metros (60 pés).\n• **Resistência Celestial**: Resistência natural a dano Necrótico e Radiante.\n• **Mãos Curativas**: Como uma Ação, pode tocar uma criatura e curar um número de dados d4 de Pontos de Vida igual ao seu Bônus de Proficiência (1 uso por Descanso Longo).\n• **Revelação Celestial**: A partir do nível 3, como Ação Bônus, pode liberar sua forma celestial por 1 minuto: brota asas radiantes ou um halo fulgurante, causando dano radiante extra a cada turno.',
    appUsage:
      'No app:\n1. Concede resistência automática a dano Radiante e Necrótico no motor de combate da arena.\n2. Concede Visão no Escuro (18m) que dissipa a névoa de guerra ao redor do herói em masmorras.\n3. O botão de ação **Mãos Curativas** fica disponível no painel de combate para restaurar PV com 1 clique.\n4. Ao atingir nível 3, **Revelação Celestial** pode ser ativada como Ação Bônus, somando dano radiante aos seus ataques.',
    highlight: 'Resistência a Radiante e Necrótico + Cura pelas Mãos + Revelação Celestial.',
    effects: [
      { title: 'Resistência Celestial', description: 'Metade do dano recebido de dano Necrótico e Radiante.' },
      { title: 'Mãos Curativas', description: 'Restaura d4s de PV por toque (1x por Descanso Longo).' },
      { title: 'Visão no Escuro', description: 'Visão clara em masmorras e noites até 18m.' }
    ]
  },
  {
    id: 'race-dwarf',
    title: 'Anão',
    subtitle: 'Mestres da pedra, forjados com resiliência e vigor inabalável',
    category: 'Raças & Espécies',
    icon: '🧔',
    tags: ['Humanoide', 'Médio', 'Velocidade 9m', 'Robustez'],
    description:
      'Anões foram moldados a partir da rocha primordial. São famosos por sua resistência física contra toxinas, seu trabalho com metais e sua afinidade com o subterrâneo profundo.\n\n• **Tipo de Criatura**: Humanoide.\n• **Tamanho**: Médio (cerca de 1,2m a 1,5m, porém corpulentos e pesados).\n• **Deslocamento**: 9 metros (30 pés / 6 células).\n• **Visão no Escuro Superior**: Enxerga no escuro até 36 metros (120 pés / 24 células).\n• **Resiliência Anã**: Vantagem em salvaguardas contra veneno e Resistência a dano de Veneno.\n• **Robustez Anã**: Seus Pontos de Vida máximos aumentam em +1 por nível acumulado.\n• **Conhecimento da Pedra**: Como Ação Bônus, ganha Sentido Sísmico em superfícies de pedra até 18m por 10 minutos.',
    appUsage:
      'No app:\n1. O cálculo de PV Máximo da Ficha soma automaticamente +1 PV para cada nível do anão.\n2. Ataques e armadilhas com veneno causam metade do dano e testes de salvaguarda contra envenenamento rolam automaticamente com Vantagem (2d20).\n3. O alcance de Visão no Escuro na grade da arena é de 36m (o dobro do padrão), revelando inimigos ocultos de longe.',
    highlight: '+1 PV por nível + Resistência a Veneno + Visão no Escuro ampliada para 36m.',
    effects: [
      { title: 'Resiliência Anã', description: 'Resistência a dano de Veneno e Vantagem vs Condição Envenenado.' },
      { title: 'Robustez Anã', description: '+1 Ponto de Vida máximo por nível do herói.' },
      { title: 'Visão no Escuro 36m', description: 'Enxerga perfeitamente na escuridão até 24 células.' }
    ]
  },
  {
    id: 'race-dragonborn',
    title: 'Draconato',
    subtitle: 'Nobreza ancestral que canaliza o sopro dos dragões elementares',
    category: 'Raças & Espécies',
    icon: '🐉',
    tags: ['Humanoide', 'Médio', 'Velocidade 9m', 'Sopro Dracônico'],
    description:
      'Draconatos carregam o sangue nobre e a fúria elemental dos grandes dragões cromáticos e metálicos. Ao criar o personagem, escolhe-se sua Ancestralidade Dracônica entre 10 tipos (Dragão Negro, Azul, Bronze, Cobre, Latão, Ouro, Prata, Verde, Vermelho ou Branco).\n\n• **Tipo de Criatura**: Humanoide.\n• **Tamanho**: Médio (cerca de 1,8m a 2,1m).\n• **Deslocamento**: 9 metros (30 pés / 6 células).\n• **Visão no Escuro**: Enxerga no escuro até 18 metros (60 pés).\n• **Arma de Sopro**: Como parte da Ação de Ataque (substituindo um golpe), exala um cone de 4,5m (15 pés) ou linha de 9m (30 pés) de energia destrutiva (Fogo, Frio, Ácido, Raio ou Veneno). O dano é 1d10 (aumenta para 2d10 no nível 5, 3d10 no nível 11 e 4d10 no nível 17). Usos por Descanso Longo iguais ao Bônus de Proficiência (PB).\n• **Resistência a Dano**: Resistência passiva ao tipo de dano da sua ancestralidade.\n• **Voo Dracônico (Nível 5+)**: Como Ação Bônus, brota asas espectrais por 10 minutos (1 uso por Descanso Longo).',
    appUsage:
      'No app:\n1. A sua ancestralidade escolhida determina o elemento, a cor do token e o ícone de dano.\n2. A habilidade **Arma de Sopro** fica listada como ataque especial com controle de cargas diárias (usos = PB).\n3. O app calcula a CD da salvaguarda (8 + Mod. CON + PB) e aplica o dano em área nas células correspondentes da arena.\n4. Concede resistência passiva automática contra o elemento escolhido no cálculo de dano recebido.',
    highlight: 'Sopro elemental em área + Resistência elementar + Asas de Voo no nível 5.',
    effects: [
      { title: 'Arma de Sopro', description: 'Dano escalonado (1d10 a 4d10) em cone ou linha que substitui 1 ataque.' },
      { title: 'Resistência a Dano', description: 'Metade do dano recebido do elemento de sua linhagem.' },
      { title: 'Voo Dracônico', description: 'Deslocamento de voo por 10 minutos a partir do 5º nível.' }
    ]
  },
  {
    id: 'race-elf',
    title: 'Elfo',
    subtitle: 'Criaturas místicas e longevas com ligação profunda com o Reino Feérico',
    category: 'Raças & Espécies',
    icon: '🧝',
    tags: ['Humanoide', 'Médio', 'Velocidade 9m', 'Transe Feérico'],
    description:
      'Os elfos possuem sentidos sobrenaturais e graça incomparável. Ao criar o personagem, escolhe-se sua Linhagem Élfica (Alto Elfo, Elfo da Floresta ou Drow).\n\n• **Tipo de Criatura**: Humanoide.\n• **Tamanho**: Médio (cerca de 1,6m a 1,9m).\n• **Deslocamento**: 9 metros (Alto Elfo e Drow) ou 10,5 metros / 35 pés (Elfo da Floresta).\n• **Visão no Escuro**: 18 metros (ou 36 metros para Drow).\n• **Ancestralidade Feérica**: Vantagem em salvaguardas contra ser Encantado e magia não pode colocá-lo para dormir.\n• **Sentidos Aguçados**: Proficiência imediata na perícia Percepção.\n• **Transe**: Não precisa dormir; completa um Descanso Longo em apenas 4 horas de meditação concentrada.',
    appUsage:
      'No app:\n1. A perícia Percepção já é inicializada como proficiente na Ficha do Personagem.\n2. Salvaguardas contra magias de Encantamento rolam automaticamente com Vantagem.\n3. Imunidade total à condição Inconsciente quando induzida por efeitos de sono mágico.',
    highlight: 'Proficiência em Percepção + Vantagem vs Encantamento + Imune a sono mágico.',
    effects: [
      { title: 'Ancestralidade Feérica', description: 'Vantagem contra ser Encantado e imune a sono mágico.' },
      { title: 'Sentidos Aguçados', description: 'Bônus de proficiência permanente na perícia Percepção.' },
      { title: 'Transe', description: 'Completa o descanso longo através de 4 horas de meditação profunda.' }
    ]
  },
  {
    id: 'race-gnome',
    title: 'Gnomo',
    subtitle: 'Inventores astutos e cheios de engenhosidade mágica',
    category: 'Raças & Espécies',
    icon: '🧙‍♂️',
    tags: ['Humanoide', 'Pequeno', 'Velocidade 9m', 'Astúcia'],
    description:
      'Gnomos são seres enérgicos com mentes curiosas e espírito incansável. Dividem-se em Gnomos da Floresta (magia ilusória e fala com animais) e Gnomos das Rochas (inventores de engenhocas mecânicas).\n\n• **Tipo de Criatura**: Humanoide.\n• **Tamanho**: Pequeno (cerca de 0,9m a 1,2m).\n• **Deslocamento**: 9 metros (30 pés / 6 células).\n• **Visão no Escuro**: Enxerga no escuro até 18 metros (60 pés).\n• **Astúcia Gnômica**: Vantagem permanente em todos os Testes de Resistência de Inteligência, Sabedoria e Carisma contra magias e efeitos sobrenaturais.',
    appUsage:
      'No app:\n1. Em combate, qualquer feitiço ou magia hostil que exija salvaguardas mentais (INT, SAB ou CAR) aciona automaticamente a rolagem com Vantagem (2d20) no log de combate.\n2. Seu tamanho Pequeno permite movimentar-se e navegar por espaços estreitos na arena.',
    highlight: 'Vantagem permanente em Salvaguardas de INT, SAB e CAR contra qualquer magia.',
    effects: [
      { title: 'Astúcia Gnômica', description: 'Vantagem em todas as salvaguardas de Inteligência, Sabedoria e Carisma.' },
      { title: 'Visão no Escuro', description: 'Visão nítida em masmorras e ambientes escuros até 18m.' }
    ]
  },
  {
    id: 'race-goliath',
    title: 'Golias',
    subtitle: 'Descendentes dos gigantes com estatura imponente e força colossal',
    category: 'Raças & Espécies',
    icon: '🗿',
    tags: ['Humanoide', 'Médio', 'Velocidade 10,5m', 'Poder dos Gigantes'],
    description:
      'Os Golias carregam em suas veias o poder elemental dos seis grandes clãs de gigantes (Gigante das Nuvens, do Fogo, do Gelo, das Colinas, da Pedra ou da Tempestade).\n\n• **Tipo de Criatura**: Humanoide.\n• **Tamanho**: Médio (cerca de 2,1m a 2,4m).\n• **Deslocamento**: 10,5 metros (35 pés / 7 células).\n• **Constituição Poderosa**: Vantagem para evitar ou escapar da condição Agarrado e conta como 1 categoria maior para capacidade de carga.\n• **Ancestralidade de Gigante**: Concede um benefício único com usos iguais ao seu Bônus de Proficiência (ex: *Golpe do Fogo* causa 1d10 de fogo; *Golpe do Gelo* reduz movimento do alvo; *Golpe da Colina* derruba o alvo; *Pulo da Nuvem* teletransporta 9m).\n• **Forma Grande (Nível 5+)**: Como Ação Bônus, altera seu tamanho para Grande por 10 minutos: ganha Vantagem em testes de Força e +3m (+10 pés) de deslocamento extra.',
    appUsage:
      'No app:\n1. Seu deslocamento base na arena inicia em 10,5m (7 células, 1 a mais que o padrão).\n2. O golpe ancestral escolhido (Fogo, Gelo, Colina, Pedra, Tempestade) surge com botões de ação e contador de usos na ficha.\n3. No nível 5, **Forma Grande** expande sua velocidade e poder no grid tático.',
    highlight: 'Deslocamento de 10,5m + Poder ancestral de gigante + Forma Grande no nível 5.',
    effects: [
      { title: 'Ancestralidade de Gigante', description: 'Efeitos extras por acerto (Fogo, Gelo, Colina, etc.) com usos diários = PB.' },
      { title: 'Constituição Poderosa', description: 'Vantagem em testes contra ser Agarrado e capacidade de carga ampliada.' },
      { title: 'Forma Grande', description: 'Torna-se Grande com Vantagem em Força e +3m de movimento no 5º nível.' }
    ]
  },
  {
    id: 'race-halfling',
    title: 'Pequenino',
    subtitle: 'Pequenos em estatura, gigantes em bravura, agilidade e sorte',
    category: 'Raças & Espécies',
    icon: '🧒',
    tags: ['Humanoide', 'Pequeno', 'Velocidade 9m', 'Sortudo'],
    description:
      'Os Pequeninos sobrevivem em um mundo de gigantes graças à sua sorte quase mágica, sua coragem inabalável e sua facilidade de se ocultar.\n\n• **Tipo de Criatura**: Humanoide.\n• **Tamanho**: Pequeno (cerca de 0,9m).\n• **Deslocamento**: 9 metros (30 pés / 6 células).\n• **Sortudo**: Quando rola um 1 natural em um d20 (ataque, teste de atributo ou salvaguarda), você pode jogar o dado novamente e deve usar a nova rolagem!\n• **Corajoso**: Vantagem em todas as salvaguardas contra ficar com a condição Amedrontado.\n• **Agilidade Pequenina**: Pode se mover através do espaço de qualquer criatura que seja de tamanho maior que o seu.',
    appUsage:
      'No app:\n1. O motor de dados detecta instantaneamente quando um 1 natural é rolado em ataques ou testes do Pequenino e aciona a re-rolagem automática de **Sortudo** no log.\n2. Salvaguardas contra Medo são realizadas com Vantagem automática.\n3. O pathfinding na arena permite atravessar células ocupadas por criaturas Médias e Grandes sem bloqueio de caminho.',
    highlight: 'Re-rola qualquer 1 natural no d20 + Vantagem vs Medo + Atravessa inimigos maiores.',
    effects: [
      { title: 'Sortudo', description: 'Re-rola automaticamente 1s naturais em ataques, testes e salvaguardas.' },
      { title: 'Corajoso', description: 'Vantagem em testes de resistência contra ser Amedrontado.' },
      { title: 'Agilidade Pequenina', description: 'Move-se através de células de criaturas maiores.' }
    ]
  },
  {
    id: 'race-human',
    title: 'Humano',
    subtitle: 'A raça mais adaptável, ambiciosa e engenhosa do multiverso',
    category: 'Raças & Espécies',
    icon: '👤',
    tags: ['Humanoide', 'Médio/Pequeno', 'Velocidade 9m', 'Talento Extra'],
    description:
      'Os humanos são conhecidos por sua impressionante adaptabilidade e determinação implacável. São a única espécie que começa o jogo com um Talento de Origem adicional!\n\n• **Tipo de Criatura**: Humanoide.\n• **Tamanho**: Médio (cerca de 1,5m a 1,9m) ou Pequeno (cerca de 0,9m a 1,2m).\n• **Deslocamento**: 9 metros (30 pés / 6 células).\n• **Versátil**: Você ganha Inspiração Heroica sempre que termina um Descanso Longo.\n• **Habilidoso**: Você ganha proficiência em 1 perícia adicional à sua escolha.\n• **Talento Versátil**: Você ganha 1 Talento de Origem extra de sua escolha no nível 1 (como Alerta, Músico, Conjurador Mágico, Rápido ou Robusto).',
    appUsage:
      'No app:\n1. Durante a criação do personagem, você escolhe uma perícia bônus e um **Talento de Origem Extra** que é adicionado à sua lista permanente de talentos ativos.\n2. Ao realizar um Descanso Longo, o herói ganha automaticamente uma Inspiração Heroica ativa.',
    highlight: '1 Talento de Origem extra no nível 1 + 1 Perícia bônus + Inspiração diária.',
    effects: [
      { title: 'Talento de Origem Extra', description: 'Inicia com 2 talentos no total (1 do antecedente + 1 da raça).' },
      { title: 'Habilidoso', description: 'Proficiência em uma perícia extra à sua escolha.' },
      { title: 'Engenhosidade Humana', description: 'Ganha Inspiração Heroica a cada Descanso Longo.' }
    ]
  },
  {
    id: 'race-orc',
    title: 'Orc',
    subtitle: 'Guerreiros incansáveis com vitalidade vulcânica e determinação feroz',
    category: 'Raças & Espécies',
    icon: '👹',
    tags: ['Humanoide', 'Médio', 'Velocidade 9m', 'Adrenalina'],
    description:
      'Abençoados com uma vitalidade incomparável, os Orcs resistem a ferimentos que derrubariam qualquer outro mortal e avançam pelo campo de batalha com velocidade impressionante.\n\n• **Tipo de Criatura**: Humanoide.\n• **Tamanho**: Médio (cerca de 1,8m a 2,1m).\n• **Deslocamento**: 9 metros (30 pés / 6 células).\n• **Visão no Escuro Superior**: Enxerga no escuro até 36 metros (120 pés / 24 células).\n• **Pico de Adrenalina**: Você pode realizar a Ação de Disparada como uma Ação Bônus. Ao fazer isso, ganha Pontos de Vida Temporários iguais ao seu Bônus de Proficiência (PB). Usos por Descanso Curto = PB.\n• **Resistência Implacável**: Quando você é reduzido a 0 PV mas não é morto instantaneamente, você cai a 1 PV em vez disso (1 uso por Descanso Longo).\n• **Constituição Poderosa**: Vantagem contra ser Agarrado e capacidade de carga ampliada.',
    appUsage:
      'No app:\n1. O botão **Pico de Adrenalina** surge no menu de Ações Bônus de combate: concede movimento dobrado instantâneo e adiciona PV temporários à sua barra de vida.\n2. Se o herói receber um golpe fatal que levaria a 0 PV, o sistema aciona a **Resistência Implacável**, mantendo-o de pé com 1 PV e notificando no log de combate.',
    highlight: 'Sobrevive a 0 PV caindo para 1 PV + Disparada como Ação Bônus com PV temporários.',
    effects: [
      { title: 'Resistência Implacável', description: 'Evita a inconsciência 1x por dia caindo a 1 PV.' },
      { title: 'Pico de Adrenalina', description: 'Disparada em Ação Bônus que concede PV temporários (usos = PB).' },
      { title: 'Visão no Escuro 36m', description: 'Visão estendida para 24 células na escuridão.' }
    ]
  },
  {
    id: 'race-tiefling',
    title: 'Tiferino',
    subtitle: 'Portadores de herança infernal com magia sombria e resistência elemental',
    category: 'Raças & Espécies',
    icon: '😈',
    tags: ['Humanoide', 'Médio/Pequeno', 'Velocidade 9m', 'Magia Infernal'],
    description:
      'Os Tiferinos carregam a marca de linhagens dos Planos Inferiores (Abissal, Ctônico ou Infernal). Possuem chifres, caudas e olhos sem pupila.\n\n• **Tipo de Criatura**: Humanoide.\n• **Tamanho**: Médio (cerca de 1,5m a 1,9m) ou Pequeno.\n• **Deslocamento**: 9 metros (30 pés / 6 células).\n• **Visão no Escuro**: Enxerga no escuro até 18 metros (60 pés).\n• **Resistência Infernal**: Resistência a dano de Fogo (Linhagem Infernal), Veneno (Abissal) ou Necrótico (Ctônica).\n• **Magia Infernal**: Conhece o truque Taumaturgia. No nível 3 aprende Repreensão Infernal. No nível 5 aprende Escuridão, podendo conjurar cada uma 1x por Descanso Longo.',
    appUsage:
      'No app:\n1. Concede resistência automática ao elemento da linhagem (Fogo/Veneno/Necrótico) no cálculo de dano.\n2. Suas magias raciais inatas aparecem preparadas no seu grimório sem gastar espaços de magia normais.',
    highlight: 'Resistência a Fogo + Magias inatas gratuitas (Taumaturgia, Repreensão Infernal, Escuridão).',
    effects: [
      { title: 'Resistência Infernal', description: 'Metade do dano recebido de dano de Fogo, Veneno ou Necrótico.' },
      { title: 'Magia Racial', description: 'Aprende Taumaturgia, Repreensão Infernal (nível 3) e Escuridão (nível 5).' },
      { title: 'Visão no Escuro', description: 'Enxerga perfeitamente na escuridão até 18m.' }
    ]
  },

  // ==========================================
  // 2. DESCANSO & RECUPERAÇÃO
  // ==========================================
  {
    id: 'rule-short-rest',
    title: 'Descanso Curto',
    subtitle: 'Repouso tático com gasto de Dados de Vida',
    category: 'Descanso & Recuperação',
    icon: '⛺',
    tags: ['Inventário', 'Dados de Vida', 'Habilidades de Classe'],
    description:
      'Um descanso curto é um período de inatividade de pelo menos 1 hora em que o personagem relaxa e cuida dos ferimentos. Durante o descanso, o aventureiro pode gastar um ou mais dos seus Dados de Vida para recuperar Pontos de Vida (PV). Para cada dado gasto, o jogador rola o dado de vida da classe e soma seu modificador de Constituição. Recursos de classe recarregáveis em descanso curto também são recuperados.',
    appUsage:
      'Para realizar um Descanso Curto no app:\n1. Abra a aba **Inventário** do seu personagem.\n2. Tenha ao menos 1 item de acampamento (**Saco de Dormir** ou **Tenda**) e 1 **Ração de Viagem**.\n3. Certifique-se de que a área atual está limpa (sem monstros hostis vivos).\n4. Clique no botão de **Descanso Curto**.\n5. Um painel interativo se abrirá permitindo que você escolha exatamente quantos Dados de Vida deseja gastar.\n6. Ao confirmar, o consumo de ração e os dados gastos são debitados, a vida é recuperada e todas as habilidades de recarga curta (como *Retomar o Fôlego* do Guerreiro) voltam a ficar disponíveis.',
    highlight: 'Consome 1 Ração no inventário e requer área sem monstros.',
    effects: [
      { title: 'Recuperação de PV', description: 'Gaste Dados de Vida disponíveis + Modificador de CON por dado.' },
      { title: 'Recarga de Habilidades', description: 'Habilidades como Retomar o Fôlego, Surto de Ação e magias de Bruxo são recarregadas.' }
    ]
  },
  {
    id: 'rule-long-rest',
    title: 'Descanso Longo',
    subtitle: 'Recuperação completa de PV, Magias e Exaustão',
    category: 'Descanso & Recuperação',
    icon: '🏕️',
    tags: ['Acampamento no Mapa', 'Recarga Total', 'Cura Exaustão'],
    description:
      'Um descanso longo é um período estendido de repouso de 8 horas. Ao final do descanso longo, o personagem recupera todos os seus Pontos de Vida perdidos, todos os seus Dados de Vida máximos, recarrega todos os espaços de magia e habilidades diárias, além de reduzir 1 nível de Exaustão caso possua.',
    appUsage:
      'Para realizar um Descanso Longo no app:\n1. No mapa/arena de exploração, localize o **Ponto de Acampamento** (símbolo de fogueira/tenda no chão).\n2. Aproxime seu personagem do ponto de descanso.\n3. Não pode haver monstros vivos no mapa e o personagem precisa ter no mínimo 1 PV (não pode estar Inconsciente).\n4. Clique na tenda/acampamento para disparar o Descanso Longo.\n5. O app restaura automaticamente 100% dos seus PV, 100% dos seus Dados de Vida, todos os Espaços de Magia, todas as habilidades de descanso longo e remove 1 nível da condição Exaustão.',
    highlight: 'Feito interagindo com o Ponto de Acampamento no mapa com a área segura.',
    effects: [
      { title: 'Pontos de Vida', description: 'Restaura 100% dos Pontos de Vida (PV).' },
      { title: 'Dados de Vida & Magias', description: 'Restaura todos os Dados de Vida e todos os espaços de magia de todos os círculos.' },
      { title: 'Exaustão', description: 'Reduz 1 nível de Exaustão (a condição termina ao chegar a 0).' }
    ]
  },

  // ==========================================
  // 3. COMBATE & AÇÕES
  // ==========================================
  {
    id: 'rule-initiative',
    title: 'Iniciativa & Ordem de Turnos',
    subtitle: 'Definição da sequência tática de combate',
    category: 'Combate & Ações',
    icon: '⚡',
    tags: ['Automático', 'Destreza', 'Turnos'],
    description:
      'No início do combate, todos os participantes determinam sua ordem na sequência de turnos rolando um teste de Iniciativa (d20 + Modificador de Destreza). A ordem decrescente dos totais define a fila em que os combatentes agirão a cada rodada até o fim do combate.',
    appUsage:
      'Ao iniciar um encontro na Arena:\n• O app rola a Iniciativa de todos os personagens e monstros instantaneamente em segundo plano.\n• A barra superior exibe a linha do tempo de turnos com o avatar de cada criatura, indicando claramente de quem é a vez atual e a contagem de rodadas.\n• Quando o seu turno chega, seus botões de ação e grade de movimento são liberados para comando.',
    highlight: 'Rolagem automática de d20 + DES exibida na barra de turnos superior.'
  },
  {
    id: 'rule-action-economy',
    title: 'Economia de Ações por Turno',
    subtitle: 'Ação, Ação Bônus, Reação e Movimento',
    category: 'Combate & Ações',
    icon: '⏱️',
    tags: ['Ação', 'Ação Bônus', 'Reação', 'Movimento'],
    description:
      'Em seu turno de combate, cada criatura dispõe de:\n• 1 Ação (Atacar, Conjurar Magia, Desengajar, Disparar, Esquivar, Usar Item);\n• 1 Ação Bônus (quando concedida por magias ou habilidades específicas);\n• Movimento (até o seu deslocamento máximo em metros);\n• 1 Reação por rodada (usada fora do seu turno em resposta a um gatilho, como Ataque de Oportunidade).',
    appUsage:
      'No painel de combate do app:\n• Botões de ações disponíveis exibem o tipo de recurso gasto (**Ação Principal**, **Ação Bônus**).\n• O seu deslocamento restante no turno é contabilizado célula a célula no grid tático.\n• Habilidades e magias que usam Ação Bônus ficam ativas apenas se você ainda não gastou a sua Ação Bônus do turno.',
    effects: [
      { title: 'Ação Principal', description: 'Ataques com armas, magias de 1 ação, uso de itens.' },
      { title: 'Ação Bônus', description: 'Magias rápidas (ex: Palavra de Cura) e habilidades como Retomar o Fôlego.' },
      { title: 'Reação', description: 'Disparada automaticamente quando inimigos saem da sua área de ameaça ou por magias como Escudo Arcano.' }
    ]
  },
  {
    id: 'rule-attack-and-ac',
    title: 'Jogadas de Ataque, CA e Críticos',
    subtitle: 'Mecânica de acerto d20 vs Classe de Armadura',
    category: 'Combate & Ações',
    icon: '🎯',
    tags: ['d20', 'Classe de Armadura', 'Crítico 20 / Falha 1'],
    description:
      'Para acertar um golpe, rola-se 1d20 + Modificador de Atributo + Bônus de Proficiência (se proficiente com a arma). Se o total for igual ou superior à Classe de Armadura (CA) do alvo, o ataque acerta e rola o dano. Um 20 natural no d20 é sempre um Acerto Crítico (dobra todos os dados de dano da arma/ataque). Um 1 natural é uma Falha Crítica automática.',
    appUsage:
      'Ao mirar em um inimigo na arena e clicar em Atacar:\n• O sistema calcula o bônus de ataque da arma equipada, verifica a CA do alvo com coberturas e rola o d20.\n• O log de combate detalha toda a equação: [Rolagem d20 + Bônus vs CA Alvo = Acerto/Erro].\n• Em caso de 20 Crítico, os dados de dano são duplicados automaticamente e destacados no log com animação de impacto.',
    highlight: '20 Natural dobra os dados de dano; 1 Natural erra automaticamente.'
  },
  {
    id: 'rule-advantage-disadvantage',
    title: 'Vantagem & Desvantagem',
    subtitle: 'Rolagem de 2d20 com escolha do maior ou menor',
    category: 'Combate & Ações',
    icon: '🎲',
    tags: ['2d20', 'Condições', 'Tática'],
    description:
      '• **Vantagem**: Você rola dois dados d20 e escolhe o maior resultado. Ocorre quando você está em posição favorável (ex: atacando alvo caído adjacente ou atacando estando invisível).\n• **Desvantagem**: Você rola dois d20 e escolhe o menor. Ocorre em desvantagem tática (ex: atacando no escuro, envenenado ou com arma à distância com inimigo colado).\n• Se você tiver múltiplas fontes de vantagem e desvantagem, elas se anulam mutuamente, resultando em uma rolagem simples de 1d20.',
    appUsage:
      'O motor de combate do aplicativo avalia todas as fontes ativas em tempo real (condições de ambos os combatentes, clima, iluminação, cobertura e maestria de armas). Quando há vantagem ou desvantagem, o app rola 2d20 e exibe ambos os dados no registro de combate com a explicação do motivo.',
    highlight: 'Calculado automaticamente pelo sistema avaliando terreno, luz, clima e status.'
  },
  {
    id: 'rule-opportunity-attack',
    title: 'Ataque de Oportunidade',
    subtitle: 'Reação ao deixar a área de ameaça inimiga',
    category: 'Combate & Ações',
    icon: '⚔️',
    tags: ['Reação', 'Grid Tático', 'Desengajar'],
    description:
      'Quando uma criatura se move voluntariamente para fora do alcance corpo a corpo (1 célula / 1,5m) de um oponente sem realizar a Ação de Desengajar, o oponente pode gastar sua Reação para desferir um ataque corpo a corpo imediato antes que a criatura se afaste.',
    appUsage:
      'No grid da arena:\n• Se você ou um monstro tentar andar para fora da célula adjacente de um inimigo que tenha sua reação disponível, o sistema dispara o ataque de oportunidade imediatamente.\n• Use a ação de Desengajar ou habilidades especiais para recuar com segurança sem sofrer o golpe.',
    highlight: 'Disparado na movimentação pelo grid se não usar Desengajar.'
  },

  // ==========================================
  // 4. MORTE & SOBREVIVÊNCIA
  // ==========================================
  {
    id: 'rule-death-saves',
    title: 'Morte & Salvaguardas',
    subtitle: 'Regras ao cair a 0 Pontos de Vida',
    category: 'Morte & Sobrevivência',
    icon: '💀',
    tags: ['0 PV', 'Inconsciente', '3 Sucessos / 3 Falhas'],
    description:
      'Ao cair a 0 Pontos de Vida, a criatura fica Inconsciente e Caída. No início de cada turno com 0 PV, faz um Teste Contra a Morte (d20 puro, sem modificadores):\n• **10 ou mais**: 1 Sucesso;\n• **9 ou menos**: 1 Falha;\n• **20 Natural**: Recupera 1 PV imediatamente e desperta!\n• **1 Natural**: Conta como 2 Falhas imediatas!\nAo acumular 3 Sucessos, você fica Estabilizado (permanece a 0 PV mas não rola mais salvaguardas). Ao acumular 3 Falhas, o personagem morre permanentemente. Sofrer dano a 0 PV causa 1 falha imediata (ou 2 se for acerto crítico).',
    appUsage:
      'Se o seu herói chegar a 0 PV no app:\n• O personagem ganha o status Inconsciente e o menu de ações normais é bloqueado.\n• No seu turno, um painel especial de **Teste Contra a Morte** aparece na tela com o d20 e os marcadores de Sucesso (esferas verdes) e Falha (esferas vermelhas).\n• Rolar 20 revive o herói na hora com 1 PV.\n• Receber qualquer cura (poção, magia, descanso) encerra a inconsciência e remove todos os marcadores de falha/sucesso.',
    highlight: '3 Sucessos = Estável | 3 Falhas = Morte | 20 Natural = Acorda com 1 PV.',
    effects: [
      { title: 'Sucessos (10+)', description: '3 sucessos estabilizam o herói com 0 PV.' },
      { title: 'Falhas (1-9)', description: '3 falhas causam a morte permanente do personagem.' },
      { title: 'Cura Externa', description: 'Qualquer ponto de vida restaurado faz o personagem acordar e agir.' }
    ]
  },

  // ==========================================
  // 5. MAESTRIA COM ARMAS
  // ==========================================
  {
    id: 'rule-weapon-mastery-overview',
    title: 'Maestria com Armas',
    subtitle: 'Propriedades táticas marciais exclusivas',
    category: 'Maestria com Armas',
    icon: '🔱',
    tags: ['Guerreiro', 'Táticas Marciais', 'Maestria'],
    description:
      'As propriedades de Maestria com Armas concedem aos personagens com treino marcial (como o Guerreiro) efeitos secundários poderosos ao atacar com armas nas quais possuem maestria (ex: empurrar o alvo, derrubá-lo, causar dano mesmo errando o ataque ou ganhar vantagem).',
    appUsage:
      'No app, as propriedades de maestria são integradas ao sistema de combate:\n• Se o personagem for qualificado e a arma possuir a propriedade (ex: Machado Grande com Trespassar, Espada Longa com Enfraquecer, Maça com Empurrar, Espada Curta com Afligir), o efeito é acionado automaticamente a cada golpe desferido na arena e registrado no log de combate.',
    highlight: 'Aplicado automaticamente a cada ataque com armas que você domine.'
  },
  {
    id: 'rule-mastery-topple',
    title: 'Maestria: Derrubar',
    subtitle: 'Força o oponente a cair no chão',
    category: 'Maestria com Armas',
    icon: '💥',
    tags: ['Salvaguarda de CON', 'Condição Caído', 'Armas Pesadas/Haste'],
    description:
      'Ao acertar uma criatura com uma arma com Derrubar, você pode forçá-la a fazer uma Salvaguarda de Constituição (CD 8 + Bônus de Proficiência + seu Modificador de Força/Destreza). Se falhar, a criatura recebe a condição Caído.',
    appUsage:
      'No app, ao acertar um golpe com armas como Alabarda, Machado de Batalha ou Lança, o sistema rola automaticamente a salvaguarda de CON do inimigo. Se ele falhar, o status **Caído** é adicionado ao monstro no grid, concedendo Vantagem a todos os seus ataques corpo a corpo subsequentes.',
    highlight: 'Inimigo faz Salvaguarda de CON; se falhar, fica Caído no grid.'
  },
  {
    id: 'rule-mastery-graze',
    title: 'Maestria: Arranhão (Garantido)',
    subtitle: 'Dano residual mesmo quando o ataque erra',
    category: 'Maestria com Armas',
    icon: '🩸',
    tags: ['Dano no Erro', 'Espadão', 'Glaive'],
    description:
      'Se a sua jogada de ataque errar o alvo, você ainda causa dano à criatura igual ao modificador do atributo que usou para fazer a jogada de ataque (mínimo de 1 de dano). Este dano não pode ser aumentado de nenhuma outra forma.',
    appUsage:
      'Com armas como Espadão e Glaive: se a rolagem do d20 + bônus for menor que a CA do defensor, o app calcula seu mod. de Força e aplica esse dano garantido diretamente aos PV do monstro com a notificação *[GARANTIDO / ARRANHÃO]* no log de combate.',
    highlight: 'Causa dano do mod. de atributo ao alvo mesmo errando a rolagem de ataque.'
  },
  {
    id: 'rule-mastery-vex',
    title: 'Maestria: Afligir',
    subtitle: 'Vantagem na próxima jogada de ataque',
    category: 'Maestria com Armas',
    icon: '🎯',
    tags: ['Vantagem Consecutiva', 'Espada Curta', 'Florete'],
    description:
      'Ao acertar uma criatura e causar dano, você ganha Vantagem na sua próxima jogada de ataque contra essa mesma criatura antes do final do seu próximo turno.',
    appUsage:
      'Ao acertar com Espada Curta, Florete ou Dardos, o alvo recebe o marcador de status **Afligido**. Sua próxima jogada de ataque contra ele ativará a rolagem de 2d20 com Vantagem automaticamente.',
    highlight: 'Garante Vantagem no seu próximo ataque contra o mesmo alvo.'
  },
  {
    id: 'rule-mastery-sap',
    title: 'Maestria: Enfraquecer',
    subtitle: 'Desvantagem no próximo ataque do oponente',
    category: 'Maestria com Armas',
    icon: '🛡️',
    tags: ['Defesa', 'Desvantagem no Inimigo', 'Espada Longa', 'Maça'],
    description:
      'Ao acertar uma criatura com esta arma, você desestabiliza a postura dela: o alvo tem Desvantagem na próxima jogada de ataque que realizar antes do início do seu próximo turno.',
    appUsage:
      'Ao golpear com Espada Longa, Mangual ou Clava, o sistema adiciona a condição **Enfraquecido** ao inimigo. Quando o monstro tentar contra-atacar no turno dele, a rolagem do monstro será feita com Desvantagem automática.',
    highlight: 'Impõe Desvantagem na próxima jogada de ataque que o inimigo realizar.'
  },
  {
    id: 'rule-mastery-push',
    title: 'Maestria: Empurrar',
    subtitle: 'Repulsão física de 3 metros na grade',
    category: 'Maestria com Armas',
    icon: '💨',
    tags: ['Movimento Forçado', 'Grade Tática', 'Pique', 'Martelo de Guerra'],
    description:
      'Ao acertar uma criatura de tamanho Grande ou menor, você pode empurrá-la até 3 metros (10 pés / 2 células) em linha reta para longe de você sem necessidade de teste de salvaguarda.',
    appUsage:
      'Ao acertar com Martelo de Guerra, Pique ou Bordão Pesado, o motor de física do grid desloca o token do inimigo até 2 células para trás em linha reta, respeitando colisões com paredes, obstáculos e outras criaturas.',
    highlight: 'Empurra o alvo 2 células para trás em linha reta na grade da arena.'
  },
  {
    id: 'rule-mastery-others',
    title: 'Maestria: Trespassar, Lentidão e Ágil',
    subtitle: 'Outras propriedades marciais avançadas',
    category: 'Maestria com Armas',
    icon: '🪓',
    tags: ['Ataque em Área', 'Redução de Movimento', 'Arma Secundária'],
    description:
      '• **Trespassar (Machado Grande)**: Ao acertar uma criatura, você pode realizar um ataque adicional contra outra criatura adjacente a até 1,5m.\n• **Lentidão (Chicote, Besta Pesada)**: Ao acertar e causar dano, reduz o deslocamento do alvo em 3 metros (2 células) até o próximo turno dele.\n• **Ágil (Adaga, Cimitarra)**: Permite fazer o ataque extra da propriedade Leve como parte da Ação Atacar, liberando sua Ação Bônus para outras tarefas.',
    appUsage:
      'Todos os efeitos de redução de células, cálculo de armas leves e alcance são controlados e validados pelo motor da arena tática.',
    highlight: 'Trespassar ataca alvo adjacente | Lentidão reduz 2 células | Ágil preserva a Ação Bônus.'
  },

  // ==========================================
  // 6. COBERTURA, TERRENO & LINHA DE VISÃO
  // ==========================================
  {
    id: 'rule-cover-mechanics',
    title: 'Regras de Cobertura',
    subtitle: 'Meia Cobertura, Três Quartos e Cobertura Total',
    category: 'Posicionamento & Cobertura',
    icon: '🧱',
    tags: ['Linha de Visão', 'Bônus de CA', 'Bresenham Raycast'],
    description:
      'Obstáculos entre você e o atacante dificultam o acerto:\n• **Meia Cobertura (+2 CA e +2 DES)**: O obstáculo cobre pelo menos metade do alvo (troncos caídos, muretas baixas ou uma criatura no caminho).\n• **Três Quartos de Cobertura (+5 CA e +5 DES)**: O obstáculo cobre cerca de 75% do alvo (árvores densas, rochas grandes, frestas de flechas ou 2+ criaturas no caminho).\n• **Cobertura Total**: O alvo está completamente escondido por paredes sólidas e não pode ser mirado diretamente por ataques ou magias direcionadas.',
    appUsage:
      'O app possui um algoritmo de traçado de raios (Bresenham) integrado à grade da arena:\n• Ele calcula em tempo real cada obstáculo (árvore, rocha, monólito, coluna, parede) e criatura entre o atacante e o defensor.\n• O bônus defensivo (+2 ou +5 na CA) é somado instantaneamente na fórmula de acerto e indicado no log de combate como *[Meia Cobertura (+2 CA)]* ou *[Três Quartos (+5 CA)]*.',
    highlight: 'Calculado em tempo real por traçado de raios entre as células do grid.',
    effects: [
      { title: 'Meia Cobertura', description: '+2 de bônus na CA e em Salvaguardas de Destreza.' },
      { title: 'Três Quartos de Cobertura', description: '+5 de bônus na CA e em Salvaguardas de Destreza.' },
      { title: 'Cobertura Total', description: 'Impossível mirar diretamente; bloqueia ataques e magias direcionadas.' }
    ]
  },
  {
    id: 'rule-difficult-terrain',
    title: 'Terreno Difícil & Custo de Movimento',
    subtitle: 'Pântanos, escombros e vegetação densa',
    category: 'Posicionamento & Cobertura',
    icon: '🌿',
    tags: ['Grid A*', 'Pântano', 'Custo Dobrado'],
    description:
      'Mover-se por terreno difícil custa o dobro do deslocamento normal: cada 1,5m (1 célula) percorrido em terreno difícil consome 3 metros (2 células de movimento) do seu medidor de deslocamento.',
    appUsage:
      'No mapa do jogo:\n• Pântanos, água profunda, escombros e lodaçais são marcados como terreno difícil.\n• O sistema de pathfinding A* calcula a rota ideal e desconta automaticamente o custo duplicado de cada célula ao movimentar o personagem pelo grid.',
    highlight: 'Custa 2 células de movimento para cada 1 célula percorrida.'
  },

  // ==========================================
  // 7. ILUMINAÇÃO, SENTIDOS & VISÃO
  // ==========================================
  {
    id: 'rule-lighting-and-senses',
    title: 'Iluminação, Visão no Escuro & Tochas',
    subtitle: 'Luz Plena, Penumbra, Escuridão e Luta às Cegas',
    category: 'Iluminação & Sentidos',
    icon: '🕯️',
    tags: ['Névoa de Guerra', 'Visão no Escuro', 'Tochas'],
    description:
      '• **Luz Plena**: Visão normal sem penalidades.\n• **Penumbra (Levemente Obscurecido)**: Desvantagem em testes de Sabedoria (Percepção) baseados na visão.\n• **Escuridão Total (Fortemente Obscurecido)**: Criaturas sem visão especial ficam efetivamente cegas ao tentar enxergar na área.\n• **Visão no Escuro**: Enxerga na escuridão até o alcance (geralmente 18m / 60 pés) como se fosse penumbra.\n• **Sentido Cegante (Luta às Cegas)**: Detecta alvos sem depender de visão em um raio próximo.',
    appUsage:
      'Na arena tática:\n• Masmorras e noites possuem iluminação dinâmica e névoa de guerra.\n• Tochas no mapa e tochas equipadas iluminam um raio ao redor.\n• Atacar um monstro fora do raio de visão e sem Visão no Escuro impõe Desvantagem automática ou falha imediata por impossibilidade de ver o alvo.',
    highlight: 'Tochas e Visão no Escuro evitam desvantagens em masmorras e combates noturnos.'
  },

  // ==========================================
  // 8. AMBIENTE & CLIMA
  // ==========================================
  {
    id: 'rule-weather-effects',
    title: 'Clima & Efeitos Atmosféricos Dinâmicos',
    subtitle: 'Chuva, tempestades de areia, vento e neblina',
    category: 'Ambiente & Clima',
    icon: '🌧️',
    tags: ['Chuva', 'Vento Forte', 'Tempestade', 'Neblina'],
    description:
      'Condições meteorológicas extremas afetam a física dos projéteis e a visibilidade dos combatentes em áreas abertas (ambientes subterrâneos como Cavernas e Masmorras são protegidos de clima externo).',
    appUsage:
      'O motor de clima do app renderiza partículas visuais e aplica regras mecânicas automáticas:\n• **Vento Forte**: Impõe Desvantagem em ataques com projéteis a mais de 4 células de distância.\n• **Tempestade Severa**: Impõe Desvantagem em projéteis além de 3 células.\n• **Neblina Densa**: Obscurecimento pesado que impede ataques à distância a alvos a mais de 6 células (9 metros).\n• Cavernas e masmorras ignoram efeitos climáticos externos.',
    highlight: 'Afeta projéteis e visibilidade no exterior; ambientes fechados são imunes.'
  },

  // ==========================================
  // 9. MAGIAS & CONJURAÇÃO
  // ==========================================
  {
    id: 'rule-spellcasting-and-slots',
    title: 'Espaços de Magia',
    subtitle: 'Recurso diário para conjuração',
    category: 'Magias & Conjuração',
    icon: '✨',
    tags: ['Grimório', 'Slots por Círculo', 'Descanso Longo'],
    description:
      'Conjuradores possuem uma reserva de Espaços de Magia divididos por círculos (1º ao 9º). Conjurar uma magia consome um espaço de círculo igual ou superior ao da magia. Truques (Nível 0) não gastam espaços e podem ser usados à vontade. Todos os espaços são restaurados ao término de um Descanso Longo.',
    appUsage:
      'No app:\n• A aba **Magias** na Ficha do Personagem organiza suas magias conhecidas/preparadas por círculo.\n• Em combate, ao clicar para lançar uma magia, o espaço correspondente é gasto automaticamente.\n• Se os espaços daquele círculo acabarem, o botão fica desativado até você realizar um Descanso Longo.',
    highlight: 'Slots são descontados na conjuração e recuperados em Descanso Longo.'
  },
  {
    id: 'rule-concentration',
    title: 'Concentração em Magias',
    subtitle: 'Manutenção de feitiços contínuos e teste ao levar dano',
    category: 'Magias & Conjuração',
    icon: '🔮',
    tags: ['Salvaguarda de CON', '1 Magia Ativa', 'Dano'],
    description:
      'Você só pode manter a concentração em uma única magia por vez. Se conjurar outra magia que exija concentração, a anterior encerra imediatamente. Ao sofrer dano enquanto concentrado, você deve fazer uma Salvaguarda de Constituição (CD 10 ou metade do dano sofrido, o que for maior). Ficar Incapacitado encerra a concentração automaticamente.',
    appUsage:
      'Quando seu herói conjura uma magia de concentração no app:\n• O ícone da magia ativa surge no painel de efeitos do personagem.\n• Ao sofrer qualquer dano na arena, o sistema roda automaticamente a Salvaguarda de CON vs a CD calculada. Se falhar, o efeito da magia é dissipado e o registro é adicionado ao log.',
    highlight: 'CD = 10 ou metade do dano sofrido; rolagem de CON automática ao receber dano.'
  },

  // ==========================================
  // 10. PERÍCIAS & TESTES DE ATRIBUTO
  // ==========================================
  {
    id: 'rule-skills-and-attributes',
    title: 'Perícias & Testes de Atributo',
    subtitle: 'Rolagens de d20 + Modificador + Bônus de Proficiência',
    category: 'Perícias & Atributos',
    icon: '📊',
    tags: ['18 Perícias', 'Bônus de Proficiência', 'Especialização'],
    description:
      'Existem 6 atributos principais (Força, Destreza, Constituição, Inteligência, Sabedoria e Carisma) e 18 perícias associadas. Quando o mestre ou o jogo solicita um teste, rola-se 1d20 + Modificador do Atributo. Se o personagem tiver Proficiência na perícia, soma o Bônus de Proficiência (PB). Se tiver Especialização, soma o dobro do PB.',
    appUsage:
      'Na aba **Ficha** do personagem:\n• Todas as perícias são listadas com seus valores finais calculados automaticamente com base na raça, classe, antecedentes e talentos.\n• Você pode clicar sobre qualquer perícia para disparar um teste de d20 instantâneo no log de rolagens com a discriminação completa do cálculo.',
    highlight: 'Cálculo automatizado na ficha com suporte a Proficiência e Especialização.'
  },

  // ==========================================
  // 11. CONDIÇÕES DE STATUS
  // ==========================================
  ...Object.values(CONDITIONS_5E_REFERENCE).map(cond => ({
    id: `rule-cond-${cond.id}`,
    title: `${cond.icon} ${cond.name}`,
    subtitle: `Condição de Status oficial`,
    category: 'Condições de Status',
    icon: cond.icon,
    tags: ['Condição', cond.isCumulative ? 'Cumulativo' : 'Status'],
    description: `${cond.summary}\n${cond.effects.map(e => `• **${e.title}**: ${e.description}`).join('\n')}`,
    appUsage: getConditionAppUsage(cond.id, cond.name),
    highlight: cond.effects[0]?.title ? `${cond.effects[0].title}: ${cond.effects[0].description}` : 'Afeta jogadas e movimentação.',
    effects: cond.effects
  }))
];

function getConditionAppUsage(id: string, name: string): string {
  switch (id) {
    case 'blinded':
      return 'No app: Impõe Desvantagem automática em todos os seus ataques e concede Vantagem para qualquer inimigo que te atacar na arena. Testes que exijam visão falham automaticamente.';
    case 'charmed':
      return 'No app: O alvo encantado não pode selecionar o encantador como alvo de ataques ou magias prejudiciais.';
    case 'deafened':
      return 'No app: O personagem falha automaticamente em testes de Percepção auditiva.';
    case 'exhaustion':
      return 'No app: Cada nível de exaustão reduz todas as suas rolagens de d20 (ataque, testes e salvaguardas) em -2 por nível e diminui 1 célula (1,5m) do seu deslocamento. Acumular 6 níveis causa morte imediata. Um Descanso Longo remove 1 nível.';
    case 'frightened':
      return 'No app: Impõe Desvantagem em testes e ataques enquanto o monstro temido estiver no seu campo de visão e impede o herói de caminhar em direção a ele no grid.';
    case 'grappled':
      return 'No app: O deslocamento no grid cai para 0 células. Seus ataques contra alvos diferentes do agarrador sofrem Desvantagem. Use sua ação para tentar escapar com Atletismo ou Acrobacia.';
    case 'incapacitated':
      return 'No app: Bloqueia todos os botões de Ações, Ações Bônus e Reações, e encerra imediatamente qualquer magia de Concentração ativa.';
    case 'invisible':
      return 'No app: Concede Vantagem em todas as suas jogadas de ataque e impõe Desvantagem a todos os ataques feitos contra você na arena.';
    case 'paralyzed':
      return 'No app: Fica Incapacitado com deslocamento 0. Falha automática em salvaguardas de Força e Destreza. Qualquer ataque corpo a corpo recebido a 1 célula adjacente torna-se um Acerto Crítico automático!';
    case 'petrified':
      return 'No app: Personagem transformado em pedra: Incapacitado, deslocamento 0, resistência a todos os tipos de dano e imunidade a veneno. Falha automática em FOR e DES.';
    case 'poisoned':
      return 'No app: Aplica Desvantagem em todas as jogadas de ataque e testes de atributo enquanto a intoxicação durar.';
    case 'prone':
      return 'No app: Mover-se custa o dobro (rastejar). Ataques feitos pelo personagem caído têm Desvantagem. Ataques recebidos de inimigos adjacentes (1 célula) têm Vantagem; ataques recebidos de longe têm Desvantagem. Custa metade do deslocamento para levantar.';
    case 'restrained':
      return 'No app: Deslocamento cai para 0 células. Seus ataques têm Desvantagem e ataques contra você têm Vantagem. Desvantagem em salvaguardas de Destreza.';
    case 'stunned':
      return 'No app: Personagem Incapacitado que não pode se mover. Ataques contra ele têm Vantagem e falha automaticamente em salvaguardas de Força e Destreza.';
    case 'unconscious':
      return 'No app: O personagem fica Incapacitado e Caído. Ataques a 1 célula de distância são Críticos automáticos. Inicia as rolagens de Salvaguardas contra a Morte no início de cada turno.';
    case 'conditions-overview':
    default:
      return `No app: As condições são exibidas como emblemas visuais no token do personagem e na barra de status superior, alterando as rolagens de combate e os limites de movimento em tempo real.`;
  }
}
