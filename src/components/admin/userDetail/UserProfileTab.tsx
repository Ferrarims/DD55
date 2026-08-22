import React from 'react';
import { User, Mail, Calendar, Shield, Sword, ShieldAlert } from 'lucide-react';
import { AppUser } from '../../../types/auth';

interface UserProfileTabProps {
  user: AppUser;
  currentUser: AppUser;
  isAdmin: boolean;
  isMe: boolean;
  showRoleConfirm: boolean;
  roleChanging: boolean;
  setShowRoleConfirm: (show: boolean) => void;
  handleToggleRole: () => Promise<void>;
}

export const UserProfileTab: React.FC<UserProfileTabProps> = ({
  user,
  currentUser,
  isAdmin,
  isMe,
  showRoleConfirm,
  roleChanging,
  setShowRoleConfirm,
  handleToggleRole,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Bloco de Dados da Conta */}
      <div className="md:col-span-2 bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <User className="w-4 h-4 text-amber-500" />
          <span>Dados do Perfil</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">Nome Completo:</span>
            <span className="text-slate-200 font-semibold">{user.name || '—'}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Nome de Usuário:</span>
            <span className="text-slate-200 font-mono font-semibold">@{user.username}</span>
          </div>
          {user.email && (
            <div>
              <span className="text-slate-500 block mb-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3" /> E-mail de Acesso:
              </span>
              <span className="text-slate-200 font-mono break-all">{user.email}</span>
            </div>
          )}
          <div>
            <span className="text-slate-500 block mb-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Cadastrado em:
            </span>
            <span className="text-slate-200">
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })
                : 'Data indisponível'}
            </span>
          </div>
        </div>
      </div>

      {/* Bloco de Ação de Permissões */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800/80 pb-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Permissão de Acesso</span>
          </h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            {isAdmin
              ? 'Este usuário possui permissões totais de Administrador (acesso a tabelas, bestiário e usuários).'
              : 'Este usuário é um Jogador comum e tem acesso à criação de fichas e partidas.'}
          </p>
        </div>

        <div>
          {isMe && isAdmin ? (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold">
                <Shield className="w-4 h-4" />
                <span>Sua Própria Conta</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Não é permitido remover a permissão de administrador da sua própria conta ativa.
              </p>
            </div>
          ) : !showRoleConfirm ? (
            <button
              id="toggle-role-btn"
              type="button"
              onClick={() => setShowRoleConfirm(true)}
              className={`w-full py-2.5 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                isAdmin
                  ? 'bg-red-900/60 hover:bg-red-800 text-red-200 border border-red-700/80'
                  : 'bg-amber-600 hover:bg-amber-500 text-slate-950 border border-amber-400'
              }`}
            >
              {isAdmin ? (
                <>
                  <Sword className="w-4 h-4" />
                  <span>Remover Administrador</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Tornar Administrador</span>
                </>
              )}
            </button>
          ) : (
            <div className="space-y-2 p-3 bg-slate-900 border border-amber-500/40 rounded-xl">
              <p className="text-xs font-bold text-amber-300 text-center">
                {isAdmin
                  ? `Deseja remover as permissões de admin de @${user.username}?`
                  : `Deseja promover @${user.username} a Administrador?`}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleToggleRole}
                  disabled={roleChanging}
                  className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-slate-950 text-xs font-black uppercase rounded-lg transition-colors cursor-pointer"
                >
                  {roleChanging ? 'Salvando...' : 'Confirmar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRoleConfirm(false)}
                  disabled={roleChanging}
                  className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
