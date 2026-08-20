-- =====================================================================
-- ESQUEMA COMPLETO E UNIFICADO DO BANCO DE DADOS (SUPABASE)
-- Versão consolidada e atualizada com todas as tabelas, tipos,
-- chaves estrangeiras, gatilhos de autenticação e políticas RLS.
-- =====================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- TYPES PERSONALIZADOS
-- ---------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE creature_size AS ENUM ('tiny', 'small', 'medium', 'large', 'huge', 'gargantuan');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;


-- ---------------------------------------------------------------------
-- 1. TABELAS INDEPENDENTES (PAIS PRINCIPAIS / CATÁLOGO BASE)
-- ---------------------------------------------------------------------

-- Tabela de Perfis de Usuários (app_users) vinculada ao Supabase Auth
CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid NOT NULL,
  username character varying NOT NULL,
  name character varying NOT NULL,
  role character varying NOT NULL DEFAULT 'jogador'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT app_users_pkey PRIMARY KEY (id),
  CONSTRAINT app_users_username_key UNIQUE (username),
  CONSTRAINT app_users_role_check CHECK (role IN ('administrador', 'jogador')),
  CONSTRAINT app_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Tabela de Talentos (feats)
CREATE TABLE IF NOT EXISTS public.feats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  category character varying NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT feats_pkey PRIMARY KEY (id)
);

-- Tabela de Raças (races)
CREATE TABLE IF NOT EXISTS public.races (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  creature_type character varying NOT NULL DEFAULT 'Humanoide'::character varying,
  size character varying NOT NULL DEFAULT 'Médio'::character varying,
  speed character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  icon character varying,
  CONSTRAINT races_pkey PRIMARY KEY (id)
);

-- Tabela de Classes (classes)
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  primary_ability character varying NOT NULL,
  hit_point_die character varying NOT NULL,
  saving_throws jsonb NOT NULL DEFAULT '[]'::jsonb,
  skills text NOT NULL,
  weapons jsonb NOT NULL DEFAULT '[]'::jsonb,
  armor jsonb NOT NULL DEFAULT '[]'::jsonb,
  tools jsonb DEFAULT '[]'::jsonb,
  equipment_options jsonb NOT NULL DEFAULT '{"A": "", "B": ""}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  icon character varying,
  CONSTRAINT classes_pkey PRIMARY KEY (id)
);

-- Tabela de Itens (items)
CREATE TABLE IF NOT EXISTS public.items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  category character varying,
  cost character varying,
  weight character varying,
  properties text,
  damage character varying,
  stealth character varying,
  usable_location character varying,
  created_at timestamp with time zone DEFAULT now(),
  ammunition_type character varying,
  armor_class character varying,
  CONSTRAINT items_pkey PRIMARY KEY (id)
);

-- Tabela de Regras do Jogo (game_rules)
CREATE TABLE IF NOT EXISTS public.game_rules (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NOT NULL,
  category text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT game_rules_pkey PRIMARY KEY (id)
);

-- Tabela de Tarefas e Implementações (implementations)
CREATE TABLE IF NOT EXISTS public.implementations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  category character varying NOT NULL DEFAULT 'Geral'::character varying,
  completed boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  started boolean NOT NULL DEFAULT false,
  CONSTRAINT implementations_pkey PRIMARY KEY (id)
);

-- Tabela de Magias (spells)
CREATE TABLE IF NOT EXISTS public.spells (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  level integer NOT NULL DEFAULT 0,
  school character varying NOT NULL,
  casting_time character varying NOT NULL,
  range character varying NOT NULL,
  components character varying NOT NULL,
  duration character varying NOT NULL,
  classes jsonb NOT NULL DEFAULT '[]'::jsonb,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT spells_pkey PRIMARY KEY (id)
);


-- ---------------------------------------------------------------------
-- 2. TABELAS SECUNDÁRIAS (DEPENDENTES DIRETAS)
-- ---------------------------------------------------------------------

-- Tabela de Antecedentes (backgrounds)
CREATE TABLE IF NOT EXISTS public.backgrounds (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  ability_scores jsonb NOT NULL DEFAULT '[]'::jsonb,
  skill_proficiencies jsonb NOT NULL DEFAULT '[]'::jsonb,
  tool_proficiency character varying NOT NULL,
  equipment jsonb NOT NULL DEFAULT '{"A": "", "B": ""}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  feat_id uuid,
  feat_sub_choice character varying,
  icon character varying,
  CONSTRAINT backgrounds_pkey PRIMARY KEY (id),
  CONSTRAINT fk_backgrounds_feat FOREIGN KEY (feat_id) REFERENCES public.feats (id) ON DELETE SET NULL
);

-- Tabela de Subclasses (subclasses)
CREATE TABLE IF NOT EXISTS public.subclasses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subclasses_pkey PRIMARY KEY (id),
  CONSTRAINT subclasses_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes (id) ON DELETE CASCADE
);

-- Tabela de Recursos de Subclasses (subclass_features)
CREATE TABLE IF NOT EXISTS public.subclass_features (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subclass_id uuid NOT NULL,
  level integer NOT NULL,
  name character varying NOT NULL,
  action_type character varying NOT NULL DEFAULT 'Passiva'::character varying,
  description text NOT NULL,
  usage_limit character varying,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subclass_features_pkey PRIMARY KEY (id),
  CONSTRAINT subclass_features_subclass_id_fkey FOREIGN KEY (subclass_id) REFERENCES public.subclasses (id) ON DELETE CASCADE
);

-- Tabela de Características de Nível de Classe (class_level_features)
CREATE TABLE IF NOT EXISTS public.class_level_features (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  level integer NOT NULL,
  name character varying NOT NULL,
  action_type character varying NOT NULL DEFAULT 'Passiva'::character varying,
  description text NOT NULL,
  usage_limit character varying,
  created_at timestamp with time zone DEFAULT now(),
  class_id uuid NOT NULL,
  CONSTRAINT class_level_features_pkey PRIMARY KEY (id),
  CONSTRAINT fk_class_level_features_class FOREIGN KEY (class_id) REFERENCES public.classes (id) ON DELETE CASCADE
);

-- Tabela de Progressão de Classe (class_progressions)
CREATE TABLE IF NOT EXISTS public.class_progressions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  level integer NOT NULL,
  prof character varying NOT NULL,
  cantrips_known integer,
  prepared_spells integer,
  spell_slots ARRAY,
  bardic_die character varying,
  rages integer,
  rage_damage character varying,
  weapon_mastery integer,
  channel_divinity integer,
  wild_shapes integer,
  second_wind integer,
  martial_arts_die character varying,
  focus_points integer,
  unarmored_movement character varying,
  sneak_attack_die character varying,
  sorcery_points integer,
  invocations_known integer,
  warlock_slot_level integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT class_progressions_pkey PRIMARY KEY (id),
  CONSTRAINT class_progressions_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes (id) ON DELETE CASCADE
);

-- Tabela de Características de Raças (race_traits)
CREATE TABLE IF NOT EXISTS public.race_traits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  race_id uuid NOT NULL,
  trait_name character varying NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT race_traits_pkey PRIMARY KEY (id),
  CONSTRAINT fk_race_traits_race FOREIGN KEY (race_id) REFERENCES public.races (id) ON DELETE CASCADE
);

-- Tabela de Variantes de Raças (race_variants)
CREATE TABLE IF NOT EXISTS public.race_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  race_id uuid NOT NULL,
  name character varying NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  CONSTRAINT race_variants_pkey PRIMARY KEY (id),
  CONSTRAINT race_variants_race_id_fkey FOREIGN KEY (race_id) REFERENCES public.races (id) ON DELETE CASCADE
);

-- Tabela do Bestiário / Monstros (bestiary)
CREATE TABLE IF NOT EXISTS public.bestiary (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  cr numeric NOT NULL DEFAULT 0.25,
  hp integer NOT NULL,
  speed jsonb NOT NULL DEFAULT '{"walk": 30}'::jsonb,
  xp integer NOT NULL DEFAULT 50,
  icon character varying DEFAULT '👹'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  pb integer DEFAULT 2,
  strength integer NOT NULL DEFAULT 10,
  dexterity integer NOT NULL DEFAULT 10,
  constitution integer NOT NULL DEFAULT 10,
  intelligence integer NOT NULL DEFAULT 10,
  wisdom integer NOT NULL DEFAULT 10,
  charisma integer NOT NULL DEFAULT 10,
  saving_throws jsonb DEFAULT '{}'::jsonb,
  skills jsonb DEFAULT '{}'::jsonb,
  senses character varying,
  languages character varying,
  damage_vulnerabilities jsonb DEFAULT '[]'::jsonb,
  damage_resistances jsonb DEFAULT '[]'::jsonb,
  damage_immunities jsonb DEFAULT '[]'::jsonb,
  condition_immunities jsonb DEFAULT '[]'::jsonb,
  special_traits jsonb DEFAULT '[]'::jsonb,
  actions jsonb DEFAULT '[]'::jsonb,
  bonus_actions jsonb DEFAULT '[]'::jsonb,
  reactions jsonb DEFAULT '[]'::jsonb,
  legendary_actions jsonb DEFAULT '[]'::jsonb,
  armor_class integer DEFAULT 10,
  size creature_size NOT NULL DEFAULT 'medium'::creature_size,
  CONSTRAINT bestiary_pkey PRIMARY KEY (id)
);


-- ---------------------------------------------------------------------
-- 3. TABELA DE PERSONAGENS (characters)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.characters (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  alignment character varying NOT NULL,
  level integer DEFAULT 1,
  strength integer NOT NULL,
  dexterity integer NOT NULL,
  constitution integer NOT NULL,
  intelligence integer NOT NULL,
  wisdom integer NOT NULL,
  charisma integer NOT NULL,
  armor_class integer NOT NULL,
  speed character varying,
  max_hp integer NOT NULL,
  current_hp integer NOT NULL,
  temp_hp integer DEFAULT 0,
  exhaustion_level integer DEFAULT 0,
  death_save_successes integer DEFAULT 0,
  death_save_failures integer DEFAULT 0,
  conditions text,
  class_resources jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
  xp integer DEFAULT 0,
  defeated_monsters jsonb DEFAULT '{}'::jsonb,
  race_id uuid,
  class_id uuid,
  background_id uuid,
  cp integer DEFAULT 0,
  sp integer DEFAULT 0,
  ep integer DEFAULT 0,
  gp integer DEFAULT 0,
  pp integer DEFAULT 0,
  user_id uuid,
  CONSTRAINT characters_pkey PRIMARY KEY (id),
  CONSTRAINT fk_characters_race FOREIGN KEY (race_id) REFERENCES public.races (id) ON DELETE SET NULL,
  CONSTRAINT fk_characters_class FOREIGN KEY (class_id) REFERENCES public.classes (id) ON DELETE SET NULL,
  CONSTRAINT fk_characters_background FOREIGN KEY (background_id) REFERENCES public.backgrounds (id) ON DELETE SET NULL,
  CONSTRAINT characters_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.app_users (id) ON DELETE SET NULL
);


-- ---------------------------------------------------------------------
-- 4. TABELAS FILHAS DO PERSONAGEM (DEPENDENTES)
-- ---------------------------------------------------------------------

-- Escolhas do Personagem (character_choices)
CREATE TABLE IF NOT EXISTS public.character_choices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL,
  feature_name text NOT NULL,
  choice_value text NOT NULL,
  source text,
  CONSTRAINT character_choices_pkey PRIMARY KEY (id),
  CONSTRAINT character_choices_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.characters (id) ON DELETE CASCADE
);

-- Classes do Personagem (character_classes)
CREATE TABLE IF NOT EXISTS public.character_classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL,
  class_id uuid NOT NULL,
  subclass text,
  class_level integer NOT NULL DEFAULT 1,
  hit_dice_current integer NOT NULL DEFAULT 1,
  hit_dice character varying,
  CONSTRAINT character_classes_pkey PRIMARY KEY (id),
  CONSTRAINT character_classes_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.characters (id) ON DELETE CASCADE,
  CONSTRAINT character_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes (id) ON DELETE CASCADE
);

-- Talentos do Personagem (character_feats)
CREATE TABLE IF NOT EXISTS public.character_feats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL,
  feat_id uuid NOT NULL,
  source text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT character_feats_pkey PRIMARY KEY (id),
  CONSTRAINT character_feats_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.characters (id) ON DELETE CASCADE,
  CONSTRAINT character_feats_feat_id_fkey FOREIGN KEY (feat_id) REFERENCES public.feats (id) ON DELETE CASCADE
);

-- Inventário do Personagem (character_inventory)
CREATE TABLE IF NOT EXISTS public.character_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL,
  item_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  equip_slot character varying,
  CONSTRAINT character_inventory_pkey PRIMARY KEY (id),
  CONSTRAINT character_inventory_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.characters (id) ON DELETE CASCADE,
  CONSTRAINT character_inventory_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.items (id) ON DELETE CASCADE
);

-- Magias do Personagem (character_spells)
CREATE TABLE IF NOT EXISTS public.character_spells (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL,
  spell_id uuid NOT NULL,
  is_prepared boolean NOT NULL DEFAULT false,
  is_always_prepared boolean NOT NULL DEFAULT false,
  source text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT character_spells_pkey PRIMARY KEY (id),
  CONSTRAINT character_spells_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.characters (id) ON DELETE CASCADE,
  CONSTRAINT character_spells_spell_id_fkey FOREIGN KEY (spell_id) REFERENCES public.spells (id) ON DELETE CASCADE
);

-- Estados de Jogo (game_states)
CREATE TABLE IF NOT EXISTS public.game_states (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  character_id uuid,
  biome character varying DEFAULT 'Caverna'::character varying,
  current_turn integer DEFAULT 0,
  combat_data jsonb,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT game_states_pkey PRIMARY KEY (id),
  CONSTRAINT game_states_character_id_fkey FOREIGN KEY (character_id) REFERENCES public.characters (id) ON DELETE CASCADE
);


-- =====================================================================
-- 5. FUNÇÕES AUXILIARES, TRIGGERS E POLÍTICAS RLS (SUPABASE AUTH)
-- =====================================================================

-- Função para criar/sincronizar perfil no app_users quando usuário se registra via Supabase Auth
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

-- Função e Trigger para proteger contra auto-elevação de papel (role)
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

-- Função auxiliar segura para checar se o usuário atual é Administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.app_users
    WHERE id = auth.uid() AND role = 'administrador'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- Políticas de RLS para app_users
-- ---------------------------------------------------------------------
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

CREATE POLICY "Users can read own profile or admins read all" ON public.app_users
FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert own profile" ON public.app_users
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile or admins update" ON public.app_users
FOR UPDATE USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins or owners can delete profile" ON public.app_users
FOR DELETE USING (auth.uid() = id OR public.is_admin());

-- ---------------------------------------------------------------------
-- Políticas de RLS para characters
-- ---------------------------------------------------------------------
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'characters' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.characters', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "Characters select policy" ON public.characters
FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Characters insert policy" ON public.characters
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Characters update policy" ON public.characters
FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Characters delete policy" ON public.characters
FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- ---------------------------------------------------------------------
-- Políticas de RLS para Tabelas Dependentes do Personagem
-- ---------------------------------------------------------------------
DO $$
DECLARE
  t_name text;
  dependent_tables text[] := ARRAY[
    'character_choices', 'character_classes', 'character_feats', 
    'character_inventory', 'character_spells', 'game_states'
  ];
  pol record;
BEGIN
  FOREACH t_name IN ARRAY dependent_tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t_name);
    
    FOR pol IN EXECUTE format('SELECT policyname FROM pg_policies WHERE tablename = %L AND schemaname = ''public''', t_name) LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t_name);
    END LOOP;
    
    EXECUTE format('
      CREATE POLICY "Select for character owner or admin" ON public.%I
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.characters c
          WHERE c.id = character_id AND (c.user_id = auth.uid() OR public.is_admin())
        )
      );
    ', t_name);

    EXECUTE format('
      CREATE POLICY "Insert for character owner or admin" ON public.%I
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.characters c
          WHERE c.id = character_id AND (c.user_id = auth.uid() OR public.is_admin())
        )
      );
    ', t_name);

    EXECUTE format('
      CREATE POLICY "Update for character owner or admin" ON public.%I
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.characters c
          WHERE c.id = character_id AND (c.user_id = auth.uid() OR public.is_admin())
        )
      );
    ', t_name);

    EXECUTE format('
      CREATE POLICY "Delete for character owner or admin" ON public.%I
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.characters c
          WHERE c.id = character_id AND (c.user_id = auth.uid() OR public.is_admin())
        )
      );
    ', t_name);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------
-- Políticas de RLS para Tabelas de Catálogo / Regras (Leitura Pública)
-- ---------------------------------------------------------------------
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
        CREATE POLICY "Allow read catalog for all" ON public.%I
        FOR SELECT USING (true);
      ', t_ref);
      EXECUTE format('
        CREATE POLICY "Allow admin manage catalog" ON public.%I
        FOR ALL USING (public.is_admin());
      ', t_ref);
    EXCEPTION WHEN undefined_table THEN
      NULL;
    END;
  END LOOP;
END $$;
