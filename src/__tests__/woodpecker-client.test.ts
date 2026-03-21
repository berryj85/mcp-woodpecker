import { WoodpeckerClient } from '../woodpecker-client';

// Mock fetch globally
global.fetch = jest.fn();

// Helper to create mock fetch responses with complete Response interface
function createMockResponse<T>(data: T, options: { ok?: boolean; status?: number; statusText?: string } = {}) {
  const { ok = true, status = 200, statusText } = options;
  
  // Default status text based on status code
  const defaultStatusText = ok ? 'OK' : getStatusText(status);
  
  return {
    ok,
    status,
    statusText: statusText || defaultStatusText,
    headers: {
      get: (name: string) => {
        if (name === 'content-type') return 'application/json';
        if (name === 'content-length') return JSON.stringify(data).length.toString();
        return null;
      },
    },
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  };
}

function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
  };
  return statusTexts[status] || 'Error';
}

describe('WoodpeckerClient', () => {
  const mockFetch = global.fetch as jest.Mock;
  const baseUrl = 'https://woodpecker.example.com';
  const token = 'test-token-123';

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('constructor', () => {
    it('should create a client with valid config', () => {
      const client = new WoodpeckerClient({ baseUrl, token });
      expect(client).toBeInstanceOf(WoodpeckerClient);
    });

    it('should strip trailing slash from baseUrl', () => {
      const client = new WoodpeckerClient({
        baseUrl: 'https://woodpecker.example.com/',
        token,
      });
      // We can verify this by checking the request is made correctly
      mockFetch.mockResolvedValueOnce(createMockResponse([]));

      client.listRepositories();
      expect(mockFetch).toHaveBeenCalledWith(
        'https://woodpecker.example.com/api/repos',
        expect.any(Object)
      );
    });
  });

  describe('request headers', () => {
    it('should include authorization header', async () => {
      const client = new WoodpeckerClient({ baseUrl, token });
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await client.getCurrentUser();

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1].headers;
      expect(headers['Authorization']).toBe(`Bearer ${token}`);
    });

    it('should include content-type header', async () => {
      const client = new WoodpeckerClient({ baseUrl, token });
      mockFetch.mockResolvedValueOnce(createMockResponse({}));

      await client.getCurrentUser();

      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs[1].headers;
      expect(headers['Content-Type']).toBe('application/json');
    });
  });

  describe('error handling', () => {
    it('should throw error on API failure', async () => {
      const client = new WoodpeckerClient({ baseUrl, token });
      mockFetch.mockResolvedValueOnce(createMockResponse(null, { ok: false, status: 401 }));

      await expect(client.getCurrentUser()).rejects.toThrow(
        'Woodpecker API error: 401 Unauthorized'
      );
    });

    it('should include error message in thrown error', async () => {
      const client = new WoodpeckerClient({ baseUrl, token });
      const errorMessage = 'Invalid credentials';
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: () => Promise.resolve(errorMessage),
      });

      await expect(client.listRepositories()).rejects.toThrow(errorMessage);
    });
  });

  describe('Repository endpoints', () => {
    let client: WoodpeckerClient;

    beforeEach(() => {
      client = new WoodpeckerClient({ baseUrl, token });
    });

    it('should list repositories', async () => {
      const mockRepos = [{ id: 1, name: 'repo1' }];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRepos));

      const result = await client.listRepositories();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockRepos);
    });

    it('should get a specific repository', async () => {
      const mockRepo = { id: 1, name: 'repo1', owner: 'user1' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRepo));

      const result = await client.getRepository('user1', 'repo1');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockRepo);
    });

    it('should activate a repository', async () => {
      const mockRepo = { id: 1, active: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRepo));

      const result = await client.activateRepository('12345');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos?forge_remote_id=12345`,
        expect.objectContaining({ method: 'POST' })
      );
      expect(result).toEqual(mockRepo);
    });

    it('should update a repository', async () => {
      const updateData = { is_trusted: true };
      const mockRepo = { id: 1, is_trusted: true };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRepo));

      const result = await client.updateRepository('user1', 'repo1', updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(mockRepo);
    });

    it('should delete a repository', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(null));

      await client.deleteRepository('user1', 'repo1');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should repair repositories', async () => {
      const mockResult = { message: 'Repair completed' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockResult));

      const result = await client.repairRepositories();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/repair`,
        expect.objectContaining({ method: 'POST' })
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('Pipeline endpoints', () => {
    let client: WoodpeckerClient;

    beforeEach(() => {
      client = new WoodpeckerClient({ baseUrl, token });
    });

    it('should list pipelines', async () => {
      const mockPipelines = [{ id: 1, number: 1, status: 'success' }];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockPipelines));

      const result = await client.listPipelines('user1', 'repo1');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/pipelines`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockPipelines);
    });

    it('should list pipelines with branch filter', async () => {
      const mockPipelines = [{ id: 1, branch: 'main' }];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockPipelines));

      await client.listPipelines('user1', 'repo1', { branch: 'main' });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/pipelines?branch=main`,
        expect.any(Object)
      );
    });

    it('should list pipelines with status filter', async () => {
      const mockPipelines = [{ id: 1, status: 'success' }];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockPipelines));

      await client.listPipelines('user1', 'repo1', { status: 'success' });

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/pipelines?status=success`,
        expect.any(Object)
      );
    });

    it('should list pipelines with multiple filters', async () => {
      const mockPipelines: unknown[] = [];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockPipelines));

      await client.listPipelines('user1', 'repo1', {
        branch: 'develop',
        status: 'running',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('branch=develop'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=running'),
        expect.any(Object)
      );
    });

    it('should get a specific pipeline', async () => {
      const mockPipeline = { id: 1, number: 1, status: 'success' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockPipeline));

      const result = await client.getPipeline('user1', 'repo1', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/pipelines/1`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockPipeline);
    });

    it('should create a pipeline', async () => {
      const createData = { branch: 'main' };
      const mockPipeline = { id: 1, number: 1, status: 'pending' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockPipeline));

      const result = await client.createPipeline('user1', 'repo1', createData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/pipelines`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createData),
        })
      );
      expect(result).toEqual(mockPipeline);
    });

    it('should cancel a pipeline', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(null));

      await client.cancelPipeline('user1', 'repo1', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/pipelines/1/cancel`,
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('should get pipeline status', async () => {
      const mockStatus = { id: 1, number: 1, status: 'success' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockStatus));

      const result = await client.getPipelineStatus('user1', 'repo1', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/pipelines/1`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockStatus);
    });

    it('should get step logs', async () => {
      const mockLogs = [{ id: 1, data: 'c3RlcCBvdXRwdXQ=' }];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockLogs));

      const result = await client.getStepLogs('user1', 'repo1', 1, 1);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/logs/1/1`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockLogs);
    });

    it('should delete pipeline logs', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(null));

      await client.deletePipelineLogs('user1', 'repo1', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/logs/1`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Secrets endpoints', () => {
    let client: WoodpeckerClient;

    beforeEach(() => {
      client = new WoodpeckerClient({ baseUrl, token });
    });

    it('should list secrets', async () => {
      const mockSecrets = [{ id: 1, name: 'API_KEY' }];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockSecrets));

      const result = await client.listSecrets('user1', 'repo1');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/secrets`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockSecrets);
    });

    it('should get a specific secret', async () => {
      const mockSecret = { id: 1, name: 'API_KEY' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockSecret));

      const result = await client.getSecret('user1', 'repo1', 'API_KEY');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/secrets/API_KEY`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockSecret);
    });

    it('should create a secret', async () => {
      const secretData = { name: 'API_KEY', value: 'secret123' };
      const mockSecret = { id: 1, ...secretData };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockSecret));

      const result = await client.createSecret('user1', 'repo1', secretData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/secrets`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(secretData),
        })
      );
      expect(result).toEqual(mockSecret);
    });

    it('should update a secret', async () => {
      const updateData = { value: 'newsecret' };
      const mockSecret = { id: 1, name: 'API_KEY', ...updateData };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockSecret));

      const result = await client.updateSecret(
        'user1',
        'repo1',
        'API_KEY',
        updateData
      );

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/secrets/API_KEY`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(mockSecret);
    });

    it('should delete a secret', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(null));

      await client.deleteSecret('user1', 'repo1', 'API_KEY');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/secrets/API_KEY`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Registry endpoints', () => {
    let client: WoodpeckerClient;

    beforeEach(() => {
      client = new WoodpeckerClient({ baseUrl, token });
    });

    it('should list registries', async () => {
      const mockRegistries = [{ id: 1, address: 'docker.io' }];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRegistries));

      const result = await client.listRegistries('user1', 'repo1');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/registries`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockRegistries);
    });

    it('should get a specific registry', async () => {
      const mockRegistry = { id: 1, address: 'docker.io' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRegistry));

      const result = await client.getRegistry('user1', 'repo1', 'docker.io');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/registries/docker.io`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockRegistry);
    });

    it('should create a registry', async () => {
      const registryData = { address: 'docker.io', username: 'user' };
      const mockRegistry = { id: 1, ...registryData };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRegistry));

      const result = await client.createRegistry('user1', 'repo1', registryData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/registries`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(registryData),
        })
      );
      expect(result).toEqual(mockRegistry);
    });

    it('should update a registry with owner/repo', async () => {
      const updateData = { username: 'newuser', password: 'newpass' };
      const mockRegistry = { id: 1, address: 'docker.io', ...updateData };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRegistry));

      const result = await client.updateRegistry(
        'user1',
        'repo1',
        'docker.io',
        updateData
      );

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/registries/docker.io`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(mockRegistry);
    });

    it('should update a registry with repoId', async () => {
      const updateData = { password: 'newpass' };
      const mockRegistry = { id: 1, address: 'gcr.io', ...updateData };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRegistry));

      const result = await client.updateRegistry(123, 'gcr.io', updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/123/registries/gcr.io`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(mockRegistry);
    });

    it('should update registry with partial data', async () => {
      const updateData = { username: 'updated' };
      const mockRegistry = { id: 1, address: 'ecr.aws', ...updateData };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockRegistry));

      const result = await client.updateRegistry(
        'org',
        'project',
        'ecr.aws',
        updateData
      );

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/org/project/registries/ecr.aws`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(mockRegistry);
    });

    it('should delete a registry', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(null));

      await client.deleteRegistry('user1', 'repo1', 'docker.io');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/registries/docker.io`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should delete a registry with repoId', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(null));

      await client.deleteRegistry(456, 'gcr.io');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/456/registries/gcr.io`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Cron endpoints', () => {
    let client: WoodpeckerClient;

    beforeEach(() => {
      client = new WoodpeckerClient({ baseUrl, token });
    });

    it('should list crons', async () => {
      const mockCrons = [{ id: 1, name: 'daily' }];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockCrons));

      const result = await client.listCrons('user1', 'repo1');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/cron`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockCrons);
    });

    it('should get a specific cron', async () => {
      const mockCron = { id: 1, name: 'daily', schedule: '0 0 * * *' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockCron));

      const result = await client.getCron('user1', 'repo1', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/cron/1`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockCron);
    });

    it('should create a cron', async () => {
      const cronData = { name: 'daily', schedule: '0 0 * * *' };
      const mockCron = { id: 1, ...cronData };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockCron));

      const result = await client.createCron('user1', 'repo1', cronData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/cron`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(cronData),
        })
      );
      expect(result).toEqual(mockCron);
    });

    it('should update a cron', async () => {
      const updateData = { schedule: '0 0 * * 0' };
      const mockCron = { id: 1, name: 'weekly', ...updateData };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockCron));

      const result = await client.updateCron('user1', 'repo1', 1, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/cron/1`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(mockCron);
    });

    it('should delete a cron', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(null));

      await client.deleteCron('user1', 'repo1', 1);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/repos/user1/repo1/cron/1`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Organization Secrets endpoints', () => {
    let client: WoodpeckerClient;

    beforeEach(() => {
      client = new WoodpeckerClient({ baseUrl, token });
    });

    it('should list organization secrets', async () => {
      const mockSecrets = [{ id: 1, name: 'ORG_KEY' }];
      mockFetch.mockResolvedValueOnce(createMockResponse(mockSecrets));

      const result = await client.listOrgSecrets('org1');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/orgs/org1/secrets`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockSecrets);
    });

    it('should get a specific organization secret', async () => {
      const mockSecret = { id: 1, name: 'ORG_KEY' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockSecret));

      const result = await client.getOrgSecret('org1', 'ORG_KEY');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/orgs/org1/secrets/ORG_KEY`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockSecret);
    });

    it('should create an organization secret', async () => {
      const secretData = { name: 'ORG_KEY', value: 'secret123' };
      const mockSecret = { id: 1, ...secretData };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockSecret));

      const result = await client.createOrgSecret('org1', secretData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/orgs/org1/secrets`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(secretData),
        })
      );
      expect(result).toEqual(mockSecret);
    });

    it('should update an organization secret', async () => {
      const updateData = { value: 'newsecret' };
      const mockSecret = { id: 1, name: 'ORG_KEY', ...updateData };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockSecret));

      const result = await client.updateOrgSecret('org1', 'ORG_KEY', updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/orgs/org1/secrets/ORG_KEY`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData),
        })
      );
      expect(result).toEqual(mockSecret);
    });

    it('should delete an organization secret', async () => {
      mockFetch.mockResolvedValueOnce(createMockResponse(null));

      await client.deleteOrgSecret('org1', 'ORG_KEY');

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/orgs/org1/secrets/ORG_KEY`,
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('User and Server endpoints', () => {
    let client: WoodpeckerClient;

    beforeEach(() => {
      client = new WoodpeckerClient({ baseUrl, token });
    });

    it('should get current user', async () => {
      const mockUser = { id: 1, name: 'testuser', login: 'testuser' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockUser));

      const result = await client.getCurrentUser();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/user`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockUser);
    });

    it('should get server info', async () => {
      const mockVersion = { version: '1.0.0' };
      mockFetch.mockResolvedValueOnce(createMockResponse(mockVersion));

      const result = await client.getServerInfo();

      expect(mockFetch).toHaveBeenCalledWith(
        `${baseUrl}/api/version`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockVersion);
    });
  });
});
