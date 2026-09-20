export type GeneratedMap = number[][];

export class MapGenerator {
  private readonly random: () => number;

  public constructor(seed: number | string) {
    this.random = this.createRandom(seed);
  }

  public generate(width: number, height: number): GeneratedMap {
    this.validateDimension(width, "width");
    this.validateDimension(height, "height");

    const map = Array.from({ length: height }, () => Array(width).fill(0));
    const entranceX = Math.floor(width / 2);
    const firstCellX = entranceX % 2 === 0 ? entranceX - 1 : entranceX;

    map[1][entranceX] = 1;
    this.carveMaze(map, firstCellX, 1);

    const exitX = Math.floor(width / 2);
    const exitCellX = exitX % 2 === 0 ? exitX - 1 : exitX;
    const exitCellY = height - 2;

    map[exitCellY][exitCellX] = 1;
    if (exitCellX !== exitX) {
      map[exitCellY][exitX] = 1;
    }

    map[0][entranceX] = 2;
    map[height - 1][exitX] = 3;

    return map;
  }

  private carveMaze(map: GeneratedMap, startX: number, startY: number): void {
    const stack: Array<[number, number]> = [[startX, startY]];
    map[startY][startX] = 1;

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = this.getUnvisitedNeighbors(map, current[0], current[1]);

      if (neighbors.length === 0) {
        stack.pop();
        continue;
      }

      const next = neighbors[Math.floor(this.random() * neighbors.length)];
      const middleX = (current[0] + next[0]) / 2;
      const middleY = (current[1] + next[1]) / 2;

      map[middleY][middleX] = 1;
      map[next[1]][next[0]] = 1;
      stack.push(next);
    }
  }

  private getUnvisitedNeighbors(
    map: GeneratedMap,
    x: number,
    y: number
  ): Array<[number, number]> {
    const neighbors: Array<[number, number]> = [];
    const directions: Array<[number, number]> = [
      [0, -2],
      [2, 0],
      [0, 2],
      [-2, 0],
    ];

    for (const [offsetX, offsetY] of directions) {
      const nextX = x + offsetX;
      const nextY = y + offsetY;

      if (
        nextX > 0 &&
        nextX < map[0].length - 1 &&
        nextY > 0 &&
        nextY < map.length - 1 &&
        map[nextY][nextX] === 0
      ) {
        neighbors.push([nextX, nextY]);
      }
    }

    return neighbors;
  }

  private validateDimension(value: number, name: string): void {
    if (!Number.isInteger(value) || value < 5 || value % 2 === 0) {
      throw new Error(`${name} deve ser um inteiro ímpar maior ou igual a 5.`);
    }
  }

  private createRandom(seed: number | string): () => number {
    let state = typeof seed === "number" ? seed : this.hashSeed(seed);
    state = state >>> 0;

    return () => {
      state = (state + 0x6d2b79f5) | 0;
      let result = Math.imul(state ^ (state >>> 15), 1 | state);
      result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  private hashSeed(seed: string): number {
    let hash = 2166136261;

    for (let index = 0; index < seed.length; index += 1) {
      hash ^= seed.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }
}