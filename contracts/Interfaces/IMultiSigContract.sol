// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
pragma experimental ABIEncoderV2;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */


 interface IMultiSigContract  {
    function addOwner(address owner, string calldata ownerInfo) external;
    function removeOwner(address owner) external;
    function validateOwner(address owner) external;
    function rejectOwner(address owner) external;

    function retrieveOwner(address owner) external view returns (string memory, bool);
    function retrieveAllOwners() external view returns (address[] memory);
    function retrieveMinOwners() external view returns (uint);
    function retrievePendingOwners(bool addedORremove) external view returns (address[] memory, string[] memory);
}