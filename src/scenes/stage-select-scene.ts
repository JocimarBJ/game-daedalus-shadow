import * as Phaser from "phaser";

interface StageInfo {
  id: number;
  title: string;
  subtitle: string;
  unlocked: boolean;
  difficulty: string;
}

export class StageSelectScene extends Phaser.Scene {
  private domElement?: Phaser.GameObjects.DOMElement;

  private stages: StageInfo[] = [
    {
      id: 1,
      title: "Fase I",
      subtitle: "Vestíbulo de Pedra",
      unlocked: true,
      difficulty: "Normal",
    },
    {
      id: 2,
      title: "Fase II",
      subtitle: "Catacumbas Profundas",
      unlocked: false,
      difficulty: "Difícil",
    },
    {
      id: 3,
      title: "Fase III",
      subtitle: "Corredores do Caos",
      unlocked: false,
      difficulty: "Pesadelo",
    },
    {
      id: 4,
      title: "Fase IV",
      subtitle: "O Covil de Dédalo",
      unlocked: false,
      difficulty: "Lendário",
    },
  ];

  constructor() {
    super("StageSelectScene");
  }

  public create(): void {
    this.createAtmosphere();
    this.createStageSelectionUI();
  }

  private createAtmosphere(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x050608, 0x050608, 0x0b0e14, 0x0b0e14, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(20, width - 20);
      const y = Phaser.Math.Between(20, height - 20);
      const radius = Phaser.Math.FloatBetween(1, 2.8);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.4);

      const ember = this.add.circle(x, y, radius, 0xd4af37, alpha);

      this.tweens.add({
        targets: ember,
        y: y - Phaser.Math.Between(30, 90),
        alpha: 0,
        duration: Phaser.Math.Between(2500, 5000),
        repeat: -1,
        yoyo: true,
        ease: "Sine.easeInOut",
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  private createStageSelectionUI(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const stagesHtml = this.stages
      .map((stage) => {
        const statusClass = stage.unlocked ? "unlocked" : "locked";
        const badgeText = stage.unlocked ? stage.difficulty : "Bloqueada";
        const icon = stage.unlocked ? "&#9670;" : "&#128274;";

        return `
          <div class="stage-card ${statusClass}" data-stage-id="${stage.id}">
            <div class="stage-card-header">
              <span class="stage-num">${stage.title}</span>
              <span class="stage-diff-badge ${statusClass}">${badgeText}</span>
            </div>
            <div class="stage-card-body">
              <span class="stage-icon">${icon}</span>
              <h3 class="stage-name">${stage.subtitle}</h3>
            </div>
            <div class="stage-card-footer">
              <span class="stage-action">${stage.unlocked ? "Iniciar Desafio" : "Requer Fase Anterior"}</span>
            </div>
          </div>
        `;
      })
      .join("");

    const html = `
      <div class="stage-select-wrapper">
        <div class="stage-select-header">
          <h1 class="auth-title">Seleção de Fases</h1>
          <p class="auth-subtitle">Escolha o limiar da sua descida</p>
          <div class="auth-divider">
            <span class="auth-divider-line"></span>
            <span class="auth-divider-icon">&#9671;</span>
            <span class="auth-divider-line"></span>
          </div>
        </div>

        <div class="stages-grid">
          ${stagesHtml}
        </div>

        <div class="stage-select-footer">
          <button id="btn-back-menu" class="menu-button" style="width: 240px; margin: 0 auto;">
            <span class="btn-bullet">&#9671;</span>
            <span class="btn-text">Voltar ao Menu</span>
            <span class="btn-bullet">&#9671;</span>
          </button>
        </div>
      </div>
    `;

    this.domElement = this.add.dom(centerX, centerY).createFromHTML(html);

    const backBtn = this.domElement.getChildByID("btn-back-menu") as HTMLButtonElement;
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        this.scene.start("MainMenuScene");
      });
    }

    const cards = this.domElement.node.querySelectorAll(".stage-card.unlocked");
    cards.forEach((card) => {
      card.addEventListener("click", () => {
        const stageId = card.getAttribute("data-stage-id");
        this.scene.start("demo", { stageId: Number(stageId) });
      });
    });

    this.events.once("shutdown", () => {
      if (this.domElement) {
        this.domElement.destroy();
      }
    });
  }
}
