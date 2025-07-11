#!/usr/bin/env node

import { createATProtoClient } from "./src/lib/atproto.ts";
import { getATProtoConfig } from "./src/config/atproto.ts";

async function testATProtocol() {
  console.log("🧪 Testing AT Protocol connection...\n");

  try {
    // Get configuration
    const config = getATProtoConfig();
    console.log("⚙️ Configuration:", {
      service: config.service,
      identifier: config.identifier,
      handle: config.handle,
      hasPassword: !!config.password,
    });

    // Create client
    const client = createATProtoClient(config);
    console.log("✅ Client created\n");

    // Test authentication
    console.log("🔐 Testing authentication...");
    await client.ensureAuthenticated();
    console.log("✅ Authentication successful\n");

    // Test profile fetch
    console.log("👤 Testing profile fetch...");
    const profile = await client.getProfile();
    console.log("✅ Profile fetched:", {
      handle: profile.handle,
      displayName: profile.displayName,
      did: profile.did.substring(0, 20) + "...",
      followersCount: profile.followersCount,
      followsCount: profile.followsCount,
      postsCount: profile.postsCount,
    });
    console.log("");

    // Test collections discovery
    console.log("📚 Testing collections discovery...");
    const collections = await client.agent.api.com.atproto.repo.describeRepo({
      repo: profile.did,
    });
    console.log("✅ Collections found:", collections.data.collections);
    console.log("");

    // Test WhiteWind posts
    console.log("📝 Testing WhiteWind posts...");
    const whiteWindPosts = await client.getWhiteWindPosts(undefined, 5);
    console.log("✅ WhiteWind posts found:", whiteWindPosts.length);
    if (whiteWindPosts.length > 0) {
      console.log("📄 First post:", {
        title: whiteWindPosts[0].record.title,
        createdAt: whiteWindPosts[0].record.createdAt,
        contentLength: whiteWindPosts[0].record.content?.length || 0,
      });
    }
    console.log("");

    // Test each collection individually
    console.log("🔍 Testing individual collections...");
    const collectionsToTest = [
      "app.bsky.feed.post",
      "app.bsky.feed.like",
      "app.bsky.feed.repost",
      "app.bsky.graph.follow",
    ];

    for (const collection of collectionsToTest) {
      try {
        console.log(`\n📂 Testing collection: ${collection}`);
        const records = await client.getRepositoryRecords(
          collection,
          undefined,
          3,
        );
        console.log(`   Records found: ${records.length}`);

        if (records.length > 0) {
          const firstRecord = records[0];
          console.log(`   Sample record:`, {
            uri: firstRecord.uri,
            createdAt: firstRecord.value.createdAt,
            valueKeys: Object.keys(firstRecord.value),
            hasText: "text" in firstRecord.value,
            hasSubject: "subject" in firstRecord.value,
            hasReason: "reason" in firstRecord.value,
          });

          // Show actual content structure
          if (firstRecord.value.text) {
            console.log(
              `   Text content: "${firstRecord.value.text.substring(0, 50)}..."`,
            );
          }
          if (firstRecord.value.subject) {
            console.log(`   Subject: ${firstRecord.value.subject}`);
          }
          if (firstRecord.value.reason) {
            console.log(`   Reason: ${firstRecord.value.reason}`);
          }
        }
      } catch (error) {
        console.log(`   ❌ Error with ${collection}:`, error.message);
      }
    }

    console.log("\n🎉 Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error details:", {
      message: error.message,
      status: error.status,
      error: error.error,
    });
  }
}

// Run the test
testATProtocol().catch(console.error);
