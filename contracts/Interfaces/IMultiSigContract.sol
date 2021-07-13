// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */


 interface IMultiSigContract  {
    function addOwner(address owner, string memory ownerInfo, uint nonce) external;
    function removeOwner(address owner, uint nonce) external;
    function retrieveOwner(address owner) external view returns (string memory);
    function retrieveAllOwners() external view returns (address[] memory);
    function retrieveTotalOwners() external view returns (uint);
    function retrieveMinOwners() external view returns (uint);
}