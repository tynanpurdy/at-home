import React from "react";
import type { ATProtoRecord } from "../lib/atproto";
import {
  getLexiconForRecord,
  getRecordInternalLink,
  canViewRecordInternally,
} from "../lib/lexicons";

interface CollectionActivityProps {
  collection: string;
  records: ATProtoRecord[];
  title: string;
  icon: string;
  maxItems?: number;
  compact?: boolean;
}

export const CollectionActivity: React.FC<CollectionActivityProps> = ({
  collection,
  records,
  title,
  icon,
  maxItems = 10,
  compact = false,
}) => {
  const formatRelativeTime = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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

  const getContentPreview = (record: ATProtoRecord): string => {
    const lexicon = getLexiconForRecord(record);
    if (lexicon) {
      return lexicon.getContent(record);
    }

    const { value } = record;

    // Fallback for unsupported lexicons
    if (collection.includes("blog.entry")) {
      return value.title || value.content || "Blog post";
    } else if (collection.includes("feed.post")) {
      return value.text || "Post";
    } else if (collection.includes("feed.like")) {
      return `Liked: ${value.subject?.uri?.split("/").pop() || "a post"}`;
    } else if (collection.includes("feed.repost")) {
      return `Reposted: ${value.subject?.uri?.split("/").pop() || "a post"}`;
    } else if (collection.includes("graph.follow")) {
      return `Followed: ${value.subject || "someone"}`;
    } else if (collection.includes("actor.profile")) {
      return `Updated profile: ${value.displayName || value.handle || "Profile"}`;
    }

    return value.text || value.content || value.title || "Activity";
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const getRecordLink = (record: ATProtoRecord): string => {
    const lexicon = getLexiconForRecord(record);
    if (lexicon) {
      return lexicon.getLink(record);
    }

    // Fallback for unsupported lexicons
    const postId = record.uri.split("/").pop();
    return `https://bsky.app/profile/${record.author.handle}/post/${postId}`;
  };

  const displayedRecords = records.slice(0, maxItems);

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{icon}</span>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {records.length}
          </span>
        </div>

        {displayedRecords.length > 0 ? (
          <div className="space-y-2">
            {displayedRecords.map((record, index) => (
              <div
                key={`${record.uri}-${index}`}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                  {truncateText(getContentPreview(record), 60)}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {formatRelativeTime(record.indexedAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No recent activity
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {records.length} {records.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
          {collection}
        </div>
      </div>

      {displayedRecords.length > 0 ? (
        <div className="space-y-4">
          {displayedRecords.map((record, index) => (
            <div
              key={`${record.uri}-${index}`}
              className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0 last:pb-0"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
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
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {record.author.displayName || record.author.handle}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                      @{record.author.handle}
                    </span>
                  </div>
                </div>
                <time className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(record.indexedAt)}
                </time>
              </div>

              <div className="mb-3">
                {record.value.title && (
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {canViewRecordInternally(record) ? (
                      <a
                        href={getRecordInternalLink(record)}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {record.value.title}
                      </a>
                    ) : (
                      record.value.title
                    )}
                  </h3>
                )}
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {truncateText(getContentPreview(record), 200)}
                </p>
              </div>

              {record.value.tags && record.value.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Collection: {collection.split(".").pop()}</span>
                  {record.cid && <span>CID: {record.cid.slice(0, 12)}...</span>}
                </div>
                <div className="flex items-center space-x-2">
                  {canViewRecordInternally(record) && (
                    <a
                      href={getRecordInternalLink(record)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium"
                    >
                      Full View →
                    </a>
                  )}
                  <a
                    href={getRecordLink(record)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-xs font-medium"
                  >
                    External →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">{icon}</div>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            No {title.toLowerCase()} found
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Items from the {collection} collection will appear here.
          </p>
        </div>
      )}

      {records.length > maxItems && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {maxItems} of {records.length} items
          </p>
        </div>
      )}
    </div>
  );
};

export default CollectionActivity;
