import React from "react";
import type { ATProtoRecord } from "../lib/atproto";
import {
  getLexiconForRecord,
  getRecordInternalLink,
  canViewRecordInternally,
} from "../lib/lexicons";

interface RecordProps {
  record: ATProtoRecord;
  view?: "compact" | "expanded" | "full";
  showAuthor?: boolean;
  maxContentLength?: number;
}

export const Record: React.FC<RecordProps> = ({
  record,
  view = "expanded",
  showAuthor = true,
  maxContentLength = 200,
}) => {
  const lexicon = getLexiconForRecord(record);

  if (!lexicon) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-sm">
        Unsupported record type: {record.uri}
      </div>
    );
  }

  // Check if the lexicon supports this view
  if (!lexicon.supportedViews.includes(view)) {
    return (
      <div className="text-gray-500 dark:text-gray-400 text-sm">
        {lexicon.name} doesn't support {view} view
      </div>
    );
  }

  const formatRelativeTime = (dateString: string | undefined): string => {
    if (!dateString || dateString === "null") {
      return "Unknown time";
    }

    const now = new Date();
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

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

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const author = lexicon.getAuthor(record);
  const title = lexicon.getTitle(record);
  const content = lexicon.getContent(record);
  const tags = lexicon.getTags(record);
  const timestamp = lexicon.getTimestamp(record);
  const link = lexicon.getLink(record);
  const linkText = lexicon.getLinkText(record);
  const description = lexicon.getDescription(record);
  const metadata = lexicon.getMetadata(record);

  if (view === "compact") {
    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="text-lg">{lexicon.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-sm text-gray-900 dark:text-white">
              {lexicon.name}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatRelativeTime(timestamp)}
            </span>
          </div>
          {description && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
              {description}
            </p>
          )}
          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
            {truncateText(content, 80)}
          </p>
        </div>
      </div>
    );
  }

  if (view === "expanded") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-2xl">{lexicon.icon}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-900 dark:text-white">
                {lexicon.name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatRelativeTime(timestamp)}
              </span>
            </div>

            {description && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                {description}
              </p>
            )}

            {showAuthor && (
              <div className="flex items-center space-x-2 mb-2">
                {author.avatar && (
                  <img
                    src={author.avatar}
                    alt={author.name}
                    className="w-6 h-6 rounded-full"
                    width={24}
                    height={24}
                    loading="lazy"
                    decoding="async"
                  />
                )}
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {author.name}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  @{author.handle}
                </span>
              </div>
            )}

            <div className="text-gray-700 dark:text-gray-300">
              {title && title !== lexicon.name && (
                <h3 className="font-medium mb-1">
                  {canViewRecordInternally(record) ? (
                    <a
                      href={getRecordInternalLink(record)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    >
                      {title}
                    </a>
                  ) : (
                    title
                  )}
                </h3>
              )}
              <p className="text-sm">
                {truncateText(content, maxContentLength)}
              </p>
            </div>

            {tags && tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              >
                {linkText}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === "full") {
    return (
      <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <header className="mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-3xl">{lexicon.icon}</span>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {lexicon.name}
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(timestamp)}
                </span>
              </div>
              {description && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>

          {showAuthor && (
            <div className="flex items-center space-x-3 mb-3">
              {author.avatar && (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-10 h-10 rounded-full"
                  width={40}
                  height={40}
                  loading="lazy"
                  decoding="async"
                />
              )}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {author.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  @{author.handle}
                </p>
              </div>
            </div>
          )}

          {title && title !== lexicon.name && (
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {title}
            </h1>
          )}

          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <time dateTime={timestamp}>
              {new Date(timestamp).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {metadata.visibility && metadata.visibility !== "public" && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                {metadata.visibility}
              </span>
            )}
          </div>
        </header>

        <div className="prose prose-lg max-w-none dark:prose-invert mb-4">
          <div
            dangerouslySetInnerHTML={{
              __html: content.replace(/\n/g, "<br>"),
            }}
          />
        </div>

        {tags && tags.length > 0 && (
          <footer className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm px-3 py-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </footer>
        )}

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
          >
            {linkText}
          </a>
        </div>

        {Object.keys(metadata).length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <details className="text-sm text-gray-500 dark:text-gray-400">
              <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                Metadata
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                {JSON.stringify(metadata, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </article>
    );
  }

  return null;
};

export default Record;
