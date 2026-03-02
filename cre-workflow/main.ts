import {
  cre,
  encodeCallMsg,
  type Runtime,
  type NodeRuntime,
  LAST_FINALIZED_BLOCK_NUMBER,
} from "@chainlink/cre-sdk";
import { Runner } from "@chainlink/cre-sdk";
import { z } from "zod";
import { createPublicClient, http, parseAbiItem, decodeEventLog } from "viem";
import { polygonAmoy } from "viem/chains";

// ============ Configuration Schema ============

const configSchema = z.object({
  // Contract addresses
  predictionMarketAddress: z.string(),
  chainSelector: z.string(),
  
  // API Keys
  openaiApiKey: z.string(),
  coingeckoApiKey: z.string().optional(),
  sportsApiKey: z.string().optional(),
  
  // CRE Configuration
  crePrivateKey: z.string(),
  rpcUrl: z.string(),
});

type Config = z.infer<typeof configSchema>;

// ============ ABI Definitions ============

const MARKET_CLOSED_EVENT_ABI = parseAbiItem(
  "event MarketClosed(uint256 indexed marketId, uint256 timestamp)"
);

const RESOLVE_MARKET_ABI = [
  {
    name: "resolveMarket",
    type: "function",
    inputs: [
      { name: "marketId", type: "uint256" },
      { name: "winningOutcome", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "getMarket",
    type: "function",
    inputs: [{ name: "marketId", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "question", type: "string" },
      { name: "outcomes", type: "string[]" },
      { name: "resolutionTime", type: "uint256" },
      { name: "createdAt", type: "uint256" },
      { name: "status", type: "uint8" },
      { name: "winningOutcome", type: "uint256" },
      { name: "totalPool", type: "uint256" },
    ],
    stateMutability: "view",
  },
] as const;

// ============ External Data Fetchers ============

/**
 * Fetch crypto price data from CoinGecko
 */
async function fetchCryptoPrice(
  runtime: NodeRuntime<Config>,
  coinId: string,
  vsCurrency: string = "usd"
): Promise<number | null> {
  const httpClient = new cre.capabilities.HTTPClient();
  
  const apiKey = runtime.config.coingeckoApiKey || "";
  const headers = apiKey ? { "x-cg-demo-api-key": apiKey } : {};
  
  const response = httpClient
    .get(runtime, {
      url: `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`,
      headers,
    })
    .result();

  if (response.statusCode !== 200) {
    console.log(`CoinGecko API error: ${response.statusCode}`);
    return null;
  }

  const data = JSON.parse(response.body);
  return data[coinId]?.[vsCurrency] || null;
}

/**
 * Fetch general web data or RSS feeds
 */
async function fetchWebData(
  runtime: NodeRuntime<Config>,
  url: string
): Promise<string | null> {
  const httpClient = new cre.capabilities.HTTPClient();
  
  const response = httpClient
    .get(runtime, {
      url,
      headers: {},
    })
    .result();

  if (response.statusCode !== 200) {
    console.log(`Web fetch error: ${response.statusCode}`);
    return null;
  }

  return response.body;
}

/**
 * Parse market question to determine data type needed
 */
function parseMarketType(question: string): {
  type: "crypto" | "sports" | "general";
  params: any;
} {
  const lowerQuestion = question.toLowerCase();
  
  // Check for crypto price questions
  const cryptoMatch = lowerQuestion.match(
    /(bitcoin|btc|ethereum|eth|solana|sol).*(above|below|reach|exceed)\s*\$?(\d+)/i
  );
  if (cryptoMatch) {
    const coin = cryptoMatch[1];
    const threshold = parseFloat(cryptoMatch[3]);
    const coinId = coin === "bitcoin" || coin === "btc" ? "bitcoin" :
                   coin === "ethereum" || coin === "eth" ? "ethereum" :
                   coin === "solana" || coin === "sol" ? "solana" : "bitcoin";
    
    return {
      type: "crypto",
      params: { coinId, threshold, direction: cryptoMatch[2] },
    };
  }
  
  // Check for sports questions
  if (lowerQuestion.includes("win") || lowerQuestion.includes("game") || 
      lowerQuestion.includes("match") || lowerQuestion.includes("tournament")) {
    return {
      type: "sports",
      params: { question },
    };
  }
  
  // Default to general
  return {
    type: "general",
    params: { question },
  };
}

// ============ AI Resolution ============

/**
 * Call OpenAI to determine market outcome
 */
async function resolveWithAI(
  runtime: NodeRuntime<Config>,
  question: string,
  outcomes: string[],
  contextData: any
): Promise<number> {
  const httpClient = new cre.capabilities.HTTPClient();
  
  const systemPrompt = `You are a fact-checking and event resolution system for prediction markets. 
Your role is to determine the correct outcome based on factual, verifiable data.

Rules:
1. Always base your decision on the provided data
2. If data is insufficient or unclear, choose the most reasonable outcome
3. Be objective and unbiased
4. Respond ONLY with a JSON object in this exact format: {"outcome": <index>, "reasoning": "<brief explanation>"}
5. The outcome index must be a number corresponding to the position in the outcomes array (0-indexed)`;

  const userPrompt = `Determine the outcome of this prediction market:

Question: ${question}

Possible Outcomes:
${outcomes.map((o, i) => `${i}: ${o}`).join("\n")}

Context Data:
${JSON.stringify(contextData, null, 2)}

Based on the above information, which outcome is correct? Respond with JSON only.`;

  const requestBody = JSON.stringify({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  });

  const response = httpClient
    .post(runtime, {
      url: "https://api.openai.com/v1/chat/completions",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${runtime.config.openaiApiKey}`,
      },
      body: requestBody,
    })
    .result();

  if (response.statusCode !== 200) {
    console.log(`OpenAI API error: ${response.statusCode} - ${response.body}`);
    // Default to first outcome if AI fails
    return 0;
  }

  const data = JSON.parse(response.body);
  const aiResponse = JSON.parse(data.choices[0].message.content);
  
  console.log(`AI Resolution: ${JSON.stringify(aiResponse)}`);
  
  // Validate outcome index
  const outcomeIndex = parseInt(aiResponse.outcome);
  if (outcomeIndex >= 0 && outcomeIndex < outcomes.length) {
    return outcomeIndex;
  }
  
  // Default to first outcome if invalid
  return 0;
}

// ============ Main Workflow Callback ============

/**
 * Callback function that handles market closure events
 */
const onMarketClosed = async (
  runtime: Runtime<Config>,
  eventPayload: any
): Promise<string> => {
  console.log("Market closure event received:", eventPayload);
  
  // Extract market ID from event
  const marketId = BigInt(eventPayload.topics[1]);
  console.log(`Processing market ID: ${marketId}`);
  
  // Initialize EVM client
  const evmClient = new cre.capabilities.EVMClient(runtime.config.chainSelector);
  
  // Read market details from contract
  const marketData = evmClient
    .callContract(runtime, {
      call: encodeCallMsg({
        from: "0x0000000000000000000000000000000000000000",
        to: runtime.config.predictionMarketAddress,
        data: encodeFunctionData({
          abi: RESOLVE_MARKET_ABI,
          functionName: "getMarket",
          args: [marketId],
        }),
      }),
      blockNumber: LAST_FINALIZED_BLOCK_NUMBER,
    })
    .result();
  
  // Decode market data
  const decodedMarket = decodeFunctionResult({
    abi: RESOLVE_MARKET_ABI,
    functionName: "getMarket",
    data: marketData.result,
  });
  
  const [id, creator, question, outcomes, resolutionTime, createdAt, status] = decodedMarket;
  
  console.log(`Market Question: ${question}`);
  console.log(`Outcomes: ${outcomes}`);
  
  // Use Node Runtime for external API calls (non-BFT operations)
  const nodeRuntime = runtime.asNode();
  
  // Determine market type and fetch relevant data
  const marketType = parseMarketType(question);
  let contextData: any = {};
  
  if (marketType.type === "crypto") {
    console.log("Fetching crypto price data...");
    const price = await fetchCryptoPrice(
      nodeRuntime,
      marketType.params.coinId,
      "usd"
    );
    contextData = {
      type: "crypto_price",
      coinId: marketType.params.coinId,
      currentPrice: price,
      threshold: marketType.params.threshold,
      fetchedAt: new Date().toISOString(),
    };
  } else if (marketType.type === "sports") {
    console.log("Fetching sports data...");
    // In a real implementation, integrate with sports API
    contextData = {
      type: "sports",
      question: question,
      note: "Sports data would be fetched from API in production",
    };
  } else {
    console.log("General market - using AI with web search context");
    contextData = {
      type: "general",
      question: question,
      timestamp: new Date().toISOString(),
    };
  }
  
  // Use AI to determine outcome
  console.log("Calling AI for resolution...");
  const winningOutcome = await resolveWithAI(
    nodeRuntime,
    question,
    outcomes as string[],
    contextData
  );
  
  console.log(`AI determined winning outcome: ${winningOutcome} (${outcomes[winningOutcome]})`);
  
  // Prepare transaction to resolve market on-chain
  const resolveData = encodeFunctionData({
    abi: RESOLVE_MARKET_ABI,
    functionName: "resolveMarket",
    args: [marketId, BigInt(winningOutcome)],
  });
  
  // Execute transaction via EVM client
  const txResult = evmClient
    .writeContract(runtime, {
      to: runtime.config.predictionMarketAddress,
      data: resolveData,
      gasLimit: 500000,
    })
    .result();
  
  console.log(`Market resolved on-chain. Transaction: ${txResult.transactionHash}`);
  
  return `Market ${marketId} resolved with outcome: ${outcomes[winningOutcome]}`;
};

// ============ Workflow Initialization ============

/**
 * Initialize the workflow with event trigger
 */
function initWorkflow(config: Config) {
  // Create EVM event trigger for MarketClosed events
  const marketClosedTrigger = cre.triggers.evm.createEventTrigger({
    chainSelector: config.chainSelector,
    contractAddress: config.predictionMarketAddress,
    eventSignature: "MarketClosed(uint256,uint256)",
    confirmations: 2,
  });
  
  // Register handler
  return [cre.handler(marketClosedTrigger, onMarketClosed)];
}

// ============ Main Entry Point ============

export async function main() {
  const runner = await Runner.newRunner<Config>({
    configSchema,
  });
  
  await runner.run(initWorkflow);
}

// Helper functions for encoding/decoding (using viem)
function encodeFunctionData(params: any) {
  const { encodeFunctionData: encode } = require("viem");
  return encode(params);
}

function decodeFunctionResult(params: any) {
  const { decodeFunctionResult: decode } = require("viem");
  return decode(params);
}

// Run the workflow
if (require.main === module) {
  main().catch((error) => {
    console.error("Workflow error:", error);
    process.exit(1);
  });
}
