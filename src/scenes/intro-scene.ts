import * as Phaser from "phaser";

export class IntroScene extends Phaser.Scene {
  private enterKey?: Phaser.Input.Keyboard.Key;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private overlay?: HTMLDivElement;
  private isLeaving = false;

  constructor() {
    super("IntroScene");
  }

  public create(): void {
    this.isLeaving = false;
    this.overlay = this.createFullscreenOverlay();
    document.body.appendChild(this.overlay);

    this.enterKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
    this.spaceKey = this.input.keyboard?.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
    this.overlay.addEventListener("pointerdown", this.finishIntro);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.removeOverlay, this);
    this.time.delayedCall(7000, this.finishIntro, [], this);
  }

  public update(): void {
    if (
      (this.enterKey && Phaser.Input.Keyboard.JustDown(this.enterKey)) ||
      (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey))
    ) {
      this.finishIntro();
    }
  }

  private createFullscreenOverlay(): HTMLDivElement {
    const overlay = document.createElement("div");
    overlay.className = "daedalus-intro";

    const stars = Array.from({ length: 48 }, () => {
      const left = Phaser.Math.Between(2, 98);
      const top = Phaser.Math.Between(2, 98);
      const delay = Phaser.Math.Between(0, 5000) / 1000;
      const duration = Phaser.Math.Between(2500, 5000) / 1000;
      const travel = Phaser.Math.Between(24, 90);
      const size = Phaser.Math.Between(1, 3);

      return `<i class="intro-star" style="left:${left}%;top:${top}%;width:${size}px;height:${size}px;--delay:${delay}s;--duration:${duration}s;--travel:${travel}px"></i>`;
    }).join("");

    overlay.innerHTML = `
      <style>
        .daedalus-intro {
          position: fixed;
          inset: 0;
          z-index: 99999;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          display: grid;
          place-items: center;
          isolation: isolate;
          background: radial-gradient(ellipse at 50% 43%, #11110d 0%, #090a0b 48%, #040508 100%);
          color: #f0d98f;
          user-select: none;
          cursor: pointer;
          opacity: 1;
          transition: opacity 1200ms ease;
        }
        .daedalus-intro::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -1;
          background: radial-gradient(ellipse at 50% 45%, transparent 20%, rgba(0, 0, 0, 0.58) 100%);
          animation: intro-breathe 5s ease-in-out infinite alternate;
        }
        .intro-star {
          position: absolute;
          border-radius: 50%;
          background: #d4af37;
          box-shadow: 0 0 9px rgba(212, 175, 55, 0.65);
          opacity: 0;
          animation: intro-drift var(--duration) var(--delay) ease-in-out infinite;
          pointer-events: none;
        }
        .intro-composition {
          position: absolute;
          left: 50%;
          top: 43%;
          width: min(82vmin, 760px);
          aspect-ratio: 1;
          transform: translate(-50%, -50%);
        }
        .intro-aura {
          position: absolute;
          inset: 12%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.13), rgba(212, 175, 55, 0.025) 48%, transparent 72%);
          filter: blur(18px);
          animation: intro-pulse 3.2s ease-in-out infinite alternate;
        }
        .intro-astrolabe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          opacity: 0;
          transform: scale(0.72);
          animation: intro-arrive 1.5s 100ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
          filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.12));
        }
        .intro-outer { transform-origin: 250px 250px; animation: intro-spin 42s linear infinite; }
        .intro-middle { transform-origin: 250px 250px; animation: intro-spin-reverse 30s linear infinite; }
        .intro-core { transform-origin: 250px 250px; animation: intro-core-pulse 1.1s ease-in-out infinite alternate; }
        .intro-brand {
          position: absolute;
          top: 88%;
          left: 50%;
          width: max-content;
          max-width: calc(100vw - 28px);
          text-align: center;
          transform: translate(-50%, 16px);
          opacity: 0;
          animation: intro-brand-arrive 900ms 1s ease-out forwards;
          text-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
        }
        .intro-title {
          margin: 0;
          font-family: Cinzel, Georgia, serif;
          font-size: 42px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: 4px;
          white-space: nowrap;
          color: #f0d98f;
        }
        .intro-subtitle {
          margin: 9px 0 0;
          font-family: Cinzel, Georgia, serif;
          font-size: 14px;
          line-height: 1.4;
          letter-spacing: 3px;
          color: #b8a776;
        }
        .intro-prompt {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 6vh;
          margin: 0;
          text-align: center;
          font-family: Cinzel, Georgia, serif;
          font-size: 12px;
          letter-spacing: 2px;
          color: #b8a776;
          opacity: 0;
          animation: intro-prompt 1.6s 2.6s ease-in-out infinite;
        }
        .daedalus-intro.is-leaving { opacity: 0; pointer-events: none; }
        @keyframes intro-spin { to { transform: rotate(360deg); } }
        @keyframes intro-spin-reverse { to { transform: rotate(-360deg); } }
        @keyframes intro-arrive { to { opacity: 1; transform: scale(1); } }
        @keyframes intro-brand-arrive { to { opacity: 1; transform: translate(-50%, 0); } }
        @keyframes intro-pulse { to { opacity: 0.55; transform: scale(1.08); } }
        @keyframes intro-core-pulse { to { opacity: 0.62; } }
        @keyframes intro-breathe { to { opacity: 0.5; } }
        @keyframes intro-drift {
          0%, 100% { opacity: 0; transform: translateY(0); }
          35%, 65% { opacity: 0.8; }
          50% { opacity: 0.35; transform: translateY(calc(var(--travel) * -1)); }
        }
        @keyframes intro-prompt { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.9; } }
        @media (max-width: 600px) {
          .intro-title { font-size: 22px; letter-spacing: 3px; }
          .intro-subtitle { font-size: 11px; letter-spacing: 2px; }
          .intro-prompt { font-size: 10px; }
        }
        @media (max-height: 500px) and (orientation: landscape) {
          .intro-composition { width: min(72vmin, 560px); top: 40%; }
          .intro-title { font-size: 22px; }
          .intro-subtitle { margin-top: 4px; }
          .intro-prompt { bottom: 3vh; }
        }
      </style>
      ${stars}
      <main class="intro-composition" aria-label="Abertura de Daedalus' Shadow">
        <div class="intro-aura"></div>
        <svg class="intro-astrolabe" viewBox="0 0 500 500" role="presentation">
          <g class="intro-outer" fill="none" stroke="#d4af37">
            <circle cx="250" cy="250" r="235" stroke-opacity=".28" stroke-width="1.5" stroke-dasharray="12 8 4 8" />
            <circle cx="250" cy="250" r="220" stroke-opacity=".2" stroke-width="1" />
            <circle cx="250" cy="250" r="190" stroke-opacity=".38" stroke-width="2" stroke-dasharray="80 15 120 20 60 25 150 15" />
            <g stroke-opacity=".7" stroke-width="2">
              <path d="M250 10v26M250 464v26M10 250h26M464 250h26" />
              <path d="m80 80 19 19m302-19-19 19M80 420l19-19m302 19-19-19" stroke-opacity=".4" />
            </g>
          </g>
          <g class="intro-middle" fill="none">
            <circle cx="250" cy="250" r="155" stroke="#d4af37" stroke-opacity=".42" stroke-width="2" stroke-dasharray="100 25 70 20 90 30" />
            <circle cx="250" cy="250" r="120" stroke="#d4af37" stroke-opacity=".5" stroke-width="2" stroke-dasharray="60 30 110 25 50 15" />
            <circle cx="250" cy="250" r="85" stroke="#e63946" stroke-opacity=".48" stroke-width="2" stroke-dasharray="40 20 50 20" />
            <path d="M250 60v35m0 310v35M60 250h35m310 0h35" stroke="#d4af37" stroke-opacity=".45" stroke-width="2" />
          </g>
          <g fill="none" stroke="#d4af37" stroke-opacity=".3" stroke-width="1.5">
            <path d="m250 90 138 240H112zM250 410 112 170h276z" />
            <circle cx="250" cy="250" r="60" stroke="#e63946" stroke-opacity=".42" stroke-dasharray="6 4" />
            <circle cx="250" cy="250" r="42" stroke="#ffe7a0" stroke-opacity=".85" stroke-width="2" />
          </g>
          <g class="intro-core">
            <circle cx="250" cy="250" r="30" fill="#d4af37" fill-opacity=".2" />
            <path d="m250 232 18 18-18 18-18-18z" fill="#f0d98f" />
          </g>
        </svg>
        <div class="intro-brand">
          <h1 class="intro-title">DAEDALUS' SHADOW</h1>
          <p class="intro-subtitle">O LABIRINTO DE MINOS</p>
        </div>
      </main>
      <p class="intro-prompt">PRESSIONE ENTER OU CLIQUE PARA CONTINUAR</p>
    `;

    return overlay;
  }

  private finishIntro = (): void => {
    if (this.isLeaving) {
      return;
    }

    this.isLeaving = true;
    this.scene.launch("LoginScene");
    this.time.delayedCall(220, () => {
      this.overlay?.classList.add("is-leaving");
      this.time.delayedCall(1200, () => {
        this.removeOverlay();
        this.scene.stop();
      });
    });
  };

  private removeOverlay(): void {
    this.overlay?.remove();
    this.overlay = undefined;
  }
}
