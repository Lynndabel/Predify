// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AIPredictionMarket
 * @dev Decentralized prediction market with AI-powered resolution via Chainlink CRE
 */
contract AIPredictionMarket is Ownable, ReentrancyGuard {
    // ============ State Variables ============
    
    IERC20 public bettingToken;
    address public treasury;
    address public creResolver; // Address authorized to resolve markets (Chainlink CRE)
    
    uint256 public platformFeePercent = 3; // 3% platform fee
    uint256 public marketCreationFee = 0.01 ether; // Fee to create market (in native token)
    uint256 public marketCounter;
    
    // ============ Structs ============
    
    enum MarketStatus {
        Active,
        Closed,
        Resolved,
        Cancelled
    }
    
    struct Market {
        uint256 id;
        address creator;
        string question;
        string[] outcomes; // e.g., ["YES", "NO"] or ["Team A", "Team B", "Draw"]
        uint256 resolutionTime;
        uint256 createdAt;
        MarketStatus status;
        uint256 winningOutcome; // Index of winning outcome
        uint256 totalPool;
        mapping(uint256 => uint256) outcomePool; // outcome index => total bet amount
        mapping(address => mapping(uint256 => uint256)) userBets; // user => outcome => amount
        mapping(address => bool) hasClaimed;
        uint256 platformLiquidity; // Initial liquidity provided by platform
    }
    
    mapping(uint256 => Market) public markets;
    
    // ============ Events ============
    
    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string question,
        string[] outcomes,
        uint256 resolutionTime
    );
    
    event BetPlaced(
        uint256 indexed marketId,
        address indexed user,
        uint256 outcomeIndex,
        uint256 amount
    );
    
    event MarketClosed(uint256 indexed marketId, uint256 timestamp);
    
    event MarketResolved(
        uint256 indexed marketId,
        uint256 winningOutcome,
        uint256 timestamp
    );
    
    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );
    
    event MarketCancelled(uint256 indexed marketId);
    
    // ============ Modifiers ============
    
    modifier onlyCREResolver() {
        require(msg.sender == creResolver, "Only CRE resolver can call");
        _;
    }
    
    modifier marketExists(uint256 marketId) {
        require(marketId < marketCounter, "Market does not exist");
        _;
    }
    
    modifier marketActive(uint256 marketId) {
        require(markets[marketId].status == MarketStatus.Active, "Market not active");
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _bettingToken,
        address _treasury,
        address _creResolver
    ) Ownable(msg.sender) {
        require(_bettingToken != address(0), "Invalid token address");
        require(_treasury != address(0), "Invalid treasury address");
        require(_creResolver != address(0), "Invalid resolver address");
        
        bettingToken = IERC20(_bettingToken);
        treasury = _treasury;
        creResolver = _creResolver;
    }
    
    // ============ Market Creation ============
    
    /**
     * @dev Create a new prediction market
     * @param question The market question
     * @param outcomes Array of possible outcomes
     * @param resolutionTime Unix timestamp when market can be resolved
     * @param initialLiquidity Initial liquidity to seed the market (optional)
     */
    function createMarket(
        string memory question,
        string[] memory outcomes,
        uint256 resolutionTime,
        uint256 initialLiquidity
    ) external payable nonReentrant returns (uint256) {
        require(msg.value >= marketCreationFee, "Insufficient creation fee");
        require(bytes(question).length > 0, "Question cannot be empty");
        require(outcomes.length >= 2, "Must have at least 2 outcomes");
        require(resolutionTime > block.timestamp, "Resolution time must be in future");
        
        uint256 marketId = marketCounter++;
        Market storage market = markets[marketId];
        
        market.id = marketId;
        market.creator = msg.sender;
        market.question = question;
        market.outcomes = outcomes;
        market.resolutionTime = resolutionTime;
        market.createdAt = block.timestamp;
        market.status = MarketStatus.Active;
        
        // Transfer creation fee to treasury
        (bool sent, ) = treasury.call{value: msg.value}("");
        require(sent, "Failed to send creation fee");
        
        // Add initial liquidity if provided
        if (initialLiquidity > 0) {
            require(
                bettingToken.transferFrom(msg.sender, address(this), initialLiquidity),
                "Liquidity transfer failed"
            );
            market.platformLiquidity = initialLiquidity;
            market.totalPool = initialLiquidity;
            
            // Distribute initial liquidity evenly across outcomes
            uint256 liquidityPerOutcome = initialLiquidity / outcomes.length;
            for (uint256 i = 0; i < outcomes.length; i++) {
                market.outcomePool[i] = liquidityPerOutcome;
            }
        }
        
        emit MarketCreated(marketId, msg.sender, question, outcomes, resolutionTime);
        
        return marketId;
    }
    
    // ============ Betting ============
    
    /**
     * @dev Place a bet on a specific outcome
     * @param marketId The market ID
     * @param outcomeIndex Index of the outcome to bet on
     * @param amount Amount of betting tokens to wager
     */
    function placeBet(
        uint256 marketId,
        uint256 outcomeIndex,
        uint256 amount
    ) external nonReentrant marketExists(marketId) marketActive(marketId) {
        Market storage market = markets[marketId];
        
        require(block.timestamp < market.resolutionTime, "Market betting closed");
        require(outcomeIndex < market.outcomes.length, "Invalid outcome");
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user to contract
        require(
            bettingToken.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );
        
        // Update market state
        market.userBets[msg.sender][outcomeIndex] += amount;
        market.outcomePool[outcomeIndex] += amount;
        market.totalPool += amount;
        
        emit BetPlaced(marketId, msg.sender, outcomeIndex, amount);
    }
    
    // ============ Market Closure ============
    
    /**
     * @dev Close a market when resolution time is reached
     * @param marketId The market ID to close
     */
    function closeMarket(uint256 marketId) 
        external 
        marketExists(marketId) 
        marketActive(marketId) 
    {
        Market storage market = markets[marketId];
        
        require(block.timestamp >= market.resolutionTime, "Resolution time not reached");
        
        market.status = MarketStatus.Closed;
        
        emit MarketClosed(marketId, block.timestamp);
    }
    
    // ============ Market Resolution (CRE Only) ============
    
    /**
     * @dev Resolve a market with the winning outcome (only callable by CRE)
     * @param marketId The market ID to resolve
     * @param winningOutcome Index of the winning outcome
     */
    function resolveMarket(uint256 marketId, uint256 winningOutcome) 
        external 
        onlyCREResolver 
        marketExists(marketId) 
    {
        Market storage market = markets[marketId];
        
        require(market.status == MarketStatus.Closed, "Market must be closed first");
        require(winningOutcome < market.outcomes.length, "Invalid winning outcome");
        
        market.status = MarketStatus.Resolved;
        market.winningOutcome = winningOutcome;
        
        emit MarketResolved(marketId, winningOutcome, block.timestamp);
    }
    
    // ============ Claiming Winnings ============
    
    /**
     * @dev Claim winnings from a resolved market
     * @param marketId The market ID to claim from
     */
    function claimWinnings(uint256 marketId) 
        external 
        nonReentrant 
        marketExists(marketId) 
    {
        Market storage market = markets[marketId];
        
        require(market.status == MarketStatus.Resolved, "Market not resolved");
        require(!market.hasClaimed[msg.sender], "Already claimed");
        
        uint256 userBet = market.userBets[msg.sender][market.winningOutcome];
        require(userBet > 0, "No winning bet");
        
        uint256 winningPool = market.outcomePool[market.winningOutcome];
        require(winningPool > 0, "No winning pool");
        
        // Calculate user's share of total pool
        // Formula: (userBet / winningPool) * totalPool
        uint256 grossPayout = (userBet * market.totalPool) / winningPool;
        
        // Deduct platform fee
        uint256 platformFee = (grossPayout * platformFeePercent) / 100;
        uint256 netPayout = grossPayout - platformFee;
        
        // Mark as claimed
        market.hasClaimed[msg.sender] = true;
        
        // Transfer winnings to user
        require(bettingToken.transfer(msg.sender, netPayout), "Payout transfer failed");
        
        // Transfer fee to treasury
        if (platformFee > 0) {
            require(bettingToken.transfer(treasury, platformFee), "Fee transfer failed");
        }
        
        emit WinningsClaimed(marketId, msg.sender, netPayout);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get market details
     */
    function getMarket(uint256 marketId) 
        external 
        view 
        marketExists(marketId) 
        returns (
            uint256 id,
            address creator,
            string memory question,
            string[] memory outcomes,
            uint256 resolutionTime,
            uint256 createdAt,
            MarketStatus status,
            uint256 winningOutcome,
            uint256 totalPool
        ) 
    {
        Market storage market = markets[marketId];
        return (
            market.id,
            market.creator,
            market.question,
            market.outcomes,
            market.resolutionTime,
            market.createdAt,
            market.status,
            market.winningOutcome,
            market.totalPool
        );
    }
    
    /**
     * @dev Get outcome pool amount
     */
    function getOutcomePool(uint256 marketId, uint256 outcomeIndex) 
        external 
        view 
        marketExists(marketId) 
        returns (uint256) 
    {
        return markets[marketId].outcomePool[outcomeIndex];
    }
    
    /**
     * @dev Get user's bet on specific outcome
     */
    function getUserBet(uint256 marketId, address user, uint256 outcomeIndex) 
        external 
        view 
        marketExists(marketId) 
        returns (uint256) 
    {
        return markets[marketId].userBets[user][outcomeIndex];
    }
    
    /**
     * @dev Calculate potential winnings for a user
     */
    function calculatePotentialWinnings(uint256 marketId, address user, uint256 outcomeIndex) 
        external 
        view 
        marketExists(marketId) 
        returns (uint256) 
    {
        Market storage market = markets[marketId];
        
        uint256 userBet = market.userBets[user][outcomeIndex];
        if (userBet == 0) return 0;
        
        uint256 outcomePool = market.outcomePool[outcomeIndex];
        if (outcomePool == 0) return 0;
        
        uint256 grossPayout = (userBet * market.totalPool) / outcomePool;
        uint256 platformFee = (grossPayout * platformFeePercent) / 100;
        
        return grossPayout - platformFee;
    }
    
    /**
     * @dev Get odds for an outcome (as percentage)
     */
    function getOdds(uint256 marketId, uint256 outcomeIndex) 
        external 
        view 
        marketExists(marketId) 
        returns (uint256) 
    {
        Market storage market = markets[marketId];
        
        if (market.totalPool == 0) return 0;
        
        uint256 outcomePool = market.outcomePool[outcomeIndex];
        return (outcomePool * 100) / market.totalPool;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Update CRE resolver address
     */
    function setCREResolver(address _creResolver) external onlyOwner {
        require(_creResolver != address(0), "Invalid resolver address");
        creResolver = _creResolver;
    }
    
    /**
     * @dev Update treasury address
     */
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury address");
        treasury = _treasury;
    }
    
    /**
     * @dev Update platform fee percentage
     */
    function setPlatformFee(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= 10, "Fee too high"); // Max 10%
        platformFeePercent = _feePercent;
    }
    
    /**
     * @dev Update market creation fee
     */
    function setMarketCreationFee(uint256 _fee) external onlyOwner {
        marketCreationFee = _fee;
    }
    
    /**
     * @dev Cancel a market (emergency only)
     */
    function cancelMarket(uint256 marketId) 
        external 
        onlyOwner 
        marketExists(marketId) 
    {
        Market storage market = markets[marketId];
        require(market.status == MarketStatus.Active || market.status == MarketStatus.Closed, 
                "Cannot cancel resolved market");
        
        market.status = MarketStatus.Cancelled;
        
        emit MarketCancelled(marketId);
    }
}
