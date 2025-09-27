// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TestTokenC2 is ERC20 {
    constructor(uint256 initialSupply) ERC20("TestTokenC2", "C2") {
        _mint(msg.sender, initialSupply);
    }
}
