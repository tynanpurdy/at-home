import { useState, useEffect } from "react";
import { Button } from "./button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Badge } from "./badge";
import { Separator } from "./separator";
import { RefreshCw, Clock, Info, AlertTriangle } from "lucide-react";

interface CacheStatusProps {
  refreshCache?: () => Promise<{ success: boolean; message: string }>;
  showDebug?: boolean;
}

export function CacheStatus({
  refreshCache,
  showDebug = false,
}: CacheStatusProps) {
  const [cacheMeta, setCacheMeta] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");
  const [refreshSuccess, setRefreshSuccess] = useState<boolean | null>(null);

  useEffect(() => {
    // Fetch cache metadata on mount
    async function fetchCacheMeta() {
      try {
        // In a real implementation, this would be an API endpoint
        // But for simplicity, we'll just check if we're on the client
        if (typeof window !== "undefined") {
          // Dynamic import to avoid server/client mismatch
          const { getCacheMeta } = await import("../../data/cache-utils");
          const meta = getCacheMeta();
          setCacheMeta(meta);
        }
      } catch (error) {
        console.error("Failed to fetch cache metadata:", error);
      }
    }

    fetchCacheMeta();
  }, []);

  const handleRefreshCache = async () => {
    if (!refreshCache || isRefreshing) return;

    setIsRefreshing(true);
    setRefreshMessage("Refreshing cache...");
    setRefreshSuccess(null);

    try {
      const result = await refreshCache();
      setRefreshSuccess(result.success);
      setRefreshMessage(result.message);

      if (result.success) {
        // Update the cache metadata after successful refresh
        const { getCacheMeta } = await import("../../data/cache-utils");
        const meta = getCacheMeta();
        setCacheMeta(meta);
      }
    } catch (error) {
      setRefreshSuccess(false);
      if (error instanceof Error) {
        setRefreshMessage(`Error: ${error.message}`);
      } else {
        setRefreshMessage("An unknown error occurred.");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return "Never";

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  // Check if cache is stale (older than 1 hour)
  const isCacheStale = () => {
    if (!cacheMeta?.lastUpdated) return true;

    const cacheDate = new Date(cacheMeta.lastUpdated);
    const now = new Date();
    const diffInHours =
      (now.getTime() - cacheDate.getTime()) / (1000 * 60 * 60);

    return diffInHours > 1;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Info className="w-5 h-5" />
          Cache Status
        </CardTitle>
        <CardDescription>AT Protocol data caching information</CardDescription>
      </CardHeader>

      <CardContent>
        {cacheMeta ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Last Updated:
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {formatRelativeTime(cacheMeta.lastUpdated)}
                  </span>
                  {isCacheStale() ? (
                    <Badge
                      variant="outline"
                      className="bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Stale
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    >
                      Fresh
                    </Badge>
                  )}
                </div>
              </div>

              {showDebug && cacheMeta.dataCount && (
                <>
                  <Separator />
                  <div className="text-sm font-medium">Cached Data:</div>
                  <div className="space-y-1 ml-2">
                    {Object.entries(cacheMeta.dataCount).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-muted-foreground capitalize">
                          {key}:
                        </span>
                        <Badge variant="secondary">{String(value)}</Badge>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {refreshMessage && (
                <div
                  className={`mt-4 p-2 rounded text-sm ${
                    refreshSuccess === true
                      ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                      : refreshSuccess === false
                        ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                        : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  }`}
                >
                  {refreshMessage}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <span className="text-muted-foreground text-sm">
              Loading cache information...
            </span>
          </div>
        )}
      </CardContent>

      {refreshCache && (
        <CardFooter>
          <Button
            onClick={handleRefreshCache}
            disabled={isRefreshing}
            variant="outline"
            className="w-full"
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Cache
              </>
            )}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
