// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../Libraries/AddressLibrary.sol";
import "../Interfaces/ITokenEventSubscriber.sol";
import "../Base/ManagedBaseContract.sol";

 contract CertisToken is  Initializable, ManagedBaseContract, ERC20Upgradeable {
    using AddressLibrary for *;

    // DATA /////////////////////////////////////////
    // decimals
    uint8 private _decimals;

    // CONSTRUCTOR /////////////////////////////////////////
    function CertisToken_init(string memory name, string memory symbol, uint256 MaxSupply, address managerContractAddress, uint8 decimalsValue) public initializer {
        super.ManagedBaseContract_init(managerContractAddress);
        super.__ERC20_init(name, symbol);
    
        _decimals = decimalsValue;
        _mint(msg.sender, MaxSupply);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function decimals() public view override returns (uint8) 
    {
        return _decimals;
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override 
    {
        ITokenEventSubscriber(_managerContract.retrieveTreasuryProxy()).onTokenBalanceChanged(from, to, amount);
        ITokenEventSubscriber(address(_managerContract)).onTokenBalanceChanged(from, to, amount);
    }

 }