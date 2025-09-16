"use client";

import { useState, useEffect } from "react";
import CampaignHeader from "@/components/Home/CampaignHeader";
import SignInCard from "@/components/Home/SignInCard";
import ExploreSection from "@/components/Home/ExploreSection";
import QuestCard from "@/components/Home/QuestCard";
import BackgroundBlobs from "@/components/Home/BackgroundBlobs";
import { useWallet } from "@/contexts/WalletContext";
import { apolloApi, QuestInfo } from "@/services/api";
import { useQuestManager } from "@/hooks/useQuestManager";

export default function Home() {
  const { wallet, connectWallet: connectWalletKit } = useWallet();
  const { isAuthenticated, authenticateWallet, registerForQuest } = useQuestManager();
  
  // Real quests state
  const [quests, setQuests] = useState<QuestInfo[]>([]);
  const [questsLoading, setQuestsLoading] = useState(true);
  const [questsError, setQuestsError] = useState<string | null>(null);
  const [registrationStatus, setRegistrationStatus] = useState<{ [questId: number]: 'idle' | 'registering' | 'registered' | 'error' }>({});
  


  // Load quests on component mount and set up polling
  useEffect(() => {
    loadActiveQuests();
    
    // Set up polling every 30 seconds
    const interval = setInterval(loadActiveQuests, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadActiveQuests = async () => {
    try {
      setQuestsError(null);
      const activeQuests = await apolloApi.getActiveQuests();
      
      if (Array.isArray(activeQuests)) {
        setQuests(activeQuests);
        console.log(`✅ Loaded ${activeQuests.length} active quests`);
      } else {
        console.warn('Active quests response is not an array:', activeQuests);
        setQuests([]);
        setQuestsError('Invalid quest data format received from server');
      }
    } catch (err: any) {
      setQuestsError(err.message || 'Failed to load quests');
      console.error('❌ Error loading active quests:', err);
      setQuests([]);
    } finally {
      setQuestsLoading(false);
    }
  };

  const handleQuestRegistration = async (questId: number) => {
    if (!wallet.isConnected || !wallet.address) {
      try {
        await connectWalletKit();
        await authenticateWallet();
      } catch (err: any) {
        setRegistrationStatus(prev => ({ ...prev, [questId]: 'error' }));
        return;
      }
    }

    if (!isAuthenticated) {
      try {
        await authenticateWallet();
      } catch (err: any) {
        setRegistrationStatus(prev => ({ ...prev, [questId]: 'error' }));
        return;
      }
    }

    try {
      setRegistrationStatus(prev => ({ ...prev, [questId]: 'registering' }));
      const result = await registerForQuest(questId);
      if (result.success) {
        setRegistrationStatus(prev => ({ ...prev, [questId]: 'registered' }));
      } else {
        setRegistrationStatus(prev => ({ ...prev, [questId]: 'error' }));
      }
    } catch (err: any) {
      setRegistrationStatus(prev => ({ ...prev, [questId]: 'error' }));
      console.error(`Failed to register for quest ${questId}:`, err);
    }
  };



  return (
    <div className="min-h-screen pt-20 md:pt-34 px-4 md:px-6 pb-20 relative" style={{ background: 'var(--color-bg-page)' }}>
      <BackgroundBlobs />
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 relative z-10">
        <div className="flex justify-start">
          <CampaignHeader />
        </div>

        <SignInCard />

        <ExploreSection />

        {questsLoading && quests.length === 0 ? (
          <div className="grid gap-4 md:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[var(--color-bg-cards)] opacity-60 rounded-[12px] md:rounded-[20px] p-4 md:p-6 border border-[var(--color-border)] animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 mb-6"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-300 rounded-full w-24"></div>
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : questsError ? (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-600 font-medium mb-2">Failed to load campaigns</div>
              <div className="text-red-500 text-sm mb-4">{questsError}</div>
              <button 
                onClick={loadActiveQuests}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : quests.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
              <div className="text-gray-500 text-lg mb-2">No active campaigns</div>
              <div className="text-gray-400 text-sm mb-4">Check back later for new opportunities</div>
              <button 
                onClick={loadActiveQuests}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Refresh
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6">
            {quests.map((quest) => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onRegister={handleQuestRegistration}
                registrationStatus={registrationStatus[quest.id] || 'idle'}
                isWalletConnected={wallet.isConnected}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
