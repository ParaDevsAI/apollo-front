"use client";

import { useWalletKit } from "@/hooks/useWalletKit";
import { useEffect, useRef } from "react";

interface WalletInfo {
  formattedAddress: string;
  walletType: string;
}

interface WalletDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  walletInfo: WalletInfo;
}

export default function WalletDropdown({ isOpen, onClose, walletInfo }: WalletDropdownProps) {
  const { disconnect } = useWalletKit();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  const handleDisconnect = () => {
    disconnect();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-64 bg-[var(--color-bg-cards)] border border-[var(--color-border)] rounded-lg shadow-lg z-50"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-[var(--color-text-secondary)]">Wallet</span>
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-medium text-[var(--color-text-primary)]">
            {walletInfo.formattedAddress}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {walletInfo.walletType} • Stellar Network
          </p>
        </div>

        <button
          onClick={handleDisconnect}
          className="w-full px-3 py-2 text-sm text-red-400 text-left"
        >
          Desconectar Wallet
        </button>
      </div>
    </div>
  );
}
