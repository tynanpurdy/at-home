import { useEffect, useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Separator } from './separator';
import { RefreshCw, Clock, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

// Interface for the component props
interface CacheManagerProps {
  showDetails?: boolean;
}

// Interface for cache metadata
interface CacheMeta {
  lastUpdated: string | null;
  dataCount: {
    activities?: number;
    blogPosts?: number;
    collections?: number;
    [key: string]: number | undefined;
  };
}

export function CacheManager({ showDetails = true }: CacheManagerProps) {
  // State for the component
  const [cacheMeta, setCacheMeta] = useState<CacheMeta | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error' | 'warning'>('info');

  // Format relative time (e.g., "5 minutes ago")
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never updated';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} days ago`;

    return date.toLocaleDateString();
  };

  // Load cache metadata on component mount
  useEffect(() => {
    const loadCacheMeta = async () => {
      try {
        // Dynamic import to avoid server-side execution issues
        const { getCacheMeta } = await import('../../data/cache-utils');
        const meta = getCacheMeta();
        setCacheMeta(meta);
      } catch (error) {
        console.error('Failed to load cache metadata:', error);
        setStatusMessage('Failed to load cache information');
        setStatusType('error');
      }
    };

    loadCacheMeta();
  }, []);

  // Determine if cache is stale (more than 1 hour old)
  const isCacheStale = () => {
    if (!cacheMeta?.lastUpdated) return true;

    const cacheDate = new Date(cacheMeta.lastUpdated);
    const now = new Date();
    const diffHours = (now.getTime() - cacheDate.getTime()) / (1000 * 60 * 60);

    return diffHours > 1;
  };

  // Handle cache refresh
  const handleRefreshCache = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    setStatusMessage('Refreshing AT Protocol data cache...');
    setStatusType('info');

    try {
      // Dynamic import to avoid server-side execution issues
      const { refreshCache } = await import('../../data/cache-fallback');
      const result = await refreshCache();

      if (result.success) {
        setStatusMessage('Cache refreshed successfully!');
        setStatusType('success');

        // Reload the cache metadata
        const { getCacheMeta } = await import('../../data/cache-utils');
        setCacheMeta(getCacheMeta());
      } else {
        setStatusMessage(`Failed to refresh cache: ${result.message}`);
        setStatusType('error');
      }
    } catch (error) {
      console.error('Error refreshing cache:', error);
      setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStatusType('error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get status badge color based on status type
  const getStatusBadgeVariant = () => {
    switch (statusType) {
      case 'success': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'error': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      case 'warning': return 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200';
      default: return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200';
    }
  };

  // Get status icon based on status type
  const StatusIcon = () => {
    switch (statusType) {
      case 'success': return <CheckCircle2 className="w-4 h-4 mr-2" />;
      case 'error': return <XCircle className="w-4 h-4 mr-2" />;
      case 'warning': return <AlertCircle className="w-4 h-4 mr-2" />;
      default: return <Clock className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">AT Protocol Cache</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cache Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge
            variant="outline"
            className={isCacheStale() ? 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'}
          >
            {isCacheStale() ? 'Stale' : 'Fresh'}
          </Badge>
        </div>

        {/* Last Updated */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Last Updated:</span>
          <span className="text-sm font-medium">
            {cacheMeta?.lastUpdated ? formatRelativeTime(cacheMeta.lastUpdated) : 'Never'}
          </span>
        </div>

        {/* Cache Details */}
        {showDetails && cacheMeta?.dataCount && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Cached Data:</h4>
              {Object.entries(cacheMeta.dataCount).map(([key, count]) => (
                <div key={key} className="flex items-center justify-between text-sm pl-2">
                  <span className="text-muted-foreground capitalize">{key}:</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className={`p-3 rounded text-sm flex items-center ${getStatusBadgeVariant()}`}>
            <StatusIcon />
            {statusMessage}
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          className="w-full"
          onClick={handleRefreshCache}
          disabled={isRefreshing}
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
    </Card>
  );
}
