import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { cn } from "@/lib/utils";
import { ArrowRight, List, Search } from "lucide-react";
import type { ATProtoRecord } from "@/lib/atproto";
import { getLexiconForRecord } from "@/lib/lexicons";
import Record from "./record";

interface RecordListProps {
  records: ATProtoRecord[];
  view?: "compact" | "expanded" | "full";
  maxItems?: number;
  showAuthor?: boolean;
  maxContentLength?: number;
  title?: string;
  showViewAll?: boolean;
  viewAllHref?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
  filterLexicons?: string[]; // Array of collection names to include
  excludeLexicons?: string[]; // Array of collection names to exclude
  className?: string;
}

export const RecordList: React.FC<RecordListProps> = ({
  records,
  view = "expanded",
  maxItems = 10,
  showAuthor = true,
  maxContentLength = 200,
  title,
  showViewAll = false,
  viewAllHref,
  emptyMessage = "No records found.",
  emptySubMessage = "Records will appear here when available.",
  filterLexicons,
  excludeLexicons,
  className,
}) => {
  // Filter records based on lexicon support and filters
  const filteredRecords = records.filter((record) => {
    const lexicon = getLexiconForRecord(record);

    // Skip if no lexicon found
    if (!lexicon) return false;

    // Skip if lexicon doesn't support the requested view
    if (!lexicon.supportedViews.includes(view)) return false;

    // Apply include filter if specified
    if (filterLexicons && filterLexicons.length > 0) {
      if (!filterLexicons.includes(lexicon.collection)) return false;
    }

    // Apply exclude filter if specified
    if (excludeLexicons && excludeLexicons.length > 0) {
      if (excludeLexicons.includes(lexicon.collection)) return false;
    }

    // Skip records with invalid timestamps
    if (!record.indexedAt || record.indexedAt === "null") {
      return false;
    }

    return true;
  });

  // Sort by timestamp (newest first)
  const sortedRecords = filteredRecords.sort(
    (a, b) =>
      new Date(b.indexedAt).getTime() - new Date(a.indexedAt).getTime()
  );

  const displayedRecords = sortedRecords.slice(0, maxItems);

  const containerClass = view === "compact" ? "space-y-3" : "space-y-4";

  if (displayedRecords.length === 0) {
    return (
      <Card className={cn("", className)}>
        {title && (
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <List className="w-5 h-5" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
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
    <div className={cn("", className)}>
      {title && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <List className="w-5 h-5" />
                {title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {sortedRecords.length} records
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
        </Card>
      )}

      <div className={containerClass}>
        {displayedRecords.map((record, index) => (
          <Record
            key={`${record.uri}-${index}`}
            record={record}
            view={view}
            showAuthor={showAuthor}
            maxContentLength={maxContentLength}
          />
        ))}
      </div>

      {/* Show count info if there are more records */}
      {sortedRecords.length > maxItems && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Showing {displayedRecords.length} of {sortedRecords.length}{" "}
                records
              </p>
              {showViewAll && viewAllHref && (
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <a href={viewAllHref}>
                    <Search className="w-4 h-4 mr-2" />
                    View all {sortedRecords.length} records
                  </a>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RecordList;
