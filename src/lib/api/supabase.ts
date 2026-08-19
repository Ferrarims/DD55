import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/database.types';

const getEnvVar = (name: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return (import.meta.env[name] as string || '').trim();
    }
  } catch (e) {}
  return (process.env[name] || '').trim();
};

let supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Validação básica da URL para evitar erros de "Invalid URL"
let isValidUrl = false;
try {
  if (supabaseUrl) {
    // Garante que usamos apenas a origem (ex: https://xyz.supabase.co), 
    // removendo qualquer sufixo como /rest/v1 que o usuário possa ter copiado
    supabaseUrl = new URL(supabaseUrl).origin;
    isValidUrl = true;
  }
} catch (e) {
  isValidUrl = false;
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'As credenciais do Supabase estão ausentes. Por favor, adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente (Secrets).'
  );
} else if (!isValidUrl) {
  console.error(
    'A VITE_SUPABASE_URL fornecida não é uma URL válida. Certifique-se de que ela comece com https:// (ex: https://seu-projeto.supabase.co)'
  );
}

// Cria um fetch personalizado para injetar o cabeçalho 'x-user-id' dinamicamente em todas as chamadas
const customFetch = (input: RequestInfo | URL, init?: RequestInit) => {
  const headers = new Headers(init?.headers);
  try {
    const userRaw = localStorage.getItem('dnd_app_current_user');
    if (userRaw) {
      const user = JSON.parse(userRaw);
      if (user && user.id) {
        headers.set('x-user-id', user.id);
      }
    }
  } catch (e) {
    console.warn('Erro ao ler usuário no customFetch:', e);
  }
  return fetch(input, { ...init, headers });
};

// Cria e exporta o client do Supabase para ser usado em toda a aplicação
export const supabase = createClient<Database>(
  isValidUrl ? supabaseUrl : 'https://sua-url-placeholder.supabase.co',
  supabaseAnonKey || 'sua-chave-anon-placeholder',
  {
    global: {
      fetch: customFetch
    }
  }
);

export const isSupabaseConfigured = 
  isValidUrl && 
  !!supabaseUrl && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseUrl.includes('YOUR_SUPABASE') &&
  !supabaseUrl.includes('sua-url') &&
  !supabaseUrl.includes('exemplo') &&
  !!supabaseAnonKey && 
  !supabaseAnonKey.includes('placeholder') && 
  !supabaseAnonKey.includes('YOUR_SUPABASE') &&
  !supabaseAnonKey.includes('sua-chave') &&
  !supabaseAnonKey.includes('exemplo');

