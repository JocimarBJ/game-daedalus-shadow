import * as Phaser from "phaser";

export function centerDomOnResize(
  scene: Phaser.Scene,
  element: Phaser.GameObjects.DOMElement
): void {
  const reposition = (gameSize: Phaser.Structs.Size): void => {
    element.setPosition(gameSize.width / 2, gameSize.height / 2);
  };

  scene.scale.on(Phaser.Scale.Events.RESIZE, reposition);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.scale.off(Phaser.Scale.Events.RESIZE, reposition);
  });
}