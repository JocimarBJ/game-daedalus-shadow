import * as Phaser from "phaser";
import { createPlayer, loadSprites } from "./player";
import { createControls, configControls } from "./controls";
import { MapGenerator } from "./map-generator";
import { createMapLayers } from "./map-renderer";

// Habilitar/Desabilitar Dynamic Light
const enableDynamicLighting = true; 
const godMode = String("__GOD_MODE__") === "true"; // Habilitar/Desabilitar God Mode (invencibilidade)
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
  exitZone;

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
    const generatedMap = new MapGenerator(Date.now()).generate(mapWidth, mapHeight);
    const { floor, grass, walls, widthInPixels, heightInPixels } =
      createMapLayers(this, generatedMap);
    this.walls = walls;

    const exitX = Math.floor(mapWidth / 2);
    const exitY = mapHeight - 1;
    const exitPixelX = exitX * 32 + 16;
    const exitPixelY = exitY * 32 + 16;
    this.exitPortal = this.add.graphics();
    this.exitPortalStatic = this.add.rectangle(
      exitPixelX,
      exitPixelY + 38,
      32,
      76,
      0xffffd6,
      0.7
    );
    this.exitPortal.setPosition(exitPixelX, exitPixelY);
    this.exitPortal.setBlendMode(Phaser.BlendModes.ADD);
    this.exitPortalStatic.setBlendMode(Phaser.BlendModes.ADD);

    // Camadas translúcidas criam um portal visível, além da luz dinâmica.
    this.exitPortal.fillStyle(0xffb300, 0.1);
    this.exitPortal.fillEllipse(0, -40, 70, 70); //x,y,largura,altura
    this.exitPortal.fillStyle(0xffc928, 0.2);
    this.exitPortal.fillEllipse(0, -25, 55, 55);
    this.exitPortal.fillStyle(0xffe98a, 0.4);
    this.exitPortal.fillEllipse(0, -10, 40, 40);
    this.exitPortal.postFX.addBlur(2, 2, 5);
    this.physics.add.existing(this.exitPortalStatic, true);
    this.exitZone = this.add.zone(exitPixelX, exitPixelY, 32, 32);
    this.physics.add.existing(this.exitZone, true);

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

    this.physics.world.setBounds(0, 0, widthInPixels, heightInPixels);
    this.cameras.main.setBounds(0, 0, widthInPixels, heightInPixels);
    this.player = createPlayer(this);
    this.player.setDepth(10);
    this.exitPortal.setDepth(20);
    this.exitPortalStatic.setDepth(21);

    // configuracoes de hitbox do player
    this.player.body.setSize(22, 22);
    this.player.body.setOffset(64, 96);
    if(!godMode){
      this.physics.add.collider(this.player, this.walls);
    }
    this.physics.add.collider(this.player, this.exitPortalStatic);
    this.physics.add.overlap(this.player, this.exitZone, () => {
      console.log("Player reached the exit portal!");
      // Aqui você pode adicionar a lógica para avançar para o próximo nível ou encerrar o jogo.
    });
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
  height: 672,
  scale: {
    mode: Phaser.Scale.FIT,
  },
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
