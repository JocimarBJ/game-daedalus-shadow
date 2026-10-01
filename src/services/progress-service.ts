export interface PlayerProgress {
  userId: string;
  level: number;
  seed: string;
  mapWidth: number;
  mapHeight: number;
  updatedAt: string;
}

const API_BASE_URL = String("__API_BASE_URL__");

class ProgressService {
  public async get(userId: string): Promise<PlayerProgress> {
    return this.request<PlayerProgress>(`/progress/${encodeURIComponent(userId)}`);
  }

  public async save(
    userId: string,
    progress: Pick<PlayerProgress, "level" | "seed">
  ): Promise<PlayerProgress> {
    return this.request<PlayerProgress>(
      `/progress/${encodeURIComponent(userId)}`,
      {
        method: "PUT",
        body: JSON.stringify(progress),
      }
    );
  }

  public async advance(userId: string): Promise<PlayerProgress> {
    return this.request<PlayerProgress>(
      `/progress/${encodeURIComponent(userId)}/advance`,
      { method: "POST" }
    );
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error || "Falha na comunicação com o pseudo-backend.");
    }

    return response.json() as Promise<T>;
  }
}

export const progressService = new ProgressService();
