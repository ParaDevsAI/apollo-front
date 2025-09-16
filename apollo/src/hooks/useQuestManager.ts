/**
 * Apollo Quest Manager Hook
 * Integrates frontend wallet with backend quest system
 */

import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import apolloApi, { type QuestStatus, type QuestInfo } from '@/services/api';

export interface QuestActionResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface UseQuestManagerReturn {
  // State
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  
  // Quest status
  questStatus: QuestStatus | null;
  
  // Actions
  authenticateWallet: () => Promise<QuestActionResult>;
  registerForQuest: (questId: number) => Promise<QuestActionResult>;
  verifyQuestCompletion: (questId: number) => Promise<QuestActionResult>;
  claimQuestRewards: (questId: number) => Promise<QuestActionResult>;
  getQuestStatus: (questId: number) => Promise<QuestActionResult>;
  
  // Utilities
  refreshStatus: () => Promise<void>;
  clearError: () => void;
}

export function useQuestManager(questId?: number): UseQuestManagerReturn {
  const { wallet, signTransaction } = useWallet();
  
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [questStatus, setQuestStatus] = useState<QuestStatus | null>(null);

  // Check authentication status on wallet changes
  useEffect(() => {
    const checkAuth = () => {
      const hasToken = apolloApi.isAuthenticated();
      const hasWallet = wallet.isConnected && wallet.address;
      setIsAuthenticated(hasToken && !!hasWallet);
    };

    checkAuth();
  }, [wallet.isConnected, wallet.address]);

  // Load quest status when questId and authentication changes
  useEffect(() => {
    if (questId && isAuthenticated && wallet.address) {
      loadQuestStatus(questId);
    }
  }, [questId, isAuthenticated, wallet.address]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Authenticate wallet with backend
   */
  const authenticateWallet = useCallback(async (): Promise<QuestActionResult> => {
    if (!wallet.isConnected || !wallet.address) {
      return {
        success: false,
        message: 'Wallet not connected',
        error: 'Please connect your wallet first'
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Authenticating wallet with backend:', wallet.address);
      
      const authResult = await apolloApi.connectWallet(
        wallet.address,
        `User-${wallet.address.slice(0, 8)}`
      );

      setIsAuthenticated(true);
      
      console.log('✅ Wallet authenticated successfully:', authResult);

      return {
        success: true,
        message: 'Wallet authenticated successfully',
        data: authResult
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed';
      setError(errorMessage);
      
      console.error('❌ Wallet authentication failed:', error);

      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [wallet.isConnected, wallet.address]);

  /**
   * Register for a quest
   */
  const registerForQuest = useCallback(async (questId: number): Promise<QuestActionResult> => {
    if (!wallet.address || !isAuthenticated) {
      return {
        success: false,
        message: 'Authentication required',
        error: 'Please authenticate your wallet first'
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`📝 Registering for quest ${questId}...`);

      // Step 1: Build transaction on backend
      console.log('🏗️ Building registration transaction...');
      const transactionXdr = await apolloApi.buildQuestRegistration(questId, wallet.address);
      
      console.log('📄 Transaction XDR received from backend');

      // Step 2: Sign transaction with wallet
      console.log('✍️ Signing transaction with wallet...');
      const signedXdr = await signTransaction(transactionXdr);
      
      console.log('✅ Transaction signed successfully');

      // Step 3: Submit signed transaction via backend
      console.log('📤 Submitting signed transaction...');
      const result = await apolloApi.submitQuestRegistration(questId, signedXdr, wallet.address);
      
      console.log('🎉 Quest registration completed:', result);

      // Refresh quest status
      if (questId) {
        await loadQuestStatus(questId);
      }

      return {
        success: true,
        message: 'Successfully registered for quest',
        data: result
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Registration failed';
      setError(errorMessage);
      
      console.error('❌ Quest registration failed:', error);

      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address, isAuthenticated, signTransaction]);

  /**
   * Verify quest task completion
   */
  const verifyQuestCompletion = useCallback(async (questId: number): Promise<QuestActionResult> => {
    if (!wallet.address || !isAuthenticated) {
      return {
        success: false,
        message: 'Authentication required',
        error: 'Please authenticate your wallet first'
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🔍 Verifying quest ${questId} completion...`);

      const verificationResult = await apolloApi.verifyQuestCompletion(questId, wallet.address);
      
      console.log('📊 Verification result:', verificationResult);

      // Refresh quest status
      await loadQuestStatus(questId);

      const message = verificationResult.isEligible 
        ? 'Quest task completed! You are eligible for rewards.' 
        : 'Quest task not completed yet. Please complete the required actions.';

      return {
        success: true,
        message,
        data: verificationResult
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Verification failed';
      setError(errorMessage);
      
      console.error('❌ Quest verification failed:', error);

      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address, isAuthenticated]);

  /**
   * Claim quest rewards
   */
  const claimQuestRewards = useCallback(async (questId: number): Promise<QuestActionResult> => {
    if (!wallet.address || !isAuthenticated) {
      return {
        success: false,
        message: 'Authentication required',
        error: 'Please authenticate your wallet first'
      };
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(`🎁 Claiming rewards for quest ${questId}...`);

      // Step 1: Build claim transaction on backend
      console.log('🏗️ Building claim transaction...');
      const transactionXdr = await apolloApi.buildClaimRewards(questId, wallet.address);
      
      console.log('📄 Claim transaction XDR received from backend');

      // Step 2: Sign transaction with wallet
      console.log('✍️ Signing claim transaction with wallet...');
      const signedXdr = await signTransaction(transactionXdr);
      
      console.log('✅ Claim transaction signed successfully');

      // Step 3: Submit signed transaction via backend
      console.log('📤 Submitting signed claim transaction...');
      const result = await apolloApi.submitClaimRewards(questId, signedXdr, wallet.address);
      
      console.log('🎉 Quest rewards claimed successfully:', result);

      // Refresh quest status
      await loadQuestStatus(questId);

      return {
        success: true,
        message: 'Quest rewards claimed successfully!',
        data: result
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Claim failed';
      setError(errorMessage);
      
      console.error('❌ Quest reward claim failed:', error);

      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [wallet.address, isAuthenticated, signTransaction]);

  /**
   * Get quest status for user
   */
  const getQuestStatus = useCallback(async (questId: number): Promise<QuestActionResult> => {
    if (!wallet.address || !isAuthenticated) {
      return {
        success: false,
        message: 'Authentication required',
        error: 'Please authenticate your wallet first'
      };
    }

    try {
      const status = await apolloApi.getQuestStatus(questId, wallet.address);
      setQuestStatus(status);

      return {
        success: true,
        message: 'Quest status retrieved successfully',
        data: status
      };

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to get quest status';
      
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    }
  }, [wallet.address, isAuthenticated]);

  /**
   * Internal helper to load quest status
   */
  const loadQuestStatus = async (questId: number) => {
    if (!wallet.address || !isAuthenticated) return;

    try {
      const status = await apolloApi.getQuestStatus(questId, wallet.address);
      setQuestStatus(status);
    } catch (error: any) {
      console.error('Failed to load quest status:', error);
    }
  };

  /**
   * Refresh current quest status
   */
  const refreshStatus = useCallback(async () => {
    if (questId && wallet.address && isAuthenticated) {
      await loadQuestStatus(questId);
    }
  }, [questId, wallet.address, isAuthenticated]);

  return {
    // State
    isLoading,
    error,
    isAuthenticated,
    questStatus,
    
    // Actions
    authenticateWallet,
    registerForQuest,
    verifyQuestCompletion,
    claimQuestRewards,
    getQuestStatus,
    
    // Utilities
    refreshStatus,
    clearError,
  };
}

export default useQuestManager;
