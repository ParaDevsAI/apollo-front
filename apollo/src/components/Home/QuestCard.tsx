"use client";

import { ArrowUpRight, RotateCcw, Check } from "lucide-react";
import { QuestInfo } from '@/services/api';
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
    const timeLeft = endTimestamp - now;
    
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
  const isExpired = quest.end_timestamp <= Date.now();

  // Usar o primeiro caractere do título ou 'Q' para Quest
  const projectIcon = quest.title ? quest.title.charAt(0).toUpperCase() : 'Q';
  const projectName = `Quest #${quest.id}`;

  const getCardStyles = () => {
    switch (registrationStatus) {
      case "registered":
        return "bg-[var(--color-bg-card-completed)] opacity-60";
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

    switch (registrationStatus) {
      case "registering":
        return (
          <div className="flex items-center gap-2">
            <span className="text-white text-xs md:text-sm font-medium">
              REGISTERING...
            </span>
            <button className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center animate-pulse">
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5 text-black" />
            </button>
          </div>
        );
      case "registered":
        return (
          <button className="w-8 h-8 md:w-10 md:h-10 bg-[var(--color-bg-verified)] rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>
        );
      case "error":
        return (
          <button 
            onClick={() => onRegister(quest.id)}
            className="w-8 h-8 md:w-10 md:h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
          >
            <RotateCcw className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>
        );
      default:
        return (
          <button 
            onClick={() => onRegister(quest.id)}
            className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md"
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
                {formatTimeRemaining(quest.end_timestamp)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] px-2 py-1 rounded-full text-xs font-bold">
              {quest.max_winners} WINNERS
            </div>
            
            {getActionButton()}
          </div>
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
                  {formatTimeRemaining(quest.end_timestamp)}
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
        </div>
      </div>
    </ClientOnly>
  );
}