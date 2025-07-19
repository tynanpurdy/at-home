import React from "react";
import { Card } from "../ui/card";
import { cn, formatRelativeTime } from "../../lib/utils";
import type { ATProtoRecord } from "../../lib/atproto";
import { RichText } from "@atproto/api";
import type { AppBskyRichtextFacet } from "@atproto/api";

interface PostCardProps {
  record: ATProtoRecord;
  className?: string;
}

export const PostCard: React.FC<PostCardProps> = ({ record, className }) => {
  if (!record?.record) {
    return (
      <div className="text-red-500 p-4">
        Error: Post record is missing or invalid.
      </div>
    );
  }

  // The actual post data is inside the 'record' property
  const postRecord = record.record as {
    text: string;
    facets?: AppBskyRichtextFacet.Main[];
    createdAt: string;
  };

  const postSegments = React.useMemo(() => {
    if (!postRecord.text) return [];
    const rt = new RichText({
      text: postRecord.text,
      facets: postRecord.facets,
    });
    return Array.from(rt.segments());
  }, [postRecord.text, postRecord.facets]);

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
              className="w-10 h-10 rounded-full object-cover"
              width={40}
              height={40}
              loading="lazy"
              decoding="async"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-foreground truncate">
              {record.author.displayName || `@${record.author.handle}`}
            </span>
            <span className="text-sm text-muted-foreground">
              · {formatRelativeTime(postRecord.createdAt)}
            </span>
          </div>
          {postRecord.text && (
            <div className="text-sm text-foreground whitespace-pre-wrap">
              {postSegments.map((segment, i) => {
                if (segment.isLink()) {
                  return (
                    <a
                      key={i}
                      href={segment.link!.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {segment.text}
                    </a>
                  );
                }
                if (segment.isMention()) {
                  return (
                    <a
                      key={i}
                      href={`https://bsky.app/profile/${segment.mention!.did}`}
                      className="text-primary hover:underline"
                    >
                      {segment.text}
                    </a>
                  );
                }
                return <span key={i}>{segment.text}</span>;
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PostCard;
