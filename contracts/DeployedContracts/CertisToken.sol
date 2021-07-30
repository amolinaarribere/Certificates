// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../Libraries/AddressLibrary.sol";

 contract CertisToken is ERC20 {

    using AddressLibrary for *;

    // DATA
    uint8 _decimals;
    address[] _tokenOwners;

    // CONSTRUCTOR
    constructor(string memory name, string memory symbol, uint8 decimalsValue, uint256 MaxSupply) ERC20(name, symbol){
        _tokenOwners = new address[](0);
        _decimals = decimalsValue;
        _mint(msg.sender, MaxSupply);
    }

    // FUNCTIONALITY
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function TokenOwners() external view returns (address[] memory, uint256[] memory){
        address[] memory tO = _tokenOwners;
        uint256[] memory OwnerBalance = new uint256[](tO.length);

        for(uint i=0; i < tO.length; i++){
                OwnerBalance[i] = balanceOf(tO[i]);
        }

        return(tO,OwnerBalance);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override {
        if(amount > 0){
            if(address(0) != to && 0 == balanceOf(to))_tokenOwners.push(to);
            if(address(0) != from && amount == balanceOf(from)){
                _tokenOwners = AddressLibrary.AddressArrayRemoveResize(AddressLibrary.FindAddressPosition(from, _tokenOwners),_tokenOwners);
            }
        }
    }
    

 }