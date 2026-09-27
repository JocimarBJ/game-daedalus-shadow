import * as Phaser from "phaser";
import { authService } from "../services/auth-service";

export class LoginScene extends Phaser.Scene {
  private domElement?: Phaser.GameObjects.DOMElement;

  constructor() {
    super("LoginScene");
  }

  public create(): void {
    if (authService.isAuthenticated()) {
      this.scene.start("MainMenuScene");
      return;
    }

    this.createAtmosphere();
    this.createLoginForm();
  }

  private createAtmosphere(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x050608, 0x050608, 0x0b0e14, 0x0b0e14, 1);
    bg.fillRect(0, 0, width, height);

    for (let i = 0; i < 35; i++) {
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

  private createLoginForm(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const formHtml = `
      <div class="auth-wrapper">
        <div class="auth-header">
          <h1 class="auth-title">Daedalus' Shadow</h1>
          <p class="auth-subtitle">Portal de Acesso ao Labirinto</p>
          <div class="auth-divider">
            <span class="auth-divider-line"></span>
            <span class="auth-divider-icon">&#9671;</span>
            <span class="auth-divider-line"></span>
          </div>
        </div>

        <form id="login-form" class="auth-form">
          <div id="login-error" class="form-error-alert"></div>

          <div class="form-group">
            <label class="form-label" for="login-email">E-mail</label>
            <input 
              type="email" 
              id="login-email" 
              class="form-input" 
              placeholder="seu-email@dominio.com" 
              autocomplete="email"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Senha</label>
            <input 
              type="password" 
              id="login-password" 
              class="form-input" 
              placeholder="••••••••" 
              autocomplete="current-password"
              required 
            />
          </div>

          <button type="submit" id="btn-login-submit" class="form-button">
            Entrar
          </button>
        </form>

        <div class="auth-footer">
          <span>Ainda não possui acesso?</span>
          <a id="link-to-register" class="auth-link">Criar Conta</a>
        </div>
      </div>
    `;

    this.domElement = this.add.dom(centerX, centerY).createFromHTML(formHtml);

    const form = this.domElement.getChildByID("login-form") as HTMLFormElement;
    const emailInput = this.domElement.getChildByID("login-email") as HTMLInputElement;
    const passwordInput = this.domElement.getChildByID("login-password") as HTMLInputElement;
    const errorAlert = this.domElement.getChildByID("login-error") as HTMLDivElement;
    const submitBtn = this.domElement.getChildByID("btn-login-submit") as HTMLButtonElement;
    const registerLink = this.domElement.getChildByID("link-to-register") as HTMLElement;

    if (form) {
      form.addEventListener("submit", async (e: Event) => {
        e.preventDefault();
        errorAlert.classList.remove("visible");
        errorAlert.textContent = "";

        const email = emailInput.value;
        const password = passwordInput.value;

        submitBtn.disabled = true;
        submitBtn.textContent = "Autenticando...";

        const response = await authService.login(email, password);

        if (!response.success) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Entrar";
          errorAlert.textContent = response.error || "Falha na autenticação.";
          errorAlert.classList.add("visible");
          return;
        }

        this.scene.start("MainMenuScene");
      });
    }

    if (registerLink) {
      registerLink.addEventListener("click", () => {
        this.scene.start("RegisterScene");
      });
    }

    this.events.once("shutdown", () => {
      if (this.domElement) {
        this.domElement.destroy();
      }
    });
  }
}
