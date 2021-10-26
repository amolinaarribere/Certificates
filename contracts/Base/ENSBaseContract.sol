// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

interface ENS {
    function resolver(bytes32 node) external view returns (address);
    function owner(bytes32 node) external view returns (address);
    function ttl(bytes32 node) external view returns (uint64);
    function recordExists(bytes32 node) external view returns (bool);
    function setSubnodeRecord(bytes32 node, bytes32 label, address owner, address resolver, uint64 ttl) external;
    function setOwner(bytes32 node, address owner) external;
}

interface  Resolver {
    function addr(bytes32 node) external view returns (address);
    function setAddr(bytes32 node, address addr) external;
}

contract MyContract {
    // Same address for Mainet, Ropsten, Rinkerby, Gorli and other networks;
    ENS ens = ENS(0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e);
    
    function check(bytes32 node) public view returns(bool) {
        return ens.recordExists(node);
    }
    
    function getOwner(bytes32 node) public view returns(address) {
        return ens.owner(node);
    }
    
    function getResolver(bytes32 node) public view returns(address) {
        return ens.resolver(node);
    }
    
    function getTTL(bytes32 node) public view returns(uint64) {
        return ens.ttl(node);
    }
    
    function resolve(bytes32 node) external view returns(address) {
        address resolverAddress = getResolver(node);
        if(address(0) != resolverAddress){
            Resolver resolver = Resolver(resolverAddress);
            return resolver.addr(node);
        }
        else return resolverAddress;
    }
    
    function createSubdomain(bytes32 node, bytes32 label, address resolver, uint64 ttl, address addr) external {
        bytes32 FullNode = keccak256(abi.encodePacked(node, label));
        require(false == check(FullNode), "this subdomain already exists");
        require(true == check(node), "the parent domain does not exists");
        require(address(0) != resolver, "resolver cannot be 0");

        ens.setSubnodeRecord(node, label, address(this), resolver, ttl);
        Resolver resolver = Resolver(resolver);
        resolver.setAddr(FullNode, addr);
    }
    
     function setOwner(bytes32 node, address owner) external {
        ens.setOwner(node, owner);
    }
}