import React from 'react';
import { Award, RefreshCw, Heart, Eye } from 'lucide-react';
import { CLASS_REFERENCE } from '../../../lib/api/references';
import { getMod } from '../../../lib/mechanics/hpCalculator';

interface UserCharactersTabProps {
  username: string;
  characters: any[];
  loadingCharacters: boolean;
  loadCharacters: () => Promise<void>;
  handleInspectCharacter: (char: any) => Promise<void>;
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

export const UserCharactersTab: React.FC<UserCharactersTabProps> = ({
  username,
  characters,
  loadingCharacters,
  loadCharacters,
  handleInspectCharacter,
}) => {
  const formatMod = (m: number) => (m >= 0 ? `+${m}` : `${m}`);

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h3
            className="font-bold text-lg text-slate-200"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Personagens de @{username}
          </h3>
          <span className="text-xs bg-slate-950 text-slate-400 border border-slate-800 px-2.5 py-0.5 rounded-full font-bold">
            {characters.length}
          </span>
        </div>

        <button
          type="button"
          onClick={loadCharacters}
          disabled={loadingCharacters}
          className="text-xs text-slate-400 hover:text-amber-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingCharacters ? 'animate-spin text-amber-500' : ''}`} />
          <span>Atualizar</span>
        </button>
      </div>

      {loadingCharacters ? (
        <div className="py-12 text-center bg-slate-950/40 rounded-xl border border-slate-800/80">
          <div className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-slate-400">Carregando personagens do usuário...</p>
        </div>
      ) : characters.length === 0 ? (
        <div className="py-12 px-4 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-xl space-y-2">
          <div className="text-3xl">🧙‍♂️</div>
          <h4 className="text-sm font-bold text-slate-300">Nenhum personagem cadastrado</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Este usuário ainda não criou nenhum aventureiro no banco de dados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {characters.map((char, idx) => {
            const icon =
              (CLASS_REFERENCE as any)[char.class_name]?.icon ||
              CLASS_ICONS[char.class_name] ||
              '🗡️';
            const maxHp = char.max_hp || 10;
            const currentHp = char.current_hp ?? maxHp;
            const hpPercent = Math.max(0, Math.min(100, (currentHp / maxHp) * 100));

            const strMod = getMod(char.strength ?? 10);
            const dexMod = getMod(char.dexterity ?? 10);
            const conMod = getMod(char.constitution ?? 10);
            const intMod = getMod(char.intelligence ?? 10);
            const wisMod = getMod(char.wisdom ?? 10);
            const chaMod = getMod(char.charisma ?? 10);

            return (
              <div
                key={char.id || idx}
                onClick={() => handleInspectCharacter(char)}
                className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-xl p-4.5 space-y-3.5 transition-all shadow-md hover:shadow-lg cursor-pointer group"
              >
                {/* Linha de Título do Personagem */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-3xl bg-slate-900 p-2 rounded-xl border border-slate-800 shrink-0">
                      {icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-base text-slate-100 truncate" title={char.name}>
                        {char.name || 'Sem Nome'}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {char.race || 'Humano'} • {char.class_name || 'Guerreiro'}
                        {char.subclass ? ` (${char.subclass})` : ''}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md shrink-0">
                    Nível {char.level || 1}
                  </span>
                </div>

                {/* Barra de Vida & Estatísticas de Combate */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-red-500" /> Pontos de Vida:
                    </span>
                    <span className="font-bold font-mono text-slate-200">
                      {currentHp} / {maxHp} PV
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-300 ${
                        hpPercent > 50
                          ? 'bg-emerald-500'
                          : hpPercent > 25
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${hpPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* CA, Moedas e Deslocamento */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-850 text-center">
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg py-1.5 px-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">CA</span>
                    <span className="text-sm font-black text-amber-400">{char.armor_class || 10}</span>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg py-1.5 px-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Ouro</span>
                    <span className="text-sm font-black text-amber-300 truncate block">
                      {char.coins || `${char.gp || 0} PO`}
                    </span>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800/80 rounded-lg py-1.5 px-1">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Velocidade</span>
                    <span className="text-sm font-bold text-slate-300">{char.speed || '9m'}</span>
                  </div>
                </div>

                {/* Mini Atributos */}
                <div className="grid grid-cols-6 gap-1 text-center bg-slate-900/40 p-1.5 rounded-lg border border-slate-850 text-[11px]">
                  <div>
                    <span className="text-slate-500 text-[9px] block font-bold">FOR</span>
                    <span className="text-slate-200 font-bold">{char.strength || 10}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">({formatMod(strMod)})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block font-bold">DES</span>
                    <span className="text-slate-200 font-bold">{char.dexterity || 10}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">({formatMod(dexMod)})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block font-bold">CON</span>
                    <span className="text-slate-200 font-bold">{char.constitution || 10}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">({formatMod(conMod)})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block font-bold">INT</span>
                    <span className="text-slate-200 font-bold">{char.intelligence || 10}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">({formatMod(intMod)})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block font-bold">SAB</span>
                    <span className="text-slate-200 font-bold">{char.wisdom || 10}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">({formatMod(wisMod)})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[9px] block font-bold">CAR</span>
                    <span className="text-slate-200 font-bold">{char.charisma || 10}</span>
                    <span className="text-[9px] text-slate-400 block font-mono">({formatMod(chaMod)})</span>
                  </div>
                </div>

                {/* Botão de Inspecionar Ficha */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInspectCharacter(char);
                  }}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-amber-300 border border-slate-700 hover:border-amber-500/50 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Eye className="w-4 h-4 text-amber-500" />
                  <span>Inspecionar Ficha Completa</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
