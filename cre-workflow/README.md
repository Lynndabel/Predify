# CRE Workflow for AI Prediction Market

This directory contains the Chainlink Runtime Environment (CRE) workflow that powers the AI-based resolution of prediction markets.

## Overview

The CRE workflow:
1. **Listens** for `MarketClosed` events from the smart contract
2. **Fetches** relevant external data based on market type (crypto prices, sports results, etc.)
3. **Uses OpenAI** to analyze data and determine the winning outcome
4. **Resolves** the market on-chain by calling `resolveMarket()` on the smart contract

## Architecture

```
┌─────────────────────┐
│  Smart Contract     │
│  (Polygon Amoy)     │
└──────────┬──────────┘
           │ emits MarketClosed event
           ▼
┌─────────────────────┐
│   CRE Workflow      │
│   (TypeScript)      │
├─────────────────────┤
│ 1. Event Trigger    │
│ 2. Fetch Market Data│
│ 3. Call External    │
│    APIs             │
│ 4. AI Resolution    │
│ 5. Write On-chain   │
└─────────────────────┘
           │
           ├──► CoinGecko API
           ├──► Sports APIs
           ├──► OpenAI API
           └──► Smart Contract
```

## Prerequisites

1. **Bun** (v1.2.21 or higher)
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. **CRE CLI**
   - Sign up at https://cre.chain.link
   - Download and install the CLI
   ```bash
   # Follow instructions from CRE dashboard
   ```

3. **API Keys**
   - OpenAI API key (required)
   - CoinGecko API key (optional, for crypto markets)
   - Sports API key (optional, for sports markets)

## Installation

```bash
cd cre-workflow
bun install
```

## Configuration

Edit `config.production.json`:

```json
{
  "predictionMarketAddress": "0x...",  // Your deployed contract address
  "chainSelector": "16281711391670634445",  // Polygon Amoy
  "openaiApiKey": "sk-...",
  "coingeckoApiKey": "CG-...",  // Optional
  "sportsApiKey": "...",  // Optional
  "crePrivateKey": "0x...",  // Private key for CRE to sign transactions
  "rpcUrl": "https://rpc-amoy.polygon.technology"
}
```

## Local Simulation

Before deploying to a DON, test the workflow locally:

```bash
# Simulate the workflow
bun run simulate

# Or use CRE CLI directly
cre workflow simulate --config config.production.json
```

The simulation will:
- Connect to real blockchain (Polygon Amoy testnet)
- Make real API calls (OpenAI, CoinGecko, etc.)
- Show you exactly what would happen in production
- NOT execute any transactions (read-only mode)

## Building the Workflow

```bash
bun run build

# Or
cre workflow build
```

This compiles your TypeScript workflow into WebAssembly (WASM) that can run on Chainlink DONs.

## Deployment

1. **Build the workflow**:
   ```bash
   bun run build
   ```

2. **Deploy to CRE**:
   ```bash
   bun run deploy
   
   # Or with specific config
   cre workflow deploy --config config.production.json --network mainnet
   ```

3. **Monitor in CRE UI**:
   - Visit https://cre.chain.link
   - View your deployed workflows
   - Check logs and execution history

## How It Works

### 1. Event Listening

The workflow uses an EVM event trigger to listen for `MarketClosed` events:

```typescript
const marketClosedTrigger = cre.triggers.evm.createEventTrigger({
  chainSelector: config.chainSelector,
  contractAddress: config.predictionMarketAddress,
  eventSignature: "MarketClosed(uint256,uint256)",
  confirmations: 2,
});
```

### 2. Market Type Detection

The workflow analyzes the market question to determine what data to fetch:

- **Crypto Markets**: "Will Bitcoin reach $100k?" → Fetch from CoinGecko
- **Sports Markets**: "Who will win the game?" → Fetch from Sports API
- **General Markets**: Any other question → Use AI with context

### 3. External Data Fetching

Using CRE's HTTP capability with Node Runtime for non-BFT operations:

```typescript
const nodeRuntime = runtime.asNode();
const price = await fetchCryptoPrice(nodeRuntime, "bitcoin", "usd");
```

### 4. AI Resolution

OpenAI analyzes the data and determines the outcome:

```typescript
const winningOutcome = await resolveWithAI(
  nodeRuntime,
  question,
  outcomes,
  contextData
);
```

### 5. On-Chain Resolution

The workflow writes the result back to the blockchain:

```typescript
const txResult = evmClient
  .writeContract(runtime, {
    to: config.predictionMarketAddress,
    data: resolveData,
    gasLimit: 500000,
  })
  .result();
```

## Market Type Examples

### Crypto Price Market

**Question**: "Will Bitcoin exceed $100,000 by December 31, 2024?"
**Outcomes**: ["YES", "NO"]

Workflow:
1. Fetches current BTC price from CoinGecko
2. AI compares price to threshold
3. Resolves with appropriate outcome

### Sports Market

**Question**: "Who will win Super Bowl LIX?"
**Outcomes**: ["Kansas City Chiefs", "San Francisco 49ers"]

Workflow:
1. Fetches game result from Sports API
2. AI determines winner
3. Resolves with winning team

### General Market

**Question**: "Will there be a new iPhone release in 2024?"
**Outcomes**: ["YES", "NO"]

Workflow:
1. AI searches for recent news/announcements
2. Evaluates evidence
3. Makes determination

## Testing

### Test with Mock Event

You can test the workflow by manually triggering it:

```bash
# Create a test market on the contract
# Close the market
# Watch the CRE workflow process it
```

### Debugging

Enable verbose logging:

```typescript
console.log("Market closure event received:", eventPayload);
console.log(`Processing market ID: ${marketId}`);
console.log(`AI determined winning outcome: ${winningOutcome}`);
```

Check logs in the CRE UI dashboard.

## Security Notes

1. **Private Keys**: Never commit `config.production.json` with real keys
2. **API Rate Limits**: CRE handles consensus, but be mindful of API quotas
3. **Gas Management**: Ensure CRE wallet has sufficient MATIC for transactions

## Troubleshooting

### "Failed to connect to RPC"
- Check `rpcUrl` in config
- Ensure Polygon Amoy is accessible
- Try alternative RPC: `https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY`

### "OpenAI API error"
- Verify API key is valid
- Check you have sufficient credits
- Ensure model name is correct

### "Market already resolved"
- Check market status on-chain
- Verify workflow isn't running multiple times
- Review event logs

## Resources

- [CRE Documentation](https://docs.chain.link/cre)
- [CRE SDK Reference](https://docs.chain.link/cre/reference/sdk/core-ts)
- [CRE Examples](https://github.com/smartcontractkit/cre-examples)
- [OpenAI API Docs](https://platform.openai.com/docs)

## Support

For issues:
- CRE: https://discord.gg/chainlink
- Project: [GitHub Issues](YOUR_REPO_URL)
