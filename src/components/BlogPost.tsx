import React from "react";
import type { WhiteWindPost } from "../lib/atproto";
import OptimizedImage from "./OptimizedImage";

interface BlogPostProps {
  post: WhiteWindPost;
  compact?: boolean;
}

export const BlogPost: React.FC<BlogPostProps> = ({
  post,
  compact = false,
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
      return formatDate(dateString);
    }
  };

  const truncateContent = (content: string, maxLength: number): string => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  if (compact) {
    return (
      <article className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <div className="flex items-start space-x-3">
          {post.author.avatar && (
            <OptimizedImage
              src={post.author.avatar}
              alt={post.author.displayName || post.author.handle}
              className="w-8 h-8 rounded-full"
              width={32}
              height={32}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {post.record.title || "Untitled Post"}
              </h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatRelativeTime(post.record.createdAt)}
              </span>
            </div>
            {post.record.content && (
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {truncateContent(post.record.content, 150)}
              </p>
            )}
            {post.record.tags && post.record.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.record.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {post.record.tags.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{post.record.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <header className="mb-4">
        <div className="flex items-center space-x-3 mb-3">
          {post.author.avatar && (
            <OptimizedImage
              src={post.author.avatar}
              alt={post.author.displayName || post.author.handle}
              className="w-10 h-10 rounded-full"
              width={40}
              height={40}
            />
          )}
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {post.author.displayName || post.author.handle}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{post.author.handle}
            </p>
          </div>
        </div>

        {post.record.title && (
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {post.record.title}
          </h1>
        )}

        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <time dateTime={post.record.createdAt}>
            {formatDate(post.record.createdAt)}
          </time>
          {post.record.visibility && post.record.visibility !== "public" && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              {post.record.visibility}
            </span>
          )}
        </div>
      </header>

      <div className="prose prose-lg max-w-none dark:prose-invert mb-4">
        {post.record.content ? (
          <div
            dangerouslySetInnerHTML={{
              __html: post.record.content.replace(/\n/g, "<br>"),
            }}
          />
        ) : (
          <p className="text-gray-500 dark:text-gray-400 italic">
            No content available
          </p>
        )}
      </div>

      {post.record.tags && post.record.tags.length > 0 && (
        <footer className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
          {post.record.tags.map((tag, index) => (
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
          href={`https://bsky.app/profile/${post.author.handle}/post/${post.uri.split("/").pop()}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
        >
          View on Bluesky →
        </a>
      </div>
    </article>
  );
};

export default BlogPost;
