import React from "react";
import type { ATProtoRecord } from "../lib/atproto";
import { getLexiconForRecord } from "../lib/lexicons";
import Record from "./Record";

interface RecordListProps {
  records: ATProtoRecord[];
  view?: 'compact' | 'expanded' | 'full';
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
}

export const RecordList: React.FC<RecordListProps> = ({
  records,
  view = 'expanded',
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
    (a, b) => new Date(b.indexedAt).getTime() - new Date(a.indexedAt).getTime()
  );

  const displayedRecords = sortedRecords.slice(0, maxItems);

  const containerClass = view === 'compact' ? 'space-y-3' : 'space-y-4';

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          {showViewAll && viewAllHref && (
            <a
              href={viewAllHref}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              View all →
            </a>
          )}
        </div>
      )}

      {displayedRecords.length > 0 ? (
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
      ) : (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            {emptyMessage}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {emptySubMessage}
          </p>
          {view !== 'compact' && (
            <div className="space-y-2 text-sm text-gray-400 dark:text-gray-500">
              <p>Supported record types:</p>
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

      {/* Show count info if there are more records */}
      {sortedRecords.length > maxItems && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {displayedRecords.length} of {sortedRecords.length} records
          </p>
        </div>
      )}
    </div>
  );
};

export default RecordList;
