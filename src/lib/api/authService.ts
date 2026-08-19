import { supabase, isSupabaseConfigured } from './supabase';
import { AppUser } from '../../types/auth';

const LOCAL_STORAGE_USERS_KEY = 'dnd_app_users';
const LOCAL_STORAGE_CURRENT_USER_KEY = 'dnd_app_current_user';

// Usuários iniciais padrão para testes e demonstração imediata
const DEFAULT_USERS: AppUser[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    username: 'admin',
    name: 'Mestre da Masmorra (Admin)',
    role: 'administrador',
    created_at: new Date().toISOString()
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    username: 'jogador1',
    name: 'Aventureiro Iniciante',
    role: 'jogador',
    created_at: new Date().toISOString()
  }
];

// Senhas padrão associadas aos usuários locais para simulação de login seguro
const LOCAL_STORAGE_PASSWORDS_KEY = 'dnd_app_user_passwords';
const DEFAULT_PASSWORDS: Record<string, string> = {
  'admin': 'admin123',
  'jogador1': 'jogador123'
};

function getLocalUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      localStorage.setItem(LOCAL_STORAGE_PASSWORDS_KEY, JSON.stringify(DEFAULT_PASSWORDS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.some(u => u.id === 'admin-id-default' || u.id === 'jogador-id-default')) {
      localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      localStorage.setItem(LOCAL_STORAGE_PASSWORDS_KEY, JSON.stringify(DEFAULT_PASSWORDS));
      return DEFAULT_USERS;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_USERS;
  }
}

function saveLocalUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Erro ao salvar usuários locais:', e);
  }
}

function getLocalPasswords(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PASSWORDS_KEY);
    if (!raw) return DEFAULT_PASSWORDS;
    return JSON.parse(raw);
  } catch (e) {
    return DEFAULT_PASSWORDS;
  }
}

function saveLocalPasswords(passwords: Record<string, string>): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PASSWORDS_KEY, JSON.stringify(passwords));
  } catch (e) {
    console.warn('Erro ao salvar senhas locais:', e);
  }
}

/**
 * Obtém o usuário atualmente logado
 */
export function getCurrentUser(): AppUser | null {
  try {
    let raw = sessionStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    if (!raw) {
      raw = localStorage.getItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    }
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (user && (user.id === 'admin-id-default' || user.id === 'jogador-id-default')) {
      if (user.id === 'admin-id-default') {
        user.id = 'a0000000-0000-0000-0000-000000000001';
      } else {
        user.id = 'a0000000-0000-0000-0000-000000000002';
      }
      localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
    }
    return user;
  } catch (e) {
    return null;
  }
}

/**
 * Define o usuário logado no momento
 */
export function setCurrentUser(user: AppUser | null, remember: boolean = true): void {
  try {
    if (user) {
      if (remember) {
        localStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
        sessionStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
      } else {
        sessionStorage.setItem(LOCAL_STORAGE_CURRENT_USER_KEY, JSON.stringify(user));
        localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
      }
    } else {
      localStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
      sessionStorage.removeItem(LOCAL_STORAGE_CURRENT_USER_KEY);
    }
  } catch (e) {
    console.warn('Erro ao salvar sessão de usuário no localStorage/sessionStorage:', e);
  }
}

/**
 * Tenta realizar o login de um usuário
 */
export async function loginUser(username: string, password: string, remember: boolean = true): Promise<AppUser> {
  const cleanUsername = username.trim().toLowerCase();
 
  // Se o Supabase estiver configurado, tentamos sincronizar ou buscar de lá
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase
        .from('app_users') as any)
        .select('*')
        .eq('username', cleanUsername)
        .eq('password', password) // Em um sistema real, usaríamos hash, mas como solicitado é para um app de portfólio D&D
        .maybeSingle();
 
      if (error) {
        console.warn('Erro ao consultar Supabase para login, usando fallback local:', error);
      } else if (data) {
        const loggedUser: AppUser = {
          id: data.id,
          username: data.username,
          name: data.name,
          role: data.role as 'administrador' | 'jogador',
          created_at: data.created_at
        };
        setCurrentUser(loggedUser, remember);
        return loggedUser;
      }
    } catch (e) {
      console.warn('Erro de conexão ao tentar fazer login com Supabase:', e);
    }
  }
 
  // Fallback Local Storage
  const users = getLocalUsers();
  const passwords = getLocalPasswords();
 
  const matchedUser = users.find(u => u.username.toLowerCase() === cleanUsername);
  if (!matchedUser || passwords[cleanUsername] !== password) {
    throw new Error('Usuário ou senha incorretos.');
  }
 
  setCurrentUser(matchedUser, remember);
  return matchedUser;
}

/**
 * Realiza o logout do usuário atual
 */
export function logoutUser(): void {
  setCurrentUser(null);
}

/**
 * Lista todos os usuários (Apenas para administradores)
 */
export async function listAllUsers(adminUser: AppUser): Promise<AppUser[]> {
  if (adminUser.role !== 'administrador') {
    throw new Error('Acesso negado. Apenas administradores podem ver a lista de usuários.');
  }

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase
        .from('app_users') as any)
        .select('id, username, name, role, created_at')
        .order('name', { ascending: true });

      if (error) {
        console.warn('Erro ao listar usuários no Supabase, retornando lista local:', error);
      } else if (data) {
        // Sincroniza localmente para garantir consistência
        const syncUsers = data.map((d: any) => ({
          id: d.id,
          username: d.username,
          name: d.name,
          role: d.role as 'administrador' | 'jogador',
          created_at: d.created_at
        }));
        saveLocalUsers(syncUsers);
        return syncUsers;
      }
    } catch (e) {
      console.warn('Erro de rede ao listar usuários do Supabase:', e);
    }
  }

  return getLocalUsers();
}

/**
 * Cadastra um novo usuário no sistema (Apenas administradores podem criar)
 */
export async function registerNewUser(
  adminUser: AppUser,
  userData: { username: string; name: string; role: 'administrador' | 'jogador'; password?: string }
): Promise<AppUser> {
  if (adminUser.role !== 'administrador') {
    throw new Error('Acesso negado. Apenas administradores podem cadastrar novos usuários.');
  }

  const cleanUsername = userData.username.trim().toLowerCase();
  const password = userData.password || '123456';

  if (!cleanUsername || !userData.name) {
    throw new Error('Nome de usuário e nome completo são campos obrigatórios.');
  }

  // Verificar se usuário já existe localmente
  const localUsers = getLocalUsers();
  if (localUsers.some(u => u.username.toLowerCase() === cleanUsername)) {
    throw new Error(`O usuário "${cleanUsername}" já está cadastrado.`);
  }

  const newUser: AppUser = {
    id: crypto.randomUUID(),
    username: cleanUsername,
    name: userData.name.trim(),
    role: userData.role,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await (supabase
        .from('app_users') as any)
        .insert({
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          role: newUser.role,
          password: password,
          created_at: newUser.created_at
        })
        .select()
        .single();

      if (error) {
        console.warn('Erro ao inserir usuário no Supabase, salvando apenas localmente:', error);
      } else if (data) {
        newUser.id = data.id;
        newUser.created_at = data.created_at;
      }
    } catch (e) {
      console.warn('Erro de rede ao salvar usuário no Supabase:', e);
    }
  }

  // Salvar localmente
  localUsers.push(newUser);
  saveLocalUsers(localUsers);

  // Salvar senha correspondente
  const localPasswords = getLocalPasswords();
  localPasswords[cleanUsername] = password;
  saveLocalPasswords(localPasswords);

  return newUser;
}

/**
 * Remove um usuário (Apenas administradores podem remover)
 */
export async function deleteUser(adminUser: AppUser, userIdToDelete: string): Promise<void> {
  if (adminUser.role !== 'administrador') {
    throw new Error('Acesso negado. Apenas administradores podem remover usuários.');
  }

  if (adminUser.id === userIdToDelete) {
    throw new Error('Você não pode excluir a sua própria conta ativa.');
  }

  const localUsers = getLocalUsers();
  const userToDelete = localUsers.find(u => u.id === userIdToDelete);

  if (isSupabaseConfigured) {
    try {
      const { error } = await (supabase
        .from('app_users') as any)
        .delete()
        .eq('id', userIdToDelete);

      if (error) {
        console.warn('Erro ao deletar usuário no Supabase:', error);
      }
    } catch (e) {
      console.warn('Erro de rede ao deletar usuário no Supabase:', e);
    }
  }

  // Deletar da lista local
  const updatedUsers = localUsers.filter(u => u.id !== userIdToDelete);
  saveLocalUsers(updatedUsers);

  // Deletar a senha correspondente
  if (userToDelete) {
    const localPasswords = getLocalPasswords();
    delete localPasswords[userToDelete.username.toLowerCase()];
    saveLocalPasswords(localPasswords);
  }
}
