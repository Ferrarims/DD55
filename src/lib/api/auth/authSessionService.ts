import { supabase, isSupabaseConfigured } from '../supabase';
import { AppUser, SignUpCredentials } from '../../../types/auth';
import { formatAuthError } from './authErrorFormatter';

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

    const fallbackName = (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'Aventureiro';
    const fallbackUsername = (user.user_metadata?.username as string) || user.email?.split('@')[0] || `hero_${user.id.substring(0, 5)}`;

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

  let loginEmail = cleanIdentifier;
  if (!loginEmail.includes('@')) {
    loginEmail = `${cleanIdentifier}@dnd.local`;
  }

  let authResult = await supabase.auth.signInWithPassword({
    email: loginEmail,
    password: password
  });

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
