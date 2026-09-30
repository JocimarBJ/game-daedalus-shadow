export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  isVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

const USERS_STORAGE_KEY = "daedalus_users";
const SESSION_STORAGE_KEY = "daedalus_session";

interface StoredUser extends User {
  passwordHash: string;
  verificationCode?: string;
}

class AuthService {
  private users: StoredUser[] = [];
  private currentUser: User | null = null;

  constructor() {
    this.loadUsers();
    this.loadSession();
  }

  private loadUsers(): void {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        this.users = JSON.parse(stored);
      } else {
        this.users = [
          {
            id: "user-1",
            username: "Cavaleiro",
            email: "jogador@daedalus.com",
            passwordHash: "123456",
            createdAt: new Date().toISOString(),
            isVerified: true,
            verificationCode: "123456",
          },
        ];
        localStorage.setItem(
          USERS_STORAGE_KEY,
          JSON.stringify(this.users)
        );
      }
    } catch {
      this.users = [];
    }
  }

  private loadSession(): void {
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      if (session) {
        this.currentUser = JSON.parse(session);
      }
    } catch {
      this.currentUser = null;
    }
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const trimmedEmail = email.trim().toLowerCase();
    const foundUser = this.users.find(
      (user) =>
        user.email.toLowerCase() === trimmedEmail &&
        user.passwordHash === password
    );

    if (!foundUser) {
      return {
        success: false,
        error: "E-mail ou senha incorretos.",
      };
    }

    const { passwordHash, verificationCode, ...safeUser } = foundUser;
    this.currentUser = safeUser;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));

    return {
      success: true,
      user: safeUser,
    };
  }

  public async register(
    username: string,
    email: string,
    password: string
  ): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedUsername) {
      return { success: false, error: "Nome de usuário é obrigatório." };
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return { success: false, error: "Informe um e-mail válido." };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        error: "A senha deve conter no mínimo 6 caracteres.",
      };
    }

    const emailExists = this.users.some(
      (user) => user.email.toLowerCase() === trimmedEmail
    );
    if (emailExists) {
      return { success: false, error: "Este e-mail já está cadastrado." };
    }

    const usernameExists = this.users.some(
      (user) =>
        user.username.toLowerCase() === trimmedUsername.toLowerCase()
    );
    if (usernameExists) {
      return {
        success: false,
        error: "Este nome de usuário já está em uso.",
      };
    }

    const newUser: StoredUser = {
      id: "user-" + Date.now(),
      username: trimmedUsername,
      email: trimmedEmail,
      passwordHash: password,
      createdAt: new Date().toISOString(),
      isVerified: false,
      verificationCode: "123456",
    };

    this.users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));

    const { passwordHash, verificationCode, ...safeUser } = newUser;
    this.currentUser = safeUser;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));

    return {
      success: true,
      user: safeUser,
    };
  }

  public async verifyEmail(code: string): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!this.currentUser) {
      return { success: false, error: "Nenhuma sessão ativa." };
    }

    const userIndex = this.users.findIndex(
      (u) => u.id === this.currentUser?.id
    );

    if (userIndex === -1) {
      return { success: false, error: "Usuário não encontrado." };
    }

    const storedUser = this.users[userIndex];
    if (code.trim() !== "123456" && code.trim() !== storedUser.verificationCode) {
      return { success: false, error: "Código incorreto. Use 123456 para o teste." };
    }

    storedUser.isVerified = true;
    this.users[userIndex] = storedUser;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));

    const { passwordHash, verificationCode, ...safeUser } = storedUser;
    this.currentUser = safeUser;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(safeUser));

    return {
      success: true,
      user: safeUser,
    };
  }

  public async resendVerificationCode(): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return true;
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public logout(): void {
    this.currentUser = null;
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  public isAuthenticated(): boolean {
    if (!this.currentUser) {
      this.loadSession();
    }
    return this.currentUser !== null;
  }
}

export const authService = new AuthService();
