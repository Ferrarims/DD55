import { supabase, isSupabaseConfigured } from './supabase';
import { AppUser, SignUpCredentials } from '../../types/auth';

/**
 * Traduz erros do Supabase Auth para mensagens claras em Português do Brasil
 */
export function formatAuthError(error: any): string {
  if (!error) return 'Ocorreu um erro inesperado.';
  const msg = error.message || String(error);

  if (/invalid login credentials/i.test(msg) || /invalid_grant/i.test(msg)) {
    return 'E-mail ou senha incorretos.';
  }
  if (/user already registered/i.test(msg) || /email already in use/i.test(msg)) {
    return 'Este e-mail já está cadastrado no sistema.';
  }
  if (/password should be at least 6 characters/i.test(msg) || /weak_password/i.test(msg)) {
    return 'A senha deve conter no mínimo 6 caracteres.';
  }
  if (/email not confirmed/i.test(msg)) {
    return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.';
  }
  if (/rate limit/i.test(msg) || /too many requests/i.test(msg)) {
    return 'Muitas tentativas em pouco tempo. Por favor, aguarde alguns instantes.';
  }
  if (/invalid email/i.test(msg) || /unable to validate email/i.test(msg)) {
    return 'Por favor, insira um endereço de e-mail válido.';
  }
  if (/database error/i.test(msg) || /violates foreign key/i.test(msg)) {
    return 'Erro ao registrar perfil no banco de dados. A migration de segurança pode ser necessária.';
  }

  return msg;
}

/**
 * Obtém o perfil do usuário atualmente autenticado no Supabase Auth.
 * Trata com resiliência a ausência temporária de registro em public.app_users.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    // Consulta o perfil na tabela public.app_users
    const { data: profile, error: profileError } = await (supabase
      .from('app_users') as any)
      .select('id, username, name, role, created_at')
      .eq('id', user.id)
      .maybeSingle();

    if (profile && !profileError) {
      return {
        id: profile.id,
        username: profile.username,
        name: profile.name,
        role: profile.role as 'administrador' | 'jogador',
        email: user.email,
        created_at: profile.created_at || user.created_at
      };
    }

    // Tratamento de ausência temporária de perfil (durante migração ou primeiro login)
    const fallbackName = (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'Aventureiro';
    const fallbackUsername = (user.user_metadata?.username as string) || user.email?.split('@')[0] || `hero_${user.id.substring(0, 5)}`;

    // Tentar criar perfil padrão de jogador se ainda não existir
    try {
      const { data: createdProfile, error: insertError } = await (supabase
        .from('app_users') as any)
        .insert({
          id: user.id,
          username: fallbackUsername,
          name: fallbackName,
          role: 'jogador'
        })
        .select('id, username, name, role, created_at')
        .single();

      if (createdProfile && !insertError) {
        return {
          id: createdProfile.id,
          username: createdProfile.username,
          name: createdProfile.name,
          role: createdProfile.role as 'administrador' | 'jogador',
          email: user.email,
          created_at: createdProfile.created_at || user.created_at
        };
      }
    } catch (createErr) {
      console.warn('Aviso: Perfil em public.app_users ainda não disponível:', createErr);
    }

    // Retorna representação segura em memória baseada no token autenticado
    return {
      id: user.id,
      username: fallbackUsername,
      name: fallbackName,
      role: 'jogador',
      email: user.email,
      created_at: user.created_at
    };
  } catch (e) {
    console.error('Erro ao obter usuário autenticado:', e);
    return null;
  }
}

/**
 * Autentica o usuário exclusivamente via Supabase Auth (signInWithPassword).
 */
export async function loginUser(emailOrUsername: string, password: string): Promise<AppUser> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não está configurado. Verifique as credenciais VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.');
  }

  const cleanIdentifier = emailOrUsername.trim().toLowerCase();

  if (!cleanIdentifier || !password) {
    throw new Error('E-mail e senha são obrigatórios.');
  }

  // Se o usuário digitou sem @, tenta como email local formatado ou email direto
  let loginEmail = cleanIdentifier;
  if (!loginEmail.includes('@')) {
    loginEmail = `${cleanIdentifier}@dnd.local`;
  }

  let authResult = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password: password
  });

  // Se falhou com @dnd.local e não tinha @ originalmente, tenta o identificador direto
  if (authResult.error && loginEmail !== cleanIdentifier) {
    const retryResult = await supabase.auth.signInWithPassword({
      email: cleanIdentifier,
      password: password
    });
    if (!retryResult.error) {
      authResult = retryResult;
    }
  }

  if (authResult.error) {
    throw new Error(formatAuthError(authResult.error));
  }

  const userProfile = await getCurrentUser();
  if (!userProfile) {
    throw new Error('Falha ao carregar perfil de usuário após login.');
  }

  return userProfile;
}

/**
 * Cadastra um novo usuário no Supabase Auth e registra seu perfil de jogador.
 * Novos cadastros sempre recebem o papel 'jogador'.
 */
export async function registerNewUser(credentials: SignUpCredentials): Promise<AppUser> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não está configurado. Verifique as credenciais nas variáveis de ambiente.');
  }

  const cleanEmail = credentials.email.trim().toLowerCase();
  const cleanUsername = credentials.username.trim().toLowerCase();
  const cleanName = credentials.name.trim();

  if (!cleanEmail || !credentials.password || !cleanName || !cleanUsername) {
    throw new Error('Todos os campos são obrigatórios para cadastro.');
  }

  if (credentials.password.length < 8) {
    throw new Error('A senha deve conter no mínimo 8 caracteres.');
  }

  // 1. Cadastra no Supabase Auth oficial
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: cleanEmail,
    password: credentials.password,
    options: {
      data: {
        name: cleanName,
        username: cleanUsername
      }
    }
  });

  if (authError) {
    throw new Error(formatAuthError(authError));
  }

  const authUser = authData.user;
  if (!authUser) {
    throw new Error('Não foi possível concluir o cadastro do usuário.');
  }

  // 2. Criação do perfil em public.app_users com role = 'jogador'
  try {
    const { error: profileError } = await (supabase
      .from('app_users') as any)
      .insert({
        id: authUser.id,
        username: cleanUsername,
        name: cleanName,
        role: 'jogador'
      });

    if (profileError) {
      console.warn('Aviso ao inserir perfil (trigger pode ter criado automaticamente):', profileError);
    }
  } catch (err) {
    console.warn('Inserção manual de perfil ignorada:', err);
  }

  const userProfile = await getCurrentUser();
  if (userProfile) {
    return userProfile;
  }

  return {
    id: authUser.id,
    username: cleanUsername,
    name: cleanName,
    role: 'jogador',
    email: authUser.email,
    created_at: authUser.created_at
  };
}

/**
 * Encerra a sessão ativa no Supabase Auth.
 */
export async function logoutUser(): Promise<void> {
  if (isSupabaseConfigured) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Erro ao deslogar do Supabase:', e);
    }
  }
}

/**
 * Lista todos os perfis cadastrados na tabela public.app_users.
 * Protegido por RLS no banco: apenas administradores conseguem listar todos os usuários.
 */
export async function listAllUsers(adminUser?: AppUser): Promise<AppUser[]> {
  if (!isSupabaseConfigured) {
    return [];
  }

  const { data, error } = await (supabase
    .from('app_users') as any)
    .select('id, username, name, role, created_at')
    .order('name', { ascending: true });

  if (error) {
    console.error('Erro ao listar usuários:', error);
    throw new Error('Permissão negada ou erro ao carregar perfis de usuários.');
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role as 'administrador' | 'jogador',
    created_at: row.created_at
  }));
}

/**
 * Atualiza o papel (role) de um usuário entre 'administrador' e 'jogador'.
 * Protegido: apenas administradores podem executar esta operação.
 */
export async function updateUserRole(
  adminUser: AppUser,
  targetUserId: string,
  newRole: 'administrador' | 'jogador'
): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado.');
  }

  if (adminUser.role !== 'administrador') {
    throw new Error('Acesso negado. Apenas administradores podem alterar permissões de usuários.');
  }

  if (!targetUserId) {
    throw new Error('ID de usuário inválido.');
  }

  if (adminUser.id === targetUserId && newRole !== 'administrador') {
    throw new Error('Você não pode remover a permissão de administrador da sua própria conta.');
  }

  const { error } = await (supabase
    .from('app_users') as any)
    .update({ role: newRole })
    .eq('id', targetUserId);

  if (error) {
    console.error('Erro ao atualizar permissão do usuário no banco:', error);
    throw new Error(`Não foi possível alterar a permissão do usuário: ${error.message || 'Erro no banco de dados'}`);
  }
}

/**
 * Exclui um perfil de usuário. Apenas administradores possuem permissão de exclusão via RLS.
 */
export async function deleteUser(adminUser: AppUser, userIdToDelete: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase não configurado.');
  }

  if (adminUser.id === userIdToDelete) {
    throw new Error('Você não pode excluir a sua própria conta ativa.');
  }

  if (adminUser.role !== 'administrador') {
    throw new Error('Acesso negado. Apenas administradores podem excluir usuários.');
  }

  const { error } = await (supabase
    .from('app_users') as any)
    .delete()
    .eq('id', userIdToDelete);

  if (error) {
    console.error('Erro ao excluir usuário no banco:', error);
    throw new Error('Não foi possível excluir o usuário. Verifique as permissões de administrador.');
  }
}
