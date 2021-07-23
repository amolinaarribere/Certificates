// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Storage
 * @dev Store & retrieve value in a variable
 */

 import "../CertisToken.sol";
 import "../Libraries/AddressLibrary.sol";
 import "../Libraries/Library.sol";

contract TokenGovernanceBaseContract {
    using Library for *;
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
        address[] AlreadyVoted;
    }

    PropositionStruct Proposition;

    uint _PropositionLifeTime;
    uint8 _PropositionThresholdPercentage;
    uint8 _minWeightToProposePercentage;

    struct ProposedPropositionStruct{
        uint256 NewPropositionLifeTime;
        uint8 NewPropositionThresholdPercentage;
        uint8 NewMinWeightToProposePercentage;
    }

    ProposedPropositionStruct _ProposedProposition;

    bool _currentPropisProp;
    
    // modifiers

    modifier isFromChairPerson(){
        require(true == Library.ItIsSomeone(_chairperson), "EC8");
        _;
    }

    modifier isAuthorizedToPropose(){
        require(true == AuthorizedToPropose(msg.sender), "EC22");
        _;
    }

    modifier isAuthorizedToCancel(){
        require(msg.sender == Proposition.Proposer, "EC22");
        _;
    }

    modifier canVote(){
        require(true == AuthorizedToVote(msg.sender, Proposition.listOfAdmins), "EC23");
         _;
    }

    modifier PropositionInProgress(bool yesOrno){
        if(yesOrno) require(true == CheckIfPropostiionActive(), "EC25");
        else require(false == CheckIfPropostiionActive(), "EC24");
        _;
    }

    modifier HasNotAlreadyVoted(){
        require(false == AddressLibrary.FindAddress(msg.sender, Proposition.AlreadyVoted), "EC5");
        _;
    }

    modifier isPropOK(uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage){
        require(100 >= PropositionThresholdPercentage, "EC21");
        require(100 >= minWeightToProposePercentage, "EC21");
        _;
    }

    // auxiliairy function

    function AuthorizedToPropose(address add) internal view returns(bool) {
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

    function AuthorizedToVote(address add, address[] memory list) internal pure returns(bool) {
        return (GetId(add, list) < list.length);
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
                InternalCancelProposition();
            } 
            return false;
        }
    }

    // constructor
    constructor(uint256 PropositionLifeTime, uint8 PropositionThresholdPercentage, uint8 minWeightToProposePercentage){
        _chairperson = msg.sender; 
        InternalupdateProp(PropositionLifeTime, PropositionThresholdPercentage, minWeightToProposePercentage, true);
    }
    
    // updates prop values

    function updateProp(uint256 PropLifeTime, uint8 PropThresholdPerc, uint8 minWeightToPropPerc) external
    {
        InternalupdateProp(PropLifeTime, PropThresholdPerc, minWeightToPropPerc, false);
    }

    function InternalupdateProp(uint256 PropLifeTime, uint8 PropThresholdPerc, uint8 minWeightToPropPerc, bool fromConstructor) internal
        isPropOK(PropThresholdPerc, minWeightToPropPerc)
    {
        if(fromConstructor){
            _PropositionLifeTime = PropLifeTime;
            _PropositionThresholdPercentage = PropThresholdPerc;
            _minWeightToProposePercentage = minWeightToPropPerc;
        }
        else{
            _ProposedProposition.NewPropositionLifeTime = PropLifeTime;
            _ProposedProposition.NewPropositionThresholdPercentage = PropThresholdPerc;
            _ProposedProposition.NewMinWeightToProposePercentage = minWeightToPropPerc;
            _currentPropisProp = true;
            addProposition(block.timestamp + _PropositionLifeTime, _PropositionThresholdPercentage);
        }   
    }

    function retrievePropConfig() external view returns(uint, uint8, uint8)
    {
        return(_PropositionLifeTime, _PropositionThresholdPercentage, _minWeightToProposePercentage);
    }

    // functions

    function addProposition(uint256 _DeadLine, uint8 _validationThresholdPercentage) internal
        PropositionInProgress(false)
        isAuthorizedToPropose()
    {
        Proposition.listOfAdmins = GetAdminList();
        require(0 < Proposition.listOfAdmins.length, "Impossible to add proposition, there are no admins");

        Proposition.Proposer = msg.sender;
        Proposition.DeadLine = _DeadLine;
        Proposition.validationThreshold = totalSupply() * _validationThresholdPercentage / 100;
        Proposition.AdminsWeight = GetAdminWeights();
    }

    function cancelProposition() external
        PropositionInProgress(true)
        isAuthorizedToCancel()
    {
        InternalCancelProposition();
    }

    function voteProposition(bool vote) external
        PropositionInProgress(true)
        canVote()
        HasNotAlreadyVoted()
    {
        if(block.timestamp < Proposition.DeadLine)
        {
            Proposition.AlreadyVoted.push(msg.sender);

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
            if(_currentPropisProp){
                removePropositionProp();
            }
            else{
                propositionExpired();
            }
            InternalCancelProposition();
        }
    }

    function checkProposition() internal
    {
        if(Proposition.VotesFor > Proposition.validationThreshold) 
        {
            if(_currentPropisProp){
                _PropositionLifeTime = _ProposedProposition.NewPropositionLifeTime;
                _PropositionThresholdPercentage = _ProposedProposition.NewPropositionThresholdPercentage;
                _minWeightToProposePercentage = _ProposedProposition.NewMinWeightToProposePercentage;
                removePropositionProp();
            }
            else{
                propositionApproved();
            }
            InternalCancelProposition();
        }
        else if(Proposition.VotesAgainst > Proposition.validationThreshold)
        {
            if(_currentPropisProp){
                removePropositionProp();
            }
            else{
                propositionRejected();
            }
            InternalCancelProposition();
        } 
    }

    function removePropositionProp() internal
    {
        delete(_ProposedProposition);
        _currentPropisProp = false;
    }

    function InternalCancelProposition() internal
    {
        delete(Proposition);
    }

    function retrievePropositionStatus() external view returns(address, uint256, uint256, uint256, uint256, address[] memory, uint256[] memory, address[] memory){
        return (Proposition.Proposer,
            Proposition.DeadLine,
            Proposition.validationThreshold,
            Proposition.VotesFor,
            Proposition.VotesAgainst,
            Proposition.listOfAdmins,
            Proposition.AdminsWeight,
            Proposition.AlreadyVoted
        );
    }

    function retrieveProposition() external virtual view returns(string[] memory){}

    function propositionApproved() internal virtual{}

    function propositionRejected() internal virtual{}

    function propositionExpired() internal virtual{}

}