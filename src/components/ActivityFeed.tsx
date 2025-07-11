import React from "react";
import type { ATProtoRecord } from "../lib/atproto";

interface ActivityFeedProps {
  records: ATProtoRecord[];
  maxItems?: number;
  showAuthor?: boolean;
  compact?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  records,
  maxItems = 10,
  showAuthor = true,
  compact = false,
}) => {
  const formatRelativeTime = (dateString: string): string => {
    // Handle invalid or missing timestamps
    if (!dateString || dateString === "null") {
      return "Unknown time";
    }

    const now = new Date();
    const date = new Date(dateString);

    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Handle negative times (future dates, likely invalid)
    if (diffInSeconds < 0) {
      return "Just now";
    }

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else if (diffInSeconds < 2592000) {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    } else {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  };

  const getActivityIcon = (uri: string): string => {
    if (uri.includes("app.bsky.feed.post")) return "📝";
    if (uri.includes("app.bsky.feed.like")) return "❤️";
    if (uri.includes("app.bsky.feed.repost")) return "🔄";
    if (uri.includes("app.bsky.graph.follow")) return "👥";
    if (uri.includes("com.whtwnd.blog.entry")) return "📰";
    if (uri.includes("app.bsky.actor.profile")) return "👤";
    return "📋";
  };

  const getActivityType = (uri: string): string => {
    if (uri.includes("app.bsky.feed.post")) return "Post";
    if (uri.includes("app.bsky.feed.like")) return "Like";
    if (uri.includes("app.bsky.feed.repost")) return "Repost";
    if (uri.includes("app.bsky.graph.follow")) return "Follow";
    if (uri.includes("com.whtwnd.blog.entry")) return "Blog Post";
    if (uri.includes("app.bsky.actor.profile")) return "Profile Update";
    return "Activity";
  };

  const getActivityContent = (record: ATProtoRecord): string => {
    const { value } = record;

    // Handle posts
    if (value.text) return value.text;
    if (value.content) return value.content;
    if (value.title) return value.title;

    // Handle profile updates
    if (value.displayName) return `Updated profile: ${value.displayName}`;

    // Handle likes and reposts - show actual post content if available
    if (record.uri.includes("app.bsky.feed.like")) {
      if (record.resolvedSubject?.text) {
        return record.resolvedSubject.text;
      }
      return "❤️ Liked a post";
    }

    if (record.uri.includes("app.bsky.feed.repost")) {
      if (record.resolvedSubject?.text) {
        return record.resolvedSubject.text;
      }
      return "🔄 Reposted a post";
    }

    // Handle follows
    if (record.uri.includes("app.bsky.graph.follow") && value.subject) {
      const did = value.subject;
      if (did && typeof did === "string") {
        // Extract handle from DID if possible, otherwise show truncated DID
        const shortDid = did.startsWith("did:")
          ? did.split(":")[2]?.substring(0, 8) + "..."
          : did;
        return `Followed user (${shortDid})`;
      }
      return "Followed someone";
    }

    // Fallback for other subject types
    if (value.subject) {
      const subjectStr =
        typeof value.subject === "string"
          ? value.subject
          : JSON.stringify(value.subject);
      return `Activity: ${subjectStr.substring(0, 50)}${subjectStr.length > 50 ? "..." : ""}`;
    }

    return "No content available";
  };

  const getActivityDescription = (record: ATProtoRecord): string => {
    if (
      record.uri.includes("app.bsky.feed.like") &&
      record.resolvedSubject?.author
    ) {
      return `❤️ Liked a post by ${record.resolvedSubject.author.displayName || record.resolvedSubject.author.handle}`;
    }

    if (
      record.uri.includes("app.bsky.feed.repost") &&
      record.resolvedSubject?.author
    ) {
      return `🔄 Reposted a post by ${record.resolvedSubject.author.displayName || record.resolvedSubject.author.handle}`;
    }

    return "";
  };

  const getActivityLink = (record: ATProtoRecord): string => {
    // For likes and reposts, link to the original post
    if (
      record.resolvedSubject?.uri &&
      (record.uri.includes("app.bsky.feed.like") ||
        record.uri.includes("app.bsky.feed.repost"))
    ) {
      const parts = record.resolvedSubject.uri.split("/");
      if (parts.length >= 5) {
        const repo = parts[2];
        const rkey = parts[4];
        return `https://bsky.app/profile/${repo}/post/${rkey}`;
      }
    }

    // For posts, link to the post
    if (record.uri.includes("app.bsky.feed.post")) {
      return `https://bsky.app/profile/${record.author.handle}/post/${record.uri.split("/").pop()}`;
    }

    // Default to profile
    return `https://bsky.app/profile/${record.author.handle}`;
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  // Filter out profile updates and other problematic records
  const filteredRecords = records.filter((record) => {
    // Skip profile updates (they cause timestamp issues)
    if (record.uri.includes("app.bsky.actor.profile")) {
      return false;
    }
    // Skip records with invalid timestamps
    if (!record.indexedAt || record.indexedAt === "null") {
      return false;
    }
    return true;
  });

  const displayedRecords = filteredRecords.slice(0, maxItems);

  if (compact) {
    return (
      <div className="space-y-3">
        {displayedRecords.length > 0 ? (
          displayedRecords.map((record, index) => (
            <div
              key={`${record.uri}-${index}`}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span className="text-lg">{getActivityIcon(record.uri)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm text-gray-900 dark:text-white">
                    {getActivityType(record.uri)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(record.indexedAt)}
                  </span>
                </div>
                {getActivityDescription(record) && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                    {getActivityDescription(record)}
                  </p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {(record.uri.includes("app.bsky.feed.like") ||
                    record.uri.includes("app.bsky.feed.repost")) &&
                  record.resolvedSubject?.text
                    ? `"${truncateText(getActivityContent(record), 80)}"`
                    : truncateText(getActivityContent(record), 80)}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            <p>No recent activity found</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedRecords.length > 0 ? (
        displayedRecords.map((record, index) => (
          <div
            key={`${record.uri}-${index}`}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="text-2xl">{getActivityIcon(record.uri)}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getActivityType(record.uri)}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(record.indexedAt)}
                  </span>
                </div>

                {getActivityDescription(record) && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                    {getActivityDescription(record)}
                  </p>
                )}

                {showAuthor && (
                  <div className="flex items-center space-x-2 mb-2">
                    {record.author.avatar && (
                      <img
                        src={record.author.avatar}
                        alt={record.author.displayName || record.author.handle}
                        className="w-6 h-6 rounded-full"
                        width={24}
                        height={24}
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {record.author.displayName || record.author.handle}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      @{record.author.handle}
                    </span>
                  </div>
                )}

                <div className="text-gray-700 dark:text-gray-300">
                  {record.value.title && (
                    <h3 className="font-medium mb-1">{record.value.title}</h3>
                  )}
                  <p className="text-sm">
                    {(record.uri.includes("app.bsky.feed.like") ||
                      record.uri.includes("app.bsky.feed.repost")) &&
                    record.resolvedSubject?.text
                      ? `"${truncateText(getActivityContent(record), 200)}"`
                      : truncateText(getActivityContent(record), 200)}
                  </p>
                </div>

                {record.value.tags && record.value.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {record.value.tags
                      .slice(0, 3)
                      .map((tag: string, tagIndex: number) => (
                        <span
                          key={tagIndex}
                          className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    {record.value.tags.length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{record.value.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <a
                    href={getActivityLink(record)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    {record.uri.includes("app.bsky.feed.post")
                      ? "View Post on Bluesky →"
                      : record.resolvedSubject?.uri
                        ? "View Original Post on Bluesky →"
                        : "View Profile on Bluesky →"}
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No recent activity to display</p>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
