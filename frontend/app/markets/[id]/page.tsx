"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ConnectButton, useActiveAccount, useReadContract, useSendTransaction } from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { client } from "@/lib/thirdwebClient";
import {
  polygonAmoy,
  getPredictionMarketContract,
  getTestTokenContract,
  MarketStatus,
  PREDICTION_MARKET_ADDRESS,
} from "@/lib/contract";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { formatDistanceToNow } from "date-fns";
import BetModal from "@/components/BetModal";

const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
];

export default function MarketDetail() {
  const params = useParams();
  const router = useRouter();
  const account = useActiveAccount();
  const marketId = params.id as string;

  const [market, setMarket] = useState<any>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [outcomeOdds, setOutcomeOdds] = useState<number[]>([]);
  const [userBets, setUserBets] = useState<number[]>([]);

  const contract = getPredictionMarketContract();
  const tokenContract = getTestTokenContract();

  // Read market data
  const { data: marketData, isLoading, refetch } = useReadContract({
    contract,
    method: "function getMarket(uint256) view returns (uint256, address, string, string[], uint256, uint256, uint8, uint256, uint256)",
    params: [BigInt(marketId)],
  });

  // Fetch market details and odds
  useEffect(() => {
    if (!marketData) return;

    const [id, creator, question, outcomes, resolutionTime, createdAt, status, winningOutcome, totalPool] = marketData;

    setMarket({
      id: Number(id),
      creator,
      question,
      outcomes,
      resolutionTime: Number(resolutionTime),
      createdAt: Number(createdAt),
      status,
      winningOutcome: Number(winningOutcome),
      totalPool: Number(totalPool) / 1e18,
    });

    // Fetch odds for each outcome
    async function fetchOdds() {
      const oddsPromises = outcomes.map(async (_, index) => {
        try {
          const response = await fetch(`/api/markets/${marketId}/odds/${index}`);
          const data = await response.json();
          return data.odds || 0;
        } catch {
          return 50; // Default 50% if error
        }
      });

      const odds = await Promise.all(oddsPromises);
      setOutcomeOdds(odds);
    }

    fetchOdds();
  }, [marketData, marketId]);

  // Fetch user bets if connected
  useEffect(() => {
    if (!account || !market) return;

    async function fetchUserBets() {
      const betsPromises = market.outcomes.map(async (_: string, index: number) => {
        try {
          const response = await fetch(
            `/api/markets/${marketId}/user-bets?address=${account.address}&outcome=${index}`
          );
          const data = await response.json();
          return data.bet || 0;
        } catch {
          return 0;
        }
      });

      const bets = await Promise.all(betsPromises);
      setUserBets(bets);
    }

    fetchUserBets();
  }, [account, market, marketId]);

  const getStatusBadge = () => {
    if (!market) return null;

    switch (market.status) {
      case MarketStatus.Active:
        return (
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
            🟢 Active
          </span>
        );
      case MarketStatus.Closed:
        return (
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            🟡 Closed - Awaiting AI Resolution
          </span>
        );
      case MarketStatus.Resolved:
        return (
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            ✅ Resolved
          </span>
        );
      case MarketStatus.Cancelled:
        return (
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
            ❌ Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const handleBetClick = (outcomeIndex: number) => {
    setSelectedOutcome(outcomeIndex);
    setShowBetModal(true);
  };

  const handleBetSuccess = () => {
    refetch();
    setShowBetModal(false);
  };

  if (isLoading || !market) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          <p className="text-purple-200 mt-4 text-lg">Loading market...</p>
        </div>
      </div>
    );
  }

  const timeRemaining = () => {
    const now = Date.now();
    const resolutionDate = market.resolutionTime * 1000;

    if (now >= resolutionDate) {
      return "Market has ended";
    }

    return `Closes ${formatDistanceToNow(resolutionDate, { addSuffix: true })}`;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="text-purple-200 hover:text-white transition flex items-center gap-2"
            >
              ← Back to Markets
            </Link>
            <ConnectButton
              client={client}
              wallets={wallets}
              chain={polygonAmoy}
              theme="dark"
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Market Header */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            {getStatusBadge()}
            <div className="text-right">
              <div className="text-sm text-purple-300">Market ID</div>
              <div className="text-xl font-bold text-white">#{market.id}</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">{market.question}</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-purple-300 mb-1">Total Pool</div>
              <div className="text-2xl font-bold text-white">
                {market.totalPool.toFixed(2)} TPT
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-purple-300 mb-1">Time Remaining</div>
              <div className="text-lg font-bold text-white">{timeRemaining()}</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-purple-300 mb-1">Resolution</div>
              <div className="text-lg font-bold text-white">AI + CRE</div>
            </div>
            <div className="bg-black/20 rounded-lg p-4">
              <div className="text-sm text-purple-300 mb-1">Platform Fee</div>
              <div className="text-lg font-bold text-white">3%</div>
            </div>
          </div>
        </div>

        {/* Outcomes Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {market.outcomes.map((outcome: string, index: number) => {
            const isWinning = market.status === MarketStatus.Resolved && index === market.winningOutcome;
            const userBet = userBets[index] || 0;

            return (
              <div
                key={index}
                className={`bg-white/10 backdrop-blur-sm border ${
                  isWinning ? "border-green-500/50 bg-green-500/10" : "border-white/20"
                } rounded-xl p-6 ${
                  market.status === MarketStatus.Active ? "card-hover" : ""
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-white">{outcome}</h3>
                  {isWinning && (
                    <span className="text-2xl">🏆</span>
                  )}
                </div>

                {/* Odds Display */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-purple-300">Current Odds</span>
                    <span className="text-3xl font-bold text-white">
                      {outcomeOdds[index] || 50}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        isWinning ? "bg-green-500" : "bg-purple-500"
                      } transition-all duration-500`}
                      style={{ width: `${outcomeOdds[index] || 50}%` }}
                    />
                  </div>
                </div>

                {/* User's Bet */}
                {userBet > 0 && (
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 mb-4">
                    <div className="text-xs text-purple-300">Your Bet</div>
                    <div className="text-lg font-bold text-white">
                      {(userBet / 1e18).toFixed(2)} TPT
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {market.status === MarketStatus.Active && (
                  <button
                    onClick={() => handleBetClick(index)}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!account}
                  >
                    {!account ? "Connect Wallet to Bet" : "Place Bet"}
                  </button>
                )}

                {market.status === MarketStatus.Resolved && isWinning && userBet > 0 && (
                  <button
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
                  >
                    Claim Winnings
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Market Info */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Market Information</h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm text-purple-300 mb-1">Creator</dt>
              <dd className="text-white font-mono text-sm">
                {market.creator.slice(0, 6)}...{market.creator.slice(-4)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-purple-300 mb-1">Created</dt>
              <dd className="text-white">
                {new Date(market.createdAt * 1000).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-purple-300 mb-1">Resolution Time</dt>
              <dd className="text-white">
                {new Date(market.resolutionTime * 1000).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-purple-300 mb-1">Resolution Method</dt>
              <dd className="text-white">Chainlink CRE + AI (GPT-4)</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Bet Modal */}
      {showBetModal && selectedOutcome !== null && (
        <BetModal
          marketId={market.id}
          outcome={market.outcomes[selectedOutcome]}
          outcomeIndex={selectedOutcome}
          currentOdds={outcomeOdds[selectedOutcome] || 50}
          onClose={() => setShowBetModal(false)}
          onSuccess={handleBetSuccess}
        />
      )}
    </main>
  );
}
