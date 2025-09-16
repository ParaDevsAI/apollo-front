"use client";

import { useWalletKit } from "@/hooks/useWalletKit";
import BaseButton from "@/components/Ui/Button";
import ClientOnly from "@/components/ClientOnly";
import { useState } from "react";

interface WalletButtonProps {
  className?: string;
  connectText?: string;
  disconnectText?: string;
  connectingText?: string;
  variant?: "primary" | "transparent" | "outline";
  size?: "sm" | "md" | "lg";
  showAddress?: boolean;
}

export default function WalletButton({
  className = "",
  connectText = "Connect Wallet",
  disconnectText = "Disconnect",
  connectingText = "Connecting...",
  variant = "primary",
  size = "md",
  showAddress = true,
}: WalletButtonProps) {
  const { walletInfo, connectionStatus, connect, disconnect } = useWalletKit();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Erro ao conectar:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const getButtonText = () => {
    if (isConnecting || connectionStatus === 'connecting') {
      return connectingText;
    }
    
    if (walletInfo.isConnected) {
      return showAddress ? walletInfo.formattedAddress : disconnectText;
    }
    
    return connectText;
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 text-xs";
      case "lg":
        return "px-8 py-4 text-base";
      default:
        return "px-6 py-3 text-sm";
    }
  };

  return (
    <ClientOnly 
      fallback={
        <BaseButton 
          variant={variant}
          className={`${getSizeClasses()} font-medium w-auto animate-pulse`}
          disabled
        >
          {connectText}
        </BaseButton>
      }
    >
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <BaseButton
          variant={walletInfo.isConnected ? "outline" : variant}
          className={`${getSizeClasses()} font-medium w-auto`}
          onClick={walletInfo.isConnected ? disconnect : handleConnect}
          disabled={isConnecting || connectionStatus === 'connecting'}
        >
          {getButtonText()}
        </BaseButton>

        {walletInfo.error && (
          <p className="text-red-400 text-xs text-center max-w-xs">
            {walletInfo.error}
          </p>
        )}

        {walletInfo.isConnected && showAddress && (
          <button
            onClick={disconnect}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            {disconnectText}
          </button>
        )}
      </div>
    </ClientOnly>
  );
}
