import type { DiscoveredLexicon } from '../atproto/discovery';

export interface GeneratedType {
  name: string;
  interface: string;
  $type: string;
  properties: Record<string, any>;
  service: string;
  collection: string;
}

export class TypeGenerator {
  private generatedTypes: Map<string, GeneratedType> = new Map();

  // Generate TypeScript interface from a discovered lexicon
  generateTypeFromLexicon(lexicon: DiscoveredLexicon): GeneratedType {
    const $type = lexicon.$type;
    
    // Skip if already generated
    if (this.generatedTypes.has($type)) {
      return this.generatedTypes.get($type)!;
    }

    const typeName = this.generateTypeName($type);
    const interfaceCode = this.generateInterfaceCode(typeName, lexicon);

    const generatedType: GeneratedType = {
      name: typeName,
      interface: interfaceCode,
      $type,
      properties: lexicon.properties,
      service: lexicon.service,
      collection: lexicon.collection
    };

    this.generatedTypes.set($type, generatedType);
    return generatedType;
  }

  // Generate type name from $type
  private generateTypeName($type: string): string {
    const parts = $type.split('#');
    if (parts.length > 1) {
      return parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
    }
    
    const lastPart = $type.split('.').pop() || 'Unknown';
    return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
  }

  // Generate TypeScript interface code
  private generateInterfaceCode(name: string, lexicon: DiscoveredLexicon): string {
    const propertyLines = Object.entries(lexicon.properties).map(([key, type]) => {
      return `  ${key}: ${type};`;
    });

    return `export interface ${name} extends CustomLexiconRecord {
  $type: '${lexicon.$type}';
${propertyLines.join('\n')}
}`;
  }

  // Generate all types from discovered lexicons
  generateTypesFromLexicons(lexicons: DiscoveredLexicon[]): GeneratedType[] {
    const types: GeneratedType[] = [];
    
    lexicons.forEach(lexicon => {
      const type = this.generateTypeFromLexicon(lexicon);
      types.push(type);
    });
    
    return types;
  }

  // Get all generated types
  getAllGeneratedTypes(): GeneratedType[] {
    return Array.from(this.generatedTypes.values());
  }

  // Generate complete types file content
  generateTypesFile(lexicons: DiscoveredLexicon[]): string {
    const types = this.generateTypesFromLexicons(lexicons);
    
    if (types.length === 0) {
      return '// No types generated';
    }

    const imports = `import type { CustomLexiconRecord } from './atproto';`;
    const interfaces = types.map(type => type.interface).join('\n\n');
    const unionType = this.generateUnionType(types);
    const serviceGroups = this.generateServiceGroups(types);

    return `${imports}

${interfaces}

${unionType}

${serviceGroups}`;
  }

  // Generate union type for all generated types
  private generateUnionType(types: GeneratedType[]): string {
    const typeNames = types.map(t => t.name);
    return `// Union type for all generated content types
export type GeneratedContentType = ${typeNames.join(' | ')};`;
  }

  // Generate service-specific type groups
  private generateServiceGroups(types: GeneratedType[]): string {
    const serviceGroups = new Map<string, GeneratedType[]>();
    
    types.forEach(type => {
      if (!serviceGroups.has(type.service)) {
        serviceGroups.set(type.service, []);
      }
      serviceGroups.get(type.service)!.push(type);
    });

    let serviceGroupsCode = '';
    serviceGroups.forEach((types, service) => {
      const typeNames = types.map(t => t.name);
      serviceGroupsCode += `
// ${service} types
export type ${this.capitalizeService(service)}ContentType = ${typeNames.join(' | ')};`;
    });

    return serviceGroupsCode;
  }

  // Capitalize service name for type name
  private capitalizeService(service: string): string {
    return service.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');
  }

  // Clear all generated types
  clear(): void {
    this.generatedTypes.clear();
  }
}

// Global type generator instance
export const typeGenerator = new TypeGenerator(); 