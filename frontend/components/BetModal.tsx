"use client";

import { useState } from "react";
import { useActiveAccount, useSendTransaction, useReadContract } from "thirdweb/react";
import { prepareContractCall, toWei } from "thirdweb";
import {
  getPredictionMarketContract,
  getTestTokenContract,
  PREDICTION_MARKET_ADDRESS,
} from "@/lib/contract";

interface BetModalProps {
  marketId: number;
  outcome: string;
  outcomeIndex: number;
  currentOdds: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BetModal({
  marketId,
  outcome,
  outcomeIndex,
  currentOdds,
  onClose,
  onSuccess,
}: BetModalProps) {
  const account = useActiveAccount();
  const [amount, setAmount] = useState("");
  const [step, setStep] = useState<"input" | "approve" | "bet" | "success">("input");

  const tokenContract = getTestTokenContract();
  const marketContract = getPredictionMarketContract();

  const { mutate: sendTransaction, isPending } = useSendTransaction();

  // Read user's token balance
  const { data: balance } = useReadContract({
    contract: tokenContract,
    method: "function balanceOf(address) view returns (uint256)",
    params: account ? [account.address] : undefined,
  });

  // Read user's allowance
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    contract: tokenContract,
    method: "function allowance(address, address) view returns (uint256)",
    params: account ? [account.address, PREDICTION_MARKET_ADDRESS] : undefined,
  });

  const handleApprove = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setStep("approve");

    const amountInWei = toWei(amount);

    const transaction = prepareContractCall({
      contract: tokenContract,
      method: "function approve(address, uint256) returns (bool)",
      params: [PREDICTION_MARKET_ADDRESS, amountInWei],
    });

    sendTransaction(transaction, {
      onSuccess: async () => {
        await refetchAllowance();
        setStep("bet");
      },
      onError: (error) => {
        console.error("Approval failed:", error);
        setStep("input");
        alert("Approval failed. Please try again.");
      },
    });
  };

  const handlePlaceBet = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    const amountInWei = toWei(amount);

    const transaction = prepareContractCall({
      contract: marketContract,
      method: "function placeBet(uint256, uint256, uint256)",
      params: [BigInt(marketId), BigInt(outcomeIndex), amountInWei],
    });

    sendTransaction(transaction, {
      onSuccess: () => {
        setStep("success");
        setTimeout(() => {
          onSuccess();
        }, 2000);
      },
      onError: (error) => {
        console.error("Bet failed:", error);
        setStep("bet");
        alert("Bet failed. Please try again.");
      },
    });
  };

  const needsApproval = () => {
    if (!allowance || !amount) return true;
    const amountInWei = toWei(amount);
    return allowance < amountInWei;
  };

  const calculatePotentialWinnings = () => {
    if (!amount || parseFloat(amount) <= 0) return 0;
    const betAmount = parseFloat(amount);
    // Simplified calculation: if odds are 30%, potential payout is ~3.33x
    // Formula: (betAmount / (odds/100)) - betAmount
    const impliedMultiplier = 100 / currentOdds;
    const grossPayout = betAmount * impliedMultiplier;
    const platformFee = grossPayout * 0.03;
    return grossPayout - platformFee;
  };

  const userBalance = balance ? Number(balance) / 1e18 : 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 to-indigo-900 border border-white/20 rounded-2xl max-w-md w-full p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-purple-200 hover:text-white transition text-2xl"
        >
          ×
        </button>

        {/* Success State */}
        {step === "success" ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-2xl font-bold text-white mb-2">Bet Placed!</h3>
            <p className="text-purple-200">
              Your bet has been successfully recorded on-chain.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <h2 className="text-2xl font-bold text-white mb-2">Place Your Bet</h2>
            <p className="text-purple-200 mb-6">On: {outcome}</p>

            {/* Current Odds */}
            <div className="bg-white/10 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Current Odds</span>
                <span className="text-2xl font-bold text-white">{currentOdds}%</span>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-6">
              <label className="block text-sm text-purple-300 mb-2">
                Bet Amount (TPT)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                step="0.01"
                min="0"
                disabled={step !== "input"}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-purple-300">
                  Balance: {userBalance.toFixed(2)} TPT
                </span>
                <button
                  onClick={() => setAmount(userBalance.toString())}
                  className="text-xs text-purple-400 hover:text-purple-300 transition"
                  disabled={step !== "input"}
                >
                  Max
                </button>
              </div>
            </div>

            {/* Potential Winnings */}
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Potential Winnings</span>
                  <span className="text-xl font-bold text-white">
                    {calculatePotentialWinnings().toFixed(2)} TPT
                  </span>
                </div>
                <div className="text-xs text-purple-300 mt-1">After 3% platform fee</div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {step === "input" && needsApproval() && (
                <button
                  onClick={handleApprove}
                  disabled={!amount || parseFloat(amount) <= 0 || isPending}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Approving..." : "Approve Tokens"}
                </button>
              )}

              {(step === "bet" || (step === "input" && !needsApproval())) && (
                <button
                  onClick={handlePlaceBet}
                  disabled={!amount || parseFloat(amount) <= 0 || isPending}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Placing Bet..." : "Confirm Bet"}
                </button>
              )}

              {step === "approve" && (
                <div className="text-center text-purple-200 text-sm">
                  Waiting for approval transaction...
                </div>
              )}
            </div>

            {/* Info */}
            <div className="mt-6 text-xs text-purple-300 space-y-1">
              <p>• Bets are final and cannot be withdrawn</p>
              <p>• Market resolves automatically via AI + Chainlink CRE</p>
              <p>• Winners can claim after resolution</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
