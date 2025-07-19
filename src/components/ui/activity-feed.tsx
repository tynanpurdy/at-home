import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import type { ATProtoRecord } from "@/lib/atproto";
import { Activity, ArrowRight } from "lucide-react";
import { LexiconComponentRegistry } from "../lexicon/registry";
import GenericRecordCard from "../lexicon/GenericRecordCard";

interface ActivityFeedProps {
  records: ATProtoRecord[];
  title: string;
  maxItems?: number;
  showViewAll?: boolean;
  viewAllHref?: string;
  className?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  records,
  title,
  maxItems = 10,
  showViewAll = false,
  viewAllHref,
  className,
  emptyMessage = "No activity found",
  emptySubMessage = "This feed is currently empty.",
}) => {
  const displayedRecords = records.slice(0, maxItems);

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
            <p className="text-muted-foreground">{emptySubMessage}</p>
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
          {displayedRecords.map((record) => {
            // The record's type, like 'app.bsky.feed.post'
            const recordType = (record.record as any)?.$type;

            // Look up the component in the registry.
            // If it's not found, fall back to the generic component.
            const ComponentToRender =
              recordType && LexiconComponentRegistry[recordType]
                ? LexiconComponentRegistry[recordType]
                : GenericRecordCard;

            return (
              <div key={record.uri}>
                <ComponentToRender record={record} />
              </div>
            );
          })}
        </div>
        {records.length > maxItems && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Showing {displayedRecords.length} of {records.length} records.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
