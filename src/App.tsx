import { useState, useEffect } from 'react';
import { CharacterCreation } from './components/character/CharacterCreation';
import { CharacterMenu } from './components/character/CharacterMenu';
import { CharacterSheet } from './components/character/CharacterSheet';
import { GamePlatform } from './components/game/GamePlatform';
import FeatsList from './components/shared/FeatsList';
import EquipmentList from './components/shared/EquipmentList';
import SpellsList from './components/shared/SpellsList';
import ClassesList from './components/shared/ClassesList';
import RacesList from './components/shared/RacesList';
import BackgroundsList from './components/shared/BackgroundsList';
import MonstersList from './components/shared/MonstersList';
import GameRulesList from './components/shared/GameRulesList';
import ImplementationsList from './components/shared/ImplementationsList';
import { supabase, isSupabaseConfigured } from './lib/api/supabase';
import { fetchItemsFromDb } from './lib/api/itemsService';
import { fetchMonstersFromDb } from './lib/api/monstersService';
import { fetchClassesFromDb } from './lib/api/classesService';
import { fetchFeatsFromDb } from './lib/api/featsService';
import { fetchRacesFromDb } from './lib/api/racesService';
import { fetchSpellsFromDb } from './lib/api/spellsService';
import { fetchBackgroundsFromDb } from './lib/api/backgroundsService';
import { createCharacter, deleteCharacter, getCharacterById } from './lib/api/characterService';
import { getCurrentUser } from './lib/api/authService';
import { LoginScreen } from './components/auth/LoginScreen';
import UserManagementTab from './components/admin/UserManagementTab';
import { AppUser } from './types/auth';
import { AppHeader } from './components/layout/AppHeader';
import { AppNavigation } from './components/layout/AppNavigation';
import { CombatDifficultyPrompt } from './components/game/CombatDifficultyPrompt';

function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState<'character' | 'feats' | 'equipment' | 'spells' | 'classes' | 'races' | 'monsters' | 'backgrounds' | 'gameRules' | 'implementations' | 'users'>('character');
  const [characterView, setCharacterView] = useState<'menu' | 'creation' | 'sheet' | 'game'>('menu');
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [showDifficultyPrompt, setShowDifficultyPrompt] = useState(false);
  const [pendingCharacter, setPendingCharacter] = useState<any>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    async function initAuthAndData() {
      setIsLoading(true);
      try {
        if (isSupabaseConfigured) {
          const user = await getCurrentUser();
          setCurrentUser(user);
        }
        await fetchItemsFromDb();
        await Promise.all([
          fetchMonstersFromDb(),
          fetchClassesFromDb(),
          fetchFeatsFromDb(),
          fetchRacesFromDb(),
          fetchSpellsFromDb(),
          fetchBackgroundsFromDb()
        ]);
      } catch (err) {
        console.warn('Erro ao carregar dados do banco/fallback:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuthAndData();

    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      }).catch((err) => {
        console.warn('Erro ao obter sessão de autenticação do Supabase:', err);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          const profile = await getCurrentUser();
          setCurrentUser(profile);
        } else {
          setCurrentUser(null);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setSession(null);
    }
  }, []);

  const handleSaveCharacter = async (characterData: any) => {
    try {
      const insertedChar = await createCharacter(characterData, session);
      alert('Personagem criado e salvo com sucesso!');
      setSelectedCharacter(insertedChar);
      setCharacterView('sheet');
    } catch (err: any) {
      console.error(err);
      alert('Erro ao salvar personagem: ' + (err.message || String(err)));
    }
  };

  const handleDeleteCharacterFromSheet = async (id: string) => {
    try {
      await deleteCharacter(id);
    } catch (err: any) {
      console.error('Erro ao excluir personagem da ficha:', err);
    } finally {
      setSelectedCharacter(null);
      setCharacterView('menu');
    }
  };

  const refreshSelectedCharacter = async (charId: string) => {
    if (!charId) return;
    try {
      const char = await getCharacterById(charId);
      if (char) {
        setSelectedCharacter(char);
      }
    } catch (e) {
      console.error('Erro ao atualizar personagem:', e);
    }
  };

  const isInGame = activeTab === 'character' && characterView === 'game';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-amber-500 font-bold text-xl">
         Carregando dados...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-200 font-sans flex flex-col ${isInGame ? 'p-1 md:p-2' : 'p-4 md:p-8'}`}>
      <div className={`${isInGame ? 'max-w-full px-1 md:px-2' : 'max-w-7xl'} mx-auto w-full flex-1 flex flex-col`}>
        
        {!isInGame && (
          <AppHeader
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            setSession={setSession}
            setActiveTab={setActiveTab}
            setCharacterView={setCharacterView}
            setSelectedCharacter={setSelectedCharacter}
          />
        )}

        {!isInGame && (
          <AppNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAdmin={currentUser.role === 'administrador'}
          />
        )}

        <main className="flex-1 min-h-0 relative">
          {activeTab === 'character' && (
            <div className={isInGame ? 'h-full' : 'bg-slate-800/60 p-4 md:p-6 rounded-2xl border border-slate-700 shadow-xl overflow-y-auto h-full'}> 
              {showDifficultyPrompt && pendingCharacter ? (
                <CombatDifficultyPrompt
                  pendingCharacter={pendingCharacter}
                  selectedDifficulty={selectedDifficulty}
                  setSelectedDifficulty={setSelectedDifficulty}
                  onBack={() => {
                    setShowDifficultyPrompt(false);
                    setPendingCharacter(null);
                  }}
                  onConfirm={() => {
                    setSelectedCharacter(pendingCharacter);
                    setShowDifficultyPrompt(false);
                    setPendingCharacter(null);
                    setCharacterView('game');
                  }}
                />
              ) : (
                <>
                  {characterView === 'menu' && (
                    <CharacterMenu
                      onCreateNew={() => setCharacterView('creation')}
                      onSelectCharacter={(char) => {
                        setSelectedCharacter(char);
                        setCharacterView('sheet');
                      }}
                      onEnterGame={(char) => {
                        setPendingCharacter(char);
                        setShowDifficultyPrompt(true);
                      }}
                    />
                  )}

                  {characterView === 'creation' && (
                    <div>
                      <div className="mb-4">
                        <button
                          onClick={() => setCharacterView('menu')}
                          className="text-xs bg-slate-700 hover:bg-slate-600 text-amber-400 font-bold px-3 py-1.5 rounded border border-slate-600 transition"
                        >
                          ← Voltar para Menu Inicial
                        </button>
                      </div>
                      <CharacterCreation onComplete={handleSaveCharacter} />
                    </div>
                  )}

                  {characterView === 'sheet' && selectedCharacter && (
                    <CharacterSheet
                      character={selectedCharacter}
                      onBack={() => {
                        setSelectedCharacter(null);
                        setCharacterView('menu');
                      }}
                      onDelete={handleDeleteCharacterFromSheet}
                      onEnterGame={(char) => {
                        setPendingCharacter(char);
                        setShowDifficultyPrompt(true);
                      }}
                      onCharacterUpdated={async () => {
                        if (selectedCharacter?.id) {
                          await refreshSelectedCharacter(selectedCharacter.id);
                        }
                      }}
                    />
                  )}

                  {characterView === 'game' && selectedCharacter && (
                    <GamePlatform
                      character={selectedCharacter}
                      difficulty={selectedDifficulty}
                      onExitGame={() => setCharacterView('sheet')}
                      onCharacterUpdated={async () => {
                        if (selectedCharacter?.id) {
                          await refreshSelectedCharacter(selectedCharacter.id);
                        }
                      }}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'feats' && <FeatsList />}
          {activeTab === 'equipment' && <EquipmentList />}
          {activeTab === 'spells' && <SpellsList />}
          {activeTab === 'classes' && <ClassesList />}
          {activeTab === 'backgrounds' && <BackgroundsList />}
          {activeTab === 'races' && <RacesList />}
          {activeTab === 'monsters' && <MonstersList />}
          {activeTab === 'gameRules' && <GameRulesList />}
          {activeTab === 'implementations' && <ImplementationsList />}
          {activeTab === 'users' && currentUser?.role === 'administrador' && (
            <UserManagementTab currentUser={currentUser} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
