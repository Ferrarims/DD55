import { 
  createImplementationInDb, 
  updateImplementationInDb 
} from '../../../lib/api/implementationsService';
import { ImplementationTask } from './types';
import { sortTasks } from './taskOrderHelper';

export const SQL_MIGRATION_TEXT = `-- SE FOR CRIAR A TABELA DO ZERO:
CREATE TABLE IF NOT EXISTS implementations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title character varying NOT NULL,
    description text,
    category character varying NOT NULL DEFAULT 'Geral',
    started boolean NOT NULL DEFAULT false,
    completed boolean NOT NULL DEFAULT false,
    display_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS e políticas
ALTER TABLE implementations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access" ON implementations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON implementations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON implementations FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete access" ON implementations FOR DELETE USING (true);

-- SE VOCÊ JÁ TEM A TABELA E SÓ PRECISA ADICIONAR A COLUNA "started":
ALTER TABLE implementations ADD COLUMN IF NOT EXISTS started boolean NOT NULL DEFAULT false;
UPDATE implementations SET started = true WHERE completed = true;`;

export async function createNewTask(
  params: {
    title: string;
    description: string;
    category: string;
    started: boolean;
    order: number;
  },
  tasks: ImplementationTask[]
): Promise<{ updatedTasks: ImplementationTask[]; newTask: ImplementationTask }> {
  const safeOrder = Math.max(1, params.order);

  const newTask = await createImplementationInDb({
    title: params.title.trim(),
    description: params.description.trim(),
    category: params.category,
    completed: false,
    started: params.started,
    display_order: safeOrder
  });

  const updatedTasks = tasks.map(t => {
    if (t.display_order >= safeOrder) {
      return { ...t, display_order: t.display_order + 1 };
    }
    return t;
  });

  for (const t of updatedTasks) {
    const originalTask = tasks.find(orig => orig.id === t.id);
    if (originalTask && originalTask.display_order !== t.display_order) {
      await updateImplementationInDb(t.id, { display_order: t.display_order });
    }
  }

  return {
    updatedTasks: sortTasks([...updatedTasks, newTask]),
    newTask
  };
}

export async function saveTaskEdit(
  id: string,
  fields: {
    title: string;
    description: string;
    category: string;
    order: number;
    started: boolean;
  },
  tasks: ImplementationTask[]
): Promise<ImplementationTask[]> {
  const targetTask = tasks.find(t => t.id === id);
  if (!targetTask) return tasks;

  const safeOrder = Math.max(1, fields.order);
  const orderChanged = targetTask.display_order !== safeOrder;

  let updatedTasks: ImplementationTask[] = [];

  if (orderChanged) {
    updatedTasks = tasks.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          title: fields.title.trim(), 
          description: fields.description.trim(), 
          category: fields.category, 
          started: fields.started,
          completed: t.completed && fields.started,
          display_order: safeOrder
        };
      } else if (t.display_order >= safeOrder) {
        return { ...t, display_order: t.display_order + 1 };
      }
      return t;
    });
  } else {
    updatedTasks = tasks.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          title: fields.title.trim(), 
          description: fields.description.trim(), 
          category: fields.category, 
          started: fields.started,
          completed: t.completed && fields.started
        };
      }
      return t;
    });
  }

  for (const t of updatedTasks) {
    if (t.id === id) {
      await updateImplementationInDb(id, {
        title: fields.title.trim(),
        description: fields.description.trim(),
        category: fields.category,
        started: fields.started,
        completed: t.completed && fields.started,
        display_order: safeOrder
      });
    } else {
      const originalTask = tasks.find(orig => orig.id === t.id);
      if (originalTask && originalTask.display_order !== t.display_order) {
        await updateImplementationInDb(t.id, { display_order: t.display_order });
      }
    }
  }

  return sortTasks(updatedTasks);
}
