import { Biome, WorldSeed } from './types';
import { sampleNoise2D, sampleFractalNoise2D } from './noise';
import { hashCoordinates } from './seed';

export interface BiomeCellData {
  readonly biome: Biome;
  readonly terrain: string;
  readonly blocksMovement: boolean;
  readonly difficultTerrain: boolean;
  readonly obstacle?: string;
  readonly elevation: number;
}

/**
 * Escalas macro para garantir regiões extensas de biomas contínuos (escala de 250 a 400 tiles = vários chunks).
 */
const BIOME_MACRO_SCALE = 320;

/**
 * Determina o bioma de forma contínua e determinística para qualquer coordenada global (worldX, worldY).
 */
export function getBiomeAtWorldPosition(
  seed: WorldSeed,
  worldX: number,
  worldY: number
): Biome {
  // Amostragem de temperatura e umidade em grande escala
  const temperature = sampleNoise2D(seed, worldX, worldY, BIOME_MACRO_SCALE, 101);
  const moisture = sampleNoise2D(seed, worldX, worldY, BIOME_MACRO_SCALE, 202);
  const dungeonFactor = sampleFractalNoise2D(seed, worldX, worldY, 2, 0.5, 200, 303);

  // Áreas de masmorra antigas (bolsões especiais de civilização perdida)
  if (dungeonFactor > 0.76) {
    return 'Masmorra';
  }

  // Zonas de caverna rochosas / frias
  if (temperature < 0.26) {
    return 'Caverna';
  }

  // Zonas áridas e quentes -> Deserto
  if (moisture < 0.32 && temperature > 0.44) {
    return 'Deserto';
  }

  // Zonas de alta umidade -> Pântano
  if (moisture > 0.65) {
    return 'Pântano';
  }

  // Zona padrão equilibrada -> Floresta
  return 'Floresta';
}

/**
 * Gera os dados de terreno, relevo e obstáculos determinísticos de uma célula a partir das coordenadas globais.
 */
export function generateCellData(
  seed: WorldSeed,
  worldX: number,
  worldY: number
): BiomeCellData {
  const biome = getBiomeAtWorldPosition(seed, worldX, worldY);
  const elevationRaw = sampleFractalNoise2D(seed, worldX, worldY, 3, 0.5, 80, 404);
  const elevation = Math.round(elevationRaw * 100) / 100;

  // Ruído fino para variação local de terreno e posicionamento de obstáculos
  const detailHash = hashCoordinates(seed, worldX, worldY, 505);
  const detailVal = (detailHash >>> 0) / 4294967295;

  const obstacleHash = hashCoordinates(seed, worldX, worldY, 606);
  const obstacleVal = (obstacleHash >>> 0) / 4294967295;

  switch (biome) {
    case 'Caverna': {
      // 12% obstáculos intransponíveis, 12% terreno difícil
      if (obstacleVal < 0.12) {
        const obsChoice = obstacleVal < 0.05 ? 'rocha_solida' : obstacleVal < 0.09 ? 'estalagmite' : 'parede_natural';
        return {
          biome,
          terrain: 'chao_pedra',
          blocksMovement: true,
          difficultTerrain: false,
          obstacle: obsChoice,
          elevation,
        };
      } else if (obstacleVal < 0.24) {
        return {
          biome,
          terrain: 'cascalho_instavel',
          blocksMovement: false,
          difficultTerrain: true,
          obstacle: 'cascalho_pedregoso',
          elevation,
        };
      }
      return {
        biome,
        terrain: detailVal > 0.5 ? 'chao_pedra' : 'piso_rochoso',
        blocksMovement: false,
        difficultTerrain: false,
        elevation,
      };
    }

    case 'Floresta': {
      // 10% árvores/troncos, 12% arbustos densos (terreno difícil)
      if (obstacleVal < 0.10) {
        const obsChoice = obstacleVal < 0.06 ? 'arvore_ancestral' : obstacleVal < 0.08 ? 'tronco_caido' : 'pedra_musgosa';
        return {
          biome,
          terrain: 'relva_florestal',
          blocksMovement: true,
          difficultTerrain: false,
          obstacle: obsChoice,
          elevation,
        };
      } else if (obstacleVal < 0.22) {
        return {
          biome,
          terrain: 'arbusto_denso',
          blocksMovement: false,
          difficultTerrain: true,
          obstacle: 'raizes_expostas',
          elevation,
        };
      }
      return {
        biome,
        terrain: detailVal > 0.5 ? 'relva_florestal' : 'clareira_musgo',
        blocksMovement: false,
        difficultTerrain: false,
        elevation,
      };
    }

    case 'Masmorra': {
      // 10% colunas/paredes, 10% escombros
      if (obstacleVal < 0.10) {
        const obsChoice = obstacleVal < 0.05 ? 'coluna_pedra' : obstacleVal < 0.08 ? 'parede_alvenaria' : 'sarcofago_antigo';
        return {
          biome,
          terrain: 'lajes_antigas',
          blocksMovement: true,
          difficultTerrain: false,
          obstacle: obsChoice,
          elevation,
        };
      } else if (obstacleVal < 0.20) {
        return {
          biome,
          terrain: 'escombros_desabados',
          blocksMovement: false,
          difficultTerrain: true,
          obstacle: 'piso_rachado',
          elevation,
        };
      }
      return {
        biome,
        terrain: detailVal > 0.5 ? 'lajes_antigas' : 'piso_pedra_polida',
        blocksMovement: false,
        difficultTerrain: false,
        elevation,
      };
    }

    case 'Pântano': {
      // 10% árvores retorcidas, 15% lama profunda
      if (obstacleVal < 0.10) {
        const obsChoice = obstacleVal < 0.06 ? 'salgueiro_retorcido' : 'tronco_apodrecido';
        return {
          biome,
          terrain: 'lama_turfa',
          blocksMovement: true,
          difficultTerrain: false,
          obstacle: obsChoice,
          elevation,
        };
      } else if (obstacleVal < 0.25) {
        return {
          biome,
          terrain: 'lama_profunda',
          blocksMovement: false,
          difficultTerrain: true,
          obstacle: 'lodo_viscoso',
          elevation,
        };
      }
      return {
        biome,
        terrain: detailVal > 0.5 ? 'lama_turfa' : 'agua_rasa',
        blocksMovement: false,
        difficultTerrain: false,
        elevation,
      };
    }

    case 'Deserto': {
      // 8% cactos/rochas, 14% dunas movediças (terreno difícil)
      if (obstacleVal < 0.08) {
        const obsChoice = obstacleVal < 0.04 ? 'cacto_gigante' : 'pedra_arenitica';
        return {
          biome,
          terrain: 'areia_densa',
          blocksMovement: true,
          difficultTerrain: false,
          obstacle: obsChoice,
          elevation,
        };
      } else if (obstacleVal < 0.22) {
        return {
          biome,
          terrain: 'duna_movedica',
          blocksMovement: false,
          difficultTerrain: true,
          obstacle: 'areia_fofa',
          elevation,
        };
      }
      return {
        biome,
        terrain: detailVal > 0.5 ? 'areia_densa' : 'leito_arenoso',
        blocksMovement: false,
        difficultTerrain: false,
        elevation,
      };
    }
  }
}
