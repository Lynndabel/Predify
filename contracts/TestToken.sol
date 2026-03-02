// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TestToken
 * @dev ERC20 token for testing the prediction market
 */
contract TestToken is ERC20, Ownable {
    uint256 public constant FAUCET_AMOUNT = 1000 * 10**18; // 1000 tokens
    
    mapping(address => uint256) public lastFaucetClaim;
    uint256 public faucetCooldown = 1 days;
    
    constructor() ERC20("Test Prediction Token", "TPT") Ownable(msg.sender) {
        // Mint initial supply to deployer
        _mint(msg.sender, 1000000 * 10**18); // 1 million tokens
    }
    
    /**
     * @dev Mint tokens to an address (owner only)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    /**
     * @dev Faucet function - allows users to claim test tokens once per cooldown period
     */
    function faucet() external {
        require(
            block.timestamp >= lastFaucetClaim[msg.sender] + faucetCooldown,
            "Faucet cooldown not elapsed"
        );
        
        lastFaucetClaim[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);
    }
    
    /**
     * @dev Update faucet cooldown (owner only)
     */
    function setFaucetCooldown(uint256 _cooldown) external onlyOwner {
        faucetCooldown = _cooldown;
    }
}
