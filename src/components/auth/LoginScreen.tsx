import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Sword, AlertCircle } from 'lucide-react';
import { loginUser, registerNewUser } from '../../lib/api/authService';
import { AppUser } from '../../types/auth';
import { LoginHeader } from './login/LoginHeader';
import { RegisterFields } from './login/RegisterFields';
import { LoginFormFields } from './login/LoginFormFields';

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
        <LoginHeader isRegistering={isRegistering} />

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

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering ? (
            <RegisterFields
              name={name}
              setName={setName}
              username={username}
              setUsername={setUsername}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isLoading={isLoading}
            />
          ) : (
            <LoginFormFields
              emailOrUsername={emailOrUsername}
              setEmailOrUsername={setEmailOrUsername}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isLoading={isLoading}
            />
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
