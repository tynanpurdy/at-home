import React from "react";
import OptimizedImage from "./OptimizedImage";

interface ProfileData {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  followersCount?: number;
  followsCount?: number;
  postsCount?: number;
  indexedAt?: string;
}

interface ProfileProps {
  profile: ProfileData;
  compact?: boolean;
  showStats?: boolean;
  showBio?: boolean;
}

export const Profile: React.FC<ProfileProps> = ({
  profile,
  compact = false,
  showStats = true,
  showBio = true,
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatJoinDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex-shrink-0">
          {profile.avatar ? (
            <OptimizedImage
              src={profile.avatar}
              alt={profile.displayName || profile.handle}
              className="w-12 h-12 rounded-full object-cover"
              width={48}
              height={48}
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-400 text-xl">
                {(profile.displayName || profile.handle)[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {profile.displayName || profile.handle}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            @{profile.handle}
          </p>
          {showStats && (
            <div className="flex items-center space-x-4 mt-1">
              {profile.followersCount !== undefined && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatNumber(profile.followersCount)} followers
                </span>
              )}
              {profile.postsCount !== undefined && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatNumber(profile.postsCount)} posts
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {/* Banner */}
      {profile.banner && (
        <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-400 to-purple-500 relative">
          <OptimizedImage
            src={profile.banner}
            alt="Profile banner"
            className="w-full h-full object-cover"
            width={800}
            height={192}
          />
        </div>
      )}
      {!profile.banner && (
        <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-400 to-purple-500"></div>
      )}

      {/* Profile Info */}
      <div className="relative px-6 pb-6">
        {/* Avatar */}
        <div className="flex items-end -mt-16 mb-4">
          {profile.avatar ? (
            <OptimizedImage
              src={profile.avatar}
              alt={profile.displayName || profile.handle}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 object-cover"
              width={128}
              height={128}
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
              <span className="text-gray-600 dark:text-gray-400 text-4xl sm:text-5xl">
                {(profile.displayName || profile.handle)[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Name and Handle */}
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            {profile.displayName || profile.handle}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            @{profile.handle}
          </p>
        </div>

        {/* Bio */}
        {showBio && profile.description && (
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {profile.description}
            </p>
          </div>
        )}

        {/* Join Date */}
        {profile.indexedAt && (
          <div className="mb-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              📅 Joined {formatJoinDate(profile.indexedAt)}
            </p>
          </div>
        )}

        {/* Stats */}
        {showStats && (
          <div className="flex items-center space-x-6 mb-4">
            {profile.followsCount !== undefined && (
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(profile.followsCount)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Following
                </div>
              </div>
            )}
            {profile.followersCount !== undefined && (
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(profile.followersCount)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Followers
                </div>
              </div>
            )}
            {profile.postsCount !== undefined && (
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(profile.postsCount)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Posts
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <a
            href={`https://bsky.app/profile/${profile.handle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            View on Bluesky
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(`@${profile.handle}`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Copy Handle
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
