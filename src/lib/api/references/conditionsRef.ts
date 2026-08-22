export interface ConditionRuleInfo {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  summary: string;
  effects: {
    title: string;
    description: string;
  }[];
  durationRule?: string;
  counters?: string;
  isCumulative?: boolean;
}

export const CONDITIONS_5E_REFERENCE: Record<string, ConditionRuleInfo> = {
  'Condições': {
    id: 'conditions-overview',
    name: 'Visão Geral de Condições',
    nameEn: 'Conditions Overview',
    icon: '📜',
    summary: 'Muitos efeitos impõem uma condição, um estado temporário que altera as capacidades do receptor.',
    effects: [
      {
        title: 'Definição e Efeitos',
        description: 'A definição de uma condição especifica o que acontece com o receptor enquanto afetado por ela, e algumas condições aplicam outras condições.'
      },
      {
        title: 'Duração',
        description: 'Uma condição dura pelo tempo especificado pelo efeito que a impôs ou até que a condição seja combatida/anulada (a condição Caído é combatida levantando-se, por exemplo).'
      },
      {
        title: 'Condições Não se Acumulam',
        description: 'Se múltiplos efeitos impuserem a mesma condição em você, cada instância tem sua própria duração, mas os efeitos da condição não pioram. Ou você tem a condição ou não tem. A condição Exaustão é uma exceção; seus efeitos pioram se você já a possui e a recebe novamente.'
      }
    ]
  },
  'Cego': {
    id: 'blinded',
    name: 'Cego',
    nameEn: 'Blinded',
    icon: '👁️‍🗨️',
    summary: 'Enquanto tiver a condição Cego, você experimenta os seguintes efeitos.',
    effects: [
      {
        title: 'Não Pode Enxergar',
        description: 'Você não pode enxergar e falha automaticamente em qualquer teste de atributo que exija visão.'
      },
      {
        title: 'Ataques Afetados',
        description: 'Jogadas de ataque contra você têm Vantagem, e as suas jogadas de ataque têm Desvantagem.'
      }
    ]
  },
  'Encantado': {
    id: 'charmed',
    name: 'Encantado / Enfeitiçado',
    nameEn: 'Charmed',
    icon: '💖',
    summary: 'Enquanto tiver a condição Encantado, você experimenta os seguintes efeitos.',
    effects: [
      {
        title: 'Não Pode Prejudicar o Encantador',
        description: 'Você não pode atacar o encantador ou mirá-lo com habilidades ou efeitos mágicos nocivos.'
      },
      {
        title: 'Vantagem Social',
        description: 'O encantador tem Vantagem em qualquer teste de atributo para interagir socialmente com você.'
      }
    ]
  },
  'Surdo': {
    id: 'deafened',
    name: 'Surdo',
    nameEn: 'Deafened',
    icon: '🔇',
    summary: 'Enquanto tiver a condição Surdo, você experimenta o seguinte efeito.',
    effects: [
      {
        title: 'Não Pode Ouvir',
        description: 'Você não pode ouvir e falha automaticamente em qualquer teste de atributo que exija audição.'
      }
    ]
  },
  'Exaustão': {
    id: 'exhaustion',
    name: 'Exaustão',
    nameEn: 'Exhaustion',
    icon: '🥵',
    summary: 'Enquanto tiver a condição Exaustão, você experimenta os seguintes efeitos.',
    isCumulative: true,
    effects: [
      {
        title: 'Níveis de Exaustão',
        description: 'Esta condição é cumulativa. Cada vez que a recebe, você ganha 1 nível de Exaustão. Você morre se seu nível de Exaustão for 6.'
      },
      {
        title: 'Testes de D20 Afetados',
        description: 'Quando você faz um Teste de D20 (ataque, teste de atributo ou salvaguarda), o resultado da rolagem é reduzido em 2 vezes o seu nível de Exaustão.'
      },
      {
        title: 'Deslocamento Reduzido',
        description: 'Seu Deslocamento é reduzido em um número de pés igual a 5 vezes seu nível de Exaustão (1 célula de grid de 1,5m por nível).'
      },
      {
        title: 'Removendo Níveis de Exaustão',
        description: 'Terminar um Descanso Longo remove 1 dos seus níveis de Exaustão. Quando seu nível de Exaustão atinge 0, a condição termina.'
      }
    ]
  },
  'Amedrontado': {
    id: 'frightened',
    name: 'Amedrontado',
    nameEn: 'Frightened',
    icon: '😱',
    summary: 'Enquanto tiver a condição Amedrontado, você experimenta os seguintes efeitos.',
    effects: [
      {
        title: 'Testes de Atributo e Ataques Afetados',
        description: 'Você tem Desvantagem em testes de atributo e jogadas de ataque enquanto a fonte do medo estiver dentro da sua linha de visão.'
      },
      {
        title: 'Não Pode se Aproximar',
        description: 'Você não pode se mover voluntariamente para mais perto da fonte do seu medo.'
      }
    ]
  },
  'Agarrado': {
    id: 'grappled',
    name: 'Agarrado',
    nameEn: 'Grappled',
    icon: '✊',
    summary: 'Enquanto tiver a condição Agarrado, você experimenta os seguintes efeitos.',
    effects: [
      {
        title: 'Deslocamento 0',
        description: 'Seu Deslocamento é 0 e não pode aumentar.'
      },
      {
        title: 'Ataques Afetados',
        description: 'Você tem Desvantagem em jogadas de ataque contra qualquer alvo que não seja quem está te agarrando.'
      },
      {
        title: 'Movível',
        description: 'O agarrador pode arrastar ou carregar você ao se mover, mas cada pé de movimento custa 1 pé extra, a menos que você seja Miúdo ou duas ou mais categorias de tamanho menor que ele.'
      },
      {
        title: 'Escapar',
        description: 'Você pode usar uma ação para fazer um teste de Força (Atletismo) ou Destreza (Acrobacia) contra a CD de escape do agarrador.'
      }
    ]
  },
  'Incapacitado': {
    id: 'incapacitated',
    name: 'Incapacitado',
    nameEn: 'Incapacitated',
    icon: '🌀',
    summary: 'Enquanto tiver a condição Incapacitado, você experimenta os seguintes efeitos.',
    effects: [
      {
        title: 'Inativo',
        description: 'Você não pode realizar nenhuma Ação, Ação Bônus ou Reação.'
      },
      {
        title: 'Sem Concentração',
        description: 'Sua Concentração é imediatamente encerrada.'
      },
      {
        title: 'Sem Falar',
        description: 'Você não pode falar.'
      },
      {
        title: 'Surpreendido',
        description: 'Se você estiver Incapacitado quando rolar Iniciativa, você tem Desvantagem na rolagem.'
      }
    ]
  },
  'Invisível': {
    id: 'invisible',
    name: 'Invisível',
    nameEn: 'Invisible',
    icon: '👻',
    summary: 'Enquanto tiver a condição Invisível, você experimenta os seguintes efeitos.',
    effects: [
      {
        title: 'Surpresa',
        description: 'Se você estiver Invisível quando rolar Iniciativa, você tem Vantagem na rolagem.'
      },
      {
        title: 'Oculto',
        description: 'Você não é afetado por nenhum efeito que exija que seu alvo seja visto, a menos que o criador do efeito possa de alguma forma vê-lo. Qualquer equipamento que esteja vestindo ou carregando também fica oculto.'
      },
      {
        title: 'Ataques Afetados',
        description: 'Jogadas de ataque contra você têm Desvantagem, e as suas jogadas de ataque têm Vantagem. Se uma criatura puder de alguma forma vê-lo, você não ganha este benefício contra ela.'
      }
    ]
  },
  'Paralisado': {
    id: 'paralyzed',
    name: 'Paralisado',
    nameEn: 'Paralyzed',
    icon: '⚡',
    summary: 'Enquanto tiver a condição Paralisado, você experimenta os seguintes efeitos.',
    effects: [
      {
        title: 'Incapacitado',
        description: 'Você tem a condição Incapacitado.'
      },
      {
        title: 'Deslocamento 0',
        description: 'Seu Deslocamento é 0 e não pode aumentar.'
      },
      {
        title: 'Salvaguardas Afetadas',
        description: 'Você falha automaticamente em Salvaguardas de Força e Destreza.'
      },
      {
        title: 'Ataques Afetados',
        description: 'Jogadas de ataque contra você têm Vantagem.'
      },
      {
        title: 'Acertos Críticos Automáticos',
        description: 'Qualquer jogada de ataque que acerte você é um Acerto Crítico se o atacante estiver a até 1,5 metro (5 pés) de você.'
      }
    ]
  },
  'Petrificado': {
    id: 'petrified',
    name: 'Petrificado',
    nameEn: 'Petrified',
    icon: '🗿',
    summary: 'Enquanto tiver a condição Petrificado, você experimenta os seguintes efeitos.',
    effects: [
      {
        title: 'Transformado em Substância Inanimada',
        description: 'Você é transformado, junto com quaisquer objetos não mágicos que estiver vestindo ou carregando, em uma substância sólida inanimada (geralmente pedra). Seu peso é multiplicado por dez e você para de envelhecer.'
      },
      {
        title: 'Incapacitado',
        description: 'Você tem a condição Incapacitado.'
      },
      {
        title: 'Deslocamento 0',
        description: 'Seu Deslocamento é 0 e não pode aumentar.'
      },
      {
        title: 'Ataques Afetados',
        description: 'Jogadas de ataque contra você têm Vantagem.'
      },
      {
        title: 'Salvaguardas Afetadas',
        description: 'Você falha automaticamente em Salvaguardas de Força e Destreza.'
      },
      {
        title: 'Resistir a Dano',
        description: 'Você tem Resistência a todos os tipos de dano.'
      },
      {
        title: 'Imunidade a Veneno',
        description: 'Você tem Imunidade à condição Envenenado (e ao dano de veneno).'
      }
    ]
  },
  'Envenenado': {
    id: 'poisoned',
    name: 'Envenenado',
    nameEn: 'Poisoned',
    icon: '🧪',
    summary: 'Enquanto tiver a condição Envenenado, você experimenta o seguinte efeito.',
    effects: [
      {
        title: 'Testes de Atributo e Ataques Afetados',
        description: 'Você tem Desvantagem em jogadas de ataque e testes de atributo.'
      }
    ]
  },
  'Caído': {
    id: 'prone',
    name: 'Caído',
    nameEn: 'Prone',
    icon: '🛌',
    summary: 'Enquanto tiver a condição Caído, você experimenta os seguintes efeitos.',
    effects: [
      {
        title: 'Movimento Restrito',
        description: 'Suas únicas opções de movimento são rastejar ou gastar uma quantidade de movimento igual a metade do seu Deslocamento (arredondado para baixo) para se levantar e encerrar a condição. Se seu Deslocamento for 0, você não pode se levantar.'
      },
      {
        title: 'Ataques Afetados',
        description: 'Você tem Desvantagem em jogadas de ataque. Uma jogada de ataque contra você tem Vantagem se o atacante estiver a até 1,5 metro (5 pés) de você. Caso contrário, aquela jogada de ataque tem Desvantagem.'
      }
    ]
  },
  'Contido': {
    id: 'restrained',
    name: 'Contido',
    nameEn: 'Restrained',
    icon: '🕸️',
    summary: 'Enquanto tiver a condição Contido, você experimenta os seguintes efeitos.',
    effects: [
      {
        title: 'Deslocamento 0',
        description: 'Seu Deslocamento é 0 e não pode aumentar.'
      },
      {
        title: 'Ataques Afetados',
        description: 'Jogadas de ataque contra você têm Vantagem, e as suas jogadas de ataque têm Desvantagem.'
      },
      {
        title: 'Salvaguardas Afetadas',
        description: 'Você tem Desvantagem em salvaguardas de Destreza.'
      }
    ]
  },
  'Atordoado': {
    id: 'stunned',
    name: 'Atordoado',
    nameEn: 'Stunned',
    icon: '💫',
    summary: 'Enquanto tiver a condição Atordoado, você experimenta os seguintes efeitos.',
    effects: [
      {
        title: 'Incapacitado',
        description: 'Você tem a condição Incapacitado.'
      },
      {
        title: 'Salvaguardas Afetadas',
        description: 'Você falha automaticamente em Salvaguardas de Força e Destreza.'
      },
      {
        title: 'Ataques Afetados',
        description: 'Jogadas de ataque contra você têm Vantagem.'
      }
    ]
  },
  'Inconsciente': {
    id: 'unconscious',
    name: 'Inconsciente',
    nameEn: 'Unconscious',
    icon: '💤',
    summary: 'Enquanto tiver a condição Inconsciente, você experimenta os seguintes efeitos.',
    effects: [
      {
        title: 'Inerte',
        description: 'Você tem as condições Incapacitado e Caído, e larga o que estiver segurando. Quando esta condição termina, você permanece Caído.'
      },
      {
        title: 'Deslocamento 0',
        description: 'Seu Deslocamento é 0 e não pode aumentar.'
      },
      {
        title: 'Ataques Afetados',
        description: 'Jogadas de ataque contra você têm Vantagem.'
      },
      {
        title: 'Salvaguardas Afetadas',
        description: 'Você falha automaticamente em Salvaguardas de Força e Destreza.'
      },
      {
        title: 'Acertos Críticos Automáticos',
        description: 'Qualquer jogada de ataque que acerte você é um Acerto Crítico se o atacante estiver a até 1,5 metro (5 pés) de você.'
      },
      {
        title: 'Inconsciente do Redor',
        description: 'Você não tem consciência do seu redor.'
      }
    ]
  }
};
