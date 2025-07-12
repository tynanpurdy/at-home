import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Separator } from "./separator";
import { cn } from "@/lib/utils";
import type { ATProtoRecord } from "@/lib/atproto";
import { Activity, ArrowRight, Clock, User } from "lucide-react";

interface ActivityFeedProps {
  records: ATProtoRecord[];
  maxItems?: number;
  showAuthor?: boolean;
  variant?: "default" | "compact";
  title?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  className?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  records,
  maxItems = 10,
  showAuthor = true,
  variant = "default",
  title = "Recent Activity",
  showViewAll = false,
  viewAllHref,
  className,
  emptyMessage = "No recent activity found",
  emptySubMessage = "Activity from your AT Protocol repository will appear here.",
}) => {
  const displayedRecords = records.slice(0, maxItems);

  const getActivityIcon = (record: ATProtoRecord) => {
    if (!record.collection) {
      return <Clock className="w-4 h-4" />;
    }
    if (record.collection.includes("feed.post")) {
      return <Activity className="w-4 h-4" />;
    }
    if (record.collection.includes("feed.like")) {
      return <span className="text-red-500">❤️</span>;
    }
    if (record.collection.includes("feed.repost")) {
      return <span className="text-blue-500">🔄</span>;
    }
    if (record.collection.includes("graph.follow")) {
      return <User className="w-4 h-4" />;
    }
    if (record.collection.includes("blog.entry")) {
      return <span className="text-green-500">📝</span>;
    }
    return <Clock className="w-4 h-4" />;
  };

  const getActivityDescription = (record: ATProtoRecord) => {
    if (!record.collection) {
      return "Activity";
    }
    if (record.collection.includes("feed.post")) {
      return "Posted";
    }
    if (record.collection.includes("feed.like")) {
      return "Liked";
    }
    if (record.collection.includes("feed.repost")) {
      return "Reposted";
    }
    if (record.collection.includes("graph.follow")) {
      return "Followed";
    }
    if (record.collection.includes("blog.entry")) {
      return "Published blog post";
    }
    return "Activity";
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080)
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  if (displayedRecords.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-medium text-foreground mb-2">
              {emptyMessage}
            </h3>
            <p className="text-muted-foreground mb-6">{emptySubMessage}</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Supported record types:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Posts on Bluesky</li>
                <li>Likes and reposts</li>
                <li>New follows</li>
                <li>Blog posts via WhiteWind</li>
                <li>Profile updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {records.length} items
            </Badge>
            {showViewAll && viewAllHref && (
              <Button variant="ghost" size="sm" asChild>
                <a href={viewAllHref}>
                  View all
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedRecords.map((record, index) => (
            <div key={`${record.uri}-${index}`}>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    {getActivityIcon(record)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {getActivityDescription(record)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(record.indexedAt)}
                    </span>
                  </div>
                  {record.value && typeof record.value === "object" && (
                    <div className="text-sm text-muted-foreground">
                      {variant === "compact" ? (
                        <p className="truncate">
                          {String(
                            (record.value as any).text ||
                              (record.value as any).title ||
                              (record.value as any).subject ||
                              "Activity",
                          )}
                        </p>
                      ) : (
                        <p className="line-clamp-2">
                          {String(
                            (record.value as any).text ||
                              (record.value as any).title ||
                              (record.value as any).subject ||
                              "Activity",
                          )}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {record.collection?.split(".").pop() || "unknown"}
                    </Badge>
                  </div>
                </div>
              </div>
              {index < displayedRecords.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>

        {/* Show count info if there are more records */}
        {records.length > maxItems && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Showing {displayedRecords.length} of {records.length} records
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
