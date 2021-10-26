// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

// ropsten address : 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e

interface IENSRegistry {
    function resolver(bytes32 node) external view returns (address);
    function owner(bytes32 node) external view returns (address);
    function ttl(bytes32 node) external view returns (uint64);
    function recordExists(bytes32 node) external view returns (bool);
    function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl) external;
}