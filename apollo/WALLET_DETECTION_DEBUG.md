# 🔍 Guia de Debug - Detecção de Wallets Stellar

## 🚨 **Problema Identificado**
Freighter e Lobstr não aparecem no modal de conexão mesmo estando instaladas.

## ✅ **Soluções Implementadas**

### **1. Debug Logs Detalhados**
Adicionamos logs abrangentes no console que mostram:
- ✅ Status de cada wallet no navegador
- ✅ Re-verificação após delay (extensões podem demorar para carregar)
- ✅ Lista de wallets detectadas pelo StellarWalletsKit

### **2. Como Verificar**

#### **Passo 1: Abrir Console do Navegador**
1. **Chrome/Edge**: `F12` → aba `Console`
2. **Firefox**: `F12` → aba `Console`

#### **Passo 2: Recarregar a Página**
Após recarregar, você verá logs como:

```
🔍 APOLLO WALLET DEBUG - Verificando wallets no navegador:
window.freighter: ✅ DETECTADO ou ❌ NÃO DETECTADO
window.lobstrWallet: ✅ DETECTADO ou ❌ NÃO DETECTADO
window.xBull: ✅ DETECTADO ou ❌ NÃO DETECTADO
window.rabet: ✅ DETECTADO ou ❌ NÃO DETECTADO

🔧 APOLLO WALLET SETUP:
✅ Módulos habilitados: (4) ['FreighterModule', 'xBullModule', 'RabetModule', 'LobstrModule']
❌ Albedo removido do modal

🎯 WALLETS SUPORTADAS NO MODAL: [número]
1. Freighter: { id: "freighter", isAvailable: true/false, isInstalled: true/false }
2. Lobstr: { id: "lobstr", isAvailable: true/false, isInstalled: true/false }
...
```

## 🔧 **Possíveis Soluções**

### **Se wallet não é detectada (`❌ NÃO DETECTADO`):**

#### **Freighter:**
1. **Verificar instalação**: Vá em `chrome://extensions/` e confirme que Freighter está ativo
2. **Reiniciar navegador**: Feche completamente e reabra
3. **Testar manualmente**: No console, digite `window.freighter` - deve retornar um objeto

#### **Lobstr:**
1. **Verificar se é extensão de navegador**: Lobstr pode ser apenas mobile app
2. **Verificar versão**: Algumas versões antigas podem não injetar `window.lobstrWallet`
3. **Testar no console**: Digite `window.lobstrWallet` para verificar

### **Se wallet é detectada mas não aparece no modal:**
- Pode ser problema de timing no carregamento do StellarWalletsKit
- Os logs `🎯 WALLETS SUPORTADAS NO MODAL` mostrarão quais foram reconhecidas

## 📱 **Informações Importantes**

### **Wallets Disponíveis no Modal:**
- ✅ **Freighter** - Extensão de navegador mais popular
- ✅ **xBull** - Extensão de navegador  
- ✅ **Rabet** - Extensão de navegador
- ✅ **Lobstr** - Principalmente mobile, pode ter versão web limitada
- ❌ **Albedo** - Removido conforme solicitado

### **Recomendações:**
1. **Para testes**: Use principalmente **Freighter** (mais estável)
2. **Lobstr**: Pode ser melhor testado no mobile ou verificar se há versão web oficial
3. **Sempre recarregar** após instalar/ativar uma extensão

## 🆘 **Próximos Passos**

1. **Execute o projeto**: `yarn dev`
2. **Abra o console** do navegador
3. **Recarregue a página** e veja os logs
4. **Tente conectar** e observe os logs de conexão
5. **Compartilhe os logs** se o problema persistir

---

**💡 Dica**: Se uma wallet não funcionar, teste com Freighter primeiro para validar que o sistema está funcionando corretamente.
