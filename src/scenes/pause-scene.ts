import * as Phaser from "phaser";

interface GameSettings {
  masterVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  dynamicLighting: boolean;
}

const SETTINGS_STORAGE_KEY = "daedalus_settings";

export class PauseScene extends Phaser.Scene {
  private domElement?: Phaser.GameObjects.DOMElement;
  private escKey?: Phaser.Input.Keyboard.Key;
  private pauseKey?: Phaser.Input.Keyboard.Key;

  private settings: GameSettings = {
    masterVolume: 80,
    musicEnabled: true,
    sfxEnabled: true,
    dynamicLighting: true,
  };

  constructor() {
    super("PauseScene");
  }

  public create(): void {
    this.loadSettings();

    this.escKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );
    this.pauseKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.P
    );

    this.createPauseUI();
  }

  public update(): void {
    if (
      (this.escKey && Phaser.Input.Keyboard.JustDown(this.escKey)) ||
      (this.pauseKey && Phaser.Input.Keyboard.JustDown(this.pauseKey))
    ) {
      this.resumeGame();
    }
  }

  private loadSettings(): void {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch {
      this.settings = {
        masterVolume: 80,
        musicEnabled: true,
        sfxEnabled: true,
        dynamicLighting: true,
      };
    }
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch {}
  }

  private resumeGame(): void {
    this.scene.stop("PauseScene");
    this.scene.resume("demo");
  }

  private createPauseUI(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const pauseHtml = `
      <div class="pause-overlay">
        <div class="auth-wrapper pause-card">
          <div class="auth-header">
            <h1 class="auth-title">Jogo Pausado</h1>
            <p class="auth-subtitle">O Labirinto Congela no Tempo</p>
            <div class="auth-divider">
              <span class="auth-divider-line"></span>
              <span class="auth-divider-icon">&#9671;</span>
              <span class="auth-divider-line"></span>
            </div>
          </div>

          <div class="menu-actions" style="width: 100%; margin: 15px 0;">
            <button id="btn-pause-resume" class="menu-button primary">
              <span class="btn-bullet">&#9671;</span>
              <span class="btn-text">Continuar Exploração</span>
              <span class="btn-bullet">&#9671;</span>
            </button>

            <button id="btn-pause-settings" class="menu-button">
              <span class="btn-bullet">&#9671;</span>
              <span class="btn-text">Configurações</span>
              <span class="btn-bullet">&#9671;</span>
            </button>

            <button id="btn-pause-menu" class="menu-button danger">
              <span class="btn-bullet">&#9671;</span>
              <span class="btn-text">Voltar ao Menu Principal</span>
              <span class="btn-bullet">&#9671;</span>
            </button>
          </div>

          <div class="auth-footer">
            <span style="font-size: 11px; color: var(--gold-muted);">Pressione ESC para despausar</span>
          </div>
        </div>

        <div id="pause-settings-modal" class="modal-overlay">
          <div class="modal-card settings-card">
            <div class="modal-header">
              <h2 class="modal-title">Configurações</h2>
              <p class="auth-subtitle">Ajustes Rápidos de Partida</p>
              <div class="auth-divider">
                <span class="auth-divider-line"></span>
                <span class="auth-divider-icon">&#9671;</span>
                <span class="auth-divider-line"></span>
              </div>
            </div>

            <div class="settings-nav-tabs">
              <button class="settings-tab active" data-tab="ptab-audio">Áudio</button>
              <button class="settings-tab" data-tab="ptab-controls">Controles</button>
            </div>

            <div id="ptab-audio" class="settings-tab-content active">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Volume Geral</span>
                  <span class="setting-desc">Volume sonoro da partida</span>
                </div>
                <div class="setting-control">
                  <input type="range" id="psetting-master-vol" min="0" max="100" value="${this.settings.masterVolume}" class="range-slider" />
                  <span id="plabel-master-vol" class="range-val">${this.settings.masterVolume}%</span>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Música</span>
                  <span class="setting-desc">Trilha ambiente do labirinto</span>
                </div>
                <div class="setting-control">
                  <label class="switch">
                    <input type="checkbox" id="psetting-music" ${this.settings.musicEnabled ? "checked" : ""} />
                    <span class="slider-switch"></span>
                  </label>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Efeitos Sonoros (SFX)</span>
                  <span class="setting-desc">Sons de passos e portais</span>
                </div>
                <div class="setting-control">
                  <label class="switch">
                    <input type="checkbox" id="psetting-sfx" ${this.settings.sfxEnabled ? "checked" : ""} />
                    <span class="slider-switch"></span>
                  </label>
                </div>
              </div>
            </div>

            <div id="ptab-controls" class="settings-tab-content">
              <div class="controls-grid" style="margin: 10px 0;">
                <div class="control-item">
                  <div class="control-keys">
                    <span class="key-badge">W</span>
                    <span class="key-badge">A</span>
                    <span class="key-badge">S</span>
                    <span class="key-badge">D</span>
                    <span class="control-separator">ou</span>
                    <span class="key-badge">&uarr;</span>
                    <span class="key-badge">&larr;</span>
                    <span class="key-badge">&darr;</span>
                    <span class="key-badge">&rarr;</span>
                  </div>
                  <span class="control-desc">Movimentação</span>
                </div>

                <div class="control-item">
                  <div class="control-keys">
                    <span class="key-badge">ESC</span>
                    <span class="control-separator">ou</span>
                    <span class="key-badge">P</span>
                  </div>
                  <span class="control-desc">Pausar / Despausar</span>
                </div>
              </div>
            </div>

            <button id="btn-close-pause-settings" class="form-button" style="margin-top: 18px;">
              Salvar e Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    this.domElement = this.add.dom(centerX, centerY).createFromHTML(pauseHtml);

    const resumeBtn = this.domElement.getChildByID("btn-pause-resume") as HTMLButtonElement;
    const settingsBtn = this.domElement.getChildByID("btn-pause-settings") as HTMLButtonElement;
    const menuBtn = this.domElement.getChildByID("btn-pause-menu") as HTMLButtonElement;
    const modal = this.domElement.getChildByID("pause-settings-modal") as HTMLDivElement;
    const closeSettingsBtn = this.domElement.getChildByID("btn-close-pause-settings") as HTMLButtonElement;

    const masterVolSlider = this.domElement.getChildByID("psetting-master-vol") as HTMLInputElement;
    const masterVolLabel = this.domElement.getChildByID("plabel-master-vol") as HTMLSpanElement;
    const musicCheckbox = this.domElement.getChildByID("psetting-music") as HTMLInputElement;
    const sfxCheckbox = this.domElement.getChildByID("psetting-sfx") as HTMLInputElement;

    if (resumeBtn) {
      resumeBtn.addEventListener("click", () => {
        this.resumeGame();
      });
    }

    if (settingsBtn && modal) {
      settingsBtn.addEventListener("click", () => {
        modal.classList.add("open");
      });
    }

    if (closeSettingsBtn && modal) {
      closeSettingsBtn.addEventListener("click", () => {
        if (masterVolSlider) this.settings.masterVolume = Number(masterVolSlider.value);
        if (musicCheckbox) this.settings.musicEnabled = musicCheckbox.checked;
        if (sfxCheckbox) this.settings.sfxEnabled = sfxCheckbox.checked;

        this.saveSettings();
        modal.classList.remove("open");
      });
    }

    if (masterVolSlider && masterVolLabel) {
      masterVolSlider.addEventListener("input", () => {
        masterVolLabel.textContent = `${masterVolSlider.value}%`;
      });
    }

    if (menuBtn) {
      menuBtn.addEventListener("click", () => {
        this.scene.stop("PauseScene");
        this.scene.stop("demo");
        this.scene.start("MainMenuScene");
      });
    }

    const tabs = this.domElement.node.querySelectorAll(".settings-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        const targetTabId = tab.getAttribute("data-tab");
        const contents = this.domElement?.node.querySelectorAll(".settings-tab-content");
        contents?.forEach((content) => {
          if (content.id === targetTabId) {
            content.classList.add("active");
          } else {
            content.classList.remove("active");
          }
        });
      });
    });

    this.events.once("shutdown", () => {
      if (this.domElement) {
        this.domElement.destroy();
      }
    });
  }
}
