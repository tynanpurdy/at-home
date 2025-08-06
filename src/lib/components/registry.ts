import type { ContentComponent } from '../types/atproto';

// Component registry for type-safe content rendering
class ComponentRegistry {
  private components = new Map<string, ContentComponent>();

  // Register a component for a specific content type
  register(type: string, component: any, props?: Record<string, any>): void {
    this.components.set(type, {
      type,
      component,
      props,
    });
  }

  // Get a component for a specific content type
  get(type: string): ContentComponent | undefined {
    return this.components.get(type);
  }

  // Check if a component exists for a content type
  has(type: string): boolean {
    return this.components.has(type);
  }

  // Get all registered component types
  getRegisteredTypes(): string[] {
    return Array.from(this.components.keys());
  }

  // Clear all registered components
  clear(): void {
    this.components.clear();
  }
}

// Global component registry instance
export const componentRegistry = new ComponentRegistry();

// Type-safe component registration helper
export function registerComponent(
  type: string,
  component: any,
  props?: Record<string, any>
): void {
  componentRegistry.register(type, component, props);
}

// Type-safe component retrieval helper
export function getComponent(type: string): ContentComponent | undefined {
  return componentRegistry.get(type);
}

// Check if content type has a registered component
export function hasComponent(type: string): boolean {
  return componentRegistry.has(type);
} 