"use client";

import BaseButton from "@/components/Ui/Button";
import { useWalletKit } from "@/hooks/useWalletKit";
import ClientOnly from "@/components/ClientOnly";
import { useState } from "react";

export default function SignInCard() {
  const { walletInfo, connectionStatus, connect, disconnect } = useWalletKit();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletAction = async () => {
    if (walletInfo.isConnected) {
      disconnect();
    } else {
      setIsConnecting(true);
      try {
        await connect();
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
      return `${walletInfo.formattedAddress}`;
    }
    
    return 'CONNECT WALLET';
  };

  const getHeaderText = () => {
    return 'SIGN IN TO VIEW YOUR CAMPAIGNS';
  };

  return (
    <ClientOnly 
      fallback={
        <div className="bg-[var(--color-bg-cards)] rounded-[12px] md:rounded-[20px] p-4 md:p-7 border border-[var(--color-border)] opacity-60">
          <div className="flex flex-col items-center md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-[var(--color-text-primary)] text-lg md:text-xl font-semibold text-center md:text-left">
              SIGN IN TO VIEW YOUR CAMPAIGNS
            </h2>
            <BaseButton
              variant="primary"
              className="px-6 py-3 text-sm font-medium w-auto animate-pulse"
              disabled
            >
              CONNECT WALLET
            </BaseButton>
          </div>
        </div>
      }
    >
      <div className={`bg-[var(--color-bg-cards)] rounded-[12px] md:rounded-[20px] p-4 md:p-7 border border-[var(--color-border)] ${walletInfo.isConnected ? 'opacity-100' : 'opacity-60'}`}>
         <div className="flex flex-col items-center md:flex-row md:items-center justify-between gap-4">
           <h2 className="text-[var(--color-text-primary)] text-lg md:text-xl font-semibold text-center md:text-left">
             {getHeaderText()}
           </h2>
 
           {!walletInfo.isConnected && (
             <div className="flex flex-col items-center gap-2">
               <BaseButton
                 variant="primary"
                 className="px-6 py-3 text-sm font-medium w-auto"
                 onClick={handleWalletAction}
                 disabled={isConnecting || connectionStatus === 'connecting'}
               >
                 {getButtonText()}
               </BaseButton>
               
               {walletInfo.error && (
                 <p className="text-red-400 text-xs text-center max-w-xs">
                   {walletInfo.error}
                 </p>
               )}
             </div>
           )}
         </div>
      </div>
    </ClientOnly>
  );
}
