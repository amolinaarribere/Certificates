// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";


contract PrivateCertificatesPoolProxy is BeaconProxy{

    // CONSTRUCTOR /////////////////////////////////////////
    constructor(address BeaconAddress, bytes memory data)
        BeaconProxy(BeaconAddress, data) 
    {}
    

}