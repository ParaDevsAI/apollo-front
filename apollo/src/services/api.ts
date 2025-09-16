/**
 * Apollo Backend API Client
 * Handles all communication with the Apollo Backend Server
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

interface QuestInfo {
  id: number;
  admin: string;
  reward_token: string;
  reward_per_winner: number;
  max_winners: number;
  distribution: 'Raffle' | 'Fcfs';
  quest_type: any;
  end_timestamp: number;
  is_active: boolean;
  total_reward_pool: number;
  title: string;
  description: string;
}

interface QuestStatus {
  questId: number;
  userAddress: string;
  questInfo: QuestInfo;
  isRegistered: boolean;
  isWinner: boolean;
  canClaim: boolean;
  timestamp: string;
}

interface WalletAuthResponse {
  token: string;
  user: {
    id: string;
    userName: string;
    publicKey: string;
    authMethod: string;
    connectedAt: string;
  };
  instructions: {
    message: string;
    note: string;
    availableActions: string[];
  };
}

class ApolloApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    
    // Try to load token from localStorage
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('apollo-auth-token');
    }
    
    // Runtime sanity check: warn if API base URL points to the frontend (common misconfiguration)
    try {
      if (typeof window !== 'undefined') {
        const apiUrl = new URL(this.baseUrl, window.location.href);
        const frontendOrigin = window.location.origin;

        if (apiUrl.origin === frontendOrigin) {
          console.warn(`⚠️ NEXT_PUBLIC_API_BASE_URL (${this.baseUrl}) appears to point to the frontend origin (${frontendOrigin}). This will return HTML pages instead of JSON from the backend and cause API requests to fail.`);
        }
      }
    } catch (e) {
      // ignore URL parsing errors
    }
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Clonar a response para podermos ler texto em caso de falha no JSON
      const clonedResponse = response.clone();

      // Verificar se a resposta tem Content-Type JSON
      const contentType = response.headers.get('content-type') || '';

      if (!contentType.includes('application/json')) {
        const textResponse = await clonedResponse.text();
        console.error(`❌ Resposta não é JSON. Content-Type: ${contentType}`);
        console.error(`📄 Resposta recebida:`, textResponse.substring(0, 500));

        throw new Error(`Servidor retornou ${response.status}: ${response.statusText}. Backend não está respondendo com JSON válido. Resposta: ${textResponse.substring(0,500)}`);
      }

      let data: ApiResponse<T> | any;

      try {
        data = await response.json();
      } catch (jsonError) {
        // Se o JSON falhar, ler o texto para debugar
        const textResponse = await clonedResponse.text();
        console.error(`❌ Erro ao fazer parse do JSON:`, jsonError);
        console.error(`📄 Resposta que causou erro:`, textResponse.substring(0, 1000));
        throw new Error(`Resposta do servidor não é um JSON válido: ${textResponse.substring(0,500)}`);
      }

      console.log(`📨 API Response [${response.status}]:`, data);

      if (!response.ok) {
        // Tentar extrair mensagem útil do corpo JSON
        let serverMessage: string;
        try {
          serverMessage = data?.error || data?.message || (typeof data === 'string' ? data : JSON.stringify(data).slice(0, 500));
        } catch (jsonError: any) {
          // Handle BigInt or other JSON serialization errors
          if (jsonError.message?.includes('BigInt')) {
            serverMessage = `Server response contains BigInt values that cannot be serialized. This is a backend issue that needs to be fixed.`;
            console.error('❌ BigInt serialization error in server response:', data);
          } else {
            serverMessage = `Server response could not be processed: ${jsonError.message}`;
          }
        }
        throw new Error(serverMessage || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      console.error(`❌ API Error for ${endpoint}:`, error);
      
      // Enhanced error handling for common connection issues
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        console.error('🚫 Connection Error Details:', {
          baseUrl: this.baseUrl,
          endpoint: endpoint,
          fullUrl: url,
          errorMessage: error.message
        });
        throw new Error(`❌ Backend Connection Failed: Cannot connect to backend at ${this.baseUrl}. Please ensure:\n1. Backend server is running (npm run dev in apollo-back)\n2. Backend is on port 3001\n3. No firewall blocking localhost:3001`);
      }
      
      // Network timeout or other fetch errors
      if (error.message?.includes('Failed to fetch')) {
        throw new Error(`❌ Network Error: Backend server at ${this.baseUrl} is not responding. Please start the backend server first.`);
      }
      
      throw new Error(error.message || 'Unknown network error');
    }
  }

  // ========================================
  // AUTHENTICATION ENDPOINTS
  // ========================================

  /**
   * Authenticate user with wallet public key
   */
  async connectWallet(publicKey: string, userName?: string): Promise<WalletAuthResponse> {
    const response = await this.request<WalletAuthResponse>('/auth/wallet/connect', {
      method: 'POST',
      body: JSON.stringify({ publicKey, userName }),
    });

    if (response.success && response.data?.token) {
      this.authToken = response.data.token;
      
      // Save token to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('apollo-auth-token', response.data.token);
      }
    }

    return response.data!;
  }

  /**
   * Disconnect wallet (logout)
   */
  async disconnectWallet(publicKey: string): Promise<boolean> {
    try {
      await this.request('/auth/wallet/disconnect', {
        method: 'POST',
        body: JSON.stringify({ publicKey }),
      });

      this.authToken = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('apollo-auth-token');
      }

      return true;
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      return false;
    }
  }

  // ========================================
  // QUEST TRANSACTION ENDPOINTS
  // ========================================

  /**
   * Build quest registration transaction
   */
  async buildQuestRegistration(questId: number, publicKey: string): Promise<string> {
    try {
      const response = await this.request<{ transactionXdr: string }>(`/auth/wallet/quest/${questId}/build-register`, {
        method: 'POST',
        body: JSON.stringify({ publicKey }),
      });

      return response.data!.transactionXdr;
    } catch (error: any) {
      console.error(`❌ Error building quest registration for questId=${questId}:`, error);
      throw new Error(`Erro ao construir transação de registro (questId=${questId}): ${error.message || String(error)}`);
    }
  }

  /**
   * Submit signed quest registration transaction
   */
  async submitQuestRegistration(questId: number, signedTransactionXdr: string, publicKey: string): Promise<any> {
    const response = await this.request(`/auth/wallet/quest/${questId}/register`, {
      method: 'POST',
      body: JSON.stringify({ signedTransactionXdr, publicKey }),
    });

    return response.data;
  }

  /**
   * Verify quest task completion
   */
  async verifyQuestCompletion(questId: number, publicKey: string): Promise<{
    questId: number;
    userAddress: string;
    isEligible: boolean;
    taskCompleted: boolean;
    timestamp: string;
  }> {
    const response = await this.request<{
      questId: number;
      userAddress: string;
      isEligible: boolean;
      taskCompleted: boolean;
      timestamp: string;
    }>(`/auth/wallet/quest/${questId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ publicKey }),
    });

    return response.data!;
  }

  /**
   * Build claim rewards transaction
   */
  async buildClaimRewards(questId: number, publicKey: string): Promise<string> {
    const response = await this.request<{ transactionXdr: string }>(`/auth/wallet/quest/${questId}/build-claim`, {
      method: 'POST',
      body: JSON.stringify({ publicKey }),
    });

    return response.data!.transactionXdr;
  }

  /**
   * Submit signed claim rewards transaction
   */
  async submitClaimRewards(questId: number, signedTransactionXdr: string, publicKey: string): Promise<any> {
    const response = await this.request(`/auth/wallet/quest/${questId}/claim-rewards`, {
      method: 'POST',
      body: JSON.stringify({ signedTransactionXdr, publicKey }),
    });

    return response.data;
  }

  /**
   * Claim quest rewards (direct claim for admin/demo)
   */
  async claimQuestRewards(questId: number, publicKey: string): Promise<any> {
    const response = await this.request(`/auth/wallet/quest/${questId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ publicKey }),
    });

    return response.data;
  }

  // ========================================
  // QUEST INFORMATION ENDPOINTS
  // ========================================

  /**
   * Get all active quests available for registration
   */
  async getActiveQuests(): Promise<QuestInfo[]> {
    const response = await this.request<{ quests: QuestInfo[], count: number, timestamp: string }>('/auth/wallet/quests/active');
    return response.data?.quests || [];
  }


  // ========================================
  // QUEST STATUS ENDPOINTS  
  // ========================================

  /**
   * Get quest status for user
   */
  async getQuestStatus(questId: number, publicKey: string): Promise<QuestStatus> {
    const response = await this.request<QuestStatus>(`/auth/wallet/quest/${questId}/status?publicKey=${encodeURIComponent(publicKey)}`);
    return response.data!;
  }

  /**
   * Get wallet service information
   */
  async getWalletServiceInfo(): Promise<any> {
    const response = await this.request('/auth/wallet/info');
    return response.data;
  }

  /**
   * Get supported wallets
   */
  async getSupportedWallets(): Promise<any[]> {
    const response = await this.request<{ wallets: any[] }>('/auth/wallet/supported');
    return response.data!.wallets;
  }

  /**
   * Check wallet service health
   */
  async getWalletServiceHealth(): Promise<any> {
    const response = await this.request('/auth/wallet/health');
    return response.data;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  /**
   * Set authentication token manually
   */
  setAuthToken(token: string | null) {
    this.authToken = token;
    
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('apollo-auth-token', token);
      } else {
        localStorage.removeItem('apollo-auth-token');
      }
    }
  }

  /**
   * Get current auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authToken;
  }
}

// Export singleton instance
export const apolloApi = new ApolloApiClient();
export default apolloApi;

// Export types for use in components
export type { 
  ApiResponse, 
  QuestInfo, 
  QuestStatus, 
  WalletAuthResponse 
};
