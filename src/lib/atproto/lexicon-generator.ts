// Lexicon generator based on ATProto browser discovery
import { AtprotoBrowser, type AtprotoRecord } from './atproto-browser';

export interface LexiconDefinition {
  $type: string;
  collection: string;
  properties: Record<string, any>;
  sampleRecord: AtprotoRecord;
  description: string;
}

export interface GeneratedTypes {
  lexicons: LexiconDefinition[];
  typeDefinitions: string;
  collectionTypes: Record<string, string[]>;
}

export class LexiconGenerator {
  private browser: AtprotoBrowser;

  constructor() {
    this.browser = new AtprotoBrowser();
  }

  // Generate types for all lexicons in a repository
  async generateTypesForRepository(identifier: string): Promise<GeneratedTypes> {
    console.log('🔍 Generating types for repository:', identifier);
    
    const lexicons: LexiconDefinition[] = [];
    const collectionTypes: Record<string, string[]> = {};

    try {
      // Get all collections in the repository
      const collections = await this.browser.getAllCollections(identifier);
      console.log(`📊 Found ${collections.length} collections:`, collections);

      // Analyze each collection
      for (const collection of collections) {
        console.log(`🔍 Analyzing collection: ${collection}`);
        
        try {
          const collectionInfo = await this.browser.getCollectionRecords(identifier, collection, 100);
          if (collectionInfo && collectionInfo.records.length > 0) {
            // Group records by type
            const typeGroups = new Map<string, AtprotoRecord[]>();
            
            collectionInfo.records.forEach(record => {
              const $type = record.$type;
              if (!typeGroups.has($type)) {
                typeGroups.set($type, []);
              }
              typeGroups.get($type)!.push(record);
            });

            // Create lexicon definitions for each type
            typeGroups.forEach((records, $type) => {
              const sampleRecord = records[0];
              const properties = this.extractProperties(sampleRecord.value);
              
              const lexicon: LexiconDefinition = {
                $type,
                collection,
                properties,
                sampleRecord,
                description: `Discovered in collection ${collection}`
              };
              
              lexicons.push(lexicon);
              
              // Track collection types
              if (!collectionTypes[collection]) {
                collectionTypes[collection] = [];
              }
              collectionTypes[collection].push($type);
              
              console.log(`✅ Generated lexicon for ${$type} in ${collection}`);
            });
          }
        } catch (error) {
          console.error(`❌ Error analyzing collection ${collection}:`, error);
        }
      }

      // Generate TypeScript type definitions
      const typeDefinitions = this.generateTypeScriptTypes(lexicons, collectionTypes);
      
      console.log(`🎉 Generated ${lexicons.length} lexicon definitions`);
      
      return {
        lexicons,
        typeDefinitions,
        collectionTypes
      };

    } catch (error) {
      console.error('Error generating types:', error);
      throw error;
    }
  }

  // Extract properties from a record value
  private extractProperties(value: any): Record<string, any> {
    const properties: Record<string, any> = {};
    
    if (value && typeof value === 'object') {
      Object.keys(value).forEach(key => {
        if (key !== '$type') {
          properties[key] = {
            type: typeof value[key],
            value: value[key]
          };
        }
      });
    }
    
    return properties;
  }

  // Generate TypeScript type definitions
  private generateTypeScriptTypes(lexicons: LexiconDefinition[], collectionTypes: Record<string, string[]>): string {
    let types = '// Auto-generated TypeScript types for discovered lexicons\n';
    types += '// Generated from ATProto repository analysis\n\n';

    // Generate interfaces for each lexicon
    lexicons.forEach(lexicon => {
      const interfaceName = this.generateInterfaceName(lexicon.$type);
      types += `export interface ${interfaceName} {\n`;
      types += `  $type: '${lexicon.$type}';\n`;
      
      Object.entries(lexicon.properties).forEach(([key, prop]) => {
        const type = this.getTypeScriptType(prop.type, prop.value);
        types += `  ${key}: ${type};\n`;
      });
      
      types += '}\n\n';
    });

    // Generate collection type mappings
    types += '// Collection type mappings\n';
    types += 'export interface CollectionTypes {\n';
    Object.entries(collectionTypes).forEach(([collection, types]) => {
      types += `  '${collection}': ${types.map(t => `'${t}'`).join(' | ')};\n`;
    });
    types += '}\n\n';

    // Generate union types for all lexicons
    const allTypes = lexicons.map(l => this.generateInterfaceName(l.$type));
    types += `export type AllLexicons = ${allTypes.join(' | ')};\n\n`;

    // Generate helper functions
    types += '// Helper functions\n';
    types += 'export function isLexiconType(record: any, type: string): boolean {\n';
    types += '  return record?.$type === type;\n';
    types += '}\n\n';

    types += 'export function getCollectionTypes(collection: string): string[] {\n';
    types += '  const collectionTypes: Record<string, string[]> = {\n';
    Object.entries(collectionTypes).forEach(([collection, types]) => {
      types += `    '${collection}': [${types.map(t => `'${t}'`).join(', ')}],\n`;
    });
    types += '  };\n';
    types += '  return collectionTypes[collection] || [];\n';
    types += '}\n';

    return types;
  }

  // Generate interface name from lexicon type
  private generateInterfaceName($type: string): string {
    // Convert lexicon type to PascalCase interface name
    // e.g., "app.bsky.feed.post" -> "AppBskyFeedPost"
    return $type
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }

  // Get TypeScript type from JavaScript type and value
  private getTypeScriptType(jsType: string, value: any): string {
    switch (jsType) {
      case 'string':
        return 'string';
      case 'number':
        return typeof value === 'number' && Number.isInteger(value) ? 'number' : 'number';
      case 'boolean':
        return 'boolean';
      case 'object':
        if (Array.isArray(value)) {
          return 'any[]';
        }
        return 'Record<string, any>';
      default:
        return 'any';
    }
  }

  // Save generated types to a file
  async saveTypesToFile(identifier: string, outputPath: string): Promise<void> {
    try {
      const generated = await this.generateTypesForRepository(identifier);
      
      // Create the file content
      const fileContent = `// Auto-generated types for ${identifier}\n`;
      const fileContent += `// Generated on ${new Date().toISOString()}\n\n`;
      const fileContent += generated.typeDefinitions;
      
      // In a real implementation, you'd write to the file system
      console.log('📝 Generated types:', fileContent);
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error saving types to file:', error);
      throw error;
    }
  }
} 