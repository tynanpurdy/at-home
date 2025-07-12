import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Separator } from "./separator";
import { cn } from "@/lib/utils";
import { ExternalLink, Calendar, User, Eye, Clock } from "lucide-react";
import type { ATProtoRecord } from "@/lib/atproto";
import {
  getLexiconForRecord,
  getRecordInternalLink,
  canViewRecordInternally,
} from "@/lib/lexicons";

interface RecordProps {
  record: ATProtoRecord;
  view?: "compact" | "expanded" | "full";
  showAuthor?: boolean;
  maxContentLength?: number;
  className?: string;
}

export const Record: React.FC<RecordProps> = ({
  record,
  view = "expanded",
  showAuthor = true,
  maxContentLength = 200,
  className,
}) => {
  const lexicon = getLexiconForRecord(record);

  if (!lexicon) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="text-muted-foreground text-sm">
          Unsupported record type: {record.uri}
        </div>
      </Card>
    );
  }

  // Check if the lexicon supports this view
  if (!lexicon.supportedViews.includes(view)) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="text-muted-foreground text-sm">
          {lexicon.name} doesn't support {view} view
        </div>
      </Card>
    );
  }

  const formatRelativeTime = (dateString: string | null): string => {
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
      <Card className={cn("p-3", className)}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <span className="text-lg">{lexicon.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm text-foreground">
                {lexicon.name}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(timestamp)}
              </span>
            </div>
            {description && (
              <p className="text-xs text-primary mb-1">{description}</p>
            )}
            <p className="text-sm text-muted-foreground truncate">
              {truncateText(content, 80)}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (view === "expanded") {
    return (
      <Card className={cn("", className)}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-lg">{lexicon.icon}</span>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold text-foreground">
                  {lexicon.name}
                </span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(timestamp)}
                </span>
              </div>

              {description && (
                <p className="text-sm text-primary mb-2">{description}</p>
              )}

              {showAuthor && (
                <div className="flex items-center space-x-2 mb-2">
                  {author.avatar && (
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-6 h-6 rounded-full object-cover"
                      width={24}
                      height={24}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <span className="text-sm text-foreground">{author.name}</span>
                  <span className="text-sm text-muted-foreground">
                    @{author.handle}
                  </span>
                </div>
              )}

              <div className="text-foreground">
                {title && title !== lexicon.name && (
                  <h3 className="font-medium mb-1">
                    {canViewRecordInternally(record) ? (
                      <a
                        href={getRecordInternalLink(record)}
                        className="hover:text-primary transition-colors cursor-pointer"
                      >
                        {title}
                      </a>
                    ) : (
                      title
                    )}
                  </h3>
                )}
                <p className="text-sm text-muted-foreground">
                  {truncateText(content, maxContentLength)}
                </p>
              </div>

              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-xs text-muted-foreground">
                      +{tags.length - 3} more
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-border">
                <Button variant="ghost" size="sm" asChild>
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {linkText}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (view === "full") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader>
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl">{lexicon.icon}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <CardTitle className="text-xl">{lexicon.name}</CardTitle>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatRelativeTime(timestamp)}
                </span>
              </div>
              {description && (
                <p className="text-sm text-primary mt-1">{description}</p>
              )}
            </div>
          </div>

          {showAuthor && (
            <div className="flex items-center space-x-3 mb-3">
              {author.avatar && (
                <img
                  src={author.avatar}
                  alt={author.name}
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
                  {author.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  @{author.handle}
                </p>
              </div>
            </div>
          )}

          {title && title !== lexicon.name && (
            <CardTitle className="text-2xl mb-2">{title}</CardTitle>
          )}

          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {timestamp && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <time dateTime={timestamp}>
                  {new Date(timestamp).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            )}
            {metadata.visibility && metadata.visibility !== "public" && (
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                <Badge variant="outline" className="text-xs">
                  {metadata.visibility}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="prose prose-lg max-w-none dark:prose-invert mb-4">
            <div
              className="text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: content.replace(/\n/g, "<br>"),
              }}
            />
          </div>

          {tags && tags.length > 0 && (
            <>
              <Separator className="mb-4" />
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map((tag, index) => (
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
            <a href={link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              {linkText}
            </a>
          </Button>

          {Object.keys(metadata).length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground transition-colors">
                  Metadata
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default Record;
