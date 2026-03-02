# 🟢 CELO DEPLOYMENT GUIDE

Complete guide to deploying the AI Prediction Market on **Celo Alfajores Testnet**.

## 🌟 Why Celo?

- ✅ **Low Fees**: Ultra-low transaction costs (~$0.001)
- ✅ **Mobile-First**: Optimized for mobile wallets
- ✅ **Carbon Neutral**: Eco-friendly blockchain
- ✅ **EVM Compatible**: Same Solidity contracts work
- ✅ **Stablecoin Native**: Built-in cUSD, cEUR, cREAL
- ✅ **Chainlink Support**: Full oracle integration

## 📋 Prerequisites

- [ ] MetaMask or Celo-compatible wallet
- [ ] Celo Alfajores testnet added to wallet
- [ ] Test CELO from faucet
- [ ] thirdweb account

## 🚀 Quick Start (20 minutes)

### Step 1: Add Celo Alfajores to MetaMask (3 min)

**Option A: Automatic (Recommended)**
1. Visit https://chainlist.org/chain/44787
2. Click "Connect Wallet"
3. Click "Add to MetaMask"
4. Approve in MetaMask

**Option B: Manual**
1. Open MetaMask
2. Click network dropdown → "Add Network" → "Add network manually"
3. Enter these details:
   ```
   Network Name: Celo Alfajores Testnet
   RPC URL: https://alfajores-forno.celo-testnet.org
   Chain ID: 44787
   Currency Symbol: CELO
   Block Explorer: https://alfajores.celoscan.io
   ```
4. Click "Save"

### Step 2: Get Test CELO (5 min)

**Multiple Faucet Options:**

1. **Official Celo Faucet** (Gives 5 CELO + stablecoins)
   - Visit: https://faucet.celo.org
   - Paste your wallet address
   - Solve captcha
   - Click "Get Alfajores tokens"
   - Wait 1-2 minutes

2. **Chainlink Faucet** (Backup)
   - Visit: https://faucets.chain.link/celo-alfajores
   - Connect wallet
   - Request tokens

3. **AllThatNode Faucet** (Backup)
   - Visit: https://www.allthatnode.com/faucet/celo.dsrv
   - Enter address
   - Get tokens

### Step 3: Deploy Contracts on Celo (10 min)

**Using thirdweb Dashboard:**

1. **Deploy TestToken**:
   ```
   - Go to: https://thirdweb.com/dashboard/contracts/deploy
   - Upload: contracts/TestToken.sol
   - Network: Celo Alfajores Testnet (Chain ID: 44787)
   - Constructor: None needed
   - Deploy & Sign transaction
   - ✅ Copy contract address
   ```

2. **Deploy AIPredictionMarket**:
   ```
   - Upload: contracts/AIPredictionMarket.sol
   - Network: Celo Alfajores Testnet
   - Constructor parameters:
     _bettingToken: [TestToken address from step 1]
     _treasury: [Your wallet address]
     _creResolver: [Your wallet address for now]
   - Deploy & Sign transaction
   - ✅ Copy contract address
   ```

3. **Verify on Celo Explorer**:
   - Visit: https://alfajores.celoscan.io
   - Search your contract addresses
   - Contracts should appear within 1-2 minutes

### Step 4: Configure Frontend (5 min)

1. **Navigate to frontend**:
   ```bash
   cd frontend
   npm install
   ```

2. **Create .env.local**:
   ```bash
   # Create environment file
   touch .env.local
   ```

3. **Add configuration**:
   ```env
   # thirdweb Client ID (from thirdweb.com/dashboard)
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here

   # Contract Addresses (from Celo deployment)
   NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0xYourPredictionMarketAddress
   NEXT_PUBLIC_TEST_TOKEN_ADDRESS=0xYourTestTokenAddress
   ```

4. **Run the app**:
   ```bash
   npm run dev
   ```

### Step 5: Test on Celo (5 min)

1. **Open app**: http://localhost:3000
2. **Connect wallet**: Should auto-detect Celo Alfajores
3. **Get tokens**: Call `faucet()` on TestToken
4. **Create market**: Test market creation (costs ~0.01 CELO)
5. **Place bet**: Test betting flow

## 🔧 Celo-Specific Configuration

### Contract Updates

No changes needed! The Solidity contracts work identically on Celo (EVM compatible).

### Frontend Updates (Already Done)

The project now uses Celo Alfajores by default:
```typescript
// lib/contract.ts
export const celoAlfajores = defineChain({
  id: 44787,
  rpc: "https://alfajores-forno.celo-testnet.org",
  // ...
});
```

### CRE Workflow Updates

**Important**: CRE needs Celo-specific chain selector.

Since CRE is newly launched (Nov 2024), check current Celo support:

1. **Check CRE Documentation**:
   - Visit: https://docs.chain.link/cre
   - Look for "Supported Networks"
   - Find Celo Alfajores chain selector

2. **Update CRE config**:
   ```json
   // cre-workflow/config.production.json
   {
     "chainSelector": "CELO_ALFAJORES_CHAIN_SELECTOR",
     "rpcUrl": "https://alfajores-forno.celo-testnet.org",
     // ... other config
   }
   ```

**Note**: If Celo isn't yet supported in CRE, you can:
- Use manual resolution for testing
- Request Celo support via Chainlink Discord
- Monitor CRE updates for Celo support

## 💰 Cost Comparison: Celo vs Polygon

| Operation | Polygon Amoy | Celo Alfajores |
|-----------|-------------|----------------|
| Deploy Contract | ~$0.05 | ~$0.01 |
| Create Market | ~$0.02 | ~$0.005 |
| Place Bet | ~$0.01 | ~$0.002 |
| Claim Winnings | ~$0.01 | ~$0.002 |

**Celo is ~5x cheaper!** 🎉

## 🌍 Celo Mainnet Deployment

For production deployment:

1. **Network Configuration**:
   ```typescript
   export const celoMainnet = defineChain({
     id: 42220,
     rpc: "https://forno.celo.org",
     // ...
   });
   ```

2. **Get Real CELO**:
   - Buy on exchanges (Coinbase, Binance)
   - Bridge from other networks
   - Minimum: ~$10 CELO for deployment

3. **Use Production Betting Token**:
   - Deploy with real cUSD/cEUR instead of TestToken
   - Or keep TestToken for controlled demo

4. **Security Audit**:
   - Get professional audit before mainnet
   - Use multi-sig for treasury
   - Set proper CRE resolver address

## 🎯 Celo-Specific Features

### Native Stablecoins

Celo has built-in stablecoins you can use:

```solidity
// Instead of TestToken, use Celo's native stablecoins
address constant CUSD = 0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1; // Alfajores cUSD
address constant CEUR = 0x10c892A6EC43a53E45D0B916B4b7D383B1b78C0F; // Alfajores cEUR
```

Update constructor:
```solidity
constructor(
    address _bettingToken, // Use cUSD address
    address _treasury,
    address _creResolver
) { ... }
```

### Mobile Wallet Support

Celo is mobile-first, so add mobile wallet support:

```typescript
// frontend/lib/contract.ts
import { celoWallet } from "thirdweb/wallets";

const wallets = [
  celoWallet(),      // Celo-specific
  inAppWallet(),
  createWallet("io.metamask"),
];
```

## 🔍 Verification & Debugging

### Verify Contract on Celoscan

**Automatic (thirdweb)**:
- Contracts deployed via thirdweb auto-verify

**Manual**:
1. Visit: https://alfajores.celoscan.io/verifyContract
2. Enter contract address
3. Select compiler version (0.8.20)
4. Paste contract code
5. Submit

### Check Transaction Status

1. Copy transaction hash
2. Visit: https://alfajores.celoscan.io
3. Search transaction
4. Check status: Success/Failed

### Debug Failed Transactions

Common issues:
- Insufficient CELO for gas
- Wrong network (check chain ID: 44787)
- Contract not deployed
- Wrong function parameters

## 📚 Celo Resources

### Official Links
- **Docs**: https://docs.celo.org
- **Explorer**: https://alfajores.celoscan.io
- **Faucet**: https://faucet.celo.org
- **Status**: https://status.celo.org

### Chainlink on Celo
- **Oracles**: https://docs.celo.org/developer/oracles/chainlink-oracles
- **Data Feeds**: https://data.chain.link/celo
- **CCIP**: Cross-chain messaging support

### Community
- **Discord**: https://discord.gg/celo
- **Forum**: https://forum.celo.org
- **Twitter**: @CeloOrg

## 🐛 Troubleshooting

### Issue: "Chain 44787 not supported"
**Solution**: Update thirdweb SDK to latest version
```bash
npm update thirdweb
```

### Issue: "Insufficient funds for gas"
**Solution**: Get more test CELO from faucet
- https://faucet.celo.org

### Issue: "Transaction taking too long"
**Solution**: Check Celo network status
- https://status.celo.org
- Try alternative RPC: `https://alfajores-forno.celo-testnet.org`

### Issue: "Contract deployment failed"
**Solution**: 
- Check you're on Alfajores network (Chain ID: 44787)
- Ensure sufficient CELO balance
- Try deploying via Remix as alternative

## ✅ Deployment Checklist

- [ ] Added Celo Alfajores to wallet
- [ ] Got test CELO from faucet (>1 CELO)
- [ ] Created thirdweb account & got Client ID
- [ ] Deployed TestToken to Celo Alfajores
- [ ] Deployed AIPredictionMarket to Celo Alfajores
- [ ] Verified contracts on Celoscan
- [ ] Created .env.local with addresses
- [ ] Ran `npm install` in frontend
- [ ] Tested app at localhost:3000
- [ ] Connected wallet to app
- [ ] Got test tokens from faucet() function
- [ ] Created test market successfully
- [ ] Placed test bet successfully

## 🎉 Success!

If you completed all checklist items, your AI Prediction Market is now running on Celo! 

**Benefits you get with Celo**:
- ✅ ~5x lower fees than Polygon
- ✅ Mobile-optimized experience  
- ✅ Carbon-neutral blockchain
- ✅ Native stablecoin support
- ✅ Fast transaction finality (~5 seconds)

## 🚀 Next Steps

1. **Test thoroughly**: Create multiple markets, bet, claim winnings
2. **Setup CRE**: Once Celo support is confirmed
3. **Invite testers**: Share your local deployment
4. **Deploy to Vercel**: Make it public
5. **Submit to hackathon**: You're ready!

---

**Welcome to Celo! 🟢 You're building on one of the most user-friendly blockchains.**
