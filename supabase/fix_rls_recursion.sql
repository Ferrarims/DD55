-- =====================================================================
-- SCRIPT DE CORREÇÃO DEFINITIVA DE RECURSÃO (VERSÃO ULTRA-ROBUSTA)
-- Execute este script no SQL Editor do seu painel do Supabase.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. LIMPEZA TOTAL E DINÂMICA DE TODAS AS POLÍTICAS ANTIGAS EM app_users
-- ---------------------------------------------------------------------
-- Este bloco PL/pgSQL remove TODAS as políticas existentes na tabela app_users,
-- eliminando regras ocultas ou antigas que possam estar causando o loop.
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'app_users' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.app_users', pol.policyname);
    END LOOP;
END $$;


-- ---------------------------------------------------------------------
-- 2. FUNÇÃO AUXILIAR PARA SESSÃO ATIVA (FLEXÍVEL)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_app_current_user_id()
RETURNS uuid AS $$
DECLARE
  headers_text text;
  header_uid uuid;
BEGIN
  BEGIN
    headers_text := current_setting('request.headers', true);
    IF headers_text IS NOT NULL AND headers_text <> '' THEN
      header_uid := (headers_text::json->>'x-user-id')::uuid;
      IF header_uid IS NOT NULL THEN
        RETURN header_uid;
      END IF;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Ignora erros de leitura do JSON
  END;

  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;


-- ---------------------------------------------------------------------
-- 3. CONFIGURAÇÃO DE POLÍTICAS SEM RECURSÃO PARA 'app_users'
-- ---------------------------------------------------------------------
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- SELECT (Leitura): Permite leitura direta. 
-- Como NÃO faz subconsultas na própria tabela, a recursão infinita é FISICAMENTE IMPOSSÍVEL.
-- Isso também permite que a tela de login consulte o usuário antes de estar autenticada na sessão.
CREATE POLICY "Allow public read access for app_users" ON public.app_users
FOR SELECT USING (true);

-- INSERT (Cadastro): Qualquer pessoa pode se registrar
CREATE POLICY "Allow public insert for app_users" ON public.app_users
FOR INSERT WITH CHECK (true);

-- UPDATE (Alteração): Usuário só pode alterar o próprio registro (seguro e sem recursão)
CREATE POLICY "Allow update for self" ON public.app_users
FOR UPDATE USING (id = public.get_app_current_user_id());

-- DELETE (Exclusão): Usuário só pode deletar o próprio registro (ou se preferir, desative)
CREATE POLICY "Allow delete for self" ON public.app_users
FOR DELETE USING (id = public.get_app_current_user_id());


-- ---------------------------------------------------------------------
-- 4. RECONSTRUÇÃO DAS POLÍTICAS DA TABELA 'characters'
-- ---------------------------------------------------------------------
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- Remove políticas de personagens antigas
DROP POLICY IF EXISTS "Allow select for owner or admin" ON public.characters;
DROP POLICY IF EXISTS "Allow insert for owner or admin" ON public.characters;
DROP POLICY IF EXISTS "Allow update for owner or admin" ON public.characters;
DROP POLICY IF EXISTS "Allow delete for owner or admin" ON public.characters;
DROP POLICY IF EXISTS "Permitir leitura de personagens de si mesmo" ON public.characters;

-- SELECT: Dono pode ver seus personagens, ou personagens sem dono (órfãos legados)
CREATE POLICY "Allow select for owner" ON public.characters
FOR SELECT USING (
  user_id = public.get_app_current_user_id() OR user_id IS NULL
);

-- INSERT: Permite inserir associando ao próprio usuário
CREATE POLICY "Allow insert for owner" ON public.characters
FOR INSERT WITH CHECK (
  user_id = public.get_app_current_user_id()
);

-- UPDATE: Apenas o dono pode alterar seus personagens
CREATE POLICY "Allow update for owner" ON public.characters
FOR UPDATE USING (
  user_id = public.get_app_current_user_id()
);

-- DELETE: Apenas o dono pode deletar seus personagens
CREATE POLICY "Allow delete for owner" ON public.characters
FOR DELETE USING (
  user_id = public.get_app_current_user_id()
);


-- ---------------------------------------------------------------------
-- 5. SOLUÇÃO ALTERNATIVA (CASO AINDA QUEIRA DESATIVAR O RLS COMPLETAMENTE)
-- ---------------------------------------------------------------------
-- Se por algum motivo o seu banco possuir outras amarras de chaves estrangeiras complexas,
-- você pode simplesmente desativar o RLS na tabela app_users rodando a linha abaixo:
-- ALTER TABLE public.app_users DISABLE ROW LEVEL SECURITY;
