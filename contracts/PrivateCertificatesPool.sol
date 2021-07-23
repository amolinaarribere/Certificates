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

    function addProvider(address provider, string memory providerInfo) external override payable{
        addEntity(provider, providerInfo, _providerId);
    }

    function validateProvider(address provider, bool addedORremove) external override{
        validateEntity(provider, _providerId, addedORremove);
    }

    function onEntityAdded(address entity, uint listId) internal override{}

    function onEntityRemoved(address entity, uint listId) internal override{}

 }