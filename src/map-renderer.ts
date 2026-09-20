import * as Phaser from "phaser";
import { GeneratedMap } from "./map-generator";

type MapLayers = {
  floor: Phaser.Tilemaps.TilemapLayer;
  grass: Phaser.Tilemaps.TilemapLayer;
  walls: Phaser.Tilemaps.TilemapLayer;
  widthInPixels: number;
  heightInPixels: number;
};

const grassTileByMask = [
  0, 20, 1, 16, 4, 12, 8, 10,
  3, 17, 2, 18, 9, 19, 11, 0,
];

const wallTileByMask = [
  0, 1, 2, 3, 4, 5, 6, 7,
  8, 9, 10, 11, 12, 13, 14, 15,
  16, 17, 18, 19, 20, 21, 22, 23,
  24, 25, 26, 27, 28,
];

export function createMapLayers(
  scene: Phaser.Scene,
  generatedMap: GeneratedMap
): MapLayers {
  const mapHeight = generatedMap.length;
  const mapWidth = generatedMap[0].length;
  const floorData = Array.from({ length: mapHeight }, () =>
    Array(mapWidth).fill(0)
  );
  const grassData = createGrassData(generatedMap, mapWidth, mapHeight);
  const wallData = createWallData(generatedMap, mapWidth, mapHeight);

  const floorMap = scene.make.tilemap({
    data: floorData,
    tileWidth: 32,
    tileHeight: 32,
  });
  const wallMap = scene.make.tilemap({
    data: wallData,
    width: mapWidth,
    height: mapHeight,
    tileWidth: 32,
    tileHeight: 32,
  });
  const grassMap = scene.make.tilemap({
    data: grassData,
    width: mapWidth,
    height: mapHeight,
    tileWidth: 32,
    tileHeight: 32,
  });

  const tilesetFloor = floorMap.addTilesetImage("floors", "chaos", 32, 32);
  if (!tilesetFloor) {
    throw new Error("Não foi possível carregar um dos tilesets do chão.");
  }
  const floor = floorMap.createLayer(0, tilesetFloor, 0, 0);
  if (!floor) {
    throw new Error("Não foi possível criar a camada do chão.");
  }

  const tilesetGrass = grassMap.addTilesetImage("grass", "gramas", 32, 32);
  if (!tilesetGrass) {
    throw new Error("Não foi possível carregar o tileset da grama.");
  }
  const grass = grassMap.createLayer(0, tilesetGrass, 0, 0);
  if (!grass) {
    throw new Error("Não foi possível criar a camada da grama.");
  }

  const tilesetWalls = wallMap.addTilesetImage("walls", "paredes", 32, 32);
  if (!tilesetWalls) {
    throw new Error("Não foi possível carregar um dos tilesets do muro.");
  }
  const walls = wallMap.createLayer(0, tilesetWalls, 0, 0);
  if (!walls) {
    throw new Error("Não foi possível criar a camada dos muros.");
  }

  walls.setCollisionBetween(0, 35);

  return {
    floor,
    grass,
    walls,
    widthInPixels: wallMap.widthInPixels,
    heightInPixels: wallMap.heightInPixels,
  };
}

function createGrassData(
  generatedMap: GeneratedMap,
  mapWidth: number,
  mapHeight: number
): number[][] {
  return generatedMap.map((row, y) =>
    row.map((cell, x) => {
      if (cell === 0) {
        return -1;
      }

      let mask = 0;
      if (y > 0 && generatedMap[y - 1][x] !== 0) mask |= 1;
      if (x < mapWidth - 1 && generatedMap[y][x + 1] !== 0) mask |= 2;
      if (y < mapHeight - 1 && generatedMap[y + 1][x] !== 0) mask |= 4;
      if (x > 0 && generatedMap[y][x - 1] !== 0) mask |= 8;

      return grassTileByMask[mask];
    })
  );
}

function createWallData(
  generatedMap: GeneratedMap,
  mapWidth: number,
  mapHeight: number
): number[][] {
  return generatedMap.map((row, y) =>
    row.map((cell, x) => {
      if (cell !== 0) {
        return -1;
      }

      const hasWallAbove = y > 0 && generatedMap[y - 1][x] === 0;
      const hasWallRight = x < mapWidth - 1 && generatedMap[y][x + 1] === 0;
      const hasWallBelow =
        y < mapHeight - 1 && generatedMap[y + 1][x] === 0;
      const hasWallLeft = x > 0 && generatedMap[y][x - 1] === 0;

      if (x === 0 && y === 0) return wallTileByMask[27];
      if (x === mapWidth - 1 && y === 0) return wallTileByMask[28];
      if (x === 0 && y === mapHeight - 1) return wallTileByMask[26];
      if (x === mapWidth - 1 && y === mapHeight - 1) return wallTileByMask[25];

      if (x === 0) {
        return hasWallAbove && hasWallBelow && hasWallRight
          ? wallTileByMask[5]
          : wallTileByMask[1];
      }
      if (y === 0) {
        return hasWallLeft && hasWallRight && hasWallBelow
          ? wallTileByMask[11]
          : wallTileByMask[8];
      }
      if (x === mapWidth - 1) {
        return hasWallAbove && hasWallBelow && hasWallLeft
          ? wallTileByMask[6]
          : wallTileByMask[2];
      }
      if (y === mapHeight - 1) {
        return hasWallLeft && hasWallRight && hasWallAbove
          ? wallTileByMask[14]
          : wallTileByMask[9];
      }

      let tile = wallTileByMask[0];
      if (hasWallAbove) {
        tile = wallTileByMask[18];
        if (hasWallRight) {
          tile = hasWallBelow ? wallTileByMask[3] : wallTileByMask[22];
          if (hasWallLeft) {
            tile = hasWallBelow ? wallTileByMask[20] : wallTileByMask[13];
          }
        } else if (hasWallBelow) {
          tile = hasWallLeft ? wallTileByMask[4] : wallTileByMask[0];
        } else if (hasWallLeft) {
          tile = wallTileByMask[21];
        }
      } else if (hasWallRight) {
        tile = hasWallBelow ? wallTileByMask[23] : wallTileByMask[17];
        if (hasWallLeft) {
          tile = hasWallBelow ? wallTileByMask[10] : wallTileByMask[7];
        }
      } else if (hasWallBelow) {
        tile = hasWallLeft ? wallTileByMask[24] : wallTileByMask[19];
      } else if (hasWallLeft) {
        tile = wallTileByMask[16];
      }

      return tile;
    })
  );
}
