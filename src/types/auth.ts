export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: 'administrador' | 'jogador';
  email?: string;
  created_at?: string;
}

export interface AuthSession {
  user: AppUser;
  token?: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
  username: string;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}
