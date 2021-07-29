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

    // DATA
    address _managerContract;

    // MODIFIERS
     modifier isFromManagerContract(){
        require(true == Library.ItIsSomeone(_managerContract), "EC8");
        _;
    }

    // CONSTRUCTOR
    constructor(address managerContractAddress) {
        _managerContract = managerContractAddress;
    }

}