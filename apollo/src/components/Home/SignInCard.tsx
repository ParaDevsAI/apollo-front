"use client";

import BaseButton from "@/components/Ui/Button";

export default function SignInCard() {
  return (
    <div className="bg-[var(--color-bg-cards)] rounded-[20px] p-7 border border-[var(--color-border)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[var(--color-text-primary)] text-xl rounded-2xl font-semibold">
          SIGN IN TO VIEW YOUR CAMPAIGNS
        </h2>

        <BaseButton
          variant="primary"
          className="px-4 py-2 text-sm font-medium"
        >
          CONNECT WALLET
        </BaseButton>
      </div>
    </div>
  );
}
