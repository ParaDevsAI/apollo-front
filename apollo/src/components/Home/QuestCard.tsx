"use client";

import { ArrowUpRight, RotateCcw, Check, Loader2, AlertCircle } from "lucide-react";
import { QuestInfo, QuestStatus } from '@/services/api';
import { useQuestManager } from '@/hooks/useQuestManager';
import { useWallet } from '@/contexts/WalletContext';
import { useState, useEffect } from 'react';
import ClientOnly from "@/components/ClientOnly";

interface QuestCardProps {
  quest: QuestInfo;
  onRegister: (questId: number) => void;
  registrationStatus: 'idle' | 'registering' | 'registered' | 'error';
  isWalletConnected: boolean;
  isAuthenticated: boolean;
}

export default function QuestCard({
  quest,
  onRegister,
  registrationStatus,
  isWalletConnected,
  isAuthenticated
}: QuestCardProps) {
  const { wallet, connectWallet } = useWallet();
  const questManager = useQuestManager();
  
  // Debug: Log da estrutura dos dados da quest
  console.log(`🔍 Quest ${quest.id} data structure:`, {
    quest,
    hasTitle: !!quest.title,
    hasDescription: !!quest.description,
    end_timestamp: quest.end_timestamp,
    quest_type: quest.quest_type,
    distribution: quest.distribution,
    is_active: quest.is_active
  });
  
  // Estado local para controlar o registro
  const [localStatus, setLocalStatus] = useState<'idle' | 'connecting' | 'authenticating' | 'registering' | 'registered' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [questStatus, setQuestStatus] = useState<QuestStatus | null>(null);
  
  // Verificar status da quest quando a wallet e autenticação mudarem
  useEffect(() => {
    const checkQuestStatus = async () => {
      if (wallet.isConnected && wallet.address && questManager.isAuthenticated) {
        try {
          const statusResult = await questManager.getQuestStatus(quest.id);
          if (statusResult.success && statusResult.data) {
            setQuestStatus(statusResult.data);
            
            // Atualizar status local baseado no status da quest
            if (statusResult.data.isRegistered) {
              setLocalStatus('registered');
              console.log(`✅ Quest ${quest.id}: Usuário já registrado`);
            } else {
              setLocalStatus('idle');
            }
          }
        } catch (error) {
          console.log(`ℹ️ Quest ${quest.id}: Status não disponível (provavelmente não registrado)`);
        }
      }
    };

    checkQuestStatus();
  }, [wallet.isConnected, wallet.address, questManager.isAuthenticated, quest.id]);

  // Função para gerenciar o registro completo
  const handleRegistration = async () => {
    console.log(`🎯 APOLLO QUEST REGISTRATION - Iniciando para Quest ${quest.id}`);
    setErrorMessage(null);

    try {
      // Passo 1: Conectar wallet se necessário
      if (!wallet.isConnected) {
        console.log('📱 Conectando wallet...');
        setLocalStatus('connecting');
        await connectWallet();
        
        if (!wallet.isConnected) {
          throw new Error('Falha ao conectar wallet');
        }
        console.log('✅ Wallet conectada com sucesso');
      }

      // Passo 2: Autenticar com backend se necessário
      if (!questManager.isAuthenticated) {
        console.log('🔐 Autenticando wallet com backend...');
        setLocalStatus('authenticating');
        const authResult = await questManager.authenticateWallet();
        
        if (!authResult.success) {
          throw new Error(authResult.message || 'Falha na autenticação');
        }
        console.log('✅ Autenticação realizada com sucesso');
      }

      // Passo 3: Registrar na quest
      console.log(`📝 Registrando na Quest ${quest.id}...`);
      setLocalStatus('registering');
      
      const registrationResult = await questManager.registerForQuest(quest.id);
      
      if (registrationResult.success) {
        setLocalStatus('registered');
        console.log(`🎉 Registro na Quest ${quest.id} concluído com sucesso!`);
        console.log('📊 Resultado da transação:', registrationResult.data);
        
        // Verificar status atualizado
        const statusResult = await questManager.getQuestStatus(quest.id);
        if (statusResult.success) {
          setQuestStatus(statusResult.data);
        }
      } else {
        throw new Error(registrationResult.message || 'Falha no registro');
      }

    } catch (error: any) {
      console.error(`❌ Erro no registro da Quest ${quest.id}:`, error);
      setLocalStatus('error');
      setErrorMessage(error.message || 'Erro inesperado durante o registro');
      
      // Voltar para idle após alguns segundos
      setTimeout(() => {
        setLocalStatus('idle');
        setErrorMessage(null);
      }, 5000);
    }
  };
  
  const formatRewardType = (questType: any) => {
    if (questType?.TradeVolume) {
      return `Generate Volume: $${questType.TradeVolume.toLocaleString()}`;
    }
    if (questType?.PoolPosition) {
      return `Provide Liquidity: $${questType.PoolPosition.toLocaleString()}`;
    }
    if (questType?.TokenHold) {
      return `Hold ${questType.TokenHold[1]?.toLocaleString()} ${questType.TokenHold[0]}`;
    }
    return 'Complete Quest Task';
  };

  const formatTimeRemaining = (endTimestamp: number) => {
    const now = Date.now();
    // Converter timestamp se estiver em segundos
    const endTimestampMs = endTimestamp < 10000000000 ? endTimestamp * 1000 : endTimestamp;
    const timeLeft = endTimestampMs - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getDistributionText = (distribution: string) => {
    return distribution === 'Fcfs' ? 'FCFS' : 'Raffle';
  };

  const hasLiquidity = quest.quest_type?.PoolPosition;
  const hasTrading = quest.quest_type?.TradeVolume;
  const hasTokenHolding = quest.quest_type?.TokenHold;
  
  // Debug: Verificar formato do timestamp
  console.log(`🔍 Quest ${quest.id} timestamp debug:`, {
    end_timestamp: quest.end_timestamp,
    end_timestamp_type: typeof quest.end_timestamp,
    current_time: Date.now(),
    current_time_type: typeof Date.now(),
    is_timestamp_seconds: quest.end_timestamp < 10000000000, // Se for menor que 10 bilhões, provavelmente está em segundos
    calculated_expired: quest.end_timestamp <= Date.now()
  });
  
  // Converter timestamp se estiver em segundos (backend comum) para milissegundos
  const endTimestampMs = quest.end_timestamp < 10000000000 
    ? quest.end_timestamp * 1000 
    : quest.end_timestamp;
    
  const isExpired = endTimestampMs <= Date.now();

  // Usar o primeiro caractere do título ou 'Q' para Quest
  const projectIcon = quest.title ? quest.title.charAt(0).toUpperCase() : 'Q';
  const projectName = `Quest #${quest.id}`;

  const getCardStyles = () => {
    switch (localStatus) {
      case "registered":
        return "bg-green-500/20 border-green-500/50";
      case "connecting":
      case "authenticating":
      case "registering":
        return "bg-blue-500/20 border-blue-500/50 animate-pulse";
      case "error":
        return "bg-red-500/20 border-red-500/50";
      default:
        return "bg-[var(--color-bg-cards)] opacity-60";
    }
  };

  const getActionButton = () => {
    if (isExpired) {
      return (
        <button className="w-8 h-8 md:w-10 md:h-10 bg-gray-400 rounded-full flex items-center justify-center opacity-50">
          <span className="text-xs text-white font-bold">EXP</span>
        </button>
      );
    }

    switch (localStatus) {
      case "connecting":
        return (
          <div className="flex items-center gap-2">
            <span className="text-white text-xs md:text-sm font-medium">
              CONNECTING...
            </span>
            <button className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-white animate-spin" />
            </button>
          </div>
        );
      case "authenticating":
        return (
          <div className="flex items-center gap-2">
            <span className="text-white text-xs md:text-sm font-medium">
              AUTHENTICATING...
            </span>
            <button className="w-8 h-8 md:w-10 md:h-10 bg-yellow-500 rounded-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-white animate-spin" />
            </button>
          </div>
        );
      case "registering":
        return (
          <div className="flex items-center gap-2">
            <span className="text-white text-xs md:text-sm font-medium">
              REGISTERING...
            </span>
            <button className="w-8 h-8 md:w-10 md:h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-white animate-spin" />
            </button>
          </div>
        );
      case "registered":
        return (
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xs md:text-sm font-medium">
              REGISTERED
            </span>
            <button className="w-8 h-8 md:w-10 md:h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-xs md:text-sm font-medium">
              {errorMessage ? "RETRY" : "ERROR"}
            </span>
            <button 
              onClick={handleRegistration}
              className="w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
              title={errorMessage || "Erro no registro"}
            >
              <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </button>
          </div>
        );
      default:
        return (
          <button 
            onClick={handleRegistration}
            className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md"
            disabled={localStatus !== 'idle'}
          >
            <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-black" />
          </button>
        );
    }
  };

  // Correção da escala de quantidade (1:10000 nos contratos)
  const formatRewardAmount = (amount: number) => {
    const scaledAmount = amount / 10000; // Ajuste para escala do contrato
    if (scaledAmount >= 1000000) {
      return `${(scaledAmount / 1000000).toFixed(1)}M`;
    }
    if (scaledAmount >= 1000) {
      return `${(scaledAmount / 1000).toFixed(1)}K`;
    }
    return scaledAmount.toLocaleString();
  };

  const rewardAmount = quest.reward_per_winner ? formatRewardAmount(quest.reward_per_winner) : '0';
  const totalReward = quest.total_reward_pool ? formatRewardAmount(quest.total_reward_pool) : '0';

  return (
    <ClientOnly>
      <div className={`relative ${getCardStyles()} rounded-[12px] md:rounded-[20px] p-4 md:p-6 border border-[var(--color-border)] hover:border-white transition-colors`}>
        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {/* Título */}
          <h3 className="text-[var(--color-text-primary)] text-base font-semibold">
            {quest.title || `Complete Functionality Test`}
          </h3>
          
          {/* Descrição */}
          {quest.description && (
            <p className="text-[var(--color-text-primary)] opacity-70 text-xs">
              {quest.description}
            </p>
          )}
          
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
              <span className="text-xs font-bold text-black">{projectIcon}</span>
            </div>
            <span className="text-[var(--color-text-primary)] text-sm">Quest #{quest.id}</span>
          </div>

          {/* Reward Info */}
          <div className="flex items-center justify-between text-xs text-[var(--color-text-primary)]">
            <div className="flex flex-col">
              <span className="text-[var(--color-text-primary)] opacity-70">Reward per Winner</span>
              <span className="font-medium">{rewardAmount} {quest.reward_token}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[var(--color-text-primary)] opacity-70">Total Pool</span>
              <span className="font-medium">{totalReward} {quest.reward_token}</span>
            </div>
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-2 flex-wrap">
            {hasLiquidity && (
              <span className="px-2 py-1 bg-[var(--color-bg-filters)] text-[var(--color-text-primary)] text-xs rounded-full">
                Provide Liquidity
              </span>
            )}
            {hasTrading && (
              <span className="px-2 py-1 bg-[var(--color-bg-filters)] text-[var(--color-text-primary)] text-xs rounded-full">
                Trade Volume
              </span>
            )}
            {hasTokenHolding && (
              <span className="px-2 py-1 bg-[var(--color-bg-filters)] text-[var(--color-text-primary)] text-xs rounded-full">
                Token Hold
              </span>
            )}
            <span className="px-2 py-1 bg-[var(--color-bg-filters)] text-[var(--color-text-primary)] text-xs rounded-full">
              {getDistributionText(quest.distribution)}
            </span>
            {!isExpired && (
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                {formatTimeRemaining(endTimestampMs)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] px-2 py-1 rounded-full text-xs font-bold">
              {quest.max_winners} WINNERS
            </div>
            
            {getActionButton()}
          </div>
          
          {/* Mostrar mensagem de erro se houver */}
          {errorMessage && localStatus === 'error' && (
            <div className="mt-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-400">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-[var(--color-text-primary)] text-lg font-semibold mb-2">
              {quest.title || `Complete Functionality Test`}
            </h3>
            
            {/* Descrição Desktop */}
            {quest.description && (
              <p className="text-[var(--color-text-primary)] opacity-70 text-sm mb-3">
                {quest.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                <span className="text-xs font-bold text-black">{projectIcon}</span>
              </div>
              <span className="text-[var(--color-text-primary)] text-sm">Quest #{quest.id}</span>
            </div>

            {/* Reward Info Desktop */}
            <div className="flex items-center gap-6 mb-4 text-xs text-[var(--color-text-primary)]">
              <div className="flex flex-col">
                <span className="text-[var(--color-text-primary)] opacity-70">Reward per Winner</span>
                <span className="font-medium text-sm">{rewardAmount} {quest.reward_token}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[var(--color-text-primary)] opacity-70">Total Pool</span>
                <span className="font-medium text-sm">{totalReward} {quest.reward_token}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[var(--color-text-primary)] opacity-70">Max Winners</span>
                <span className="font-medium text-sm">{quest.max_winners}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {hasLiquidity && (
                <span className="px-3 py-1 bg-[var(--color-bg-filters)] text-[var(--color-text-primary)] text-xs rounded-full">
                  Provide Liquidity
                </span>
              )}
              {hasTrading && (
                <span className="px-3 py-1 bg-[var(--color-bg-filters)] text-[var(--color-text-primary)] text-xs rounded-full">
                  Trade Volume
                </span>
              )}
              {hasTokenHolding && (
                <span className="px-3 py-1 bg-[var(--color-bg-filters)] text-[var(--color-text-primary)] text-xs rounded-full">
                  Token Hold
                </span>
              )}
              <span className="px-3 py-1 bg-[var(--color-bg-filters)] text-[var(--color-text-primary)] text-xs rounded-full">
                {getDistributionText(quest.distribution)}
              </span>
              {!isExpired && (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                  {formatTimeRemaining(endTimestampMs)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] px-3 py-1 rounded-full text-xs font-bold">
                {getDistributionText(quest.distribution)}
              </div>
            </div>
            
            {getActionButton()}
          </div>
          
          {/* Mostrar mensagem de erro se houver - Desktop */}
          {errorMessage && localStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-sm text-red-400">
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </ClientOnly>
  );
}