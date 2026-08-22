import React, { useEffect, useState } from 'react';
import { getCharacters, deleteCharacter } from '../../lib/api/characterService';
import { BestiaryModal } from './BestiaryModal';
import { CharacterMenuHeader } from './menu/CharacterMenuHeader';
import { CharacterCardItem } from './menu/CharacterCardItem';
import { DeleteCharacterModal } from './menu/DeleteCharacterModal';

interface CharacterMenuProps {
  onCreateNew: () => void;
  onSelectCharacter: (character: any) => void;
  onEnterGame?: (character: any) => void;
}

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

  return (
    <div className="space-y-4">
      {/* Opções de Ação Principal */}
      <CharacterMenuHeader
        charactersCount={characters.length}
        loading={loading}
        onCreateNew={onCreateNew}
        onRefresh={fetchCharacters}
      />

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
            {characters.map((char, charIdx) => (
              <CharacterCardItem
                key={`${char.id || 'char'}-${charIdx}`}
                char={char}
                onEnterGame={onEnterGame}
                onSelectCharacter={onSelectCharacter}
                onOpenBestiary={setSelectedCharForBestiary}
                onRequestDelete={setCharToDelete}
              />
            ))}
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

      {/* Modal de Confirmação de Exclusão */}
      <DeleteCharacterModal
        charToDelete={charToDelete}
        deleting={deleting}
        onCancel={() => setCharToDelete(null)}
        onConfirm={confirmDeleteCharacter}
      />

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
