"use client";

import BaseButton from "@/components/Ui/Button";

export default function SignInCard() {
  return (
    <div className="bg-[var(--color-bg-cards)] rounded-[12px] md:rounded-[20px] p-4 md:p-7 border border-[var(--color-border)] opacity-60">
      <div className="flex flex-col items-center md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-[var(--color-text-primary)] text-lg md:text-xl font-semibold text-center md:text-left">
          SIGN IN TO VIEW YOUR CAMPAIGNS
        </h2>

        <BaseButton
          variant="primary"
          className="px-6 py-3 text-sm font-medium w-auto"
        >
          CONNECT WALLET
        </BaseButton>
      </div>
    </div>
  );
}
