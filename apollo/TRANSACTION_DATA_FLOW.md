# 📊 Dados de Transação - O que é enviado?

## 🎯 **Cenário Atual: Apollo SEM Backend**

### **🔄 Fluxo Atual:**
```
Frontend → Wallet → Stellar Network ✅
```

### **📋 Dados Disponíveis no Frontend:**

#### **1. 🔗 Durante a Conexão da Wallet:**
```typescript
const walletData = {
  // ✅ Dados públicos disponíveis
  address: "GABC123...XYZ789",
  walletType: "Freighter",
  network: "Testnet",
  isConnected: true,
  connectedAt: "2024-01-15T10:30:00Z"
};
```

#### **2. 🧪 Durante Criação da Transação:**
```typescript
const transactionData = {
  // ✅ Dados da transação (antes de assinar)
  type: "payment",
  sourceAccount: "GABC123...XYZ789",
  destinationAccount: "GDEF456...ABC123",
  amount: "10.0000000",
  asset: "XLM",
  memo: "Payment from Apollo",
  fee: "100",
  sequence: "123456789",
  networkPassphrase: "Test SDF Network ; September 2015",
  
  // 📄 XDR não assinado
  unsignedXDR: "AAAAAgAAAAC7JAb4dBSodB...",
  
  // 🕐 Timestamps
  createdAt: "2024-01-15T10:31:00Z"
};
```

#### **3. 🔐 Após Assinatura da Wallet:**
```typescript
const signedTransactionData = {
  // ✅ Dados originais + assinatura
  ...transactionData,
  
  // 🔐 Dados da assinatura
  signedXDR: "AAAAAgAAAAC7JAb4dBSodB...MfHj5fCw==",
  signature: "base64_signature_here",
  publicKey: "GABC123...XYZ789",
  signedAt: "2024-01-15T10:31:30Z",
  
  // 🔒 NOTA: Chave privada NUNCA sai da wallet!
};
```

#### **4. 🚀 Resposta da Rede Stellar:**
```typescript
const stellarResponse = {
  // ✅ Confirmação da rede
  successful: true,
  hash: "a4c1b1a2e5f3d4b6c7a8f9e0d1c2b3a4",
  ledger: 1234567,
  fee_charged: "100",
  operation_count: 1,
  
  // 📊 Dados detalhados
  paging_token: "1234567890123456",
  source_account: "GABC123...XYZ789",
  created_at: "2024-01-15T10:31:45Z",
  
  // 🎯 Operações executadas
  operations: [{
    type: "payment",
    from: "GABC123...XYZ789",
    to: "GDEF456...ABC123",
    amount: "10.0000000",
    asset_type: "native"
  }],
  
  // 📈 Links para explorer
  _links: {
    transaction: "https://stellar.expert/explorer/testnet/tx/a4c1b1a2..."
  }
};
```

---

## 🏢 **Se Apollo TIVESSE Backend:**

### **🔄 Fluxo COM Backend:**
```
Frontend → Backend → Stellar Network
```

### **📤 O que seria enviado PARA o backend:**

#### **1. 📋 Dados da Transação Criada:**
```typescript
// POST /api/transactions/create
const transactionRequest = {
  // 👤 Dados do usuário
  userAddress: "GABC123...XYZ789",
  walletType: "Freighter",
  sessionId: "session_uuid_here",
  
  // 💸 Dados da transação
  type: "payment",
  destinationAddress: "GDEF456...ABC123",
  amount: "10.0000000",
  asset: "XLM",
  memo: "Payment from Apollo",
  
  // 🌐 Metadados
  network: "testnet",
  userAgent: "Mozilla/5.0...",
  ipAddress: "192.168.1.100",
  timestamp: "2024-01-15T10:31:00Z",
  
  // 📄 XDR não assinado (opcional)
  unsignedXDR: "AAAAAgAAAAC7JAb4dBSodB..."
};
```

#### **2. 🔐 Transação Assinada:**
```typescript
// POST /api/transactions/submit
const signedTransactionRequest = {
  // 🔗 Referência da transação
  transactionId: "txn_uuid_from_step_1",
  userAddress: "GABC123...XYZ789",
  
  // 🔐 Dados assinados
  signedXDR: "AAAAAgAAAAC7JAb4dBSodB...MfHj5fCw==",
  signature: "base64_signature_here",
  publicKey: "GABC123...XYZ789",
  
  // 🕐 Timing
  signedAt: "2024-01-15T10:31:30Z",
  timeToSign: 30000, // 30 segundos
  
  // ❌ NUNCA incluiria chave privada!
};
```

#### **3. 📨 Confirmação da Rede:**
```typescript
// POST /api/transactions/confirm
const confirmationData = {
  // 🔗 Referências
  transactionId: "txn_uuid",
  userAddress: "GABC123...XYZ789",
  
  // ✅ Dados da confirmação
  stellarHash: "a4c1b1a2e5f3d4b6c7a8f9e0d1c2b3a4",
  successful: true,
  ledgerNumber: 1234567,
  feeCharged: "100",
  
  // 🕐 Timestamps
  submittedAt: "2024-01-15T10:31:45Z",
  confirmedAt: "2024-01-15T10:31:50Z",
  totalTime: 50000, // 50 segundos total
  
  // 📊 Resultado completo da rede
  stellarResponse: { /* objeto completo do Horizon */ }
};
```

### **📥 O que o backend RETORNARIA:**

#### **1. 🎯 Resposta de Criação:**
```typescript
// Response de POST /api/transactions/create
{
  success: true,
  transactionId: "txn_12345678-1234-1234-1234-123456789012",
  unsignedXDR: "AAAAAgAAAAC7JAb4dBSodB...",
  expiresAt: "2024-01-15T10:36:00Z", // 5 min para assinar
  estimatedFee: "100"
}
```

#### **2. ✅ Resposta de Confirmação:**
```typescript
// Response de POST /api/transactions/confirm
{
  success: true,
  transactionId: "txn_12345678...",
  stellarHash: "a4c1b1a2e5f3d4b6c7a8f9e0d1c2b3a4",
  status: "confirmed",
  explorerUrl: "https://stellar.expert/explorer/testnet/tx/a4c1b1a2...",
  
  // 📊 Analytics (opcional)
  analytics: {
    processingTime: "5.2s",
    networkFee: "100 stroops",
    estimatedUSD: "$0.001"
  }
}
```

---

## 🔍 **Dados Específicos por Tipo de Transação:**

### **💸 Payment (Pagamento):**
```typescript
{
  type: "payment",
  sourceAccount: "GABC123...XYZ789",
  destinationAccount: "GDEF456...ABC123", 
  amount: "10.0000000",
  asset: {
    type: "native", // XLM
    code: "XLM"
  },
  memo: "Payment description"
}
```

### **👤 Create Account:**
```typescript
{
  type: "create_account",
  sourceAccount: "GABC123...XYZ789",
  destinationAccount: "GNEW789...NEW123",
  startingBalance: "5.0000000", // Mínimo para criar conta
  memo: "Welcome to Stellar!"
}
```

### **🔄 Asset Exchange:**
```typescript
{
  type: "path_payment_strict_send",
  sourceAccount: "GABC123...XYZ789",
  destinationAccount: "GDEF456...ABC123",
  sendAsset: { code: "USDC", issuer: "GA5Z..." },
  sendAmount: "100.0000000",
  destAsset: { code: "XLM" },
  destMin: "50.0000000",
  path: [{ code: "BTC", issuer: "GB7X..." }]
}
```

---

## 🛡️ **Segurança - O que NUNCA é enviado:**

### **❌ Dados que ficam SEMPRE na wallet:**
```typescript
// NUNCA ENVIADOS - nem para frontend nem backend:
{
  privateKey: "S...", // Chave privada
  secretSeed: "S...", // Seed da conta  
  mnemonic: ["word1", "word2", ...], // 12/24 palavras
  password: "user_password", // Senha da wallet
  encryptedData: "...", // Dados criptografados da wallet
}
```

### **✅ Dados seguros para enviar:**
```typescript
// SEGUROS - podem ser enviados:
{
  publicKey: "G...", // Chave pública (endereço)
  signedXDR: "...", // Transação assinada
  signature: "...", // Assinatura criptográfica
  walletType: "Freighter", // Tipo da wallet
  networkPassphrase: "Test SDF...", // Rede utilizada
}
```

---

## 💡 **Exemplo Prático - Console do Apollo:**

### **🧪 Teste agora no seu Apollo:**

```javascript
// 1. Conecte uma wallet
// 2. Abra console (F12) 
// 3. Digite:

window.apolloWallet?.getWalletInfo();

// Resultado - dados que você TEM acesso:
{
  address: "GA2C5RFPE55...",     // ✅ Público
  walletType: "Freighter",       // ✅ Público  
  isConnected: true,             // ✅ Estado
  network: "PUBLIC",             // ✅ Rede
  lastChecked: "2024-01-15T...", // ✅ Timestamp
  
  // ❌ Sem chaves privadas!
}
```

---

## 🎯 **Resumo para Apollo:**

### **📊 Dados Disponíveis HOJE (sem backend):**
- ✅ **Endereço público** da wallet
- ✅ **Tipo da wallet** (Freighter, Lobstr, etc.)
- ✅ **Status de conexão**
- ✅ **Dados da transação** (antes e depois da assinatura)
- ✅ **Resposta da rede Stellar**

### **🔮 Se adicionar backend no FUTURO:**
- ✅ **Histórico** de transações
- ✅ **Analytics** de uso
- ✅ **Notificações** de eventos  
- ✅ **Cache** de dados
- ✅ **Integrações** com sistemas externos

### **🔐 Sempre Seguro:**
- ❌ **Chaves privadas** nunca saem da wallet
- ❌ **Seeds/Mnemonics** ficam locais
- ❌ **Senhas** não são transmitidas

---

<div align="center">
  <h3>🎉 Apollo = Arquitetura Segura!</h3>
  <p>Você tem acesso a todos os dados necessários sem comprometer a segurança.</p>
  <p><strong>Frontend → Wallet → Stellar</strong> é a forma mais segura! 🛡️</p>
</div>
