export type TerrainType = 'normal' | 'difficult' | 'wall' | 'water' | 'chasm';

export interface GridPosition {
  x: number;
  y: number;
}

export type TrapType = 'spike' | 'poison_dart' | 'web' | 'mud' | 'magic_rune' | 'quicksand';

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: 'heal' | 'energy' | 'shield' | 'might';
  isCollected: boolean;
}

export interface CellData {
  x: number;
  y: number;
  terrain: TerrainType;
  obstacleType?: 'tree' | 'rock' | 'cactus' | 'pillar' | 'brick_wall' | 'cell_bars' | 'fallen_log' | 'monolith' | 'ruins';
  obstacleWidth?: number; // 1, 2, 3
  obstacleHeight?: number; // 1, 2, 3
  obstacleOriginX?: number; // X da célula raiz/âncora do obstáculo
  obstacleOriginY?: number; // Y da célula raiz/âncora do obstáculo
  obstacleVariant?: string; // 'small', 'medium', 'large', 'giant', 'pine', 'oak', 'boulder', 'monolith', 'log_h', 'log_v', etc.
  obstacleScale?: number; // Escala visual (0.7 a 3.2)
  dungeonFeature?: 'hall' | 'room' | 'corridor' | 'cell' | 'vault' | 'cell_bars' | 'brick_wall' | 'pillar';
  movementCost: number; // 1 para normal, 2 para difícil, Infinity para paredes
  hasTrap?: boolean;
  trapType?: TrapType;
  isHiddenTrap?: boolean;
  trapDamage?: number;
  trapSaveDC?: number;
  trapSaveStat?: 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
}

export type GridCell = CellData;

export type EntityType = 'hero' | 'monster';

export type Condition =
  | 'Incapacitado'
  | 'Envenenado'
  | 'Caído'
  | 'Agarrado'
  | 'Cego'
  | 'Amedrontado'
  | 'Paralisado'
  | 'Atordoado'
  | 'Inconsciente'
  | 'Petrificado'
  | 'Invisível'
  | 'Surdo'
  | 'Encantado'
  | 'Contido'
  | string;

export type DamageType =
  | 'Cortante'
  | 'Perfurante'
  | 'Concussão'
  | 'Fogo'
  | 'Frio'
  | 'Elétrico'
  | 'Ácido'
  | 'Veneno'
  | 'Necrótico'
  | 'Radiante'
  | 'Psíquico'
  | 'Força'
  | 'Trovejante'
  | string;

export interface DiceRoll {
  count: number;
  sides: number;
  modifier: number;
  rolls: number[];
  total: number;
  isCritical?: boolean;
  isFumble?: boolean;
}

export interface DamageResult {
  rawDamage: number;
  effectiveDamage: number;
  damageType: DamageType;
  isResistant?: boolean;
  isVulnerable?: boolean;
  isImmune?: boolean;
  details?: string;
}

export type CombatActionType =
  | 'attack'
  | 'cast_spell'
  | 'dash'
  | 'dodge'
  | 'disengage'
  | 'hide'
  | 'help'
  | 'ready'
  | 'use_item'
  | 'bonus_action'
  | 'reaction'
  | 'class_feature'
  | 'racial_feature'
  | 'breath_weapon'
  | 'second_wind'
  | 'action_surge'
  | 'lay_on_hands';

export interface CombatAction {
  id?: string;
  type: CombatActionType;
  name: string;
  actorId: string;
  targetId?: string;
  targetPosition?: GridPosition;
  range?: number;
  damage?: string;
  damageType?: DamageType;
  spellLevel?: number;
  costAction?: boolean;
  costBonusAction?: boolean;
  costReaction?: boolean;
  details?: string;
}

export interface CombatEntity {
  id: string;
  name: string;
  type: EntityType;
  x: number;
  y: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  armor_class: number;
  ac?: number;
  speed: number; // Movimento em células por turno (ex: 6 = 9m / 30ft)
  remainingMovement: number;
  initiative: number;
  icon: string;
  color: string;
  
  // D&D Stats
  level?: number;
  cr?: number;
  pb?: number;
  xpValue?: number;
  attackBonus: number;
  damageDice: string; // Ex: '1d8+3' ou '2d6+4'
  range: number; // Alcance do ataque em células (1 = corpo a corpo)

  // Estatísticas D&D 5.5e
  stats?: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  senses?: string;
  vulnerabilities?: string[];
  resistances?: string[];
  immunities?: string[];
  condition_immunities?: string[];
  saves?: Record<string, number>;
  skills?: string[];
  traits?: { name: string; text: string }[];
  actions?: { name: string; type?: string; to_hit?: number; reach?: string; range?: string; damage?: string; text?: string; effect?: string; condition?: string }[];
  bonus_actions?: { name: string; text: string }[];
  reactions?: { name: string; text: string }[];
  legendary_actions?: { name: string; text: string }[];

  // Economia de Turnos (D&D 5.5e)
  hasAction: boolean;
  hasBonusAction: boolean;
  hasReaction: boolean;
  attacksRemaining?: number;
  hasAttackedThisTurn?: boolean;
  charClass?: string;
  isDead: boolean;

  // Condições Ativas e Talentos
  conditions: string[];
  exhaustionLevel?: number; // Nível de Exaustão (0 a 6)
  grappledById?: string;
  charmedById?: string;
  feats?: string[];
  hasDarkvision?: boolean;
  darkvisionRange?: number; // em metros (ex: 18 ou 36)
  size?: string;
  usedSavageAttackerThisTurn?: boolean;
  usedPiercerThisTurn?: boolean;
  usedTavernBrawlerRerollThisTurn?: boolean;
  usedTavernBrawlerPushThisTurn?: boolean;
  offHandAttackUsedThisTurn?: boolean;
  equipment_slots?: Record<string, string | null>;
  attackedWeaponNamesThisTurn?: string[];
  attackedWeaponNamesThisAction?: string[];
  usedCleaveThisTurn?: boolean;
  usedNickThisTurn?: boolean;
  fightingStyle?: string;
  fighting_style?: string;
  isActionSurgeActive?: boolean;
}

export interface MonsterTemplate {
  id?: string;
  name: string;
  cr: number;
  pb?: number;
  hp: number;
  armor_class: number;
  speed: number;
  attackBonus: number;
  damageDice: string;
  range: number;
  xp: number;
  icon: string;
  color: string;
  size?: string;
  biomePreference?: string[];
  stats?: { str: number; dex: number; con: number; int: number; wis: number; cha: number };
  senses?: string;
  vulnerabilities?: string[];
  resistances?: string[];
  immunities?: string[];
  condition_immunities?: string[];
  saves?: Record<string, number>;
  skills?: string[];
  traits?: { name: string; text: string }[];
  actions?: { name: string; type?: string; to_hit?: number; reach?: string; range?: string; damage?: string; text?: string; effect?: string; condition?: string }[];
  bonus_actions?: { name: string; text: string }[];
  reactions?: { name: string; text: string }[];
  legendary_actions?: { name: string; text: string }[];
}

export interface CombatLog {
  id: string;
  timestamp: string;
  actorName: string;
  title: string;
  detail: string;
  type: 'roll' | 'attack' | 'damage' | 'heal' | 'kill' | 'system' | 'loot';
}

export type BiomeType = 'Caverna' | 'Floresta' | 'Masmorra' | 'Pântano' | 'Deserto' | 'Arena de Testes';

export type WeatherType = 'clear' | 'rain' | 'snow' | 'wind' | 'storm' | 'fog';

export interface ArenaMap {
  width: number;
  height: number;
  cells: CellData[][];
  biome: BiomeType;
  weather: WeatherType;
  traps?: { x: number; y: number; type: TrapType }[];
  powerUps?: PowerUp[];
}

export interface GameState {
  id?: string;
  character_id?: string | null;
  biome: BiomeType;
  weather: WeatherType;
  current_turn: number;
  round: number;
  turnOrder: string[];
  currentTurnEntityId: string;
  entities: CombatEntity[];
  grid: CellData[][];
  is_active: boolean;
  combatLogs: CombatLog[];
  updated_at?: string | null;
}
