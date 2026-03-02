import { NextRequest, NextResponse } from "next/server";
import { createThirdwebClient, getContract, readContract } from "thirdweb";
import { polygonAmoy } from "@/lib/contract";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get("address");
    const outcome = searchParams.get("outcome");
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/");
    const marketId = pathParts[pathParts.length - 2];

    if (!address || !outcome) {
      return NextResponse.json({ bet: 0 });
    }

    const contractAddress = process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS;

    if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
      return NextResponse.json({ bet: 0 });
    }

    const contract = getContract({
      client,
      chain: polygonAmoy,
      address: contractAddress,
    });

    const bet = await readContract({
      contract,
      method: "function getUserBet(uint256, address, uint256) view returns (uint256)",
      params: [BigInt(marketId), address as `0x${string}`, BigInt(outcome)],
    });

    return NextResponse.json({ bet: Number(bet) });
  } catch (error) {
    console.error("Error fetching user bet:", error);
    return NextResponse.json({ bet: 0 });
  }
}
