-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Types
DO $$ BEGIN
  CREATE TYPE creature_size AS ENUM ('tiny', 'small', 'medium', 'large', 'huge', 'gargantuan');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 1. Feats Table
CREATE TABLE IF NOT EXISTS feats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  category character varying NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- 2. Races Table
CREATE TABLE IF NOT EXISTS races (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  creature_type character varying NOT NULL DEFAULT 'Humanoide'::character varying,
  size character varying NOT NULL DEFAULT 'Médio'::character varying,
  speed character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  icon character varying,
  PRIMARY KEY (id)
);

-- 3. Classes Table
CREATE TABLE IF NOT EXISTS classes (
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
  PRIMARY KEY (id)
);

-- 4. Backgrounds Table
CREATE TABLE IF NOT EXISTS backgrounds (
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
  PRIMARY KEY (id),
  CONSTRAINT fk_backgrounds_feat FOREIGN KEY (feat_id) REFERENCES feats(id) ON DELETE SET NULL
);

-- 5. Bestiary Table
CREATE TABLE IF NOT EXISTS bestiary (
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
  PRIMARY KEY (id)
);

-- 6. Spells Table
CREATE TABLE IF NOT EXISTS spells (
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
  PRIMARY KEY (id)
);

-- 7. Items Table
CREATE TABLE IF NOT EXISTS items (
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
  PRIMARY KEY (id)
);

-- 8. Game Rules Table
CREATE TABLE IF NOT EXISTS game_rules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- 9. Implementations Table
CREATE TABLE IF NOT EXISTS implementations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  category character varying NOT NULL DEFAULT 'Geral'::character varying,
  completed boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  started boolean NOT NULL DEFAULT false,
  PRIMARY KEY (id)
);

-- 10. Subclasses Table
CREATE TABLE IF NOT EXISTS subclasses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  name character varying NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT subclasses_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- 11. Subclass Features Table
CREATE TABLE IF NOT EXISTS subclass_features (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subclass_id uuid NOT NULL,
  level integer NOT NULL,
  name character varying NOT NULL,
  action_type character varying NOT NULL DEFAULT 'Passiva'::character varying,
  description text NOT NULL,
  usage_limit character varying,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT subclass_features_subclass_id_fkey FOREIGN KEY (subclass_id) REFERENCES subclasses(id) ON DELETE CASCADE
);

-- 12. Class Level Features Table
CREATE TABLE IF NOT EXISTS class_level_features (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  level integer NOT NULL,
  name character varying NOT NULL,
  action_type character varying NOT NULL DEFAULT 'Passiva'::character varying,
  description text NOT NULL,
  usage_limit character varying,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT fk_class_level_features_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- 13. Class Progressions Table
CREATE TABLE IF NOT EXISTS class_progressions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL,
  level integer NOT NULL,
  prof character varying NOT NULL,
  cantrips_known integer,
  prepared_spells integer,
  spell_slots integer[],
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
  PRIMARY KEY (id),
  CONSTRAINT class_progressions_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- 14. Race Traits Table
CREATE TABLE IF NOT EXISTS race_traits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  race_id uuid NOT NULL,
  trait_name character varying NOT NULL,
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT fk_race_traits_race FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE
);

-- 15. Race Variants Table
CREATE TABLE IF NOT EXISTS race_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  race_id uuid NOT NULL,
  name character varying NOT NULL,
  description text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  PRIMARY KEY (id),
  CONSTRAINT race_variants_race_id_fkey FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE
);

-- 16. Characters Table
CREATE TABLE IF NOT EXISTS characters (
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
  PRIMARY KEY (id),
  CONSTRAINT fk_characters_race FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE SET NULL,
  CONSTRAINT fk_characters_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  CONSTRAINT fk_characters_background FOREIGN KEY (background_id) REFERENCES backgrounds(id) ON DELETE SET NULL
);

-- 17. Character Choices Table
CREATE TABLE IF NOT EXISTS character_choices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL,
  feature_name text NOT NULL,
  choice_value text NOT NULL,
  source text,
  PRIMARY KEY (id),
  CONSTRAINT character_choices_character_id_fkey FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);

-- 18. Character Classes Table
CREATE TABLE IF NOT EXISTS character_classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL,
  class_id uuid NOT NULL,
  subclass text,
  class_level integer NOT NULL DEFAULT 1,
  hit_dice_current integer NOT NULL DEFAULT 1,
  hit_dice character varying,
  PRIMARY KEY (id),
  CONSTRAINT character_classes_character_id_fkey FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  CONSTRAINT character_classes_class_id_fkey FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

-- 19. Character Feats Table
CREATE TABLE IF NOT EXISTS character_feats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL,
  feat_id uuid NOT NULL,
  source text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT character_feats_character_id_fkey FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  CONSTRAINT character_feats_feat_id_fkey FOREIGN KEY (feat_id) REFERENCES feats(id) ON DELETE CASCADE
);

-- 20. Character Inventory Table
CREATE TABLE IF NOT EXISTS character_inventory (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL,
  item_id uuid NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  equip_slot character varying,
  PRIMARY KEY (id),
  CONSTRAINT character_inventory_character_id_fkey FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  CONSTRAINT character_inventory_item_id_fkey FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- 21. Character Spells Table
CREATE TABLE IF NOT EXISTS character_spells (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  character_id uuid NOT NULL,
  spell_id uuid NOT NULL,
  is_prepared boolean NOT NULL DEFAULT false,
  is_always_prepared boolean NOT NULL DEFAULT false,
  source text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT character_spells_character_id_fkey FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE,
  CONSTRAINT character_spells_spell_id_fkey FOREIGN KEY (spell_id) REFERENCES spells(id) ON DELETE CASCADE
);

-- 22. Game States Table
CREATE TABLE IF NOT EXISTS game_states (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  character_id uuid,
  biome character varying DEFAULT 'Caverna'::character varying,
  current_turn integer DEFAULT 0,
  combat_data jsonb,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT game_states_character_id_fkey FOREIGN KEY (character_id) REFERENCES characters(id) ON DELETE CASCADE
);
