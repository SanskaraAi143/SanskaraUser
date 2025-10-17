import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConnectionState, useWebSocketActions } from '@/store/webSocketStore';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ConnectionStatusIndicatorProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  className,
  showDetails = false,
  compact = false,
}) => {
  const connectionState = useConnectionState();
  const { forceReconnect, connect, disconnect } = useWebSocketActions();
  const { toast } = useToast();
  const [reconnectTimeout, setReconnectTimeout] = useState<NodeJS.Timeout | null>(null);
  const [manualReconnectCount, setManualReconnectCount] = useState(0);

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'connected':
        return {
          text: 'Connected to Sanskara AI',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950/50',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: <Wifi className="w-4 h-4" />,
          showRetry: false,
          pulse: false,
        };
      case 'connecting':
        return {
          text: 'Connecting...',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/50',
          borderColor: 'border-blue-200 dark:border-blue-800',
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          showRetry: false,
          pulse: true,
        };
      case 'reconnecting':
        return {
          text: 'Reconnecting...',
          color: 'text-orange-600 dark:text-orange-400',
          bgColor: 'bg-orange-50 dark:bg-orange-950/50',
          borderColor: 'border-orange-200 dark:border-orange-800',
          icon: <RefreshCw className="w-4 h-4 animate-spin" />,
          showRetry: true,
          pulse: true,
        };
      case 'error':
        return {
          text: 'Connection lost',
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-950/50',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: <WifiOff className="w-4 h-4" />,
          showRetry: true,
          pulse: false,
        };
      default:
        return {
          text: 'Disconnected',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-950/50',
          borderColor: 'border-gray-200 dark:border-gray-800',
          icon: <Clock className="w-4 h-4" />,
          showRetry: true,
          pulse: false,
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleRetry = async () => {
    try {
      // Increment manual reconnect count
      setManualReconnectCount(prev => prev + 1);

      // Add a small delay to prevent rapid clicking
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }

      setReconnectTimeout(setTimeout(async () => {
        toast({
          title: 'Reconnecting...',
          description: 'Attempting to restore connection to Sanskara AI',
          duration: 3000,
        });

        const success = await connect();
        if (success) {
          toast({
            title: 'Reconnected',
            description: 'Connection to Sanskara AI restored',
            duration: 2000,
          });
        } else {
          toast({
            title: 'Reconnection failed',
            description: 'Unable to restore connection. Please try again.',
            variant: 'destructive',
            duration: 5000,
          });
        }
      }, 1000));

    } catch (error) {
      console.error('[ConnectionStatusIndicator] Retry failed:', error);
      toast({
        title: 'Connection error',
        description: 'Failed to reconnect. Please check your internet connection.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  };

  const handleForceReconnect = () => {
    toast({
      title: 'Force reconnecting...',
      description: 'Resetting connection to Sanskara AI',
      duration: 3000,
    });

    forceReconnect();
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [reconnectTimeout]);

  // Show toast notifications for state changes
  useEffect(() => {
    switch (connectionState) {
      case 'connected':
        if (manualReconnectCount > 0) {
          toast({
            title: 'Connected',
            description: 'Successfully connected to Sanskara AI chat',
            duration: 2000,
          });
        }
        break;
      case 'error':
        toast({
          title: 'Connection lost',
          description: 'You may experience delays in chat responses',
          variant: 'destructive',
          duration: 5000,
        });
        break;
      case 'reconnecting':
        // Auto-reconnecting toast only if not from manual action
        if (manualReconnectCount === 0) {
          toast({
            title: 'Reconnecting...',
            description: 'Attempting to restore connection',
            duration: 3000,
          });
        }
        break;
    }
  }, [connectionState, manualReconnectCount, toast]);

  if (compact) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
        statusConfig.bgColor,
        statusConfig.color,
        statusConfig.borderColor,
        statusConfig.pulse && "animate-pulse",
        className
      )}>
        <span className={cn("relative", statusConfig.color)}>
          {statusConfig.icon}
        </span>
        {!compact && <span>{statusConfig.text}</span>}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
      statusConfig.bgColor,
      statusConfig.borderColor,
      statusConfig.pulse && "animate-pulse",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-gray-800", statusConfig.color)}>
          {statusConfig.icon}
        </div>

        <div>
          <div className={cn("font-medium", statusConfig.color)}>
            {statusConfig.text}
          </div>
          {showDetails && connectionState === 'reconnecting' && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Connection will be restored automatically
            </div>
          )}
          {showDetails && connectionState === 'error' && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Check your internet connection
            </div>
          )}
        </div>
      </div>

      {statusConfig.showRetry && (
        <div className="flex gap-2">
          <Button
            onClick={handleRetry}
            size="sm"
            variant="outline"
            className={cn(
              "h-8 px-3 text-xs border-current text-inherit hover:bg-white/50 dark:hover:bg-gray-800/50",
              statusConfig.color
            )}
            disabled={connectionState === 'connecting' || connectionState === 'reconnecting'}
          >
            <RefreshCw className={cn("w-3 h-3 mr-1", connectionState === 'connecting' && "animate-spin")} />
            Retry
          </Button>
        </div>
      )}

      {/* Advanced options in development */}
      {process.env.NODE_ENV === 'development' && showDetails && (
        <div className="flex gap-2 ml-4 border-l border-gray-200 dark:border-gray-700 pl-4">
          <Button
            onClick={handleForceReconnect}
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            Force Reset
          </Button>
          <Button
            onClick={() => disconnect()}
            size="sm"
            variant="ghost"
            className="h-8 px-2 text-xs text-gray-500 hover:text-red-600"
          >
            Disconnect
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatusIndicator;
