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
