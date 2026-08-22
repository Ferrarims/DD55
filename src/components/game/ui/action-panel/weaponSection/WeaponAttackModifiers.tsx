import React from 'react';
import { useGameContext } from '../../../context/GameContext';

export const WeaponAttackModifiers: React.FC = () => {
  const {
    currentSelectedAttack,
    versatileTwoHandedWeapons,
    setVersatileTwoHandedWeapons,
    gwmActive,
    setGwmActive,
    isTwoHandedWeaponLocal,
    isVersatileWeapon,
    getActiveFeats,
  } = useGameContext();

  const activeFeatsList = getActiveFeats();
  const hasGWMFeat = activeFeatsList.includes('Mestre em Armas Grandes') || activeFeatsList.includes('Great Weapon Master');
  const hasSharpshooterFeat = activeFeatsList.some((f: string) => typeof f === 'string' && (f.toLowerCase().includes('mestre-atirador') || f.toLowerCase().includes('mestre atirador') || f.toLowerCase().includes('sharpshooter')));

  const isCurrentWeaponTwoHanded = currentSelectedAttack?.properties?.toLowerCase().includes('duas mãos') || 
                                   currentSelectedAttack?.properties?.toLowerCase().includes('two-handed') || 
                                   (currentSelectedAttack?.name && isTwoHandedWeaponLocal(currentSelectedAttack.name, currentSelectedAttack.properties));
  const isCurrentAttackMelee = !(currentSelectedAttack?.properties?.toLowerCase().includes('munição') || currentSelectedAttack?.properties?.toLowerCase().includes('municao') || String(currentSelectedAttack?.range || '').toLowerCase().includes('/') || String(currentSelectedAttack?.name || '').toLowerCase().includes('arco') || String(currentSelectedAttack?.name || '').toLowerCase().includes('besta') || String(currentSelectedAttack?.name || '').toLowerCase().includes('funda'));
  const isCurrentAttackRanged = !isCurrentAttackMelee;

  const showGwmToggle = hasGWMFeat && isCurrentWeaponTwoHanded && isCurrentAttackMelee;

  return (
    <>
      {/* Botão de escolha de empunhadura para armas versáteis */}
      {currentSelectedAttack && isVersatileWeapon(currentSelectedAttack.name, currentSelectedAttack.properties) && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2 my-1 shadow-md">
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
              ⚖️ Empunhadura ({currentSelectedAttack.name})
            </span>
            <span className="text-[9.5px] text-slate-400 leading-tight mt-0.5">
              {versatileTwoHandedWeapons[currentSelectedAttack.name] 
                ? 'Usando com 2 Mãos: Dano aumentado, 🛡️ Escudo Inativo.' 
                : 'Usando com 1 Mão: Dano padrão, 🛡️ Escudo Ativo.'}
            </span>
          </div>
          <button
            onClick={() => {
              const name = currentSelectedAttack.name;
              setVersatileTwoHandedWeapons(prev => ({
                ...prev,
                [name]: !prev[name]
              }));
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition border shrink-0 ${
              versatileTwoHandedWeapons[currentSelectedAttack.name]
                ? 'bg-amber-500 text-slate-950 border-amber-300 shadow'
                : 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
            title="Alternar entre empunhar com 1 mão (com escudo) ou 2 mãos (maior dano, sem escudo)"
          >
            {versatileTwoHandedWeapons[currentSelectedAttack.name] ? '⚔️ 2 Mãos' : '🛡️ 1 Mão'}
          </button>
        </div>
      )}

      {/* Badge Informativo de Talento Passivo: Mestre-Atirador */}
      {hasSharpshooterFeat && isCurrentAttackRanged && (
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-2 flex items-center justify-between text-xs text-emerald-300 my-1 shadow-sm">
          <div className="flex flex-col text-left mr-2">
            <span className="font-bold flex items-center gap-1 text-[11px] text-emerald-200">
              🏹 Mestre-Atirador
            </span>
            <span className="text-[9.5px] text-emerald-400/90 leading-tight mt-0.5">
              Ignora Meia Cobertura (+2 CA) e Três Quartos (+5 CA), Inimigos Próximos (1,5m) e Alcance Longo sem desvantagem.
            </span>
          </div>
          <span className="text-emerald-400 bg-emerald-900/50 border border-emerald-700/60 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0">
            Passivo
          </span>
        </div>
      )}

      {/* Painel de Talentos Ativos de Combate (GWM) */}
      {showGwmToggle && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2 my-1 shadow-md">
          <div className="text-[10px] font-bold text-amber-400 flex items-center justify-between">
            <span>💥 AJUSTE DE TALENTO EM COMBATE:</span>
            <span className="text-[9px] text-slate-400 font-mono">Talento</span>
          </div>
          
          <label className="flex items-center justify-between bg-slate-950 hover:bg-slate-900 transition p-2 rounded-lg border border-slate-800 cursor-pointer">
            <div className="flex flex-col text-left mr-2">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1">
                ⚔️ Mestre em Armas Grandes
              </span>
              <span className="text-[9.5px] text-slate-400 leading-tight mt-0.5">
                Ativar Golpe Poderoso: <strong className="text-rose-400">-5 Acerto</strong> para ganhar <strong className="text-emerald-400">+10 Dano</strong>.
              </span>
            </div>
            <input
              type="checkbox"
              checked={gwmActive}
              onChange={(e) => {
                setGwmActive(e.target.checked);
              }}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500 accent-amber-500 cursor-pointer shrink-0"
            />
          </label>
        </div>
      )}
    </>
  );
};
