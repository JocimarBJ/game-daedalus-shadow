import * as Phaser from "phaser";
import { createPlayer, loadSprites } from "./player";
import { createControls, configControls } from "./controls";

export default class Demo extends Phaser.Scene {
  player;
  walls;
  controls;
  playerLight;

  constructor() {
    super("demo");
  }

  preload() {
    this.load.image("gramas", "./assets/map/grass2.png");
    this.load.image("paredes", "./assets/map/walls.png");
    this.load.image("chaos", "./assets/map/floors.png");
    this.load.tilemapTiledJSON("map", "./assets/map/map.json");
    loadSprites(this);
  }

  create() {
    const map = this.make.tilemap({ key: "map" });

    const tilesetFloor = map.addTilesetImage("floors", "chaos");
    if (!tilesetFloor) {
      throw new Error("Não foi possível carregar um dos tilesets do chão.");
    }
    const floor = map.createLayer("floors", tilesetFloor, 0, 0);

    const tilesetGrass = map.addTilesetImage("grass", "gramas");
    if (!tilesetGrass) {
      throw new Error("Não foi possível carregar um dos tilesets da grama.");
    }
    const grass = map.createLayer("grass", tilesetGrass, 0, 0);

    const tilesetWalls = map.addTilesetImage("walls","paredes");
    if (!tilesetWalls) {
      throw new Error("Não foi possível carregar um dos tilesets do muro.");
    }
    this.walls = map.createLayer("walls", tilesetWalls, 0, 0);
    this.walls.setCollisionByProperty({ collider: false });
    this.walls.setCollisionBetween(1, 36);

    this.lights.enable();
    this.lights.setAmbientColor(0x000000);
    

    this.player = createPlayer(this);

    // configuracoes de hitbox do player
    this.player.body.setSize(22, 22);
    this.player.body.setOffset(64, 96);
    this.physics.add.collider(this.player, this.walls);

    this.player.anims.play("player_idle", true);
    this.controls = createControls(this);
  
    // Configuracoes de luz no player e do ambiente
    // Ativar e desativar descomentando.
    // floor.setPipeline("Light2D");
    // grass.setPipeline("Light2D");
    // this.walls.setPipeline("Light2D");
    // this.lights.enable();
    // this.lights.setAmbientColor(0x000000);
    // this.player.setPipeline("Light2D");
    // this.playerLight = this.lights.addLight(
    //   this.player.x,
    //   this.player.y - 20,
    //   100,
    //   0x5cc4bc,
    //   1.3
    // );
  }
  
  update() {
    configControls(this.player, this.controls, this);
    
    // atualizar luz do player (acompanhar ele)
    //this.playerLight.setPosition(this.player.x, this.player.y - 20);
  }

  
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#125555",
  width: 800,
  height: 640,
  scene: Demo,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
};

const game = new Phaser.Game(config);
