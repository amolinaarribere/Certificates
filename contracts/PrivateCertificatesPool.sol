// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "./Abstract/MultiSigCertificatesPool.sol";

 /* 
 Like Private Certificates except that Providers must be sent from "Creator" who is not an owner
 */

 contract PrivateCertificatesPool is MultiSigCertificatesPool {

     constructor(address[] memory owners,  uint256 minOwners) MultiSigCertificatesPool(owners, minOwners) payable {
    }

    function addProvider(address provider, string memory providerInfo) external override{
        addEntity(provider, bytes(providerInfo), _providerId);
    }

    function removeProvider(address provider) external override{
       removeEntity(provider, _providerId); 
    }

 }