import * as Phaser from "phaser";
import { authService } from "../services/auth-service";

interface VerificationData {
  email?: string;
  username?: string;
}

export class EmailVerificationScene extends Phaser.Scene {
  private domElement?: Phaser.GameObjects.DOMElement;
  private userEmail = "";

  constructor() {
    super("EmailVerificationScene");
  }

  public init(data: VerificationData): void {
    const current = authService.getCurrentUser();
    this.userEmail = data?.email || current?.email || "seu-email@dominio.com";
  }

  public create(): void {
    this.createAtmosphere();
    this.createVerificationForm();
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

  private createVerificationForm(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const formHtml = `
      <div class="auth-wrapper verification-card">
        <div class="auth-header">
          <h1 class="auth-title">Verificação</h1>
          <p class="auth-subtitle">Confirmação de Identidade</p>
          <div class="auth-divider">
            <span class="auth-divider-line"></span>
            <span class="auth-divider-icon">&#9671;</span>
            <span class="auth-divider-line"></span>
          </div>
        </div>

        <p class="verification-notice">
          Um código místico de confirmação foi enviado para:<br>
          <strong class="highlight-email">${this.userEmail}</strong>
        </p>

        <form id="verify-form" class="auth-form">
          <div id="verify-error" class="form-error-alert"></div>
          <div id="verify-success" class="form-success-alert"></div>

          <div class="form-group" style="align-items: center;">
            <label class="form-label" for="verify-code">Código de Acesso (6 Dígitos)</label>
            <input 
              type="text" 
              id="verify-code" 
              class="form-input code-input" 
              placeholder="123456" 
              maxlength="6"
              autocomplete="one-time-code"
              required 
            />
          </div>

          <button type="submit" id="btn-verify-submit" class="form-button">
            Confirmar Código
          </button>
        </form>

        <div class="verification-actions">
          <button type="button" id="btn-resend-code" class="btn-text-action">
            Reenviar Código
          </button>
        </div>

        <div class="auth-footer">
          <a id="link-verify-login" class="auth-link">Voltar ao Login</a>
        </div>
      </div>
    `;

    this.domElement = this.add.dom(centerX, centerY).createFromHTML(formHtml);

    const form = this.domElement.getChildByID("verify-form") as HTMLFormElement;
    const codeInput = this.domElement.getChildByID("verify-code") as HTMLInputElement;
    const errorAlert = this.domElement.getChildByID("verify-error") as HTMLDivElement;
    const successAlert = this.domElement.getChildByID("verify-success") as HTMLDivElement;
    const submitBtn = this.domElement.getChildByID("btn-verify-submit") as HTMLButtonElement;
    const resendBtn = this.domElement.getChildByID("btn-resend-code") as HTMLButtonElement;
    const loginLink = this.domElement.getChildByID("link-verify-login") as HTMLElement;

    if (form) {
      form.addEventListener("submit", async (e: Event) => {
        e.preventDefault();
        errorAlert.classList.remove("visible");
        successAlert.classList.remove("visible");

        submitBtn.disabled = true;
        submitBtn.textContent = "Verificando...";

        const code = codeInput.value;
        const response = await authService.verifyEmail(code);

        if (!response.success) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Confirmar Código";
          errorAlert.textContent = response.error || "Código inválido.";
          errorAlert.classList.add("visible");
          return;
        }

        successAlert.textContent = "Identidade confirmada! Entrando no reino...";
        successAlert.classList.add("visible");

        setTimeout(() => {
          this.scene.start("MainMenuScene");
        }, 800);
      });
    }

    if (resendBtn) {
      resendBtn.addEventListener("click", async () => {
        resendBtn.disabled = true;
        resendBtn.textContent = "Reenviando...";
        await authService.resendVerificationCode();
        resendBtn.disabled = false;
        resendBtn.textContent = "Reenviar Código";
        successAlert.textContent = "Novo código enviado para seu e-mail (código de teste: 123456).";
        successAlert.classList.add("visible");
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
