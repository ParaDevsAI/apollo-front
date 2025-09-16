/**
 * Apollo Backend API Client
 * Handles all communication with the Apollo Backend Server
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

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

      const data: ApiResponse<T> = await response.json();
      
      console.log(`📨 API Response [${response.status}]:`, data);
      
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error: any) {
      console.error(`❌ API Error for ${endpoint}:`, error);
      throw new Error(error.message || 'Network error');
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
    const response = await this.request<{ transactionXdr: string }>(`/auth/wallet/quest/${questId}/build-register`, {
      method: 'POST',
      body: JSON.stringify({ publicKey }),
    });

    return response.data!.transactionXdr;
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
