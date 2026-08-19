import { CLASS_REFERENCE } from '../../lib/api/references';
import React, { useEffect, useState } from 'react';
import { useModalKeyboard } from '../shared/ModalKeyboardHandler';
import { getCharacters, deleteCharacter } from '../../lib/api/characterService';
import { parseEquipmentToList } from '../../lib/mechanics/xpAndLootManager';
import { BestiaryModal } from './BestiaryModal';
import { getBestiaryStats } from './sheet/utils';

interface CharacterMenuProps {
  onCreateNew: () => void;
  onSelectCharacter: (character: any) => void;
  onEnterGame?: (character: any) => void;
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

export const CharacterMenu: React.FC<CharacterMenuProps> = ({
  onCreateNew,
  onSelectCharacter,
  onEnterGame
}) => {
  const [characters, setCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [charToDelete, setCharToDelete] = useState<{ id: string; name: string } | null>(null);
  const [selectedCharForBestiary, setSelectedCharForBestiary] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCharacters = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await getCharacters();
      setCharacters(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Erro de conexão com o Supabase');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const confirmDeleteCharacter = async () => {
    if (!charToDelete) return;
    const { id, name } = charToDelete;
    setDeleting(true);

    try {
      await deleteCharacter(id);
      setCharacters(prev => prev.filter(c => c.id !== id));
      setNotification({ type: 'success', message: `Personagem "${name}" excluído com sucesso!` });
    } catch (err: any) {
      console.error('Erro ao excluir personagem:', err);
      setCharacters(prev => prev.filter(c => c.id !== id));
      setNotification({
        type: 'error',
        message: `Personagem removido da lista! (Para remover definitivamente do banco de dados, execute "ALTER TABLE public.characters DISABLE ROW LEVEL SECURITY;" no SQL Editor do Supabase).`
      });
    } finally {
      setDeleting(false);
      setCharToDelete(null);
    }
  };

  useModalKeyboard({
    onCancel: () => setCharToDelete(null),
    onClose: () => setCharToDelete(null),
    onConfirm: () => {
      if (!deleting && charToDelete) {
        confirmDeleteCharacter();
      }
    },
    disabled: !charToDelete,
  });

  return (
    <div className="space-y-4">
      {/* Opções de Ação Principal - Compactas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card Criar Novo */}
        <div
          onClick={onCreateNew}
          className="group cursor-pointer bg-slate-800/90 hover:bg-slate-800 border border-dashed border-amber-500/50 hover:border-amber-500 rounded-xl p-3.5 flex items-center justify-between gap-3 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.005]"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-full bg-amber-500/10 group-hover:bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-black border border-amber-500/30 group-hover:scale-105 transition-transform">
              +
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-amber-400 group-hover:text-amber-300 transition-colors" style={{ fontFamily: 'Georgia, serif' }}>
                Criar Novo Personagem
              </h2>
              <p className="text-slate-400 text-xs">
                Forje seu aventureiro segundo as regras da Edição 5 (2024) ou 5.5.
              </p>
            </div>
          </div>
          <span className="shrink-0 px-3 py-1.5 bg-amber-600 group-hover:bg-amber-500 text-slate-950 font-black rounded-lg text-xs transition-all shadow uppercase tracking-wider">
            Iniciar →
          </span>
        </div>

        {/* Card Resumo do Banco de Dados */}
        <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3.5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-1.5" style={{ fontFamily: 'Georgia, serif' }}>
              <span>📜</span> Personagens Salvos
            </h2>
            <button
              onClick={fetchCharacters}
              disabled={loading}
              className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-300 px-2.5 py-1 rounded-md border border-slate-600 transition flex items-center gap-1 shrink-0"
              title="Atualizar lista"
            >
              🔄 {loading ? '...' : 'Atualizar'}
            </button>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-700/60 flex justify-end items-center text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Total cadastrado:</span>
              <span className="text-lg font-black text-amber-400">{characters.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Personagens */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-700 pb-2">
          <span>👥</span> Seus Personagens Cadastrados
        </h3>

        {loading ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-2xl border border-slate-700/50">
            <div className="inline-block animate-spin text-3xl text-amber-500 mb-2">⏳</div>
            <p className="text-slate-400 text-sm">Buscando personagens salvos no banco de dados...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-950/80 border border-red-700 rounded-2xl p-6 text-center space-y-3">
            <p className="text-red-300 font-semibold text-sm">Aviso do Banco de Dados:</p>
            <p className="text-xs text-red-200 font-mono bg-red-900/50 p-3 rounded">{errorMsg}</p>
            <button
              onClick={fetchCharacters}
              className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition"
            >
              Tentar Novamente
            </button>
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/40 border border-slate-700/60 rounded-2xl space-y-3 p-6">
            <div className="text-4xl">🧙‍♂️</div>
            <h4 className="text-lg font-bold text-slate-300">Nenhum personagem salvo encontrado</h4>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Você ainda não possui personagens cadastrados no banco de dados. Clique abaixo para criar seu primeiro herói!
            </p>
            <button
              onClick={onCreateNew}
              className="mt-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black rounded-xl text-sm transition shadow-lg"
            >
              + Criar Meu Primeiro Personagem
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.map((char, charIdx) => {
              const icon = (CLASS_REFERENCE as any)[char.class_name]?.icon || CLASS_ICONS[char.class_name] || '🗡️';
              const bestiaryStats = getBestiaryStats(char);

              // Determinar tipo / ancestralidade para Draconato e Golias
              let draconicAncestry = char.draconic_ancestry || char.draconicAncestry;
              if (!draconicAncestry && /draconato|dragonborn/i.test(char.race || '')) {
                const nameLower = (char.name || '').toLowerCase();
                if (nameLower.includes('preto') || nameLower.includes('negro')) draconicAncestry = 'Preto';
                else if (nameLower.includes('vermelho')) draconicAncestry = 'Vermelho';
                else if (nameLower.includes('azul')) draconicAncestry = 'Azul';
                else if (nameLower.includes('verde')) draconicAncestry = 'Verde';
                else if (nameLower.includes('branc')) draconicAncestry = 'Branco';
                else if (nameLower.includes('ouro') || nameLower.includes('dourado')) draconicAncestry = 'Ouro';
                else if (nameLower.includes('prata')) draconicAncestry = 'Prata';
                else if (nameLower.includes('bronze')) draconicAncestry = 'Bronze';
                else if (nameLower.includes('cobre')) draconicAncestry = 'Cobre';
                else if (nameLower.includes('latão') || nameLower.includes('latao')) draconicAncestry = 'Latão';
              }

              let giantAncestry = char.giant_ancestry || char.giantAncestry;
              if (!giantAncestry && /golias|goliath/i.test(char.race || '')) {
                const nameLower = (char.name || '').toLowerCase();
                if (nameLower.includes('gelo') || nameLower.includes('geada')) giantAncestry = 'Gigante do Gelo';
                else if (nameLower.includes('fogo')) giantAncestry = 'Gigante do Fogo';
                else if (nameLower.includes('nuvem') || nameLower.includes('nuvens')) giantAncestry = 'Gigante das Nuvens';
                else if (nameLower.includes('pedra')) giantAncestry = 'Gigante da Pedra';
                else if (nameLower.includes('tempestade')) giantAncestry = 'Gigante da Tempestade';
                else if (nameLower.includes('colina')) giantAncestry = 'Gigante da Colina';
              }

              return (
                <div
                  key={`${char.id || 'char'}-${charIdx}`}
                  className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-500/60 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-xl group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-4xl bg-slate-900 p-2 rounded-xl border border-slate-700 group-hover:scale-105 transition-transform shrink-0">
                          {icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-amber-400 transition-colors truncate" title={char.name || 'Sem Nome'}>
                            {char.name || 'Sem Nome'}
                          </h4>
                          <div className="mt-1">
                            <span className="inline-block text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md shadow-sm">
                              Nível {char.level || 1}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCharForBestiary(char);
                          }}
                          className="w-full sm:w-auto px-2.5 py-1 bg-slate-900/90 hover:bg-indigo-900/90 text-indigo-300 hover:text-indigo-100 border border-slate-700 hover:border-indigo-500/60 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                          title={`Abrir Bestiário de ${char.name || 'Personagem'}`}
                        >
                          <span>📖</span>
                          <span>Bestiário</span>
                        </button>

                        <div 
                          className="flex items-center gap-1.5 bg-slate-900/90 border border-indigo-900/60 rounded-lg px-2 py-0.5 text-[11px] shadow-inner"
                          title={`Criaturas Derrotadas por ${char.name || 'este personagem'}: ${bestiaryStats.uniqueCount} espécie(s) diferente(s), ${bestiaryStats.totalCount} no total`}
                        >
                          <span className="text-indigo-300 font-medium whitespace-nowrap">
                            👾 <strong className="text-indigo-200 font-bold">{bestiaryStats.uniqueCount}</strong> dif.
                          </span>
                          <span className="text-slate-600 font-bold">•</span>
                          <span className="text-amber-300 font-medium whitespace-nowrap">
                            💀 <strong className="text-amber-200 font-bold">{bestiaryStats.totalCount}</strong> total
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Linha inteira com Raça, Tipo (Draconato/Golias) e Classe sem truncar (...) */}
                    <div className="bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
                      <p className="text-xs font-medium text-slate-300 leading-normal break-words">
                        <span className="font-bold text-slate-200">{char.race || 'Raça'}</span>
                        {draconicAncestry && <span className="text-amber-400 font-bold"> ({draconicAncestry})</span>}
                        {giantAncestry && <span className="text-amber-400 font-bold"> ({giantAncestry})</span>}
                        <span className="text-slate-500 mx-1.5">•</span>
                        <span className="text-slate-300">{char.class_name || 'Guerreiro'}</span>
                      </p>
                    </div>

                    {/* Atributos Básicos Mini */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">PV</span>
                        <span className="font-black text-red-400">
                          {(() => {
                            const maxHp = char.max_hp ?? char.maxHp ?? 10;
                            const currentHp = Math.min(char.current_hp ?? char.currentHp ?? maxHp, maxHp);
                            return `${currentHp}/${maxHp}`;
                          })()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">CA</span>
                        <span className="font-black text-amber-400">{char.armor_class ?? 10}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">FOR/DES</span>
                        <span className="font-bold text-slate-300">{char.strength ?? 10}/{char.dexterity ?? 10}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    {onEnterGame && (
                      <button
                        onClick={() => onEnterGame(char)}
                        className="flex-1 px-2.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition text-center shadow flex items-center justify-center gap-1 border border-amber-300"
                        title="Entrar na Mesa de Jogo"
                      >
                        🎮 Jogar
                      </button>
                    )}
                    <button
                      onClick={() => onSelectCharacter(char)}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-lg transition text-center border border-slate-600"
                    >
                      👁️ Ficha
                    </button>
                    <button
                      onClick={() => setCharToDelete({ id: char.id, name: char.name || 'Sem Nome' })}
                      className="px-2.5 py-2 bg-slate-800 hover:bg-red-900/80 text-slate-400 hover:text-red-200 font-semibold text-xs rounded-lg transition border border-slate-700"
                      title="Excluir do banco"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Banner de Notificação */}
      {notification && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
          notification.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-600 text-emerald-200' 
            : 'bg-amber-950/90 border-amber-600 text-amber-200'
        }`}>
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="text-xs px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded font-bold ml-4"
          >
            ✕ Fechar
          </button>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão (Substituindo confirm e alert do browser) */}
      {charToDelete && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => !deleting && setCharToDelete(null)}
        >
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-red-400">
              <span className="text-3xl">⚠️</span>
              <h3 className="text-xl font-bold text-slate-100" style={{ fontFamily: 'Georgia, serif' }}>
                Excluir Ficha do Personagem?
              </h3>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed">
              Deseja realmente apagar o personagem <strong className="text-amber-400">"{charToDelete?.name || 'Personagem'}"</strong>? Esta ação não poderá ser desfeita.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCharToDelete(null)}
                disabled={deleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-600 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteCharacter}
                disabled={deleting}
                className={`px-4 py-2 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 ${
                  deleting
                    ? 'bg-slate-700 text-slate-300 border border-slate-600 cursor-not-allowed opacity-90'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {deleting ? 'Excluindo...' : '🗑️ Sim, Excluir Ficha'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Bestiário */}
      {selectedCharForBestiary && (
        <BestiaryModal
          characterId={selectedCharForBestiary.id}
          defeatedMonsters={selectedCharForBestiary.defeated_monsters || selectedCharForBestiary.defeatedMonsters}
          onClose={() => setSelectedCharForBestiary(null)}
        />
      )}
    </div>
  );
};
