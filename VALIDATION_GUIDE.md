# 🚀 SETUP & VALIDATION GUIDE - Celo Sepolia

## 📋 PRE-FLIGHT CHECKLIST

Before running the project, complete these steps:

### ✅ Step 1: Network Setup (5 minutes)

1. **Add Celo Sepolia to MetaMask:**
   - Network Name: `Celo Sepolia Testnet`
   - RPC URL: `https://forno.celo-sepolia.celo-testnet.org`
   - Chain ID: `11142220`
   - Currency Symbol: `CELO`
   - Block Explorer: `https://celo-sepolia.blockscout.com`

2. **Get Test CELO:**
   - Visit: https://faucet.celo.org
   - Select "Sepolia Testnet"
   - Paste your wallet address
   - Request tokens
   - Wait 1-2 minutes

### ✅ Step 2: Environment Configuration (3 minutes)

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Create .env.local file:**
   ```bash
   cp .env.example .env.local
   ```

3. **Edit .env.local with your values:**
   ```env
   # REQUIRED - Get from https://thirdweb.com/dashboard/settings/api-keys
   NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_actual_client_id

   # REQUIRED - Your deployed contract addresses on Celo Sepolia
   NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x67b018939F05751363581D58C46909B6640C30D3
   NEXT_PUBLIC_TEST_TOKEN_ADDRESS=0x67b018939F05751363581D58C46909B6640C30D3

   # OPTIONAL - Already set by default
   NEXT_PUBLIC_CHAIN_ID=11142220
   NEXT_PUBLIC_RPC_URL=https://forno.celo-sepolia.celo-testnet.org
   ```

   **Critical:** Replace `your_actual_client_id` with your real thirdweb client ID!

### ✅ Step 3: Verify Contracts (2 minutes)

1. **Check contracts are deployed:**
   - Visit: https://celo-sepolia.blockscout.com
   - Search: `0x67b018939F05751363581D58C46909B6640C30D3`
   - Verify both contracts exist

2. **If contracts NOT deployed:**
   ```bash
   # You need to deploy them first via thirdweb dashboard
   # See DEPLOYMENT_STEPS.md for instructions
   ```

### ✅ Step 4: Install Dependencies (2 minutes)

```bash
# Make sure you're in the frontend directory
cd frontend

# Install all dependencies
npm install

# Expected output: No errors, all packages installed
```

### ✅ Step 5: Run Project (1 minute)

```bash
# Start development server
npm run dev

# Expected output:
# ✓ Ready in 2-3s
# ○ Local: http://localhost:3000
```

## 🔍 VALIDATION TESTS

### Test 1: Frontend Loads ✅

```bash
# Open browser
http://localhost:3000

# Expected:
✅ Page loads without errors
✅ Beautiful UI appears
✅ No console errors (F12)
✅ "Connect Wallet" button visible
```

### Test 2: Wallet Connection ✅

```bash
# Click "Connect Wallet"
# Select MetaMask
# Approve connection

# Expected:
✅ Wallet connects successfully
✅ Network is Celo Sepolia (11142220)
✅ Your address appears in header
✅ Balance shows (if you have CELO)
```

### Test 3: Contract Configuration ✅

```bash
# Check browser console (F12)
# Look for any errors

# Expected:
✅ No "Contract not deployed" errors
✅ No "Invalid address" errors
✅ No RPC connection errors
```

### Test 4: Get Test Tokens ✅

```bash
# Option A: Via Frontend (if faucet button exists)
# Click "Get Tokens" or similar

# Option B: Via Block Explorer
1. Go to: https://celo-sepolia.blockscout.com/address/0x67b018939F05751363581D58C46909B6640C30D3
2. Find "Write Contract" tab
3. Connect wallet
4. Call faucet() function
5. Confirm transaction

# Expected:
✅ Transaction succeeds
✅ Receive 1000 TPT tokens
✅ Balance updates
```

### Test 5: View Markets ✅

```bash
# On homepage

# Expected:
✅ Markets load (or shows "No markets" if none exist)
✅ No loading errors
✅ Smooth animations
✅ Cards display correctly
```

### Test 6: Create Market ✅

```bash
# Click "Create Market"
# Fill in form:
- Question: "Will Bitcoin reach $100k?"
- Outcomes: ["YES", "NO"]
- Date: Tomorrow
- Time: 12:00

# Click "Create Market"

# Expected:
✅ Form validation works
✅ MetaMask popup appears
✅ Transaction confirms
✅ Redirects to home
✅ New market appears
```

### Test 7: Place Bet ✅

```bash
# Click on a market
# Click "Place Bet" on an outcome
# Enter amount: 10
# Click "Approve Tokens" (first time)
# Click "Confirm Bet"

# Expected:
✅ Approval transaction succeeds
✅ Bet transaction succeeds
✅ Odds update
✅ Your position shows
```

### Test 8: UI/UX Quality ✅

```bash
# Navigate through all pages
# Hover over elements
# Try mobile view (F12 > Device toolbar)

# Expected:
✅ Smooth 60fps animations
✅ Glassmorphism effects work
✅ Hover states are beautiful
✅ Mobile responsive
✅ No layout breaks
```

## 🐛 TROUBLESHOOTING

### Issue: "Cannot connect to wallet"

**Solutions:**
```bash
1. Check MetaMask is installed
2. Verify network is Celo Sepolia (Chain ID: 11142220)
3. Refresh page (Ctrl+R)
4. Clear browser cache
5. Try different browser
```

### Issue: "Contract not deployed" error

**Solutions:**
```bash
1. Verify .env.local exists in frontend directory
2. Check NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS is set
3. Verify contract addresses are correct
4. Restart dev server: Stop (Ctrl+C) and run npm run dev
5. Check contracts on explorer: https://celo-sepolia.blockscout.com
```

### Issue: "Insufficient funds" when creating market

**Solutions:**
```bash
1. Get CELO from faucet: https://faucet.celo.org
2. Wait a few minutes for tokens to arrive
3. Check balance in MetaMask
4. Try again
```

### Issue: "Token approval failed"

**Solutions:**
```bash
1. Verify you have TPT tokens (call faucet())
2. Check token balance on block explorer
3. Increase gas limit in MetaMask
4. Try approving larger amount
```

### Issue: Page doesn't load or shows errors

**Solutions:**
```bash
1. Check all dependencies installed: npm install
2. Verify .env.local file exists and is filled
3. Check for typos in environment variables
4. Look at terminal for error messages
5. Check browser console (F12) for errors
6. Restart dev server
```

### Issue: Slow RPC responses

**Solutions:**
```bash
# Try alternative RPC in .env.local:
NEXT_PUBLIC_RPC_URL=https://celo-sepolia-rpc.publicnode.com

# Or:
NEXT_PUBLIC_RPC_URL=https://1rpc.io/celo-sepolia
```

## 📊 VALIDATION CHECKLIST

Before demo/submission, verify ALL these:

**Configuration:**
- [ ] .env.local file exists and is configured
- [ ] thirdweb Client ID is set
- [ ] Contract addresses are correct
- [ ] Network is Celo Sepolia (11142220)

**Wallet & Tokens:**
- [ ] MetaMask connected to Celo Sepolia
- [ ] Have test CELO (>0.1 CELO)
- [ ] Can get TPT tokens from faucet
- [ ] Token balance shows correctly

**Frontend:**
- [ ] Homepage loads without errors
- [ ] UI looks beautiful (gradients, glass effects)
- [ ] Animations are smooth
- [ ] Responsive on mobile
- [ ] All pages accessible

**Functionality:**
- [ ] Can connect wallet
- [ ] Can create market
- [ ] Can place bet
- [ ] Can view market details
- [ ] Can see live odds
- [ ] All transactions succeed

**Performance:**
- [ ] Page loads in <3 seconds
- [ ] Animations run at 60fps
- [ ] No console errors
- [ ] No broken images/links

## ✅ SUCCESS CRITERIA

Your project is ready when:

1. ✅ All validation tests pass
2. ✅ Can complete full user journey (connect → create → bet → claim)
3. ✅ UI looks award-worthy
4. ✅ No errors in console
5. ✅ Works on mobile
6. ✅ Ready to record demo video

## 🎥 DEMO RECORDING TIPS

1. **Close unnecessary browser tabs**
2. **Clear console (F12)**
3. **Start with fresh wallet connection**
4. **Have test tokens ready**
5. **Record in 1080p minimum**
6. **Show smooth animations**
7. **Highlight unique features**

## 📞 SUPPORT

If you encounter issues:

1. **Check this validation guide first**
2. **Look at browser console for errors**
3. **Verify all environment variables**
4. **Check contract addresses on explorer**
5. **Ensure network is Celo Sepolia**

## 🎉 YOU'RE READY!

Once all validation tests pass, your project is:
- ✅ Fully functional
- ✅ Award-worthy UI
- ✅ Demo-ready
- ✅ Hackathon-ready

**Good luck! 🚀**
