# ✅ COMPLETE INTEGRATION GUIDE - Smart Contract to Frontend

This guide ensures your smart contracts are fully integrated with the frontend and everything works perfectly.

## 🎯 Current Status

✅ **Smart Contracts**: Complete and ready
✅ **CRE Workflow**: Complete and ready  
✅ **Frontend**: Complete with full integration
✅ **API Routes**: Created for data fetching
✅ **Create Market Page**: Implemented

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] A Web3 wallet (MetaMask recommended)
- [ ] Polygon Amoy testnet added to your wallet
- [ ] Some Amoy MATIC from faucet: https://faucet.polygon.technology
- [ ] thirdweb account created: https://thirdweb.com/dashboard

## 🚀 Step-by-Step Setup (30 minutes)

### Step 1: Get thirdweb Client ID (5 min)

1. Go to https://thirdweb.com/dashboard
2. Sign in with your wallet
3. Click "Settings" → "API Keys"
4. Click "Create API Key"
5. Copy your **Client ID** (starts with a long string)
6. Save it - you'll need it in Step 4

### Step 2: Deploy Smart Contracts (10 min)

#### Option A: Using thirdweb Dashboard (Easiest)

1. **Deploy TestToken**:
   ```
   - Go to: https://thirdweb.com/dashboard/contracts/deploy
   - Click "Deploy Contract"
   - Click "Upload Contract" or drag & drop
   - Upload: contracts/TestToken.sol
   - Network: Polygon Amoy Testnet (Chain ID: 80002)
   - No constructor parameters needed
   - Click "Deploy Now"
   - Sign transaction in your wallet
   - ✅ Copy the contract address (looks like: 0x1234...abcd)
   ```

2. **Deploy AIPredictionMarket**:
   ```
   - Click "Deploy Contract" again
   - Upload: contracts/AIPredictionMarket.sol
   - Network: Polygon Amoy Testnet
   - Constructor parameters:
     _bettingToken: [Paste TestToken address from step 1]
     _treasury: [Your wallet address]
     _creResolver: [Your wallet address for now - we'll update later]
   - Click "Deploy Now"
   - Sign transaction
   - ✅ Copy the contract address
   ```

3. **Save These Addresses**:
   ```
   TestToken Address: 0x________________
   PredictionMarket Address: 0x________________
   ```

#### Option B: Using Remix IDE (Alternative)

1. Go to https://remix.ethereum.org
2. Create new files and paste contract code
3. Compile contracts (Solidity 0.8.20)
4. Deploy to Polygon Amoy via Injected Provider - MetaMask
5. Save contract addresses

### Step 3: Verify Contracts Work (5 min)

1. Go to your deployed TestToken on thirdweb dashboard
2. Click "Read" tab
3. Try calling `name()` - should return "Test Prediction Token"
4. Click "Write" tab
5. Call `faucet()` - you should receive 1000 TPT tokens
6. Verify your balance increased

### Step 4: Configure Frontend (5 min)

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   # Create .env.local file
   touch .env.local
   ```

4. **Edit .env.local** (use your favorite text editor):
   ```bash
   # Paste these values (REPLACE with your actual values)
   
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_from_step_1
   NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0xYourPredictionMarketAddress
   NEXT_PUBLIC_TEST_TOKEN_ADDRESS=0xYourTestTokenAddress
   ```

   **Example .env.local**:
   ```
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=abc123def456ghi789
   NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
   NEXT_PUBLIC_TEST_TOKEN_ADDRESS=0xabcdef1234567890abcdef1234567890abcdef12
   ```

### Step 5: Run Frontend (2 min)

```bash
# Make sure you're in the frontend directory
cd frontend

# Start development server
npm run dev
```

You should see:
```
✓ Ready in 2.5s
○ Local:        http://localhost:3000
○ Network:      http://192.168.x.x:3000
```

### Step 6: Test the Integration (5 min)

1. **Open browser**: http://localhost:3000

2. **Connect Wallet**:
   - Click "Connect Wallet" button
   - Select MetaMask (or your wallet)
   - Approve connection
   - Make sure you're on Polygon Amoy network

3. **Get Test Tokens**:
   - Open TestToken contract on thirdweb dashboard
   - Call `faucet()` function
   - Wait for transaction
   - Check your balance: Should show 1000 TPT

4. **Create a Test Market**:
   - Click "Create Market" button on homepage
   - Fill in:
     - Question: "Will Bitcoin reach $100,000?"
     - Outcomes: ["YES", "NO"]
     - Resolution Date: Tomorrow's date
     - Resolution Time: 12:00 PM
   - Click "Create Market"
   - Approve the 0.01 MATIC transaction
   - Wait for confirmation
   - ✅ You should be redirected to homepage with your new market!

5. **Place a Bet**:
   - Click on your market
   - Click "Place Bet" on YES
   - Enter amount: 10
   - Click "Approve Tokens" (first time only)
   - Then "Confirm Bet"
   - Wait for transaction
   - ✅ Your bet should appear in the market!

## 🔧 Troubleshooting

### Issue: "Cannot connect wallet"
**Solution**:
- Make sure MetaMask is installed
- Switch network to Polygon Amoy in MetaMask
- Try refreshing the page
- Check console for errors (F12)

### Issue: "Contract not deployed" error
**Solution**:
- Verify .env.local has correct addresses
- Make sure addresses start with "0x"
- Restart dev server: Stop (Ctrl+C) and run `npm run dev` again

### Issue: "Insufficient funds" when creating market
**Solution**:
- Get Amoy MATIC from faucet: https://faucet.polygon.technology
- Wait a few minutes for funds to arrive
- Check balance in MetaMask

### Issue: "Token approval failed"
**Solution**:
- Make sure you called faucet() to get TPT tokens
- Check TestToken balance in thirdweb dashboard
- Try increasing gas limit in MetaMask

### Issue: Markets not showing on homepage
**Solution**:
- Check browser console (F12) for API errors
- Verify NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS is set correctly
- Make sure you actually created a market
- Try refreshing the page

### Issue: "Failed to fetch market data"
**Solution**:
- Check that contract addresses in .env.local are correct
- Verify contracts are deployed to Polygon Amoy (not another network)
- Check that thirdweb client ID is valid
- Look at Network tab in browser DevTools for API errors

## ✅ Success Checklist

After completing all steps, you should be able to:

- [ ] Connect wallet to the app
- [ ] See your wallet address in the header
- [ ] Get test tokens from faucet
- [ ] Create a new prediction market
- [ ] See the market appear on homepage
- [ ] Click into market detail page
- [ ] Place a bet on an outcome
- [ ] See updated odds after betting
- [ ] View your position in the market

## 🎥 For Demo Video

Once everything works:

1. **Record wallet connection**: Show ConnectButton UI
2. **Show faucet**: Call faucet() on thirdweb dashboard
3. **Create market**: Full flow on /create page
4. **Place bet**: Show approval + bet flow
5. **Show market detail**: Live odds, positions

## 🔐 Important Notes

### Before Production:
- [ ] Never commit .env.local to git (already in .gitignore)
- [ ] Use separate wallets for dev and production
- [ ] Update CRE resolver address in contract
- [ ] Test on testnet extensively before mainnet

### Contract Security:
- [ ] These contracts are NOT audited
- [ ] Only use on testnet with test funds
- [ ] For production, get professional audit

## 📚 Next Steps

Once frontend integration is working:

1. **Setup CRE Workflow**: See cre-workflow/README.md
2. **Test Market Resolution**: Create market, close it, let CRE resolve
3. **Claim Winnings**: Test full payout flow
4. **Deploy to Vercel**: For public demo

## 🆘 Still Having Issues?

### Check Common Mistakes:

1. **Wrong Network**: 
   - Frontend expects Polygon Amoy (Chain ID: 80002)
   - Check MetaMask network

2. **Contract Addresses**:
   - Must be from Polygon Amoy deployment
   - Must start with "0x"
   - Must be 42 characters long

3. **API Keys**:
   - thirdweb Client ID must be valid
   - Get from https://thirdweb.com/dashboard/settings/api-keys

4. **Dependencies**:
   ```bash
   # Try reinstalling
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Mode:

Enable detailed logs:
```bash
# In frontend directory
NEXT_PUBLIC_DEBUG=true npm run dev
```

Check browser console (F12) for detailed error messages.

## 🎉 Success!

If you can create a market and place a bet, your integration is complete! 

The frontend is now fully connected to your smart contracts and ready for:
- ✅ Demo video
- ✅ Hackathon submission
- ✅ Further development

---

**Integration Complete**: Frontend ↔️ Smart Contracts ↔️ Polygon Amoy
