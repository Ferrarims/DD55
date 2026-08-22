import React from 'react';
import { CLASS_REFERENCE } from '../../../lib/api/references';
import { getBestiaryStats } from '../sheet/utils';

interface CharacterCardItemProps {
  char: any;
  onEnterGame?: (character: any) => void;
  onSelectCharacter: (character: any) => void;
  onOpenBestiary: (character: any) => void;
  onRequestDelete: (charInfo: { id: string; name: string }) => void;
}

const CLASS_ICONS: Record<string, string> = {
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

export const CharacterCardItem: React.FC<CharacterCardItemProps> = ({
  char,
  onEnterGame,
  onSelectCharacter,
  onOpenBestiary,
  onRequestDelete,
}) => {
  const icon = (CLASS_REFERENCE as any)[char.class_name]?.icon || CLASS_ICONS[char.class_name] || '🗡️';
  const bestiaryStats = getBestiaryStats(char);

  let draconicAncestry = char.draconic_ancestry || char.draconicAncestry;
  if (!draconicAncestry && /draconato|dragonborn/i.test(char.race || '')) {
    const nameLower = (char.name || '').toLowerCase();
    if (nameLower.includes('preto') || nameLower.includes('negro')) draconicAncestry = 'Preto';
    else if (nameLower.includes('vermelho')) draconicAncestry = 'Vermelho';
    else if (nameLower.includes('azul')) draconicAncestry = 'Azul';
    else if (nameLower.includes('verde')) draconicAncestry = 'Verde';
    else if (nameLower.includes('branc')) draconicAncestry = 'Branco';
    else if (nameLower.includes('ouro') || nameLower.includes('dourado')) draconicAncestry = 'Ouro';
    else if (nameLower.includes('prata')) draconicAncestry = 'Prata';
    else if (nameLower.includes('bronze')) draconicAncestry = 'Bronze';
    else if (nameLower.includes('cobre')) draconicAncestry = 'Cobre';
    else if (nameLower.includes('latão') || nameLower.includes('latao')) draconicAncestry = 'Latão';
  }

  let giantAncestry = char.giant_ancestry || char.giantAncestry;
  if (!giantAncestry && /golias|goliath/i.test(char.race || '')) {
    const nameLower = (char.name || '').toLowerCase();
    if (nameLower.includes('gelo') || nameLower.includes('geada')) giantAncestry = 'Gigante do Gelo';
    else if (nameLower.includes('fogo')) giantAncestry = 'Gigante do Fogo';
    else if (nameLower.includes('nuvem') || nameLower.includes('nuvens')) giantAncestry = 'Gigante das Nuvens';
    else if (nameLower.includes('pedra')) giantAncestry = 'Gigante da Pedra';
    else if (nameLower.includes('tempestade')) giantAncestry = 'Gigante da Tempestade';
    else if (nameLower.includes('colina')) giantAncestry = 'Gigante da Colina';
  }

  const maxHp = char.max_hp ?? char.maxHp ?? 10;
  const currentHp = Math.min(char.current_hp ?? char.currentHp ?? maxHp, maxHp);

  return (
    <div className="bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-500/60 rounded-xl p-5 flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-xl group">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="text-4xl bg-slate-900 p-2 rounded-xl border border-slate-700 group-hover:scale-105 transition-transform shrink-0">
              {icon}
            </span>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-base sm:text-lg text-slate-100 group-hover:text-amber-400 transition-colors truncate" title={char.name || 'Sem Nome'}>
                {char.name || 'Sem Nome'}
              </h4>
              <div className="mt-1">
                <span className="inline-block text-[11px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md shadow-sm">
                  Nível {char.level || 1}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenBestiary(char);
              }}
              className="w-full sm:w-auto px-2.5 py-1 bg-slate-900/90 hover:bg-indigo-900/90 text-indigo-300 hover:text-indigo-100 border border-slate-700 hover:border-indigo-500/60 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              title={`Abrir Bestiário de ${char.name || 'Personagem'}`}
            >
              <span>📖</span>
              <span>Bestiário</span>
            </button>

            <div 
              className="flex items-center gap-1.5 bg-slate-900/90 border border-indigo-900/60 rounded-lg px-2 py-0.5 text-[11px] shadow-inner"
              title={`Criaturas Derrotadas por ${char.name || 'este personagem'}: ${bestiaryStats.uniqueCount} espécie(s) diferente(s), ${bestiaryStats.totalCount} no total`}
            >
              <span className="text-indigo-300 font-medium whitespace-nowrap">
                👾 <strong className="text-indigo-200 font-bold">{bestiaryStats.uniqueCount}</strong> dif.
              </span>
              <span className="text-slate-600 font-bold">•</span>
              <span className="text-amber-300 font-medium whitespace-nowrap">
                💀 <strong className="text-amber-200 font-bold">{bestiaryStats.totalCount}</strong> total
              </span>
            </div>
          </div>
        </div>

        {/* Raça, Ancestralidade e Classe */}
        <div className="bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-700/60">
          <p className="text-xs font-medium text-slate-300 leading-normal break-words">
            <span className="font-bold text-slate-200">{char.race || 'Raça'}</span>
            {draconicAncestry && <span className="text-amber-400 font-bold"> ({draconicAncestry})</span>}
            {giantAncestry && <span className="text-amber-400 font-bold"> ({giantAncestry})</span>}
            <span className="text-slate-500 mx-1.5">•</span>
            <span className="text-slate-300">{char.class_name || 'Guerreiro'}</span>
          </p>
        </div>

        {/* Atributos Básicos Mini */}
        <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold">PV</span>
            <span className="font-black text-red-400">{`${currentHp}/${maxHp}`}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold">CA</span>
            <span className="font-black text-amber-400">{char.armor_class ?? 10}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-bold">FOR/DES</span>
            <span className="font-bold text-slate-300">{char.strength ?? 10}/{char.dexterity ?? 10}</span>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
        {onEnterGame && (
          <button
            onClick={() => onEnterGame(char)}
            className="flex-1 px-2.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-lg transition text-center shadow flex items-center justify-center gap-1 border border-amber-300"
            title="Entrar na Mesa de Jogo"
          >
            🎮 Jogar
          </button>
        )}
        <button
          onClick={() => onSelectCharacter(char)}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-lg transition text-center border border-slate-600"
        >
          👁️ Ficha
        </button>
        <button
          onClick={() => onRequestDelete({ id: char.id, name: char.name || 'Sem Nome' })}
          className="px-2.5 py-2 bg-slate-800 hover:bg-red-900/80 text-slate-400 hover:text-red-200 font-semibold text-xs rounded-lg transition border border-slate-700"
          title="Excluir do banco"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
