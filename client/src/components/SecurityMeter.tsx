import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, Eye, AlertTriangle } from 'lucide-react';

interface SecurityStats {
  total_blocked_calls: number;
  blocked_ips: number;
  active_protections: string[];
  last_block_time: number;
  status: "ACTIVE" | "MONITORING";
  timestamp: number;
}

interface SecurityStatsResponse {
  success: boolean;
  data: SecurityStats;
  timestamp: string;
}

interface SecurityMeterProps {
  variant?: 'standalone' | 'header' | 'footer-ticker';
}

export function SecurityMeter({ variant = 'standalone' }: SecurityMeterProps = {}) {
  const [animateCount, setAnimateCount] = useState(false);
  
  const { data: securityStats } = useQuery<SecurityStatsResponse>({
    queryKey: ['/api/security/stats'],
    refetchInterval: 60000,
  });

  const stats = securityStats?.data;
  const blockedCalls = stats?.total_blocked_calls || 0;
  const status = stats?.status || "MONITORING";

  // Animate counter when it changes
  useEffect(() => {
    if (blockedCalls > 0) {
      setAnimateCount(true);
      const timer = setTimeout(() => setAnimateCount(false), 600);
      return () => clearTimeout(timer);
    }
  }, [blockedCalls]);

  const getStatusColor = () => {
    switch (status) {
      case "ACTIVE": return "text-red-400";
      case "MONITORING": return "text-green-400";
      default: return "text-yellow-400";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "ACTIVE": return <AlertTriangle className="w-3 h-3 animate-pulse" />;
      case "MONITORING": return <Eye className="w-3 h-3" />;
      default: return <Shield className="w-3 h-3" />;
    }
  };

  if (variant === 'header') {
    return (
      <div className="flex items-center justify-center bg-black/60 backdrop-blur-sm border border-cyan-500/30 rounded px-3 py-1 max-w-2xl mx-auto">
        {/* Security Status - Compact */}
        <div className="flex items-center gap-1 mr-4">
          <Shield className="w-3 h-3 text-cyan-400" />
          <span className="text-xs font-semibold text-cyan-400">
            SEC
          </span>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <span className={`text-xs font-semibold ${getStatusColor()}`}>
              {status}
            </span>
          </div>
        </div>
        
        {/* Blocked Calls - Compact */}
        <div className="flex items-center gap-2 mr-4">
          <div className="text-center">
            <div className="text-xs text-gray-400">BLOCKED</div>
            <div className={`text-sm font-mono font-bold ${animateCount ? 'animate-pulse text-red-400' : 'text-cyan-400'} transition-all duration-300`}>
              {blockedCalls.toLocaleString()}
            </div>
          </div>
        </div>
        
        {/* Stats - Compact */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-xs text-gray-400">IPs</div>
            <div className="text-xs font-mono text-cyan-400">
              {stats?.blocked_ips || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400">PROT</div>
            <div className="text-xs font-mono text-cyan-400">
              {stats?.active_protections?.length || 4}
            </div>
          </div>
        </div>
        
        {/* Pulse Animation for Active Status */}
        {status === "ACTIVE" && (
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping opacity-75"></div>
        )}
      </div>
    );
  }

  if (variant === 'footer-ticker') {
    return (
      <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-t border-cyan-500/30 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left Side - Security Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-400 tracking-wide">
                  SECURITY MONITOR
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                {getStatusIcon()}
                <span className={`text-xs font-semibold ${getStatusColor()}`}>
                  {status}
                </span>
              </div>
            </div>
            
            {/* Center - Main Stats */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-gray-400">BLOCKED CALLS</div>
                <div className={`text-lg font-mono font-bold ${animateCount ? 'animate-pulse text-red-400' : 'text-cyan-400'} transition-all duration-300`}>
                  {blockedCalls.toLocaleString()}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-gray-400">BLOCKED IPs</div>
                <div className="text-lg font-mono font-bold text-cyan-400">
                  {stats?.blocked_ips || 0}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-xs text-gray-400">PROTECTIONS</div>
                <div className="text-lg font-mono font-bold text-cyan-400">
                  {stats?.active_protections?.length || 4}
                </div>
              </div>
            </div>
            
            {/* Right Side - Status Indicator */}
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-400">ENTERPRISE PROTECTION</div>
              <div className={`w-2 h-2 rounded-full ${status === "ACTIVE" ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-black/80 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 min-w-[180px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Shield className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-semibold text-cyan-400 tracking-wide">
          SECURITY MONITOR
        </span>
      </div>
      
      {/* Blocked Calls Counter */}
      <div className="text-center mb-2">
        <div className="text-xs text-gray-400 mb-1">BLOCKED CALLS</div>
        <div className={`text-2xl font-mono font-bold ${animateCount ? 'animate-pulse text-red-400' : 'text-cyan-400'} transition-all duration-300`}>
          {blockedCalls.toLocaleString()}
        </div>
      </div>
      
      {/* Status Indicator */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          {getStatusIcon()}
          <span className={`font-semibold ${getStatusColor()}`}>
            {status}
          </span>
        </div>
        <div className="text-gray-400">
          {stats?.blocked_ips || 0} IPs
        </div>
      </div>
      
      {/* Active Protection Count */}
      <div className="mt-2 pt-2 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          {stats?.active_protections?.length || 4} Active Protections
        </div>
      </div>
      
      {/* Pulse Animation for Active Status */}
      {status === "ACTIVE" && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping opacity-75"></div>
      )}
    </div>
  );
}