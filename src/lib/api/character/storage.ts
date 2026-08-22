import { supabase, isSupabaseConfigured } from '../supabase';
import { LOCAL_STORAGE_CHARS_KEY } from './characterConstants';

export { LOCAL_STORAGE_CHARS_KEY };

export function getLocalCharacters(): any[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHARS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      let changed = false;
      const migrated = parsed.map(c => {
        if (c.user_id === 'admin-id-default') {
          c.user_id = 'a0000000-0000-0000-0000-000000000001';
          changed = true;
        } else if (c.user_id === 'jogador-id-default') {
          c.user_id = 'a0000000-0000-0000-0000-000000000002';
          changed = true;
        }
        return c;
      });
      if (changed) {
        saveLocalCharacters(migrated);
      }
      return migrated;
    }
    return [];
  } catch (e) {
    return [];
  }
}

export function saveLocalCharacters(chars: any[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_CHARS_KEY, JSON.stringify(chars));
  } catch (e) {
    console.warn('Erro ao persistir personagens no localStorage:', e);
  }
}

export async function getAuthUserId(): Promise<string | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (e) {
    return null;
  }
}
