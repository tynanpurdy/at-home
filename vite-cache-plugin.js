/**
 * Vite plugin for handling AT Protocol cache imports
 *
 * This plugin helps manage cache files during the build process.
 * It ensures that JSON cache files are properly handled during build
 * and provides fallbacks when cache files don't exist.
 */

import fs from 'fs';
import path from 'path';

/**
 * A Vite plugin that handles AT Protocol cache imports
 */
export default function atProtoCachePlugin() {
  const cacheDir = path.resolve('src/data/cache');
  const defaultCacheData = {
    'profile.json': null,
    'activity.json': [],
    'blog-posts.json': [],
    'repository-stats.json': null,
    'collections.json': [],
    'meta.json': { lastUpdated: null, dataCount: {} }
  };

  // Ensure cache directory exists
  if (!fs.existsSync(cacheDir)) {
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
      console.log(`✅ Created cache directory: ${cacheDir}`);
    } catch (error) {
      console.warn(`⚠️ Could not create cache directory: ${error.message}`);
    }
  }

  // Ensure cache files exist with at least default values
  Object.entries(defaultCacheData).forEach(([filename, defaultValue]) => {
    const filePath = path.join(cacheDir, filename);
    if (!fs.existsSync(filePath)) {
      try {
        fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
        console.log(`✅ Created default cache file: ${filename}`);
      } catch (error) {
        console.warn(`⚠️ Could not create default cache file ${filename}: ${error.message}`);
      }
    }
  });

  return {
    name: 'vite-plugin-atproto-cache',

    // Handle cache imports
    resolveId(id) {
      // Check if this is a request for a cache file
      if (id.includes('/data/cache/') && id.endsWith('.json')) {
        // Return the full path to the cache file so Vite can find it
        const fileName = path.basename(id);
        return path.join(cacheDir, fileName);
      }
      return null;
    },

    // Provide fallback for missing cache files
    load(id) {
      if (id.startsWith(cacheDir) && id.endsWith('.json')) {
        const fileName = path.basename(id);

        // If the file exists, let Vite handle it normally
        if (fs.existsSync(id)) {
          return null;
        }

        // If the file doesn't exist, provide the default value
        if (fileName in defaultCacheData) {
          console.log(`⚠️ Using default value for missing cache file: ${fileName}`);
          return `export default ${JSON.stringify(defaultCacheData[fileName])};`;
        }
      }
      return null;
    },

    // During build, log cache status
    buildStart() {
      console.log(`🔍 AT Protocol Cache plugin initialized`);
      const cacheFiles = fs.readdirSync(cacheDir).filter(file => file.endsWith('.json'));
      console.log(`📦 Found ${cacheFiles.length} cache files: ${cacheFiles.join(', ')}`);
    }
  };
}
