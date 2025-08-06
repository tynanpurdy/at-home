import { AtprotoBrowser } from '../atproto/atproto-browser';
import { loadConfig } from '../config/site';
import fs from 'fs/promises';
import path from 'path';

export interface CollectionType {
  name: string;
  description: string;
  service: string;
  sampleRecords: any[];
  generatedTypes: string;
  $types: string[];
}

export interface BuildTimeDiscovery {
  collections: CollectionType[];
  totalCollections: number;
  totalRecords: number;
  generatedAt: string;
  repository: {
    handle: string;
    did: string;
    recordCount: number;
  };
}

export class CollectionDiscovery {
  private browser: AtprotoBrowser;
  private config: any;

  constructor() {
    this.config = loadConfig();
    this.browser = new AtprotoBrowser();
  }

  // Discover all collections and generate types
  async discoverCollections(identifier: string): Promise<BuildTimeDiscovery> {
    console.log('🔍 Starting collection discovery for:', identifier);
    
    try {
      // Get repository info
      const repoInfo = await this.browser.getRepoInfo(identifier);
      if (!repoInfo) {
        throw new Error(`Could not get repository info for: ${identifier}`);
      }

      console.log('📊 Repository info:', {
        handle: repoInfo.handle,
        did: repoInfo.did,
        collections: repoInfo.collections.length,
        recordCount: repoInfo.recordCount
      });

      const collections: CollectionType[] = [];
      let totalRecords = 0;

      // Process each collection
      for (const collectionName of repoInfo.collections) {
        console.log(`📦 Processing collection: ${collectionName}`);
        
        const collectionType = await this.processCollection(identifier, collectionName);
        if (collectionType) {
          collections.push(collectionType);
          totalRecords += collectionType.sampleRecords.length;
        }
      }

      const discovery: BuildTimeDiscovery = {
        collections,
        totalCollections: collections.length,
        totalRecords,
        generatedAt: new Date().toISOString(),
        repository: {
          handle: repoInfo.handle,
          did: repoInfo.did,
          recordCount: repoInfo.recordCount
        }
      };

      console.log(`✅ Discovery complete: ${collections.length} collections, ${totalRecords} records`);
      return discovery;

    } catch (error) {
      console.error('Error discovering collections:', error);
      throw error;
    }
  }

  // Process a single collection
  private async processCollection(identifier: string, collectionName: string): Promise<CollectionType | null> {
    try {
      // Get records from collection
      const records = await this.browser.getCollectionRecords(identifier, collectionName, 10);
      if (!records || records.records.length === 0) {
        console.log(`⚠️ No records found in collection: ${collectionName}`);
        return null;
      }

      // Group records by $type
      const recordsByType = new Map<string, any[]>();
      for (const record of records.records) {
        const $type = record.$type || 'unknown';
        if (!recordsByType.has($type)) {
          recordsByType.set($type, []);
        }
        recordsByType.get($type)!.push(record.value);
      }

      // Generate types for each $type
      const generatedTypes: string[] = [];
      const $types: string[] = [];

      for (const [$type, typeRecords] of recordsByType) {
        if ($type === 'unknown') continue;
        
        $types.push($type);
        const typeDefinition = this.generateTypeDefinition($type, typeRecords);
        generatedTypes.push(typeDefinition);
      }

      // Create collection type
      const collectionType: CollectionType = {
        name: collectionName,
        description: this.getCollectionDescription(collectionName),
        service: this.inferService(collectionName),
        sampleRecords: records.records.slice(0, 3).map(r => r.value),
        generatedTypes: generatedTypes.join('\n\n'),
        $types
      };

      console.log(`✅ Processed collection ${collectionName}: ${$types.length} types`);
      return collectionType;

    } catch (error) {
      console.error(`Error processing collection ${collectionName}:`, error);
      return null;
    }
  }

  // Generate TypeScript type definition
  private generateTypeDefinition($type: string, records: any[]): string {
    if (records.length === 0) return '';

    // Analyze the first record to understand the structure
    const sampleRecord = records[0];
    const properties = this.extractProperties(sampleRecord);
    
    // Generate interface
    const interfaceName = this.$typeToInterfaceName($type);
    let typeDefinition = `export interface ${interfaceName} {\n`;
    
    // Add $type property
    typeDefinition += `  $type: '${$type}';\n`;
    
    // Add other properties
    for (const [key, value] of Object.entries(properties)) {
      const type = this.inferType(value);
      typeDefinition += `  ${key}?: ${type};\n`;
    }
    
    typeDefinition += '}\n';
    
    return typeDefinition;
  }

  // Extract properties from a record
  private extractProperties(obj: any, maxDepth: number = 3, currentDepth: number = 0): Record<string, any> {
    if (currentDepth >= maxDepth || !obj || typeof obj !== 'object') {
      return {};
    }

    const properties: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (key === '$type') continue; // Skip $type as it's handled separately
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Nested object
        const nestedProps = this.extractProperties(value, maxDepth, currentDepth + 1);
        if (Object.keys(nestedProps).length > 0) {
          properties[key] = nestedProps;
        }
      } else {
        // Simple property
        properties[key] = value;
      }
    }
    
    return properties;
  }

  // Infer TypeScript type from value
  private inferType(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    const type = typeof value;
    
    switch (type) {
      case 'string':
        return 'string';
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'object':
        if (Array.isArray(value)) {
          if (value.length === 0) return 'any[]';
          const elementType = this.inferType(value[0]);
          return `${elementType}[]`;
        }
        return 'Record<string, any>';
      default:
        return 'any';
    }
  }

  // Convert $type to interface name
  private $typeToInterfaceName($type: string): string {
    // Convert app.bsky.feed.post to AppBskyFeedPost
    return $type
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  // Get collection description
  private getCollectionDescription(collectionName: string): string {
    const descriptions: Record<string, string> = {
      'app.bsky.feed.post': 'Bluesky posts',
      'app.bsky.actor.profile': 'Bluesky profile information',
      'app.bsky.feed.generator': 'Bluesky custom feeds',
      'app.bsky.graph.follow': 'Bluesky follow relationships',
      'app.bsky.graph.block': 'Bluesky block relationships',
      'app.bsky.feed.like': 'Bluesky like records',
      'app.bsky.feed.repost': 'Bluesky repost records',
      'social.grain.gallery': 'Grain.social image galleries',
      'grain.social.feed.gallery': 'Grain.social galleries',
      'grain.social.feed.post': 'Grain.social posts',
      'grain.social.actor.profile': 'Grain.social profile information',
    };
    
    return descriptions[collectionName] || `${collectionName} records`;
  }

  // Infer service from collection name
  private inferService(collectionName: string): string {
    if (collectionName.startsWith('grain.social') || collectionName.startsWith('social.grain')) {
      return 'grain.social';
    }
    if (collectionName.startsWith('app.bsky')) {
      return 'bsky.app';
    }
    if (collectionName.startsWith('sh.tangled')) {
      return 'sh.tangled';
    }
    return 'unknown';
  }

  // Save discovery results to file
  async saveDiscoveryResults(discovery: BuildTimeDiscovery, outputPath: string): Promise<void> {
    try {
      // Create output directory if it doesn't exist
      const outputDir = path.dirname(outputPath);
      await fs.mkdir(outputDir, { recursive: true });

      // Save discovery metadata
      const metadataPath = outputPath.replace('.ts', '.json');
      await fs.writeFile(metadataPath, JSON.stringify(discovery, null, 2));

      // Generate TypeScript file with all types
      let typesContent = '// Auto-generated types from collection discovery\n';
      typesContent += `// Generated at: ${discovery.generatedAt}\n`;
      typesContent += `// Repository: ${discovery.repository.handle} (${discovery.repository.did})\n`;
      typesContent += `// Collections: ${discovery.totalCollections}, Records: ${discovery.totalRecords}\n\n`;

      // Add all generated types
      for (const collection of discovery.collections) {
        typesContent += `// Collection: ${collection.name}\n`;
        typesContent += `// Service: ${collection.service}\n`;
        typesContent += `// Types: ${collection.$types.join(', ')}\n`;
        typesContent += collection.generatedTypes;
        typesContent += '\n\n';
      }

      // Add union type for all discovered types
      const allTypes = discovery.collections.flatMap(c => c.$types);
      if (allTypes.length > 0) {
        typesContent += '// Union type for all discovered types\n';
        typesContent += `export type DiscoveredTypes = ${allTypes.map(t => `'${t}'`).join(' | ')};\n\n`;
      }

      await fs.writeFile(outputPath, typesContent);
      
      console.log(`💾 Saved discovery results to: ${outputPath}`);
      console.log(`📊 Generated ${discovery.totalCollections} collection types`);

    } catch (error) {
      console.error('Error saving discovery results:', error);
      throw error;
    }
  }
} 