// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 Price Converter is an interface to the Chain Link Price Registry for USD to ETH exchange
 */

import "../Base/TokenGovernanceBaseContract.sol";
import "../Interfaces/IExternalRegistryBaseContract.sol";


abstract contract ExternalRegistryBaseContract is IExternalRegistryBaseContract, TokenGovernanceBaseContract {

    // DATA /////////////////////////////////////////
    address internal _ProposedRegistryAddress;

    // CONSTRUCTOR /////////////////////////////////////////
    function ExternalRegistryBaseContract_init(address chairPerson, address managerContractAddress, string memory contractName, string memory contractVersion) public initializer 
    {
        super.TokenGovernanceContract_init(chairPerson, managerContractAddress, contractName, contractVersion);
    }

    // GOVERNANCE /////////////////////////////////////////
    function update(address NewRegistryAddress, bytes32[] memory NewOthers) external override
    {
        addProposition();
        _ProposedRegistryAddress = NewRegistryAddress;
        updateOthers(NewOthers);
    }

    function propositionApproved() internal override
    {
        UpdateAll();
        removeProposition();
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
        removePropositionPOST();
    }

    function retrieveProposition() external override view returns(bytes32[] memory)
    {
        bytes32[] memory propositionOthers = retrievePropositionOthers();
        bytes32[] memory proposition = new bytes32[](propositionOthers.length + 1);
        proposition[0] = AddressLibrary.AddressToBytes32(_ProposedRegistryAddress);

        for(uint i=0; i < propositionOthers.length; i++){
            proposition[i + 1] = propositionOthers[i];
        }
        
        return proposition;
    }

    function updateOthers(bytes32[] memory NewOthers) internal virtual;

    function removePropositionPOST() internal virtual;

    function UpdateAll() internal virtual;

    function retrieveRegistryAddress() external override virtual view returns(address);

    function retrievePropositionOthers() internal virtual view returns(bytes32[] memory);

}