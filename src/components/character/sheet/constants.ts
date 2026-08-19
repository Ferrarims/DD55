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
  {
    id: 'Arquearia',
    name: 'Arquearia',
    icon: '🏹',
    category: 'Talento de Estilo de Luta (D&D 2024)',
    prerequisite: 'Característica de classe Estilo de Luta',
    desc: 'Pré-requisito: Característica de classe Estilo de Luta. Você ganha um bônus de +2 nas jogadas de ataque realizadas com armas de ataque à distância.'
  },
  {
    id: 'Combate com Armas Grandes',
    name: 'Combate com Armas Grandes',
    icon: '🪓',
    category: 'Talento de Estilo de Luta (D&D 2024)',
    prerequisite: 'Característica de classe Estilo de Luta',
    desc: 'Pré-requisito: Característica de classe Estilo de Luta. Quando você rolar um 1 ou 2 em qualquer dado de dano de um ataque com arma corpo a corpo empunhada com as duas mãos (ou com a propriedade Duas Mãos ou Versátil usada com ambas as mãos), você pode tratar esse resultado como 3.'
  },
  {
    id: 'Combate com Duas Armas',
    name: 'Combate com Duas Armas',
    icon: '⚔️',
    category: 'Talento de Estilo de Luta (D&D 2024)',
    prerequisite: 'Característica de classe Estilo de Luta',
    desc: 'Pré-requisito: Característica de classe Estilo de Luta. Quando você realiza o ataque extra decorrente de empunhar duas armas com a propriedade Leve, você pode adicionar o seu modificador de habilidade ao dano desse ataque extra.'
  },
  {
    id: 'Combate Desarmado',
    name: 'Combate Desarmado',
    icon: '👊',
    category: 'Talento de Estilo de Luta (D&D 2024)',
    prerequisite: 'Característica de classe Estilo de Luta',
    desc: 'Pré-requisito: Característica de classe Estilo de Luta. Seus Ataques Desarmados causam 1d6 + Modificador de Força de dano de concussão (ou 1d8 + Modificador de Força se você não estiver empunhando nenhuma arma ou escudo). Além disso, no início de cada um dos seus turnos, você pode causar automaticamente 1d4 de dano de concussão a uma criatura que esteja agarrada por você.'
  },
  {
    id: 'Defensivo',
    name: 'Defensivo',
    icon: '🛡️',
    category: 'Talento de Estilo de Luta (D&D 2024)',
    prerequisite: 'Característica de classe Estilo de Luta',
    desc: 'Pré-requisito: Característica de classe Estilo de Luta. Enquanto você estiver vestindo qualquer tipo de armadura (Leve, Média ou Pesada), você recebe um bônus de +1 na sua Classe de Armadura (CA).'
  },
  {
    id: 'Duelismo',
    name: 'Duelismo',
    icon: '🤺',
    category: 'Talento de Estilo de Luta (D&D 2024)',
    prerequisite: 'Característica de classe Estilo de Luta',
    desc: 'Pré-requisito: Característica de classe Estilo de Luta. Quando você estiver empunhando uma arma de ataque corpo a corpo em uma mão e nenhuma outra arma, você recebe um bônus de +2 nas jogadas de ataque e dano com aquela arma.'
  },
  {
    id: 'Luta às Cegas',
    name: 'Luta às Cegas',
    icon: '👁️',
    category: 'Talento de Estilo de Luta (D&D 2024)',
    prerequisite: 'Característica de classe Estilo de Luta',
    desc: 'Pré-requisito: Característica de classe Estilo de Luta. Você ganha Visão às Cegas (Blindsight) num raio de 3 metros (10 pés). Dentro desse alcance, você pode ver efetivamente qualquer coisa que não esteja atrás de cobertura total, mesmo se estiver sob a condição Cego ou em escuridão total, e pode enxergar criaturas invisíveis a menos que tenham se escondido com sucesso.'
  },
  {
    id: 'Interceptação',
    name: 'Interceptação',
    icon: '🛡️',
    category: 'Talento de Estilo de Luta (D&D 2024)',
    prerequisite: 'Característica de classe Estilo de Luta',
    desc: 'Pré-requisito: Característica de classe Estilo de Luta. Quando uma criatura que você possa ver atingir um alvo diferente de você a até 1,5 metro com um ataque, você pode usar sua Reação para reduzir o dano sofrido pelo alvo em 1d10 + seu Bônus de Proficiência (desde que você esteja empunhando um escudo ou uma arma simples/marcial). [ALERTA DE REAÇÃO: Ativado ao aliado sofrer dano].',
    disabled: true,
    disabledReason: 'Desabilitado (Aguardando Jogos em Grupo / Modo Cooperativo)'
  },
  {
    id: 'Protetivo',
    name: 'Protetivo',
    icon: '🛡️',
    category: 'Talento de Estilo de Luta (D&D 2024)',
    prerequisite: 'Característica de classe Estilo de Luta',
    desc: 'Pré-requisito: Característica de classe Estilo de Luta. Quando uma criatura que você possa ver atacar um alvo diferente de você a até 1,5 metro de distância, você pode usar sua Reação para impor Desvantagem na jogada de ataque do inimigo (você deve estar empunhando um escudo). [ALERTA DE REAÇÃO: Ativado com aliado próximo].',
    disabled: true,
    disabledReason: 'Desabilitado (Aguardando Jogos em Grupo / Modo Cooperativo)'
  }
];
