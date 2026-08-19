import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Sword, Lock, User, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { loginUser, registerNewUser } from '../../lib/api/authService';
import { AppUser } from '../../types/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: AppUser) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegistering) {
        const cleanName = name.trim();
        const cleanUsername = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();

        if (!cleanName || !cleanUsername || !cleanEmail || !password) {
          setError('Por favor, preencha todos os campos do formulário.');
          setIsLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError('As senhas digitadas não coincidem.');
          setIsLoading(false);
          return;
        }

        if (password.length < 8) {
          setError('A senha deve conter no mínimo 8 caracteres.');
          setIsLoading(false);
          return;
        }

        const newUser = await registerNewUser({
          name: cleanName,
          username: cleanUsername,
          email: cleanEmail,
          password: password
        });

        onLoginSuccess(newUser);
      } else {
        const cleanIdentifier = emailOrUsername.trim();
        if (!cleanIdentifier || !password) {
          setError('Por favor, preencha o e-mail/usuário e a senha.');
          setIsLoading(false);
          return;
        }

        const loggedUser = await loginUser(cleanIdentifier, password);
        onLoginSuccess(loggedUser);
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao processar a autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Ambience Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-slate-900/85 border border-amber-500/20 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md relative z-10"
      >
        {/* Header da Tela de Login */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group shrink-0 mb-4">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-700 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-14 h-14 bg-slate-950 border border-amber-500/50 rounded-xl flex items-center justify-center p-2.5 shadow-xl">
              <svg className="w-full h-full text-amber-500 drop-shadow-[0_2px_4px_rgba(239,68,68,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L21 7V17L12 22L3 17V7L12 2Z" fill="rgba(185, 28, 28, 0.2)" stroke="#f59e0b" strokeWidth="1.5"/>
                <path d="M12 2V12M12 22V12" stroke="#f59e0b" strokeWidth="1.2"/>
                <path d="M3 7L12 12L21 7" stroke="#f59e0b" strokeWidth="1.2"/>
                <path d="M3 17L12 12L21 17" stroke="#f59e0b" strokeWidth="1.2"/>
                <circle cx="12" cy="12" r="2" fill="#ef4444"/>
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-black text-amber-500 tracking-tight text-center" style={{ fontFamily: 'Georgia, serif' }}>
            DUNGEONS &amp; DRAGONS
          </h2>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-bold">
            {isRegistering ? 'Forje sua Conta de Jogador' : 'Faça Login na sua Campanha'}
          </p>
        </div>

        {/* Notificações de Erro */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 p-3 bg-red-950/40 border border-red-800/60 rounded-xl flex items-start gap-2.5 text-red-400 text-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Formulário de Autenticação */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nome Completo / Nome do Jogador
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Ex: Arthur Pendragon"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nome de Usuário (@username)
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Ex: arthur_guerreiro"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  E-mail de Acesso
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="seu.email@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                E-mail ou Usuário
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Digite seu e-mail de acesso"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Senha {isRegistering && '(mínimo 8 caracteres)'}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-11 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {isRegistering && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirme sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-black uppercase tracking-wider py-3 rounded-xl border border-amber-400 shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : isRegistering ? (
              <>
                <Sword className="w-4 h-4" />
                <span>Criar Conta &amp; Entrar</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Entrar no Jogo</span>
              </>
            )}
          </button>
        </form>

        {/* Alternar entre Login / Cadastro */}
        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError(null);
            }}
            className="text-xs text-amber-500 hover:text-amber-400 font-bold underline cursor-pointer"
          >
            {isRegistering ? 'Já possui uma conta? Faça login aqui' : 'Não tem uma conta? Crie sua conta de jogador'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
