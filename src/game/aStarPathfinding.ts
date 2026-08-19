import { CellData, GridPosition } from './types';

interface PathNode {
  x: number;
  y: number;
  g: number; // Custo do início até aqui
  h: number; // Estimativa (Heurística Manhattan) até o destino
  f: number; // g + h
  parent: PathNode | null;
}

export function findPathAStar(
  grid: CellData[][],
  start: GridPosition,
  target: GridPosition,
  occupiedPositions: GridPosition[] = [],
  isFlying: boolean = false,
  size: number = 1
): GridPosition[] {
  const rows = grid.length;
  if (rows === 0) return [];
  const cols = grid[0].length;

  // Função para verificar se posição está dentro dos limites e não é parede
  const isWalkable = (x: number, y: number): boolean => {
    for (let dx = 0; dx < size; dx++) {
      for (let dy = 0; dy < size; dy++) {
        const cx = x + dx;
        const cy = y + dy;
        if (cx < 0 || cx >= cols || cy < 0 || cy >= rows) return false;
        const cell = grid[cy][cx];
        if (cell.terrain === 'wall' && !isFlying) return false;
        if (cell.movementCost === Infinity && !isFlying) return false;

        // Se a posição estiver ocupada por outra entidade (que não seja o target final), evita passar por cima (a menos que esteja voando)
        // O target final pode ser maior que 1x1, então verificamos se (cx, cy) coincide com qualquer parte do alvo
        const isTargetCell = cx >= target.x && cx < target.x + size && cy >= target.y && cy < target.y + size;
        if (!isTargetCell && !isFlying) {
          const isOccupied = occupiedPositions.some(pos => pos.x === cx && pos.y === cy);
          if (isOccupied) return false;
        }
      }
    }
    return true;
  };

  const openList: PathNode[] = [];
  const closedSet = new Set<string>();

  const initialH = Math.max(Math.abs(start.x - target.x), Math.abs(start.y - target.y));
  const startNode: PathNode = {
    x: start.x,
    y: start.y,
    g: 0,
    h: initialH,
    f: initialH,
    parent: null
  };

  openList.push(startNode);

  while (openList.length > 0) {
    // Pega o nó com o menor 'f'
    openList.sort((a, b) => a.f - b.f);
    const current = openList.shift()!;

    if (current.x === target.x && current.y === target.y) {
      // Reconstrói o caminho de trás para frente
      const path: GridPosition[] = [];
      let curr: PathNode | null = current;
      while (curr !== null) {
        path.unshift({ x: curr.x, y: curr.y });
        curr = curr.parent;
      }
      return path; // Inclui o nó inicial e final
    }

    const key = `${current.x},${current.y}`;
    closedSet.add(key);

    // Direções cardinais (Cima, Baixo, Esquerda, Direita) + Diagonais
    const neighbors = [
      { x: current.x, y: current.y - 1 },
      { x: current.x, y: current.y + 1 },
      { x: current.x - 1, y: current.y },
      { x: current.x + 1, y: current.y },
      { x: current.x - 1, y: current.y - 1 },
      { x: current.x + 1, y: current.y - 1 },
      { x: current.x - 1, y: current.y + 1 },
      { x: current.x + 1, y: current.y + 1 }
    ];

    for (const neighbor of neighbors) {
      if (!isWalkable(neighbor.x, neighbor.y)) continue;

      const neighborKey = `${neighbor.x},${neighbor.y}`;
      if (closedSet.has(neighborKey)) continue;

      // Custo de movimento do terreno (1 para normal, 2 para terreno difícil)
      // Voadores ignoram terreno difícil e paredes
      const moveCost = isFlying ? 1 : grid[neighbor.y][neighbor.x].movementCost;
      const gScore = current.g + moveCost;

      let existingNode = openList.find(n => n.x === neighbor.x && n.y === neighbor.y);

      if (!existingNode) {
        const hScore = Math.max(Math.abs(neighbor.x - target.x), Math.abs(neighbor.y - target.y));
        const newNode: PathNode = {
          x: neighbor.x,
          y: neighbor.y,
          g: gScore,
          h: hScore,
          f: gScore + hScore,
          parent: current
        };
        openList.push(newNode);
      } else if (gScore < existingNode.g) {
        existingNode.g = gScore;
        existingNode.f = gScore + existingNode.h;
        existingNode.parent = current;
      }
    }
  }

  return []; // Sem caminho possível
}
