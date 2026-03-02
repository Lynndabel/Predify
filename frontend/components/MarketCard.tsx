"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MarketStatus } from "@/lib/contract";

interface MarketCardProps {
  market: {
    id: number;
    question: string;
    outcomes: string[];
    resolutionTime: number;
    status: MarketStatus;
    totalPool: string;
    outcomeOdds: number[];
  };
}

export default function MarketCard({ market }: MarketCardProps) {
  const getStatusBadge = () => {
    switch (market.status) {
      case MarketStatus.Active:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
            Active
          </span>
        );
      case MarketStatus.Closed:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
            Closed
          </span>
        );
      case MarketStatus.Resolved:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Resolved
          </span>
        );
      case MarketStatus.Cancelled:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getTimeRemaining = () => {
    const now = Date.now();
    const resolutionDate = market.resolutionTime * 1000;

    if (now >= resolutionDate) {
      return "Ended";
    }

    return formatDistanceToNow(resolutionDate, { addSuffix: true });
  };

  return (
    <Link href={`/markets/${market.id}`}>
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 card-hover cursor-pointer">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          {getStatusBadge()}
          <div className="text-sm text-purple-200">{getTimeRemaining()}</div>
        </div>

        {/* Question */}
        <h4 className="text-xl font-bold text-white mb-4 line-clamp-2">
          {market.question}
        </h4>

        {/* Outcomes */}
        <div className="space-y-2 mb-4">
          {market.outcomes.slice(0, 2).map((outcome, index) => (
            <div key={index} className="flex justify-between items-center">
              <span className="text-purple-200 text-sm">{outcome}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${market.outcomeOdds[index] || 50}%` }}
                  />
                </div>
                <span className="text-white text-sm font-medium w-12 text-right">
                  {market.outcomeOdds[index] || 50}%
                </span>
              </div>
            </div>
          ))}
          {market.outcomes.length > 2 && (
            <div className="text-xs text-purple-300">
              +{market.outcomes.length - 2} more options
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <div>
            <div className="text-xs text-purple-300">Total Pool</div>
            <div className="text-lg font-bold text-white">
              {parseFloat(market.totalPool).toFixed(2)} TPT
            </div>
          </div>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition">
            Place Bet →
          </button>
        </div>
      </div>
    </Link>
  );
}
