import React, { useState, useEffect } from 'react';
import { 
  fetchImplementationsFromDb, 
  updateImplementationInDb, 
  deleteImplementationInDb, 
  reorganizeOrdersInDb,
  ImplementationTask 
} from '../../../lib/api/implementationsService';
import { StatusFilter } from './types';
import { sortTasks, makeTaskFirst, moveTaskUp, moveTaskDown } from './taskOrderHelper';
import { createNewTask, saveTaskEdit, SQL_MIGRATION_TEXT } from './taskCrudHelper';

export function useImplementations() {
  const [tasks, setTasks] = useState<ImplementationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDb, setFromDb] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Estados para busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');

  // Estados para cadastro
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Geral');
  const [newOrder, setNewOrder] = useState<number>(10);
  const [newStarted, setNewStarted] = useState(false);

  // Estado de Edição de uma Tarefa específica
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editOrder, setEditOrder] = useState<number>(0);
  const [editStarted, setEditStarted] = useState(false);

  // Feedback para Cópia do SQL e Reorganização
  const [copiedSql, setCopiedSql] = useState(false);
  const [isReorganizing, setIsReorganizing] = useState(false);
  const [reorganizedFeedback, setReorganizedFeedback] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleReorganizeOrders = async () => {
    if (isReorganizing || tasks.length === 0) return;
    setIsReorganizing(true);
    try {
      const updated = await reorganizeOrdersInDb(tasks);
      setTasks(sortTasks(updated));

      const pendingCount = updated.filter(t => !t.completed).length;
      setNewOrder(pendingCount + 1);

      setReorganizedFeedback(true);
      setTimeout(() => setReorganizedFeedback(false), 3000);
    } catch (err) {
      console.error('Erro ao reorganizar ordens:', err);
    } finally {
      setIsReorganizing(false);
    }
  };

  const loadData = async () => {
    setLoading(true);
    const result = await fetchImplementationsFromDb();
    setTasks(sortTasks(result.data));
    setFromDb(result.fromDb);
    setDbError(result.error || null);
    
    if (result.data.length > 0) {
      const maxOrder = Math.max(...result.data.map(t => t.display_order));
      setNewOrder(maxOrder + 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_MIGRATION_TEXT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleToggleComplete = async (task: ImplementationTask) => {
    const newStatus = !task.completed;
    const newStarted = newStatus ? true : task.started;
    
    setTasks(prev => sortTasks(prev.map(t => t.id === task.id ? { ...t, completed: newStatus, started: newStarted } : t)));
    await updateImplementationInDb(task.id, { completed: newStatus, started: newStarted });
  };

  const handleToggleStarted = async (task: ImplementationTask) => {
    const newStarted = !task.started;
    const newCompleted = newStarted ? task.completed : false;
    
    setTasks(prev => sortTasks(prev.map(t => t.id === task.id ? { ...t, started: newStarted, completed: newCompleted } : t)));
    await updateImplementationInDb(task.id, { started: newStarted, completed: newCompleted });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const { updatedTasks, newTask } = await createNewTask({
      title: newTitle,
      description: newDesc,
      category: newCategory,
      started: newStarted,
      order: newOrder
    }, tasks);

    setTasks(updatedTasks);
    setNewTitle('');
    setNewDesc('');
    setNewCategory('Geral');
    setNewStarted(false);
    
    const allCurrentTasks = [...updatedTasks, newTask];
    const maxOrder = allCurrentTasks.length > 0 ? Math.max(...allCurrentTasks.map(t => t.display_order)) : 10;
    setNewOrder(maxOrder + 1);
    setIsAdding(false);
  };

  const startEditing = (task: ImplementationTask) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditCategory(task.category);
    setEditOrder(task.display_order);
    setEditStarted(task.started);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) return;
    const updated = await saveTaskEdit(id, {
      title: editTitle,
      description: editDesc,
      category: editCategory,
      order: editOrder,
      started: editStarted
    }, tasks);

    setTasks(updated);
    setEditingId(null);
  };

  const handleMakeFirst = async (task: ImplementationTask) => {
    const updated = await makeTaskFirst(task, tasks);
    setTasks(updated);
  };

  const handleMoveUp = async (task: ImplementationTask) => {
    const updated = await moveTaskUp(task, tasks);
    if (updated) setTasks(updated);
  };

  const handleMoveDown = async (task: ImplementationTask) => {
    const updated = await moveTaskDown(task, tasks);
    if (updated) setTasks(updated);
  };

  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setDeletingId(null);
    if (editingId === id) setEditingId(null);
    await deleteImplementationInDb(id);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || task.category === selectedCategory;
    const matchesStatus = 
      selectedStatus === 'all' ||
      (selectedStatus === 'completed' && task.completed) ||
      (selectedStatus === 'started' && task.started && !task.completed) ||
      (selectedStatus === 'pending' && !task.started && !task.completed);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const percentCompleted = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    tasks,
    loading,
    fromDb,
    dbError,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedStatus,
    setSelectedStatus,
    isAdding,
    setIsAdding,
    newTitle,
    setNewTitle,
    newDesc,
    setNewDesc,
    newCategory,
    setNewCategory,
    newOrder,
    setNewOrder,
    newStarted,
    setNewStarted,
    editingId,
    setEditingId,
    editTitle,
    setEditTitle,
    editDesc,
    setEditDesc,
    editCategory,
    setEditCategory,
    editOrder,
    setEditOrder,
    editStarted,
    setEditStarted,
    copiedSql,
    handleCopySql,
    isReorganizing,
    reorganizedFeedback,
    deletingId,
    setDeletingId,
    filteredTasks,
    totalCount,
    completedCount,
    percentCompleted,
    handleReorganizeOrders,
    loadData,
    handleToggleComplete,
    handleToggleStarted,
    handleAddSubmit,
    startEditing,
    handleSaveEdit,
    handleMakeFirst,
    handleMoveUp,
    handleMoveDown,
    handleDeleteTask,
  };
}
