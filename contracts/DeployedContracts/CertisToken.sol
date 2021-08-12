// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../Libraries/AddressLibrary.sol";
import "../Interfaces/ICertisToken.sol";
import "../Interfaces/ITreasury.sol";
import "../Base/ManagedBaseContract.sol";

 contract CertisToken is  Initializable, ICertisToken, ManagedBaseContract, ERC20Upgradeable {
    using AddressLibrary for *;

    // DATA /////////////////////////////////////////
    address[] private _tokenOwners; // to delete
    uint8 private _decimals;

    // CONSTRUCTOR /////////////////////////////////////////
    function CertisToken_init(string memory name, string memory symbol, uint256 MaxSupply, address managerContractAddress, uint8 decimalsValue) public initializer {
        super.ManagedBaseContract_init(managerContractAddress);
        super.__ERC20_init(name, symbol);
        
        _tokenOwners = new address[](0);
        _decimals = decimalsValue;
        _mint(msg.sender, MaxSupply);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function TokenOwners() external view override returns (address[] memory, uint256[] memory){
        address[] memory tO = _tokenOwners;
        uint256[] memory OwnerBalance = new uint256[](tO.length);

        for(uint i=0; i < tO.length; i++){
            OwnerBalance[i] = balanceOf(tO[i]);
        }

        return(tO,OwnerBalance);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        if(amount > 0 && address(0) != to && 0 == balanceOf(to))_tokenOwners.push(to); // to delete
        if(address(0) != from && address(0) != _managerContract.retrieveTreasuryProxy())
        {
            ITreasury(_managerContract.retrieveTreasuryProxy()).AssignDividends(from);
            ITreasury(_managerContract.retrieveTreasuryProxy()).AssignDividends(to);
        }
    }

    // to delete
    function _afterTokenTransfer(address from, address to, uint256 amount) internal override {
        if(amount > 0 && address(0) != from && 0 == balanceOf(from)) _tokenOwners = AddressLibrary.AddressArrayRemoveResize(AddressLibrary.FindAddressPosition(from, _tokenOwners),_tokenOwners);
    }
  

 }