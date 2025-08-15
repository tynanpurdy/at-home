# Lexicon Integration Guide

This guide explains how to add support for new ATproto lexicons in your Astro website. The system provides full type safety and automatic component routing.

## Overview

The lexicon integration system consists of:

1. **Schema Files**: JSON lexicon definitions in `src/lexicons/`
2. **Type Generation**: Automatic TypeScript type generation from schemas
3. **Component Registry**: Type-safe mapping of lexicon types to Astro components
4. **Content Display**: Dynamic component routing based on record types

## Step-by-Step Guide

### 1. Add Lexicon Schema

Create a JSON schema file in `src/lexicons/` following the ATproto lexicon specification:

```json
// src/lexicons/com.example.myrecord.json
{
  "lexicon": 1,
  "id": "com.example.myrecord",
  "description": "My custom record type",
  "defs": {
    "main": {
      "type": "record",
      "key": "tid",
      "record": {
        "type": "object",
        "required": ["title", "content"],
        "properties": {
          "title": {
            "type": "string",
            "description": "The title of the record"
          },
          "content": {
            "type": "string",
            "description": "The content of the record"
          },
          "tags": {
            "type": "array",
            "items": {
              "type": "string"
            },
            "description": "Tags for the record"
          }
        }
      }
    }
  }
}
```

### 2. Update Site Configuration

Add the lexicon to your site configuration in `src/lib/config/site.ts`:

```typescript
export const defaultConfig: SiteConfig = {
  // ... existing config
  lexiconSources: {
    'com.whtwnd.blog.entry': './src/lexicons/com.whtwnd.blog.entry.json',
    'com.example.myrecord': './src/lexicons/com.example.myrecord.json', // Add your new lexicon
  },
};
```

### 3. Generate TypeScript Types

Run the type generation script:

```bash
npm run gen:types
```

This will create:
- `src/lib/generated/com-example-myrecord.ts` - Individual type definitions
- `src/lib/generated/lexicon-types.ts` - Union types and type maps

### 4. Create Your Component

Create an Astro component to display your record type. **Components receive the typed record value directly**:

```astro
---
// src/components/content/MyRecordDisplay.astro
import type { ComExampleMyrecord } from '../../lib/generated/com-example-myrecord';

interface Props {
  record: ComExampleMyrecord['value']; // Typed record value, not generic AtprotoRecord
  showAuthor?: boolean;
  showTimestamp?: boolean;
}

const { record, showAuthor = true, showTimestamp = true } = Astro.props;

// The record is already typed - no casting needed!
---

<div class="my-record-display">
  <h2 class="text-xl font-bold">{record.title}</h2>
  <p class="text-gray-600">{record.content}</p>
  
  {record.tags && record.tags.length > 0 && (
    <div class="flex flex-wrap gap-2 mt-3">
      {record.tags.map((tag: string) => (
        <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          {tag}
        </span>
      ))}
    </div>
  )}
</div>
```

### 5. Register Your Component

Add your component to the registry in `src/lib/components/registry.ts`:

```typescript
export const registry: ComponentRegistry = {
  'ComWhtwndBlogEntry': {
    component: 'WhitewindBlogPost',
    props: {}
  },
  'ComExampleMyrecord': {  // Add your new type
    component: 'MyRecordDisplay',
    props: {}
  },
  // ... other components
};
```

### 6. Use Your Component

Your component will now be automatically used when displaying records of your type:

```astro
---
import ContentDisplay from '../../components/content/ContentDisplay.astro';
import type { AtprotoRecord } from '../../lib/atproto/atproto-browser';

const records: AtprotoRecord[] = await fetchRecords();
---

{records.map(record => (
  <ContentDisplay record={record} showAuthor={true} showTimestamp={true} />
))}
```

## Type Safety Features

### Generated Types

The system generates strongly typed interfaces:

```typescript
// Generated from your schema
export interface ComExampleMyrecordRecord {
  title: string;
  content: string;
  tags?: string[];
}

export interface ComExampleMyrecord {
  $type: 'com.example.myrecord';
  value: ComExampleMyrecordRecord;
}
```

### Direct Type Access

Components receive the typed record value directly, not the generic `AtprotoRecord`:

```typescript
// ✅ Good - Direct typed access
interface Props {
  record: ComExampleMyrecord['value']; // Typed record value
}

// ❌ Avoid - Generic casting
interface Props {
  record: AtprotoRecord; // Generic record
}
const myRecord = record.value as ComExampleMyrecord['value']; // Casting needed
```

### Component Registry Types

The registry provides type-safe component lookup:

```typescript
// Type-safe component lookup
const componentInfo = getComponentInfo('ComExampleMyrecord');
// componentInfo.component will be 'MyRecordDisplay'
// componentInfo.props will be typed correctly
```

### Automatic Fallbacks

If no component is registered for a type, the system:

1. Tries to auto-assign a component name based on the NSID
2. Falls back to `GenericContentDisplay.astro` for unknown types
3. Shows debug information in development mode

## Advanced Usage

### Custom Props

You can pass custom props to your components:

```typescript
export const registry: ComponentRegistry = {
  'ComExampleMyrecord': {
    component: 'MyRecordDisplay',
    props: {
      showTags: true,
      maxTags: 5
    }
  },
};
```

### Multiple Record Types

Support multiple record types in one component:

```astro
---
// Handle multiple types in one component
const recordType = record?.$type;

if (recordType === 'com.example.type1') {
  // Handle type 1 with typed access
  const type1Record = record as ComExampleType1['value'];
} else if (recordType === 'com.example.type2') {
  // Handle type 2 with typed access
  const type2Record = record as ComExampleType2['value'];
}
---
```

### Dynamic Component Loading

The system dynamically imports components and passes typed data:

```typescript
// This happens automatically in ContentDisplay.astro
const Component = await import(`../../components/content/${componentInfo.component}.astro`);
// Component receives record.value (typed) instead of full AtprotoRecord
```

## Troubleshooting

### Type Generation Issues

If type generation fails:

1. Check your JSON schema syntax
2. Ensure the schema has a `main` record definition
3. Verify all required fields are properly defined

### Component Not Found

If your component isn't being used:

1. Check the registry mapping in `src/lib/components/registry.ts`
2. Verify the component file exists in `src/components/content/`
3. Check the component name matches the registry entry

### Type Errors

If you get TypeScript errors:

1. Regenerate types: `npm run gen:types`
2. Check that your component uses the correct generated types
3. Verify your component receives `RecordType['value']` not `AtprotoRecord`

## Best Practices

1. **Schema Design**: Follow ATproto lexicon conventions
2. **Type Safety**: Always use generated types in components
3. **Direct Access**: Components receive typed data directly, no casting needed
4. **Component Naming**: Use descriptive component names
5. **Error Handling**: Provide fallbacks for missing data
6. **Development**: Use debug mode to troubleshoot issues

## Example: Complete Integration

Here's a complete example adding support for a photo gallery lexicon:

1. **Schema**: `src/lexicons/com.example.gallery.json`
2. **Config**: Add to `lexiconSources`
3. **Types**: Run `npm run gen:types`
4. **Component**: Create `GalleryDisplay.astro` with typed props
5. **Registry**: Add mapping in `registry.ts`
6. **Usage**: Use `ContentDisplay` component

The system will automatically route gallery records to your `GalleryDisplay` component with full type safety and direct typed access.
