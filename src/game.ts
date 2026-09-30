import * as Phaser from "phaser";
import { createPlayer, loadSprites } from "./player";
import { createControls, configControls, GameControls } from "./controls";
import { MapGenerator } from "./map-generator";
import { createMapLayers } from "./map-renderer";
import { LoginScene } from "./scenes/login-scene";
import { RegisterScene } from "./scenes/register-scene";
import { EmailVerificationScene } from "./scenes/email-verification-scene";
import { MainMenuScene } from "./scenes/main-menu-scene";
import { StageSelectScene } from "./scenes/stage-select-scene";
import { PauseScene } from "./scenes/pause-scene";
import { VictoryScene } from "./scenes/victory-scene";

const enableDynamicLighting = true;
const godMode = String("__GOD_MODE__") === "true";
const PulseLightDurationPortal = 1000;

export default class Demo extends Phaser.Scene {
  player: any;
  walls: any;
  gate: any;
  controls: any;
  playerLight: any;
  exitLight: any;
  exitPortal: any;
  exitPortalStatic: any;
  exitZone: any;
  escKey?: Phaser.Input.Keyboard.Key;
  startTime: number = 0;
  stageId: number = 1;

  constructor() {
    super("demo");
  }

  init(data: { stageId?: number }) {
    this.stageId = data?.stageId || 1;
  }

  preload() {
    this.load.image("paredes", "./assets/map/walls.png");
    this.load.image("chaos", "./assets/map/floors.png");
    this.load.image("gramas", "./assets/map/grass.png");
    this.load.image("gate", "./assets/map/gate.png");
    loadSprites(this);
  }

  create() {
    this.startTime = Date.now();
    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    const mapWidth = 43;
    const mapHeight = 29;
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

    this.exitPortal.fillStyle(0xffb300, 0.1);
    this.exitPortal.fillEllipse(0, -40, 70, 70);
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
      exitPixelY - 20,
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
    this.player = createPlayer(this, entranceX * 32 + 16, 64);
    this.player.setDepth(10);
    this.exitPortal.setDepth(20);
    this.exitPortalStatic.setDepth(21);

    this.player.body.setSize(22, 22);
    this.player.body.setOffset(64, 96);
    if (!godMode) {
      this.physics.add.collider(this.player, this.walls);
    }
    this.physics.add.collider(this.player, this.exitPortalStatic);
    this.physics.add.overlap(this.player, this.exitZone, () => {
      const elapsedSecs = Math.floor((Date.now() - this.startTime) / 1000);
      this.scene.start("VictoryScene", {
        timeElapsed: elapsedSecs,
        stageId: this.stageId,
      });
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
    if (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) {
      this.scene.launch("PauseScene");
      this.scene.pause();
      return;
    }

    configControls(this.player, this.controls as GameControls, this);

    if (this.playerLight) {
      this.playerLight.setPosition(this.player.x, this.player.y - 20);
    }
  }
}

const sceneMap: Record<string, any> = {
  login: LoginScene,
  register: RegisterScene,
  email: EmailVerificationScene,
  menu: MainMenuScene,
  stages: StageSelectScene,
  demo: Demo,
  pause: PauseScene,
  victory: VictoryScene,
};

const urlParam = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("scene") : null;

if (typeof window !== "undefined" && urlParam && urlParam !== "login" && urlParam !== "register") {
  if (!localStorage.getItem("daedalus_session")) {
    localStorage.setItem(
      "daedalus_session",
      JSON.stringify({
        id: "user-1",
        username: "Teseu",
        email: "teseu@labirinto.com",
        createdAt: "2026-09-27T00:00:00.000Z",
        isVerified: true,
      })
    );
  }
}

const selectedInitialScene = urlParam && sceneMap[urlParam] ? sceneMap[urlParam] : LoginScene;

const allScenes = [
  LoginScene,
  RegisterScene,
  EmailVerificationScene,
  MainMenuScene,
  StageSelectScene,
  Demo,
  PauseScene,
  VictoryScene,
];

const scenes = [
  selectedInitialScene,
  ...allScenes.filter((s) => s !== selectedInitialScene),
];

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#07090d",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  dom: {
    createContainer: true,
  },
  fps: {
    target: 60,
    forceSetTimeOut: true,
  },
  scene: scenes,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
};

new Phaser.Game(config);
