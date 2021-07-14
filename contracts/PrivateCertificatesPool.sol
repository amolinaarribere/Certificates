// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "./Abstract/MultiSigCertificatesPool.sol";

 contract PrivateCertificatesPool is MultiSigCertificatesPool {

     constructor(address[] memory owners,  uint256 minOwners) MultiSigCertificatesPool(owners, minOwners) payable {
    }

    function addProvider(address provider, string memory providerInfo, uint nonce) external override{
        addEntity(provider, providerInfo, _providerId, nonce);
    }

    function removeProvider(address provider, uint nonce) external override{
       removeEntity(provider, _providerId, nonce); 
    }

 }