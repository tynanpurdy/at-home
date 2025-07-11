import React from "react";
import type { ATProtoRecord } from "../lib/atproto";
import ActivityFeed from "./ActivityFeed";

interface ActivitySectionProps {
  records: ATProtoRecord[];
  title?: string;
  maxItems?: number;
  compact?: boolean;
  showViewAll?: boolean;
  viewAllHref?: string;
  emptyMessage?: string;
  emptySubMessage?: string;
}

export const ActivitySection: React.FC<ActivitySectionProps> = ({
  records,
  title = "Recent Activity",
  maxItems = 10,
  compact = false,
  showViewAll = false,
  viewAllHref = "/activity",
  emptyMessage = "No recent activity found.",
  emptySubMessage = "Activity from your AT Protocol repository will appear here.",
}) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h3>
        {showViewAll && (
          <a
            href={viewAllHref}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
          >
            View all activity →
          </a>
        )}
      </div>

      {records.length > 0 ? (
        <ActivityFeed
          records={records}
          maxItems={maxItems}
          compact={compact}
        />
      ) : (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {emptySubMessage}
          </p>
          {!compact && (
            <div className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
              <p>Activities that will appear here:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Posts on Bluesky</li>
                <li>Likes and reposts</li>
                <li>New follows</li>
                <li>Blog posts via WhiteWind</li>
                <li>Profile updates</li>
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ActivitySection;
