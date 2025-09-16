"use client";

import { useWallet } from '@/contexts/WalletContext';
import { useCallback, useMemo } from 'react';

export function useWalletKit() {
  const { wallet, kit, connectWallet, disconnectWallet, signTransaction, getWalletInfo } = useWallet();

  // Função para formatar endereço (mostra apenas início e fim)
  const formatAddress = useCallback((address: string | null, length: number = 8): string => {
    if (!address) return '';
    if (address.length <= length * 2) return address;
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  }, []);

  // Verificar se a carteira está disponível
  const isWalletAvailable = useMemo(() => {
    return kit !== null;
  }, [kit]);

  // Status da conexão
  const connectionStatus = useMemo(() => {
    if (wallet.isLoading) return 'connecting';
    if (wallet.isConnected) return 'connected';
    if (wallet.error) return 'error';
    return 'disconnected';
  }, [wallet.isLoading, wallet.isConnected, wallet.error]);

  // Informações da carteira formatadas
  const walletInfo = useMemo(() => {
    return {
      address: wallet.address,
      formattedAddress: formatAddress(wallet.address),
      walletName: wallet.selectedWallet?.name || null,
      isConnected: wallet.isConnected,
      isLoading: wallet.isLoading,
      error: wallet.error,
    };
  }, [wallet, formatAddress]);

  // Função para conectar com tratamento de erro
  const handleConnect = useCallback(async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
      throw error;
    }
  }, [connectWallet]);

  // Função para desconectar
  const handleDisconnect = useCallback(() => {
    try {
      disconnectWallet();
    } catch (error) {
      console.error('Erro ao desconectar carteira:', error);
      throw error;
    }
  }, [disconnectWallet]);

  // Função para assinar transação com tratamento de erro
  const handleSignTransaction = useCallback(async (transactionXDR: string) => {
    try {
      if (!wallet.isConnected) {
        throw new Error('Carteira não conectada');
      }
      return await signTransaction(transactionXDR);
    } catch (error) {
      console.error('Erro ao assinar transação:', error);
      throw error;
    }
  }, [signTransaction, wallet.isConnected]);

  return {
    // Estado da carteira
    walletInfo,
    connectionStatus,
    isWalletAvailable,
    
    // Funções de controle
    connect: handleConnect,
    disconnect: handleDisconnect,
    signTransaction: handleSignTransaction,
    
    // Utilitários
    formatAddress,
    getWalletInfo, // Nova função para obter dados completos
    
    // Kit bruto (para casos avançados)
    kit,
  };
}
