// SPDX-License-Identifier: GPL-3.0

pragma solidity 0.8.7;

/**
 Price Converter is an interface to the Chain Link Price Registry for USD to ETH exchange
 */

import "../Base/TokenGovernanceBaseContract.sol";
import "../Interfaces/IStdPropositionBaseContract.sol";


abstract contract StdPropositionBaseContract is IStdPropositionBaseContract, TokenGovernanceBaseContract {

    // DATA /////////////////////////////////////////
    bytes32[] internal _ProposedNewValues;

    // CONSTRUCTOR /////////////////////////////////////////
    function StdPropositionBaseContract_init(address chairPerson, address managerContractAddress, string memory contractName, string memory contractVersion) public initializer 
    {
        super.TokenGovernanceContract_init(chairPerson, managerContractAddress, contractName, contractVersion);
    }

    // GOVERNANCE /////////////////////////////////////////
    function sendProposition(bytes32[] memory NewValues) external override
    {
        checkProposition(NewValues);
        addProposition();
        for(uint i=0; i < NewValues.length; i++){
            _ProposedNewValues.push(NewValues[i]);
        }
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
        delete(_ProposedNewValues);
    }

    function retrieveProposition() external override view returns(bytes32[] memory)
    {
        return _ProposedNewValues;
    }

    function checkProposition(bytes32[] memory NewValues) internal virtual{}

    function UpdateAll() internal virtual;

}