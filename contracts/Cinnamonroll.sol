// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Cinnamonroll is ERC20, Ownable {
    uint256 constant _initial_supply = 100 * (10 ** 18);

    constructor() ERC20("Cinnamonroll", "CINA") Ownable(msg.sender) {
        _mint(msg.sender, _initial_supply);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
