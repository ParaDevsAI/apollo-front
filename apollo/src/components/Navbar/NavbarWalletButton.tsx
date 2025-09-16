"use client";

import { useWalletKit } from "@/hooks/useWalletKit";
import ClientOnly from "@/components/ClientOnly";
import WalletDropdown from "@/components/Navbar/WalletDropdown";
import BaseButton from "@/components/Ui/Button";
import { useState } from "react";

interface NavbarWalletButtonProps {
  className?: string;
  isMobile?: boolean;
  onAction?: () => void; // Para fechar menu mobile quando conectar
}

export default function NavbarWalletButton({ 
  className = "", 
  isMobile = false,
  onAction 
}: NavbarWalletButtonProps) {
  const { walletInfo, connectionStatus, connect } = useWalletKit();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleWalletAction = async () => {
    if (walletInfo.isConnected) {
      if (isMobile) {
        // No mobile mantém o comportamento antigo de desconectar diretamente
        setIsDropdownOpen(false);
      } else {
        // No desktop abre o dropdown
        setIsDropdownOpen(!isDropdownOpen);
      }
    } else {
      setIsConnecting(true);
      try {
        await connect();
        onAction?.(); // Fechar menu mobile se aplicável
      } catch (error) {
        console.error('Erro ao conectar:', error);
      } finally {
        setIsConnecting(false);
      }
    }
  };

  const getButtonText = () => {
    if (isConnecting || connectionStatus === 'connecting') {
      return 'CONECTANDO...';
    }
    
    if (walletInfo.isConnected) {
      return `CONECTADO: ${walletInfo.formattedAddress}`;
    }
    
    return 'CONNECT WALLET';
  };

  return (
    <ClientOnly 
      fallback={
        <BaseButton 
          variant="transparent"
          className="px-5 py-2 text-[14px] font-medium opacity-50"
          disabled
        >
          CONNECT WALLET
        </BaseButton>
      }
    >
      <div className={isMobile ? "flex flex-col items-center gap-2" : "relative"}>
        {isMobile ? (
          // Mobile: mantém o layout antigo com BaseButton
          <>
            <button
              className={`px-8 py-3 text-sm font-medium w-full border rounded-lg transition-all duration-200 ${
                walletInfo.isConnected 
                  ? 'bg-[var(--color-button-primary)] text-white border-[var(--color-button-primary)]' 
                  : 'bg-transparent text-[var(--color-text-primary)] border-[var(--color-border)] hover:border-[var(--color-text-primary)]'
              } ${className}`}
              onClick={handleWalletAction}
              disabled={isConnecting || connectionStatus === 'connecting'}
            >
              {getButtonText()}
            </button>
            
            {walletInfo.error && (
              <p className="text-red-400 text-xs text-center max-w-xs px-2">
                {walletInfo.error}
              </p>
            )}
          </>
        ) : (
          // Desktop: estilo com botão transparente
          <>
            {walletInfo.isConnected ? (
              <div className="relative">
                <button
                  className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-medium transition-colors duration-200 cursor-pointer"
                  onClick={handleWalletAction}
                  disabled={isConnecting || connectionStatus === 'connecting'}
                >
                  {walletInfo.formattedAddress}
                </button>
                
                <WalletDropdown 
                  isOpen={isDropdownOpen}
                  onClose={() => setIsDropdownOpen(false)}
                  walletInfo={walletInfo}
                />
              </div>
            ) : (
              <BaseButton
                variant="transparent"
                className="px-5 py-2 text-[14px] font-medium"
                onClick={handleWalletAction}
                disabled={isConnecting || connectionStatus === 'connecting'}
              >
                {isConnecting || connectionStatus === 'connecting' ? 'CONECTANDO...' : 'CONNECT WALLET'}
              </BaseButton>
            )}
          </>
        )}
      </div>
    </ClientOnly>
  );
}
