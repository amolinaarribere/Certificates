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
    bytes32 public constant PRIVATEPOOL_NODE = 0xf48fea3be10b651407ef19aa331df17a59251f41cbd949d07560de8f3636b9d4; // privatepool.blockcerts.aljomoar.eth
    bytes32 public constant PROVIDER_NODE = 0xfb2b320dd4db2d98782dcf0e70619f558862e1d313050e2408ea439c20a10799; // provider.blockcerts.aljomoar.eth

    // MODIFIERS /////////////////////////////////////////
    modifier isFromAuthorizedContract(address addr){
        require(_managerContract.retrievePrivatePoolFactoryProxy() == addr ||
                _managerContract.retrieveProviderFactoryProxy() == addr, "EC8-");
        _;
    }

    // CONSTRUCTOR /////////////////////////////////////////
    function ENS_init(address ENSRegistry, address managerContractAddress, address chairPerson, string memory contractName, string memory contractVersion) public initializer 
    {
        super.ExternalRegistryBaseContract_init(chairPerson, managerContractAddress, contractName, contractVersion);
        _ENS = IENSRegistry(ENSRegistry);
    }

    // GOVERNANCE /////////////////////////////////////////
    function UpdateRegistry() internal override
    {
        _ENS = IENSRegistry(_ProposedRegistryAddress);
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
        bytes32 node = PROVIDER_NODE;
        if(msg.sender == _managerContract.retrievePrivatePoolFactoryProxy()) node = PRIVATEPOOL_NODE;
        bytes32 FullNode = keccak256(abi.encodePacked(node, label));
        require(false == check(FullNode), "EC37-");
        require(true == check(node), "EC38-");

        address resolverAddress = _ENS.resolver(node);
        require(address(0) != resolverAddress, "EC39-");

        uint64 ttl = _ENS.ttl(node);

        _ENS.setSubnodeRecord(node, label, address(this), resolverAddress, ttl);
        IENSResolver resolver = IENSResolver(resolverAddress);
        resolver.setAddr(FullNode, msg.sender);
    }
    

}