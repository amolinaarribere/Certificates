// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

import "./GenericProxy.sol";


contract CertisTokenProxy is GenericProxy{

    // CONSTRUCTOR /////////////////////////////////////////
    constructor(address CertisCodeContractAddress, address managerContractAddress, bytes memory data)
        GenericProxy(CertisCodeContractAddress, managerContractAddress, data) 
    {}

    // CUSTOMIZATION /////////////////////////////////////////
    function _beforeFallback() internal virtual override {}

}