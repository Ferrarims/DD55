import React from 'react';
import { AlertCircle, Check, Copy } from 'lucide-react';
import { isSupabaseConfigured } from '../../../lib/api/supabase';

export interface SqlMigrationAlertProps {
  fromDb: boolean;
  copiedSql: boolean;
  handleCopySql: () => void;
}

export function SqlMigrationAlert({
  fromDb,
  copiedSql,
  handleCopySql,
}: SqlMigrationAlertProps) {
  if (fromDb || !isSupabaseConfigured) return null;

  return (
    <div className="bg-amber-950/35 border border-amber-600/40 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <div className="flex gap-3 items-start">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-amber-400">Tabela de Implementações ausente no Banco de Dados</h4>
          <p className="text-slate-350 text-xs mt-1 leading-relaxed">
            Para poder salvar as modificações permanentemente em nuvem e sincronizar entre dispositivos, você precisa criar a tabela <strong className="text-slate-200">implementations</strong> no painel SQL do seu console Supabase.
          </p>
          <p className="text-slate-400 text-[10px] mt-1 font-mono">
            (O aplicativo continuará funcionando perfeitamente usando persistência local provisória com LocalStorage!)
          </p>
        </div>
      </div>

      <button
        onClick={handleCopySql}
        className="bg-amber-600/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 transition-all self-end md:self-center whitespace-nowrap"
      >
        {copiedSql ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copiedSql ? 'Copiado!' : 'Copiar SQL de Migração'}</span>
      </button>
    </div>
  );
}
