import React from 'react';
import { HelpCircle } from 'lucide-react';
import { useImplementations } from './implementations/useImplementations';
import { ImplementationsHeader } from './implementations/ImplementationsHeader';
import { ImplementationAddForm } from './implementations/ImplementationAddForm';
import { SqlMigrationAlert } from './implementations/SqlMigrationAlert';
import { ImplementationsFilterBar } from './implementations/ImplementationsFilterBar';
import { ImplementationCard } from './implementations/ImplementationCard';

export default function ImplementationsList() {
  const {
    tasks,
    loading,
    fromDb,
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
  } = useImplementations();

  return (
    <div className="bg-slate-800 rounded-md border border-slate-700 shadow-xl overflow-hidden flex flex-col h-full" id="implementations_panel">
      {/* Cabeçalho */}
      <ImplementationsHeader
        tasksCount={totalCount}
        completedCount={completedCount}
        percentCompleted={percentCompleted}
        isAdding={isAdding}
        setIsAdding={setIsAdding}
        isReorganizing={isReorganizing}
        reorganizedFeedback={reorganizedFeedback}
        handleReorganizeOrders={handleReorganizeOrders}
        loadData={loadData}
      />

      <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
        {/* Formulário de Adição */}
        {isAdding && (
          <ImplementationAddForm
            newTitle={newTitle}
            setNewTitle={setNewTitle}
            newDesc={newDesc}
            setNewDesc={setNewDesc}
            newCategory={newCategory}
            setNewCategory={setNewCategory}
            newOrder={newOrder}
            setNewOrder={setNewOrder}
            newStarted={newStarted}
            setNewStarted={setNewStarted}
            setIsAdding={setIsAdding}
            handleAddSubmit={handleAddSubmit}
          />
        )}

        {/* Alerta de migração SQL */}
        <SqlMigrationAlert
          fromDb={fromDb}
          copiedSql={copiedSql}
          handleCopySql={handleCopySql}
        />

        {/* Barra de Filtros e Busca */}
        <ImplementationsFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        {/* Listagem das Implementações */}
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
            {filteredTasks.map((task, index) => (
              <ImplementationCard
                key={`${task.id || 'task'}-${index}`}
                task={task}
                index={index}
                isEditing={editingId === task.id}
                editTitle={editTitle}
                setEditTitle={setEditTitle}
                editDesc={editDesc}
                setEditDesc={setEditDesc}
                editCategory={editCategory}
                setEditCategory={setEditCategory}
                editOrder={editOrder}
                setEditOrder={setEditOrder}
                editStarted={editStarted}
                setEditStarted={setEditStarted}
                deletingId={deletingId}
                setDeletingId={setDeletingId}
                setEditingId={setEditingId}
                startEditing={startEditing}
                handleSaveEdit={handleSaveEdit}
                handleToggleStarted={handleToggleStarted}
                handleToggleComplete={handleToggleComplete}
                handleMakeFirst={handleMakeFirst}
                handleMoveUp={handleMoveUp}
                handleMoveDown={handleMoveDown}
                handleDeleteTask={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
