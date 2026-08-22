import { WeatherType } from '../types';

export interface WeatherInfo {
  type: WeatherType;
  label: string;
  icon: string;
  tagline: string;
  description: string;
  gameEffects: string[];
  color: string;
  badgeBg: string;
  badgeBorder: string;
}

export const WEATHER_CONFIGS: Record<WeatherType, WeatherInfo> = {
  clear: {
    type: 'clear',
    label: 'Limpo',
    icon: '☀️',
    tagline: 'Céu aberto e visibilidade padrão',
    description: 'Sem alterações climáticas ou penalidades no mapa.',
    gameEffects: [
      'Visibilidade normal em todo o alcance',
      'Movimentação e ataques sem penalidades climáticas'
    ],
    color: 'text-amber-300',
    badgeBg: 'bg-amber-950/50',
    badgeBorder: 'border-amber-500/40'
  },
  rain: {
    type: 'rain',
    label: 'Chuva',
    icon: '🌧️',
    tagline: 'Chuva constante e terreno úmido',
    description: 'Gotas de chuva refrescam o campo de batalha. Visão além de 18m (12 quadrados) fica levemente obscurecida e superfícies ficam úmidas.',
    gameEffects: [
      'Gotas e poças de água dinâmicas caindo sobre o mapa',
      'Leve obscurecimento para alvos a longa distância (>18m)',
      'Superfície úmida facilita apagar chamas e reduz propagação de fogo'
    ],
    color: 'text-sky-300',
    badgeBg: 'bg-sky-950/60',
    badgeBorder: 'border-sky-500/50'
  },
  snow: {
    type: 'snow',
    label: 'Neve',
    icon: '❄️',
    tagline: 'Nevasca e frio cortante',
    description: 'Flocos de neve acumulam sobre o terreno. O frio intenso causa lentidão no deslocamento terrestre.',
    gameEffects: [
      'Flocos de neve flutuantes com névoa e geada gelada',
      'Frio Intenso: Deslocamento no solo reduzido em 1,5m (1 quadrado)',
      'Resistência natural a calor e bônus sutil a danos congelantes'
    ],
    color: 'text-cyan-200',
    badgeBg: 'bg-cyan-950/60',
    badgeBorder: 'border-cyan-400/50'
  },
  wind: {
    type: 'wind',
    label: 'Vento',
    icon: '💨',
    tagline: 'Rajadas fortes e folhas voando',
    description: 'Ventos fortes sopram pelo campo de batalha. Ataques à distância com projéteis sofrem turbulência.',
    gameEffects: [
      'Folhas, poeira e linhas de vento em alta velocidade',
      'Vento Forte: Desvantagem em projéteis além de 6m (4 quadrados)',
      'Voo contra a direção do vento consome o dobro de movimento'
    ],
    color: 'text-teal-300',
    badgeBg: 'bg-teal-950/60',
    badgeBorder: 'border-teal-500/50'
  },
  storm: {
    type: 'storm',
    label: 'Tempestade',
    icon: '⛈️',
    tagline: 'Chuva torrencial e relâmpagos',
    description: 'Tempestade severa com chuva pesada, rajadas de vento tempestuosas e relâmpagos que iluminam o mapa inteiro.',
    gameEffects: [
      'Chuva torrencial veloz e relâmpagos com trovões estrondosos',
      'Clarões dos raios iluminam temporariamente todo o mapa mesmo à noite',
      'Desvantagem em ataques à distância com armas de projéteis',
      'Percepção auditiva e visual reduzida além de 9m (6 quadrados)'
    ],
    color: 'text-indigo-300',
    badgeBg: 'bg-indigo-950/70',
    badgeBorder: 'border-indigo-500/60'
  },
  fog: {
    type: 'fog',
    label: 'Neblina',
    icon: '🌫️',
    tagline: 'Névoa densa e visibilidade reduzida',
    description: 'Bancos espessos de névoa cobrem a arena. A visão é limitada a curta distância e ataques distantes ficam fortemente obscurecidos.',
    gameEffects: [
      'Camadas volumétricas de névoa em deslocamento contínuo',
      'Obscurecimento Pesado além de 9m (6 quadrados)',
      'Ataques contra criaturas além de 9m sofrem Desvantagem por baixa visibilidade'
    ],
    color: 'text-slate-300',
    badgeBg: 'bg-slate-900/80',
    badgeBorder: 'border-slate-500/50'
  }
};
