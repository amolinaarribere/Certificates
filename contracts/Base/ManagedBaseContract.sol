// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "../Libraries/Library.sol";

contract ManagedBaseContract{
    using Library for *;

    // manager contract
    address _managerContract;

    // modifiers
     modifier isFromManagerContract(){
        require(true == Library.ItIsSomeone(_managerContract), "EC8");
        _;
    }

    // constructor
    constructor(address managerContractAddress) {
        _managerContract = managerContractAddress;
    }

}