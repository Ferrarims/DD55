import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, X, AlertTriangle, Check } from 'lucide-react';
import { AppUser } from '../../types/auth';
import { updateUserRole } from '../../lib/api/authService';
import { getCharactersByUserId, getCharacterById } from '../../lib/api/characterService';
import { UserProfileTab } from './userDetail/UserProfileTab';
import { UserCharactersTab } from './userDetail/UserCharactersTab';
import { CharacterInspectorOverlay } from './userDetail/CharacterInspectorOverlay';

interface UserDetailModalProps {
  user: AppUser;
  currentUser: AppUser;
  onClose: () => void;
  onUserUpdated: (updatedUser: AppUser) => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  currentUser,
  onClose,
  onUserUpdated,
}) => {
  const [characters, setCharacters] = useState<any[]>([]);
  const [loadingCharacters, setLoadingCharacters] = useState<boolean>(true);
  const [roleChanging, setRoleChanging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showRoleConfirm, setShowRoleConfirm] = useState<boolean>(false);
  const [inspectedCharacter, setInspectedCharacter] = useState<any | null>(null);

  const isAdmin = user.role === 'administrador';
  const isMe = user.id === currentUser.id;

  const loadCharacters = async () => {
    setLoadingCharacters(true);
    setError(null);
    try {
      const data = await getCharactersByUserId(user.id);
      setCharacters(data);
    } catch (err: any) {
      console.error('Erro ao buscar personagens do usuário:', err);
      setError('Não foi possível carregar a lista de personagens deste usuário.');
    } finally {
      setLoadingCharacters(false);
    }
  };

  useEffect(() => {
    loadCharacters();
  }, [user.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isInputFocused = targetTag === 'input' || targetTag === 'textarea';

      if (e.key === 'Escape') {
        e.preventDefault();
        if (inspectedCharacter) {
          setInspectedCharacter(null);
        } else if (showRoleConfirm) {
          setShowRoleConfirm(false);
        } else {
          onClose();
        }
      } else if (e.key === 'Enter' && !isInputFocused) {
        if (showRoleConfirm) {
          return;
        }
        e.preventDefault();
        if (inspectedCharacter) {
          setInspectedCharacter(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedCharacter, showRoleConfirm, onClose]);

  const handleInspectCharacter = async (char: any) => {
    setInspectedCharacter(char);
    if (char && char.id) {
      try {
        const fullChar = await getCharacterById(char.id);
        if (fullChar) {
          setInspectedCharacter(fullChar);
        }
      } catch (err) {
        console.warn('Erro ao carregar dados detalhados do personagem:', err);
      }
    }
  };

  const handleToggleRole = async () => {
    setError(null);
    setSuccessMessage(null);
    setRoleChanging(true);

    const newRole: 'administrador' | 'jogador' = isAdmin ? 'jogador' : 'administrador';

    if (isMe && isAdmin && newRole !== 'administrador') {
      setError('Você não pode remover as permissões de administrador da sua própria conta.');
      setShowRoleConfirm(false);
      setRoleChanging(false);
      return;
    }

    try {
      await updateUserRole(currentUser, user.id, newRole);
      const updated: AppUser = {
        ...user,
        role: newRole,
      };
      onUserUpdated(updated);
      setSuccessMessage(
        newRole === 'administrador'
          ? `O usuário @${user.username} agora é um Administrador do sistema!`
          : `A permissão de administrador foi removida. @${user.username} agora é um Jogador.`
      );
      setShowRoleConfirm(false);
    } catch (err: any) {
      console.error('Erro ao atualizar permissão:', err);
      setError(err.message || 'Erro ao alterar a permissão do usuário.');
    } finally {
      setRoleChanging(false);
    }
  };

  return (
    <div
      id="user-detail-backdrop"
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !inspectedCharacter) {
          onClose();
        }
      }}
    >
      <motion.div
        id="user-detail-modal"
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Cabeçalho do Modal */}
        <div className="px-6 py-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center border shadow-inner ${
                isAdmin
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                  : 'bg-red-500/15 border-red-500/40 text-red-400'
              }`}
            >
              {isAdmin ? <Shield className="w-6 h-6" /> : <Sword className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="font-bold text-xl text-slate-100"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {user.name || user.username}
                </h2>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                    isAdmin
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}
                >
                  {isAdmin ? '🛡️ Administrador' : '⚔️ Jogador'}
                </span>
                {isMe && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded-md font-bold uppercase">
                    Você
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">@{user.username}</p>
            </div>
          </div>

          <button
            id="close-user-detail-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar Detalhes"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Rolagem */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3.5 bg-red-950/50 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <UserProfileTab
            user={user}
            currentUser={currentUser}
            isAdmin={isAdmin}
            isMe={isMe}
            showRoleConfirm={showRoleConfirm}
            roleChanging={roleChanging}
            setShowRoleConfirm={setShowRoleConfirm}
            handleToggleRole={handleToggleRole}
          />

          <UserCharactersTab
            username={user.username}
            characters={characters}
            loadingCharacters={loadingCharacters}
            loadCharacters={loadCharacters}
            handleInspectCharacter={handleInspectCharacter}
          />
        </div>

        {/* Rodapé do Modal */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {inspectedCharacter && (
          <CharacterInspectorOverlay
            username={user.username}
            inspectedCharacter={inspectedCharacter}
            setInspectedCharacter={setInspectedCharacter}
            loadCharacters={loadCharacters}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
