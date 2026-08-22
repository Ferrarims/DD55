import { ImplementationTask } from './types';
import { updateImplementationInDb } from '../../../lib/api/implementationsService';

export const sortTasks = (list: ImplementationTask[]) => {
  return [...list].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    return a.display_order - b.display_order;
  });
};

export async function makeTaskFirst(
  task: ImplementationTask,
  tasks: ImplementationTask[]
): Promise<ImplementationTask[]> {
  const targetOrder = 1;
  const updatedTasks = tasks.map(t => {
    if (t.id === task.id) {
      return { ...t, display_order: targetOrder };
    } else if (t.display_order >= targetOrder) {
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

  return sortTasks(updatedTasks);
}

export async function moveTaskUp(
  task: ImplementationTask,
  tasks: ImplementationTask[]
): Promise<ImplementationTask[] | null> {
  const taskIndex = tasks.findIndex(t => t.id === task.id);
  if (taskIndex <= 0) return null;

  const prevTask = tasks[taskIndex - 1];
  const currentOrder = task.display_order;
  const prevOrder = prevTask.display_order;

  const newOrderCurrent = prevOrder;
  const newOrderPrev = currentOrder === prevOrder ? currentOrder + 1 : currentOrder;

  const updatedTasks = tasks.map(t => {
    if (t.id === task.id) return { ...t, display_order: newOrderCurrent };
    if (t.id === prevTask.id) return { ...t, display_order: newOrderPrev };
    return t;
  });

  await updateImplementationInDb(task.id, { display_order: newOrderCurrent });
  await updateImplementationInDb(prevTask.id, { display_order: newOrderPrev });

  return sortTasks(updatedTasks);
}

export async function moveTaskDown(
  task: ImplementationTask,
  tasks: ImplementationTask[]
): Promise<ImplementationTask[] | null> {
  const taskIndex = tasks.findIndex(t => t.id === task.id);
  if (taskIndex === -1 || taskIndex >= tasks.length - 1) return null;

  const nextTask = tasks[taskIndex + 1];
  const currentOrder = task.display_order;
  const nextOrder = nextTask.display_order;

  const newOrderCurrent = nextOrder;
  const newOrderNext = currentOrder === nextOrder ? currentOrder - 1 : currentOrder;

  const updatedTasks = tasks.map(t => {
    if (t.id === task.id) return { ...t, display_order: newOrderCurrent };
    if (t.id === nextTask.id) return { ...t, display_order: newOrderNext };
    return t;
  });

  await updateImplementationInDb(task.id, { display_order: newOrderCurrent });
  await updateImplementationInDb(nextTask.id, { display_order: newOrderNext });

  return sortTasks(updatedTasks);
}
