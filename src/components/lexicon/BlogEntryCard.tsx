import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { cn, formatRelativeTime } from "../../lib/utils";
import { ExternalLink, Calendar, User } from "lucide-react";
import type { ATProtoRecord } from "../../lib/atproto";

interface BlogEntryCardProps {
  record: ATProtoRecord;
  className?: string;
  variant?: "compact" | "full";
}

export const BlogEntryCard: React.FC<BlogEntryCardProps> = ({
  record,
  className,
  variant = "compact",
}) => {
  if (!record?.record) {
    return (
      <div className="text-red-500 p-4">
        Error: Blog entry record is missing or invalid.
      </div>
    );
  }

  // The actual blog post data is inside the 'record' property of the ATProtoRecord
  const blogRecord = record.record as {
    title: string;
    content: string;
    tags?: string[];
    createdAt: string;
  };

  const truncateContent = (content: string, maxLength: number): string => {
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + "...";
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Unknown date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (variant === "compact") {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-start space-x-3">
          {record.author?.avatar && (
            <div className="flex-shrink-0">
              <img
                src={record.author.avatar}
                alt={
                  record.author.displayName || record.author.handle || "Author"
                }
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
                  href={`/blog/${record.uri.split("/").pop()}`}
                  className="hover:text-primary transition-colors"
                >
                  {blogRecord.title || "Untitled Post"}
                </a>
              </h3>
              <span className="text-sm text-muted-foreground">
                {formatRelativeTime(blogRecord.createdAt)}
              </span>
            </div>
            {blogRecord.content && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {truncateContent(blogRecord.content, 150)}
              </p>
            )}
            {blogRecord.tags && blogRecord.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {blogRecord.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {blogRecord.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{blogRecord.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Full variant for dedicated blog post pages
  return (
    <Card
      className={cn(
        "overflow-hidden border-transparent shadow-none",
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-center space-x-3 mb-4">
          {record.author.avatar && (
            <img
              src={record.author.avatar}
              alt={
                record.author.displayName || record.author.handle || "Author"
              }
              className="w-12 h-12 rounded-full object-cover"
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
            />
          )}
          <div>
            <h3 className="font-medium text-foreground flex items-center gap-2">
              {record.author.displayName ||
                record.author.handle ||
                "Unknown Author"}
            </h3>
            {record.author.handle && (
              <p className="text-sm text-muted-foreground">
                @{record.author.handle}
              </p>
            )}
          </div>
        </div>

        <CardTitle className="text-4xl font-extrabold tracking-tight mb-2">
          {blogRecord.title}
        </CardTitle>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <time dateTime={blogRecord.createdAt}>
              {formatDate(blogRecord.createdAt)}
            </time>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div
          className="prose prose-neutral max-w-none dark:prose-stone"
          dangerouslySetInnerHTML={{
            __html: blogRecord.content.replace(/\n/g, "<br />"),
          }}
        />

        {blogRecord.tags && blogRecord.tags.length > 0 && (
          <>
            <Separator className="my-6" />
            <div className="flex flex-wrap gap-2">
              {blogRecord.tags.map((tag, index) => (
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

        <Separator className="my-6" />
        <Button variant="outline" size="sm" asChild>
          <a
            href={`https://whtwnd.com/profile/${
              record.author.handle
            }/post/${record.uri.split("/").pop()}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View on WhiteWind
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default BlogEntryCard;
