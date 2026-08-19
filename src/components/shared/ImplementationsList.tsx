import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock,
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Trash2, 
  Database, 
  Search, 
  Sparkles, 
  AlertCircle, 
  Copy, 
  Check, 
  X, 
  Filter, 
  ListOrdered,
  HelpCircle
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/api/supabase';
import { 
  fetchImplementationsFromDb, 
  createImplementationInDb, 
  updateImplementationInDb, 
  deleteImplementationInDb, 
  reorganizeOrdersInDb,
  ImplementationTask 
} from '../../lib/api/implementationsService';

const CATEGORIES = [
  "Raças",
  "Classes",
  "Talentos",
  "Antecedentes",
  "Magias",
  "Equipamentos",
  "Ficha",
  "Arena",
  "Monstros",
  "Sistemas",
  "Regras",
  "IA & Narrativa",
  "Geral"
];

export default function ImplementationsList() {
  const [tasks, setTasks] = useState<ImplementationTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromDb, setFromDb] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  
  // Estados para busca e filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'completed' | 'started' | 'pending'>('all');

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

  // Feedback para Cópia do SQL
  const [copiedSql, setCopiedSql] = useState(false);

  // Estados para Organização e Renumeração de Ordem
  const [isReorganizing, setIsReorganizing] = useState(false);
  const [reorganizedFeedback, setReorganizedFeedback] = useState(false);

  const sortTasks = (list: ImplementationTask[]) => {
    return [...list].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return a.display_order - b.display_order;
    });
  };

  // Reorganizar Ordens: apaga a numeração das já concluídas (display_order = 0) e renumera pendentes de 1 a N
  const handleReorganizeOrders = async () => {
    if (isReorganizing || tasks.length === 0) return;
    setIsReorganizing(true);
    try {
      const updated = await reorganizeOrdersInDb(tasks);
      setTasks(sortTasks(updated));

      // Sugere a próxima ordem para novas tarefas
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

  // Carrega os dados
  const loadData = async () => {
    setLoading(true);
    const result = await fetchImplementationsFromDb();
    setTasks(sortTasks(result.data));
    setFromDb(result.fromDb);
    setDbError(result.error || null);
    
    // Sugere uma ordem sequencial para novos itens com base no maior display_order
    if (result.data.length > 0) {
      const maxOrder = Math.max(...result.data.map(t => t.display_order));
      setNewOrder(maxOrder + 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Copiar SQL de Migração para Área de Transferência
  const handleCopySql = () => {
    const sqlText = `-- SE FOR CRIAR A TABELA DO ZERO:
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

    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Alternar Status de Conclusão (Checkbox)
  const handleToggleComplete = async (task: ImplementationTask) => {
    const newStatus = !task.completed;
    const newStarted = newStatus ? true : task.started;
    
    // Otimista na UI
    setTasks(prev => {
      const mapped = prev.map(t => t.id === task.id ? { ...t, completed: newStatus, started: newStarted } : t);
      return sortTasks(mapped);
    });

    await updateImplementationInDb(task.id, { completed: newStatus, started: newStarted });
  };

  // Alternar Status de Iniciado
  const handleToggleStarted = async (task: ImplementationTask) => {
    const newStarted = !task.started;
    const newCompleted = newStarted ? task.completed : false;
    
    // Otimista na UI
    setTasks(prev => {
      const mapped = prev.map(t => t.id === task.id ? { ...t, started: newStarted, completed: newCompleted } : t);
      return sortTasks(mapped);
    });

    await updateImplementationInDb(task.id, { started: newStarted, completed: newCompleted });
  };

  // Salvar Nova Implementação
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const safeOrder = Math.max(1, newOrder);

    // Primeiro criamos a nova tarefa
    const newTask = await createImplementationInDb({
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      completed: false,
      started: newStarted,
      display_order: safeOrder
    });

    // Se houver colisões ou se definimos uma ordem específica, incrementamos as outras com ordem >= safeOrder em +1
    const updatedTasks = tasks.map(t => {
      if (t.display_order >= safeOrder) {
        return { ...t, display_order: t.display_order + 1 };
      }
      return t;
    });

    // Salva as ordens atualizadas das outras tarefas no banco/localStorage
    for (const t of updatedTasks) {
      const originalTask = tasks.find(orig => orig.id === t.id);
      if (originalTask && originalTask.display_order !== t.display_order) {
        await updateImplementationInDb(t.id, { display_order: t.display_order });
      }
    }

    setTasks(sortTasks([...updatedTasks, newTask]));

    // Limpa os campos
    setNewTitle('');
    setNewDesc('');
    setNewCategory('Geral');
    setNewStarted(false);
    
    // Sugere o próximo número de ordem (maior atual + 1)
    const allCurrentTasks = [...updatedTasks, newTask];
    const maxOrder = allCurrentTasks.length > 0 ? Math.max(...allCurrentTasks.map(t => t.display_order)) : 10;
    setNewOrder(maxOrder + 1);
    
    setIsAdding(false);
  };

  // Iniciar Edição
  const startEditing = (task: ImplementationTask) => {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditCategory(task.category);
    setEditOrder(task.display_order);
    setEditStarted(task.started);
  };

  // Salvar Edição com reajuste automático de sequência (+1 para as demais caso mude para o início/meio)
  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) return;

    const targetTask = tasks.find(t => t.id === id);
    if (!targetTask) return;

    const safeOrder = Math.max(1, editOrder);
    const orderChanged = targetTask.display_order !== safeOrder;

    let updatedTasks: ImplementationTask[] = [];

    if (orderChanged) {
      // Se a ordem mudou, incrementamos as outras que têm display_order >= safeOrder em +1
      updatedTasks = tasks.map(t => {
        if (t.id === id) {
          return { 
            ...t, 
            title: editTitle.trim(), 
            description: editDesc.trim(), 
            category: editCategory, 
            started: editStarted,
            completed: t.completed && editStarted,
            display_order: safeOrder
          };
        } else if (t.display_order >= safeOrder) {
          return { ...t, display_order: t.display_order + 1 };
        }
        return t;
      });
    } else {
      // Se a ordem continua a mesma, apenas atualiza os dados normais
      updatedTasks = tasks.map(t => {
        if (t.id === id) {
          return { 
            ...t, 
            title: editTitle.trim(), 
            description: editDesc.trim(), 
            category: editCategory,
            started: editStarted,
            completed: t.completed && editStarted
          };
        }
        return t;
      });
    }

    setTasks(sortTasks(updatedTasks));

    // Salva tudo no banco de dados e localStorage
    for (const t of updatedTasks) {
      if (t.id === id) {
        await updateImplementationInDb(id, {
          title: editTitle.trim(),
          description: editDesc.trim(),
          category: editCategory,
          started: editStarted,
          completed: t.completed && editStarted,
          display_order: safeOrder
        });
      } else {
        const originalTask = tasks.find(orig => orig.id === t.id);
        if (originalTask && originalTask.display_order !== t.display_order) {
          await updateImplementationInDb(t.id, { display_order: t.display_order });
        }
      }
    }

    setEditingId(null);
  };

  // Coloca uma implementação como a primeira da lista, empurrando as demais em +1
  const handleMakeFirst = async (task: ImplementationTask) => {
    const targetOrder = 1;

    // A tarefa atual ganha a ordem 1. Todas as demais tarefas com ordem >= 1 ganham +1.
    const updatedTasks = tasks.map(t => {
      if (t.id === task.id) {
        return { ...t, display_order: targetOrder };
      } else if (t.display_order >= targetOrder) {
        return { ...t, display_order: t.display_order + 1 };
      }
      return t;
    });

    setTasks(sortTasks(updatedTasks));

    // Salva as modificações no banco de dados / localStorage
    for (const t of updatedTasks) {
      const originalTask = tasks.find(orig => orig.id === t.id);
      if (originalTask && originalTask.display_order !== t.display_order) {
        await updateImplementationInDb(t.id, { display_order: t.display_order });
      }
    }
  };

  // Subir um item na lista (troca de ordem com o anterior da lista visual)
  const handleMoveUp = async (task: ImplementationTask) => {
    const taskIndex = tasks.findIndex(t => t.id === task.id);
    if (taskIndex <= 0) return; // Já é o primeiro

    const prevTask = tasks[taskIndex - 1];
    
    const currentOrder = task.display_order;
    const prevOrder = prevTask.display_order;

    // Se as ordens forem idênticas, ajustamos para que fiquem separadas
    const newOrderCurrent = prevOrder;
    const newOrderPrev = currentOrder === prevOrder ? currentOrder + 1 : currentOrder;

    const updatedTasks = tasks.map(t => {
      if (t.id === task.id) return { ...t, display_order: newOrderCurrent };
      if (t.id === prevTask.id) return { ...t, display_order: newOrderPrev };
      return t;
    });

    setTasks(sortTasks(updatedTasks));

    await updateImplementationInDb(task.id, { display_order: newOrderCurrent });
    await updateImplementationInDb(prevTask.id, { display_order: newOrderPrev });
  };

  // Descer um item na lista (troca de ordem com o posterior da lista visual)
  const handleMoveDown = async (task: ImplementationTask) => {
    const taskIndex = tasks.findIndex(t => t.id === task.id);
    if (taskIndex === -1 || taskIndex >= tasks.length - 1) return; // Já é o último

    const nextTask = tasks[taskIndex + 1];

    const currentOrder = task.display_order;
    const nextOrder = nextTask.display_order;

    // Se as ordens forem idênticas, ajustamos para que fiquem separadas
    const newOrderCurrent = nextOrder;
    const newOrderNext = currentOrder === nextOrder ? currentOrder - 1 : currentOrder;

    const updatedTasks = tasks.map(t => {
      if (t.id === task.id) return { ...t, display_order: newOrderCurrent };
      if (t.id === nextTask.id) return { ...t, display_order: newOrderNext };
      return t;
    });

    setTasks(sortTasks(updatedTasks));

    await updateImplementationInDb(task.id, { display_order: newOrderCurrent });
    await updateImplementationInDb(nextTask.id, { display_order: newOrderNext });
  };

  // Alterar a ordem de forma geral e empurrar as demais para a frente (display_order >= newOrderVal ganham +1)
  const handleOrderChange = async (task: ImplementationTask, newOrderVal: number) => {
    const safeOrder = Math.max(1, newOrderVal);
    if (task.display_order === safeOrder) return;

    const updatedTasks = tasks.map(t => {
      if (t.id === task.id) {
        return { ...t, display_order: safeOrder };
      } else if (t.display_order >= safeOrder) {
        return { ...t, display_order: t.display_order + 1 };
      }
      return t;
    });

    setTasks(sortTasks(updatedTasks));

    // Salva as alterações de todas as tarefas modificadas no banco/localStorage
    for (const t of updatedTasks) {
      const originalTask = tasks.find(orig => orig.id === t.id);
      if (originalTask && originalTask.display_order !== t.display_order) {
        await updateImplementationInDb(t.id, { display_order: t.display_order });
      }
    }
  };

  // Estado de Confirmação de Exclusão
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Excluir Implementação
  const handleDeleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setDeletingId(null);
    if (editingId === id) setEditingId(null);
    await deleteImplementationInDb(id);
  };

  // Filtragem e busca
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

  // Cálculos de Progresso
  const totalCount = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  const percentCompleted = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-slate-800 rounded-md border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full" id="implementations_panel">
      
      {/* Cabeçalho */}
      <div className="p-4 border-b border-slate-700 bg-slate-800/80 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span className="text-amber-500">🛠️</span>
              Controle de Implementações
            </h2>
            <p className="text-slate-400 text-xs mt-1">Acompanhe as funcionalidades prontas e o que ainda está planejado para o sistema.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleReorganizeOrders}
              disabled={isReorganizing || tasks.length === 0}
              className={`font-semibold text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-all shadow-sm border ${
                reorganizedFeedback
                  ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-300'
                  : 'bg-indigo-600/20 hover:bg-indigo-600/35 border-indigo-500/40 hover:border-indigo-400 text-indigo-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              title="Organizar sequência: apaga a ordem das tarefas já concluídas e renumera todas as pendentes iniciando do 1 em ordem crescente"
            >
              {reorganizedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Ordem Reorganizada!</span>
                </>
              ) : (
                <>
                  <ListOrdered className={`w-3.5 h-3.5 ${isReorganizing ? 'animate-spin text-amber-400' : 'text-indigo-400'}`} />
                  <span>{isReorganizing ? 'Organizando...' : 'Organizar Ordem (1..N)'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
            >
              {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{isAdding ? 'Fechar' : 'Nova Implementação'}</span>
            </button>
            <button
              onClick={loadData}
              className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-1.5 rounded transition-colors"
            >
              Recarregar
            </button>
          </div>
        </div>

        {/* Barra de Progresso do Dashboard */}
        <div className="mt-4 bg-slate-900/60 rounded-xl p-3 border border-slate-750">
          <div className="flex items-center justify-between mb-1.5 text-xs text-slate-350">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-amber-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Progresso do Desenvolvimento
            </span>
            <span className="font-bold text-slate-200">
              {completedCount} de {totalCount} Concluído ({percentCompleted}%)
            </span>
          </div>
          <div className="w-full bg-slate-850 h-2.5 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 transition-all duration-500 ease-out rounded-full"
              style={{ width: `${percentCompleted}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
        
        {/* Formulário de Adição */}
        {isAdding && (
          <form onSubmit={handleAddSubmit} className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-4 animate-fade-in flex flex-col gap-3">
            <h3 className="text-sm font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Cadastrar Nova Implementação
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Título / Nome</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Sistema de Multiclasse"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  className="w-full bg-slate-850 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Descrição</label>
              <textarea
                rows={2}
                placeholder="Descreva o que faz ou o escopo planejado desta funcionalidade..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
                className="w-full bg-slate-850 border border-slate-700 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Ordem de Exibição (display_order):</label>
                  <input
                    type="number"
                    required
                    value={newOrder}
                    onChange={e => setNewOrder(Number(e.target.value))}
                    className="w-16 bg-slate-850 border border-slate-700 text-slate-200 rounded px-2 py-0.5 text-sm focus:outline-none text-center"
                  />
                </div>

                <label className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newStarted}
                    onChange={e => setNewStarted(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-850 w-4 h-4 cursor-pointer"
                  />
                  <span>Já Iniciada (Em Progresso)</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Salvar Item
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Alerta caso a tabela no Supabase não esteja pronta */}
        {!fromDb && isSupabaseConfigured && (
          <div className="bg-amber-950/35 border border-amber-600/40 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-3 items-start">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-400">Tabela de Implementações ausente no Banco de Dados</h4>
                <p className="text-slate-350 text-xs mt-1 leading-relaxed">
                  Para poder salvar as modificações permanentemente em nuvem e sincronizar entre dispositivos, você precisa criar a tabela <strong className="text-slate-200">implementations</strong> no painel SQL do seu console Supabase.
                </p>
                <p className="text-slate-400 text-[10px] mt-1 font-mono">
                  (O aplicativo continuará funcionando perfeitamente usando persistência local provisória com LocalStorage!)
                </p>
              </div>
            </div>

            <button
              onClick={handleCopySql}
              className="bg-amber-600/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all self-end md:self-center whitespace-nowrap"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copiado!' : 'Copiar SQL de Migração'}</span>
            </button>
          </div>
        )}

        {/* Buscas, Filtros e Categorias */}
        <div className="bg-slate-850 p-3 rounded-xl border border-slate-700/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Caixa de busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar pelo nome ou descrição..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 text-slate-200 rounded pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-amber-500 placeholder:text-slate-500 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Seletor de Categoria */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-500" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-900 text-xs text-slate-300 focus:outline-none font-medium cursor-pointer"
              >
                <option value="Todas" className="bg-slate-900 text-slate-200">Todas Categorias</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
                ))}
              </select>
            </div>

            {/* Seletor de Status de Progresso */}
            <div className="flex bg-slate-900 border border-slate-700 rounded p-0.5">
              <button
                type="button"
                onClick={() => setSelectedStatus('all')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  selectedStatus === 'all' 
                    ? 'bg-amber-600 text-slate-950 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Todas
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('pending')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
                  selectedStatus === 'pending' 
                    ? 'bg-slate-850 border border-slate-700 text-slate-300 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Apenas tarefas planejadas e não iniciadas"
              >
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full"></span>
                Planejado
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('started')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
                  selectedStatus === 'started' 
                    ? 'bg-amber-600/25 border border-amber-500/40 text-amber-300 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Apenas tarefas que já foram iniciadas mas não concluídas"
              >
                <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                Iniciado
              </button>
              <button
                type="button"
                onClick={() => setSelectedStatus('completed')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
                  selectedStatus === 'completed' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Apenas tarefas totalmente concluídas"
              >
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                Feito
              </button>
            </div>
          </div>
        </div>

        {/* Listagem em Lista das Implementações */}
        {loading ? (
          <div className="py-12 text-center text-slate-450 animate-pulse flex flex-col items-center gap-2">
            <span className="text-3xl">⚙️</span>
            <p className="text-sm font-semibold">Carregando lista de implementações...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-12 text-center bg-slate-900/30 rounded-xl border border-dashed border-slate-700 text-slate-450 flex flex-col items-center gap-2">
            <HelpCircle className="w-8 h-8 text-slate-600" />
            <p className="text-sm">Nenhum item encontrado com os filtros atuais.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredTasks.map((task, index) => {
              const isEditing = editingId === task.id;
              
              return (
                <div 
                  key={`${task.id || 'task'}-${index}`} 
                  className={`border rounded-xl p-4 transition-all duration-200 flex flex-col justify-between ${
                    task.completed 
                      ? 'bg-slate-900/30 border-emerald-950/40 hover:border-emerald-900/50 opacity-80' 
                      : 'bg-slate-800/40 border-slate-700/70 hover:border-slate-600'
                  } ${isEditing ? 'ring-2 ring-amber-500 border-transparent bg-slate-900/50' : ''}`}
                >
                  <div>
                    {/* Linha Superior (Categoria, Ordem, Status) */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] uppercase tracking-widest font-extrabold px-2 py-0.5 rounded ${
                          task.completed 
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/30' 
                            : 'bg-slate-900/80 text-amber-500 border border-slate-700'
                        }`}>
                          {task.category}
                        </span>
                        
                        {/* Indicador de Ordem */}
                        <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border flex items-center gap-1 ${
                          task.completed || task.display_order <= 0
                            ? 'bg-slate-900/40 text-slate-500 border-slate-800'
                            : 'bg-slate-900/80 text-amber-400/90 border-slate-750'
                        }`}>
                          <ListOrdered className="w-3 h-3 text-slate-500" />
                          <span>{task.completed || task.display_order <= 0 ? 'Ordem: -' : `Ordem: ${task.display_order}`}</span>
                        </span>
                      </div>

                      {/* Status de Progresso (Iniciar e Concluir) */}
                      <div className="flex items-center gap-2">
                        {/* Botão Iniciado / Em Progresso */}
                        <button
                          type="button"
                          onClick={() => handleToggleStarted(task)}
                          disabled={task.completed}
                          className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border transition-colors ${
                            task.started
                              ? 'bg-amber-950/60 border-amber-600/50 text-amber-300'
                              : 'bg-slate-900 hover:bg-slate-850 border-slate-750 text-slate-450 hover:text-slate-350'
                          } ${task.completed ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={task.completed ? "Já concluído" : task.started ? "Marcar como não iniciado" : "Marcar como iniciado (Em Progresso)"}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{task.started ? 'Iniciado' : 'Iniciar'}</span>
                        </button>

                        {/* Botão de Conclusão */}
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(task)}
                          className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border transition-colors ${
                            task.completed
                              ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300'
                              : 'bg-slate-900 hover:bg-slate-850 border-slate-750 text-slate-450 hover:text-slate-350'
                          }`}
                          title={task.completed ? "Marcar como pendente" : "Marcar como concluído"}
                        >
                          {task.completed ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Feito</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-3 h-3" />
                              <span>Concluir</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Formulário de Edição Inline */}
                    {isEditing ? (
                      <div className="flex flex-col gap-2 mt-2 animate-fade-in">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400">Título</label>
                          <input 
                            type="text" 
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-semibold"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[9px] uppercase font-bold text-slate-400">Categoria</label>
                            <select
                              value={editCategory}
                              onChange={e => setEditCategory(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
                            >
                              {CATEGORIES.map(cat => (
                                <option key={cat} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[9px] uppercase font-bold text-slate-400">Ordem</label>
                            <input 
                              type="number" 
                              value={editOrder}
                              onChange={e => setEditOrder(Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-amber-500 text-center"
                            />
                          </div>

                          <div className="flex flex-col justify-end pb-1 h-full select-none">
                            <label className="flex items-center gap-1.5 text-slate-300 text-[10px] font-bold cursor-pointer h-8">
                              <input
                                type="checkbox"
                                checked={editStarted}
                                onChange={e => setEditStarted(e.target.checked)}
                                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950 w-3.5 h-3.5 cursor-pointer"
                              />
                              <span>Iniciada</span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase font-bold text-slate-400">Descrição</label>
                          <textarea 
                            rows={2}
                            value={editDesc}
                            onChange={e => setEditDesc(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div className="flex justify-between items-center mt-1">
                          {deletingId === task.id ? (
                            <div className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-500/60 px-2 py-0.5 rounded animate-fade-in">
                              <span className="text-[10px] text-rose-200 font-bold whitespace-nowrap">Excluir?</span>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(task.id)}
                                className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[10px] transition-colors"
                              >
                                Sim
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-[10px] transition-colors"
                              >
                                Não
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingId(task.id)}
                              className="px-2 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 border border-rose-900/50 rounded text-[10px] font-bold flex items-center gap-1"
                              title="Excluir item"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Excluir</span>
                            </button>
                          )}

                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded text-[10px] font-bold"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(task.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                            >
                              Salvar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-2">
                        <h4 className={`text-base font-bold tracking-tight ${
                          task.completed ? 'text-slate-350 line-through decoration-emerald-500/50' : 'text-slate-100'
                        }`}>
                          {task.title}
                        </h4>
                        <p className={`text-xs mt-1 leading-relaxed ${
                          task.completed ? 'text-slate-450' : 'text-slate-350'
                        }`}>
                          {task.description || "Nenhuma descrição fornecida."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Barra de Ações do Card (Mudar Ordem, Editar, Excluir) */}
                  {!isEditing && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-slate-400">
                      
                      {/* Botões rápidos de reordenação */}
                      {!task.completed && task.display_order > 0 ? (
                        <div className="flex items-center gap-1 bg-slate-900/40 p-0.5 rounded border border-slate-850">
                          {task.display_order > 1 && (
                            <button
                              type="button"
                              onClick={() => handleMakeFirst(task)}
                              className="p-1 hover:bg-slate-850 rounded hover:text-amber-500 text-amber-500/80 text-[10px] font-extrabold px-1.5 transition-all"
                              title="Tornar este item o primeiro (muda a sequência dos outros em +1)"
                            >
                              1º
                            </button>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => handleMoveUp(task)}
                            className="p-1 hover:bg-slate-800 rounded hover:text-amber-500 transition-all text-slate-500"
                            title="Subir na lista"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          
                          <span className="text-[9px] font-mono text-slate-500 font-bold px-1 select-none">
                            Ordem
                          </span>

                          <button
                            type="button"
                            onClick={() => handleMoveDown(task)}
                            className="p-1 hover:bg-slate-800 rounded hover:text-amber-500 transition-all text-slate-500"
                            title="Descer na lista"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic flex items-center gap-1 select-none">
                          {task.completed ? 'Tarefa Concluída' : 'Sem ordem'}
                        </div>
                      )}

                      {/* Ações de Edição/Remoção */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(task)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded transition-all text-xs font-semibold flex items-center gap-1"
                          title="Editar detalhes"
                        >
                          <span>Editar</span>
                        </button>

                        {deletingId === task.id ? (
                          <div className="flex items-center gap-1.5 bg-rose-950/90 border border-rose-500/60 px-2 py-0.5 rounded animate-fade-in">
                            <span className="text-[10px] text-rose-200 font-bold whitespace-nowrap">Excluir?</span>
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="px-2 py-0.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[10px] transition-colors"
                            >
                              Sim
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingId(null)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded text-[10px] transition-colors"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeletingId(task.id)}
                            className="px-2.5 py-1 bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-900/50 rounded transition-all text-xs font-semibold flex items-center gap-1"
                            title="Excluir item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir</span>
                          </button>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
}
