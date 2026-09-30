import * as Phaser from "phaser";

interface VictoryData {
  timeElapsed?: number;
  stageId?: number;
}

export class VictoryScene extends Phaser.Scene {
  private domElement?: Phaser.GameObjects.DOMElement;
  private timeElapsed = 0;
  private stageId = 1;

  constructor() {
    super("VictoryScene");
  }

  public init(data: VictoryData): void {
    this.timeElapsed = data?.timeElapsed || 0;
    this.stageId = data?.stageId || 1;
  }

  public create(): void {
    this.createAtmosphere();
    this.createVictoryUI();
  }

  private createAtmosphere(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x06070a, 0x06070a, 0x121008, 0x121008, 1);
    bg.fillRect(0, 0, width, height);

    const portalGlow = this.add.circle(width / 2, height / 2, 280, 0xd4af37, 0.08);
    this.tweens.add({
      targets: portalGlow,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0.16,
      duration: 2500,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    for (let i = 0; i < 50; i++) {
      const x = Phaser.Math.Between(20, width - 20);
      const y = Phaser.Math.Between(20, height - 20);
      const radius = Phaser.Math.FloatBetween(1.5, 3.5);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.6);

      const ember = this.add.circle(x, y, radius, 0xffe066, alpha);

      this.tweens.add({
        targets: ember,
        y: y - Phaser.Math.Between(50, 140),
        alpha: 0,
        duration: Phaser.Math.Between(2000, 4500),
        repeat: -1,
        yoyo: true,
        ease: "Sine.easeInOut",
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  private formatTime(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  private createVictoryUI(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;
    const formattedTime = this.formatTime(this.timeElapsed);

    const victoryHtml = `
      <div class="auth-wrapper victory-card">
        <div class="victory-crown">&#9813;</div>

        <div class="auth-header">
          <h1 class="auth-title" style="font-size: 30px;">Vitória!</h1>
          <p class="auth-subtitle">Você Escapou das Sombras de Dédalo</p>
          <div class="auth-divider">
            <span class="auth-divider-line"></span>
            <span class="auth-divider-icon">&#9671;</span>
            <span class="auth-divider-line"></span>
          </div>
        </div>

        <div class="victory-stats">
          <div class="stat-item">
            <span class="stat-label">Fase Concluída</span>
            <span class="stat-val">Fase ${this.stageId}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Tempo de Fuga</span>
            <span class="stat-val stat-highlight">${formattedTime}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Destino</span>
            <span class="stat-val" style="color: #70e000;">Sobrevivente</span>
          </div>
        </div>

        <div class="menu-actions" style="width: 100%; margin: 22px 0 10px 0;">
          <button id="btn-victory-next" class="menu-button primary">
            <span class="btn-bullet">&#9671;</span>
            <span class="btn-text">Próxima Fase</span>
            <span class="btn-bullet">&#9671;</span>
          </button>

          <button id="btn-victory-replay" class="menu-button">
            <span class="btn-bullet">&#9671;</span>
            <span class="btn-text">Jogar Novamente</span>
            <span class="btn-bullet">&#9671;</span>
          </button>

          <button id="btn-victory-menu" class="menu-button danger">
            <span class="btn-bullet">&#9671;</span>
            <span class="btn-text">Voltar ao Menu Principal</span>
            <span class="btn-bullet">&#9671;</span>
          </button>
        </div>
      </div>
    `;

    this.domElement = this.add.dom(centerX, centerY).createFromHTML(victoryHtml);

    const nextBtn = this.domElement.getChildByID("btn-victory-next") as HTMLButtonElement;
    const replayBtn = this.domElement.getChildByID("btn-victory-replay") as HTMLButtonElement;
    const menuBtn = this.domElement.getChildByID("btn-victory-menu") as HTMLButtonElement;

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.scene.start("demo", { stageId: this.stageId + 1 });
      });
    }

    if (replayBtn) {
      replayBtn.addEventListener("click", () => {
        this.scene.start("demo", { stageId: this.stageId });
      });
    }

    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        this.scene.start("MainMenuScene");
      });
    }

    this.events.once("shutdown", () => {
      if (this.domElement) {
        this.domElement.destroy();
      }
    });
  }
}
