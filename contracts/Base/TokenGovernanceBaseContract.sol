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

    address _chairperson;

    CertisToken _CertisToken;

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

    uint8 _minWeightToProposePercentage;
    
    // modifiers

    modifier isAuthorized(){
        require(true == Authorization(msg.sender), "EC22");
        _;
    }

    modifier canVote(){
        require(GetId(msg.sender, GetAdminList()) < Proposition.listOfAdmins.length, "EC23");
         _;
    }

    modifier PropositionInProgress(bool yesOrno){
        if(yesOrno) require(true == CheckIfPropostiionActive(), "EC25");
        else require(false == CheckIfPropostiionActive(), "EC24");
        _;
    }

    // auxiliairy function

    function Authorization(address add) internal view returns(bool) {
        if(msg.sender == _chairperson) return true;
        else 
        {
            address[] memory list = GetAdminList();
            uint256[] memory weights = GetAdminWeights();
            uint256 id = GetId(add, list);
            if(id < list.length){
                if(weights[id] >= (_minWeightToProposePercentage * totalSupply() / 100)) return true;
            }
            return false;
        }
    }

    function GetId(address add, address[] memory list) internal pure returns(uint256)
    {
        return AddressLibrary.FindAddressPosition(add, list);
    }

    function GetAdminList() internal view returns(address[] memory){
        (address[] memory list, ) = _CertisToken.TokenOwners();
        return list;
    }

    function GetAdminWeights() internal view returns(uint256[] memory){
        (, uint256[] memory weights) = _CertisToken.TokenOwners();
        return weights;
    }

    function totalSupply() internal view returns(uint256){
        return _CertisToken.totalSupply();
    }

    function CheckIfPropostiionActive() internal returns(bool){
        if(block.timestamp < Proposition.DeadLine)
        {
            return true;
        }
        else 
        {
            if(address(0) != Proposition.Proposer){
                propositionExpired();
                cancelProposition();
            } 
            return false;
        }
    }

    // functions

    function addProposition(uint256 _DeadLine, uint8 _validationThresholdPercentage) internal
        PropositionInProgress(false)
        isAuthorized()
    {
        Proposition.Proposer = msg.sender;
        Proposition.DeadLine = _DeadLine;
        Proposition.validationThreshold = totalSupply() * _validationThresholdPercentage / 100;
        Proposition.listOfAdmins = GetAdminList();
        Proposition.AdminsWeight = GetAdminWeights();
        require(0 < Proposition.listOfAdmins.length, "Impossible to add proposition, there are no admins");
    }

    function voteProposition(bool vote) external
        PropositionInProgress(true)
        canVote()
    {
        if(block.timestamp < Proposition.DeadLine)
        {
            if(vote){
                Proposition.VotesFor += Proposition.AdminsWeight[GetId(msg.sender, GetAdminList())];
            }
            else{
                Proposition.VotesAgainst += Proposition.AdminsWeight[GetId(msg.sender, GetAdminList())];
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