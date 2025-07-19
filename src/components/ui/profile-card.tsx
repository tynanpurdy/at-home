import React from "react";
import { Card, CardContent, CardHeader } from "./card";
import { Button } from "./button";
import { Badge } from "./badge";
import { Separator } from "./separator";
import {
  cn,
  formatNumber,
  formatJoinDate,
  generateInitials,
} from "@/lib/utils";
import { ExternalLink, Copy, Calendar } from "lucide-react";
import { RichText } from "@atproto/api";
import type { AppBskyRichtextFacet } from "@atproto/api";

interface ProfileData {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  descriptionFacets?: AppBskyRichtextFacet.Main[];
  avatar?: string;
  banner?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  indexedAt?: string;
}

interface ProfileCardProps {
  profile: ProfileData;
  variant?: "default" | "compact";
  showStats?: boolean;
  showBio?: boolean;
  showActions?: boolean;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  variant = "default",
  showStats = true,
  showBio = true,
  showActions = true,
  className,
}) => {
  const handleCopyHandle = async () => {
    try {
      await navigator.clipboard.writeText(`@${profile.handle}`);
      // You could add toast notification here later
    } catch (err) {
      console.error("Failed to copy handle:", err);
    }
  };

  const bioSegments = React.useMemo(() => {
    if (!profile.description) return [];
    const rt = new RichText({
      text: profile.description,
      facets: profile.descriptionFacets,
    });
    return Array.from(rt.segments());
  }, [profile.description, profile.descriptionFacets]);

  if (variant === "compact") {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.displayName || profile.handle}
                className="w-12 h-12 rounded-full object-cover"
                width={48}
                height={48}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <span className="text-muted-foreground text-xl font-medium">
                  {generateInitials(profile.displayName || profile.handle)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {profile.displayName || profile.handle}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              @{profile.handle}
            </p>
            {showStats && (
              <div className="flex items-center space-x-2 mt-2">
                {profile.followersCount !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {formatNumber(profile.followersCount)} followers
                  </Badge>
                )}
                {profile.postsCount !== undefined && (
                  <Badge variant="secondary" className="text-xs">
                    {formatNumber(profile.postsCount)} posts
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Banner */}
      {profile.banner ? (
        <div className="h-32 sm:h-48 relative">
          <img
            src={profile.banner}
            alt="Profile banner"
            className="w-full h-full object-cover"
            width={800}
            height={192}
            loading="eager"
            decoding="async"
          />
        </div>
      ) : (
        <div className="h-32 sm:h-48 bg-gradient-to-r from-primary/20 to-secondary/20" />
      )}

      <CardContent className="relative p-6">
        {/* Avatar */}
        <div className="flex items-end -mt-16 mb-4">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.displayName || profile.handle}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-background bg-background object-cover"
              width={128}
              height={128}
              loading="eager"
              decoding="async"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-background bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-4xl sm:text-5xl font-medium">
                {generateInitials(profile.displayName || profile.handle)}
              </span>
            </div>
          )}
        </div>

        {/* Name and Handle */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {profile.displayName || profile.handle}
          </h1>
          <p className="text-muted-foreground text-lg">@{profile.handle}</p>
        </div>

        {/* Bio */}
        {showBio && profile.description && (
          <div className="mb-4 text-foreground leading-relaxed whitespace-pre-wrap">
            {bioSegments.map((segment, i) => {
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

        {/* Join Date */}
        {profile.indexedAt && (
          <div className="mb-4">
            <div className="flex items-center text-muted-foreground text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Joined {formatJoinDate(profile.indexedAt)}</span>
            </div>
          </div>
        )}

        {/* Stats */}
        {showStats && (
          <>
            <div className="flex items-center space-x-6 mb-4">
              {profile.followsCount !== undefined && (
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">
                    {formatNumber(profile.followsCount)}
                  </div>
                  <div className="text-sm text-muted-foreground">Following</div>
                </div>
              )}
              {profile.followersCount !== undefined && (
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">
                    {formatNumber(profile.followersCount)}
                  </div>
                  <div className="text-sm text-muted-foreground">Followers</div>
                </div>
              )}
              {profile.postsCount !== undefined && (
                <div className="text-center">
                  <div className="text-xl font-bold text-foreground">
                    {formatNumber(profile.postsCount)}
                  </div>
                  <div className="text-sm text-muted-foreground">Posts</div>
                </div>
              )}
            </div>
            <Separator className="mb-4" />
          </>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-3">
            <Button asChild>
              <a
                href={`https://bsky.app/profile/${profile.handle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Bluesky
              </a>
            </Button>
            <Button variant="outline" onClick={handleCopyHandle}>
              <Copy className="w-4 h-4 mr-2" />
              Copy Handle
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
