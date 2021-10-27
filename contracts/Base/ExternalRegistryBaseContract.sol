// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 Price Converter is an interface to the Chain Link Price Registry for USD to ETH exchange
 */

import "../Base/TokenGovernanceBaseContract.sol";
import "../Interfaces/IExternalRegistryBaseContract.sol";


abstract contract ExternalRegistryBaseContract is IExternalRegistryBaseContract, TokenGovernanceBaseContract {

    // EVENTS /////////////////////////////////////////
    event _NewRegistryAddress(address Registry);

    // DATA /////////////////////////////////////////
    address internal _ProposedRegistryAddress;

    // CONSTRUCTOR /////////////////////////////////////////
    function ExternalRegistryBaseContract_init(uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage, address chairPerson, address managerContractAddress, string memory contractName, string memory contractVersion) public initializer 
    {
        super.TokenGovernanceContract_init(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, chairPerson, managerContractAddress, contractName, contractVersion);
    }

    // GOVERNANCE /////////////////////////////////////////
    function updateRegistryAddress(address NewRegistryAddress) external override
    {
        addProposition();
        _ProposedRegistryAddress = NewRegistryAddress;
    }

    function propositionApproved() internal override
    {
        UpdateRegistry();
        
        removeProposition();

        emit _NewRegistryAddress(_ProposedRegistryAddress);
    }

    function propositionRejected() internal override
    {
        removeProposition();
    }

    function propositionExpired() internal override
    {
        removeProposition();
    }

    function removeProposition() internal
    {
         delete(_ProposedRegistryAddress);
    }

    function retrieveProposition() external override view returns(bytes32[] memory)
    {
        bytes32[] memory proposition = new bytes32[](1);
        proposition[0] = AddressLibrary.AddressToBytes32(_ProposedRegistryAddress);
        return proposition;
    }

    function UpdateRegistry() internal virtual;

    function retrieveRegistryAddress() external override virtual view returns(address);

}