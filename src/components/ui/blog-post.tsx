import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Separator } from "./separator";
import { cn, formatJoinDate, formatRelativeTime } from "@/lib/utils";
import { ExternalLink, Calendar, User, Eye } from "lucide-react";
import type { WhiteWindPost } from "@/lib/atproto";

interface BlogPostProps {
  post: WhiteWindPost;
  variant?: "default" | "compact";
  className?: string;
}

export const BlogPost: React.FC<BlogPostProps> = ({
  post,
  variant = "default",
  className,
}) => {
  // Add an early return if post or post.record is missing
  if (!post || !post.record) {
    console.warn("BlogPost component received invalid post data:", post);
    return null; // Render nothing if essential data is missing
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateContent = (content: string, maxLength: number): string => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  if (variant === "compact") {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-start space-x-3">
          {post.author?.avatar && (
            <div className="flex-shrink-0">
              <img
                src={post.author.avatar}
                alt={post.author.displayName || post.author.handle || "Author"}
                className="w-8 h-8 rounded-full object-cover"
                width={32}
                height={32}
                loading="lazy"
                decoding="async"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-medium text-foreground truncate">
                <a
                  href={`/record/${post.uri.split("/").pop()}`}
                  className="hover:text-primary transition-colors"
                >
                  {post.record?.title || "Untitled Post"}
                </a>
              </h3>
              <span className="text-sm text-muted-foreground">
                {formatRelativeTime(post.record.createdAt)}
              </span>
            </div>
            {post.record?.content && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {truncateContent(post.record.content, 150)}
              </p>
            )}
            {post.record?.tags && post.record.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {post.record.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {post.record.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{post.record.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        {post.author && (
          <div className="flex items-center space-x-3 mb-3">
            {post.author.avatar && (
              <img
                src={post.author.avatar}
                alt={post.author.displayName || post.author.handle || "Author"}
                className="w-10 h-10 rounded-full object-cover"
                width={40}
                height={40}
                loading="lazy"
                decoding="async"
              />
            )}
            <div>
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author.displayName ||
                  post.author.handle ||
                  "Unknown Author"}
              </h3>
              {post.author.handle && (
                <p className="text-sm text-muted-foreground">
                  @{post.author.handle}
                </p>
              )}
            </div>
          </div>
        )}

        {post.record?.title && (
          <CardTitle className="text-2xl mb-2">
            <a
              href={`/record/${post.uri.split("/").pop()}`}
              className="hover:text-primary transition-colors"
            >
              {post.record.title}
            </a>
          </CardTitle>
        )}

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.record.createdAt}>
              {formatDate(post.record.createdAt)}
            </time>
          </div>
          {post.record.visibility && post.record.visibility !== "public" && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <Badge variant="outline" className="text-xs">
                {post.record.visibility}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="prose prose-lg max-w-none dark:prose-invert mb-4">
          {post.record?.content ? (
            <div
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: post.record.content.replace(/\n/g, "<br>"),
              }}
            />
          ) : (
            <p className="text-muted-foreground italic">No content available</p>
          )}
        </div>

        {post.record?.tags && post.record.tags.length > 0 && (
          <>
            <Separator className="mb-4" />
            <div className="flex flex-wrap gap-2 mb-4">
              {post.record.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </>
        )}

        <Separator className="mb-4" />
        <Button variant="outline" size="sm" asChild>
          <a
            href={`https://whtwnd.com/${post.author.handle}/${post.uri
              .split("/")
              .pop()}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Read on WhiteWind
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default BlogPost;
