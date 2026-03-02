import { NextRequest, NextResponse } from "next/server";
import { createThirdwebClient } from "thirdweb";
import { getContract } from "thirdweb";
import { polygonAmoy } from "@/lib/contract";
import { readContract } from "thirdweb";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const marketId = params.id;
    const contractAddress = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS;

    if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      return NextResponse.json(
        { error: "Contract not deployed. Please set NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS" },
        { status: 500 }
      );
    }

    const contract = getContract({
      client,
      chain: polygonAmoy,
      address: contractAddress,
    });

    // Read market data
    const marketData = await readContract({
      contract,
      method: "function getMarket(uint256) view returns (uint256, address, string, string[], uint256, uint256, uint8, uint256, uint256)",
      params: [BigInt(marketId)],
    });

    const [id, creator, question, outcomes, resolutionTime, createdAt, status, winningOutcome, totalPool] = marketData;

    // Fetch outcome odds
    const oddsPromises = outcomes.map(async (_: string, index: number) => {
      try {
        const odds = await readContract({
          contract,
          method: "function getOdds(uint256, uint256) view returns (uint256)",
          params: [BigInt(marketId), BigInt(index)],
        });
        return Number(odds);
      } catch (error) {
        console.error(`Error fetching odds for outcome ${index}:`, error);
        return 50; // Default to 50%
      }
    });

    const outcomeOdds = await Promise.all(oddsPromises);

    return NextResponse.json({
      id: Number(id),
      creator,
      question,
      outcomes,
      resolutionTime: Number(resolutionTime),
      createdAt: Number(createdAt),
      status: Number(status),
      winningOutcome: Number(winningOutcome),
      totalPool: (Number(totalPool) / 1e18).toString(),
      outcomeOdds,
    });
  } catch (error) {
    console.error("Error fetching market:", error);
    return NextResponse.json(
      { error: "Failed to fetch market data" },
      { status: 500 }
    );
  }
}
