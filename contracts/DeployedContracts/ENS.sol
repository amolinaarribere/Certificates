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

    // CONSTRUCTOR /////////////////////////////////////////
    function ENS_init(address ENSRegistry, address managerContractAddress, address chairPerson, uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage, string memory contractName, string memory contractVersion) public initializer 
    {
        super.ExternalRegistryBaseContract_init(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, chairPerson, managerContractAddress, contractName, contractVersion);
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

    function createSubdomain(bytes32 node, bytes32 label, address resolverAddress, uint64 ttl, address addr) external override
    {
        bytes32 FullNode = keccak256(abi.encodePacked(node, label));
        require(false == check(FullNode), "EC37-");
        require(true == check(node), "EC38-");
        require(address(0) != resolverAddress, "EC39-");
        require(address(0) != addr, "EC40-");

        _ENS.setSubnodeRecord(node, label, address(this), resolverAddress, ttl);
        IENSResolver resolver = IENSResolver(resolverAddress);
        resolver.setAddr(FullNode, addr);
    }
    

}