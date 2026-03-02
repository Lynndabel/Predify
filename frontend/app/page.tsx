"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConnectButton } from "thirdweb/react";
import { useReadContract } from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { polygonAmoy, getPredictionMarketContract, MarketStatus } from "@/lib/contract";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import MarketCard from "@/components/MarketCard";

const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
];

export default function Home() {
  const [markets, setMarkets] = useState<any[]>([]);
  const contract = getPredictionMarketContract();

  // Read total number of markets
  const { data: marketCounter, isLoading } = useReadContract({
    contract,
    method: "function marketCounter() view returns (uint256)",
    params: [],
  });

  // Fetch all markets
  useEffect(() => {
    async function fetchMarkets() {
      if (!marketCounter) return;

      const count = Number(marketCounter);
      const marketPromises = [];

      for (let i = 0; i < count; i++) {
        marketPromises.push(
          fetch(`/api/markets/${i}`).then((res) => res.json())
        );
      }

      try {
        const fetchedMarkets = await Promise.all(marketPromises);
        setMarkets(fetchedMarkets.filter((m) => m !== null));
      } catch (error) {
        console.error("Error fetching markets:", error);
      }
    }

    fetchMarkets();
  }, [marketCounter]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">AI Prediction Market</h1>
              <p className="text-sm text-purple-200">
                Powered by Chainlink CRE & thirdweb
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/create"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
              >
                Create Market
              </Link>
              <ConnectButton
                client={client}
                wallets={wallets}
                chain={polygonAmoy}
                theme="dark"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-extrabold text-white mb-4">
            Predict the Future with AI
          </h2>
          <p className="text-xl text-purple-200 max-w-3xl mx-auto mb-8">
            Create and participate in prediction markets resolved automatically by
            AI and verified by Chainlink decentralized oracle networks.
          </p>
          <div className="flex gap-4 justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
              <div className="text-3xl font-bold text-white">{markets.length}</div>
              <div className="text-sm text-purple-200">Active Markets</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
              <div className="text-3xl font-bold text-white">AI</div>
              <div className="text-sm text-purple-200">Powered Resolution</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
              <div className="text-3xl font-bold text-white">3%</div>
              <div className="text-sm text-purple-200">Platform Fee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Markets Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-8">
            Active Prediction Markets
          </h3>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              <p className="text-purple-200 mt-4">Loading markets...</p>
            </div>
          ) : markets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔮</div>
              <h4 className="text-2xl font-bold text-white mb-2">
                No markets yet
              </h4>
              <p className="text-purple-200 mb-6">
                Be the first to create a prediction market!
              </p>
              <Link
                href="/create"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition"
              >
                Create Market
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {markets.map((market) => (
                <MarketCard key={market.id} market={market} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">📝</div>
              <h4 className="text-xl font-bold text-white mb-2">
                1. Create Market
              </h4>
              <p className="text-purple-200">
                Post a question about a future event with possible outcomes
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h4 className="text-xl font-bold text-white mb-2">
                2. Place Bets
              </h4>
              <p className="text-purple-200">
                Stake tokens on the outcome you believe will occur
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h4 className="text-xl font-bold text-white mb-2">
                3. AI Resolves
              </h4>
              <p className="text-purple-200">
                Chainlink CRE fetches data and AI determines the winner
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-purple-200">
            Built with{" "}
            <a
              href="https://chain.link/cre"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              Chainlink CRE
            </a>{" "}
            &{" "}
            <a
              href="https://thirdweb.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300"
            >
              thirdweb
            </a>
          </p>
          <p className="text-sm text-purple-300 mt-2">
            Polygon Amoy Testnet • For demonstration purposes only
          </p>
        </div>
      </footer>
    </main>
  );
}
