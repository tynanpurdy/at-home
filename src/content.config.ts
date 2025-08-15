import { defineCollection, z } from "astro:content";
import { leafletStaticLoader } from "@nulfrost/leaflet-loader-astro";
import { loadConfig } from "./lib/config/site";

const config = loadConfig();

const documents = defineCollection({
  loader: leafletStaticLoader({ 
    repo: config.atproto.did || config.atproto.handle || "did:plc:example" 
  }),
});

export const collections = { documents };
