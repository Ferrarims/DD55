import { supabase, isSupabaseConfigured } from '../supabase';
import { ImplementationTask } from './initialTasks';
import { getLocalTasks, saveLocalTasks } from './localTasksStorage';

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
      return { data: getLocalTasks(), fromDb: true };
    }

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

export async function createImplementationInDb(task: Omit<ImplementationTask, 'id'>): Promise<ImplementationTask> {
  const newLocalId = crypto.randomUUID();
  const newLocalTask: ImplementationTask = {
    ...task,
    id: newLocalId
  };

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
      
      const updatedLocalList = getLocalTasks().map(t => t.id === newLocalId ? result : t);
      saveLocalTasks(updatedLocalList);

      return result;
    }
  } catch (err) {
    console.warn('Falha na inserção no Supabase, mantendo estado local.', err);
  }

  return newLocalTask;
}

export async function updateImplementationInDb(id: string, updates: Partial<Omit<ImplementationTask, 'id'>>): Promise<void> {
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

export async function deleteImplementationInDb(id: string): Promise<void> {
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

export async function reorganizeOrdersInDb(tasks: ImplementationTask[]): Promise<ImplementationTask[]> {
  const pendingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => a.display_order - b.display_order);

  const completedTasks = tasks.filter(t => t.completed);
  const updatedTasks: ImplementationTask[] = [];

  pendingTasks.forEach((task, index) => {
    updatedTasks.push({
      ...task,
      display_order: index + 1
    });
  });

  completedTasks.forEach(task => {
    updatedTasks.push({
      ...task,
      display_order: 0
    });
  });

  saveLocalTasks(updatedTasks);

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
