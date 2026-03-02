# AI Prediction Market

A decentralized prediction market platform powered by **Chainlink Runtime Environment (CRE)** for AI-based market resolution and **thirdweb** for seamless Web3 integration.

![Project Banner](https://via.placeholder.com/1200x300/667eea/ffffff?text=AI+Prediction+Market)

## 🎯 Overview

This project demonstrates a production-ready decentralized prediction market where:
- **Users** create and participate in prediction markets about real-world events
- **Markets** are resolved automatically using Chainlink CRE workflows that integrate external data and AI
- **Smart contracts** are deployed and managed via thirdweb
- **AI** (OpenAI GPT-4) determines outcomes based on real-world data
- **Chainlink CRE** orchestrates the entire resolution process with cryptographic verification

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│                    thirdweb SDK v5 + React                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Market List  │  │Market Detail │  │Create Market │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────────────────────┬────────────────────────────────────────┘
                         │ Web3 Calls (thirdweb SDK)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              Smart Contracts (Polygon Amoy)                      │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              AIPredictionMarket.sol                       │   │
│  │  • createMarket()  • placeBet()  • closeMarket()        │   │
│  │  • resolveMarket() • claimWinnings()                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                 TestToken.sol (ERC-20)                   │   │
│  │  • approve()  • balanceOf()  • faucet()                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────┬────────────────────────────────────────────────────┘
             │ Emits: MarketClosed(marketId)
             ▼
┌─────────────────────────────────────────────────────────────────┐
│            Chainlink Runtime Environment (CRE)                   │
│                  TypeScript Workflow                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ 1. EVM Event Trigger (MarketClosed)                      │   │
│  │ 2. Read Market Data from Contract                        │   │
│  │ 3. Fetch External Data:                                  │   │
│  │    • CoinGecko (crypto prices)                           │   │
│  │    • Sports APIs (game results)                          │   │
│  │    • General web data                                    │   │
│  │ 4. AI Resolution (OpenAI GPT-4)                          │   │
│  │ 5. Write Result On-Chain: resolveMarket(id, outcome)    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## ✨ Key Features

### Smart Contract Features
- ✅ **Create Markets**: Anyone can create prediction markets with custom questions and outcomes
- ✅ **Place Bets**: Users bet using ERC-20 tokens with locked funds
- ✅ **Auto-Close**: Markets automatically close at resolution time
- ✅ **AI Resolution**: Only CRE workflow can resolve markets (trustless)
- ✅ **Claim Winnings**: Winners withdraw their payouts after resolution
- ✅ **Platform Fee**: 3% fee on winnings to treasury wallet
- ✅ **Hybrid Liquidity**: Platform seeds markets with initial liquidity

### CRE Workflow Features
- ✅ **Event Listening**: Monitors blockchain for `MarketClosed` events
- ✅ **Multi-Source Data**: Fetches from CoinGecko, Sports APIs, and more
- ✅ **AI Integration**: Uses OpenAI GPT-4 for outcome determination
- ✅ **Cryptographic Signing**: CRE signs results before writing on-chain
- ✅ **Byzantine Fault Tolerance**: Consensus across Chainlink DON nodes

### Frontend Features (thirdweb SDK v5)
- ✅ **Wallet Connection**: 350+ wallets via `ConnectButton`
- ✅ **Market List**: Browse all active markets
- ✅ **Market Details**: View odds, place bets, track positions
- ✅ **Transaction UI**: Real-time pending/success/failed states
- ✅ **Responsive Design**: Mobile-first Tailwind CSS

## 📦 Project Structure

```
ai-prediction-market/
├── frontend/                      # Next.js frontend
│   ├── app/
│   │   ├── page.tsx              # Home page (market list)
│   │   ├── markets/[id]/         # Market detail page
│   │   ├── create/               # Create market page
│   │   ├── layout.tsx            # Root layout with ThirdwebProvider
│   │   └── globals.css           # Tailwind CSS
│   ├── components/
│   │   ├── MarketCard.tsx        # Market card component
│   │   └── BetModal.tsx          # Betting modal
│   ├── lib/
│   │   ├── thirdwebClient.ts     # thirdweb client config
│   │   └── contract.ts           # Contract instances & ABIs
│   └── package.json
│
├── contracts/                     # Solidity smart contracts
│   ├── AIPredictionMarket.sol    # Main prediction market contract
│   └── TestToken.sol             # ERC-20 test token
│
├── cre-workflow/                  # Chainlink CRE workflow
│   ├── main.ts                   # Main workflow logic
│   ├── config.production.json    # Production configuration
│   ├── package.json
│   └── README.md
│
└── README.md                      # This file
```

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v18+) and **npm**
2. **Bun** (v1.2.21+) - for CRE workflow
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```
3. **CRE CLI**
   - Sign up at https://cre.chain.link
   - Download CLI from dashboard
4. **Wallet** with testnet tokens
   - **Celo Alfajores** (recommended): Get from https://faucet.celo.org
   - **Polygon Amoy** (alternative): Get from https://faucet.polygon.technology/

### Supported Networks

This project supports deployment to multiple EVM chains:

- ✅ **Celo Alfajores** (Recommended)
  - Ultra-low fees (~$0.001 per tx)
  - Mobile-optimized
  - Carbon neutral
  - Built-in stablecoins
  - See: **CELO_DEPLOYMENT.md**

- ✅ **Polygon Amoy** (Alternative)
  - Well-tested testnet
  - Wide tooling support
  - See: **INTEGRATION_GUIDE.md**

Both networks work identically - choose based on your preference!

### Step 1: Deploy Smart Contracts

**Choose Your Network**: Celo Alfajores (recommended) or Polygon Amoy

#### Celo Alfajores (Recommended - Lower Fees)

See **CELO_DEPLOYMENT.md** for complete guide. Quick steps:

1. Add Celo Alfajores to MetaMask (Chain ID: 44787)
2. Get test CELO from https://faucet.celo.org
3. Deploy via thirdweb dashboard:
   - Network: Celo Alfajores Testnet
   - Contracts: TestToken.sol, AIPredictionMarket.sol
4. Save contract addresses

#### Polygon Amoy (Alternative)

#### Option A: Deploy via thirdweb Dashboard (Recommended)

1. Go to https://thirdweb.com/dashboard
2. Click "Deploy Contract"
3. Upload `contracts/AIPredictionMarket.sol` and `contracts/TestToken.sol`
4. Select **Polygon Amoy Testnet** (Chain ID: 80002)
5. Fill in constructor parameters:
   - **AIPredictionMarket**:
     - `_bettingToken`: [TestToken address from step 3]
     - `_treasury`: [Your wallet address]
     - `_creResolver`: [Temporary address, update later with CRE wallet]
   - **TestToken**: (no parameters)
6. Deploy and save contract addresses

#### Option B: Deploy via thirdweb SDK

```bash
# Install thirdweb CLI
npm install -g thirdweb

# Deploy contract
npx thirdweb deploy

# Follow the prompts to deploy to Polygon Amoy
```

#### Get Your Deployed Addresses

After deployment, you'll have:
- `PREDICTION_MARKET_ADDRESS`: 0x...
- `TEST_TOKEN_ADDRESS`: 0x...

### Step 2: Configure CRE Workflow

```bash
cd cre-workflow
bun install
```

Edit `config.production.json`:

```json
{
  "predictionMarketAddress": "0x...",  // Your AIPredictionMarket address
  "chainSelector": "16281711391670634445",  // Polygon Amoy
  "openaiApiKey": "sk-...",  // Get from https://platform.openai.com/
  "coingeckoApiKey": "CG-...",  // Optional: https://www.coingecko.com/en/api
  "sportsApiKey": "...",  // Optional
  "crePrivateKey": "0x...",  // Private key for CRE resolver
  "rpcUrl": "https://rpc-amoy.polygon.technology"
}
```

**Security Note**: Never commit this file! Add to `.gitignore`.

### Step 3: Test CRE Workflow Locally

```bash
cd cre-workflow

# Simulate workflow (reads real blockchain, makes real API calls, no transactions)
bun run simulate

# Or use CRE CLI directly
cre workflow simulate --config config.production.json
```

Expected output:
```
✅ CRE workflow initialized
📡 Listening for MarketClosed events...
🔍 No events yet (create and close a market to test)
```

### Step 4: Setup Frontend

```bash
cd frontend
npm install
```

Create `.env.local`:

```bash
# Get client ID from https://thirdweb.com/dashboard/settings/api-keys
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here

# Contract addresses from Step 1
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x...
NEXT_PUBLIC_TEST_TOKEN_ADDRESS=0x...
```

### Step 5: Run Frontend

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000

### Step 6: Test the Full Flow

1. **Connect Wallet** (MetaMask or any supported wallet)
2. **Get Test Tokens**:
   - Call `faucet()` on TestToken contract
   - Or use thirdweb dashboard
3. **Create a Market**:
   - Click "Create Market"
   - Question: "Will Bitcoin exceed $100,000 by Dec 31, 2024?"
   - Outcomes: ["YES", "NO"]
   - Resolution time: [Future timestamp]
   - Pay 0.01 MATIC creation fee
4. **Place Bets**:
   - Navigate to market detail page
   - Approve TestToken spending
   - Place bet on outcome
5. **Close Market**:
   - Wait for resolution time
   - Call `closeMarket()` (can be done via frontend or contract)
6. **CRE Resolution**:
   - CRE workflow detects `MarketClosed` event
   - Fetches BTC price from CoinGecko
   - AI determines outcome
   - Calls `resolveMarket()` on-chain
7. **Claim Winnings**:
   - If you bet on winning outcome, click "Claim Winnings"

## 🔧 Configuration

### thirdweb Configuration

The project uses **thirdweb SDK v5** (latest as of 2025):

```typescript
// lib/thirdwebClient.ts
import { createThirdwebClient } from "thirdweb";

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
});
```

Key thirdweb features used:
- `ConnectButton` - Wallet connection UI
- `useReadContract` - Read blockchain data
- `useSendTransaction` - Execute transactions
- `prepareContractCall` - Prepare contract calls
- `getContract` - Get contract instances

### Chainlink CRE Configuration

The CRE workflow uses:
- **SDK**: `@chainlink/cre-sdk` (TypeScript)
- **Trigger**: EVM event trigger for `MarketClosed`
- **Capabilities**:
  - `HTTPClient` - External API calls
  - `EVMClient` - Read/write blockchain
- **Runtime Modes**:
  - `Runtime` - BFT operations (blockchain writes)
  - `NodeRuntime` - Non-BFT operations (API calls)

## 💰 Revenue Model

The platform generates revenue through:

1. **Market Creation Fee**: 0.01 MATIC per market
   - Prevents spam
   - Sent to treasury wallet

2. **Platform Fee**: 3% of winnings
   - Deducted when users claim
   - Distributed: 97% to winner, 3% to treasury

Example:
```
Total Pool: 1000 TPT
Winning Pool: 300 TPT
User Bet: 100 TPT

Gross Payout = (100/300) * 1000 = 333.33 TPT
Platform Fee (3%) = 10 TPT
Net Payout = 323.33 TPT
```

## 🌊 Liquidity Model

**Current Implementation** (Hackathon Demo):
- **Shared Liquidity Pool** seeded by platform
- Creator can optionally add initial liquidity
- Ensures markets are tradeable immediately

**Future Design** (Production):
- Independent liquidity providers can stake tokens
- LPs earn % of platform fees
- Automated market maker (AMM) mechanics

## 📚 API Reference

### Smart Contract Functions

**createMarket()**
```solidity
function createMarket(
    string memory question,
    string[] memory outcomes,
    uint256 resolutionTime,
    uint256 initialLiquidity
) external payable returns (uint256 marketId)
```

**placeBet()**
```solidity
function placeBet(
    uint256 marketId,
    uint256 outcomeIndex,
    uint256 amount
) external
```

**resolveMarket()** (CRE only)
```solidity
function resolveMarket(
    uint256 marketId,
    uint256 winningOutcome
) external onlyCREResolver
```

**claimWinnings()**
```solidity
function claimWinnings(uint256 marketId) external
```

### Frontend Hooks (thirdweb)

```typescript
// Read contract data
const { data } = useReadContract({
  contract,
  method: "function getMarket(uint256) view returns (...)",
  params: [marketId],
});

// Send transaction
const { mutate: sendTransaction } = useSendTransaction();

sendTransaction(prepareContractCall({
  contract,
  method: "function placeBet(uint256, uint256, uint256)",
  params: [marketId, outcomeIndex, amount],
}));
```

## 🎥 Demo Video Script

**Duration: 3-5 minutes**

1. **Intro (30s)**
   - Show homepage
   - Explain concept: "AI-powered prediction markets"
   - Mention Chainlink CRE + thirdweb integration

2. **Connect Wallet (20s)**
   - Click "Connect Wallet"
   - Show thirdweb ConnectButton UI
   - Connect with MetaMask

3. **Get Test Tokens (20s)**
   - Navigate to TestToken contract
   - Call `faucet()` function
   - Show balance update

4. **Create Market (45s)**
   - Click "Create Market"
   - Enter question: "Will ETH reach $5000?"
   - Add outcomes: YES, NO
   - Set resolution time
   - Pay creation fee
   - Show transaction confirmation

5. **Place Bet (45s)**
   - View market detail page
   - Show current odds
   - Click "Place Bet" on YES
   - Approve tokens
   - Confirm bet transaction
   - Show updated position

6. **Market Close & CRE Resolution (60s)**
   - Fast-forward or explain
   - Show `closeMarket()` call
   - **CRE Workflow Demo**:
     - Open terminal with CRE simulator
     - Show event detection
     - Show API call to CoinGecko
     - Show AI resolution prompt
     - Show on-chain transaction
   - Market shows "Resolved" status

7. **Claim Winnings (20s)**
   - Click "Claim Winnings"
   - Show transaction
   - Display final balance

8. **Architecture Recap (20s)**
   - Show architecture diagram
   - Explain: Frontend → Contracts → CRE → AI
   - Highlight Chainlink & thirdweb logos

## 🔐 Security Considerations

1. **Smart Contract**:
   - OpenZeppelin libraries for battle-tested code
   - ReentrancyGuard on financial functions
   - Access control for critical functions
   - **Not audited** - demo purposes only

2. **CRE Workflow**:
   - Only authorized CRE resolver can call `resolveMarket()`
   - Byzantine Fault Tolerance via Chainlink DON
   - Cryptographic signatures on all operations

3. **Frontend**:
   - No private keys stored
   - All transactions signed by user wallet
   - thirdweb secure wallet connection

4. **Best Practices**:
   - Use environment variables for sensitive data
   - Never commit API keys or private keys
   - Test on testnet before mainnet

## 🧪 Testing

### Contract Testing

```bash
# Install Hardhat or Foundry
npm install --save-dev hardhat

# Run tests
npx hardhat test
```

### CRE Workflow Testing

```bash
cd cre-workflow

# Local simulation (real API calls, no transactions)
bun run simulate

# Build WASM
bun run build
```

### Frontend Testing

```bash
cd frontend

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📝 Files Using Chainlink

All files that integrate with Chainlink CRE:

1. **`cre-workflow/main.ts`** - Main workflow logic
2. **`cre-workflow/package.json`** - CRE SDK dependency
3. **`cre-workflow/config.production.json`** - CRE configuration
4. **`contracts/AIPredictionMarket.sol`** - Receives CRE callbacks

## 🚀 Deployment

### Deploy to Production

1. **Deploy Contracts to Polygon Mainnet**:
   ```bash
   # Use thirdweb dashboard or CLI
   npx thirdweb deploy --network polygon
   ```

2. **Deploy CRE Workflow**:
   ```bash
   cd cre-workflow
   bun run build
   bun run deploy
   ```

3. **Deploy Frontend** (Vercel):
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Update Contract with CRE Address**:
   - Call `setCREResolver()` on contract with production CRE wallet

## 🏆 Hackathon Submission Checklist

- ✅ Smart contracts deployed on Polygon Amoy
- ✅ CRE workflow functional and tested
- ✅ Frontend deployed and accessible
- ✅ Demo video recorded (3-5 min)
- ✅ README with complete documentation
- ✅ Architecture diagram included
- ✅ All Chainlink integration points documented
- ✅ thirdweb integration demonstrated
- ✅ GitHub repository public

## 🤝 Contributing

This is a hackathon submission, but contributions are welcome!

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Chainlink** - For CRE platform and oracle infrastructure
- **thirdweb** - For seamless Web3 SDK
- **OpenAI** - For GPT-4 API
- **Polygon** - For Amoy testnet

## 📞 Support

- **Issues**: [GitHub Issues](YOUR_REPO_URL/issues)
- **Chainlink**: https://discord.gg/chainlink
- **thirdweb**: https://discord.gg/thirdweb

---

**Built with ❤️ for Chainlink Hackathon 2025**
