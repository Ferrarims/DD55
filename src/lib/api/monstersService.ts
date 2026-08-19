import { supabase, isSupabaseConfigured } from './supabase';
import { MonsterTemplate } from '../../game/types';
import { MONSTERS_5E_DATA, extractPrimaryAttack, parseSpeedToGridCells } from '../../lib/api/references';
import { updateBestiaryTemplates } from '../../game/bestiaryData';

let cachedMonsters: MonsterTemplate[] = MONSTERS_5E_DATA.map(m => {
  const primaryAtk = extractPrimaryAttack(m);
  const xpValue = m.cr === 0 ? 10 : m.cr === 0.125 ? 25 : m.cr === 0.25 ? 50 : m.cr === 0.5 ? 100 : m.cr === 1 ? 200 : m.cr === 2 ? 450 : m.cr === 3 ? 700 : m.cr === 4 ? 1100 : m.cr === 5 ? 1800 : m.cr === 6 ? 2300 : m.cr === 7 ? 2900 : m.cr === 8 ? 3900 : m.cr === 9 ? 5000 : m.cr === 10 ? 5900 : m.cr === 11 ? 7200 : m.cr === 13 ? 10000 : m.cr === 16 ? 15000 : m.cr === 17 ? 18000 : m.cr === 19 ? 22000 : m.cr === 20 ? 25000 : m.cr === 21 ? 33000 : m.cr === 30 ? 155000 : 50;
  return {
    id: m.id || m.name.toLowerCase().replace(/\s+/g, '_'),
    name: m.name,
    cr: m.cr || 0.25,
    pb: m.pb || 2,
    hp: m.hp || 10,
    armor_class: m.armor_class || m.ac || 10,
    speed: parseSpeedToGridCells(m.speed),
    attackBonus: primaryAtk.attackBonus,
    damageDice: primaryAtk.damageDice,
    range: primaryAtk.range,
    xp: xpValue,
    icon: m.icon || '👹',
    color: m.color || '#ef4444',
    size: m.size,
    biomePreference: m.biomePreference || ['Caverna', 'Masmorra'],
    stats: m.stats || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    senses: m.senses || 'Visão Comum',
    vulnerabilities: m.vulnerabilities || [],
    resistances: m.resistances || [],
    immunities: m.immunities || [],
    condition_immunities: m.condition_immunities || [],
    saves: m.saves || {},
    skills: m.skills || [],
    traits: m.traits || [],
    actions: m.actions || [
      { name: 'Ataque Genérico', to_hit: primaryAtk.attackBonus, damage: primaryAtk.damageDice }
    ],
    bonus_actions: m.bonus_actions || [],
    reactions: m.reactions || [],
    legendary_actions: m.legendary_actions || []
  };
});

let isLoadedFromDb = false;

export async function fetchMonstersFromDb(alreadyTriedSeeding = false): Promise<MonsterTemplate[]> {
  if (!isSupabaseConfigured) {
    // Garante que o módulo de dados ricos de bestiaryData seja sempre atualizado com os monstros locais
    updateBestiaryTemplates(cachedMonsters);
    return cachedMonsters;
  }
  try {
    const { data, error } = await supabase.from('bestiary').select('*');
    if (error) {
      console.warn('Aviso: Não foi possível carregar o bestiário do banco, usando fallback local:', error.message);
      updateBestiaryTemplates(cachedMonsters);
      return cachedMonsters;
    }

    if (data && data.length > 0) {
      const templates: MonsterTemplate[] = data.map((dbMon: any) => {
        // 1. Velocidade (trata se for objeto, string ou número)
        let speedInCells = 6;
        if (dbMon.speed && typeof dbMon.speed === 'object') {
          const walkSpeed = dbMon.speed.walk !== undefined ? dbMon.speed.walk : 30;
          speedInCells = Math.max(1, Math.floor(walkSpeed / 5)); // Ex: 30ft / 5 = 6 células, ou 9m / 1.5 = 6
        } else if (typeof dbMon.speed === 'string') {
          speedInCells = parseSpeedToGridCells(dbMon.speed);
        } else if (typeof dbMon.speed === 'number') {
          speedInCells = dbMon.speed;
        }

        // 2. Ataque Primário (calcula de forma robusta e dinâmica analisando as ações reais)
        const pb = dbMon.pb !== undefined ? Number(dbMon.pb) : 2;
        const str = dbMon.strength !== undefined ? Number(dbMon.strength) : 10;
        const dex = dbMon.dexterity !== undefined ? Number(dbMon.dexterity) : 10;
        const maxMod = Math.floor((Math.max(str, dex) - 10) / 2);
        const defaultBonus = pb + maxMod;
        
        let attackBonus = defaultBonus;
        let damageDice = "1d6+2";
        let range = 1;

        const actionsList = Array.isArray(dbMon.actions) ? dbMon.actions : [];
        if (actionsList.length > 0) {
          const attackAction = actionsList.find((a: any) => 
            a.to_hit !== undefined || 
            a.damage !== undefined || 
            (a.desc && (a.desc.toLowerCase().includes('atingir') || a.desc.toLowerCase().includes('hit') || a.desc.toLowerCase().includes('dano') || a.desc.toLowerCase().includes('damage')))
          ) || actionsList[0];

          if (attackAction) {
            if (attackAction.to_hit !== undefined && attackAction.to_hit !== null) {
              attackBonus = Number(attackAction.to_hit);
            } else if (attackAction.desc) {
              const hitMatch = attackAction.desc.match(/\+([0-9]+)\s*(?:para atingir|to hit|para acertar)/i) || attackAction.desc.match(/\+([0-9]+)/);
              if (hitMatch) {
                attackBonus = parseInt(hitMatch[1], 10);
              }
            }

            if (attackAction.damage) {
              damageDice = attackAction.damage;
            } else if (attackAction.desc) {
              const diceMatch = attackAction.desc.match(/\(([0-9]+d[0-9]+(?:\s*[-+]\s*[0-9]+)?)\)/) || attackAction.desc.match(/([0-9]+d[0-9]+(?:\s*[-+]\s*[0-9]+)?)/);
              if (diceMatch) {
                damageDice = diceMatch[1].replace(/\s+/g, '');
              }
            }

            if (attackAction.reach) {
              range = parseSpeedToGridCells(attackAction.reach);
            } else if (attackAction.range) {
              range = parseSpeedToGridCells(attackAction.range);
            } else if (attackAction.desc) {
              const rangeMatch = attackAction.desc.match(/(?:alcance|reach|alcance de)\s*([0-9]+)\s*(?:ft|m|pés|pes)/i);
              if (rangeMatch) {
                const feet = parseInt(rangeMatch[1], 10);
                range = Math.max(1, Math.floor(feet / 5));
              }
            }
          }
        }

        // 3. Atributos do Monstro (stats)
        const stats = {
          str: dbMon.strength !== undefined ? Number(dbMon.strength) : 10,
          dex: dbMon.dexterity !== undefined ? Number(dbMon.dexterity) : 10,
          con: dbMon.constitution !== undefined ? Number(dbMon.constitution) : 10,
          int: dbMon.intelligence !== undefined ? Number(dbMon.intelligence) : 10,
          wis: dbMon.wisdom !== undefined ? Number(dbMon.wisdom) : 10,
          cha: dbMon.charisma !== undefined ? Number(dbMon.charisma) : 10
        };

        // 4. Testes de Resistência (saves) e Perícias (skills)
        const saves: Record<string, number> = {};
        if (dbMon.saving_throws && typeof dbMon.saving_throws === 'object') {
          Object.entries(dbMon.saving_throws).forEach(([k, v]) => {
            saves[k.toLowerCase()] = Number(v);
          });
        }

        let skillsArray: string[] = [];
        if (Array.isArray(dbMon.skills)) {
          skillsArray = dbMon.skills;
        } else if (dbMon.skills && typeof dbMon.skills === 'object') {
          skillsArray = Object.entries(dbMon.skills).map(([skName, skVal]) => `${skName} +${skVal}`);
        }

        // 5. Resistências, Fraquezas e Imunidades de Dano/Condição
        const vulnerabilities = Array.isArray(dbMon.damage_vulnerabilities) ? dbMon.damage_vulnerabilities : [];
        const resistances = Array.isArray(dbMon.damage_resistances) ? dbMon.damage_resistances : [];
        const immunities = Array.isArray(dbMon.damage_immunities) ? dbMon.damage_immunities : [];
        const condition_immunities = Array.isArray(dbMon.condition_immunities) ? dbMon.condition_immunities : [];

        // 6. Características Especiais e Ações (Mapeia 'desc' do banco para 'text' do app)
        const traits = Array.isArray(dbMon.special_traits)
          ? dbMon.special_traits.map((t: any) => ({ name: t.name, text: t.text || t.desc || '' }))
          : [];

        const actions = Array.isArray(dbMon.actions)
          ? dbMon.actions.map((a: any) => ({ 
              name: a.name, 
              text: a.text || a.desc || '', 
              to_hit: a.to_hit, 
              reach: a.reach, 
              range: a.range, 
              damage: a.damage 
            }))
          : [
              { name: 'Ataque Básico', text: `Ataque Físico. Bônus de +${attackBonus}. Dano de ${damageDice}.`, to_hit: attackBonus, damage: damageDice }
            ];

        const bonus_actions = Array.isArray(dbMon.bonus_actions)
          ? dbMon.bonus_actions.map((a: any) => ({ name: a.name, text: a.text || a.desc || '' }))
          : [];

        const reactions = Array.isArray(dbMon.reactions)
          ? dbMon.reactions.map((a: any) => ({ name: a.name, text: a.text || a.desc || '' }))
          : [];

        const legendary_actions = Array.isArray(dbMon.legendary_actions)
          ? dbMon.legendary_actions.map((a: any) => ({ name: a.name, text: a.text || a.desc || '' }))
          : [];

        // Cor temática baseada no ND (cr)
        const crValue = dbMon.cr !== undefined ? Number(dbMon.cr) : 0.25;
        const color = crValue >= 10 ? '#ef4444' : crValue >= 5 ? '#f43f5e' : crValue >= 2 ? '#fb923c' : crValue >= 1 ? '#fbbf24' : '#a855f7';

        return {
          id: dbMon.id || dbMon.name.toLowerCase().replace(/\s+/g, '_'),
          name: dbMon.name,
          cr: crValue,
          pb,
          hp: dbMon.hp !== undefined ? Number(dbMon.hp) : 10,
          armor_class: dbMon.armor_class !== undefined ? Number(dbMon.armor_class) : 10,
          speed: speedInCells,
          attackBonus,
          damageDice,
          range,
          xp: dbMon.xp !== undefined ? Number(dbMon.xp) : 50,
          icon: dbMon.icon || '👹',
          color,
          size: dbMon.size,
          biomePreference: ['Caverna', 'Masmorra', 'Floresta', 'Montanha', 'Planície', 'Pântano', 'Deserto'], // biomas gerais permitidos por padrão
          stats,
          senses: dbMon.senses || 'Visão Comum',
          vulnerabilities,
          resistances,
          immunities,
          condition_immunities,
          saves,
          skills: skillsArray,
          traits,
          actions,
          bonus_actions,
          reactions,
          legendary_actions
        };
      });

      cachedMonsters = templates;
      isLoadedFromDb = true;
      
      // Atualiza os templates no módulo central bestiaryData
      updateBestiaryTemplates(templates);
      return templates;
    } else {
      console.warn('Aviso: A tabela public.bestiary está vazia no banco de dados.');
      updateBestiaryTemplates(cachedMonsters);
      return cachedMonsters;
    }
  } catch (err) {
    console.warn('Erro ao conectar ao banco de monstros (bestiary):', err);
    updateBestiaryTemplates(cachedMonsters);
    return cachedMonsters;
  }
}
