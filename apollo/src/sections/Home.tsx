"use client";

import { useState } from "react";
import CampaignHeader from "@/components/Home/CampaignHeader";
import SignInCard from "@/components/Home/SignInCard";
import ExploreSection from "@/components/Home/ExploreSection";
import TaskCard from "@/components/Home/TaskCard";
import BackgroundBlobs from "@/components/Home/BackgroundBlobs";

export default function Home() {
  const [tasks, setTasks] = useState([
    {
      id: "task-1",
      title: "Provide Liquidity to USDC/USDT",
      projectIcon: "A",
      projectName: "Aqua",
      hasProvideLiquidity: true,
      hasPreTge: true,
      boostValue: "32.2%",
      status: "new" as const
    },
    {
      id: "task-2",
      title: "Provide Liquidity to USDC/USDT",
      projectIcon: "A",
      projectName: "Aqua",
      hasProvideLiquidity: true,
      hasPreTge: true,
      boostValue: "32.2%",
      status: "pending" as const
    },
    {
      id: "task-3",
      title: "Provide Liquidity to USDC/USDT",
      projectIcon: "A",
      projectName: "Aqua",
      hasProvideLiquidity: false,
      hasPreTge: false,
      boostValue: "32.2%",
      status: "completed" as const
    },
    {
      id: "task-4",
      title: "Generate Volume to USDC/USDT",
      projectIcon: "B",
      projectName: "Blend",
      hasProvideLiquidity: false,
      hasPreTge: true,
      boostValue: "15.1%",
      status: "new" as const
    },
    {
      id: "task-5",
      title: "Stake Tokens for Rewards",
      projectIcon: "S",
      projectName: "Stake",
      hasProvideLiquidity: true,
      hasPreTge: false,
      boostValue: "28.5%",
      status: "new" as const
    },
    {
      id: "task-6",
      title: "Trade on DEX Platform",
      projectIcon: "D",
      projectName: "DexSwap",
      hasProvideLiquidity: false,
      hasPreTge: true,
      boostValue: "22.8%",
      status: "new" as const
    },
    {
      id: "task-7",
      title: "Farm Yield Tokens",
      projectIcon: "F",
      projectName: "FarmYield",
      hasProvideLiquidity: true,
      hasPreTge: true,
      boostValue: "45.3%",
      status: "new" as const
    },
    {
      id: "task-8",
      title: "Bridge Cross-Chain Assets",
      projectIcon: "C",
      projectName: "CrossBridge",
      hasProvideLiquidity: false,
      hasPreTge: false,
      boostValue: "18.7%",
      status: "new" as const
    }
  ]);

  const handleStatusChange = (taskId: string, newStatus: "new" | "pending" | "completed") => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  return (
    <div className="min-h-screen pt-20 md:pt-34 px-4 md:px-6 pb-20 bg-[var(--color-bg-page)] relative" style={{ background: 'var(--color-bg-page)' }}>
      <BackgroundBlobs />
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 relative z-10">
        <div className="flex justify-start">
          <CampaignHeader />
        </div>

        <SignInCard />

        <ExploreSection />

        <div className="grid gap-4 md:gap-6">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              taskId={task.id}
              title={task.title}
              projectIcon={task.projectIcon}
              projectName={task.projectName}
              hasProvideLiquidity={task.hasProvideLiquidity}
              hasPreTge={task.hasPreTge}
              boostValue={task.boostValue}
              status={task.status}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
