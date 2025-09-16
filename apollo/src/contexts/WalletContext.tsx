"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  StellarWalletsKit,
  WalletNetwork,
  ISupportedWallet,
  FreighterModule,
  xBullModule,
  RabetModule,
  LobstrModule
} from '@creit.tech/stellar-wallets-kit';
import { isUserCancellation, shouldShowError, formatErrorMessage, devLog, prodLog } from '@/utils/walletErrorHandler';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  selectedWallet: ISupportedWallet | null;
  isLoading: boolean;
  error: string | null;
}

interface WalletContextType {
  wallet: WalletState;
  kit: StellarWalletsKit | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  signTransaction: (transactionXDR: string) => Promise<string>;
  getWalletInfo: () => any; // Função para obter dados completos da carteira
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    selectedWallet: null,
    isLoading: false,
    error: null,
  });

  const [kit, setKit] = useState<StellarWalletsKit | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Verificar se estamos no cliente (após hidratação)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Inicializar o StellarWalletsKit (apenas no cliente)
  useEffect(() => {
    if (!isClient) return;
    
    try {
      // Debug: Verificar se as wallets estão instaladas no navegador
      console.log('🔍 APOLLO WALLET DEBUG - Verificando wallets no navegador:');
      console.log('window.freighter:', typeof (window as any).freighter !== 'undefined' ? '✅ DETECTADO' : '❌ NÃO DETECTADO');
      console.log('window.lobstrWallet:', typeof (window as any).lobstrWallet !== 'undefined' ? '✅ DETECTADO' : '❌ NÃO DETECTADO');
      console.log('window.xBull:', typeof (window as any).xBull !== 'undefined' ? '✅ DETECTADO' : '❌ NÃO DETECTADO');
      console.log('window.rabet:', typeof (window as any).rabet !== 'undefined' ? '✅ DETECTADO' : '❌ NÃO DETECTADO');
      
      // Aguardar um pouco para as extensões carregarem
      setTimeout(() => {
        console.log('🔍 APOLLO WALLET DEBUG - Re-verificando após 1s:');
        console.log('window.freighter (após delay):', typeof (window as any).freighter !== 'undefined' ? '✅ DETECTADO' : '❌ NÃO DETECTADO');
        console.log('window.lobstrWallet (após delay):', typeof (window as any).lobstrWallet !== 'undefined' ? '✅ DETECTADO' : '❌ NÃO DETECTADO');
        console.log('window.xBull (após delay):', typeof (window as any).xBull !== 'undefined' ? '✅ DETECTADO' : '❌ NÃO DETECTADO');
        console.log('window.rabet (após delay):', typeof (window as any).rabet !== 'undefined' ? '✅ DETECTADO' : '❌ NÃO DETECTADO');
      }, 1000);

      // Módulos permitidos (excluindo Albedo)
      const allowedModules = [
        new FreighterModule(),
        new xBullModule(),
        new RabetModule(),
        new LobstrModule(),
        // Não incluir AlbedoModule aqui para removê-lo do modal
      ];

      console.log('🔧 APOLLO WALLET SETUP:');
      console.log('✅ Módulos habilitados:', allowedModules.map(m => m.constructor.name));
      console.log('❌ Albedo removido do modal');
      
      const stellarKit = new StellarWalletsKit({
        network: WalletNetwork.TESTNET, // Using TESTNET to match backend configuration
        modules: allowedModules,
      });
      
      // Debug: Verificar wallets suportadas após inicialização
      setTimeout(async () => {
        try {
          const supportedWallets = await stellarKit.getSupportedWallets();
          console.log('🎯 WALLETS SUPORTADAS NO MODAL:', supportedWallets.length);
          supportedWallets.forEach((wallet, index) => {
            console.log(`${index + 1}. ${wallet.name}:`, {
              id: wallet.id,
              isAvailable: (wallet as any).isAvailable || 'N/A',
              isInstalled: (wallet as any).isInstalled || 'N/A',
              type: (wallet as any).type || 'N/A'
            });
          });
        } catch (error) {
          console.error('Erro ao obter wallets suportadas:', error);
        }
      }, 1500);
      
      setKit(stellarKit);
    } catch (error) {
      prodLog('Erro ao inicializar StellarWalletsKit', error);
      setWallet(prev => ({ 
        ...prev, 
        error: 'Erro ao inicializar o kit de carteiras' 
      }));
    }
  }, [isClient]);

  // Verificar se há uma wallet já conectada (persistência)
  useEffect(() => {
    const checkPersistedConnection = async () => {
      if (!kit || !isClient) return;

      try {
        const savedWalletId = localStorage.getItem('apollo-wallet-id');
        const savedAddress = localStorage.getItem('apollo-wallet-address');
        
        if (savedWalletId && savedAddress) {
          console.log('🔄 APOLLO WALLET - Recuperando conexão persistida...');
          console.log('💾 Dados do localStorage:', {
            walletId: savedWalletId,
            address: savedAddress
          });

          const persistedWalletState = {
            isConnected: true,
            address: savedAddress,
            selectedWallet: { id: savedWalletId } as ISupportedWallet,
            isLoading: false,
            error: null,
          };

          setWallet(prev => ({
            ...prev,
            ...persistedWalletState,
          }));

          console.log('✅ Conexão persistida restaurada:', persistedWalletState);
          console.log('🎯 Dados da sessão anterior disponíveis:', {
            walletId: savedWalletId,
            walletAddress: savedAddress,
            formattedAddress: `${savedAddress.slice(0, 8)}...${savedAddress.slice(-8)}`,
            isConnected: true,
            restoredAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        prodLog('Erro ao verificar conexão persistida', error);
      }
    };

    checkPersistedConnection();
  }, [kit, isClient]);

  const connectWallet = async () => {
    if (!kit) {
      setWallet(prev => ({ 
        ...prev, 
        error: 'Kit de carteiras não inicializado' 
      }));
      return;
    }

    // Limpar estado anterior e iniciar processo de conexão
    setWallet(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null,
      // Manter isConnected e address se já estiver conectado
    }));

    try {
      await kit.openModal({
        onWalletSelected: async (option: ISupportedWallet) => {
          try {
            console.log('🚀 APOLLO WALLET CONNECTION - Iniciando conexão...');
            console.log('📱 Carteira selecionada:', option);
            
            // Log dos dados da carteira conectada
            console.log('🔍 ANÁLISE DA WALLET:');
            console.log('🟢 WALLET CONECTADA - Estrutura:');
            console.log('🔧 Dados da carteira:', {
              id: option.id,
              name: option.name,
              icon: option.icon,
              url: option.url,
              isInstalled: (option as any).isInstalled || 'N/A',
              isAvailable: (option as any).isAvailable || 'N/A',
              type: (option as any).type || 'N/A',
              // Log completo do objeto
              fullObject: option
            });

            kit.setWallet(option.id);
            const addressResult = await kit.getAddress();
            
            console.log('📍 Resultado do getAddress():', addressResult);
            console.log('🏠 Endereço da carteira:', addressResult.address);
            
            // Tentar obter mais informações da carteira se disponível
            try {
              const publicKey = await (kit as any).getPublicKey?.();
              console.log('🔑 Chave pública (se disponível):', publicKey);
            } catch (pkError) {
              console.log('ℹ️ Chave pública não disponível:', pkError);
            }

            // Tentar obter informações da rede
            try {
              const networkDetails = {
                network: WalletNetwork.PUBLIC,
                networkPassphrase: 'Public Global Stellar Network ; September 2015',
                horizonUrl: 'https://horizon.stellar.org'
              };
              console.log('🌐 Detalhes da rede:', networkDetails);
            } catch (networkError) {
              console.log('⚠️ Erro ao obter detalhes da rede:', networkError);
            }
            
            // Salvar no localStorage para persistência (apenas no cliente)
            if (typeof window !== 'undefined') {
              localStorage.setItem('apollo-wallet-id', option.id);
              localStorage.setItem('apollo-wallet-address', addressResult.address);
              
              console.log('💾 Dados salvos no localStorage:', {
                walletId: option.id,
                address: addressResult.address
              });
            }
            
            const walletState = {
              isConnected: true,
              address: addressResult.address,
              selectedWallet: option,
              isLoading: false,
              error: null,
            };

            setWallet(walletState);

            console.log('✅ CONEXÃO CONCLUÍDA COM SUCESSO!');
            console.log('📊 Estado final da carteira:', walletState);
            // Normalizar dados da wallet conectada
            const normalizedWalletData = {
              // Dados básicos (sempre disponíveis)
              isConnected: true,
              walletAddress: addressResult.address,
              walletName: option.name,
              walletId: option.id || option.name?.toLowerCase(),
              
              // Dados da wallet (estrutura padrão)
              walletType: (option as any).type || 'browser_extension',
              walletIcon: option.icon,
              walletUrl: option.url,
              isWalletInstalled: (option as any).isInstalled || false,
              
              // Dados formatados
              formattedAddress: `${addressResult.address.slice(0, 8)}...${addressResult.address.slice(-8)}`,
              
                // Para uso em APIs
                stellarAddress: addressResult.address,
                networkPassphrase: 'Test SDF Network ; September 2015',              // Timestamp da conexão
              connectedAt: new Date().toISOString(),
              
              // Informações da estrutura da wallet
              walletStructure: 'standard',
              rawWalletData: option, // Dados brutos para referência
            };

            console.log('🎯 Dados NORMALIZADOS para o frontend:', normalizedWalletData);
            
            console.log('📋 RESUMO PARA INTEGRAÇÃO:');
            console.log(`   🏷️  Wallet: ${normalizedWalletData.walletName} (${normalizedWalletData.walletType})`);
            console.log(`   📍 Endereço: ${normalizedWalletData.stellarAddress}`);
            console.log(`   🎯 Para UI: ${normalizedWalletData.formattedAddress}`);
            console.log(`   📊 Estrutura: ${normalizedWalletData.walletStructure}`);
            
            console.log('💡 WALLET CONECTADA - Dados disponíveis:');
            console.log('   ✅ Todos os metadados completos');
            console.log('   ✅ Ícones oficiais');
            console.log('   ✅ URLs oficiais');
            console.log('   ✅ Status de instalação');
            console.log('   ℹ️ Albedo foi removido das opções disponíveis');
            
            console.log('🔗 Kit instance disponível para:', {
              signTransaction: 'kit.signTransaction(xdr, options)',
              getAddress: 'kit.getAddress()',
              setWallet: 'kit.setWallet(walletId)',
              // Adicione outros métodos conforme necessário
            });

            // Disponibilizar dados globalmente para fácil acesso no console
            if (typeof window !== 'undefined') {
              (window as any).apolloWallet = {
                address: addressResult.address,
                walletName: option.name,
                walletId: option.id,
                formattedAddress: `${addressResult.address.slice(0, 8)}...${addressResult.address.slice(-8)}`,
                kit: kit,
                getWalletInfo: () => getWalletInfo(),
                // Funções utilitárias para o console
                disconnect: () => disconnectWallet(),
                signTest: (xdr: string) => signTransaction(xdr),
              };
              
              console.log('🌍 DADOS GLOBAIS DISPONÍVEIS:');
              console.log('Digite "window.apolloWallet" no console para acessar dados da carteira!');
              console.log('Comandos disponíveis:');
              console.log('• window.apolloWallet.address → Endereço da carteira');
              console.log('• window.apolloWallet.getWalletInfo() → Todos os dados');
              console.log('• window.apolloWallet.disconnect() → Desconectar');
              console.log('• window.apolloWallet.kit → Instance do StellarWalletsKit');
            }

            devLog('Carteira conectada com sucesso', { wallet: option.name, address: addressResult.address });
          } catch (error) {
            const errorMessage = formatErrorMessage(error);
            prodLog('Erro ao conectar carteira', error);
            setWallet(prev => ({
              ...prev,
              isLoading: false,
              error: errorMessage || 'Erro ao conectar com a carteira selecionada',
            }));
          }
        },
        onClosed: (err) => {
          try {
            setWallet(prev => ({ ...prev, isLoading: false }));
            
            if (shouldShowError(err)) {
              const errorMessage = formatErrorMessage(err);
              prodLog('Erro ao fechar modal de carteiras', err);
              setWallet(prev => ({ 
                ...prev, 
                error: errorMessage || 'Erro ao abrir modal de carteiras' 
              }));
            } else {
              // Modal foi fechado normalmente pelo usuário
              devLog('Modal de carteiras fechado pelo usuário', err);
              setWallet(prev => ({ ...prev, error: null }));
            }
          } catch (closeError) {
            prodLog('Erro no tratamento de fechamento do modal', closeError);
          }
        },
        modalTitle: 'Conectar Carteira Stellar',
        notAvailableText: 'Nenhuma carteira disponível',
      });
    } catch (error) {
      const errorMessage = formatErrorMessage(error);
      prodLog('Erro ao abrir modal de carteiras', error);
      setWallet(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage || 'Erro ao abrir seleção de carteiras',
      }));
    }
  };

  const disconnectWallet = () => {
    // Limpar localStorage (apenas no cliente)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('apollo-wallet-id');
      localStorage.removeItem('apollo-wallet-address');
    }
    
    setWallet({
      isConnected: false,
      address: null,
      selectedWallet: null,
      isLoading: false,
      error: null,
    });
    
    // Limpar dados globais
    if (typeof window !== 'undefined') {
      (window as any).apolloWallet = null;
      console.log('🌍 Dados globais limpos - window.apolloWallet agora é null');
    }
    
    devLog('Carteira desconectada');
  };

  const signTransaction = async (transactionXDR: string): Promise<string> => {
    console.log('📝 APOLLO WALLET - Iniciando assinatura de transação...');
    
    if (!kit || !wallet.isConnected || !wallet.address) {
      console.error('❌ Erro: Carteira não conectada para assinar transação');
      throw new Error('Carteira não conectada');
    }

    console.log('📄 Dados da transação:', {
      transactionXDR: transactionXDR,
      walletAddress: wallet.address,
      walletName: wallet.selectedWallet?.name,
      networkPassphrase: WalletNetwork.TESTNET,
    });

    try {
      const signOptions = {
        address: wallet.address,
        networkPassphrase: WalletNetwork.TESTNET, // Usando Testnet para testes seguros
      };
      
      console.log('⚙️ Opções de assinatura:', signOptions);
      
      const signResult = await kit.signTransaction(transactionXDR, signOptions);
      
      console.log('✅ Transação assinada com sucesso!');
      console.log('📋 Resultado da assinatura:', signResult);
      console.log('🔐 XDR assinado:', signResult.signedTxXdr);
      
      // Log para facilitar debugging
      console.log('🎯 Dados completos do resultado:', {
        originalXDR: transactionXDR,
        signedXDR: signResult.signedTxXdr,
        wallet: wallet.selectedWallet?.name,
        address: wallet.address,
        signedAt: new Date().toISOString(),
      });
      
      return signResult.signedTxXdr;
    } catch (error) {
      console.error('❌ Erro ao assinar transação:', error);
      console.log('🔍 Detalhes do erro:', {
        error: error,
        transactionXDR: transactionXDR,
        walletState: wallet,
      });
      prodLog('Erro ao assinar transação', error);
      throw error;
    }
  };

  // Função para obter informações completas da carteira
  const getWalletInfo = () => {
    const walletInfo = {
      // Estado básico
      isConnected: wallet.isConnected,
      isLoading: wallet.isLoading,
      error: wallet.error,
      
      // Dados da carteira
      address: wallet.address,
      formattedAddress: wallet.address ? `${wallet.address.slice(0, 8)}...${wallet.address.slice(-8)}` : null,
      
      // Metadados da carteira
      walletId: wallet.selectedWallet?.id,
      walletName: wallet.selectedWallet?.name,
      walletIcon: wallet.selectedWallet?.icon,
      walletUrl: wallet.selectedWallet?.url,
      walletType: (wallet.selectedWallet as any)?.type,
      isWalletInstalled: (wallet.selectedWallet as any)?.isInstalled || false,
      isWalletAvailable: (wallet.selectedWallet as any)?.isAvailable || false,
      
      // Dados da rede
      network: WalletNetwork.TESTNET,
      networkPassphrase: 'Test SDF Network ; September 2015',
      horizonUrl: 'https://horizon-testnet.stellar.org',
      
      // Dados do localStorage
      persistedWalletId: typeof window !== 'undefined' ? localStorage.getItem('apollo-wallet-id') : null,
      persistedAddress: typeof window !== 'undefined' ? localStorage.getItem('apollo-wallet-address') : null,
      
      // Kit disponível
      kitAvailable: !!kit,
      
      // Timestamp
      lastChecked: new Date().toISOString(),
      
      // Objeto completo da carteira (para debug)
      fullWalletObject: wallet.selectedWallet,
      fullWalletState: wallet,
    };
    
    console.log('📊 APOLLO WALLET INFO - Dados completos:', walletInfo);
    return walletInfo;
  };

  const contextValue: WalletContextType = {
    wallet,
    kit,
    connectWallet,
    disconnectWallet,
    signTransaction,
    getWalletInfo,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet deve ser usado dentro de um WalletProvider');
  }
  return context;
}
