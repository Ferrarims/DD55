export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: 'administrador' | 'jogador';
  created_at?: string;
}

export interface AuthSession {
  user: AppUser;
  token?: string;
}
