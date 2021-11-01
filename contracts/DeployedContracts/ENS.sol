// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 Price Converter is an interface to the Chain Link Price Registry for USD to ETH exchange
 */

import "../Interfaces/IENS.sol";
import "../Base/StdPropositionBaseContract.sol";
import "../Interfaces/IENSRegistry.sol";
import "../Interfaces/IENSResolver.sol";

contract ENS is IENS, StdPropositionBaseContract {

    // EVENTS /////////////////////////////////////////
    event _NewSettings(address Registry, address ReverseRegistry, bytes32 PrivatePoolNode, bytes32 ProviderNode);
    event _NewSubdomainCreated(bytes32 node, bytes32 label);

    // DATA /////////////////////////////////////////
    IENSRegistry internal _ENS;
    address internal _ENSReverseRegistry;
    bytes32 internal _PrivatePoolNode; 
    bytes32 internal _ProviderNode; 

    // MODIFIERS /////////////////////////////////////////
    modifier isFromAuthorizedContract(address addr){
        require(_managerContract.retrievePrivatePoolFactoryProxy() == addr ||
                _managerContract.retrieveProviderFactoryProxy() == addr, "EC8-");
        _;
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function ENS_init(address ENSRegistry, address ENSReverseRegistry, bytes32[] memory nodes, address managerContractAddress, address chairPerson, string memory contractName, string memory contractVersion) public initializer 
    {
        super.StdPropositionBaseContract_init(chairPerson, managerContractAddress, contractName, contractVersion);
        _ENS = IENSRegistry(ENSRegistry);
        _ENSReverseRegistry = ENSReverseRegistry;
        _PrivatePoolNode = nodes[0];
        _ProviderNode = nodes[1];
    }

    // GOVERNANCE /////////////////////////////////////////
    function UpdateAll() internal override
    {
        bytes32[] memory ProposedNewValues = PropositionsToBytes32();

        address NewRegistryAddress = AddressLibrary.Bytes32ToAddress(ProposedNewValues[0]);
        address NewReverseRegistryAddress = AddressLibrary.Bytes32ToAddress(ProposedNewValues[1]);

        if(address(0) != NewRegistryAddress) _ENS = IENSRegistry(NewRegistryAddress);
        else NewRegistryAddress = address(_ENS);

        if(address(0) != NewReverseRegistryAddress) _ENSReverseRegistry = NewReverseRegistryAddress;
        else NewReverseRegistryAddress = _ENSReverseRegistry;

        if(ProposedNewValues[2] > 0) _PrivatePoolNode = ProposedNewValues[2];
        else ProposedNewValues[2] = _PrivatePoolNode;

        if(ProposedNewValues[3] > 0) _ProviderNode = ProposedNewValues[3];
        else ProposedNewValues[3] = _ProviderNode;

        emit _NewSettings(NewRegistryAddress, NewReverseRegistryAddress, ProposedNewValues[2], ProposedNewValues[3]);
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

    function retrieveSettings() external override view returns(address, address, bytes32, bytes32)
    {
        return (address(_ENS), _ENSReverseRegistry, _PrivatePoolNode, _ProviderNode);
    }
    

}