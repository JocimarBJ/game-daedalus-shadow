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

        <div class="auth-separator">
          <span class="auth-separator-line"></span>
          <span class="auth-separator-text">OU</span>
          <span class="auth-separator-line"></span>
        </div>

        <button type="button" id="btn-register-google" class="google-button">
          <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>Cadastrar com o Google</span>
        </button>

        <div class="auth-footer">
          <span>Já possui uma conta?</span>
          <a id="link-to-login" class="auth-link">Entrar</a>
        </div>

        <div id="google-username-modal" class="auth-modal-overlay">
          <div class="auth-modal-card">
            <div class="auth-header" style="margin-bottom: 14px;">
              <h2 class="auth-title" style="font-size: 20px;">Nome de Explorador</h2>
              <p class="auth-subtitle">Defina sua alcunha no labirinto</p>
              <div class="auth-divider" style="margin: 10px 0 16px 0;">
                <span class="auth-divider-line"></span>
                <span class="auth-divider-icon">&#9671;</span>
                <span class="auth-divider-line"></span>
              </div>
            </div>

            <div id="google-modal-error" class="form-error-alert"></div>

            <div class="form-group" style="margin-bottom: 20px;">
              <label class="form-label" for="google-username-input">Nome de Usuário</label>
              <input 
                type="text" 
                id="google-username-input" 
                class="form-input" 
                placeholder="Ex: Teseu" 
                autocomplete="nickname"
                maxlength="20"
              />
            </div>

            <button type="button" id="btn-google-modal-confirm" class="form-button" style="width: 100%;">
              Confirmar
            </button>
          </div>
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
    const googleBtn = this.domElement.getChildByID("btn-register-google") as HTMLButtonElement;
    const loginLink = this.domElement.getChildByID("link-to-login") as HTMLElement;

    const usernameModal = this.domElement.getChildByID("google-username-modal") as HTMLDivElement;
    const modalUsernameInput = this.domElement.getChildByID("google-username-input") as HTMLInputElement;
    const modalErrorAlert = this.domElement.getChildByID("google-modal-error") as HTMLDivElement;
    const modalConfirmBtn = this.domElement.getChildByID("btn-google-modal-confirm") as HTMLButtonElement;

    if (form) {
      form.addEventListener("submit", async (e: Event) => {
        e.preventDefault();
        errorAlert.classList.remove("visible");
        errorAlert.textContent = "";

        const username = usernameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;

        submitBtn.disabled = true;
        if (googleBtn) googleBtn.disabled = true;
        submitBtn.textContent = "Registrando...";

        const response = await authService.register(username, email, password);

        if (!response.success) {
          submitBtn.disabled = false;
          if (googleBtn) googleBtn.disabled = false;
          submitBtn.textContent = "Criar Conta";
          errorAlert.textContent = response.error || "Falha no cadastro.";
          errorAlert.classList.add("visible");
          return;
        }

        this.scene.start("EmailVerificationScene", { email, username });
      });
    }

    if (googleBtn) {
      googleBtn.addEventListener("click", async () => {
        errorAlert.classList.remove("visible");
        errorAlert.textContent = "";

        googleBtn.disabled = true;
        submitBtn.disabled = true;
        const originalText = googleBtn.innerHTML;
        googleBtn.innerHTML = `<span>Conectando...</span>`;

        const check = await authService.checkGoogleAccount();

        if (check.isNewUser) {
          googleBtn.innerHTML = originalText;
          modalUsernameInput.value = "";
          modalErrorAlert.classList.remove("visible");
          modalErrorAlert.textContent = "";
          usernameModal.classList.add("open");
          modalUsernameInput.focus();
          return;
        }

        const response = await authService.loginWithGoogle();

        if (!response.success) {
          googleBtn.disabled = false;
          submitBtn.disabled = false;
          googleBtn.innerHTML = originalText;
          errorAlert.textContent = response.error || "Falha ao entrar com Google.";
          errorAlert.classList.add("visible");
          return;
        }

        this.scene.start("MainMenuScene");
      });
    }

    if (modalConfirmBtn) {
      modalConfirmBtn.addEventListener("click", async () => {
        modalErrorAlert.classList.remove("visible");
        modalErrorAlert.textContent = "";

        const chosenUsername = modalUsernameInput.value.trim();
        if (!chosenUsername) {
          modalErrorAlert.textContent = "Nome de usuário é obrigatório.";
          modalErrorAlert.classList.add("visible");
          return;
        }

        modalConfirmBtn.disabled = true;
        modalConfirmBtn.textContent = "Criando...";

        const response = await authService.loginWithGoogle(chosenUsername);

        if (!response.success) {
          modalConfirmBtn.disabled = false;
          modalConfirmBtn.textContent = "Confirmar";
          modalErrorAlert.textContent = response.error || "Falha ao definir nome.";
          modalErrorAlert.classList.add("visible");
          return;
        }

        usernameModal.classList.remove("open");
        this.scene.start("MainMenuScene");
      });
    }

    if (modalUsernameInput) {
      modalUsernameInput.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          modalConfirmBtn.click();
        }
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
