import * as Phaser from "phaser";
import { authService } from "../services/auth-service";

export class RegisterScene extends Phaser.Scene {
  private domElement?: Phaser.GameObjects.DOMElement;

  constructor() {
    super("RegisterScene");
  }

  public create(): void {
    this.createAtmosphere();
    this.createRegisterForm();
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

  private createRegisterForm(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const formHtml = `
      <div class="auth-wrapper">
        <div class="auth-header">
          <h1 class="auth-title">Daedalus' Shadow</h1>
          <p class="auth-subtitle">Registro de Novo Explorador</p>
          <div class="auth-divider">
            <span class="auth-divider-line"></span>
            <span class="auth-divider-icon">&#9671;</span>
            <span class="auth-divider-line"></span>
          </div>
        </div>

        <form id="register-form" class="auth-form">
          <div id="register-error" class="form-error-alert"></div>

          <div class="form-group">
            <label class="form-label" for="register-username">Nome de Usuário</label>
            <input 
              type="text" 
              id="register-username" 
              class="form-input" 
              placeholder="Ex: Teseu" 
              autocomplete="username"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="register-email">E-mail</label>
            <input 
              type="email" 
              id="register-email" 
              class="form-input" 
              placeholder="seu-email@dominio.com" 
              autocomplete="email"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="register-password">Senha</label>
            <input 
              type="password" 
              id="register-password" 
              class="form-input" 
              placeholder="Mínimo 6 caracteres" 
              autocomplete="new-password"
              required 
            />
          </div>

          <button type="submit" id="btn-register-submit" class="form-button">
            Criar Conta
          </button>
        </form>

        <div class="auth-footer">
          <span>Já possui uma conta?</span>
          <a id="link-to-login" class="auth-link">Entrar</a>
        </div>
      </div>
    `;

    this.domElement = this.add.dom(centerX, centerY).createFromHTML(formHtml);

    const form = this.domElement.getChildByID("register-form") as HTMLFormElement;
    const usernameInput = this.domElement.getChildByID("register-username") as HTMLInputElement;
    const emailInput = this.domElement.getChildByID("register-email") as HTMLInputElement;
    const passwordInput = this.domElement.getChildByID("register-password") as HTMLInputElement;
    const errorAlert = this.domElement.getChildByID("register-error") as HTMLDivElement;
    const submitBtn = this.domElement.getChildByID("btn-register-submit") as HTMLButtonElement;
    const loginLink = this.domElement.getChildByID("link-to-login") as HTMLElement;

    if (form) {
      form.addEventListener("submit", async (e: Event) => {
        e.preventDefault();
        errorAlert.classList.remove("visible");
        errorAlert.textContent = "";

        const username = usernameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;

        submitBtn.disabled = true;
        submitBtn.textContent = "Registrando...";

        const response = await authService.register(username, email, password);

        if (!response.success) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Criar Conta";
          errorAlert.textContent = response.error || "Falha no cadastro.";
          errorAlert.classList.add("visible");
          return;
        }

        this.scene.start("EmailVerificationScene", { email, username });
      });
    }

    if (loginLink) {
      loginLink.addEventListener("click", () => {
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
