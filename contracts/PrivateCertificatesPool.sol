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

    function addProvider(address provider, string calldata providerInfo) external override payable{
        addEntity(provider, providerInfo, _providerId);
    }

    function onItemValidated(bytes32 item, string calldata id, bool addOrRemove) public {}

    function onItemRejected(bytes32 item, string calldata id, bool addOrRemove) public {}
 }