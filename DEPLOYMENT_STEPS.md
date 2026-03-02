# 🚀 DEPLOYMENT GUIDE - Celo Sepolia

## Quick Deployment to Celo Sepolia Testnet

### ⚡ Prerequisites

- [ ] MetaMask installed
- [ ] Test CELO tokens from faucet
- [ ] thirdweb account created

### 📍 Network Details

```
Network Name: Celo Sepolia Testnet
Chain ID: 11142220
RPC URL: https://forno.celo-sepolia.celo-testnet.org
Currency: CELO
Explorer: https://celo-sepolia.blockscout.com
Faucet: https://faucet.celo.org (select Sepolia)
```

## OPTION 1: Deploy via thirdweb Dashboard (Easiest) ⭐

### Step 1: Add Celo Sepolia to MetaMask

1. Visit: https://chainlist.org
2. Search: "Celo Sepolia"
3. Click "Add to MetaMask"
4. Approve in MetaMask

### Step 2: Get Test CELO

1. Visit: https://faucet.celo.org
2. Select "Sepolia Testnet"
3. Enter your wallet address
4. Click "Request"
5. Wait 1-2 minutes

### Step 3: Deploy TestToken

1. Go to: https://thirdweb.com/dashboard/contracts/deploy
2. Click "Deploy Contract"
3. Upload: `contracts/TestToken.sol`
4. Select Network: **Add Custom Network**
   - Chain ID: `11142220`
   - RPC: `https://forno.celo-sepolia.celo-testnet.org`
5. Click "Deploy Now"
6. Confirm transaction in MetaMask
7. **✅ Save the contract address!**

### Step 4: Deploy AIPredictionMarket

1. Click "Deploy Contract" again
2. Upload: `contracts/AIPredictionMarket.sol`
3. Select Network: **Celo Sepolia** (should appear now)
4. Fill constructor parameters:
   - `_bettingToken`: [TestToken address from Step 3]
   - `_treasury`: [Your wallet address]
   - `_creResolver`: [Your wallet address for now]
5. Click "Deploy Now"
6. Confirm transaction
7. **✅ Save the contract address!**

### Step 5: Verify Deployment

1. Visit: https://celo-sepolia.blockscout.com
2. Search your TestToken address
3. Search your PredictionMarket address
4. Both should appear within 1-2 minutes

### Step 6: Configure Frontend

1. Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
   NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0xYourMarketAddress
   NEXT_PUBLIC_TEST_TOKEN_ADDRESS=0xYourTokenAddress
   ```

2. Replace with your actual addresses!

### Step 7: Test

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000 and test!

## OPTION 2: Deploy via Remix IDE (Alternative)

### Step 1: Open Remix

1. Visit: https://remix.ethereum.org
2. Create new workspace

### Step 2: Add Contracts

1. Create `TestToken.sol`
2. Paste code from `contracts/TestToken.sol`
3. Create `AIPredictionMarket.sol`
4. Paste code from `contracts/AIPredictionMarket.sol`

### Step 3: Compile

1. Click "Solidity Compiler" tab
2. Select compiler: `0.8.20`
3. Click "Compile TestToken.sol"
4. Click "Compile AIPredictionMarket.sol"
5. Verify no errors

### Step 4: Deploy

1. Click "Deploy & Run" tab
2. Environment: **Injected Provider - MetaMask**
3. Verify network is Celo Sepolia (11142220)
4. Deploy TestToken first:
   - Select "TestToken"
   - Click "Deploy"
   - Confirm in MetaMask
   - Copy deployed address
5. Deploy AIPredictionMarket:
   - Select "AIPredictionMarket"
   - Fill constructor:
     - `_bettingToken`: [TestToken address]
     - `_treasury`: [Your address]
     - `_creResolver`: [Your address]
   - Click "Deploy"
   - Confirm in MetaMask

### Step 5: Configure

Same as Option 1, Step 6.

## 🔧 POST-DEPLOYMENT SETUP

### Enable Token Faucet

1. Go to TestToken on block explorer
2. Navigate to "Write Contract"
3. Connect wallet
4. Call `faucet()` to test
5. Verify you receive 1000 TPT

### Test Market Creation

1. Open your frontend
2. Connect wallet
3. Click "Create Market"
4. Fill in test market
5. Pay creation fee (0.01 CELO)
6. Verify market appears

### Update CRE Resolver (Optional)

If using CRE workflow:
1. Deploy CRE workflow to DON
2. Get CRE wallet address
3. Call `setCREResolver(creWalletAddress)` on contract

## 📝 Environment Files

### Frontend (.env.local)

```env
# Required
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0xYourAddress
NEXT_PUBLIC_TEST_TOKEN_ADDRESS=0xYourAddress

# Optional (already set by default)
NEXT_PUBLIC_CHAIN_ID=11142220
NEXT_PUBLIC_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
```

### CRE Workflow (config.production.json)

```json
{
  "predictionMarketAddress": "0xYourMarketAddress",
  "chainSelector": "CELO_SEPOLIA_SELECTOR",
  "openaiApiKey": "sk-your-key",
  "coingeckoApiKey": "CG-your-key",
  "crePrivateKey": "0xYourPrivateKey",
  "rpcUrl": "https://forno.celo-sepolia.celo-testnet.org"
}
```

## ✅ Deployment Checklist

- [ ] Celo Sepolia added to MetaMask
- [ ] Have test CELO (>0.5 CELO)
- [ ] TestToken deployed
- [ ] PredictionMarket deployed
- [ ] Contracts verified on explorer
- [ ] .env.local created and configured
- [ ] Frontend runs locally
- [ ] Can connect wallet
- [ ] Can get test tokens
- [ ] Can create market
- [ ] Can place bet

## 🎯 Gas Costs (Celo Sepolia)

Estimated gas costs on Celo Sepolia:

| Operation | Gas | Cost (CELO) |
|-----------|-----|-------------|
| Deploy TestToken | ~1.5M | ~0.001 |
| Deploy Market | ~3M | ~0.002 |
| Create Market | ~200k | ~0.0001 |
| Place Bet | ~100k | ~0.00005 |
| Claim Winnings | ~80k | ~0.00004 |

**Total for full test: ~0.005 CELO**

Faucet gives you enough for hundreds of tests!

## 🐛 Common Issues

### "Transaction failed"
- Increase gas limit in MetaMask
- Check you have enough CELO
- Verify network is Celo Sepolia

### "Contract not verified"
- Wait 2-3 minutes
- Refresh block explorer
- Use thirdweb auto-verification

### "Cannot read properties"
- Check constructor parameters are correct
- Verify TestToken deployed first
- Ensure addresses are valid

## 🎉 Success!

Once deployed, you have:
- ✅ Working contracts on Celo Sepolia
- ✅ Configured frontend
- ✅ Ready to demo

Proceed to `VALIDATION_GUIDE.md` for testing!
