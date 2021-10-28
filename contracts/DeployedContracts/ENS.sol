// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 Price Converter is an interface to the Chain Link Price Registry for USD to ETH exchange
 */

import "../Interfaces/IENS.sol";
import "../Base/ExternalRegistryBaseContract.sol";
import "../Interfaces/IENSRegistry.sol";
import "../Interfaces/IENSResolver.sol";

contract ENS is IENS, ExternalRegistryBaseContract {

    // EVENTS /////////////////////////////////////////
    event _NewSubdomainCreated(bytes32 node, bytes32 label);

    // DATA /////////////////////////////////////////
    IENSRegistry internal _ENS;
    bytes32 internal _PrivatePoolNode; 
    bytes32 internal _ProviderNode; 

    bytes32 internal _ProposedPrivatePoolNode;
    bytes32 internal _ProposedProviderNode;

    // MODIFIERS /////////////////////////////////////////
    modifier isFromAuthorizedContract(address addr){
        require(_managerContract.retrievePrivatePoolFactoryProxy() == addr ||
                _managerContract.retrieveProviderFactoryProxy() == addr, "EC8-");
        _;
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function ENS_init(address ENSRegistry, bytes32[] memory nodes, address managerContractAddress, address chairPerson, string memory contractName, string memory contractVersion) public initializer 
    {
        super.ExternalRegistryBaseContract_init(chairPerson, managerContractAddress, contractName, contractVersion);
        _ENS = IENSRegistry(ENSRegistry);
        _PrivatePoolNode = nodes[0];
        _ProviderNode = nodes[1];
    }

    // GOVERNANCE /////////////////////////////////////////
    function updateOthers(bytes32[] memory NewOthers) internal override
    {
        _ProposedPrivatePoolNode = NewOthers[0];
        _ProposedProviderNode = NewOthers[1];
    }

    function UpdateAll() internal override
    {
        if(address(0) != _ProposedRegistryAddress)_ENS = IENSRegistry(_ProposedRegistryAddress);
        if(_ProposedPrivatePoolNode > 0) _PrivatePoolNode = _ProposedPrivatePoolNode;
        if(_ProposedProviderNode > 0)_ProviderNode = _ProposedProviderNode;
    }

    function removePropositionPOST() internal override
    {
        delete(_ProposedPrivatePoolNode);
        delete(_ProposedProviderNode);
    }

    function retrievePropositionOthers() internal override view returns(bytes32[] memory)
    {
        bytes32[] memory proposition = new bytes32[](2);
        proposition[0] = _ProposedPrivatePoolNode;
        proposition[1] = _ProposedProviderNode;
        return proposition;
    }

    function retrieveRegistryAddress() external override view returns(address)
    {
        return address(_ENS);
    }

    // FUNCTIONALITY /////////////////////////////////////////
    function check(bytes32 node) internal view returns(bool) {
        return _ENS.recordExists(node);
    }

    function createSubdomain(bytes32 label) external override
        isFromAuthorizedContract(msg.sender)
    {
        bytes32 node = _ProviderNode;
        if(msg.sender == _managerContract.retrievePrivatePoolFactoryProxy()) node = _PrivatePoolNode;

        bytes32 FullNode = keccak256(abi.encodePacked(node, label));
        require(false == check(FullNode), "EC37-");

        address resolverAddress = _ENS.resolver(node);
        uint64 ttl = _ENS.ttl(node);

        _ENS.setSubnodeRecord(node, label, address(this), resolverAddress, ttl);
        IENSResolver resolver = IENSResolver(resolverAddress);
        resolver.setAddr(FullNode, msg.sender);
    }

    function retrieveNodes() external override view returns(bytes32[] memory)
    {
        bytes32[] memory nodes = new bytes32[](2);
        nodes[0] = _PrivatePoolNode;
        nodes[1] = _ProviderNode;
        return nodes;
    }
    

}