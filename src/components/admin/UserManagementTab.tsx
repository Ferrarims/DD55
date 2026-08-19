import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Trash2, Shield, Sword, AlertTriangle, Check, ChevronRight, Eye } from 'lucide-react';
import { listAllUsers, deleteUser } from '../../lib/api/authService';
import { AppUser } from '../../types/auth';
import { UserDetailModal } from './UserDetailModal';

interface UserManagementTabProps {
  currentUser: AppUser;
}

export default function UserManagementTab({ currentUser }: UserManagementTabProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);

  useEffect(() => {
    loadUsers();
  }, [currentUser]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listAllUsers(currentUser);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar lista de usuários.');
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser.role !== 'administrador') {
    return (
      <div className="bg-slate-900 border border-red-500/30 p-8 rounded-2xl text-center max-w-md mx-auto my-12 shadow-xl">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-500 mb-2">Acesso Negado</h3>
        <p className="text-sm text-slate-300">
          Apenas usuários de nível <strong className="text-amber-500">Administrador</strong> possuem permissão para gerenciar contas de usuários na plataforma.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-400 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Lista de Usuários */}
      <div className="bg-slate-900/40 border border-slate-700/60 p-6 rounded-2xl shadow-xl flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-lg text-amber-500" style={{ fontFamily: 'Georgia, serif' }}>
                Gerenciamento de Usuários
              </h3>
              <p className="text-xs text-slate-400">
                Clique em qualquer usuário para inspecionar seus personagens e alterar permissões de Administrador.
              </p>
            </div>
          </div>
          <span className="text-xs bg-slate-950 text-slate-400 border border-slate-800 px-3 py-1 rounded-full font-bold shrink-0">
            Total: {users.length} {users.length === 1 ? 'usuário' : 'usuários'}
          </span>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-slate-400 text-sm">Carregando usuários do Supabase...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 border border-dashed border-slate-800 rounded-xl">
            <Users className="w-10 h-10 text-slate-650 mb-2" />
            <p className="text-slate-500 text-sm">Nenhum usuário cadastrado no sistema.</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[560px] pr-1">
            {users.map((user) => {
              const isAdmin = user.role === 'administrador';
              const isMe = user.id === currentUser.id;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 bg-slate-950 hover:bg-slate-900 border rounded-xl flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer group ${
                    isMe
                      ? 'border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.05)] hover:border-amber-500/70'
                      : 'border-slate-800 hover:border-slate-700 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isAdmin ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {isAdmin ? <Shield className="w-5 h-5" /> : <Sword className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-200 text-sm group-hover:text-amber-400 transition-colors truncate">
                          {user.name}
                        </span>
                        {isMe && (
                          <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-amber-500/30">
                            Você
                          </span>
                        )}
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full border ${
                          isAdmin
                            ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                            : 'bg-red-500/15 text-red-300 border-red-500/30'
                        }`}>
                          {isAdmin ? '🛡️ Administrador' : '⚔️ Jogador'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                        <span className="font-mono">@{user.username}</span>
                        {user.created_at && (
                          <>
                            <span className="text-slate-700">•</span>
                            <span>Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 group-hover:text-amber-400 font-semibold px-2.5 py-1.5 rounded-lg bg-slate-900 group-hover:bg-slate-800 border border-slate-800 transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver Personagens</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>

                    {deletingUserId === user.id ? (
                      <div
                        className="flex items-center gap-2 bg-slate-900 border border-red-500/30 rounded-xl px-2.5 py-1.5 animate-fadeIn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-wider animate-pulse">
                          Excluir?
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            setError(null);
                            setSuccessMessage(null);
                            try {
                              await deleteUser(currentUser, user.id);
                              setSuccessMessage(`Usuário "${user.username}" excluído com sucesso.`);
                              setDeletingUserId(null);
                              await loadUsers();
                            } catch (err: any) {
                              setError(err.message || 'Erro ao excluir usuário.');
                              setDeletingUserId(null);
                            }
                          }}
                          className="bg-red-600 hover:bg-red-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                        >
                          Sim
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingUserId(null)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      !isMe && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingUserId(user.id);
                          }}
                          title="Excluir Usuário"
                          className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Usuário e seus Personagens */}
      <AnimatePresence>
        {selectedUser && (
          <UserDetailModal
            user={selectedUser}
            currentUser={currentUser}
            onClose={() => setSelectedUser(null)}
            onUserUpdated={(updatedUser) => {
              setSelectedUser(updatedUser);
              setUsers((prev) =>
                prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
              );
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

