/**
 * Woodpecker CI API Client
 * Handles all API communication with the Woodpecker server
 */

export interface WoodpeckerConfig {
  baseUrl: string;
  token: string;
}

export class WoodpeckerClient {
  private baseUrl: string;
  private token: string;

  constructor(config: WoodpeckerConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.token = config.token;
  }

  private async request<T>(
    method: string,
    path: string,
    data?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}/api${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Woodpecker API error: ${response.status} ${response.statusText}\n${errorText}`
      );
    }

    return response.json() as Promise<T>;
  }

  // Repository endpoints
  async listRepositories(): Promise<unknown[]> {
    return this.request('GET', '/repos');
  }

  async getRepository(owner: string, repo: string): Promise<unknown> {
    return this.request('GET', `/repos/${owner}/${repo}`);
  }

  async updateRepository(
    owner: string,
    repo: string,
    data: unknown
  ): Promise<unknown> {
    return this.request('PATCH', `/repos/${owner}/${repo}`, data);
  }

  async deleteRepository(owner: string, repo: string): Promise<void> {
    return this.request('DELETE', `/repos/${owner}/${repo}`);
  }

  async activateRepository(owner: string, repo: string): Promise<unknown> {
    return this.request('POST', `/repos/${owner}/${repo}`, {});
  }

  async repairRepositories(): Promise<unknown> {
    return this.request('POST', `/repos/repair`, {});
  }

  // Pipeline endpoints
  async listPipelines(
    owner: string,
    repo: string,
    options?: { branch?: string; status?: string }
  ): Promise<unknown[]> {
    let path = `/repos/${owner}/${repo}/pipelines`;
    if (options) {
      const params = new URLSearchParams();
      if (options.branch) params.append('branch', options.branch);
      if (options.status) params.append('status', options.status);
      if (params.toString()) path += `?${params.toString()}`;
    }
    return this.request('GET', path);
  }

  async getPipeline(
    owner: string,
    repo: string,
    number: number
  ): Promise<unknown> {
    return this.request('GET', `/repos/${owner}/${repo}/pipelines/${number}`);
  }

  async createPipeline(
    owner: string,
    repo: string,
    data: unknown
  ): Promise<unknown> {
    return this.request(
      'POST',
      `/repos/${owner}/${repo}/pipelines`,
      data
    );
  }

  async cancelPipeline(
    owner: string,
    repo: string,
    number: number
  ): Promise<void> {
    return this.request(
      'DELETE',
      `/repos/${owner}/${repo}/pipelines/${number}`
    );
  }

  async getPipelineStatus(
    owner: string,
    repo: string,
    number: number
  ): Promise<unknown> {
    return this.request(
      'GET',
      `/repos/${owner}/${repo}/pipelines/${number}/status`
    );
  }

  // Step/Build logs
  async getStepLogs(
    owner: string,
    repo: string,
    number: number,
    step: number
  ): Promise<unknown> {
    return this.request(
      'GET',
      `/repos/${owner}/${repo}/pipelines/${number}/steps/${step}/logs`
    );
  }

  async deletePipelineLogs(
    owner: string,
    repo: string,
    number: number
  ): Promise<void> {
    return this.request(
      'DELETE',
      `/repos/${owner}/${repo}/pipelines/${number}/logs`
    );
  }

  // Secrets endpoints
  async listSecrets(owner: string, repo: string): Promise<unknown[]> {
    return this.request('GET', `/repos/${owner}/${repo}/secrets`);
  }

  async getSecret(
    owner: string,
    repo: string,
    secret: string
  ): Promise<unknown> {
    return this.request('GET', `/repos/${owner}/${repo}/secrets/${secret}`);
  }

  async createSecret(
    owner: string,
    repo: string,
    data: unknown
  ): Promise<unknown> {
    return this.request('POST', `/repos/${owner}/${repo}/secrets`, data);
  }

  async updateSecret(
    owner: string,
    repo: string,
    secret: string,
    data: unknown
  ): Promise<unknown> {
    return this.request(
      'PATCH',
      `/repos/${owner}/${repo}/secrets/${secret}`,
      data
    );
  }

  async deleteSecret(
    owner: string,
    repo: string,
    secret: string
  ): Promise<void> {
    return this.request(
      'DELETE',
      `/repos/${owner}/${repo}/secrets/${secret}`
    );
  }

  // Registry endpoints
  async listRegistries(owner: string, repo: string): Promise<unknown[]> {
    return this.request('GET', `/repos/${owner}/${repo}/registry`);
  }

  async getRegistry(
    owner: string,
    repo: string,
    registry: string
  ): Promise<unknown> {
    return this.request('GET', `/repos/${owner}/${repo}/registry/${registry}`);
  }

  async createRegistry(
    owner: string,
    repo: string,
    data: unknown
  ): Promise<unknown> {
    return this.request('POST', `/repos/${owner}/${repo}/registry`, data);
  }

  async deleteRegistry(
    owner: string,
    repo: string,
    registry: string
  ): Promise<void> {
    return this.request(
      'DELETE',
      `/repos/${owner}/${repo}/registry/${registry}`
    );
  }

  // Cron endpoints
  async listCrons(owner: string, repo: string): Promise<unknown[]> {
    return this.request('GET', `/repos/${owner}/${repo}/crons`);
  }

  async getCron(
    owner: string,
    repo: string,
    cron: number
  ): Promise<unknown> {
    return this.request('GET', `/repos/${owner}/${repo}/crons/${cron}`);
  }

  async createCron(
    owner: string,
    repo: string,
    data: unknown
  ): Promise<unknown> {
    return this.request('POST', `/repos/${owner}/${repo}/crons`, data);
  }

  async updateCron(
    owner: string,
    repo: string,
    cron: number,
    data: unknown
  ): Promise<unknown> {
    return this.request('PATCH', `/repos/${owner}/${repo}/crons/${cron}`, data);
  }

  async deleteCron(
    owner: string,
    repo: string,
    cron: number
  ): Promise<void> {
    return this.request('DELETE', `/repos/${owner}/${repo}/crons/${cron}`);
  }

  // Organization secrets
  async listOrgSecrets(org: string): Promise<unknown[]> {
    return this.request('GET', `/orgs/${org}/secrets`);
  }

  async getOrgSecret(org: string, secret: string): Promise<unknown> {
    return this.request('GET', `/orgs/${org}/secrets/${secret}`);
  }

  async createOrgSecret(org: string, data: unknown): Promise<unknown> {
    return this.request('POST', `/orgs/${org}/secrets`, data);
  }

  async updateOrgSecret(
    org: string,
    secret: string,
    data: unknown
  ): Promise<unknown> {
    return this.request('PATCH', `/orgs/${org}/secrets/${secret}`, data);
  }

  async deleteOrgSecret(org: string, secret: string): Promise<void> {
    return this.request('DELETE', `/orgs/${org}/secrets/${secret}`);
  }

  // User endpoints
  async getCurrentUser(): Promise<unknown> {
    return this.request('GET', '/user');
  }

  // Server info
  async getServerInfo(): Promise<unknown> {
    return this.request('GET', '/version');
  }
}
