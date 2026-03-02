# AI Prediction Market - Quick Start Guide

## 🎯 What Is This?

A **complete, hackathon-ready** decentralized prediction market where:
- Users create & bet on real-world events
- **AI (GPT-4)** automatically determines winners
- **Chainlink CRE** orchestrates everything off-chain
- **thirdweb SDK v5** powers the frontend

## 📁 Project Structure

```
ai-prediction-market/
├── contracts/              # Solidity smart contracts
│   ├── AIPredictionMarket.sol    # Main market contract
│   └── TestToken.sol             # ERC-20 for betting
│
├── cre-workflow/           # Chainlink CRE workflow
│   ├── main.ts                   # TypeScript workflow
│   ├── config.production.json    # Configuration
│   └── README.md                 # CRE documentation
│
├── frontend/               # Next.js + thirdweb frontend
│   ├── app/                      # Pages
│   ├── components/               # React components
│   ├── lib/                      # thirdweb config
│   └── package.json
│
├── README.md               # Main documentation
├── DEPLOYMENT.md           # Deployment guide
├── ARCHITECTURE.md         # Architecture details
└── .gitignore
```

## ⚡ 5-Minute Setup (Local Testing)

### 1. Prerequisites
```bash
# Install Node.js 18+
node --version

# Install Bun (for CRE)
curl -fsSL https://bun.sh/install | bash

# Install CRE CLI
# Sign up at https://cre.chain.link and download CLI
```

### 2. Deploy Contracts (thirdweb Dashboard)
1. Go to https://thirdweb.com/dashboard
2. Click "Deploy Contract"
3. Upload `contracts/TestToken.sol` → Deploy to **Polygon Amoy**
4. Upload `contracts/AIPredictionMarket.sol` → Deploy to **Polygon Amoy**
   - Constructor params:
     - `_bettingToken`: [TestToken address]
     - `_treasury`: [Your wallet]
     - `_creResolver`: [Temp address, update later]
5. Save both contract addresses

### 3. Setup Frontend
```bash
cd frontend
npm install

# Create .env.local
cat > .env.local << EOF
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x...
NEXT_PUBLIC_TEST_TOKEN_ADDRESS=0x...
EOF

npm run dev
```

Visit http://localhost:3000

### 4. Setup CRE Workflow
```bash
cd cre-workflow
bun install

# Edit config.production.json
# Add: contract address, OpenAI key, CRE private key

# Test locally
bun run simulate
```

## 🎮 Test the Full Flow

1. **Get Test Tokens**
   - Connect wallet on frontend
   - Call `faucet()` on TestToken contract
   - Receive 1000 TPT

2. **Create Market**
   - Click "Create Market"
   - Question: "Will Bitcoin exceed $100,000?"
   - Outcomes: YES, NO
   - Resolution time: 5 minutes from now
   - Pay 0.01 MATIC fee

3. **Place Bet**
   - Navigate to market detail
   - Click "Place Bet" on YES
   - Approve TPT spending
   - Bet 100 TPT

4. **Wait for Resolution**
   - After 5 minutes, call `closeMarket()`
   - CRE workflow activates:
     - Detects `MarketClosed` event
     - Fetches BTC price from CoinGecko
     - Asks GPT-4 to determine outcome
     - Calls `resolveMarket()` on-chain

5. **Claim Winnings**
   - If you won, click "Claim Winnings"
   - Receive payout (minus 3% fee)

## 🔑 Key Technologies

### Chainlink CRE
- **What**: Orchestration layer for institutional smart contracts
- **Why**: Trustless off-chain computation with on-chain verification
- **How We Use It**:
  - Listen for `MarketClosed` events
  - Fetch external data (CoinGecko, APIs)
  - Call AI for decision-making
  - Write results back on-chain
- **Files**: `cre-workflow/main.ts`

### thirdweb SDK v5
- **What**: All-in-one Web3 development platform
- **Why**: Fast deployment, easy wallet integration, great DX
- **How We Use It**:
  - `ConnectButton` for wallet connection
  - `useReadContract` for reading blockchain
  - `useSendTransaction` for transactions
  - Contract deployment via dashboard
- **Files**: `frontend/lib/*`, `frontend/app/*`

### Smart Contracts
- **AIPredictionMarket.sol**: Core logic
  - Create markets
  - Place bets
  - Resolve via CRE only
  - Claim winnings
- **TestToken.sol**: ERC-20 for betting

## 💡 Key Features Implemented

✅ **Market Creation** with optional platform liquidity
✅ **Betting System** with ERC-20 tokens
✅ **AI Resolution** via GPT-4
✅ **CRE Integration** for trustless orchestration
✅ **Revenue Model** (3% platform fee + creation fee)
✅ **thirdweb SDK v5** for modern Web3 UX
✅ **Responsive UI** with Tailwind CSS
✅ **Multi-outcome markets** (not just binary)
✅ **Real-time odds** calculation
✅ **Transaction status** UI

## 📊 Architecture Overview

```
Frontend (Next.js + thirdweb)
    ↓ Web3 calls
Smart Contracts (Polygon Amoy)
    ↓ Event: MarketClosed
CRE Workflow (TypeScript)
    ↓ Fetch data
External APIs (CoinGecko, etc.)
    ↓ Send to
OpenAI GPT-4
    ↓ Determine outcome
CRE writes result on-chain
```

## 📚 Documentation

- **README.md** - Main documentation, features, setup
- **DEPLOYMENT.md** - Step-by-step deployment guide
- **ARCHITECTURE.md** - Technical architecture details
- **cre-workflow/README.md** - CRE workflow documentation

## 🎥 Demo Video Outline (3-5 min)

1. **Intro** (30s) - Explain concept
2. **Connect Wallet** (20s) - Show thirdweb UI
3. **Get Tokens** (20s) - Faucet demo
4. **Create Market** (45s) - Full market creation
5. **Place Bet** (45s) - Approval + betting
6. **CRE Resolution** (60s) - Show workflow logs
7. **Claim Winnings** (20s) - Final payout
8. **Architecture** (20s) - Diagram recap

## 🚀 Production Deployment

See **DEPLOYMENT.md** for complete guide.

Quick checklist:
1. Deploy contracts to Polygon Mainnet
2. Update CRE config for mainnet
3. Deploy CRE workflow
4. Deploy frontend to Vercel
5. Test end-to-end
6. Monitor and maintain

## 💰 Revenue Model

1. **Market Creation Fee**: 0.01 MATIC per market
2. **Platform Fee**: 3% of winnings

Example calculation:
```
Total Pool: 1000 TPT
Your Bet: 100 TPT (on winning side of 300 TPT)
Gross Payout: (100/300) × 1000 = 333.33 TPT
Platform Fee (3%): 10 TPT
Net Payout: 323.33 TPT
```

## 🌊 Liquidity Model

**Current** (Hackathon):
- Platform seeds markets with initial liquidity
- Ensures markets are always tradeable

**Future** (Production):
- Independent LPs can provide liquidity
- LPs earn % of platform fees
- AMM-style pricing

## 🔐 Security Notes

⚠️ **This is a demo/hackathon project**
- Not audited
- Use testnet only
- Don't use with real funds

For production:
- Get professional audit
- Use multi-sig for admin functions
- Implement pausability
- Add monitoring and alerts

## 🤝 Hackathon Judging Criteria

### Chainlink Integration ✅
- CRE workflow for market resolution
- Event triggers
- External data fetching
- Cryptographic verification
- **Files**: `cre-workflow/main.ts`, `contracts/AIPredictionMarket.sol`

### thirdweb Integration ✅
- SDK v5 for frontend
- ConnectButton for wallets
- Contract deployment via dashboard
- useReadContract/useSendTransaction hooks
- **Files**: `frontend/lib/*`, all frontend pages

### Innovation ✅
- AI-powered market resolution
- Multi-source data aggregation
- Hybrid liquidity model
- Professional UI/UX

### Code Quality ✅
- TypeScript throughout
- Well-documented
- Clean architecture
- Security best practices

### Demo-Ready ✅
- Working on testnet
- Clear documentation
- Step-by-step guide
- Video script provided

## 📞 Support & Resources

- **Chainlink CRE Docs**: https://docs.chain.link/cre
- **thirdweb Docs**: https://portal.thirdweb.com
- **OpenAI API**: https://platform.openai.com/docs
- **Polygon Amoy**: https://faucet.polygon.technology

## 🏆 What Makes This Special

1. **First-class CRE Integration**
   - Not just using oracles
   - Full workflow orchestration
   - Multi-step resolution process

2. **Modern Web3 UX**
   - thirdweb SDK v5
   - 350+ wallet support
   - Smooth transaction flows

3. **AI-Powered**
   - GPT-4 for intelligent decisions
   - Multi-source data verification
   - Explainable outcomes

4. **Production-Ready Design**
   - Revenue model implemented
   - Liquidity architecture planned
   - Scalability considered

## ⏱️ Time Investment

- **Smart Contracts**: 4-6 hours
- **CRE Workflow**: 3-4 hours
- **Frontend**: 6-8 hours
- **Documentation**: 2-3 hours
- **Testing**: 2-3 hours

**Total**: ~20-25 hours for full implementation

## 🎯 Next Steps

1. **Test locally** - Follow 5-minute setup
2. **Review code** - Understand architecture
3. **Deploy to testnet** - Use DEPLOYMENT.md
4. **Create demo video** - Follow script
5. **Submit to hackathon** - Include all docs

## 📝 License

MIT License - Open source and free to use

---

**Built for Chainlink Hackathon 2025**
Powered by Chainlink CRE + thirdweb + OpenAI
