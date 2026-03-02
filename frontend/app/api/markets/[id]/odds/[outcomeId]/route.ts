import { NextRequest, NextResponse } from "next/server";
import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { polygonAmoy } from "@/lib/contract";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; outcomeId: string } }
) {
  try {
    const { id: marketId, outcomeId } = params;
    const contractAddress = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS;

    if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      return NextResponse.json({ odds: 50 }); // Default odds
    }

    const contract = getContract({
      client,
      chain: polygonAmoy,
      address: contractAddress,
    });

    const odds = await readContract({
      contract,
      method: "function getOdds(uint256, uint256) view returns (uint256)",
      params: [BigInt(marketId), BigInt(outcomeId)],
    });

    return NextResponse.json({ odds: Number(odds) });
  } catch (error) {
    console.error("Error fetching odds:", error);
    return NextResponse.json({ odds: 50 });
  }
}
