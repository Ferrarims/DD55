import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Sword,
  X,
  User,
  Mail,
  Calendar,
  AlertTriangle,
  Check,
  RefreshCw,
  Eye,
  Heart,
  ShieldAlert,
  Coins,
  Sparkles,
  Award,
  ChevronRight
} from 'lucide-react';
import { AppUser } from '../../types/auth';
import { updateUserRole } from '../../lib/api/authService';
import { getCharactersByUserId, getCharacterById } from '../../lib/api/characterService';
import { CLASS_REFERENCE } from '../../lib/api/references';
import { getMod } from '../../lib/mechanics/hpCalculator';
import { CharacterSheet } from '../character/CharacterSheet';

interface UserDetailModalProps {
  user: AppUser;
  currentUser: AppUser;
  onClose: () => void;
  onUserUpdated: (updatedUser: AppUser) => void;
}

const CLASS_ICONS: Record<string, string> = {
  'Bárbaro': '🪓', 'Barbarian': '🪓',
  'Bardo': '🪕', 'Bard': '🪕',
  'Clérigo': '⚕️', 'Cleric': '⚕️',
  'Druida': '🌿', 'Druid': '🌿',
  'Guerreiro': '⚔️', 'Fighter': '⚔️',
  'Monge': '👊', 'Monk': '👊',
  'Paladino': '🛡️', 'Paladin': '🛡️',
  'Patrulheiro': '🏹', 'Ranger': '🏹',
  'Ladino': '🥷', 'Rogue': '🥷',
  'Feiticeiro': '🔮', 'Sorcerer': '🔮',
  'Bruxo': '👁️', 'Warlock': '👁️',
  'Mago': '🧙‍♂️', 'Wizard': '🧙‍♂️'
};

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

  // Listener para fechar com ESC ou Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Se o usuário estiver digitando em um input ou textarea (caso exista), não aciona Enter
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
        // Se estiver confirmando o papel, o enter não deve apenas fechar o modal
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
          {/* Mensagens de Alerta ou Sucesso */}
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

          {/* Grid de Informações do Usuário & Controle de Papel */}
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

          {/* Seção de Personagens do Usuário */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3
                  className="font-bold text-lg text-slate-200"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  Personagens de @{user.username}
                </h3>
                <span className="text-xs bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full font-bold">
                  {characters.length}
                </span>
              </div>

              <button
                type="button"
                onClick={loadCharacters}
                disabled={loadingCharacters}
                className="text-xs text-slate-400 hover:text-amber-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingCharacters ? 'animate-spin text-amber-500' : ''}`} />
                <span>Atualizar</span>
              </button>
            </div>

            {loadingCharacters ? (
              <div className="py-12 text-center bg-slate-950/40 rounded-xl border border-slate-800/80">
                <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-xs text-slate-400">Carregando personagens do usuário...</p>
              </div>
            ) : characters.length === 0 ? (
              <div className="py-12 px-4 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-xl space-y-2">
                <div className="text-3xl">🧙‍♂️</div>
                <h4 className="text-sm font-bold text-slate-300">Nenhum personagem cadastrado</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Este usuário ainda não criou nenhum aventureiro no banco de dados.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((char, idx) => {
                  const icon =
                    (CLASS_REFERENCE as any)[char.class_name]?.icon ||
                    CLASS_ICONS[char.class_name] ||
                    '🗡️';
                  const maxHp = char.max_hp || 10;
                  const currentHp = char.current_hp ?? maxHp;
                  const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

                  const strMod = getMod(char.strength ?? 10);
                  const dexMod = getMod(char.dexterity ?? 10);
                  const conMod = getMod(char.constitution ?? 10);
                  const intMod = getMod(char.intelligence ?? 10);
                  const wisMod = getMod(char.wisdom ?? 10);
                  const chaMod = getMod(char.charisma ?? 10);

                  const formatMod = (m: number) => (m >= 0 ? `+${m}` : `${m}`);

                  return (
                    <div
                      key={char.id || idx}
                      onClick={() => setInspectedCharacter(char)}
                      className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-xl p-4.5 space-y-3.5 transition-all shadow-md hover:shadow-lg cursor-pointer group"
                    >
                      {/* Linha de Título do Personagem */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <span className="text-3xl bg-slate-900 p-2 rounded-xl border border-slate-800 shrink-0">
                            {icon}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-base text-slate-100 truncate" title={char.name}>
                              {char.name || 'Sem Nome'}
                            </h4>
                            <p className="text-xs text-slate-400 truncate">
                              {char.race || 'Humano'} • {char.class_name || 'Guerreiro'}
                              {char.subclass ? ` (${char.subclass})` : ''}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md shrink-0">
                          Nível {char.level || 1}
                        </span>
                      </div>

                      {/* Barra de Vida & Estatísticas de Combate */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5 text-red-500" /> Pontos de Vida:
                          </span>
                          <span className="font-bold font-mono text-slate-200">
                            {currentHp} / {maxHp} PV
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-300 ${
                              hpPercent > 50
                                ? 'bg-emerald-500'
                                : hpPercent > 25
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${hpPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* CA, Moedas e Deslocamento */}
                      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-850 text-center">
                        <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg py-1.5 px-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">CA</span>
                          <span className="text-sm font-black text-amber-400">{char.armor_class || 10}</span>
                        </div>
                        <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg py-1.5 px-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Ouro</span>
                          <span className="text-sm font-black text-amber-300 truncate block">
                            {char.coins || `${char.gp || 0} PO`}
                          </span>
                        </div>
                        <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg py-1.5 px-1">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Velocidade</span>
                          <span className="text-sm font-bold text-slate-300">{char.speed || '9m'}</span>
                        </div>
                      </div>

                      {/* Mini Atributos */}
                      <div className="grid grid-cols-6 gap-1 text-center bg-slate-900/40 p-1.5 rounded-lg border border-slate-850 text-[11px]">
                        <div>
                          <span className="text-slate-500 text-[9px] block font-bold">FOR</span>
                          <span className="text-slate-200 font-bold">{char.strength || 10}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">({formatMod(strMod)})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] block font-bold">DES</span>
                          <span className="text-slate-200 font-bold">{char.dexterity || 10}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">({formatMod(dexMod)})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] block font-bold">CON</span>
                          <span className="text-slate-200 font-bold">{char.constitution || 10}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">({formatMod(conMod)})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] block font-bold">INT</span>
                          <span className="text-slate-200 font-bold">{char.intelligence || 10}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">({formatMod(intMod)})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] block font-bold">SAB</span>
                          <span className="text-slate-200 font-bold">{char.wisdom || 10}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">({formatMod(wisMod)})</span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[9px] block font-bold">CAR</span>
                          <span className="text-slate-200 font-bold">{char.charisma || 10}</span>
                          <span className="text-[9px] text-slate-400 block font-mono">({formatMod(chaMod)})</span>
                        </div>
                      </div>

                      {/* Botão de Inspecionar Ficha */}
                      <button
                        type="button"
                        onClick={() => handleInspectCharacter(char)}
                        className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-300 border border-slate-700 hover:border-amber-500/50 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Eye className="w-4 h-4 text-amber-500" />
                        <span>Inspecionar Ficha Completa</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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

      {/* Ficha Completa do Personagem (Visualização idêntica à do Jogador) */}
      <AnimatePresence>
        {inspectedCharacter && (
          <div
            id="admin-character-sheet-modal"
            className="fixed inset-0 z-60 bg-slate-900 overflow-y-auto p-2 sm:p-4 md:p-6 animate-fadeIn"
          >
            <div className="max-w-7xl mx-auto space-y-4">
              {/* Barra superior de identificação do modo de inspeção admin */}
              <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-black uppercase text-[10px]">
                    Modo Administrador
                  </span>
                  <span className="text-slate-300">
                    Inspecionando ficha de <strong className="text-amber-400 font-bold">{inspectedCharacter.name}</strong> (Dono: <strong className="text-slate-200 font-mono">@{user.username}</strong>)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setInspectedCharacter(null)}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Voltar aos Usuários</span>
                </button>
              </div>

              {/* Componente completo e oficial da Ficha de Personagem */}
              <CharacterSheet
                character={inspectedCharacter}
                isAdminView={true}
                onBack={() => setInspectedCharacter(null)}
                onCharacterUpdated={async () => {
                  await loadCharacters();
                  try {
                    const allUserChars = await getCharactersByUserId(user.id);
                    const updated = allUserChars.find((c) => c.id === inspectedCharacter.id);
                    if (updated) {
                      setInspectedCharacter(updated);
                    }
                  } catch (e) {
                    console.warn('Erro ao atualizar ficha inspecionada:', e);
                  }
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
