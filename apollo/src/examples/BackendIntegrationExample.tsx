/**
 * Complete Frontend-Backend Integration Example
 * This component demonstrates the full integration between your Apollo frontend and backend
 */

"use client";

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { useQuestManager } from '@/hooks/useQuestManager';

const EXAMPLE_QUEST_ID = 1;

export default function BackendIntegrationExample() {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const questManager = useQuestManager(EXAMPLE_QUEST_ID);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`🎯 INTEGRATION: ${message}`);
  };

  useEffect(() => {
    if (wallet.isConnected) {
      addLog(`✅ Wallet connected: ${wallet.address?.slice(0, 8)}...${wallet.address?.slice(-8)}`);
    } else {
      addLog('❌ Wallet disconnected');
    }
  }, [wallet.isConnected, wallet.address]);

  const handleConnectWallet = async () => {
    try {
      addLog('🔗 Connecting wallet...');
      await connectWallet();
    } catch (error: any) {
      addLog(`❌ Wallet connection failed: ${error.message}`);
    }
  };

  const handleAuthenticateBackend = async () => {
    addLog('🔐 Authenticating with backend...');
    const result = await questManager.authenticateWallet();
    
    if (result.success) {
      addLog('✅ Backend authentication successful');
    } else {
      addLog(`❌ Backend authentication failed: ${result.error}`);
    }
  };

  const handleRegisterQuest = async () => {
    addLog(`📝 Registering for quest ${EXAMPLE_QUEST_ID}...`);
    const result = await questManager.registerForQuest(EXAMPLE_QUEST_ID);
    
    if (result.success) {
      addLog('✅ Quest registration successful');
    } else {
      addLog(`❌ Quest registration failed: ${result.error}`);
    }
  };

  const handleVerifyQuest = async () => {
    addLog(`🔍 Verifying quest ${EXAMPLE_QUEST_ID} completion...`);
    const result = await questManager.verifyQuestCompletion(EXAMPLE_QUEST_ID);
    
    if (result.success) {
      addLog(`✅ Quest verification: ${result.message}`);
    } else {
      addLog(`❌ Quest verification failed: ${result.error}`);
    }
  };

  const handleClaimRewards = async () => {
    addLog(`🎁 Claiming rewards for quest ${EXAMPLE_QUEST_ID}...`);
    const result = await questManager.claimQuestRewards(EXAMPLE_QUEST_ID);
    
    if (result.success) {
      addLog('🎉 Rewards claimed successfully!');
    } else {
      addLog(`❌ Claim failed: ${result.error}`);
    }
  };

  const handleRefreshStatus = async () => {
    addLog('🔄 Refreshing quest status...');
    await questManager.refreshStatus();
    addLog('✅ Status refreshed');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Apollo Frontend-Backend Integration
        </h1>
        <p className="text-gray-600">
          Complete wallet integration with quest management system
        </p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Wallet Status */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-800 mb-2">Wallet Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Connected:</span>
              <span className={wallet.isConnected ? 'text-green-600' : 'text-red-600'}>
                {wallet.isConnected ? '✅' : '❌'}
              </span>
            </div>
            {wallet.address && (
              <div className="flex justify-between">
                <span>Address:</span>
                <span className="font-mono text-xs">
                  {wallet.address.slice(0, 8)}...{wallet.address.slice(-8)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Wallet:</span>
              <span>{wallet.selectedWallet?.name || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Backend Status */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-800 mb-2">Backend Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Authenticated:</span>
              <span className={questManager.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                {questManager.isAuthenticated ? '✅' : '❌'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Loading:</span>
              <span>{questManager.isLoading ? '⏳' : '✅'}</span>
            </div>
            {questManager.error && (
              <div className="text-red-600 text-xs">
                Error: {questManager.error}
              </div>
            )}
          </div>
        </div>

        {/* Quest Status */}
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="font-semibold text-gray-800 mb-2">Quest Status</h3>
          {questManager.questStatus ? (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Registered:</span>
                <span className={questManager.questStatus.isRegistered ? 'text-green-600' : 'text-red-600'}>
                  {questManager.questStatus.isRegistered ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Winner:</span>
                <span className={questManager.questStatus.isWinner ? 'text-green-600' : 'text-gray-500'}>
                  {questManager.questStatus.isWinner ? '🏆' : '❌'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Can Claim:</span>
                <span className={questManager.questStatus.canClaim ? 'text-green-600' : 'text-gray-500'}>
                  {questManager.questStatus.canClaim ? '🎁' : '❌'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No quest data</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h3 className="font-semibold text-gray-800 mb-4">Integration Actions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Step 1: Connect Wallet */}
          <button
            onClick={handleConnectWallet}
            disabled={wallet.isConnected || wallet.isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            {wallet.isConnected ? '✅ Wallet Connected' : '🔗 Connect Wallet'}
          </button>

          {/* Step 2: Authenticate Backend */}
          <button
            onClick={handleAuthenticateBackend}
            disabled={!wallet.isConnected || questManager.isAuthenticated || questManager.isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            {questManager.isAuthenticated ? '✅ Authenticated' : '🔐 Auth Backend'}
          </button>

          {/* Step 3: Register for Quest */}
          <button
            onClick={handleRegisterQuest}
            disabled={!questManager.isAuthenticated || questManager.isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            📝 Register Quest
          </button>

          {/* Step 4: Verify Quest */}
          <button
            onClick={handleVerifyQuest}
            disabled={!questManager.isAuthenticated || questManager.isLoading}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            🔍 Verify Quest
          </button>

          {/* Step 5: Claim Rewards */}
          <button
            onClick={handleClaimRewards}
            disabled={!questManager.questStatus?.canClaim || questManager.isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            🎁 Claim Rewards
          </button>

          {/* Utility: Refresh Status */}
          <button
            onClick={handleRefreshStatus}
            disabled={!questManager.isAuthenticated || questManager.isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            🔄 Refresh
          </button>

          {/* Utility: Disconnect */}
          <button
            onClick={() => {
              disconnectWallet();
              addLog('🔌 Wallet disconnected');
            }}
            disabled={!wallet.isConnected}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            🔌 Disconnect
          </button>

          {/* Utility: Clear Logs */}
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
          >
            🗑️ Clear Logs
          </button>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-800">Integration Activity Log</h3>
          <span className="text-sm text-gray-500">{logs.length} events</span>
        </div>
        
        <div className="bg-gray-50 p-4 rounded border max-h-64 overflow-y-auto">
          {logs.length > 0 ? (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono text-gray-700">
                  {log}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No activity yet. Start by connecting your wallet!</p>
          )}
        </div>
      </div>

      {/* Integration Flow Info */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3">🚀 Complete Integration Flow</h3>
        <div className="space-y-2 text-sm text-blue-700">
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">1</span>
            <span>Frontend connects wallet using Stellar Wallets Kit</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">2</span>
            <span>Backend authentication via <code>/api/v1/auth/wallet/connect</code></span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">3</span>
            <span>Backend builds transaction → Frontend signs → Backend submits</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">4</span>
            <span>Backend verifies task completion via external APIs/oracles</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs">5</span>
            <span>Smart contract manages quest state and reward distribution</span>
          </div>
        </div>
      </div>
    </div>
  );
}