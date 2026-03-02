# Architecture & Design Document

## System Overview

The AI Prediction Market is a decentralized application that combines:
- **Smart Contracts** (Solidity) for trustless market logic
- **Chainlink CRE** (TypeScript) for off-chain orchestration
- **AI** (OpenAI GPT-4) for intelligent market resolution
- **thirdweb SDK** (React) for seamless Web3 UX

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            USER LAYER                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Browser    │  │Mobile Wallet │  │   Desktop    │              │
│  │   (Web3)     │  │    (dApp)    │  │    App       │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
└─────────┼──────────────────┼──────────────────┼────────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│                     PRESENTATION LAYER                                │
│                    Next.js 14 + thirdweb SDK v5                      │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Components                                                   │    │
│  │  • ConnectButton (thirdweb)                                 │    │
│  │  • MarketCard                                               │    │
│  │  • BetModal                                                 │    │
│  │  • TransactionStatus                                        │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ Pages (App Router)                                          │    │
│  │  • Home (/)                     - Market list               │    │
│  │  • Market Detail (/markets/[id]) - Betting interface        │    │
│  │  • Create (/create)             - Market creation           │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ State Management                                            │    │
│  │  • useReadContract (read blockchain)                        │    │
│  │  • useSendTransaction (write blockchain)                    │    │
│  │  • useActiveAccount (wallet state)                          │    │
│  └─────────────────────────────────────────────────────────────┘    │
└────────────────────────────┬──────────────────────────────────────────┘
                             │ JSON-RPC / Web3 Calls
┌────────────────────────────▼──────────────────────────────────────────┐
│                      BLOCKCHAIN LAYER                                 │
│                    Polygon Amoy (Testnet)                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ AIPredictionMarket.sol                                      │    │
│  │                                                             │    │
│  │ State:                                                      │    │
│  │  • mapping(uint256 => Market) markets                      │    │
│  │  • uint256 platformFeePercent = 3                          │    │
│  │  • address creResolver                                      │    │
│  │                                                             │    │
│  │ Functions:                                                  │    │
│  │  • createMarket() payable                                  │    │
│  │  • placeBet(marketId, outcome, amount)                     │    │
│  │  • closeMarket(marketId)                                   │    │
│  │  • resolveMarket(marketId, outcome) onlyCRE               │    │
│  │  • claimWinnings(marketId)                                 │    │
│  │                                                             │    │
│  │ Events:                                                     │    │
│  │  • MarketCreated(...)                                      │    │
│  │  • MarketClosed(marketId, timestamp) ← CRE listens        │    │
│  │  • MarketResolved(marketId, outcome)                       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ TestToken.sol (ERC-20)                                      │    │
│  │  • Standard ERC-20 interface                               │    │
│  │  • faucet() - Get test tokens                              │    │
│  │  • approve() - Approve market contract                      │    │
│  └─────────────────────────────────────────────────────────────┘    │
└────────────────────────────┬──────────────────────────────────────────┘
                             │ Event: MarketClosed
┌────────────────────────────▼──────────────────────────────────────────┐
│                  CHAINLINK RUNTIME ENVIRONMENT                        │
│                    CRE Workflow (TypeScript)                         │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ TRIGGER                                                     │    │
│  │  • EVM Event Trigger                                       │    │
│  │  • Listens: MarketClosed(uint256 marketId, uint256 ts)    │    │
│  │  • Confirmations: 2 blocks                                 │    │
│  └────────────────────────┬────────────────────────────────────┘    │
│                           │                                          │
│  ┌────────────────────────▼────────────────────────────────────┐    │
│  │ CALLBACK FUNCTION: onMarketClosed()                        │    │
│  │                                                             │    │
│  │ Step 1: Read Market Data                                   │    │
│  │  • EVMClient.callContract()                                │    │
│  │  • Get: question, outcomes, resolutionTime                 │    │
│  │                                                             │    │
│  │ Step 2: Parse Market Type                                  │    │
│  │  • Detect: crypto, sports, or general                      │    │
│  │                                                             │    │
│  │ Step 3: Fetch External Data (NodeRuntime)                  │    │
│  │  ├─ Crypto: CoinGecko API                                 │    │
│  │  ├─ Sports: Sports API                                     │    │
│  │  └─ General: Web scraping / RSS                           │    │
│  │                                                             │    │
│  │ Step 4: AI Resolution (NodeRuntime)                        │    │
│  │  • HTTPClient.post() to OpenAI                            │    │
│  │  • GPT-4 analyzes data                                     │    │
│  │  • Returns: winning outcome index                          │    │
│  │                                                             │    │
│  │ Step 5: Write On-Chain (Runtime)                          │    │
│  │  • EVMClient.writeContract()                              │    │
│  │  • Calls: resolveMarket(marketId, outcome)                │    │
│  │  • BFT consensus across DON                               │    │
│  └─────────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL SERVICES                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  CoinGecko   │  │  Sports APIs │  │  OpenAI GPT-4│              │
│  │     API      │  │              │  │      API     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└───────────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Smart Contracts

#### AIPredictionMarket.sol

**Purpose**: Core prediction market logic

**Key Data Structures**:
```solidity
struct Market {
    uint256 id;
    address creator;
    string question;
    string[] outcomes;
    uint256 resolutionTime;
    uint256 createdAt;
    MarketStatus status;
    uint256 winningOutcome;
    uint256 totalPool;
    mapping(uint256 => uint256) outcomePool;
    mapping(address => mapping(uint256 => uint256)) userBets;
    mapping(address => bool) hasClaimed;
    uint256 platformLiquidity;
}

enum MarketStatus {
    Active,
    Closed,
    Resolved,
    Cancelled
}
```

**Access Control**:
- `onlyOwner`: Platform admin functions
- `onlyCREResolver`: Only CRE can resolve markets

**State Transitions**:
```
Active → Closed → Resolved
   ↓
Cancelled
```

**Revenue Model**:
1. Market creation fee: 0.01 MATIC → treasury
2. Platform fee: 3% of winnings → treasury

#### TestToken.sol

**Purpose**: ERC-20 token for betting (testnet only)

**Features**:
- Standard ERC-20 interface
- Faucet function for easy testing
- No transfer restrictions

### 2. Chainlink CRE Workflow

#### Trigger Configuration

```typescript
const marketClosedTrigger = cre.triggers.evm.createEventTrigger({
  chainSelector: "16281711391670634445", // Polygon Amoy
  contractAddress: config.predictionMarketAddress,
  eventSignature: "MarketClosed(uint256,uint256)",
  confirmations: 2, // Wait 2 blocks for finality
});
```

#### Runtime Modes

**Runtime (BFT)**:
- Used for blockchain writes
- Consensus required
- Cryptographically signed
- Example: `evmClient.writeContract(runtime, ...)`

**NodeRuntime (Non-BFT)**:
- Used for API calls
- No consensus (each node executes)
- Aggregated by DON
- Example: `httpClient.get(nodeRuntime, ...)`

#### Market Type Detection

```typescript
function parseMarketType(question: string) {
  // Crypto: "Will Bitcoin reach $100k?"
  if (question.match(/bitcoin|ethereum|crypto/i)) {
    return { type: "crypto", params: {...} };
  }
  
  // Sports: "Who will win the Super Bowl?"
  if (question.match(/win|game|match/i)) {
    return { type: "sports", params: {...} };
  }
  
  // General: Everything else
  return { type: "general", params: {...} };
}
```

#### AI Resolution Logic

```typescript
async function resolveWithAI(runtime, question, outcomes, contextData) {
  const systemPrompt = `You are a fact-checking system...`;
  
  const userPrompt = `
    Question: ${question}
    Outcomes: ${outcomes}
    Data: ${JSON.stringify(contextData)}
  `;
  
  const response = await httpClient.post(runtime, {
    url: "https://api.openai.com/v1/chat/completions",
    body: JSON.stringify({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  }).result();
  
  return JSON.parse(response.body).choices[0].message.content.outcome;
}
```

### 3. Frontend (Next.js + thirdweb)

#### thirdweb SDK v5 Integration

**Client Setup**:
```typescript
import { createThirdwebClient } from "thirdweb";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});
```

**Wallet Connection**:
```typescript
import { ConnectButton } from "thirdweb/react";
import { createWallet, inAppWallet } from "thirdweb/wallets";

const wallets = [
  inAppWallet(),               // Email/social login
  createWallet("io.metamask"), // MetaMask
  createWallet("com.coinbase.wallet"), // Coinbase
];

<ConnectButton 
  client={client} 
  wallets={wallets}
  chain={polygonAmoy}
  theme="dark"
/>
```

**Reading Contract Data**:
```typescript
const { data, isLoading } = useReadContract({
  contract: getPredictionMarketContract(),
  method: "function getMarket(uint256) view returns (...)",
  params: [marketId],
});
```

**Sending Transactions**:
```typescript
const { mutate: sendTransaction, isPending } = useSendTransaction();

const transaction = prepareContractCall({
  contract: getTestTokenContract(),
  method: "function approve(address, uint256) returns (bool)",
  params: [PREDICTION_MARKET_ADDRESS, amount],
});

sendTransaction(transaction, {
  onSuccess: () => console.log("Success!"),
  onError: (error) => console.error(error),
});
```

## Data Flow Diagrams

### Market Creation Flow

```
User                Frontend              Smart Contract
 │                     │                        │
 │  Click "Create"     │                        │
 ├────────────────────>│                        │
 │                     │                        │
 │  Enter details      │                        │
 ├────────────────────>│                        │
 │                     │                        │
 │  Confirm TX         │  createMarket()        │
 ├────────────────────>├───────────────────────>│
 │                     │                        │
 │                     │  Pay 0.01 MATIC        │
 │                     │  + optional liquidity  │
 │                     │                        │
 │                     │<───────────────────────┤
 │                     │  Event: MarketCreated  │
 │                     │                        │
 │  Redirect to market │                        │
 │<────────────────────┤                        │
```

### Betting Flow

```
User          Frontend        TestToken       PredictionMarket
 │               │                │                  │
 │  Click "Bet"  │                │                  │
 ├──────────────>│                │                  │
 │               │                │                  │
 │  Enter amount │                │                  │
 ├──────────────>│                │                  │
 │               │                │                  │
 │               │  approve()     │                  │
 │               ├───────────────>│                  │
 │               │                │                  │
 │  Approve TX   │<───────────────┤                  │
 ├──────────────>│  Approved      │                  │
 │               │                │                  │
 │               │  placeBet()    │                  │
 │               ├────────────────┼─────────────────>│
 │               │                │                  │
 │               │                │  transferFrom()  │
 │               │                │<─────────────────┤
 │               │                │                  │
 │               │<───────────────┴──────────────────┤
 │               │          Event: BetPlaced         │
 │  Success!     │                                   │
 │<──────────────┤                                   │
```

### Resolution Flow

```
Time Passes   Frontend   Contract     CRE Workflow    OpenAI    Contract
    │            │           │              │            │          │
    │            │           │              │            │          │
    │  closeMarket()         │              │            │          │
    ├───────────────────────>│              │            │          │
    │            │           │              │            │          │
    │            │           │  MarketClosed│            │          │
    │            │           │  event       │            │          │
    │            │           ├─────────────>│            │          │
    │            │           │              │            │          │
    │            │           │              │  getMarket()          │
    │            │           │<─────────────┤            │          │
    │            │           │  market data │            │          │
    │            │           ├─────────────>│            │          │
    │            │           │              │            │          │
    │            │           │              │  Fetch data│          │
    │            │           │              │  (CoinGecko│          │
    │            │           │              │  etc.)     │          │
    │            │           │              │            │          │
    │            │           │              │  AI call   │          │
    │            │           │              ├───────────>│          │
    │            │           │              │            │          │
    │            │           │              │ "Outcome 1"│          │
    │            │           │              │<───────────┤          │
    │            │           │              │            │          │
    │            │           │              │  resolveMarket()      │
    │            │           │              ├──────────────────────>│
    │            │           │              │            │          │
    │            │           │  MarketResolved           │          │
    │            │           │<──────────────────────────┴──────────┤
    │            │           │                                      │
    │  Refresh   │  Read updated state                             │
    ├───────────>│<─────────┤                                      │
    │            │           │                                      │
```

## Security Architecture

### Smart Contract Security

1. **Access Control**:
   - OpenZeppelin `Ownable` for admin functions
   - Custom `onlyCREResolver` modifier for resolution
   - No arbitrary external calls

2. **Reentrancy Protection**:
   - OpenZeppelin `ReentrancyGuard`
   - Checks-Effects-Interactions pattern

3. **Input Validation**:
   - Require statements on all inputs
   - Range checks on indices
   - Address validation

4. **State Machine**:
   - Strict state transitions
   - No skipping states
   - Cancellation only for unresolved markets

### CRE Workflow Security

1. **Cryptographic Signing**:
   - All on-chain writes are signed by CRE
   - Private key stored securely
   - Multi-node consensus

2. **Byzantine Fault Tolerance**:
   - DON consensus on external data
   - Majority vote on AI responses
   - Outlier detection

3. **API Security**:
   - API keys in secure configuration
   - Rate limiting handled by CRE
   - Timeout protection

### Frontend Security

1. **Wallet Security**:
   - No private keys stored
   - All transactions user-signed
   - thirdweb secure wallet connection

2. **Input Sanitization**:
   - Client-side validation
   - Server-side validation (contract)
   - XSS protection (Next.js default)

3. **Environment Variables**:
   - Sensitive data in `.env.local`
   - Never committed to git
   - Separate dev/prod configs

## Performance Optimizations

### Smart Contract

1. **Gas Optimization**:
   - Packed structs where possible
   - Minimal storage writes
   - Batch operations when feasible

2. **Event Indexing**:
   - Indexed event parameters for filtering
   - Off-chain data in events when appropriate

### CRE Workflow

1. **Caching**:
   - Cache API responses when possible
   - Reuse blockchain reads

2. **Batching**:
   - Process multiple markets if needed
   - Batch API calls

### Frontend

1. **Code Splitting**:
   - Next.js automatic code splitting
   - Dynamic imports for heavy components

2. **Data Fetching**:
   - SWR for caching and revalidation
   - Optimistic updates

3. **Rendering**:
   - Server-side rendering for SEO
   - Client-side rendering for interactivity

## Scalability Considerations

### Current Design (MVP)

- Handles ~100 concurrent markets
- Single CRE workflow instance
- Polygon Amoy testnet

### Future Enhancements

1. **Multi-Chain Support**:
   - Deploy to multiple chains
   - Single CRE workflow handles all
   - Cross-chain liquidity pools

2. **Horizontal Scaling**:
   - Multiple CRE workflows for different market types
   - Load balancing across DONs
   - Sharded contract architecture

3. **Performance Improvements**:
   - Layer 2 integration (Optimism, Arbitrum)
   - Batch settlement
   - Off-chain order books

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | Next.js | 14.2 | React framework |
| Frontend | thirdweb SDK | v5 | Web3 integration |
| Frontend | Tailwind CSS | 3.4 | Styling |
| Frontend | TypeScript | 5.0 | Type safety |
| Smart Contracts | Solidity | 0.8.20 | Contract language |
| Smart Contracts | OpenZeppelin | Latest | Security libraries |
| Blockchain | Polygon Amoy | Testnet | EVM network |
| Orchestration | Chainlink CRE | Latest | Off-chain workflows |
| Orchestration | TypeScript | 5.0 | Workflow language |
| AI | OpenAI GPT-4 | Latest | Market resolution |
| Deployment | thirdweb | Latest | Contract deployment |
| Deployment | Vercel | Latest | Frontend hosting |

## Future Architecture Improvements

1. **Decentralized Storage**:
   - IPFS for market metadata
   - Arweave for permanent records

2. **Oracle Redundancy**:
   - Multiple data sources
   - Consensus mechanisms
   - Fallback providers

3. **Governance**:
   - DAO for platform decisions
   - Token-based voting
   - Treasury management

4. **Advanced Features**:
   - Liquidity pools
   - Market makers
   - Derivatives markets
