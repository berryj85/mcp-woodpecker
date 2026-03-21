#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WoodpeckerClient } from './woodpecker-client.js';

/**
 * Woodpecker CI MCP Server
 * Provides comprehensive API tools for managing Woodpecker CI
 */

const woodpeckerUrl = process.env.WOODPECKER_URL || '';
const woodpeckerToken = process.env.WOODPECKER_API_KEY || '';

if (!woodpeckerUrl || !woodpeckerToken) {
  console.error(
    'Error: WOODPECKER_URL and WOODPECKER_API_KEY environment variables are required'
  );
  process.exit(1);
}

const client = new WoodpeckerClient({
  baseUrl: woodpeckerUrl,
  token: woodpeckerToken,
});

const server = new Server(
  {
    name: 'mcp-woodpecker',
    version: '1.1.1',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools: Tool[] = [
  // Repository Tools
  {
    name: 'list_repositories',
    description: 'List all repositories available to the authenticated user',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_repository',
    description: 'Get details of a specific repository',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
      },
      required: ['repoId'],
    },
  },
  {
    name: 'activate_repository',
    description: 'Activate a repository in Woodpecker using the forge remote ID',
    inputSchema: {
      type: 'object',
      properties: {
        forgeRemoteId: {
          type: 'string',
          description: 'The repository ID at the forge (e.g. GitHub repository ID)',
        },
      },
      required: ['forgeRemoteId'],
    },
  },
  {
    name: 'update_repository',
    description: 'Update repository settings (visibility, trusted, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        owner: {
          type: 'string',
          description: 'Repository owner/organization',
        },
        repo: {
          type: 'string',
          description: 'Repository name',
        },
        is_trusted: {
          type: 'boolean',
          description: 'Whether the repository is trusted',
        },
        visibility: {
          type: 'string',
          enum: ['public', 'private'],
          description: 'Repository visibility',
        },
        config_path: {
          type: 'string',
          description: 'Path to the .woodpecker.yml file',
        },
      },
      required: ['repoId'],
    },
  },
  {
    name: 'delete_repository',
    description: 'Delete a repository from Woodpecker',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
      },
      required: ['repoId'],
    },
  },

  // Pipeline Tools
  {
    name: 'list_pipelines',
    description:
      'List pipelines for a repository with optional filtering by branch or status',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        branch: {
          type: 'string',
          description: 'Filter by branch name (optional)',
        },
        status: {
          type: 'string',
          enum: ['success', 'failure', 'pending', 'running', 'blocked'],
          description: 'Filter by pipeline status (optional)',
        },
      },
      required: ['repoId'],
    },
  },
  {
    name: 'get_pipeline',
    description: 'Get details of a specific pipeline',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        number: {
          type: 'number',
          description: 'Pipeline number',
        },
      },
      required: ['repoId', 'number'],
    },
  },
  {
    name: 'get_pipeline_status',
    description: 'Get the status badge data for a pipeline',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        number: {
          type: 'number',
          description: 'Pipeline number',
        },
      },
      required: ['repoId', 'number'],
    },
  },
  {
    name: 'trigger_pipeline',
    description: 'Trigger a new pipeline run',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        branch: {
          type: 'string',
          description: 'Git branch to trigger pipeline on',
        },
        variables: {
          type: 'object',
          description: 'Environment variables for the pipeline',
        },
      },
      required: ['repoId', 'branch'],
    },
  },
  {
    name: 'cancel_pipeline',
    description: 'Cancel a running pipeline',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        number: {
          type: 'number',
          description: 'Pipeline number',
        },
      },
      required: ['repoId', 'number'],
    },
  },
  {
    name: 'get_pipeline_logs',
    description: 'Get logs from a specific pipeline step',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        number: {
          type: 'number',
          description: 'Pipeline number',
        },
        step: {
          type: 'number',
          description: 'Step number',
        },
      },
      required: ['repoId', 'number', 'step'],
    },
  },
  {
    name: 'delete_pipeline_logs',
    description: 'Delete logs for a pipeline',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        number: {
          type: 'number',
          description: 'Pipeline number',
        },
      },
      required: ['repoId', 'number'],
    },
  },

  // Secret Tools
  {
    name: 'list_secrets',
    description: 'List all secrets in a repository',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
      },
      required: ['repoId'],
    },
  },
  {
    name: 'get_secret',
    description: 'Get details of a specific secret',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        secret: {
          type: 'string',
          description: 'Secret name',
        },
      },
      required: ['repoId', 'secret'],
    },
  },
  {
    name: 'create_secret',
    description: 'Create a new secret in a repository',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        name: {
          type: 'string',
          description: 'Secret name',
        },
        value: {
          type: 'string',
          description: 'Secret value',
        },
        events: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Events that trigger this secret (push, pull_request, tag, deployment, cron)',
        },
      },
      required: ['repoId', 'name', 'value'],
    },
  },
  {
    name: 'update_secret',
    description: 'Update an existing secret',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        secret: {
          type: 'string',
          description: 'Secret name',
        },
        value: {
          type: 'string',
          description: 'New secret value',
        },
        events: {
          type: 'array',
          items: { type: 'string' },
          description: 'Events that trigger this secret',
        },
      },
      required: ['repoId', 'secret'],
    },
  },
  {
    name: 'delete_secret',
    description: 'Delete a secret from a repository',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        secret: {
          type: 'string',
          description: 'Secret name',
        },
      },
      required: ['repoId', 'secret'],
    },
  },

  // Registry Tools
  {
    name: 'list_registries',
    description: 'List all Docker registries configured for a repository',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
      },
      required: ['repoId'],
    },
  },
  {
    name: 'get_registry',
    description: 'Get details of a specific Docker registry',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        registry: {
          type: 'string',
          description: 'Registry address/hostname',
        },
      },
      required: ['repoId', 'registry'],
    },
  },
  {
    name: 'create_registry',
    description: 'Create a new Docker registry configuration',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        address: {
          type: 'string',
          description: 'Registry hostname/address',
        },
        username: {
          type: 'string',
          description: 'Registry username',
        },
        password: {
          type: 'string',
          description: 'Registry password/token',
        },
      },
      required: ['repoId', 'address', 'username', 'password'],
    },
  },
  {
    name: 'delete_registry',
    description: 'Delete a Docker registry configuration',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        registry: {
          type: 'string',
          description: 'Registry address/hostname',
        },
      },
      required: ['repoId', 'registry'],
    },
  },

  // Cron Tools
  {
    name: 'list_crons',
    description: 'List all cron jobs configured for a repository',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
      },
      required: ['repoId'],
    },
  },
  {
    name: 'get_cron',
    description: 'Get details of a specific cron job',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        cron: {
          type: 'number',
          description: 'Cron job ID',
        },
      },
      required: ['repoId', 'cron'],
    },
  },
  {
    name: 'create_cron',
    description: 'Create a new cron job for scheduled pipeline execution',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        name: {
          type: 'string',
          description: 'Cron job name',
        },
        expr: {
          type: 'string',
          description: 'Cron expression (e.g., "0 0 * * *" for daily at midnight)',
        },
        branch: {
          type: 'string',
          description: 'Branch to run the cron job on',
        },
      },
      required: ['repoId', 'name', 'expr', 'branch'],
    },
  },
  {
    name: 'update_cron',
    description: 'Update a cron job configuration',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        cron: {
          type: 'number',
          description: 'Cron job ID',
        },
        name: {
          type: 'string',
          description: 'Cron job name',
        },
        expr: {
          type: 'string',
          description: 'Cron expression',
        },
        branch: {
          type: 'string',
          description: 'Branch to run on',
        },
      },
      required: ['repoId', 'cron'],
    },
  },
  {
    name: 'delete_cron',
    description: 'Delete a cron job',
    inputSchema: {
      type: 'object',
      properties: {
        repoId: {
          type: 'number',
          description: 'Repository ID',
        },
        cron: {
          type: 'number',
          description: 'Cron job ID',
        },
      },
      required: ['repoId', 'cron'],
    },
  },

  // Organization Tools
  {
    name: 'lookup_organization',
    description: 'Look up an organization by its full name/slug to get its numeric ID (required for org secret operations)',
    inputSchema: {
      type: 'object',
      properties: {
        orgFullName: {
          type: 'string',
          description: 'Organization full name or slug (e.g. "my-org")',
        },
      },
      required: ['orgFullName'],
    },
  },

  // Organization Secret Tools
  {
    name: 'list_org_secrets',
    description: 'List all organization-level secrets. Use lookup_organization first to get the numeric orgId.',
    inputSchema: {
      type: 'object',
      properties: {
        orgId: {
          type: 'number',
          description: 'Organization numeric ID (use lookup_organization to find this)',
        },
      },
      required: ['orgId'],
    },
  },
  {
    name: 'get_org_secret',
    description: 'Get details of a specific organization secret',
    inputSchema: {
      type: 'object',
      properties: {
        orgId: {
          type: 'number',
          description: 'Organization numeric ID',
        },
        secret: {
          type: 'string',
          description: 'Secret name',
        },
      },
      required: ['orgId', 'secret'],
    },
  },
  {
    name: 'create_org_secret',
    description: 'Create a new organization-level secret',
    inputSchema: {
      type: 'object',
      properties: {
        orgId: {
          type: 'number',
          description: 'Organization numeric ID',
        },
        name: {
          type: 'string',
          description: 'Secret name',
        },
        value: {
          type: 'string',
          description: 'Secret value',
        },
      },
      required: ['orgId', 'name', 'value'],
    },
  },
  {
    name: 'update_org_secret',
    description: 'Update an organization-level secret',
    inputSchema: {
      type: 'object',
      properties: {
        orgId: {
          type: 'number',
          description: 'Organization numeric ID',
        },
        secret: {
          type: 'string',
          description: 'Secret name',
        },
        value: {
          type: 'string',
          description: 'New secret value',
        },
      },
      required: ['orgId', 'secret', 'value'],
    },
  },
  {
    name: 'delete_org_secret',
    description: 'Delete an organization-level secret',
    inputSchema: {
      type: 'object',
      properties: {
        orgId: {
          type: 'number',
          description: 'Organization numeric ID',
        },
        secret: {
          type: 'string',
          description: 'Secret name',
        },
      },
      required: ['orgId', 'secret'],
    },
  },

  // User Info Tools
  {
    name: 'get_current_user',
    description: 'Get information about the currently authenticated user',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const toolName = request.params.name;
  const toolInput = request.params.arguments as Record<string, unknown>;

  try {
    let result;

    // Repository operations
    if (toolName === 'list_repositories') {
      result = await client.listRepositories();
    } else if (toolName === 'get_repository') {
      result = await client.getRepository(toolInput.repoId as number);
    } else if (toolName === 'activate_repository') {
      result = await client.activateRepository(toolInput.forgeRemoteId as string);
    } else if (toolName === 'update_repository') {
      const data: Record<string, unknown> = {};
      if (toolInput.is_trusted !== undefined)
        data.is_trusted = toolInput.is_trusted;
      if (toolInput.visibility) data.visibility = toolInput.visibility;
      if (toolInput.config_path) data.config_path = toolInput.config_path;
      result = await client.updateRepository(toolInput.repoId as number, data);
    } else if (toolName === 'delete_repository') {
      result = await client.deleteRepository(toolInput.repoId as number);
      result = { status: 'Repository deleted successfully' };
    }

    // Pipeline operations
    else if (toolName === 'list_pipelines') {
      result = await client.listPipelines(toolInput.repoId as number, {
        branch: toolInput.branch as string | undefined,
        status: toolInput.status as string | undefined,
      });
    } else if (toolName === 'get_pipeline') {
      result = await client.getPipeline(
        toolInput.repoId as number,
        toolInput.number as number
      );
    } else if (toolName === 'get_pipeline_status') {
      result = await client.getPipelineStatus(
        toolInput.repoId as number,
        toolInput.number as number
      );
    } else if (toolName === 'trigger_pipeline') {
      result = await client.createPipeline(toolInput.repoId as number, {
        branch: toolInput.branch,
        variables: toolInput.variables,
      });
    } else if (toolName === 'cancel_pipeline') {
      result = await client.cancelPipeline(
        toolInput.repoId as number,
        toolInput.number as number
      );
      result = { status: 'Pipeline cancelled successfully' };
    } else if (toolName === 'get_pipeline_logs') {
      result = await client.getStepLogs(
        toolInput.repoId as number,
        toolInput.number as number,
        toolInput.step as number
      );
    } else if (toolName === 'delete_pipeline_logs') {
      result = await client.deletePipelineLogs(
        toolInput.repoId as number,
        toolInput.number as number
      );
      result = { status: 'Pipeline logs deleted successfully' };
    }

    // Secret operations
    else if (toolName === 'list_secrets') {
      result = await client.listSecrets(toolInput.repoId as number);
    } else if (toolName === 'get_secret') {
      result = await client.getSecret(
        toolInput.repoId as number,
        toolInput.secret as string
      );
    } else if (toolName === 'create_secret') {
      result = await client.createSecret(toolInput.repoId as number, {
        name: toolInput.name,
        value: toolInput.value,
        events: toolInput.events,
      });
    } else if (toolName === 'update_secret') {
      const secretData: Record<string, unknown> = {};
      if (toolInput.value !== undefined) secretData.value = toolInput.value;
      if (toolInput.events) secretData.events = toolInput.events;
      result = await client.updateSecret(
        toolInput.repoId as number,
        toolInput.secret as string,
        secretData
      );
    } else if (toolName === 'delete_secret') {
      result = await client.deleteSecret(
        toolInput.repoId as number,
        toolInput.secret as string
      );
      result = { status: 'Secret deleted successfully' };
    }

    // Registry operations
    else if (toolName === 'list_registries') {
      result = await client.listRegistries(toolInput.repoId as number);
    } else if (toolName === 'get_registry') {
      result = await client.getRegistry(
        toolInput.repoId as number,
        toolInput.registry as string
      );
    } else if (toolName === 'create_registry') {
      result = await client.createRegistry(toolInput.repoId as number, {
        address: toolInput.address,
        username: toolInput.username,
        password: toolInput.password,
      });
    } else if (toolName === 'delete_registry') {
      result = await client.deleteRegistry(
        toolInput.repoId as number,
        toolInput.registry as string
      );
      result = { status: 'Registry deleted successfully' };
    }

    // Cron operations
    else if (toolName === 'list_crons') {
      result = await client.listCrons(toolInput.repoId as number);
    } else if (toolName === 'get_cron') {
      result = await client.getCron(
        toolInput.repoId as number,
        toolInput.cron as number
      );
    } else if (toolName === 'create_cron') {
      result = await client.createCron(toolInput.repoId as number, {
        name: toolInput.name,
        schedule: toolInput.expr,
        branch: toolInput.branch,
      });
    } else if (toolName === 'update_cron') {
      const cronData: Record<string, unknown> = {};
      if (toolInput.name !== undefined) cronData.name = toolInput.name;
      if (toolInput.expr !== undefined) cronData.schedule = toolInput.expr;
      if (toolInput.branch !== undefined) cronData.branch = toolInput.branch;
      result = await client.updateCron(
        toolInput.repoId as number,
        toolInput.cron as number,
        cronData
      );
    } else if (toolName === 'delete_cron') {
      result = await client.deleteCron(
        toolInput.repoId as number,
        toolInput.cron as number
      );
      result = { status: 'Cron job deleted successfully' };
    }

    // Organization operations
    else if (toolName === 'lookup_organization') {
      result = await client.lookupOrganization(toolInput.orgFullName as string);
    }

    // Organization secret operations
    else if (toolName === 'list_org_secrets') {
      result = await client.listOrgSecrets(toolInput.orgId as number);
    } else if (toolName === 'get_org_secret') {
      result = await client.getOrgSecret(
        toolInput.orgId as number,
        toolInput.secret as string
      );
    } else if (toolName === 'create_org_secret') {
      result = await client.createOrgSecret(toolInput.orgId as number, {
        name: toolInput.name,
        value: toolInput.value,
      });
    } else if (toolName === 'update_org_secret') {
      result = await client.updateOrgSecret(
        toolInput.orgId as number,
        toolInput.secret as string,
        { value: toolInput.value }
      );
    } else if (toolName === 'delete_org_secret') {
      result = await client.deleteOrgSecret(
        toolInput.orgId as number,
        toolInput.secret as string
      );
      result = { status: 'Organization secret deleted successfully' };
    }

    // User info
    else if (toolName === 'get_current_user') {
      result = await client.getCurrentUser();
    } else {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Woodpecker MCP server running on stdio');
}

main().catch(console.error);
