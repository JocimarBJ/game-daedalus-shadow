import { Player } from "./player";

export const createControls = (
  scene: Phaser.Scene
): Phaser.Types.Input.Keyboard.CursorKeys => {
  return scene.input.keyboard.createCursorKeys();
};
export const configControls = (
  player: Player,
  controls: Phaser.Types.Input.Keyboard.CursorKeys,
  scene: Phaser.Scene
): void => {
  player.setVelocity(0);

  // Movimento horizontal
  if (controls.right.isDown) {
    player.setFlipX(false);
    player.setVelocityX(defaultVelocity);
  }

  if (controls.left.isDown) {
    player.setFlipX(true);
    player.setVelocityX(-defaultVelocity);
  }

  // Movimento vertical
  if (controls.up.isDown) {
    player.setVelocityY(-defaultVelocity);
  }

  if (controls.down.isDown) {
    player.setVelocityY(defaultVelocity);
  }

  // Animação de movimento
  if (
    controls.right.isDown ||
    controls.left.isDown ||
    controls.up.isDown ||
    controls.down.isDown
  ) {
    if (!player.isAttacking) {
      player.anims.play("player_walk", true);
    }
    return;
  }

  // Ataque
  if (controls.space.isDown) {
    if (!player.isAttacking) {
      attack(player);
    }
    return;
  }

  // Idle
  if (!player.isAttacking) {
    player.anims.play("player_idle", true);
  }
};

const defaultVelocity = 100;

const attack = (player: Player): void => {
  player.isAttacking = true;
  player.anims.play("player_attack", true);
};