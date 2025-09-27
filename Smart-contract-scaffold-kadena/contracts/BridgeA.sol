// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract BridgeA {
    address public tokenAddress;
    address public relayer;

    constructor(address _token, address _relayer) {
        tokenAddress = _token;
        relayer = _relayer;
    }

    event Locked(address sender, uint256 amount, string targetChain, address recipient);
    event Unlocked(address recipient, uint256 amount);

  
    function lockTokens(uint256 amount, string calldata targetChain, address recipient) external {
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        emit Locked(msg.sender, amount, targetChain, recipient);
    }


    function unlockTokens(address recipient, uint256 amount) external {
        require(msg.sender == relayer, "Only relayer can unlock");
        IERC20(tokenAddress).transfer(recipient, amount);
        emit Unlocked(recipient, amount);
    }
}
