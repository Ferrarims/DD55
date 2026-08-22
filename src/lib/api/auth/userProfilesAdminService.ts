import { supabase, isSupabaseConfigured } from '../supabase';
import { AppUser } from '../../../types/auth';

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
