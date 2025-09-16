"use client";

/**
 * EXEMPLO DE USO DA INTEGRAÇÃO STELLAR WALLETS KIT
 * 
 * Este arquivo demonstra como usar a integração implementada
 * em diferentes cenários da aplicação Apollo
 */

import { useWalletKit } from "@/hooks/useWalletKit";
import WalletButton from "@/components/Wallet/WalletButton";
import WalletStatus from "@/components/Wallet/WalletStatus";

export default function WalletIntegrationExample() {
  const { walletInfo, signTransaction, formatAddress, kit, getWalletInfo } = useWalletKit();

  // Exemplo de como assinar uma transação
  const handleSignExampleTransaction = async () => {
    if (!walletInfo.isConnected) {
      alert('Conecte uma carteira primeiro!');
      return;
    }

    try {
      // Exemplo de XDR de transação (substitua por uma transação real)
      const exampleXDR = "AAAAAgAAAABYnz1n..."; // XDR de exemplo
      
      const signedTransaction = await signTransaction(exampleXDR);
      console.log('Transação assinada:', signedTransaction);
      alert('Transação assinada com sucesso!');
    } catch (error) {
      console.error('Erro ao assinar transação:', error);
      alert('Erro ao assinar transação');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">
        Exemplo de Integração StellarWalletsKit
      </h1>

      {/* Seção 1: Botões de Wallet */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          1. Componentes de Botão
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Botão Padrão */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Botão Padrão</h3>
            <WalletButton />
          </div>

          {/* Botão Pequeno */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Botão Pequeno</h3>
            <WalletButton 
              size="sm"
              connectText="Conectar"
              disconnectText="Sair"
            />
          </div>

          {/* Botão Grande */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Botão Grande</h3>
           <WalletButton 
             size="lg"
             variant="outline"
             connectText="Connect Stellar Wallet"
           />
          </div>
        </div>
      </section>

      {/* Seção 2: Status da Wallet */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          2. Status da Wallet
        </h2>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <WalletStatus showDetails={true} />
        </div>
      </section>

      {/* Seção 3: Informações da Wallet */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          3. Informações da Carteira Conectada
        </h2>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          {walletInfo.isConnected ? (
            <div className="space-y-2">
              <p className="text-green-400 font-medium">
                ✅ Carteira Conectada
              </p>
              <p className="text-gray-300">
                <strong>Endereço:</strong> {walletInfo.address}
              </p>
              <p className="text-gray-300">
                <strong>Endereço Formatado:</strong> {walletInfo.formattedAddress}
              </p>
              {walletInfo.walletName && (
                <p className="text-gray-300">
                  <strong>Carteira:</strong> {walletInfo.walletName}
                </p>
              )}
            </div>
          ) : (
            <p className="text-yellow-400">
              Nenhuma carteira conectada
            </p>
          )}
        </div>
      </section>

      {/* Seção 4: Funcionalidades Avançadas */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">
          4. Funcionalidades Avançadas
        </h2>
        
        <div className="bg-gray-800 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleSignExampleTransaction}
              disabled={!walletInfo.isConnected}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assinar Transação de Exemplo
            </button>

            <button
              onClick={() => {
                console.log('🔍 CHAMANDO getWalletInfo() manualmente...');
                const info = getWalletInfo();
                alert(`Dados da carteira logados no console! Endereço: ${info.address || 'Não conectado'}`);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Ver Dados da Carteira (Console)
            </button>

            <button
              onClick={() => {
                console.log('📱 KIT INSTANCE:', kit);
                console.log('🔧 Métodos disponíveis no kit:', {
                  signTransaction: !!kit?.signTransaction,
                  getAddress: !!kit?.getAddress,
                  setWallet: !!kit?.setWallet,
                  openModal: !!kit?.openModal,
                });
                if (kit) {
                  alert('Kit disponível! Verifique o console para detalhes.');
                } else {
                  alert('Kit não disponível ainda.');
                }
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Verificar Kit Instance
            </button>

            <button
              onClick={() => {
                console.log('💾 DADOS DO LOCALSTORAGE:');
                console.log('Wallet ID:', localStorage.getItem('apollo-wallet-id'));
                console.log('Wallet Address:', localStorage.getItem('apollo-wallet-address'));
                console.log('🎯 Estado atual da carteira:', walletInfo);
                alert('Dados do localStorage logados no console!');
              }}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Ver LocalStorage
            </button>
          </div>

          <div className="text-sm text-gray-400 mt-4">
            <p><strong>🔍 Como usar os logs:</strong></p>
            <p>• <strong>Conecte uma carteira</strong> e veja logs detalhados no console</p>
            <p>• <strong>Use os botões acima</strong> para explorar dados da carteira</p>
            <p>• <strong>Assine uma transação</strong> para ver logs de assinatura</p>
            <p>• <strong>Abra o Developer Tools (F12)</strong> para ver todos os logs</p>
          </div>
        </div>
      </section>

      {/* Seção 5: Como Usar em Outros Componentes */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">
          5. Como Usar em Outros Componentes
        </h2>
        
        <div className="bg-gray-800 p-4 rounded-lg">
          <pre className="text-sm text-gray-300 overflow-x-auto">
{`// 1. Importar o hook
import { useWalletKit } from "@/hooks/useWalletKit";

// 2. Usar no componente
const { walletInfo, connect, disconnect, signTransaction } = useWalletKit();

// 3. Verificar se está conectado
if (walletInfo.isConnected) {
  // Executar ações que requerem carteira
}

// 4. Conectar carteira
await connect();

// 5. Assinar transação
const signed = await signTransaction(xdr);`}
          </pre>
        </div>
      </section>
    </div>
  );
}
