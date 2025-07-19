import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";
import type { ATProtoRecord } from "../../lib/atproto";
import { AlertTriangle } from "lucide-react";

interface GenericRecordCardProps {
  record: ATProtoRecord;
  className?: string;
}

export const GenericRecordCard: React.FC<GenericRecordCardProps> = ({
  record,
  className,
}) => {
  if (!record?.record) {
    return (
      <div className="text-red-500 p-4">
        Error: Record data is missing or invalid.
      </div>
    );
  }

  // The record's type, like 'app.bsky.feed.post'
  const recordType = (record.record as any).$type || "Unknown Type";

  return (
    <Card className={cn("border-dashed", className)}>
      <CardHeader className="flex flex-row items-center space-x-2 pb-2">
        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
        <CardTitle className="text-sm font-medium">
          Unsupported Record Type
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-2">
          No specific component is registered for the lexicon type:{" "}
          <code className="font-mono bg-muted p-1 rounded-sm">
            {recordType}
          </code>
        </p>
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
            View Raw Data
          </summary>
          <pre className="mt-2 p-2 bg-muted rounded-md overflow-x-auto text-muted-foreground">
            {JSON.stringify(record, null, 2)}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
};

export default GenericRecordCard;
