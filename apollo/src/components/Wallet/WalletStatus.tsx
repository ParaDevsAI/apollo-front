"use client";

import { useWalletKit } from "@/hooks/useWalletKit";
import ClientOnly from "@/components/ClientOnly";

interface WalletStatusProps {
  showDetails?: boolean;
  className?: string;
}

export default function WalletStatus({ showDetails = false, className = "" }: WalletStatusProps) {
  const { walletInfo, connectionStatus } = useWalletKit();

  if (connectionStatus === 'disconnected') {
    return null;
  }

  return (
    <ClientOnly fallback={<div className="w-4 h-4 bg-gray-600 rounded animate-pulse" />}>
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div 
            className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400' : 
              connectionStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' : 
              'bg-red-400'
            }`}
          />
          <span className="text-xs text-gray-400">
            {connectionStatus === 'connected' ? 'Conectado' : 
             connectionStatus === 'connecting' ? 'Conectando...' : 
             'Erro'}
          </span>
        </div>

        {/* Wallet Details */}
        {showDetails && walletInfo.isConnected && (
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-white">
              {walletInfo.formattedAddress}
            </span>
            {walletInfo.walletName && (
              <span className="text-xs text-gray-400">
                via {walletInfo.walletName}
              </span>
            )}
          </div>
        )}

        {/* Error Message */}
        {walletInfo.error && (
          <span className="text-xs text-red-400">
            {walletInfo.error}
          </span>
        )}
      </div>
    </ClientOnly>
  );
}
