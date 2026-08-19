export interface AttackItem {
  id?: string;
  name: string;
  attack_bonus: number;
  damage: string;
  damage_type?: string;
  range?: string;
  mastery?: string;
  properties?: string;
}

export type StatKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export const CLASS_ICONS: Record<string, string> = {
  'Bárbaro': '🪓', 'Barbarian': '🪓',
  'Bardo': '🪕', 'Bard': '🪕',
  'Clérigo': '⚕️', 'Cleric': '⚕️',
  'Druida': '🌿', 'Druid': '🌿',
  'Guerreiro': '⚔️', 'Fighter': '⚔️',
  'Monge': '👊', 'Monk': '👊',
  'Paladino': '🛡️', 'Paladin': '🛡️',
  'Patrulheiro': '🏹', 'Ranger': '🏹',
  'Ladino': '🥷', 'Rogue': '🥷',
  'Feiticeiro': '🔮', 'Sorcerer': '🔮',
  'Bruxo': '👁️', 'Warlock': '👁️',
  'Mago': '🧙‍♂️', 'Wizard': '🧙‍♂️'
};

export const CLASS_NAME_MAP: Record<string, string> = {
  'Bárbaro': 'Barbarian', 'Barbarian': 'Barbarian',
  'Bardo': 'Bard', 'Bard': 'Bard',
  'Clérigo': 'Cleric', 'Cleric': 'Cleric',
  'Druida': 'Druid', 'Druid': 'Druid',
  'Guerreiro': 'Fighter', 'Fighter': 'Fighter',
  'Monge': 'Monk', 'Monk': 'Monk',
  'Paladino': 'Paladin', 'Paladin': 'Paladin',
  'Patrulheiro': 'Ranger', 'Ranger': 'Ranger',
  'Ladino': 'Rogue', 'Rogue': 'Rogue',
  'Feiticeiro': 'Sorcerer', 'Sorcerer': 'Sorcerer',
  'Bruxo': 'Warlock', 'Warlock': 'Warlock',
  'Mago': 'Wizard', 'Wizard': 'Wizard'
};

export const STAT_NAMES: Record<StatKey, string> = {
  str: 'FOR', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR'
};

export const FIGHTING_STYLES = [
  { id: 'Arquearia', name: 'Arquearia', desc: 'Pré-requisito: Característica Estilo de Luta de classe. +2 de bônus nas jogadas de ataque com armas à distância.' },
  { id: 'Combate com Armas Grandes', name: 'Combate com Armas Grandes', desc: 'Pré-requisito: Característica Estilo de Luta de classe. Rolagens de 1 ou 2 nos dados de dano de arma de duas mãos/versátil são tratadas como 3.' },
  { id: 'Combate com Duas Armas', name: 'Combate com Duas Armas', desc: 'Pré-requisito: Característica Estilo de Luta de classe. Adiciona o modificador de habilidade ao dano do ataque com a segunda arma leve.' },
  { id: 'Combate Desarmado', name: 'Combate Desarmado', desc: 'Pré-requisito: Característica Estilo de Luta de classe. Dano do Ataque Desarmado vira 1d6 + Mod (ou 1d8 + Mod se com ambas as mãos livres) e causa 1d4 de dano automático 1x/turno a criatura agarrada.' },
  { id: 'Defensivo', name: 'Defensivo', desc: 'Pré-requisito: Característica Estilo de Luta de classe. +1 de bônus na Classe de Armadura (CA) enquanto usar qualquer armadura.' },
  { id: 'Duelismo', name: 'Duelismo', desc: 'Pré-requisito: Característica Estilo de Luta de classe. +2 de bônus nas jogadas de ataque (acerto) ao empunhar apenas 1 arma corpo a corpo em uma mão e nenhuma outra.' },
  { id: 'Interceptação', name: 'Interceptação', desc: 'Pré-requisito: Característica Estilo de Luta de classe. Reação (arma/escudo) para reduzir em 1d10 + Proficiência o dano sofrido por aliado a até 1,5m. [ALERTA DE REAÇÃO: Ativado ao aliado sofrer dano].', disabled: true, disabledReason: 'Desabilitado (Aguardando Jogos em Grupo)' },
  { id: 'Luta às Cegas', name: 'Luta às Cegas', desc: 'Pré-requisito: Característica Estilo de Luta de classe. Visão às Cegas num raio de 3 metros.' },
  { id: 'Protetivo', name: 'Protetivo', desc: 'Pré-requisito: Característica Estilo de Luta de classe. Reação (escudo) para impor Desvantagem no ataque de inimigo contra aliado a até 1,5m. [ALERTA DE REAÇÃO: Ativado com aliado próximo].', disabled: true, disabledReason: 'Desabilitado (Aguardando Jogos em Grupo)' }
];
