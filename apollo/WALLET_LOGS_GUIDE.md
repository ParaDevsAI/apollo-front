# 📋 Guia Completo dos Logs de Wallet - Apollo

## 🎯 Objetivo

Este guia explica **exatamente quais dados** são retornados quando você conecta uma carteira Stellar, com logs detalhados para facilitar a integração com seu backend/frontend.

## 🔍 Como Acessar os Logs

### **1. Abrir Developer Tools**
```
Tecla F12 ou Botão Direito → "Inspecionar" → Aba "Console"
```

### **2. Testar Logs**
1. Acesse: `http://localhost:3000`
2. Abra o console (F12)
3. **Conecte uma carteira** (navbar ou SignInCard)
4. **Use os botões de teste** em `/examples/WalletIntegrationExample.tsx`

## 📊 Logs Disponíveis

### **🚀 Log 1: Início da Conexão**
```javascript
🚀 APOLLO WALLET CONNECTION - Iniciando conexão...
```

### **📱 Log 2: Dados da Carteira Selecionada**
```javascript
📱 Carteira selecionada: {
  id: "freighter",
  name: "Freighter",
  icon: "https://...",
  url: "https://freighter.app",
  isInstalled: true,
  isAvailable: true,
  type: "browser_extension"
}
```

**💡 Dados úteis para seu frontend:**
- `id`: Identificador único da carteira
- `name`: Nome amigável para exibir
- `icon`: URL do ícone da carteira
- `isInstalled`: Se está instalada no navegador

### **🔧 Log 3: Detalhes Completos da Carteira**
```javascript
🔧 Dados da carteira: {
  id: "freighter",
  name: "Freighter", 
  icon: "https://stellar.creit.tech/wallet-icons/freighter.png",
  url: "https://freighter.app",
  isInstalled: true,
  isAvailable: true,
  type: "browser_extension",
  fullObject: { /* objeto completo */ }
}
```

### **📍 Log 4: Endereço da Carteira**
```javascript
📍 Resultado do getAddress(): {
  address: "GCKFBEIYTKQAJAQKMQAWKW3PIDBQKPKDZVVBVQAT6PBKN46HAN4CD2FQJ5K"
}

🏠 Endereço da carteira: "GCKFBEIYTKQAJAQKMQAWKW3PIDBQKPKDZVVBVQAT6PBKN46HAN4CD2FQJ5K"
```

**💡 Este é o dado PRINCIPAL que você precisa:**
- **Endereço Stellar completo** para usar em APIs
- **56 caracteres** começando com 'G'
- **Usado para todas operações** na blockchain

### **🔑 Log 5: Chave Pública (se disponível)**
```javascript
🔑 Chave pública (se disponível): "GCKFBEIYTKQ..."
```

### **🌐 Log 6: Detalhes da Rede**
```javascript
🌐 Detalhes da rede: {
  network: "PUBLIC",
  networkPassphrase: "Public Global Stellar Network ; September 2015",
  horizonUrl: "https://horizon.stellar.org"
}
```

**💡 Para configurar seu backend:**
- **Network**: PUBLIC (mainnet) ou TESTNET
- **Horizon URL**: Endpoint da API Stellar
- **Network Passphrase**: Para validação de transações

### **💾 Log 7: Dados Persistidos**
```javascript
💾 Dados salvos no localStorage: {
  walletId: "freighter",
  address: "GCKFBEIYTKQ..."
}
```

### **✅ Log 8: Estado Final da Carteira**
```javascript
✅ CONEXÃO CONCLUÍDA COM SUCESSO!

📊 Estado final da carteira: {
  isConnected: true,
  address: "GCKFBEIYTKQ...",
  selectedWallet: { /* dados da carteira */ },
  isLoading: false,
  error: null
}
```

### **🎯 Log 9: Dados Formatados para Frontend**
```javascript
🎯 Dados disponíveis para o frontend: {
  // Dados básicos
  isConnected: true,
  walletAddress: "GCKFBEIYTKQ...",
  walletName: "Freighter",
  walletId: "freighter",
  walletType: "browser_extension",
  
  // Dados formatados  
  formattedAddress: "GCKFBEIY...CD2FQJ5K",
  
  // Metadados
  walletIcon: "https://...",
  walletUrl: "https://freighter.app",
  isWalletInstalled: true,
  
  // Para uso em APIs
  stellarAddress: "GCKFBEIYTKQ...",
  networkPassphrase: "Public Global Stellar Network ; September 2015",
  
  // Timestamp
  connectedAt: "2024-01-15T10:30:00.000Z"
}
```

**💡 Este log contém TUDO que você precisa para integrar!**

### **🔗 Log 10: Métodos Disponíveis**
```javascript
🔗 Kit instance disponível para: {
  signTransaction: "kit.signTransaction(xdr, options)",
  getAddress: "kit.getAddress()",
  setWallet: "kit.setWallet(walletId)"
}
```

## 📝 Logs de Assinatura de Transação

### **Quando você usar `signTransaction()`:**

```javascript
📝 APOLLO WALLET - Iniciando assinatura de transação...

📄 Dados da transação: {
  transactionXDR: "AAAAAgAAAAB...",
  walletAddress: "GCKFBEIYTKQ...",
  walletName: "Freighter",
  networkPassphrase: "Public Global Stellar Network ; September 2015"
}

⚙️ Opções de assinatura: {
  address: "GCKFBEIYTKQ...",
  networkPassphrase: "Public Global Stellar Network ; September 2015"
}

✅ Transação assinada com sucesso!

🔐 XDR assinado: "AAAAAgAAAAB...ASSINADO"

🎯 Dados completos do resultado: {
  originalXDR: "AAAAAgAAAAB...",
  signedXDR: "AAAAAgAAAAB...ASSINADO", 
  wallet: "Freighter",
  address: "GCKFBEIYTKQ...",
  signedAt: "2024-01-15T10:35:00.000Z"
}
```

## 🔄 Logs de Conexão Persistida (Reload da Página)

```javascript
🔄 APOLLO WALLET - Recuperando conexão persistida...

💾 Dados do localStorage: {
  walletId: "freighter",
  address: "GCKFBEIYTKQ..."
}

✅ Conexão persistida restaurada: { /* estado da carteira */ }

🎯 Dados da sessão anterior disponíveis: {
  walletId: "freighter", 
  walletAddress: "GCKFBEIYTKQ...",
  formattedAddress: "GCKFBEIY...CD2FQJ5K",
  isConnected: true,
  restoredAt: "2024-01-15T10:40:00.000Z"
}
```

## 🛠️ Acesso Fácil aos Dados da Carteira

### **🌍 Dados Globais (NOVO!):**
Após conectar uma carteira, você pode acessar todos os dados diretamente no console:

```javascript
// No console do navegador (F12)
window.apolloWallet

// Resultará em:
{
  address: "GCKFBEIYTKQ...",
  walletName: "Freighter", 
  walletId: "freighter",
  formattedAddress: "GCKFBEIY...CD2FQJ5K",
  kit: StellarWalletsKit,
  getWalletInfo: function(),
  disconnect: function(),
  signTest: function(xdr)
}
```

### **🎯 Comandos Rápidos no Console:**
```javascript
// Ver endereço da carteira
window.apolloWallet.address

// Ver todos os dados
window.apolloWallet.getWalletInfo()

// Desconectar carteira
window.apolloWallet.disconnect()

// Acessar kit diretamente
window.apolloWallet.kit.getAddress()

// Testar assinatura (com XDR válido)
window.apolloWallet.signTest("AAAAAgAAAAB...")
```

### **🔧 Função `getWalletInfo()` Manual:**
```javascript
// Opção 1: Via dados globais (FÁCIL)
window.apolloWallet.getWalletInfo()

// Opção 2: Via hook (em código)
const { getWalletInfo } = useWalletKit();
const walletData = getWalletInfo();
```

### **Retorno completo:**
```javascript
📊 APOLLO WALLET INFO - Dados completos: {
  // Estado básico
  isConnected: true,
  isLoading: false,
  error: null,
  
  // Dados da carteira
  address: "GCKFBEIYTKQ...",
  formattedAddress: "GCKFBEIY...CD2FQJ5K",
  
  // Metadados da carteira
  walletId: "freighter",
  walletName: "Freighter",
  walletIcon: "https://...",
  walletUrl: "https://freighter.app",
  walletType: "browser_extension",
  isWalletInstalled: true,
  isWalletAvailable: true,
  
  // Dados da rede
  network: "PUBLIC",
  networkPassphrase: "Public Global Stellar Network ; September 2015",
  horizonUrl: "https://horizon.stellar.org",
  
  // Dados do localStorage
  persistedWalletId: "freighter",
  persistedAddress: "GCKFBEIYTKQ...",
  
  // Status do kit
  kitAvailable: true,
  
  // Timestamps
  lastChecked: "2024-01-15T10:45:00.000Z",
  
  // Debug completo
  fullWalletObject: { /* objeto completo da carteira */ },
  fullWalletState: { /* estado completo do contexto */ }
}
```

## 🎮 Como Testar na Prática

### **1. Teste Básico de Conexão:**
1. Vá para `http://localhost:3000`
2. Abra Console (F12)
3. Clique "CONNECT WALLET" (navbar ou card)
4. **Veja todos os logs acima no console!**
5. **NOVO**: Digite `window.apolloWallet` no console para acesso direto aos dados!

### **2. Teste Rápido no Console (NOVO!):**
```javascript
// 1. Conecte uma carteira primeiro
// 2. Digite no console:

window.apolloWallet                    // Ver todos os dados
window.apolloWallet.address           // Endereço completo
window.apolloWallet.walletName        // Nome da carteira  
window.apolloWallet.getWalletInfo()   // Dados completos
```

### **3. Teste com Botões de Debug:**
1. Vá para `http://localhost:3000` (se tiver o exemplo ativo)
2. Role até "4. Funcionalidades Avançadas"
3. Use os botões:
   - **"Ver Dados da Carteira"** → Chama `getWalletInfo()`
   - **"Verificar Kit Instance"** → Mostra métodos disponíveis
   - **"Ver LocalStorage"** → Mostra dados persistidos

### **4. Teste de Assinatura:**
1. Conecte uma carteira
2. Clique "Assinar Transação de Exemplo"
3. **Veja logs detalhados da assinatura!**
4. **NOVO**: Use `window.apolloWallet.signTest("XDR_AQUI")` no console!

## 💡 Dicas para Integração

### **Para Backend/API:**
```javascript
// Use estes dados do log "🎯 Dados disponíveis para o frontend":
{
  stellarAddress: "GCKFBEIY...",     // ✅ Para salvar no banco
  walletName: "Freighter",          // ✅ Para exibir no perfil
  walletType: "browser_extension",  // ✅ Para analytics
  networkPassphrase: "Public...",   // ✅ Para validar transações
  connectedAt: "2024-01-15...",     // ✅ Para auditoria
}
```

### **Para Estado do Frontend:**
```javascript
// Use estes dados do estado da carteira:
{
  isConnected: true,        // ✅ Para condicionar UI
  address: "GCKFBEIY...",   // ✅ Para mostrar endereço
  formattedAddress: "...",  // ✅ Para exibir truncado
  walletName: "Freighter",  // ✅ Para mostrar carteira
  error: null               // ✅ Para mostrar erros
}
```

### **Para Transações:**
```javascript
// Use o XDR assinado retornado:
{
  signedXDR: "AAAAAgAAAAB...ASSINADO",  // ✅ Para enviar ao Horizon
  originalXDR: "AAAAAgAAAAB...",        // ✅ Para debug
  address: "GCKFBEIY...",               // ✅ Para validar origem
}
```

## 🚀 Próximos Passos

1. **Conecte uma carteira** e veja os logs
2. **Copie os dados** que você precisa para sua integração
3. **Use o endereço Stellar** nas suas APIs
4. **Implemente assinatura** de transações conforme necessário
5. **Configure persistência** com os dados do localStorage

**Todos os dados que você precisa para se comunicar com o frontend estão nos logs! 🎯**
