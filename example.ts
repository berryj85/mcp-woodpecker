/**
 * Example usage of MCP Woodpecker Server
 * This file demonstrates how to use the Woodpecker API client
 */

import { WoodpeckerClient } from './src/woodpecker-client.js';

// Initialize the client with your Woodpecker instance
const client = new WoodpeckerClient({
  baseUrl: process.env.WOODPECKER_URL || 'https://woodpecker.example.com',
  token: process.env.WOODPECKER_API_KEY || 'your_token_here',
});

async function examples() {
  try {
    // ============================================
    // 1. Get Server Information
    // ============================================
    console.log('📊 Server Information:');
    const serverInfo = await client.getServerInfo();
    console.log(JSON.stringify(serverInfo, null, 2));

    // ============================================
    // 2. Get Current User
    // ============================================
    console.log('\n👤 Current User:');
    const user = await client.getCurrentUser();
    console.log(JSON.stringify(user, null, 2));

    // ============================================
    // 3. List Repositories
    // ============================================
    console.log('\n📚 Repositories:');
    const repos = await client.listRepositories();
    console.log(`Found ${repos.length} repositories`);
    repos.slice(0, 3).forEach((repo: any) => {
      console.log(`  - ${repo.full_name}`);
    });

    if (repos.length > 0) {
      // Get the first repository
      const repo = repos[0] as any;
      const [owner, repoName] = repo.full_name.split('/');

      // ============================================
      // 4. Get Repository Details
      // ============================================
      console.log(`\n📋 Repository Details: ${repo.full_name}`);
      const repoDetails = await client.getRepository(owner, repoName);
      console.log(JSON.stringify(repoDetails, null, 2));

      // ============================================
      // 5. List Pipelines
      // ============================================
      console.log(`\n🔄 Recent Pipelines in ${repo.full_name}:`);
      const pipelines = await client.listPipelines(owner, repoName);
      console.log(`Found ${pipelines.length} pipelines`);
      pipelines.slice(0, 3).forEach((pipeline: any) => {
        console.log(
          `  - Pipeline #${pipeline.number}: ${pipeline.status} (${pipeline.branch})`
        );
      });

      if (pipelines.length > 0) {
        const pipeline = pipelines[0] as any;

        // ============================================
        // 6. Get Pipeline Details
        // ============================================
        console.log(
          `\n📊 Pipeline #${pipeline.number} Details:`
        );
        const pipelineDetails = await client.getPipeline(
          owner,
          repoName,
          pipeline.number
        );
        console.log(JSON.stringify(pipelineDetails, null, 2));

        // ============================================
        // 7. Get Pipeline Status
        // ============================================
        console.log(`\n✅ Pipeline #${pipeline.number} Status:`);
        const status = await client.getPipelineStatus(
          owner,
          repoName,
          pipeline.number
        );
        console.log(JSON.stringify(status, null, 2));
      }

      // ============================================
      // 8. List Secrets
      // ============================================
      console.log(`\n🔐 Secrets in ${repo.full_name}:`);
      const secrets = await client.listSecrets(owner, repoName);
      console.log(`Found ${secrets.length} secrets`);
      secrets.forEach((secret: any) => {
        console.log(`  - ${secret.name}`);
      });

      // ============================================
      // 9. Create Secret (Example - commented out)
      // ============================================
      // Uncomment to create a secret
      // console.log(`\n🔐 Creating a new secret...`);
      // const newSecret = await client.createSecret(owner, repoName, {
      //   name: 'MY_SECRET',
      //   value: 'secret_value_here',
      //   events: ['push', 'pull_request']
      // });
      // console.log('Secret created:', JSON.stringify(newSecret, null, 2));

      // ============================================
      // 10. List Registries
      // ============================================
      console.log(`\n🐳 Docker Registries in ${repo.full_name}:`);
      const registries = await client.listRegistries(owner, repoName);
      console.log(`Found ${registries.length} registries`);
      registries.forEach((registry: any) => {
        console.log(`  - ${registry.address}`);
      });

      // ============================================
      // 11. List Cron Jobs
      // ============================================
      console.log(`\n⏰ Cron Jobs in ${repo.full_name}:`);
      const crons = await client.listCrons(owner, repoName);
      console.log(`Found ${crons.length} cron jobs`);
      crons.forEach((cron: any) => {
        console.log(`  - ${cron.name}: ${cron.expr}`);
      });

      // ============================================
      // 12. List Organization Secrets
      // ============================================
      if (owner) {
        console.log(`\n🔐 Organization Secrets for ${owner}:`);
        const orgSecrets = await client.listOrgSecrets(owner);
        console.log(`Found ${orgSecrets.length} org secrets`);
        orgSecrets.forEach((secret: any) => {
          console.log(`  - ${secret.name}`);
        });
      }

      // ============================================
      // 13. Trigger Pipeline (Example - commented out)
      // ============================================
      // Uncomment to trigger a pipeline
      // console.log(`\n🚀 Triggering a new pipeline...`);
      // const newPipeline = await client.createPipeline(owner, repoName, {
      //   branch: 'main',
      //   variables: {
      //     CUSTOM_VAR: 'value'
      //   }
      // });
      // console.log('Pipeline triggered:', JSON.stringify(newPipeline, null, 2));
    }

    console.log('\n✅ Examples completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run examples
examples();
