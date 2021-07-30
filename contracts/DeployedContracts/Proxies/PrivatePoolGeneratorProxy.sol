// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";


contract PrivatePoolGeneratorProxy is TransparentUpgradeableProxy{

    // CONSTRUCTOR
    constructor(address PrivatePoolGeneratorCodeContractAddress, address managerContractAddress)
        TransparentUpgradeableProxy(PrivatePoolGeneratorCodeContractAddress, managerContractAddress, "0x0") 
    {}
    

}