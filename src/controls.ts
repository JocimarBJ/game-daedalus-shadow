import { Player } from "./player";

export interface GameControls {
  left: Phaser.Input.Keyboard.Key;
  right: Phaser.Input.Keyboard.Key;
  up: Phaser.Input.Keyboard.Key;
  down: Phaser.Input.Keyboard.Key;
  a: Phaser.Input.Keyboard.Key;
  d: Phaser.Input.Keyboard.Key;
  w: Phaser.Input.Keyboard.Key;
  s: Phaser.Input.Keyboard.Key;
}

export const createControls = (
  scene: Phaser.Scene
): GameControls => {
  const cursorKeys = scene.input.keyboard.createCursorKeys();
  const wasdKeys = scene.input.keyboard.addKeys("W,A,S,D") as {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  return {
    ...cursorKeys,
    w: wasdKeys.W,
    a: wasdKeys.A,
    s: wasdKeys.S,
    d: wasdKeys.D,
  };
};
export const configControls = (
  player: Player,
  controls: GameControls,
  scene: Phaser.Scene
): void => {
  player.setVelocity(0);

  // Movimento horizontal
  if (controls.right.isDown || controls.d.isDown) {
    player.setFlipX(false);
    player.setVelocityX(defaultVelocity);
  }

  if (controls.left.isDown || controls.a.isDown) {
    player.setFlipX(true);
    player.setVelocityX(-defaultVelocity);
  }

  // Movimento vertical
  if (controls.up.isDown || controls.w.isDown) {
    player.setVelocityY(-defaultVelocity);
  }

  if (controls.down.isDown || controls.s.isDown) {
    player.setVelocityY(defaultVelocity);
  }

  // Animação de movimento
  if (
    controls.right.isDown ||
    controls.left.isDown ||
    controls.up.isDown ||
    controls.down.isDown ||
    controls.w.isDown ||
    controls.a.isDown ||
    controls.s.isDown ||
    controls.d.isDown
  ) {
    player.anims.play("player_walk", true);
    return;
  }

  // Idle
  player.anims.play("player_idle", true);
};

const defaultVelocity = 100;