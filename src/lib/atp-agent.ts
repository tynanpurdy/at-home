import { AtpAgent } from "@atproto/api";

// This is the main service endpoint for the AT Protocol.
const DEFAULT_SERVICE_URL = "https://bsky.social";

// Create a global variable to hold our agent instance.
// This will act as a singleton to ensure it's created only once.
let agent: AtpAgent | null = null;

/**
 * Creates, configures, and logs in a new AtpAgent instance.
 * This function is intended to be called only once.
 * @returns A promise that resolves to the initialized AtpAgent.
 */
const createAgent = async (): Promise<AtpAgent> => {
  console.log("Creating and authenticating new ATP Agent instance...");

  const serviceUrl = import.meta.env.ATP_SERVICE || DEFAULT_SERVICE_URL;
  const newAgent = new AtpAgent({ service: serviceUrl });

  // In Astro, server-side environment variables are accessed via `import.meta.env`
  const identifier = import.meta.env.ATP_IDENTIFIER;
  const password = import.meta.env.ATP_PASSWORD;

  if (!identifier || !password) {
    throw new Error(
      "Missing AT Protocol credentials. Please set ATP_IDENTIFIER and ATP_PASSWORD in your .env file or server environment.",
    );
  }

  try {
    await newAgent.login({ identifier, password });
    console.log("ATP Agent login successful.");
  } catch (error) {
    console.error("Error during ATP Agent login:", error);
    // We re-throw the error because the application cannot function
    // without a properly authenticated agent.
    throw new Error("Failed to authenticate with AT Protocol.", {
      cause: error,
    });
  }

  return newAgent;
};

/**
 * Gets the singleton AtpAgent instance.
 *
 * This function ensures that the agent is created and authenticated only once
 * for the entire lifetime of the server instance. On subsequent calls, it
 * returns the already-created agent.
 *
 * @returns A promise that resolves to the singleton AtpAgent.
 */
export const getAtpAgent = async (): Promise<AtpAgent> => {
  if (!agent) {
    agent = await createAgent();
  }
  return agent;
};
