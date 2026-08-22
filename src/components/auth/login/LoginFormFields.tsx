import React from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginFormFieldsProps {
  emailOrUsername: string;
  setEmailOrUsername: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  isLoading: boolean;
}

export const LoginFormFields: React.FC<LoginFormFieldsProps> = ({
  emailOrUsername,
  setEmailOrUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
}) => {
  return (
    <>
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

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          Senha
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
    </>
  );
};
