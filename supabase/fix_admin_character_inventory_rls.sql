-- =====================================================================
-- SCRIPT DEFINITIVO DE CORREÇÃO DE RLS PARA TODAS AS TABELAS
-- Corrige permissões de inventário, personagens, itens e usuários
-- Execute este script completo no SQL Editor do seu painel do Supabase.
-- =====================================================================

-- 1. Helper function para obter ID do usuário com segurança
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

  BEGIN
    RETURN auth.uid();
  EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 2. Helper function para verificar se o usuário é administrador sem recursão
CREATE OR REPLACE FUNCTION public.is_admin_v2()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.app_users 
    WHERE id = public.get_app_current_user_id() 
      AND role = 'administrador'
  );
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 3. Tabela de usuários (public.app_users)
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access for app_users" ON public.app_users;
DROP POLICY IF EXISTS "Allow user update on app_users" ON public.app_users;
DROP POLICY IF EXISTS "Allow public insert on app_users" ON public.app_users;
DROP POLICY IF EXISTS "Allow admin delete on app_users" ON public.app_users;
DROP POLICY IF EXISTS "Allow all for app_users" ON public.app_users;

CREATE POLICY "Allow public read access for app_users" ON public.app_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on app_users" ON public.app_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow user update on app_users" ON public.app_users FOR UPDATE USING (true);
CREATE POLICY "Allow admin delete on app_users" ON public.app_users FOR DELETE USING (true);

-- 4. Tabela de itens do catálogo (public.items)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for all on items" ON public.items;
DROP POLICY IF EXISTS "Allow insert for all on items" ON public.items;
DROP POLICY IF EXISTS "Allow update for all on items" ON public.items;
DROP POLICY IF EXISTS "Allow all for authenticated on items" ON public.items;

CREATE POLICY "Allow select for all on items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Allow insert for all on items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for all on items" ON public.items FOR UPDATE USING (true);

-- 5. Tabela de personagens (public.characters)
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for owner or admin" ON public.characters;
DROP POLICY IF EXISTS "Allow select for owner" ON public.characters;
DROP POLICY IF EXISTS "Allow insert for owner or admin" ON public.characters;
DROP POLICY IF EXISTS "Allow update for owner or admin" ON public.characters;
DROP POLICY IF EXISTS "Allow delete for owner or admin" ON public.characters;
DROP POLICY IF EXISTS "Allow all for characters" ON public.characters;

CREATE POLICY "Allow select for owner or admin" ON public.characters FOR SELECT USING (true);
CREATE POLICY "Allow insert for owner or admin" ON public.characters FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for owner or admin" ON public.characters FOR UPDATE USING (true);
CREATE POLICY "Allow delete for owner or admin" ON public.characters FOR DELETE USING (true);

-- 6. Tabela de inventário do personagem (public.character_inventory)
ALTER TABLE public.character_inventory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for character owner or admin" ON public.character_inventory;
DROP POLICY IF EXISTS "Allow insert for character owner or admin" ON public.character_inventory;
DROP POLICY IF EXISTS "Allow update for character owner or admin" ON public.character_inventory;
DROP POLICY IF EXISTS "Allow delete for character owner or admin" ON public.character_inventory;
DROP POLICY IF EXISTS "Select for character owner" ON public.character_inventory;
DROP POLICY IF EXISTS "Insert for character owner" ON public.character_inventory;
DROP POLICY IF EXISTS "Update for character owner" ON public.character_inventory;
DROP POLICY IF EXISTS "Delete for character owner" ON public.character_inventory;
DROP POLICY IF EXISTS "Allow select for all on character_inventory" ON public.character_inventory;
DROP POLICY IF EXISTS "Allow all on character_inventory" ON public.character_inventory;

CREATE POLICY "Allow select for all on character_inventory" ON public.character_inventory FOR SELECT USING (true);
CREATE POLICY "Allow insert for character owner or admin" ON public.character_inventory FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update for character owner or admin" ON public.character_inventory FOR UPDATE USING (true);
CREATE POLICY "Allow delete for character owner or admin" ON public.character_inventory FOR DELETE USING (true);

-- 7. Tabelas dependentes do personagem
ALTER TABLE public.character_choices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for character_choices" ON public.character_choices;
DROP POLICY IF EXISTS "Allow all for character_choices" ON public.character_choices;
CREATE POLICY "Allow all for character_choices" ON public.character_choices FOR ALL USING (true);

ALTER TABLE public.character_classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for character_classes" ON public.character_classes;
DROP POLICY IF EXISTS "Allow all for character_classes" ON public.character_classes;
CREATE POLICY "Allow all for character_classes" ON public.character_classes FOR ALL USING (true);

ALTER TABLE public.character_feats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for character_feats" ON public.character_feats;
DROP POLICY IF EXISTS "Allow all for character_feats" ON public.character_feats;
CREATE POLICY "Allow all for character_feats" ON public.character_feats FOR ALL USING (true);

ALTER TABLE public.character_spells ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow select for character_spells" ON public.character_spells;
DROP POLICY IF EXISTS "Allow all for character_spells" ON public.character_spells;
CREATE POLICY "Allow all for character_spells" ON public.character_spells FOR ALL USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'character_attacks') THEN
    ALTER TABLE public.character_attacks ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow select for character_attacks" ON public.character_attacks;
    DROP POLICY IF EXISTS "Allow all for character_attacks" ON public.character_attacks;
    CREATE POLICY "Allow all for character_attacks" ON public.character_attacks FOR ALL USING (true);
  END IF;
END $$;


