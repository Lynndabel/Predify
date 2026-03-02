# Deployment Guide

This guide walks you through deploying the AI Prediction Market to production.

## Prerequisites

Before deploying, ensure you have:

1. **Wallets with Funds**:
   - Polygon Amoy testnet MATIC (for contract deployment)
   - Polygon mainnet MATIC (for production)
   - Get testnet MATIC: https://faucet.polygon.technology/

2. **API Keys**:
   - thirdweb Client ID: https://thirdweb.com/dashboard
   - OpenAI API Key: https://platform.openai.com/
   - CRE Account: https://cre.chain.link

3. **Tools Installed**:
   - Node.js 18+
   - Bun 1.2.21+
   - CRE CLI

## Step 1: Deploy Smart Contracts

### Method A: thirdweb Dashboard (Easiest)

1. **Navigate to thirdweb Dashboard**:
   ```
   https://thirdweb.com/dashboard
   ```

2. **Deploy TestToken**:
   - Click "Deploy Contract"
   - Upload `contracts/TestToken.sol`
   - Select "Polygon Amoy Testnet"
   - No constructor parameters needed
   - Click "Deploy"
   - Save the deployed address: `TEST_TOKEN_ADDRESS`

3. **Deploy AIPredictionMarket**:
   - Click "Deploy Contract"
   - Upload `contracts/AIPredictionMarket.sol`
   - Select "Polygon Amoy Testnet"
   - Constructor parameters:
     - `_bettingToken`: [Paste TEST_TOKEN_ADDRESS]
     - `_treasury`: [Your wallet address for receiving fees]
     - `_creResolver`: [Temporary address - will update later]
   - Click "Deploy"
   - Save the deployed address: `PREDICTION_MARKET_ADDRESS`

### Method B: thirdweb CLI

```bash
# Install CLI
npm install -g thirdweb

# Navigate to contracts directory
cd contracts

# Deploy TestToken
npx thirdweb deploy TestToken.sol

# Deploy AIPredictionMarket
npx thirdweb deploy AIPredictionMarket.sol
```

Follow the prompts and save the addresses.

### Method C: Hardhat/Foundry

If you prefer traditional deployment:

1. **Install Hardhat**:
   ```bash
   npm install --save-dev hardhat @nomiclabs/hardhat-waffle
   ```

2. **Create deployment script**:
   ```javascript
   // scripts/deploy.js
   const hre = require("hardhat");

   async function main() {
     const TestToken = await hre.ethers.getContractFactory("TestToken");
     const testToken = await TestToken.deploy();
     await testToken.deployed();
     console.log("TestToken deployed to:", testToken.address);

     const AIPredictionMarket = await hre.ethers.getContractFactory("AIPredictionMarket");
     const market = await AIPredictionMarket.deploy(
       testToken.address,
       "YOUR_TREASURY_ADDRESS",
       "TEMP_CRE_RESOLVER_ADDRESS"
     );
     await market.deployed();
     console.log("AIPredictionMarket deployed to:", market.address);
   }

   main().catch((error) => {
     console.error(error);
     process.exitCode = 1;
   });
   ```

3. **Run deployment**:
   ```bash
   npx hardhat run scripts/deploy.js --network polygonAmoy
   ```

## Step 2: Verify Contracts (Optional but Recommended)

### On PolygonScan

```bash
npx hardhat verify --network polygonAmoy PREDICTION_MARKET_ADDRESS \
  "TEST_TOKEN_ADDRESS" \
  "TREASURY_ADDRESS" \
  "CRE_RESOLVER_ADDRESS"

npx hardhat verify --network polygonAmoy TEST_TOKEN_ADDRESS
```

Or use thirdweb dashboard's built-in verification.

## Step 3: Configure CRE Workflow

1. **Create CRE Account**:
   - Visit https://cre.chain.link
   - Sign up and create account
   - Generate a new wallet/private key for CRE resolver

2. **Update Smart Contract**:
   ```bash
   # Call setCREResolver() on your deployed contract
   # Set to the CRE wallet address
   ```

3. **Configure CRE Workflow**:
   ```bash
   cd cre-workflow
   cp config.production.json config.production.json.backup
   ```

   Edit `config.production.json`:
   ```json
   {
     "predictionMarketAddress": "YOUR_PREDICTION_MARKET_ADDRESS",
     "chainSelector": "16281711391670634445",
     "openaiApiKey": "sk-...",
     "coingeckoApiKey": "CG-...",
     "sportsApiKey": "...",
     "crePrivateKey": "0x...",
     "rpcUrl": "https://rpc-amoy.polygon.technology"
   }
   ```

4. **Test Locally**:
   ```bash
   bun install
   bun run simulate
   ```

5. **Build Workflow**:
   ```bash
   bun run build
   ```
   This creates a WASM binary in the `dist/` folder.

6. **Deploy to CRE**:
   ```bash
   cre workflow deploy --config config.production.json --network mainnet
   ```

   Or for testing:
   ```bash
   cre workflow deploy --config config.production.json --network staging
   ```

7. **Verify Deployment**:
   - Visit https://cre.chain.link
   - Check "My Workflows"
   - Ensure status is "Active"

## Step 4: Deploy Frontend

### Option A: Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Visit https://vercel.com
   - Click "Import Project"
   - Select your GitHub repository
   - Root Directory: `frontend`
   - Framework Preset: Next.js
   - Environment Variables:
     ```
     NEXT_PUBLIC_THIRDWEB_CLIENT_ID=...
     NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=...
     NEXT_PUBLIC_TEST_TOKEN_ADDRESS=...
     ```

3. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Visit your deployed URL

### Option B: Self-Hosted

```bash
cd frontend

# Build for production
npm run build

# Start server
npm start

# Or with PM2
npm install -g pm2
pm2 start npm --name "prediction-market" -- start
```

### Option C: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci --only=production

COPY frontend/ ./

ENV NODE_ENV production
ENV PORT 3000

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build image
docker build -t ai-prediction-market .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_THIRDWEB_CLIENT_ID=... \
  -e NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=... \
  -e NEXT_PUBLIC_TEST_TOKEN_ADDRESS=... \
  ai-prediction-market
```

## Step 5: Post-Deployment Tasks

### 1. Update Contract with CRE Resolver

Call `setCREResolver()` on your contract:

```javascript
// Using thirdweb dashboard:
// 1. Go to contract page
// 2. Click "Write" tab
// 3. Find "setCREResolver"
// 4. Enter CRE wallet address
// 5. Execute transaction
```

### 2. Seed Platform Liquidity (Optional)

```javascript
// Approve tokens
testToken.approve(PREDICTION_MARKET_ADDRESS, AMOUNT);

// Create market with initial liquidity
market.createMarket(
  "Sample Question",
  ["YES", "NO"],
  futureTimestamp,
  LIQUIDITY_AMOUNT,
  { value: ethers.utils.parseEther("0.01") }
);
```

### 3. Configure Treasury Wallet

Ensure treasury wallet:
- Can receive MATIC (for creation fees)
- Can receive TestTokens (for platform fees)

### 4. Test End-to-End Flow

1. Create a test market
2. Place a bet
3. Close the market
4. Verify CRE resolves correctly
5. Claim winnings

### 5. Monitor CRE Workflow

```bash
# Check logs in CRE dashboard
# Or use CLI
cre workflow logs --workflow-id YOUR_WORKFLOW_ID
```

## Step 6: Production Deployment (Polygon Mainnet)

⚠️ **Important**: Only deploy to mainnet after thorough testing on testnet.

### Changes for Mainnet:

1. **Contract Deployment**:
   - Deploy to Polygon Mainnet (Chain ID: 137)
   - Use real USDC or create production token
   - Ensure treasury wallet is secure

2. **CRE Configuration**:
   ```json
   {
     "chainSelector": "4051577828743386545",  // Polygon Mainnet
     "rpcUrl": "https://polygon-rpc.com"
   }
   ```

3. **Frontend Environment**:
   ```bash
   NEXT_PUBLIC_CHAIN_ID=137
   NEXT_PUBLIC_RPC_URL=https://polygon-rpc.com
   ```

4. **Security Hardening**:
   - Use hardware wallet for deployer and treasury
   - Implement multi-sig for contract ownership
   - Set up monitoring and alerts
   - Consider contract audit

## Troubleshooting

### Contract Deployment Issues

**Error: "Insufficient funds"**
- Ensure wallet has enough MATIC for gas
- Check gas price is reasonable

**Error: "Contract verification failed"**
- Ensure compiler version matches
- Use exact constructor parameters
- Try manual verification on PolygonScan

### CRE Workflow Issues

**Error: "Failed to connect to RPC"**
- Check RPC URL is correct
- Try alternative RPC: https://polygon-amoy.g.alchemy.com/v2/YOUR_KEY

**Error: "OpenAI API error"**
- Verify API key is valid
- Check you have credits
- Ensure model name is correct

**Error: "Event not detected"**
- Verify contract address is correct
- Check event signature matches
- Ensure confirmations setting is not too high

### Frontend Issues

**Error: "Cannot connect wallet"**
- Check thirdweb client ID is valid
- Ensure wallet extension is installed
- Try different wallet

**Error: "Transaction failed"**
- Check user has approved tokens
- Verify contract addresses are correct
- Ensure sufficient gas

## Monitoring & Maintenance

### Set Up Monitoring

1. **Contract Events**:
   - Use Tenderly for transaction monitoring
   - Set up alerts for failed transactions

2. **CRE Workflow**:
   - Check CRE dashboard regularly
   - Set up email notifications
   - Monitor API quota usage

3. **Frontend**:
   - Vercel analytics
   - Google Analytics (optional)
   - Sentry for error tracking

### Regular Maintenance

- Check CRE workflow is processing events
- Monitor treasury balance
- Review platform fee collection
- Update dependencies
- Backup configuration files

## Rollback Plan

If issues arise:

1. **Pause Contract** (if implemented):
   ```solidity
   contract.pause();
   ```

2. **Disable CRE Workflow**:
   ```bash
   cre workflow pause --workflow-id YOUR_ID
   ```

3. **Revert Frontend**:
   - Vercel: Click "Rollback" to previous deployment
   - Self-hosted: Revert git commit and redeploy

## Cost Estimates

### Testnet (Polygon Amoy)
- Contract deployment: ~0.5 MATIC (free from faucet)
- Transactions: ~0.01 MATIC each
- CRE: Free during early access

### Mainnet (Polygon)
- Contract deployment: ~$5-10 USD
- Transactions: ~$0.01-0.05 USD each
- CRE: Varies by usage (check CRE pricing)
- Frontend hosting: Free (Vercel) or ~$5-20/month

## Support

- **Contract Issues**: [GitHub Issues](YOUR_REPO/issues)
- **CRE Help**: https://discord.gg/chainlink
- **thirdweb Help**: https://discord.gg/thirdweb

---

**Deployment Checklist**:
- [ ] Contracts deployed and verified
- [ ] CRE workflow tested and deployed
- [ ] Frontend deployed and accessible
- [ ] End-to-end flow tested
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team trained on maintenance
