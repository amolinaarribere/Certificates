// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "../CertisToken.sol";
 import "../Libraries/AddressLibrary.sol";

contract TokenGovernanceBaseContract{

    using AddressLibrary for *; 

    CertisToken _CertisToken;

    uint256 minWeightToPropose;

    struct PropositionStruct{
        address Proposer;
        uint256 DeadLine;
        uint256 validationThreshold;
        uint256 VotesFor;
        uint256 VotesAgainst;
        address[] listOfAdmins;
        uint256[] AdminsWeight;
    }

    PropositionStruct Proposition;
    
    // modifiers

    modifier isAuthorized(){
        require(GetId(msg.sender) < Proposition.listOfAdmins.length, "EC22");
        require(Proposition.AdminsWeight[GetId(msg.sender)] >= minWeightToPropose, "EC22");
        _;
    }

    modifier canVote(){
        require(GetId(msg.sender) < Proposition.listOfAdmins.length, "EC23");
         _;
    }

    modifier PropositionInProgress(bool yesOrno){
        if(yesOrno) require(true == CheckIfPropostiionActive(), "EC25");
        else require(false == CheckIfPropostiionActive(), "EC24");
        _;
    }

    // auxiliairy function

    function GetId(address add) internal view returns(uint256)
    {
        return AddressLibrary.FindAddressPosition(add, Proposition.listOfAdmins);
    }

    function CheckIfPropostiionActive() internal returns(bool){
        if(block.timestamp < Proposition.DeadLine)
        {
            return true;
        }
        else 
        {
            if(0 < Proposition.listOfAdmins.length){
                propositionExpired();
                cancelProposition();
            } 
            return false;
        }
    }

    // functions

    function addProposition(uint256 _DeadLine, uint256 _validationThresholdPercentage) internal
        PropositionInProgress(false)
        isAuthorized()
    {
        Proposition.Proposer = msg.sender;
        Proposition.DeadLine = _DeadLine;
        Proposition.validationThreshold = _CertisToken.totalSupply() * _validationThresholdPercentage / 100;
        (Proposition.listOfAdmins, Proposition.AdminsWeight) = _CertisToken.TokenOwners();
        require(0 < Proposition.listOfAdmins.length, "Impossible to add proposition, there are no admins");
    }

    function voteProposition(bool vote) external
        PropositionInProgress(true)
        canVote()
    {
        if(block.timestamp < Proposition.DeadLine)
        {
            if(vote){
                Proposition.VotesFor += Proposition.AdminsWeight[GetId(msg.sender)];
            }
            else{
                Proposition.VotesAgainst += Proposition.AdminsWeight[GetId(msg.sender)];
            }

            checkProposition();
        }

        else 
        {
            propositionExpired();
            cancelProposition();
        }
    }

    function checkProposition() internal
    {
        if(Proposition.VotesFor > Proposition.validationThreshold) 
        {
            propositionApproved();
            cancelProposition();
        }
        else if(Proposition.VotesAgainst > Proposition.validationThreshold)
        {
            propositionRejected();
            cancelProposition();
        } 
    }

    function cancelProposition() internal
    {
        delete(Proposition);
    }

    function propositionApproved() internal virtual{}

    function propositionRejected() internal virtual{}

    function propositionExpired() internal virtual{}

}