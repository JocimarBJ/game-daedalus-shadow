import * as Phaser from "phaser";
import { authService } from "../services/auth-service";

interface GameSettings {
  masterVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  dynamicLighting: boolean;
}

const SETTINGS_STORAGE_KEY = "daedalus_settings";

export class MainMenuScene extends Phaser.Scene {
  private domElement?: Phaser.GameObjects.DOMElement;

  private settings: GameSettings = {
    masterVolume: 80,
    musicEnabled: true,
    sfxEnabled: true,
    dynamicLighting: true,
  };

  constructor() {
    super("MainMenuScene");
  }

  public create(): void {
    if (!authService.isAuthenticated()) {
      this.scene.start("LoginScene");
      return;
    }

    this.loadSettings();
    this.createAtmosphere();
    this.createMenu();
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

  private createAtmosphere(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x040508, 0x040508, 0x090c12, 0x090c12, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 45; i++) {
      const x = Phaser.Math.Between(20, width - 20);
      const y = Phaser.Math.Between(20, height - 20);
      const radius = Phaser.Math.FloatBetween(1, 3);
      const alpha = Phaser.Math.FloatBetween(0.1, 0.45);

      const ember = this.add.circle(x, y, radius, 0xd4af37, alpha);

      this.tweens.add({
        targets: ember,
        y: y - Phaser.Math.Between(40, 120),
        alpha: 0,
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        yoyo: true,
        ease: "Sine.easeInOut",
        delay: Phaser.Math.Between(0, 2500),
      });
    }
  }

  private createMenu(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const menuHtml = `
      <div class="main-menu-fullscreen">
        <div class="menu-left-panel">
          <div class="menu-brand">
            <h1 class="menu-title">Daedalus' Shadow</h1>
            <p class="menu-subtitle">O Labirinto de Minos</p>
            <div class="auth-divider">
              <span class="auth-divider-line"></span>
              <span class="auth-divider-icon">&#9671;</span>
              <span class="auth-divider-line"></span>
            </div>
          </div>

          <div class="menu-actions">
            <button id="btn-continue" class="menu-button primary">
              <span class="btn-bullet">&#9671;</span>
              <span class="btn-text">Continuar</span>
              <span class="btn-bullet">&#9671;</span>
            </button>

            <button id="btn-new-game" class="menu-button">
              <span class="btn-bullet">&#9671;</span>
              <span class="btn-text">Novo Jogo</span>
              <span class="btn-bullet">&#9671;</span>
            </button>

            <button id="btn-settings" class="menu-button">
              <span class="btn-bullet">&#9671;</span>
              <span class="btn-text">Configurações</span>
              <span class="btn-bullet">&#9671;</span>
            </button>

            <button id="btn-logout" class="menu-button danger">
              <span class="btn-bullet">&#9671;</span>
              <span class="btn-text">Encerrar Sessão</span>
              <span class="btn-bullet">&#9671;</span>
            </button>
          </div>
        </div>

        <div class="menu-right-panel">
          <div class="astrolabe-showcase">
            <div class="astrolabe-aura"></div>

            <div class="astrolabe-mechanism">
              <div class="astrolabe-layer layer-outer">
                <svg viewBox="0 0 500 500" class="astrolabe-svg">
                  <circle cx="250" cy="250" r="235" fill="none" stroke="rgba(212, 175, 55, 0.35)" stroke-width="2" stroke-dasharray="12 8 4 8" />
                  <circle cx="250" cy="250" r="225" fill="none" stroke="rgba(212, 175, 55, 0.2)" stroke-width="1" />
                  <line x1="250" y1="10" x2="250" y2="30" stroke="#d4af37" stroke-width="2" />
                  <line x1="250" y1="470" x2="250" y2="490" stroke="#d4af37" stroke-width="2" />
                  <line x1="10" y1="250" x2="30" y2="250" stroke="#d4af37" stroke-width="2" />
                  <line x1="470" y1="250" x2="490" y2="250" stroke="#d4af37" stroke-width="2" />
                  <line x1="80" y1="80" x2="95" y2="95" stroke="rgba(212, 175, 55, 0.5)" stroke-width="1.5" />
                  <line x1="420" y1="80" x2="405" y2="95" stroke="rgba(212, 175, 55, 0.5)" stroke-width="1.5" />
                  <line x1="80" y1="420" x2="95" y2="405" stroke="rgba(212, 175, 55, 0.5)" stroke-width="1.5" />
                  <line x1="420" y1="420" x2="405" y2="405" stroke="rgba(212, 175, 55, 0.5)" stroke-width="1.5" />
                </svg>
              </div>

              <div class="astrolabe-layer layer-maze">
                <svg viewBox="0 0 500 500" class="astrolabe-svg">
                  <circle cx="250" cy="250" r="190" fill="none" stroke="rgba(212, 175, 55, 0.45)" stroke-width="2.5" stroke-dasharray="80 15 120 20 60 25 150 15" />
                  <circle cx="250" cy="250" r="155" fill="none" stroke="rgba(212, 175, 55, 0.4)" stroke-width="2" stroke-dasharray="100 25 70 20 90 30" />
                  <circle cx="250" cy="250" r="120" fill="none" stroke="rgba(212, 175, 55, 0.5)" stroke-width="2" stroke-dasharray="60 30 110 25 50 15" />
                  <circle cx="250" cy="250" r="85" fill="none" stroke="rgba(230, 57, 70, 0.5)" stroke-width="2" stroke-dasharray="40 20 50 20" />
                  <path d="M 250 60 L 250 95" stroke="rgba(212, 175, 55, 0.4)" stroke-width="2" />
                  <path d="M 250 405 L 250 440" stroke="rgba(212, 175, 55, 0.4)" stroke-width="2" />
                  <path d="M 95 250 L 130 250" stroke="rgba(212, 175, 55, 0.4)" stroke-width="2" />
                  <path d="M 370 250 L 405 250" stroke="rgba(212, 175, 55, 0.4)" stroke-width="2" />
                </svg>
              </div>

              <div class="astrolabe-layer layer-sacred">
                <svg viewBox="0 0 500 500" class="astrolabe-svg">
                  <polygon points="250,90 388,330 112,330" fill="none" stroke="rgba(212, 175, 55, 0.25)" stroke-width="1.5" />
                  <polygon points="250,410 112,170 388,170" fill="none" stroke="rgba(212, 175, 55, 0.25)" stroke-width="1.5" />
                  <circle cx="250" cy="250" r="60" fill="none" stroke="rgba(230, 57, 70, 0.4)" stroke-width="1.5" stroke-dasharray="6 4" />
                </svg>
              </div>

              <div class="astrolabe-core">
                <div class="core-diamond">
                  <div class="core-inner-glow"></div>
                  <span class="core-symbol">&#9670;</span>
                </div>
              </div>
            </div>

            <div class="astrolabe-pedestal-light"></div>

            <div class="artifact-caption">
              <span class="artifact-title">O Mecanismo de Dédalo</span>
              <span class="artifact-desc">"Apenas a mente que decifra o astrolábio escapará das sombras."</span>
            </div>
          </div>
        </div>

        <div id="settings-modal" class="modal-overlay">
          <div class="modal-card settings-card">
            <div class="modal-header">
              <h2 class="modal-title">Configurações</h2>
              <p class="auth-subtitle">Ajustes do Reino & Percepção</p>
              <div class="auth-divider">
                <span class="auth-divider-line"></span>
                <span class="auth-divider-icon">&#9671;</span>
                <span class="auth-divider-line"></span>
              </div>
            </div>

            <div class="settings-nav-tabs">
              <button class="settings-tab active" data-tab="tab-audio">Áudio</button>
              <button class="settings-tab" data-tab="tab-controls">Controles</button>
              <button class="settings-tab" data-tab="tab-graphics">Gráficos</button>
            </div>

            <div id="tab-audio" class="settings-tab-content active">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Volume Geral</span>
                  <span class="setting-desc">Ajuste o volume mestre do labirinto</span>
                </div>
                <div class="setting-control">
                  <input type="range" id="setting-master-vol" min="0" max="100" value="${this.settings.masterVolume}" class="range-slider" />
                  <span id="label-master-vol" class="range-val">${this.settings.masterVolume}%</span>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Música de Fundo</span>
                  <span class="setting-desc">Trilha atmosférica e orquestral</span>
                </div>
                <div class="setting-control">
                  <label class="switch">
                    <input type="checkbox" id="setting-music" ${this.settings.musicEnabled ? "checked" : ""} />
                    <span class="slider-switch"></span>
                  </label>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Efeitos Sonoros (SFX)</span>
                  <span class="setting-desc">Passos, golpes de espada e portais</span>
                </div>
                <div class="setting-control">
                  <label class="switch">
                    <input type="checkbox" id="setting-sfx" ${this.settings.sfxEnabled ? "checked" : ""} />
                    <span class="slider-switch"></span>
                  </label>
                </div>
              </div>
            </div>

            <div id="tab-controls" class="settings-tab-content">
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
                    <span class="key-badge key-space">Espaço</span>
                  </div>
                  <span class="control-desc">Golpe / Ataque</span>
                </div>

                <div class="control-item">
                  <div class="control-keys">
                    <span class="key-badge">ESC</span>
                    <span class="control-separator">ou</span>
                    <span class="key-badge">P</span>
                  </div>
                  <span class="control-desc">Menu de Pausa</span>
                </div>
              </div>
            </div>

            <div id="tab-graphics" class="settings-tab-content">
              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Iluminação Dinâmica 2D</span>
                  <span class="setting-desc">Pipeline Light2D com sombra e penumbra</span>
                </div>
                <div class="setting-control">
                  <label class="switch">
                    <input type="checkbox" id="setting-lighting" ${this.settings.dynamicLighting ? "checked" : ""} />
                    <span class="slider-switch"></span>
                  </label>
                </div>
              </div>

              <div class="setting-row">
                <div class="setting-info">
                  <span class="setting-label">Modo Tela Cheia</span>
                  <span class="setting-desc">Expandir para preencher todo o monitor</span>
                </div>
                <div class="setting-control">
                  <button id="btn-toggle-fullscreen" class="settings-btn-action">Alternar</button>
                </div>
              </div>
            </div>

            <button id="btn-close-settings" class="form-button" style="margin-top: 20px;">
              Salvar e Fechar
            </button>
          </div>
        </div>
      </div>
    `;

    this.domElement = this.add.dom(centerX, centerY).createFromHTML(menuHtml);

    const continueBtn = this.domElement.getChildByID("btn-continue") as HTMLButtonElement;
    const newGameBtn = this.domElement.getChildByID("btn-new-game") as HTMLButtonElement;
    const settingsBtn = this.domElement.getChildByID("btn-settings") as HTMLButtonElement;
    const logoutBtn = this.domElement.getChildByID("btn-logout") as HTMLButtonElement;
    const modal = this.domElement.getChildByID("settings-modal") as HTMLDivElement;
    const closeSettingsBtn = this.domElement.getChildByID("btn-close-settings") as HTMLButtonElement;

    const masterVolSlider = this.domElement.getChildByID("setting-master-vol") as HTMLInputElement;
    const masterVolLabel = this.domElement.getChildByID("label-master-vol") as HTMLSpanElement;
    const musicCheckbox = this.domElement.getChildByID("setting-music") as HTMLInputElement;
    const sfxCheckbox = this.domElement.getChildByID("setting-sfx") as HTMLInputElement;
    const lightingCheckbox = this.domElement.getChildByID("setting-lighting") as HTMLInputElement;
    const fullscreenBtn = this.domElement.getChildByID("btn-toggle-fullscreen") as HTMLButtonElement;

    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        this.scene.start("demo", { resume: true });
      });
    }

    if (newGameBtn) {
      newGameBtn.addEventListener("click", () => {
        this.scene.start("StageSelectScene");
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
        if (lightingCheckbox) this.settings.dynamicLighting = lightingCheckbox.checked;

        this.saveSettings();
        modal.classList.remove("open");
      });
    }

    if (masterVolSlider && masterVolLabel) {
      masterVolSlider.addEventListener("input", () => {
        masterVolLabel.textContent = `${masterVolSlider.value}%`;
      });
    }

    if (fullscreenBtn) {
      const updateFullscreenButton = () => {
        const isFullscreen = this.scale.isFullscreen || Boolean(document.fullscreenElement);
        fullscreenBtn.textContent = isFullscreen
          ? "Sair da Tela Cheia"
          : "Entrar em Tela Cheia";
        fullscreenBtn.setAttribute("aria-pressed", String(isFullscreen));
      };

      const toggleFullscreen = () => {
        if (this.scale.isFullscreen) {
          this.scale.stopFullscreen();
        } else {
          this.scale.startFullscreen();
        }
        updateFullscreenButton();
      };

      fullscreenBtn.addEventListener("click", toggleFullscreen);
      document.addEventListener("fullscreenchange", updateFullscreenButton);
      window.addEventListener("keydown", (event) => {
        if (event.key === "F11") {
          event.preventDefault();
          toggleFullscreen();
        }
      });
      this.events.once("shutdown", () => {
        document.removeEventListener("fullscreenchange", updateFullscreenButton);
      });
      updateFullscreenButton();
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

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        authService.logout();
        this.scene.start("LoginScene");
      });
    }

    this.events.once("shutdown", () => {
      if (this.domElement) {
        this.domElement.destroy();
      }
    });
  }
}
