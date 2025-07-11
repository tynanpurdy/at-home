#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupATHome() {
  console.log('\n🏠 Welcome to AT Home Setup!\n');
  console.log('This script will help you configure your AT Protocol-powered personal website.\n');

  try {
    // Check if config file exists
    const configPath = './src/config/atproto.ts';
    if (!existsSync(configPath)) {
      console.error('❌ Config file not found. Make sure you\'re running this from the project root.');
      process.exit(1);
    }

    // Get user input
    const service = await question('🌐 AT Protocol Service URL (default: https://bsky.social): ') || 'https://bsky.social';
    const handle = await question('👤 Your AT Protocol Handle (e.g., alice.bsky.social): ');

    if (!handle) {
      console.error('❌ Handle is required!');
      process.exit(1);
    }

    const identifier = await question(`🔑 Your AT Protocol Identifier (default: ${handle}): `) || handle;
    const usePassword = await question('🔐 Do you want to use an app password for authenticated requests? (y/n): ');

    let password = '';
    if (usePassword.toLowerCase() === 'y' || usePassword.toLowerCase() === 'yes') {
      password = await question('🔒 Enter your app password (create one in Bluesky settings): ');
    }

    const siteTitle = await question(`📄 Site title (default: ${handle.split('.')[0]}'s Home): `) || `${handle.split('.')[0]}'s Home`;
    const siteDescription = await question('📝 Site description (default: Personal portfolio and blog powered by the AT Protocol): ') || 'Personal portfolio and blog powered by the AT Protocol';

    // Update config file
    let configContent = readFileSync(configPath, 'utf8');

    // Replace default values
    configContent = configContent.replace(
      "identifier: 'your-handle.bsky.social'",
      `identifier: '${identifier}'`
    );
    configContent = configContent.replace(
      "handle: 'your-handle.bsky.social'",
      `handle: '${handle}'`
    );
    configContent = configContent.replace(
      "service: 'https://bsky.social'",
      `service: '${service}'`
    );

    if (password) {
      configContent = configContent.replace(
        "// password: 'your-app-password',",
        `password: '${password}',`
      );
    }

    writeFileSync(configPath, configContent);

    // Create .env file
    const envContent = `# AT Protocol Configuration
ATPROTO_SERVICE=${service}
ATPROTO_IDENTIFIER=${identifier}
ATPROTO_HANDLE=${handle}
${password ? `ATPROTO_PASSWORD=${password}` : '# ATPROTO_PASSWORD=your-app-password'}

# Site Configuration
SITE_TITLE=${siteTitle}
SITE_DESCRIPTION=${siteDescription}
`;

    writeFileSync('.env', envContent);

    // Update astro.config.mjs with site URL if provided
    const siteUrl = await question('🌍 Your site URL (optional, for deployment): ');
    if (siteUrl) {
      const astroConfigPath = './astro.config.mjs';
      let astroConfig = readFileSync(astroConfigPath, 'utf8');
      astroConfig = astroConfig.replace(
        'site: "https://your-domain.com"',
        `site: "${siteUrl}"`
      );
      writeFileSync(astroConfigPath, astroConfig);
    }

    console.log('\n✅ Setup complete!\n');
    console.log('📁 Files updated:');
    console.log('  - src/config/atproto.ts');
    console.log('  - .env');
    if (siteUrl) {
      console.log('  - astro.config.mjs');
    }

    console.log('\n🚀 Next steps:');
    console.log('  1. Run: npm run dev');
    console.log('  2. Visit: http://localhost:4321');
    console.log('  3. Start publishing content on Bluesky or WhiteWind');
    console.log('  4. Your content will automatically appear on your site!');

    if (!password) {
      console.log('\n💡 Tip: For better functionality, consider creating an app password in your Bluesky settings.');
    }

    console.log('\n📚 Learn more:');
    console.log('  - AT Protocol: https://atproto.com');
    console.log('  - WhiteWind: https://whitewind.app');
    console.log('  - Bluesky: https://bsky.app');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run setup
setupATHome();
