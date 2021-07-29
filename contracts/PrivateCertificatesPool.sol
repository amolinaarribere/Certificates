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

    // Callback functions

    function onItemValidated(bytes32 item, uint256[] calldata ids, bool addOrRemove) public override { super.onItemValidated(item, ids, addOrRemove); }

    function onItemRejected(bytes32 item, uint256[] calldata ids, bool addOrRemove) public override { super.onItemRejected(item, ids, addOrRemove); }
 }