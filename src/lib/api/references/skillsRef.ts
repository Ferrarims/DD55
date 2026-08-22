export type SkillKey =
  | 'acrobatics'
  | 'animal_handling'
  | 'arcana'
  | 'athletics'
  | 'deception'
  | 'history'
  | 'insight'
  | 'intimidation'
  | 'investigation'
  | 'medicine'
  | 'nature'
  | 'perception'
  | 'performance'
  | 'persuasion'
  | 'religion'
  | 'sleight_of_hand'
  | 'stealth'
  | 'survival';

export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export interface SkillReferenceItem {
  id: SkillKey;
  namePt: string;
  nameEn: string;
  ability: AbilityKey;
  abilityNamePt: string;
  icon: string;
  description: string;
  exampleUses: string;
  inGameUtility: string;
  hasActiveFeature?: boolean;
}

export const SKILLS_REFERENCE: Record<SkillKey, SkillReferenceItem> = {
  acrobatics: {
    id: 'acrobatics',
    namePt: 'Acrobacia',
    nameEn: 'Acrobatics',
    ability: 'dex',
    abilityNamePt: 'Destreza',
    icon: '🤸',
    description: 'Reflete sua agilidade corporal, equilíbrio e habilidade para realizar manobras acrobáticas complexas e manter-se de pé.',
    exampleUses: 'Manter-se de pé em uma situação traiçoeira, caminhar sobre gelo fino, passar por uma corda bamba ou realizar saltos acrobáticos.',
    inGameUtility: 'Usado para evitar quedas e superar superfícies escorregadias ou terrenos traiçoeiros.'
  },
  animal_handling: {
    id: 'animal_handling',
    namePt: 'Lidar com Animais',
    nameEn: 'Animal Handling',
    ability: 'wis',
    abilityNamePt: 'Sabedoria',
    icon: '🐺',
    description: 'Capacidade de acalmar animais domésticos ou selvagens, guiar montarias por terrenos perigosos e intuir intenções de feras.',
    exampleUses: 'Acalmar ou treinar um animal, impedir que uma montaria se assuste ou fazer uma criatura fera agir de maneira dócil.',
    inGameUtility: 'Utilizado ao interagir com criaturas animais e montarias no mundo de jogo.'
  },
  arcana: {
    id: 'arcana',
    namePt: 'Arcanismo',
    nameEn: 'Arcana',
    ability: 'int',
    abilityNamePt: 'Inteligência',
    icon: '🔮',
    description: 'Mede a sua erudição sobre magias, feitiços, runas arcanas, itens mágicos e os mistérios dos planos de existência.',
    exampleUses: 'Recordar conhecimentos sobre feitiços, itens mágicos, símbolos eldritch e os planos de existência.',
    inGameUtility: 'Permite identificar propriedades de runas místicas, pergaminhos e auras de magia.'
  },
  athletics: {
    id: 'athletics',
    namePt: 'Atletismo',
    nameEn: 'Athletics',
    ability: 'str',
    abilityNamePt: 'Força',
    icon: '🏋️',
    description: 'Cobre situações desafiadoras que exigem vigor muscular e esforço físico, como escalada, natação, saltos e quebrar obstáculos.',
    exampleUses: 'Pular mais longe que o normal, manter-se à tona em águas revoltas, escalar uma muralha ou quebrar uma barreira sólida.',
    inGameUtility: 'Usado em manobras de combate como Agarrar e Empurrar e para superar barreiras físicas.'
  },
  deception: {
    id: 'deception',
    namePt: 'Enganação',
    nameEn: 'Deception',
    ability: 'cha',
    abilityNamePt: 'Carisma',
    icon: '🎭',
    description: 'Determina se você consegue ocultar a verdade de forma convincente, seja verbalmente ou através de disfarces e ações ambíguas.',
    exampleUses: 'Contar uma mentira convincente, usar um disfarce de forma crível ou enganar sentinelas.',
    inGameUtility: 'Permite ludibriar NPCs, desviar suspeitas e sustentar mentiras em diálogos.'
  },
  history: {
    id: 'history',
    namePt: 'História',
    nameEn: 'History',
    ability: 'int',
    abilityNamePt: 'Inteligência',
    icon: '📜',
    description: 'Mede a capacidade de recordar fatos históricos, dinastias passadas, civilizações esquecidas, guerras e lendas antigas.',
    exampleUses: 'Recordar fatos sobre eventos históricos, personalidades notáveis, nações antigas e culturas passadas.',
    inGameUtility: 'Revela segredos e contexto do cenário ao examinar relíquias e ruínas.'
  },
  insight: {
    id: 'insight',
    namePt: 'Intuição',
    nameEn: 'Insight',
    ability: 'wis',
    abilityNamePt: 'Sabedoria',
    icon: '👁️‍🗨️',
    description: 'Determina a habilidade de ler a linguagem corporal de uma pessoa, discernir suas verdadeiras intenções e perceber mentiras.',
    exampleUses: 'Discernir o humor e as intenções de uma pessoa, detectar mentiras ou prever a próxima ação de um adversário.',
    inGameUtility: 'Utilizado para detectar blefes e prever hostilidade de criaturas.'
  },
  intimidation: {
    id: 'intimidation',
    namePt: 'Intimidação',
    nameEn: 'Intimidation',
    ability: 'cha',
    abilityNamePt: 'Carisma',
    icon: '😠',
    description: 'Quando você tenta influenciar alguém por meio de ameaças explícitas, hostilidade visível ou imposição de presença assustadora.',
    exampleUses: 'Amedrontar ou coagir alguém a fazer o que você deseja através de postura intimidadora.',
    inGameUtility: 'Pode forçar inimigos a recuarem ou confessarem informações valiosas.'
  },
  investigation: {
    id: 'investigation',
    namePt: 'Investigação',
    nameEn: 'Investigation',
    ability: 'int',
    abilityNamePt: 'Inteligência',
    icon: '🔍',
    description: 'Capacidade de deduzir a localização de pistas, desvendar como engrenagens e mecanismos operam e encontrar segredos ocultos.',
    exampleUses: 'Encontrar informações obscuras em livros, descobrir passagens secretas ou deduzir como um mecanismo ou armadilha funciona.',
    inGameUtility: 'Ação ativa para inspecionar áreas, deduzir pontos fracos de armadilhas e descobrir trincas/segredos.',
    hasActiveFeature: true
  },
  medicine: {
    id: 'medicine',
    namePt: 'Medicina',
    nameEn: 'Medicine',
    ability: 'wis',
    abilityNamePt: 'Sabedoria',
    icon: '🩺',
    description: 'Conhecimento médico para diagnosticar doenças, identificar causas de morte e prestar primeiros socorros de emergência.',
    exampleUses: 'Diagnosticar uma doença, determinar o que matou uma criatura recentemente ou estabilizar um aliado moribundo.',
    inGameUtility: 'Permite realizar Primeiros Socorros no campo e examinar corpos e venenos.',
    hasActiveFeature: true
  },
  nature: {
    id: 'nature',
    namePt: 'Natureza',
    nameEn: 'Nature',
    ability: 'int',
    abilityNamePt: 'Inteligência',
    icon: '🌿',
    description: 'Conhecimento sobre a flora, fauna selvagem, ecossistemas naturais, padrões de clima e venenos botânicos.',
    exampleUses: 'Recordar conhecimentos sobre terrenos, plantas, animais selvagens, climas e ciclos naturais.',
    inGameUtility: 'Ajuda a identificar propriedades de plantas curativas e perigos ambientais.'
  },
  perception: {
    id: 'perception',
    namePt: 'Percepção',
    nameEn: 'Perception',
    ability: 'wis',
    abilityNamePt: 'Sabedoria',
    icon: '👁️',
    description: 'Uso combinado de visão, audição e outros sentidos para notar a presença de algo que passa facilmente despercebido.',
    exampleUses: 'Usando uma combinação de sentidos, notar algo que é fácil de perder, como um som suave ou uma armadilha oculta.',
    inGameUtility: 'Percepção Passiva (10 + SAB + PB) detecta automaticamente armadilhas e inimigos ocultos conforme você se move.',
    hasActiveFeature: true
  },
  performance: {
    id: 'performance',
    namePt: 'Atuação',
    nameEn: 'Performance',
    ability: 'cha',
    abilityNamePt: 'Carisma',
    icon: '🪕',
    description: 'Sua capacidade de encantar e cativar uma plateia com música, canto, dança, teatro ou oratória inspiradora.',
    exampleUses: 'Atuar em uma peça, contar uma história memorável, tocar um instrumento musical ou dançar.',
    inGameUtility: 'Gera entretenimento, distrai guardas e ganha apreço em tavernas e cortes.'
  },
  persuasion: {
    id: 'persuasion',
    namePt: 'Persuasão',
    nameEn: 'Persuasion',
    ability: 'cha',
    abilityNamePt: 'Carisma',
    icon: '🤝',
    description: 'Quando você tenta influenciar alguém com tato, gentileza, argumentos racionais, etiqueta social e boa-fé.',
    exampleUses: 'Convencer alguém de forma honesta e graciosa, negociar um acordo pacífico ou conquistar a confiança de alguém.',
    inGameUtility: 'Usado para negociar melhores termos, evitar combates desnecessários e obter descontos.'
  },
  religion: {
    id: 'religion',
    namePt: 'Religião',
    nameEn: 'Religion',
    ability: 'int',
    abilityNamePt: 'Inteligência',
    icon: '⛪',
    description: 'Conhecimento aprofundado sobre divindades, ordens sagradas, cultos sombrios, rituais litúrgicos e símbolos santos.',
    exampleUses: 'Recordar conhecimentos sobre deuses, ritos religiosos, orações sagradas e símbolos sagrados.',
    inGameUtility: 'Ajuda a decifrar rituais antigos, consagrações e reconhecer cultos profanos.'
  },
  sleight_of_hand: {
    id: 'sleight_of_hand',
    namePt: 'Prestidigitação',
    nameEn: 'Sleight of Hand',
    ability: 'dex',
    abilityNamePt: 'Destreza',
    icon: '🧤',
    description: 'Habilidade manual para realizar truques de mãos, bater carteiras (punga), ocultar pequenos objetos e desarmar mecanismos delicados.',
    exampleUses: 'Bater uma carteira, ocultar um pequeno objeto nas mãos ou realizar truques manuais e desarmar armadilhas.',
    inGameUtility: 'Ação ativa para desarmar armadilhas no mapa, arrombar trancas e manipular dispositivos de precisão.',
    hasActiveFeature: true
  },
  stealth: {
    id: 'stealth',
    namePt: 'Furtividade',
    nameEn: 'Stealth',
    ability: 'dex',
    abilityNamePt: 'Destreza',
    icon: '🥷',
    description: 'Mede sua perícia em escapar da detecção alheia, movendo-se silenciosamente e escondendo-se atrás de coberturas e nas sombras.',
    exampleUses: 'Passar despercebido movendo-se em silêncio e escondendo-se atrás de coberturas, vegetação ou sombras.',
    inGameUtility: 'Ação Esconder (Hide) em combate e exploração para ganhar o status Invisível / Furtivo.',
    hasActiveFeature: true
  },
  survival: {
    id: 'survival',
    namePt: 'Sobrevivência',
    nameEn: 'Survival',
    ability: 'wis',
    abilityNamePt: 'Sabedoria',
    icon: '🧭',
    description: 'Habilidade de navegar pelos ermos, seguir pegadas e rastros de presas, coletar comida/água e evitar perigos naturais.',
    exampleUses: 'Seguir rastros, forragear recursos, encontrar uma trilha segura ou evitar perigos e intempéries naturais.',
    inGameUtility: 'Usado para forragear suprimentos em viagens e rastrear monstros no território.',
    hasActiveFeature: true
  }
};

export const ALL_SKILL_KEYS: SkillKey[] = Object.keys(SKILLS_REFERENCE) as SkillKey[];

export const PT_SKILL_NAME_TO_KEY: Record<string, SkillKey> = {
  'acrobacia': 'acrobatics',
  'acrobatics': 'acrobatics',
  'adestrar animais': 'animal_handling',
  'lidar com animais': 'animal_handling',
  'animal handling': 'animal_handling',
  'arcanismo': 'arcana',
  'arcana': 'arcana',
  'atletismo': 'athletics',
  'athletics': 'athletics',
  'enganação': 'deception',
  'enganacao': 'deception',
  'deception': 'deception',
  'história': 'history',
  'historia': 'history',
  'history': 'history',
  'intuição': 'insight',
  'intuicao': 'insight',
  'insight': 'insight',
  'intimidação': 'intimidation',
  'intimidacao': 'intimidation',
  'intimidation': 'intimidation',
  'investigação': 'investigation',
  'investigacao': 'investigation',
  'investigation': 'investigation',
  'medicina': 'medicine',
  'medicine': 'medicine',
  'natureza': 'nature',
  'nature': 'nature',
  'percepção': 'perception',
  'percepcao': 'perception',
  'perception': 'perception',
  'atuação': 'performance',
  'atuacao': 'performance',
  'performance': 'performance',
  'persuasão': 'persuasion',
  'persuasao': 'persuasion',
  'persuasion': 'persuasion',
  'religião': 'religion',
  'religiao': 'religion',
  'religion': 'religion',
  'prestidigitação': 'sleight_of_hand',
  'prestidigitacao': 'sleight_of_hand',
  'ladinagem': 'sleight_of_hand',
  'mãos leves': 'sleight_of_hand',
  'sleight of hand': 'sleight_of_hand',
  'sleight_of_hand': 'sleight_of_hand',
  'furtividade': 'stealth',
  'stealth': 'stealth',
  'sobrevivência': 'survival',
  'sobrevivencia': 'survival',
  'survival': 'survival'
};
