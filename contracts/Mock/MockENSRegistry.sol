// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 Mock Contract simulating the ChainLink Feed Registry ETH <-> USD for the tests chains that do not include it
 */

 import "../Interfaces/IENSRegistry.sol";



contract MockENSRegistry is IENSRegistry{

    struct RegistryStruct{
        address resolver;
        uint64 ttl;
        address owner; // does not really matter a slong as it is not empty
    }

    mapping(bytes32 => RegistryStruct) nodes;

    constructor(bytes32[] memory initNodes, address resolver){
        for(uint i = 0; i < initNodes.length; i++){
            nodes[initNodes[i]].ttl = 0;
            nodes[initNodes[i]].resolver = resolver;
            nodes[initNodes[i]].owner = msg.sender;
        }
    }

    function resolver(bytes32 node) external override view returns (address){ 
        return nodes[node].resolver;
    }

    function owner(bytes32 node) external override view returns (address){ 
        return nodes[node].owner;
    }

    function ttl(bytes32 node) external override view returns (uint64){ 
        return nodes[node].ttl;
    }

    function setOwner(bytes32 node, address owner) external override{}
    function setResolver(bytes32 node, address resolver) external override{}
    function setTTL(bytes32 node, uint64 ttl) external override{}
    function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external override{}
    function setRecord(bytes32 node, address owner, address resolver, uint64 ttl) external override{}
    function setApprovalForAll(address operator, bool approved) external override{}

    function isApprovedForAll(address owner, address operator) external override view returns (bool){ 
        return false;
    }

    function recordExists(bytes32 node) external override view returns (bool){
        return (address(0) != nodes[node].owner);
    }

    function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl) external override {
        bytes32 FullNode = keccak256(abi.encodePacked(node, label));
        nodes[FullNode].resolver = resolver;
        nodes[FullNode].owner = owner;
        nodes[FullNode].ttl = ttl;
    }

}