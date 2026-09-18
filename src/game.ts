import * as Phaser from "phaser";
import { createPlayer, loadSprites } from "./player";
import { createControls, configControls } from "./controls";
import { MapGenerator } from "./map-generator";

// Habilitar/Desabilitar Dynamic Light
const enableDynamicLighting = true; 
const godMode = true; // Habilitar/Desabilitar God Mode (invencibilidade)
const PulseLightDurationPortal = 1000;

export default class Demo extends Phaser.Scene {
  player;
  walls;
  gate;
  controls;
  playerLight;
  exitLight;
  exitPortal;
  exitPortalStatic;

  constructor() {
    super("demo");
  }

  preload() {
    this.load.image("paredes", "./assets/map/walls.png");
    this.load.image("chaos", "./assets/map/floors.png");
    this.load.image("gramas", "./assets/map/grass.png");
    this.load.image("gate", "./assets/map/gate.png");
    loadSprites(this);
  }

  create() {
    const mapWidth = 25;
    const mapHeight = 21;
    const generatedMap = new MapGenerator(Date.now()).generate(
      mapWidth,
      mapHeight
    );
    const floorData = Array.from({ length: mapHeight }, () =>
      Array(mapWidth).fill(0)
    );
    // IDs do atlas grass.png por conexao com outras celulas de grama.
    // Os bits representam vizinhos: 1 cima, 2 direita, 4 baixo e 8 esquerda.
    const grassTileByMask = [
      0,  // 0: sem vizinhos
      20, // 1: somente cima
      1,  // 2: somente direita
      16, // 3: cima e direita
      4,  // 4: somente baixo
      12, // 5: cima e baixo
      8,  // 6: direita e baixo
      10, // 7: cima, direita e baixo
      3,  // 8: somente esquerda
      17, // 9: cima e esquerda
      2,  // 10: esquerda e direita
      18, // 11: cima, esquerda e direita
      9,  // 12: baixo e esquerda
      19, // 13: cima, baixo e esquerda
      11, // 14: direita, baixo e esquerda
      0,  // 15: todos os lados
    ];
    const grassData = generatedMap.map((row, y) =>
      row.map((cell, x) => {
        if (cell === 0) {
          return -1;
        }

        let mask = 0;
        if (y > 0 && generatedMap[y - 1][x] !== 0) {
          mask |= 1;
        }
        if (x < mapWidth - 1 && generatedMap[y][x + 1] !== 0) {
          mask |= 2;
        }
        if (y < mapHeight - 1 && generatedMap[y + 1][x] !== 0) {
          mask |= 4;
        }
        if (x > 0 && generatedMap[y][x - 1] !== 0) {
          mask |= 8;
        }

        return grassTileByMask[mask];
      })
    );

    const wallTileByMask = [
      0, //: aresta reta cima/baixo no meio
      1, //: aresta reta cima/baixo colado na esquerda
      2, //:aresta reta cima/baixo colada na direita
      3, //: aresta T cima/baixo/direita
      4, //: aresta T cima/baixo/esquerda
      5, //: aresta T cima/baixo/direita colada no canto esquerdo
      6, //: aresta T cima/baixo/esquerda colada no canto direito
      7, //: aresta reta esquerda/direita no meio
      8, //: aresta reta esquerda/direita colado em cima
      9, //: aresta reta esquerda/direita colado em baixo
      10, //: aresta T esquerda/direita/baixo
      11, //: aresta T esquerda/direita/baixo colado em cima
      12, //: aresta reta esquerda/direita colado em baixo
      13, //: aresta T esquerda/direita/cima
      14, //: aresta T esquerda/direita/cima colado em baixo
      15, //: aresta reta colada em cima - errado
      16, //: aresta final esquerda
      17, //: aresta final direita
      18, //: aresta final cima
      19, //: aresta final baixo
      20, //: aresta X esquerda/direita/cima/baixo
      21, //: corner meio esquerda/cima
      22, //: corner meio cima/direita
      23, //: corner meio direita/baixo
      24, //: corner meio baixo/esquerda
      25, //: corner canto esquerda/cima
      26, //: corner canto cima/direita
      27, //: corner canto direita/baixo
      28, //: corner canto baixo/esquerda
    ];
    const wallData = generatedMap.map((row, y) =>
      row.map((cell, x) => {
        if (cell !== 0) {
          return -1;
        }

        const hasWallAbove = y > 0 && generatedMap[y - 1][x] === 0;
        const hasWallRight = x < mapWidth - 1 && generatedMap[y][x + 1] === 0;
        const hasWallBelow =
          y < mapHeight - 1 && generatedMap[y + 1][x] === 0;
        const hasWallLeft = x > 0 && generatedMap[y][x - 1] === 0;

        // cantos do muro externo
        if (x === 0 && y === 0) {
          return wallTileByMask[27];
        }
        if (x === mapWidth - 1 && y === 0) {
          return wallTileByMask[28];
        }
        if (x === 0 && y === mapHeight - 1) {
          return wallTileByMask[26];
        }
        if (x === mapWidth - 1 && y === mapHeight - 1) {
          return wallTileByMask[25];
        }

        // os T do muro externo
        if (x === 0) {
          return hasWallAbove && hasWallBelow && hasWallRight ? wallTileByMask[5] : wallTileByMask[1];
        }
        if (y === 0) {
          return hasWallLeft && hasWallRight && hasWallBelow ? wallTileByMask[11] : wallTileByMask[8];
        }
        if (x === mapWidth - 1) {
          return hasWallAbove && hasWallBelow && hasWallLeft ? wallTileByMask[6] : wallTileByMask[2];
        }
        if (y === mapHeight - 1) {
          return hasWallLeft && hasWallRight && hasWallAbove ? wallTileByMask[14] : wallTileByMask[9];
        }

        let mask = wallTileByMask[0];

        if (hasWallAbove) {
          mask = wallTileByMask[18];

          if (hasWallRight) {
            mask = hasWallBelow
              ? wallTileByMask[3]
              : wallTileByMask[22];

            if (hasWallLeft) {
              mask = hasWallBelow
                ? wallTileByMask[20]
                : wallTileByMask[13];
            }
          } else if (hasWallBelow) {
            mask = hasWallLeft
              ? wallTileByMask[4]
              : wallTileByMask[0];
          } else if (hasWallLeft) {
            mask = wallTileByMask[21];
          }
        } else if (hasWallRight) {
          mask = hasWallBelow
            ? wallTileByMask[23]
            : wallTileByMask[17];

          if (hasWallLeft) {
            mask = hasWallBelow
              ? wallTileByMask[10]
              : wallTileByMask[7];
          }
        } else if (hasWallBelow) {
          mask = hasWallLeft
            ? wallTileByMask[24]
            : wallTileByMask[19];
        } else if (hasWallLeft) {
          mask = wallTileByMask[16];
        }

        return mask;
      })
    );
    const floorMap = this.make.tilemap({
      data: floorData,
      tileWidth: 32,
      tileHeight: 32,
    });
    const wallMap = this.make.tilemap({
      data: wallData,
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

    const grassMap = this.make.tilemap({
      data: grassData,
      width: mapWidth,
      height: mapHeight,
      tileWidth: 32,
      tileHeight: 32,
    });
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
    this.walls = wallMap.createLayer(0, tilesetWalls, 0, 0);
    if (!this.walls) {
      throw new Error("Não foi possível criar a camada dos muros.");
    }
    
    this.walls.setCollisionBetween(0, 35);

    const exitX = Math.floor(mapWidth / 2);
    const exitY = mapHeight - 1;
    const exitPixelX = exitX * 32 + 16;
    const exitPixelY = exitY * 32 + 16;
    this.exitPortal = this.add.graphics();
    this.exitPortalStatic = this.add.graphics();
    this.exitPortal.setPosition(exitPixelX, exitPixelY);
    this.exitPortal.setBlendMode(Phaser.BlendModes.ADD);
    this.exitPortalStatic.setPosition(exitPixelX, exitPixelY);
    this.exitPortalStatic.setBlendMode(Phaser.BlendModes.ADD);

    // Camadas translúcidas criam um portal visível, além da luz dinâmica.
    this.exitPortal.fillStyle(0xffb300, 0.1);
    this.exitPortal.fillEllipse(0, -40, 70, 70); //x,y,largura,altura
    this.exitPortal.fillStyle(0xffc928, 0.2);
    this.exitPortal.fillEllipse(0, -25, 55, 55);
    this.exitPortal.fillStyle(0xffe98a, 0.4);
    this.exitPortal.fillEllipse(0, -10, 40, 40);
    this.exitPortal.postFX.addBlur(2, 2, 5);
    this.exitPortalStatic.fillStyle(0xffffd6, 0.7);
    this.exitPortalStatic.fillRect(-16, 0, 32, 76);

    this.tweens.add({
      targets: this.exitPortal,
      alpha: { from: 0.72, to: 1 },
      scaleX: { from: 0.92, to: 1.08 },
      scaleY: { from: 0.96, to: 1.04 },
      duration: PulseLightDurationPortal,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    this.exitLight = this.lights.addLight(
      exitPixelX,
      exitPixelY-20,
      60,
      0xffd27a,
      2.2
    );
    this.tweens.add({
      targets: this.exitLight,
      radius: 90,
      intensity: 2.8,
      duration: PulseLightDurationPortal,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });

    const entranceX = Math.floor(mapWidth / 2);
    this.gate = this.physics.add.staticImage(
      entranceX * 32 + 16,
      16,
      "gate"
    );

    this.physics.world.setBounds(0, 0, wallMap.widthInPixels, wallMap.heightInPixels);
    this.cameras.main.setBounds(0, 0, wallMap.widthInPixels, wallMap.heightInPixels);
    this.player = createPlayer(this);

    // configuracoes de hitbox do player
    this.player.body.setSize(22, 22);
    this.player.body.setOffset(64, 96);
    if(!godMode){
      this.physics.add.collider(this.player, this.walls);
    }
    this.physics.add.collider(this.player, this.gate);
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setRoundPixels(true);

    this.player.anims.play("player_idle", true);
    this.controls = createControls(this);
  
    if (enableDynamicLighting) {
      this.lights.enable();
      this.lights.setAmbientColor(0x000000);
      floor.setPipeline("Light2D");
      grass.setPipeline("Light2D");
      this.walls.setPipeline("Light2D");
      this.player.setPipeline("Light2D");
      this.gate.setPipeline("Light2D");
      this.playerLight = this.lights.addLight(
        this.player.x,
        this.player.y - 20,
        90,
        0x5cc4bc,
        1.7
      );
    }
  }
  
  update() {
    configControls(this.player, this.controls, this);
    
    if (this.playerLight) {
      this.playerLight.setPosition(this.player.x, this.player.y - 20);
    }
  }

  
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#125555",
  width: 800,
  height: 640,
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  scene: Demo,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
};

const game = new Phaser.Game(config);
