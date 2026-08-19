import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, UserPlus, Trash2, Shield, Sword, AlertTriangle, Check, Sparkles } from 'lucide-react';
import { listAllUsers, registerNewUser, deleteUser } from '../../lib/api/authService';
import { AppUser } from '../../types/auth';

interface UserManagementTabProps {
  currentUser: AppUser;
}

export default function UserManagementTab({ currentUser }: UserManagementTabProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Estados para o formulário de cadastro
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'administrador' | 'jogador'>('jogador');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || !name.trim() || !password) {
      setError('Por favor, preencha todos os campos do formulário.');
      setIsSubmitting(false);
      return;
    }

    try {
      await registerNewUser(currentUser, {
        username: cleanUsername,
        name: name.trim(),
        role: role,
        password: password
      });

      setSuccessMessage(`Usuário "${cleanUsername}" cadastrado com sucesso!`);
      
      // Limpar formulário
      setUsername('');
      setName('');
      setPassword('');
      setRole('jogador');

      // Atualizar lista
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao criar usuário.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, usernameToDelete: string) => {
    if (!confirm(`Tem certeza de que deseja excluir o usuário "${usernameToDelete}"?`)) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      await deleteUser(currentUser, userId);
      setSuccessMessage(`Usuário "${usernameToDelete}" excluído com sucesso.`);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir usuário.');
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Formulário de Cadastro (Esquerda) */}
      <div className="lg:col-span-1 bg-slate-900/40 border border-slate-700/60 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-lg text-amber-500" style={{ fontFamily: 'Georgia, serif' }}>
            Cadastrar Novo Usuário
          </h3>
        </div>

        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Nome Completo / Nome do Jogador
            </label>
            <input
              type="text"
              placeholder="Ex: Mestre Gabriel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Nome de Usuário (Login)
            </label>
            <input
              type="text"
              placeholder="Ex: gabriel_dnd"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Senha Inicial
            </label>
            <input
              type="password"
              placeholder="Defina uma senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Nível de Acesso (Role)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('jogador')}
                disabled={isSubmitting}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  role === 'jogador'
                    ? 'bg-slate-950 border-red-500/50 text-red-400'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Sword className="w-3.5 h-3.5" />
                <span>Jogador</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('administrador')}
                disabled={isSubmitting}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  role === 'administrador'
                    ? 'bg-slate-950 border-amber-500/50 text-amber-500'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Administrador</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-950/30 border border-red-850 rounded-xl text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 bg-emerald-950/30 border border-emerald-850 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black uppercase tracking-wider py-2.5 rounded-xl border border-amber-400 shadow-md transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Criar Usuário</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Lista de Usuários (Direita) */}
      <div className="lg:col-span-2 bg-slate-900/40 border border-slate-700/60 p-5 rounded-2xl shadow-xl flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-lg text-amber-500" style={{ fontFamily: 'Georgia, serif' }}>
              Usuários Cadastrados
            </h3>
          </div>
          <span className="text-xs bg-slate-950 text-slate-400 border border-slate-850 px-2.5 py-1 rounded-full font-bold">
            Total: {users.length}
          </span>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-slate-400 text-sm">Carregando usuários...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 border border-dashed border-slate-800 rounded-xl">
            <Users className="w-10 h-10 text-slate-650 mb-2" />
            <p className="text-slate-500 text-sm">Nenhum usuário cadastrado no sistema.</p>
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto max-h-[480px] pr-1">
            {users.map((user) => {
              const isAdmin = user.role === 'administrador';
              const isMe = user.id === currentUser.id;

              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 bg-slate-950 border rounded-xl flex items-center justify-between gap-4 transition-colors ${
                    isMe ? 'border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.05)]' : 'border-slate-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      isAdmin ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {isAdmin ? <Shield className="w-4 h-4" /> : <Sword className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200 text-sm">{user.name}</span>
                        {isMe && (
                          <span className="bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase px-1.5 py-0.5 rounded border border-amber-500/30">
                            Você
                          </span>
                        )}
                        <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded ${
                          isAdmin ? 'bg-amber-600/10 text-amber-500' : 'bg-red-600/10 text-red-400'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>@{user.username}</span>
                        {user.created_at && (
                          <>
                            <span className="text-slate-750">•</span>
                            <span>Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {deletingUserId === user.id ? (
                    <div className="flex items-center gap-2 bg-slate-900 border border-red-500/30 rounded-xl px-2.5 py-1.5 animate-fadeIn">
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
                        className="bg-red-600 hover:bg-red-500 text-slate-950 text-[10px] font-black px-2 py-1 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                      >
                        Sim
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingUserId(null)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer uppercase tracking-wider"
                      >
                        Não
                      </button>
                    </div>
                  ) : (
                    !isMe && (
                      <button
                        type="button"
                        onClick={() => setDeletingUserId(user.id)}
                        title="Excluir Usuário"
                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
