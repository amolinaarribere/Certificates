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
        address owner;
    }

    mapping(bytes32 => RegistryStruct) registry;

    modifier isOwner(address addr, bytes32 node){
        require(addr == registry[node].owner, "it is not the node owner");
        _;
    }

    constructor(bytes32 _initlNode, address _resolver, uint64 _ttl, address _Owner){
        registry[_initlNode].resolver = _resolver;
        registry[_initlNode].ttl = _ttl;
        registry[_initlNode].owner = _Owner;
    }

    function resolver(bytes32 node) external override view returns (address){ 
        return registry[node].resolver;
    }

    function owner(bytes32 node) external override view returns (address){ return address(0);}

    function ttl(bytes32 node) external override view returns (uint64){ 
        return registry[node].ttl;
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
        return (address(0) != registry[node].owner);
    }

    function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl) external override isOwner(msg.sender, node){
        bytes32 FullNode = keccak256(abi.encodePacked(node, label));
        registry[FullNode].resolver = resolver;
        registry[FullNode].owner = owner;
        registry[FullNode].ttl = ttl;
    }

}