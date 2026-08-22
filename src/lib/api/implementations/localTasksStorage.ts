import { ImplementationTask, INITIAL_IMPLEMENTATIONS } from './initialTasks';

const LOCAL_STORAGE_KEY = 'dnd_implementations_tasks';

export function getLocalTasks(): ImplementationTask[] {
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

export function saveLocalTasks(tasks: ImplementationTask[]): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
}
