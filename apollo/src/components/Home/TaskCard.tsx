"use client";

import { ArrowUpRight, RotateCcw, Check } from "lucide-react";
import { useState, useEffect } from "react";
import ClientOnly from "@/components/ClientOnly";

interface TaskCardProps {
  title: string;
  projectIcon: string;
  projectName: string;
  isActive?: boolean;
  hasProvideLiquidity?: boolean;
  hasPreTge?: boolean;
  boostValue: string;
  status?: "new" | "pending" | "completed";
  taskId?: string;
  onStatusChange?: (taskId: string, newStatus: "new" | "pending" | "completed") => void;
}

export default function TaskCard({
  title,
  projectIcon,
  projectName,
  isActive = false,
  hasProvideLiquidity = false,
  hasPreTge = false,
  boostValue,
  status = "new",
  taskId = "default",
  onStatusChange
}: TaskCardProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Função para salvar no cache
  const saveToCache = (key: string, value: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  // Função para carregar do cache
  const loadFromCache = (key: string) => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    }
    return null;
  };

  // Verificar cache ao montar o componente
  useEffect(() => {
    if (status === "pending") {
      const cacheKey = `task_timer_${taskId}`;
      const cachedData = loadFromCache(cacheKey);
      
      if (cachedData && cachedData.endTime > Date.now()) {
        const remainingTime = Math.ceil((cachedData.endTime - Date.now()) / 1000);
        setTimeLeft(remainingTime);
        setIsVerifying(true);
      }
    }
  }, [status, taskId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isVerifying) {
      setIsVerifying(false);
      if (onStatusChange) {
        onStatusChange(taskId, "completed");
      }
    }
  }, [timeLeft, isVerifying, onStatusChange, taskId]);

  // Função para iniciar verificação
  const handleVerify = () => {
    if (status === "new") {
      // Muda para pending
      if (onStatusChange) {
        onStatusChange(taskId, "pending");
      }
    } else if (status === "pending" && !isVerifying) {
      // Inicia timer de 30s
      const endTime = Date.now() + 30000; // 30 segundos
      const cacheKey = `task_timer_${taskId}`;
      
      saveToCache(cacheKey, { endTime });
      setTimeLeft(30);
      setIsVerifying(true);
    }
  };
  const getCardStyles = () => {
    switch (status) {
      case "completed":
        return "bg-[var(--color-bg-card-completed)] opacity-60";
      default:
        return "bg-[var(--color-bg-cards)] opacity-60";
    }
  };

  const getActionButton = () => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center gap-2">
            <span className="text-white text-xs md:text-sm font-medium">
              {isVerifying ? `${timeLeft}s` : "VERIFICAR"}
            </span>
            {!isVerifying && (
              <button 
                onClick={handleVerify}
                className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md"
              >
                <RotateCcw className="w-4 h-4 md:w-5 md:h-5 text-black" />
              </button>
            )}
          </div>
        );
      case "completed":
        return (
          <button className="w-8 h-8 md:w-10 md:h-10 bg-[var(--color-bg-verified)] rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 md:w-5 md:h-5 text-white" />
          </button>
        );
      default:
        return (
          <button 
            onClick={handleVerify}
            className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md"
          >
            <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-black" />
          </button>
        );
    }
  };

  return (
    <ClientOnly>
      <div className={`relative ${getCardStyles()} rounded-[12px] md:rounded-[20px] p-4 md:p-6 border border-[var(--color-border)] hover:border-white transition-colors`}>
      {/* Mobile Layout */}
      <div className="md:hidden space-y-4">
        {/* Título */}
        <h3 className="text-[var(--color-text-primary)] text-base font-semibold">
          {title}
        </h3>
        
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
            <span className="text-xs font-bold text-black">{projectIcon}</span>
          </div>
          <span className="text-[var(--color-text-primary)] text-sm">{projectName}</span>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasProvideLiquidity && (
            <span className="px-2 py-1 bg-[var(--color-bg-filters)] text-[var(--color-text-primary)] text-xs rounded-full">
              Provide Liquidity
            </span>
          )}
          {hasPreTge && (
            <span className="px-2 py-1 bg-[var(--color-bg-filters)] text-[var(--color-text-primary)] text-xs rounded-full">
              Pre-TGE
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] px-2 py-1 rounded-full text-xs font-bold">
            BOOST {boostValue}
          </div>
          
          {getActionButton()}
        </div>
      </div>

      <div className="hidden md:flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-[var(--color-text-primary)] text-lg font-semibold mb-3">
            {title}
          </h3>
          
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
              <span className="text-xs font-bold text-black">{projectIcon}</span>
            </div>
            <span className="text-[var(--color-text-primary)] text-sm">{projectName}</span>
          </div>

          <div className="flex items-center gap-2">
            {hasProvideLiquidity && (
              <span className="px-3 py-1 bg-[var(--color-bg-filters)] text-[var(--color-text-primary)] text-xs rounded-full">
                Provide Liquidity
              </span>
            )}
            {hasPreTge && (
              <span className="px-3 py-1 bg-[var(--color-bg-filters)] text-[var(--color-text-primary)] text-xs rounded-full">
                Pre-TGE
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-[color-mix(in_srgb,var(--color-primary)_10%,transparent)] text-[var(--color-primary)] px-3 py-1 rounded-full text-xs font-bold">
              BOOST {boostValue}
            </div>
          </div>
          
          {getActionButton()}
        </div>
      </div>
      </div>
    </ClientOnly>
  );
}
