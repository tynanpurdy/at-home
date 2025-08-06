import { registerComponent } from './registry';
import BlueskyPost from '../../components/content/BlueskyPost.astro';
import WhitewindBlogPost from '../../components/content/WhitewindBlogPost.astro';
import LeafletPublication from '../../components/content/LeafletPublication.astro';
import GrainImageGallery from '../../components/content/GrainImageGallery.astro';

// Register all content components
export function registerAllComponents() {
  // Register Bluesky post component
  registerComponent('app.bsky.feed.post', BlueskyPost);
  
  // Register Whitewind blog post component
  registerComponent('app.bsky.actor.profile#whitewindBlogPost', WhitewindBlogPost);
  
  // Register Leaflet publication component
  registerComponent('app.bsky.actor.profile#leafletPublication', LeafletPublication);
  
  // Register Grain image gallery component
  registerComponent('app.bsky.actor.profile#grainImageGallery', GrainImageGallery);
}

// Auto-register components when this module is imported
registerAllComponents(); 