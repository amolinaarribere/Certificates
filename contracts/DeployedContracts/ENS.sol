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
    event _NewSettings(address Registry, bytes32 PrivatePoolNode, bytes32 ProviderNode);
    event _NewSubdomainCreated(bytes32 node, bytes32 label);

    // DATA /////////////////////////////////////////
    IENSRegistry internal _ENS;
    bytes32 internal _PrivatePoolNode; 
    bytes32 internal _ProviderNode; 

    // MODIFIERS /////////////////////////////////////////
    modifier isFromAuthorizedContract(address addr){
        require(_managerContract.retrievePrivatePoolFactoryProxy() == addr ||
                _managerContract.retrieveProviderFactoryProxy() == addr, "EC8-");
        _;
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function ENS_init(address ENSRegistry, bytes32[] memory nodes, address managerContractAddress, address chairPerson, string memory contractName, string memory contractVersion) public initializer 
    {
        super.StdPropositionBaseContract_init(chairPerson, managerContractAddress, contractName, contractVersion);
        _ENS = IENSRegistry(ENSRegistry);
        _PrivatePoolNode = nodes[0];
        _ProviderNode = nodes[1];
    }

    // GOVERNANCE /////////////////////////////////////////
    function UpdateAll() internal override
    {
        address NewRegistryAddress = AddressLibrary.Bytes32ToAddress(_ProposedNewValues[0]);

        if(address(0) != NewRegistryAddress) _ENS = IENSRegistry(NewRegistryAddress);
        else NewRegistryAddress = address(_ENS);

        if(_ProposedNewValues[1] > 0) _PrivatePoolNode = _ProposedNewValues[1];
        else _ProposedNewValues[1] = _PrivatePoolNode;

        if(_ProposedNewValues[2] > 0) _ProviderNode = _ProposedNewValues[2];
        else _ProposedNewValues[2] = _ProviderNode;

        emit _NewSettings(NewRegistryAddress, _ProposedNewValues[1], _ProposedNewValues[2]);
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

    function retrieveSettings() external override view returns(address, bytes32, bytes32)
    {
        return (address(_ENS), _PrivatePoolNode, _ProviderNode);
    }
    

}