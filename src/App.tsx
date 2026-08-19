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

// Importações do sistema de autenticação e usuários
import { getCurrentUser, logoutUser } from './lib/api/authService';
import { LoginScreen } from './components/auth/LoginScreen';
import UserManagementTab from './components/admin/UserManagementTab';
import { AppUser } from './types/auth';

function App() {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [activeTab, setActiveTab] = useState<'character' | 'feats' | 'equipment' | 'spells' | 'classes' | 'races' | 'monsters' | 'backgrounds' | 'gameRules' | 'implementations' | 'users'>('character');
  const [characterView, setCharacterView] = useState<'menu' | 'creation' | 'sheet' | 'game'>('menu');
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Controle de Dificuldade de Combate
  const [showDifficultyPrompt, setShowDifficultyPrompt] = useState(false);
  const [pendingCharacter, setPendingCharacter] = useState<any>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  useEffect(() => {
    async function initAuthAndData() {
      setIsLoading(true);
      try {
        // Carrega usuário autenticado ativo no Supabase Auth
        if (isSupabaseConfigured) {
          const user = await getCurrentUser();
          setCurrentUser(user);
        }

        // Carrega dados do catálogo D&D
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
      
      // Direcionar para a ficha do novo personagem criado
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
          <header className="mb-8 text-center relative flex flex-col items-center">
            <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
              {/* Ícone do D&D (Dado D20 com Dragão e Ampersand) */}
              <div className="relative group shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-700 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-slate-950 border border-amber-500/50 rounded-xl flex items-center justify-center p-2 shadow-xl">
                  <svg className="w-full h-full text-amber-500 drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {/* D20 Outer Geometry */}
                    <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill="rgba(185, 28, 28, 0.2)" stroke="#f59e0b" strokeWidth="1.5"/>
                    <path d="M12 2V12M12 22V12" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="none"/>
                    <path d="M3 7L12 12L21 7" stroke="#f59e0b" strokeWidth="1.2"/>
                    <path d="M3 17L12 12L21 17" stroke="#f59e0b" strokeWidth="1.2"/>
                    {/* Dragon Ampersand Motif / Central Glow */}
                    <circle cx="12" cy="12" r="2.5" fill="#ef4444" className="animate-pulse"/>
                  </svg>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-amber-500 tracking-tighter" style={{ fontFamily: 'Georgia, serif' }}>
                DUNGEONS <span className="text-xl sm:text-2xl text-red-500 font-serif">&amp;</span> DRAGONS
              </h1>
            </div>
            
            <p className="text-slate-400 uppercase tracking-widest text-xs font-bold">Forje seu Herói e Viva a sua Lenda</p>
            
            <div className="mt-3 sm:mt-0 sm:absolute sm:right-0 sm:top-0 flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-1.5 text-xs shadow-lg">
              <div className="text-right text-left">
                <span className="block text-slate-200 font-bold">{currentUser.name}</span>
                <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded leading-none ${
                  currentUser.role === 'administrador' ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-400'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await logoutUser();
                  setCurrentUser(null);
                  setSession(null);
                  setActiveTab('character');
                  setCharacterView('menu');
                  setSelectedCharacter(null);
                }}
                className="bg-slate-800 hover:bg-red-600 hover:text-white px-2 py-1 rounded font-bold text-[10px] transition-all uppercase cursor-pointer border border-slate-700 hover:border-red-500"
              >
                Sair
              </button>
            </div>
          </header>
        )}

        {!isInGame && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <button 
              onClick={() => setActiveTab('character')}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
                activeTab === 'character' 
                  ? 'bg-amber-600 border-amber-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Personagens
            </button>
            <button 
              onClick={() => setActiveTab('classes')}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
                activeTab === 'classes' 
                  ? 'bg-amber-600 border-amber-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Classes
            </button>
            <button 
              onClick={() => setActiveTab('races')}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
                activeTab === 'races' 
                  ? 'bg-amber-600 border-amber-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Raças
            </button>
            <button 
              onClick={() => setActiveTab('backgrounds')}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
                activeTab === 'backgrounds' 
                  ? 'bg-amber-600 border-amber-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Antecedentes
            </button>
            <button 
              onClick={() => setActiveTab('feats')}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
                activeTab === 'feats' 
                  ? 'bg-amber-600 border-amber-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Talentos
            </button>
            <button 
              onClick={() => setActiveTab('equipment')}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
                activeTab === 'equipment' 
                  ? 'bg-amber-600 border-amber-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Equipamentos
            </button>
            <button 
              onClick={() => setActiveTab('spells')}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
                activeTab === 'spells' 
                  ? 'bg-amber-600 border-amber-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Magias
            </button>
            <button 
              onClick={() => setActiveTab('monsters')}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
                activeTab === 'monsters' 
                  ? 'bg-amber-600 border-amber-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Monstros
            </button>
            <button 
              onClick={() => setActiveTab('gameRules')}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
                activeTab === 'gameRules' 
                  ? 'bg-amber-600 border-amber-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Regras do Jogo
            </button>
            <button 
              onClick={() => setActiveTab('implementations')}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
                activeTab === 'implementations' 
                  ? 'bg-amber-600 border-amber-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              Implementações
            </button>
            
            {currentUser.role === 'administrador' && (
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded border transition-colors ${
                  activeTab === 'users' 
                    ? 'bg-amber-600 border-amber-500 text-white' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                Usuários
              </button>
            )}
          </div>
        )}

        <main className="flex-1 min-h-0 relative">
          {activeTab === 'character' && (
            <div className={isInGame ? 'h-full' : 'bg-slate-800/60 p-4 md:p-6 rounded-2xl border border-slate-700 shadow-xl overflow-y-auto h-full'}> 
              {showDifficultyPrompt && pendingCharacter ? (
                <div className="max-w-2xl mx-auto my-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-6 md:p-8 shadow-2xl animate-fade-in text-center">
                  <h3 className="text-2xl font-black text-amber-500 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                    🛡️ Selecione a Dificuldade do Combate
                  </h3>
                  <p className="text-slate-300 text-sm mb-6">
                    Seu personagem <strong className="text-amber-400">{pendingCharacter.name}</strong> (Nível {pendingCharacter.level} • {pendingCharacter.class_name || pendingCharacter.charClass || 'Aventureiro'}) está prestes a entrar na arena.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {/* FÁCIL */}
                    <button
                      type="button"
                      onClick={() => setSelectedDifficulty('easy')}
                      className={`flex flex-col items-center justify-between p-5 rounded-xl border text-center transition-all ${
                        selectedDifficulty === 'easy'
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500'
                          : 'bg-slate-850 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-3xl mb-2">🟢</span>
                        <h4 className={`font-black text-base ${selectedDifficulty === 'easy' ? 'text-emerald-400' : 'text-slate-200'}`}>
                          FÁCIL
                        </h4>
                        <p className="text-slate-450 text-xs mt-2 leading-relaxed">
                          Inimigos com CR reduzido e encontros menores. Ideal para testar habilidades e mecânicas com segurança.
                        </p>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider font-bold mt-4 px-2 py-0.5 rounded ${
                        selectedDifficulty === 'easy' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        Treinar &amp; Explorar
                      </span>
                    </button>

                    {/* MÉDIO */}
                    <button
                      type="button"
                      onClick={() => setSelectedDifficulty('medium')}
                      className={`flex flex-col items-center justify-between p-5 rounded-xl border text-center transition-all ${
                        selectedDifficulty === 'medium'
                          ? 'bg-amber-950/40 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500'
                          : 'bg-slate-850 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-3xl mb-2">🟡</span>
                        <h4 className={`font-black text-base ${selectedDifficulty === 'medium' ? 'text-amber-400' : 'text-slate-200'}`}>
                          MÉDIO
                        </h4>
                        <p className="text-slate-450 text-xs mt-2 leading-relaxed">
                          A autêntica aventura de D&D 5.5e. Combates equilibrados com perigo estratégico e recompensas ideais.
                        </p>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider font-bold mt-4 px-2 py-0.5 rounded ${
                        selectedDifficulty === 'medium' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        Experiência Padrão
                      </span>
                    </button>

                    {/* DIFÍCIL */}
                    <button
                      type="button"
                      onClick={() => setSelectedDifficulty('hard')}
                      className={`flex flex-col items-center justify-between p-5 rounded-xl border text-center transition-all ${
                        selectedDifficulty === 'hard'
                          ? 'bg-rose-950/40 border-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-rose-500'
                          : 'bg-slate-850 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-3xl mb-2">🔴</span>
                        <h4 className={`font-black text-base ${selectedDifficulty === 'hard' ? 'text-rose-400' : 'text-slate-200'}`}>
                          DIFÍCIL
                        </h4>
                        <p className="text-slate-450 text-xs mt-2 leading-relaxed">
                          Inimigos brutais e agressivos. Exige domínio de maestrias de arma, magias e recursos máximos para sobreviver.
                        </p>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider font-bold mt-4 px-2 py-0.5 rounded ${
                        selectedDifficulty === 'hard' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        Glória ou Morte
                      </span>
                    </button>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        setShowDifficultyPrompt(false);
                        setPendingCharacter(null);
                      }}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCharacter(pendingCharacter);
                        setShowDifficultyPrompt(false);
                        setPendingCharacter(null);
                        setCharacterView('game');
                      }}
                      className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-xl border border-amber-400 shadow-lg shadow-amber-500/10 transition-all flex items-center gap-2"
                    >
                      <span>⚔️</span> Entrar em Combate
                    </button>
                  </div>
                </div>
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
