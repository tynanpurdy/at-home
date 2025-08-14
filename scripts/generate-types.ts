#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { loadConfig } from '../src/lib/config/site';

interface LexiconSchema {
  lexicon: number;
  id: string;
  description?: string;
  defs: Record<string, any>;
}

function generateTypeScriptTypes(schema: LexiconSchema): string {
  const nsid = schema.id;
  const typeName = nsid.split('.').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  ).join('');
  
  const mainDef = schema.defs.main;
  if (!mainDef || mainDef.type !== 'record') {
    throw new Error(`Schema ${nsid} must have a 'main' record definition`);
  }
  
  const recordSchema = mainDef.record;
  const properties = recordSchema.properties || {};
  const required = recordSchema.required || [];
  
  // Generate property types
  const propertyTypes: string[] = [];
  
  for (const [propName, propSchema] of Object.entries(properties)) {
    const isRequired = required.includes(propName);
    const optional = isRequired ? '' : '?';
    
    let type: string;
    
    switch (propSchema.type) {
      case 'string':
        if (propSchema.enum) {
          type = propSchema.enum.map((v: string) => `'${v}'`).join(' | ');
        } else {
          type = 'string';
        }
        break;
      case 'integer':
        type = 'number';
        break;
      case 'boolean':
        type = 'boolean';
        break;
      case 'array':
        type = 'any[]'; // Could be more specific based on items schema
        break;
      case 'object':
        type = 'Record<string, any>';
        break;
      default:
        type = 'any';
    }
    
    propertyTypes.push(`  ${propName}${optional}: ${type};`);
  }
  
  return `// Generated from lexicon schema: ${nsid}
// Do not edit manually - regenerate with: npm run gen:types

export interface ${typeName}Record {
${propertyTypes.join('\n')}
}

export interface ${typeName} {
  $type: '${nsid}';
  value: ${typeName}Record;
}

// Helper type for discriminated unions
export type ${typeName}Union = ${typeName};
`;
}

async function generateTypes() {
  const config = loadConfig();
  const lexiconsDir = join(process.cwd(), 'src/lexicons');
  const generatedDir = join(process.cwd(), 'src/lib/generated');
  
  console.log('🔍 Scanning for lexicon schemas...');
  
  try {
    const files = await readdir(lexiconsDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log('No lexicon schema files found in src/lexicons/');
      return;
    }
    
    console.log(`Found ${jsonFiles.length} lexicon schema(s):`);
    
    const generatedTypes: string[] = [];
    const unionTypes: string[] = [];
    
    for (const file of jsonFiles) {
      const schemaPath = join(lexiconsDir, file);
      const schemaContent = await readFile(schemaPath, 'utf-8');
      const schema: LexiconSchema = JSON.parse(schemaContent);
      
      console.log(`  - ${schema.id} (${file})`);
      
      try {
        const typesCode = generateTypeScriptTypes(schema);
        const outputPath = join(generatedDir, `${schema.id.replace(/\./g, '-')}.ts`);
        
        await writeFile(outputPath, typesCode, 'utf-8');
        console.log(`  ✅ Generated types: ${outputPath}`);
        
        // Add to union types
        const typeName = schema.id.split('.').map(part => 
          part.charAt(0).toUpperCase() + part.slice(1)
        ).join('');
        unionTypes.push(typeName);
        generatedTypes.push(`import type { ${typeName} } from './${schema.id.replace(/\./g, '-')}';`);
        
      } catch (error) {
        console.error(`  ❌ Failed to generate types for ${schema.id}:`, error);
      }
    }
    
    // Generate index file with union types
    if (generatedTypes.length > 0) {
      const indexContent = `// Generated index of all lexicon types
// Do not edit manually - regenerate with: npm run gen:types

${generatedTypes.join('\n')}

// Union type for all generated lexicon records
export type GeneratedLexiconUnion = ${unionTypes.join(' | ')};

// Type map for component registry
export type GeneratedLexiconTypeMap = {
${unionTypes.map(type => `  '${type}': ${type};`).join('\n')}
};
`;
      
      const indexPath = join(generatedDir, 'lexicon-types.ts');
      await writeFile(indexPath, indexContent, 'utf-8');
      console.log(`  ✅ Generated index: ${indexPath}`);
    }
    
    console.log('\n🎉 Type generation complete!');
    console.log('\nNext steps:');
    console.log('1. Import the generated types in your components');
    console.log('2. Update the component registry with the new types');
    console.log('3. Create components that use the strongly typed records');
    
  } catch (error) {
    console.error('Error generating types:', error);
    process.exit(1);
  }
}

generateTypes();
