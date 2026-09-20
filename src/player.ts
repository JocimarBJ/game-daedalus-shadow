export interface Player extends Phaser.Physics.Arcade.Sprite {
  isAttacking?: boolean;
}

export const createPlayer = (scene: Phaser.Scene) => {
  const player = scene.physics.add.sprite(400, 32, "player_idle");
  createAnimations(scene, player);
  return player;
};

export const loadSprites = (scene: Phaser.Scene): void => {
  scene.load.spritesheet("player_idle", "./assets/player/idle.png", {
    frameWidth: 150,
    frameHeight: 150,
    spacing: 0,
  });

  scene.load.spritesheet("player_walk", "./assets/player/walk.png", {
    frameWidth: 150,
    frameHeight: 150,
    spacing: 0,
  });  
};

export const createAnimations = (scene: Phaser.Scene, player: Player): void => {
  scene.anims.create({
    key: "player_idle",
    frames: scene.anims.generateFrameNames("player_idle", {
      start: 0,
      end: 15,
    }),
    frameRate: 15,
    repeat: -1,
    yoyo: true,
  });

  scene.anims.create({
    key: "player_walk",
    frames: scene.anims.generateFrameNames("player_walk", {
      start: 0,
      end: 11,
    }),
    frameRate: 45,
    repeat: -1,
  });


  player.on(
    "animationcomplete",
    (animation: Phaser.Animations.Animation, frame: Phaser.Animations.AnimationFrame) => {
    },
    scene
  );
};
