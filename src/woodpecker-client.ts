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

    if (response.status === 204 || response.headers?.get?.('content-length') === '0') {
      return undefined as T;
    }

    const contentType = response.headers?.get?.('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const body = await response.text();
      throw new Error(
        `Woodpecker API returned non-JSON response (${contentType}):\n${body.slice(0, 500)}`
      );
    }

    return response.json() as Promise<T>;
  }

  // Repository endpoints
  async listRepositories(): Promise<unknown[]> {
    return this.request('GET', '/repos');
  }

  async getRepository(repoId: number): Promise<unknown>;
  async getRepository(owner: string, repo: string): Promise<unknown>;
  async getRepository(repoIdOrOwner: number | string, repo?: string): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('GET', `/repos/${repoIdOrOwner}`);
    }
    return this.request('GET', `/repos/${repoIdOrOwner}/${repo}`);
  }

  async activateRepository(repoId: number): Promise<unknown>;
  async activateRepository(owner: string, repo: string): Promise<unknown>;
  async activateRepository(repoIdOrOwner: number | string, repo?: string): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('POST', `/repos/${repoIdOrOwner}`);
    }
    return this.request('POST', `/repos/${repoIdOrOwner}/${repo}`, {});
  }

  async updateRepository(repoId: number, data: unknown): Promise<unknown>;
  async updateRepository(owner: string, repo: string, data: unknown): Promise<unknown>;
  async updateRepository(repoIdOrOwner: number | string, repoOrData: string | unknown, data?: unknown): Promise<unknown> {
    if (typeof repoOrData === 'string') {
      return this.request('PATCH', `/repos/${repoIdOrOwner}/${repoOrData}`, data);
    }
    return this.request('PATCH', `/repos/${repoIdOrOwner}`, repoOrData);
  }

  async deleteRepository(repoId: number): Promise<void>;
  async deleteRepository(owner: string, repo: string): Promise<void>;
  async deleteRepository(repoIdOrOwner: number | string, repo?: string): Promise<void> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('DELETE', `/repos/${repoIdOrOwner}`);
    }
    return this.request('DELETE', `/repos/${repoIdOrOwner}/${repo}`);
  }

  async repairRepositories(): Promise<unknown> {
    return this.request('POST', `/repos/repair`, {});
  }

  // Pipeline endpoints
  async listPipelines(
    repoId: number,
    options?: { branch?: string; status?: string }
  ): Promise<unknown[]>;
  async listPipelines(
    owner: string,
    repo: string,
    options?: { branch?: string; status?: string }
  ): Promise<unknown[]>;
  async listPipelines(
    repoIdOrOwner: number | string,
    repoOrOptions?: string | { branch?: string; status?: string },
    options?: { branch?: string; status?: string }
  ): Promise<unknown[]> {
    let path: string;
    let actualOptions: { branch?: string; status?: string } | undefined;

    if (typeof repoIdOrOwner === 'number') {
      path = `/repos/${repoIdOrOwner}/pipelines`;
      actualOptions = repoOrOptions as { branch?: string; status?: string } | undefined;
    } else {
      path = `/repos/${repoIdOrOwner}/${repoOrOptions}/pipelines`;
      actualOptions = options;
    }

    if (actualOptions) {
      const params = new URLSearchParams();
      if (actualOptions.branch) params.append('branch', actualOptions.branch);
      if (actualOptions.status) params.append('status', actualOptions.status);
      if (params.toString()) path += `?${params.toString()}`;
    }
    return this.request('GET', path);
  }

  async getPipeline(repoId: number, number: number): Promise<unknown>;
  async getPipeline(owner: string, repo: string, number: number): Promise<unknown>;
  async getPipeline(repoIdOrOwner: number | string, numberOrRepo: number | string, number?: number): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('GET', `/repos/${repoIdOrOwner}/pipelines/${numberOrRepo}`);
    }
    return this.request('GET', `/repos/${repoIdOrOwner}/${numberOrRepo}/pipelines/${number}`);
  }

  async createPipeline(repoId: number, data: unknown): Promise<unknown>;
  async createPipeline(owner: string, repo: string, data: unknown): Promise<unknown>;
  async createPipeline(repoIdOrOwner: number | string, repoOrData: number | unknown, data?: unknown): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('POST', `/repos/${repoIdOrOwner}/pipelines`, repoOrData);
    }
    return this.request('POST', `/repos/${repoIdOrOwner}/${repoOrData}/pipelines`, data);
  }

  async cancelPipeline(repoId: number, number: number): Promise<void>;
  async cancelPipeline(owner: string, repo: string, number: number): Promise<void>;
  async cancelPipeline(repoIdOrOwner: number | string, numberOrRepo: number | string, number?: number): Promise<void> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('DELETE', `/repos/${repoIdOrOwner}/pipelines/${numberOrRepo}`);
    }
    return this.request('DELETE', `/repos/${repoIdOrOwner}/${numberOrRepo}/pipelines/${number}`);
  }

  async getPipelineStatus(repoId: number, number: number): Promise<unknown>;
  async getPipelineStatus(owner: string, repo: string, number: number): Promise<unknown>;
  async getPipelineStatus(repoIdOrOwner: number | string, numberOrRepo: number | string, number?: number): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('GET', `/repos/${repoIdOrOwner}/pipelines/${numberOrRepo}/status`);
    }
    return this.request('GET', `/repos/${repoIdOrOwner}/${numberOrRepo}/pipelines/${number}/status`);
  }

  // Step/Build logs
  async getStepLogs(repoId: number, number: number, step: number): Promise<unknown>;
  async getStepLogs(owner: string, repo: string, number: number, step: number): Promise<unknown>;
  async getStepLogs(repoIdOrOwner: number | string, numberOrRepo: number | string, stepOrNumber: number, step?: number): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request(
        'GET',
        `/repos/${repoIdOrOwner}/pipelines/${numberOrRepo}/steps/${stepOrNumber}/logs`
      );
    }
    return this.request(
      'GET',
      `/repos/${repoIdOrOwner}/${numberOrRepo}/pipelines/${stepOrNumber}/steps/${step}/logs`
    );
  }

  async deletePipelineLogs(repoId: number, number: number): Promise<void>;
  async deletePipelineLogs(owner: string, repo: string, number: number): Promise<void>;
  async deletePipelineLogs(repoIdOrOwner: number | string, numberOrRepo: number | string, number?: number): Promise<void> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('DELETE', `/repos/${repoIdOrOwner}/pipelines/${numberOrRepo}/logs`);
    }
    return this.request('DELETE', `/repos/${repoIdOrOwner}/${numberOrRepo}/pipelines/${number}/logs`);
  }

  // Secrets endpoints
  async listSecrets(repoId: number): Promise<unknown[]>;
  async listSecrets(owner: string, repo: string): Promise<unknown[]>;
  async listSecrets(repoIdOrOwner: number | string, repo?: string): Promise<unknown[]> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('GET', `/repos/${repoIdOrOwner}/secrets`);
    }
    return this.request('GET', `/repos/${repoIdOrOwner}/${repo}/secrets`);
  }

  async getSecret(repoId: number, secret: string): Promise<unknown>;
  async getSecret(owner: string, repo: string, secret: string): Promise<unknown>;
  async getSecret(repoIdOrOwner: number | string, secretOrRepo: string, secret?: string): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('GET', `/repos/${repoIdOrOwner}/secrets/${secretOrRepo}`);
    }
    return this.request('GET', `/repos/${repoIdOrOwner}/${secretOrRepo}/secrets/${secret}`);
  }

  async createSecret(repoId: number, data: unknown): Promise<unknown>;
  async createSecret(owner: string, repo: string, data: unknown): Promise<unknown>;
  async createSecret(repoIdOrOwner: number | string, dataOrRepo: unknown, data?: unknown): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('POST', `/repos/${repoIdOrOwner}/secrets`, dataOrRepo);
    }
    return this.request('POST', `/repos/${repoIdOrOwner}/${dataOrRepo}/secrets`, data);
  }

  async updateSecret(
    repoId: number,
    secret: string,
    data: unknown
  ): Promise<unknown>;
  async updateSecret(
    owner: string,
    repo: string,
    secret: string,
    data: unknown
  ): Promise<unknown>;
  async updateSecret(
    repoIdOrOwner: number | string,
    secretOrRepo: string,
    dataOrSecret: string | unknown,
    data?: unknown
  ): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('PATCH', `/repos/${repoIdOrOwner}/secrets/${secretOrRepo}`, dataOrSecret);
    }
    return this.request('PATCH', `/repos/${repoIdOrOwner}/${secretOrRepo}/secrets/${dataOrSecret}`, data);
  }

  async deleteSecret(repoId: number, secret: string): Promise<void>;
  async deleteSecret(owner: string, repo: string, secret: string): Promise<void>;
  async deleteSecret(repoIdOrOwner: number | string, secretOrRepo: string, secret?: string): Promise<void> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('DELETE', `/repos/${repoIdOrOwner}/secrets/${secretOrRepo}`);
    }
    return this.request('DELETE', `/repos/${repoIdOrOwner}/${secretOrRepo}/secrets/${secret}`);
  }

  // Registry endpoints
  async listRegistries(repoId: number): Promise<unknown[]>;
  async listRegistries(owner: string, repo: string): Promise<unknown[]>;
  async listRegistries(repoIdOrOwner: number | string, repo?: string): Promise<unknown[]> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('GET', `/repos/${repoIdOrOwner}/registries`);
    }
    return this.request('GET', `/repos/${repoIdOrOwner}/${repo}/registries`);
  }

  async getRegistry(repoId: number, registry: string): Promise<unknown>;
  async getRegistry(owner: string, repo: string, registry: string): Promise<unknown>;
  async getRegistry(repoIdOrOwner: number | string, registryOrRepo: string, registry?: string): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('GET', `/repos/${repoIdOrOwner}/registries/${registryOrRepo}`);
    }
    return this.request('GET', `/repos/${repoIdOrOwner}/${registryOrRepo}/registries/${registry}`);
  }

  async createRegistry(repoId: number, data: unknown): Promise<unknown>;
  async createRegistry(owner: string, repo: string, data: unknown): Promise<unknown>;
  async createRegistry(repoIdOrOwner: number | string, dataOrRepo: unknown, data?: unknown): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('POST', `/repos/${repoIdOrOwner}/registries`, dataOrRepo);
    }
    return this.request('POST', `/repos/${repoIdOrOwner}/${dataOrRepo}/registries`, data);
  }

  async updateRegistry(repoId: number, registry: string, data: unknown): Promise<unknown>;
  async updateRegistry(owner: string, repo: string, registry: string, data: unknown): Promise<unknown>;
  async updateRegistry(repoIdOrOwner: number | string, registryOrRepo: string, dataOrRegistry?: string | unknown, data?: unknown): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('PATCH', `/repos/${repoIdOrOwner}/registries/${registryOrRepo}`, dataOrRegistry);
    }
    return this.request('PATCH', `/repos/${repoIdOrOwner}/${registryOrRepo}/registries/${dataOrRegistry}`, data);
  }

  async deleteRegistry(repoId: number, registry: string): Promise<void>;
  async deleteRegistry(owner: string, repo: string, registry: string): Promise<void>;
  async deleteRegistry(repoIdOrOwner: number | string, registryOrRepo: string, registry?: string): Promise<void> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('DELETE', `/repos/${repoIdOrOwner}/registries/${registryOrRepo}`);
    }
    return this.request('DELETE', `/repos/${repoIdOrOwner}/${registryOrRepo}/registries/${registry}`);
  }

  // Cron endpoints
  async listCrons(repoId: number): Promise<unknown[]>;
  async listCrons(owner: string, repo: string): Promise<unknown[]>;
  async listCrons(repoIdOrOwner: number | string, repo?: string): Promise<unknown[]> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('GET', `/repos/${repoIdOrOwner}/cron`);
    }
    return this.request('GET', `/repos/${repoIdOrOwner}/${repo}/cron`);
  }

  async getCron(repoId: number, cron: number): Promise<unknown>;
  async getCron(owner: string, repo: string, cron: number): Promise<unknown>;
  async getCron(repoIdOrOwner: number | string, cronOrRepo: number | string, cron?: number): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('GET', `/repos/${repoIdOrOwner}/cron/${cronOrRepo}`);
    }
    return this.request('GET', `/repos/${repoIdOrOwner}/${cronOrRepo}/cron/${cron}`);
  }

  async createCron(repoId: number, data: unknown): Promise<unknown>;
  async createCron(owner: string, repo: string, data: unknown): Promise<unknown>;
  async createCron(repoIdOrOwner: number | string, dataOrRepo: unknown, data?: unknown): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('POST', `/repos/${repoIdOrOwner}/cron`, dataOrRepo);
    }
    return this.request('POST', `/repos/${repoIdOrOwner}/${dataOrRepo}/cron`, data);
  }

  async updateCron(
    repoId: number,
    cron: number,
    data: unknown
  ): Promise<unknown>;
  async updateCron(
    owner: string,
    repo: string,
    cron: number,
    data: unknown
  ): Promise<unknown>;
  async updateCron(
    repoIdOrOwner: number | string,
    cronOrRepo: number | string,
    dataOrCron: number | unknown,
    data?: unknown
  ): Promise<unknown> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('PATCH', `/repos/${repoIdOrOwner}/cron/${cronOrRepo}`, dataOrCron);
    }
    return this.request('PATCH', `/repos/${repoIdOrOwner}/${cronOrRepo}/cron/${dataOrCron}`, data);
  }

  async deleteCron(repoId: number, cron: number): Promise<void>;
  async deleteCron(owner: string, repo: string, cron: number): Promise<void>;
  async deleteCron(repoIdOrOwner: number | string, cronOrRepo: number | string, cron?: number): Promise<void> {
    if (typeof repoIdOrOwner === 'number') {
      return this.request('DELETE', `/repos/${repoIdOrOwner}/cron/${cronOrRepo}`);
    }
    return this.request('DELETE', `/repos/${repoIdOrOwner}/${cronOrRepo}/cron/${cron}`);
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
