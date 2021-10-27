// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

// ropsten address : 0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e

interface IENSRegistry {
    function resolver(bytes32 node) external view returns (address);
    function owner(bytes32 node) external view returns (address);
    function ttl(bytes32 node) external view returns (uint64);

    function setOwner(bytes32 node, address owner) external;
    function setResolver(bytes32 node, address resolver) external;
    function setTTL(bytes32 node, uint64 ttl) external;
    function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external;
    function setRecord(bytes32 node, address owner, address resolver, uint64 ttl) external;
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);

    function recordExists(bytes32 node) external view returns (bool);
    function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl) external;
}