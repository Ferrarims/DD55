import { supabase, isSupabaseConfigured } from './supabase';

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
    title: "Raças Básicas do D&D 2024",
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
    title: "Talentos (Feats) Básicos",
    description: "Banco de talentos para customização inicial do herói, incluindo talentos de Origem e Gerais.",
    category: "Talentos",
    completed: true,
    started: true,
    display_order: 3
  },
  {
    id: "a1b2c3d4-0004-4000-a000-000000000004",
    title: "Antecedentes (Backgrounds)",
    description: "Configuração de antecedentes que distribuem bônus de habilidades, perícias proficientes e vinculação de talentos iniciais.",
    category: "Antecedentes",
    completed: true,
    started: true,
    display_order: 4
  },
  {
    id: "a1b2c3d4-0005-4000-a000-000000000005",
    title: "Sistema de Magias & Preparation",
    description: "Painel interativo para busca de magias de nível 0 a 9, filtros por classe/nível e interface para preparar magias na ficha.",
    category: "Magias",
    completed: true,
    started: true,
    display_order: 5
  },
  {
    id: "a1b2c3d4-0006-4000-a000-000000000006",
    title: "Armas, Equipamentos & Weapon Mastery",
    description: "Catálogo completo de equipamentos, armas e armaduras com seus preços em GP, pesos e propriedades de maestria de arma aplicadas.",
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
  // Planejadas
  {
    id: "a1b2c3d4-0011-4000-a000-000000000011",
    title: "Regras de Descanso Curto & Longo",
    description: "Implementar ações para descanso curto (usar Hit Dice para curar HP) e descanso longo (recuperar todos os PVs, slots de magias e metade dos Dados de Vida).",
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
    title: "Regras de Exaustão de D&D 2024",
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

const LOCAL_STORAGE_KEY = 'dnd_implementations_tasks';

// Inicializa o LocalStorage se necessário
function getLocalTasks(): ImplementationTask[] {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_IMPLEMENTATIONS));
    return INITIAL_IMPLEMENTATIONS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_IMPLEMENTATIONS;
  }
}

function saveLocalTasks(tasks: ImplementationTask[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
}

/**
 * Busca todas as implementações
 * Retorna { data, fromDb: boolean, error?: string }
 */
export async function fetchImplementationsFromDb(): Promise<{ data: ImplementationTask[]; fromDb: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { data: getLocalTasks(), fromDb: false };
  }

  try {
    const { data, error } = await (supabase
      .from('implementations' as any) as any)
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Erro ao consultar a tabela public.implementations no Supabase, usando fallback local:', error.message);
      return { data: getLocalTasks(), fromDb: false, error: error.message };
    }

    if (!data || data.length === 0) {
      // Se a tabela estiver vazia, retorna os locais
      return { data: getLocalTasks(), fromDb: true };
    }

    // Atualiza o local storage para manter em sincronia
    const mapped = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description || '',
      category: item.category || 'Geral',
      completed: !!item.completed,
      started: item.started !== undefined ? !!item.started : !!item.completed,
      display_order: typeof item.display_order === 'number' ? item.display_order : 0,
      created_at: item.created_at
    }));
    saveLocalTasks(mapped);

    return { data: mapped, fromDb: true };
  } catch (err: any) {
    console.warn('Erro genérico ao buscar implementações no banco, usando fallback local:', err);
    return { data: getLocalTasks(), fromDb: false, error: err.message || String(err) };
  }
}

/**
 * Cria uma nova implementação
 */
export async function createImplementationInDb(task: Omit<ImplementationTask, 'id'>): Promise<ImplementationTask> {
  const newLocalId = crypto.randomUUID();
  const newLocalTask: ImplementationTask = {
    ...task,
    id: newLocalId
  };

  // Salva localmente primeiro
  const localList = getLocalTasks();
  localList.push(newLocalTask);
  saveLocalTasks(localList);

  if (!isSupabaseConfigured) {
    return newLocalTask;
  }

  try {
    const { data, error } = await (supabase
      .from('implementations' as any) as any)
      .insert([
        {
          title: task.title,
          description: task.description,
          category: task.category,
          completed: task.completed,
          started: task.started,
          display_order: task.display_order
        }
      ])
      .select();

    if (error) {
      console.warn('Erro ao inserir no Supabase, mantido apenas localmente:', error.message);
      return newLocalTask;
    }

    if (data && data[0]) {
      const item = data[0];
      const result: ImplementationTask = {
        id: item.id,
        title: item.title,
        description: item.description || '',
        category: item.category || 'Geral',
        completed: !!item.completed,
        started: item.started !== undefined ? !!item.started : !!item.completed,
        display_order: item.display_order,
        created_at: item.created_at
      };
      
      // Atualiza o item correspondente no localStorage com o ID real do banco
      const updatedLocalList = getLocalTasks().map(t => t.id === newLocalId ? result : t);
      saveLocalTasks(updatedLocalList);

      return result;
    }
  } catch (err) {
    console.warn('Falha na inserção no Supabase, mantendo estado local.', err);
  }

  return newLocalTask;
}

/**
 * Atualiza uma implementação existente
 */
export async function updateImplementationInDb(id: string, updates: Partial<Omit<ImplementationTask, 'id'>>): Promise<void> {
  // Atualiza localmente
  const localList = getLocalTasks();
  const index = localList.findIndex(t => t.id === id);
  if (index !== -1) {
    localList[index] = { ...localList[index], ...updates };
    saveLocalTasks(localList);
  }

  if (!isSupabaseConfigured) {
    return;
  }

  try {
    // Se for um ID do localStorage (não-UUID do banco em caso de fallback histórico, mas agora geramos UUID sempre), 
    // ele pode falhar se não estiver na tabela do banco, o que é tratado normalmente
    const { error } = await (supabase
      .from('implementations' as any) as any)
      .update({
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.category !== undefined && { category: updates.category }),
        ...(updates.completed !== undefined && { completed: updates.completed }),
        ...(updates.started !== undefined && { started: updates.started }),
        ...(updates.display_order !== undefined && { display_order: updates.display_order })
      })
      .eq('id', id);

    if (error) {
      console.warn(`Erro ao atualizar ID ${id} no Supabase, atualizado apenas localmente:`, error.message);
    }
  } catch (err) {
    console.warn(`Erro de conexão ao atualizar ID ${id} no Supabase.`, err);
  }
}

/**
 * Exclui uma implementação
 */
export async function deleteImplementationInDb(id: string): Promise<void> {
  // Deleta localmente
  const localList = getLocalTasks();
  const filtered = localList.filter(t => t.id !== id);
  saveLocalTasks(filtered);

  if (!isSupabaseConfigured) {
    return;
  }

  try {
    const { error } = await (supabase
      .from('implementations' as any) as any)
      .delete()
      .eq('id', id);

    if (error) {
      console.warn(`Erro ao deletar ID ${id} no Supabase, removido apenas localmente:`, error.message);
    }
  } catch (err) {
    console.warn(`Erro de conexão ao deletar ID ${id} no Supabase.`, err);
  }
}

/**
 * Reorganiza as ordens das implementações:
 * - Define display_order = 0 para tarefas concluídas (apagando a numeração de ordem delas)
 * - Renumera as tarefas não-concluídas (pendentes e iniciadas) com display_order iniciando do 1 em ordem crescente (1, 2, 3, ...)
 */
export async function reorganizeOrdersInDb(tasks: ImplementationTask[]): Promise<ImplementationTask[]> {
  // Separa as não concluídas preservando a ordem relativa atual
  const pendingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => a.display_order - b.display_order);

  const completedTasks = tasks.filter(t => t.completed);

  const updatedTasks: ImplementationTask[] = [];

  // Renumera as pendentes a partir de 1 em ordem crescente
  pendingTasks.forEach((task, index) => {
    updatedTasks.push({
      ...task,
      display_order: index + 1
    });
  });

  // Zera / limpa a ordem das tarefas concluídas
  completedTasks.forEach(task => {
    updatedTasks.push({
      ...task,
      display_order: 0
    });
  });

  // Salva no localStorage
  saveLocalTasks(updatedTasks);

  // Se Supabase estiver configurado, sincroniza no banco as ordens que mudaram
  if (isSupabaseConfigured) {
    for (const t of updatedTasks) {
      const original = tasks.find(orig => orig.id === t.id);
      if (!original || original.display_order !== t.display_order) {
        try {
          await (supabase.from('implementations' as any) as any)
            .update({ display_order: t.display_order })
            .eq('id', t.id);
        } catch (err) {
          console.warn(`Erro ao sincronizar ordem da tarefa ${t.id} no Supabase:`, err);
        }
      }
    }
  }

  return updatedTasks;
}
