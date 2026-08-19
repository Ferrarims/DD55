-- ==============================================================================
-- MIGRATION FASE 0: SEGURANÇA E AUTENTICAÇÃO SUPABASE AUTH
-- ==============================================================================
-- Este script realiza a transição completa da autenticação insegura (x-user-id)
-- para o Supabase Auth oficial com Row Level Security (RLS) baseado em auth.uid().
-- ==============================================================================

-- 1. ESTRUTURA DA TABELA DE PERFIS DE USUÁRIOS (public.app_users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'jogador' CHECK (role IN ('administrador', 'jogador')),
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Remove a coluna de senha caso exista de versões legadas
ALTER TABLE public.app_users DROP COLUMN IF EXISTS password;

-- 2. FUNÇÃO E TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE AO REGISTRAR NO SUPABASE AUTH
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.app_users (id, username, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'jogador'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    username = EXCLUDED.username;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. FUNÇÃO E TRIGGER PARA IMPEDIR QUE JOGADORES ALTEREM SEU PRÓPRIO PAPEL (ROLE)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_app_user_role()
RETURNS trigger AS $$
BEGIN
  IF NEW.role <> OLD.role THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.app_users
      WHERE id = auth.uid() AND role = 'administrador'
    ) THEN
      RAISE EXCEPTION 'Apenas administradores podem alterar papéis de usuário no sistema.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS protect_user_role_trigger ON public.app_users;
CREATE TRIGGER protect_user_role_trigger
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW EXECUTE FUNCTION public.protect_app_user_role();

-- 4. FUNÇÃO AUXILIAR SEGURA PARA IDENTIFICAÇÃO DE ADMINISTRADORES
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.app_users
    WHERE id = auth.uid() AND role = 'administrador'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 5. POLÍTICAS DE ROW LEVEL SECURITY (RLS) PARA public.app_users
-- ------------------------------------------------------------------------------
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas anteriores
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'app_users' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.app_users', pol.policyname);
  END LOOP;
END $$;

-- SELECT: Usuário autenticado lê seu próprio perfil, ou admins leem todos
CREATE POLICY "Users can read own profile or admins read all" ON public.app_users
FOR SELECT USING (
  auth.uid() = id OR public.is_admin()
);

-- INSERT: Permite que o próprio usuário insira seu perfil (com role padrão 'jogador')
CREATE POLICY "Users can insert own profile" ON public.app_users
FOR INSERT WITH CHECK (
  auth.uid() = id
);

-- UPDATE: Usuário edita seu próprio perfil ou admin edita qualquer um
CREATE POLICY "Users can update own profile or admins update" ON public.app_users
FOR UPDATE USING (
  auth.uid() = id OR public.is_admin()
);

-- DELETE: Administradores ou o próprio dono da conta podem excluir
CREATE POLICY "Admins or owners can delete profile" ON public.app_users
FOR DELETE USING (
  auth.uid() = id OR public.is_admin()
);

-- 6. POLÍTICAS DE ROW LEVEL SECURITY (RLS) PARA public.characters
-- ------------------------------------------------------------------------------
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'characters' AND schemaname = 'public' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.characters', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Characters select policy" ON public.characters
FOR SELECT USING (
  user_id = auth.uid() OR public.is_admin()
);

CREATE POLICY "Characters insert policy" ON public.characters
FOR INSERT WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Characters update policy" ON public.characters
FOR UPDATE USING (
  user_id = auth.uid()
);

CREATE POLICY "Characters delete policy" ON public.characters
FOR DELETE USING (
  user_id = auth.uid()
);

-- 7. POLÍTICAS DE ROW LEVEL SECURITY (RLS) PARA TABELAS FILHAS DE PERSONAGEM
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  t_name text;
  dependent_tables text[] := ARRAY['character_choices', 'character_classes', 'character_feats', 'character_inventory', 'character_spells', 'game_states'];
  pol record;
BEGIN
  FOREACH t_name IN ARRAY dependent_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t_name);
    
    FOR pol IN EXECUTE format('SELECT policyname FROM pg_policies WHERE tablename = %L AND schemaname = ''public''', t_name) LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t_name);
    END LOOP;
    
    EXECUTE format('
      CREATE POLICY "Select for character owner" ON public.%I
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.characters c
          WHERE c.id = character_id AND (c.user_id = auth.uid() OR public.is_admin())
        )
      );
    ', t_name);

    EXECUTE format('
      CREATE POLICY "Insert for character owner" ON public.%I
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.characters c
          WHERE c.id = character_id AND c.user_id = auth.uid()
        )
      );
    ', t_name);

    EXECUTE format('
      CREATE POLICY "Update for character owner" ON public.%I
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.characters c
          WHERE c.id = character_id AND c.user_id = auth.uid()
        )
      );
    ', t_name);

    EXECUTE format('
      CREATE POLICY "Delete for character owner" ON public.%I
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.characters c
          WHERE c.id = character_id AND c.user_id = auth.uid()
        )
      );
    ', t_name);
  END LOOP;
END $$;

-- 8. POLÍTICAS DE LEITURA PARA TABELAS DE CATÁLOGO / REGRAS
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  t_ref text;
  reference_tables text[] := ARRAY[
    'backgrounds', 'bestiary', 'classes', 'feats', 'items', 'races', 
    'race_traits', 'race_variants', 'spells', 'subclasses', 
    'subclass_features', 'class_level_features', 'class_progressions', 
    'game_rules', 'implementations'
  ];
  pol record;
BEGIN
  FOREACH t_ref IN ARRAY reference_tables LOOP
    BEGIN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t_ref);
      FOR pol IN EXECUTE format('SELECT policyname FROM pg_policies WHERE tablename = %L AND schemaname = ''public''', t_ref) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t_ref);
      END LOOP;
      EXECUTE format('
        CREATE POLICY "Allow read catalog" ON public.%I
        FOR SELECT USING (true);
      ', t_ref);
    EXCEPTION WHEN undefined_table THEN
      -- Se a tabela opcional não existir no ambiente atual, continua
      NULL;
    END;
  END LOOP;
END $$;

-- 9. REMOÇÃO DA FUNÇÃO INSEGURA get_app_current_user_id
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.get_app_current_user_id();

-- ==============================================================================
-- FIM DA MIGRATION
-- ==============================================================================
