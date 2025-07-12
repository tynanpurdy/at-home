import React from "react";
import type { ATProtoRecord } from "../lib/atproto";
import RecordList from "./RecordList";

interface ActivityFeedProps {
  records: ATProtoRecord[];
  maxItems?: number;
  showAuthor?: boolean;
  compact?: boolean;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  records,
  maxItems = 10,
  showAuthor = true,
  compact = false,
}) => {
  // Convert to RecordList props
  const view = compact ? "compact" : "expanded";

  return (
    <RecordList
      records={records}
      view={view}
      maxItems={maxItems}
      showAuthor={showAuthor}
      emptyMessage="No recent activity found"
      emptySubMessage="Activity from your AT Protocol repository will appear here."
    />
  );
};

export default ActivityFeed;
