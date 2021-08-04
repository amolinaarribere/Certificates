// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";


contract PublicCertificatesPoolProxy is TransparentUpgradeableProxy{

    // CONSTRUCTOR /////////////////////////////////////////
    constructor(address PublicCertificatesPoolCodeContractAddress, address managerContractAddress, bytes memory data)
        TransparentUpgradeableProxy(PublicCertificatesPoolCodeContractAddress, managerContractAddress, data) 
    {}
    

}