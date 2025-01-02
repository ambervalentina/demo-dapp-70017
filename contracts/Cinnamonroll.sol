// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Cinnamonroll is ERC20, Ownable {
    uint constant _initial_supply = 100 * (10 ** 18);

    constructor() ERC20("Cinnamonroll", "CINA") Ownable(msg.sender) {
        // Mint an initial supply to the contract deployer (msg.sender)
        console.log("msg.sender: ", msg.sender);
        _mint(msg.sender, _initial_supply);
    }

    // Optional: Function to mint new tokens (onlyOwner)
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    // Optional: Function to burn tokens
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function recoverTokens(
        address tokenAddress,
        uint256 amount
    ) external onlyOwner {
        console.log("transferring from %s to %s", msg.sender, tokenAddress);
        require(tokenAddress != address(this), "Cannot recover native token");
        IERC20(tokenAddress).transfer(msg.sender, amount);
    }
}
